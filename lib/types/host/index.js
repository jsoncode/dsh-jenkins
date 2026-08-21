/**
 * dsh-jenkins —— Jenkins CLI 插件 · 宿主半边（可发布组合包，无硬编码路径）
 *
 * - settings namespace（dsh-jenkins.servers）持久化多服务器配置，base 层来自
 *   cordis.yml 的 config.servers（Schemastery 校验），用户层可经命令写入并持久化；
 * - `/dsh-jenkins/api` HTTP 路由（webServer 注册 + 信任围栏）：浏览器半边（设置页 /
 *   执行弹框 / 后台轮询）经 fetch 调用，参数为 JSON（{ op: 'list|save|delete|test|jobs|jobDetail|trigger|queueStatus|buildStatus|...' }），
 *   结果以 JSON 信封回传。请求不进入对话命令通道，页面不会出现 command 节点 / 调试卡片；
 * - `dsh-jenkins` 命令：保留兼容（用户/模型在对话中显式执行时可用），
 *   浏览器半边默认不再走命令通道；
 * - 两个模型工具 dsh_jenkins_build / dsh_jenkins_status。
 *
 * 运行时依赖（@deepseek-ai/*）由 package.json 的 peerDependencies 声明，
 * 安装时由宿主解析，本文件不含任何绝对路径。
 */
import Schema from '@deepseek-ai/schemastery';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import { isTrustedApiRequest } from "./fence.js";
import { runOp } from "./ops.js";
export const name = 'dsh-jenkins';
export const inject = ['shell', 'tools', 'settings', 'commands'];
/* ── 配置（docs/develop/basic/config）────────────────────────── */
const ServerSchema = Schema.object({
    id: Schema.string().required(),
    name: Schema.string().required(),
    baseUrl: Schema.string().required(),
    username: Schema.string().required(),
    token: Schema.string().required(),
    insecure: Schema.boolean().default(false),
});
export const Config = Schema.object({
    servers: Schema.array(ServerSchema).default([]),
});
/** 运行时 settings namespace：服务器列表与浏览器缓存均以 JSON 字符串持久化到 $DSH_HOME/settings.yaml。 */
const JenkinsSettingsSchema = Schema.object({
    serversJson: Schema.string().default('[]'),
    cacheJson: Schema.string().default('{}'),
});
const API_BODY_LIMIT = 1 << 20;
function writeApiJson(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}
export function apply(ctx, config) {
    const shell = ctx.get('shell');
    if (shell === undefined)
        return;
    const settings = ctx.get('settings');
    const commands = ctx.get('commands');
    // settings namespace：服务器列表以 JSON 字符串存储（规避 settings 对数组
    // 的深冻结 + schemastery 校验原地改写导致的 "object is not extensible"）。
    let scope = null;
    if (settings !== undefined) {
        scope = settings.register(settingsNamespace('dsh-jenkins'), JenkinsSettingsSchema, {
            base: { serversJson: JSON.stringify(config.servers || []), cacheJson: '{}' },
        });
    }
    const readServers = () => {
        let raw = '[]';
        if (scope !== null) {
            const value = scope.get();
            if (value && typeof value.serversJson === 'string')
                raw = value.serversJson;
        }
        else {
            raw = JSON.stringify(config.servers || []);
        }
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    };
    const writeServers = async (servers) => {
        if (scope !== null)
            await scope.update({ serversJson: JSON.stringify(servers) });
    };
    // 浏览器缓存（发布参数回显 + 发布历史）也走官方 settings 存储：跟随 $DSH_HOME，
    // 无论从哪里打开 dsh 服务都可访问；不再使用浏览器 localStorage。
    const readCacheJson = () => {
        if (scope === null)
            return {};
        const value = scope.get();
        if (!value || typeof value.cacheJson !== 'string')
            return {};
        try {
            const parsed = JSON.parse(value.cacheJson);
            return parsed && typeof parsed === 'object' ? parsed : {};
        }
        catch {
            return {};
        }
    };
    const writeCacheJson = async (cache) => {
        if (scope !== null)
            await scope.update({ cacheJson: JSON.stringify(cache) });
    };
    // 按名称 / id / baseUrl（去尾部斜杠）匹配，兼容配置里直接写服务器地址的形式。
    const normUrl = (u) => String(u || '').trim().replace(/\/+$/, '');
    const findServer = (nameOrIdOrUrl) => {
        const ref = normUrl(nameOrIdOrUrl);
        const all = readServers();
        return all.find((s) => s.name === nameOrIdOrUrl || s.id === nameOrIdOrUrl || normUrl(s.baseUrl) === ref);
    };
    const deps = { ctx, readServers, writeServers, findServer, readCacheJson, writeCacheJson };
    // ─── 浏览器 HTTP API（/dsh-jenkins/api）────────────────────────
    // 浏览器半边（设置页 / 执行弹框 / 后台轮询 / 历史存储）默认经此路由与宿主通信：
    // 请求不进入对话命令通道，因此不会在会话中产生 command 节点 —— 页面不再出现
    // "dsh-jenkins {"ok":true,...}" 调试卡片，也不会每 3 秒轮询追加一条空状态。
    // 路由带浏览器信任围栏（loopback Host / webRuntime.trustedHosts + 同源标记）。
    // webServer 缺失（如 headless 组合）时静默跳过，客户端自动回退到命令通道。
    const webServer = ctx.get('webServer');
    const webRuntime = ctx.get('webRuntime');
    if (webServer !== undefined) {
        const fence = (headers) => isTrustedApiRequest(headers, webRuntime?.trustedHosts ?? []);
        try {
            webServer.register({
                kind: 'exact',
                path: '/dsh-jenkins/api',
                handler: async (req, res) => {
                    if (!fence(req.headers)) {
                        writeApiJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } });
                        return;
                    }
                    if (req.method !== 'POST') {
                        writeApiJson(res, 405, { ok: false, error: { code: 'method-error', message: 'method not allowed' } });
                        return;
                    }
                    // 有界读取请求体（防御未绑定的大体）。
                    const chunks = [];
                    let total = 0;
                    for await (const chunk of req) {
                        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                        total += buffer.length;
                        if (total > API_BODY_LIMIT) {
                            writeApiJson(res, 413, { ok: false, error: { code: 'body-too-large', message: 'request body too large' } });
                            return;
                        }
                        chunks.push(buffer);
                    }
                    const text = Buffer.concat(chunks).toString('utf8');
                    let request = { op: '' };
                    if (text.trim().length > 0) {
                        try {
                            request = JSON.parse(text);
                        }
                        catch {
                            writeApiJson(res, 400, { ok: false, error: { code: 'params-invalid', message: 'Parameters must be JSON' } });
                            return;
                        }
                    }
                    try {
                        const payload = await runOp(deps, request);
                        writeApiJson(res, 200, { ok: true, value: payload });
                    }
                    catch (e) {
                        // runOp 内部已兜底大部分分支；此处防御性映射为与命令 handler 相同的错误载荷。
                        writeApiJson(res, 200, {
                            ok: true,
                            value: { ok: false, code: errCodeOfLocal(e), error: e instanceof Error ? e.message : String(e) },
                        });
                    }
                },
            });
        }
        catch { /* 热重载重复注册（kind,path 冲突）时幂等忽略 */ }
    }
    // ─── 命令入口（保留兼容：用户/模型在对话中显式执行时可用）──────
    if (commands !== undefined) {
        commands.register({
            name: 'dsh-jenkins',
            description: 'Jenkins CLI：管理服务器配置并触发/查询构建（设置界面/工作区入口调用）。Manage Jenkins servers and trigger/query builds (used by the settings UI and workspace entry). 参数为 JSON：'
                + '{ "op": "list|save|delete|test|jobs|jobDetail|trigger|queueStatus|buildStatus|buildLog|cancel|cacheGet|cacheSet|workspaceConfig|workspaceTrigger", ... }。',
            input: { hint: '{"op":"list"}' },
            recordInput: true,
            handler: async (invocation) => {
                const raw = (invocation.rawInput ?? '').trim();
                let req = { op: '' };
                if (raw.length > 0) {
                    try {
                        req = JSON.parse(raw);
                    }
                    catch {
                        return { kind: 'error', text: JSON.stringify({ ok: false, code: 'params-invalid', error: 'Parameters must be JSON' }) };
                    }
                }
                try {
                    const payload = await runOp(deps, req);
                    return { kind: 'success', text: JSON.stringify(payload) };
                }
                catch (e) {
                    return { kind: 'error', text: JSON.stringify({ ok: false, code: errCodeOfLocal(e), error: e instanceof Error ? e.message : String(e) }) };
                }
            },
        });
    }
    // ─── 模型工具（docs/develop/basic/tool）────────────────────────
    ctx.tools.register(defineTool({
        name: 'dsh_jenkins_build',
        description: '根据配置的 Jenkins 服务器触发一个 Job 构建（可选参数），返回队列号/构建号与状态。Trigger a Jenkins job build with optional parameters (config-driven servers); returns queue/build info.',
        parameters: {
            server: { type: 'string', required: true, description: '服务器名称（对应配置中的 name）/ Server name (as configured)' },
            job: { type: 'string', required: true, description: '任务路径，如 build-app 或 folder/build-app / Job path, e.g. build-app or folder/build-app' },
            parameters: { type: 'json', description: '可选参数键值对，如 {"BRANCH": "main"} / Optional key-value parameters' },
        },
        output: {
            schema: { type: 'string' },
            render: (_args, value) => [{ type: 'text', text: String(value) }],
        },
        async execute(args) {
            const server = findServer(args.server);
            if (!server) {
                const names = readServers().map((s) => s.name).join('、');
                return '找不到服务器「' + args.server + '」。已配置：' + (names || '（无）')
                    + ' / Server "' + args.server + '" not found. Configured: ' + (names || '(none)');
            }
            const result = await runOp(deps, { op: 'trigger', serverId: server.id, segments: args.job.split('/').filter(Boolean), parameters: args.parameters || {} });
            if (!result.ok)
                return '触发失败：' + result.error + ' / Trigger failed: ' + result.error;
            return result.queueId
                ? `已触发构建：${args.job}（服务器 ${server.name}），队列 #${result.queueId}。可用 dsh_jenkins_status 查询状态。`
                    + ` / Build triggered: ${args.job} (server ${server.name}), queue #${result.queueId}. Use dsh_jenkins_status to check status.`
                : `已触发构建：${args.job}（服务器 ${server.name}），未获得队列编号。可用 dsh_jenkins_status 查询状态。`
                    + ` / Build triggered: ${args.job} (server ${server.name}), no queue number returned. Use dsh_jenkins_status to check status.`;
        },
    }));
    ctx.tools.register(defineTool({
        name: 'dsh_jenkins_status',
        description: '查询 Jenkins Job 最近一次或指定编号构建的状态与结果。Query the latest (or a specific) build status/result of a Jenkins job.',
        parameters: {
            server: { type: 'string', required: true, description: '服务器名称（对应配置中的 name）/ Server name (as configured)' },
            job: { type: 'string', required: true, description: '任务路径，如 build-app 或 folder/build-app / Job path, e.g. build-app or folder/build-app' },
            buildNumber: { type: 'number', description: '可选：构建编号，缺省查询最近一次构建 / Optional build number; defaults to the latest build' },
        },
        output: {
            schema: { type: 'string' },
            render: (_args, value) => [{ type: 'text', text: String(value) }],
        },
        async execute(args) {
            const server = findServer(args.server);
            if (!server) {
                const names = readServers().map((s) => s.name).join('、');
                return '找不到服务器「' + args.server + '」。已配置：' + (names || '（无）')
                    + ' / Server "' + args.server + '" not found. Configured: ' + (names || '(none)');
            }
            const result = await runOp(deps, {
                op: 'buildStatus',
                serverId: server.id,
                segments: args.job.split('/').filter(Boolean),
                buildNumber: args.buildNumber,
            });
            if (!result.ok) {
                if (result.notFound)
                    return `任务 ${args.job} 尚未有构建记录 / Job ${args.job} has no build record yet`;
                return '查询失败：' + result.error + ' / Query failed: ' + result.error;
            }
            const dur = Math.round((Number(result.duration) || 0) / 1000);
            return `任务 ${args.job} #${result.number}：${result.building ? '构建中' : `已完成，结果 ${result.result ?? 'UNKNOWN'}`}`
                + `（耗时 ${dur} 秒）\n${result.url || ''}`
                + ` / Job ${args.job} #${result.number}: ${result.building ? 'building' : `done, result ${result.result ?? 'UNKNOWN'}`}`
                + ` (elapsed ${dur}s)\n${result.url || ''}`;
        },
    }));
}
/** 命令 handler 内的本地化错误码（runOp 抛出的异常同样映射）。 */
function errCodeOfLocal(e) {
    const err = e;
    if (err && err.status === 401)
        return 'auth-failed';
    if (err && err.status === 403)
        return 'forbidden';
    if (err && err.status === 404)
        return 'not-found';
    const msg = (err && err.message) || String(e);
    if (msg.indexOf('网络请求失败') !== -1)
        return 'network-failed';
    if (msg.indexOf('无法解析任务路径') !== -1)
        return 'job-path-invalid';
    if (msg.indexOf('缺少队列 ID') !== -1)
        return 'queue-id-missing';
    if (msg.indexOf('缺少工作区路径') !== -1)
        return 'cwd-missing';
    if (msg.indexOf('响应解析失败') !== -1)
        return 'parse-failed';
    return undefined;
}
