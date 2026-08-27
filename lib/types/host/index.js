/**
 * dsh-jenkins —— Jenkins CLI 插件 · 宿主半边（可发布组合包，无硬编码路径）
 *
 * - 插件数据（服务器列表 + 浏览器缓存）持久化到 $DSH_HOME/dsh-jenkins.json
 *   （服务器 Token 以 dsh-jenkins.key 机器绑定密钥 AES-256-GCM 加密；缓存明文）。
 *   settings 命名空间仅用于一次性迁移旧版数据：首次运行时若发现 settings.yaml
 *   中的 dsh-jenkins 命名空间有数据，自动提取到数据文件并清空旧命名空间，
 *   之后不再读写宿主默认设置；
 * - `/dsh-jenkins/api` HTTP 路由（webServer 注册 + 信任围栏）：浏览器半边（设置页 /
 *   执行弹框 / 后台轮询）经 fetch 调用，参数为 JSON（{ op: 'list|save|delete|test|jobs|jobDetail|jobHistory|trigger|queueStatus|buildStatus|...' }），
 *   结果以 JSON 信封回传。请求不进入对话命令通道，页面不会出现 command 节点 / 调试卡片；
 * - `dsh-jenkins` 命令：保留兼容（用户/模型在对话中显式执行时可用），
 *   浏览器半边默认不再走命令通道；
 * - 两个模型工具 dsh_jenkins_build / dsh_jenkins_status。
 *
 * 运行时依赖（@deepseek-ai/*）由 package.json 的 peerDependencies 声明，
 * 安装时由宿主解析，本文件不含任何绝对路径。
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import Schema from '@deepseek-ai/schemastery';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import { isTrustedApiRequest } from "./fence.js";
import { runOp } from "./ops.js";
import { EMPTY_STORE, loadStore, resolveStoreDir, saveStore } from "./store.js";
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
/** 旧版 settings 命名空间（仅一次性迁移读取，迁移完成后不再读写）。 */
const LegacySettingsSchema = Schema.object({
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
    // ── 插件数据存储：$DSH_HOME/dsh-jenkins.json（服务器 Token 加密）──────
    // 数据文件为唯一持久化源。settings 命名空间仅用于一次性迁移旧版数据：
    // 数据文件不存在且旧命名空间有数据时，提取写入数据文件并清空旧命名空间。
    const storeDir = resolveStoreDir(settings?.documentPath);
    const mirror = EMPTY_STORE();
    let storeReady = Promise.resolve();
    // 旧版 settings 命名空间：必须在 apply 同步段注册（register 用 ctx.effect
    // 延迟登记，异步段注册后立刻 scope.update() 会因 effect 未 flush 而抛
    // "namespace is not registered"）。注册本身不写文档，仅迁移需要。
    let legacyScope = null;
    if (settings !== undefined) {
        try {
            legacyScope = settings.register(settingsNamespace('dsh-jenkins'), LegacySettingsSchema, {
                base: { serversJson: JSON.stringify(config.servers || []), cacheJson: '{}' },
            });
        }
        catch { /* 重复注册/校验失败：跳过迁移 */ }
    }
    /** 解析旧 settings 命名空间中的 JSON 字符串（容错返回空值）。 */
    const parseLegacyJson = (raw, fallback) => {
        if (typeof raw !== 'string' || raw.trim().length === 0)
            return JSON.parse(fallback);
        try {
            return JSON.parse(raw);
        }
        catch {
            return JSON.parse(fallback);
        }
    };
    /** 读取旧 settings 命名空间数据（servers + cache），空则返回空值。 */
    const readLegacy = (scope) => {
        if (scope === null)
            return { servers: [], cache: {} };
        let servers = [];
        let cache = {};
        const value = scope.get();
        try {
            const parsed = parseLegacyJson(value && value.serversJson, '[]');
            servers = Array.isArray(parsed) ? parsed : [];
        }
        catch { /* keep empty */ }
        try {
            const parsed = parseLegacyJson(value && value.cacheJson, '{}');
            cache = parsed && typeof parsed === 'object' ? parsed : {};
        }
        catch { /* keep empty */ }
        return { servers, cache };
    };
    /**
     * 清空旧 settings 命名空间（幂等）：迁移完成后调用；也处理「数据文件已存在
     * 但旧命名空间仍有残留」的场景（如上次进程在迁移中途退出）。旧数据已空时
     * 不写（避免每次启动都触发一次 settings 持久化）。
     */
    const clearLegacy = async (scope) => {
        if (scope === null)
            return;
        const { servers, cache } = readLegacy(scope);
        const hasResidual = servers.length > 0 || Object.keys(cache).length > 0;
        if (!hasResidual)
            return;
        await scope.update({ serversJson: '[]', cacheJson: '{}' });
        console.log('[dsh-jenkins] cleared legacy settings namespace');
    };
    storeReady = (async () => {
        try {
            const loaded = await loadStore(storeDir);
            if (loaded !== null) {
                mirror.servers = loaded.servers;
                mirror.cache = loaded.cache;
            }
            else {
                // 数据文件不存在：尝试从旧 settings 一次性迁移；旧数据为空时保持空
                // store（首次保存时创建文件）。
                const legacy = readLegacy(legacyScope);
                const hasLegacy = legacy.servers.length > 0 || Object.keys(legacy.cache).length > 0;
                if (hasLegacy) {
                    mirror.servers = legacy.servers;
                    mirror.cache = legacy.cache;
                    await saveStore(storeDir, mirror);
                    console.log(`[dsh-jenkins] migrated legacy settings → ${storeDir}/dsh-jenkins.json`);
                }
            }
            // 无论文件是否存在：清空旧命名空间残留（迁移成功 / 上次迁移中途退出 /
            // 文件已存在但旧数据未清，三种情况统一处理；幂等）。
            await clearLegacy(legacyScope);
        }
        catch (e) {
            console.warn('[dsh-jenkins] store init failed, using in-memory only', e instanceof Error ? e.message : String(e));
        }
    })();
    storeReady.catch(() => { });
    // 内存镜像读写：ops 层接口不变（readServers 同步、写异步落盘）。
    const readServers = () => mirror.servers;
    const writeServers = async (servers) => {
        mirror.servers = servers;
        await saveStore(storeDir, mirror);
    };
    const readCacheJson = () => mirror.cache;
    const writeCacheJson = async (cache) => {
        mirror.cache = cache;
        await saveStore(storeDir, mirror);
    };
    // 按名称 / id / baseUrl（去尾部斜杠）匹配，兼容配置里直接写服务器地址的形式。
    const normUrl = (u) => String(u || '').trim().replace(/\/+$/, '');
    const findServer = (nameOrIdOrUrl) => {
        const ref = normUrl(nameOrIdOrUrl);
        const all = readServers();
        return all.find((s) => s.name === nameOrIdOrUrl || s.id === nameOrIdOrUrl || normUrl(s.baseUrl) === ref);
    };
    const deps = { ctx, readServers, writeServers, findServer, readCacheJson, writeCacheJson, storeReady };
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
        // ─── 浏览器图标静态资源（/plugins/<id>/assets/...）──────────────
        // 宿主只通过 /plugins/<id>/client.js（及 .map）发布插件 bundle，不会把
        // 插件包内的其它文件暴露给浏览器。footer 按钮图标因此由本路由按包内
        // assets 原文件提供，浏览器半边以同源绝对路径引用该 SVG。
        // 包内文件缺失时 404（仅首次记一条警告），重复注册时幂等忽略。
        const iconRoute = '/plugins/dsh-jenkins/assets/logo.svg';
        const iconPath = fileURLToPath(new URL('../assets/logo.svg', import.meta.url));
        let iconCache = null;
        let iconWarned = false;
        try {
            webServer.register({
                kind: 'exact',
                path: iconRoute,
                handler: async (req, res) => {
                    if (req.method !== 'GET' && req.method !== 'HEAD') {
                        res.writeHead(405);
                        res.end();
                        return;
                    }
                    if (iconCache === null) {
                        try {
                            iconCache = await readFile(iconPath);
                        }
                        catch (e) {
                            if (!iconWarned) {
                                iconWarned = true;
                                console.warn(`[dsh-jenkins] footer icon missing: ${iconPath}`, e instanceof Error ? e.message : String(e));
                            }
                            res.writeHead(404);
                            res.end();
                            return;
                        }
                    }
                    res.writeHead(200, {
                        'content-type': 'image/svg+xml',
                        'cache-control': 'no-cache',
                    });
                    res.end(req.method === 'HEAD' ? undefined : iconCache);
                },
            });
        }
        catch { /* 热重载重复注册时幂等忽略 */ }
    }
    // ─── 命令入口（保留兼容：用户/模型在对话中显式执行时可用）──────
    if (commands !== undefined) {
        commands.register({
            name: 'dsh-jenkins',
            description: 'Jenkins CLI：管理服务器配置并触发/查询构建（设置界面/工作区入口调用）。Manage Jenkins servers and trigger/query builds (used by the settings UI and workspace entry). 参数为 JSON：'
                + '{ "op": "list|save|delete|test|jobs|jobDetail|jobHistory|trigger|queueStatus|buildStatus|buildLog|cancel|updateCheck|pluginUpdateStart|pluginUpdateStatus|cacheGet|cacheSet|workspaceConfig|workspaceTrigger|saveTemplate", ... }。',
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
            await storeReady;
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
            await storeReady;
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
