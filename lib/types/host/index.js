/**
 * dsh-jenkins —— Jenkins CLI 插件 · 宿主半边（可发布组合包，无硬编码路径）
 *
 * - 插件数据（服务器列表 + 浏览器缓存）持久化到 $DSH_HOME/dsh-jenkins.json
 *   （服务器 Token 以 dsh-jenkins.key 机器绑定密钥 AES-256-GCM 加密；缓存明文）；
 *   集中式项目配置是独立文件 $DSH_HOME/dsh-jenkins-map.json（项目名 → 发布目标数组），
 *   各工作区根目录的 dsh-jenkins.{json,js,ts} 作为「发现式配置」自动合并进去。
 *   0.2.2-rc.1 起 settings 服务重构（旧 settings.yaml 由宿主框架自行迁移），
 *   本插件不再读写宿主设置文档，数据文件为唯一持久化源；
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
import { isTrustedApiRequest } from "./fence.js";
import { logFailure, logFilePath } from "./log.js";
import { serverHost } from "./jenkins.js";
import { errCodeOf, runOp } from "./ops.js";
import { EMPTY_STORE, loadStore, resolveStoreDir, saveStore } from "./store.js";
import { loadProjectMap, mapFilePath, saveProjectMap } from "./project-map.js";
import { mergeMissingProjects } from "./projects.js";
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
    // 数据文件为唯一持久化源。0.2.2-rc.1 起宿主 settings 服务重构为 SettingsForms，
    // 旧 settings.yaml 由宿主框架自行一次性迁移；本插件旧的「dsh-jenkins 命名空间
    // 迁移」路径随之下线（settings.register / scope API 已不存在）：数据文件缺失
    // 时直接以组合入口 config.servers 播种（非空即落盘，此后数据文件为唯一来源）。
    const storeDir = resolveStoreDir(settings?.documentPath);
    const mirror = EMPTY_STORE();
    let storeReady = Promise.resolve();
    // 失败请求日志位置（与数据文件同目录）：排查「加载 Job 列表失败」等问题的入口。
    console.log('[dsh-jenkins] failure log:', logFilePath());
    console.log('[dsh-jenkins] project map:', mapFilePath(storeDir));
    storeReady = (async () => {
        try {
            const loaded = await loadStore(storeDir);
            if (loaded !== null) {
                mirror.servers = loaded.servers;
                mirror.cache = loaded.cache;
                // 一次性迁移：旧版把项目配置写在数据文件的 projects 字段里 →
                // 迁到独立的 dsh-jenkins-map.json（只补缺失，不覆盖已有项目）。
                const legacyProjects = loaded.legacyProjects;
                if (legacyProjects && Object.keys(legacyProjects).length > 0) {
                    const current = await loadProjectMap(storeDir);
                    const merged = mergeMissingProjects(current, legacyProjects);
                    await saveProjectMap(storeDir, merged.map);
                    await saveStore(storeDir, mirror); // sealStore 不再写 projects，遗留字段随之清除
                    console.log(`[dsh-jenkins] migrated ${Object.keys(legacyProjects).length} legacy project(s) → ${mapFilePath(storeDir)}`);
                }
            }
            else {
                const seed = Array.isArray(config.servers) ? config.servers : [];
                if (seed.length > 0) {
                    mirror.servers = seed;
                    await saveStore(storeDir, mirror);
                    console.log(`[dsh-jenkins] seeded store from entry config → ${storeDir}/dsh-jenkins.json`);
                }
            }
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
    // 集中式项目配置：独立文件 $DSH_HOME/dsh-jenkins-map.json（项目名 → 发布目标数组）。
    // 每次读写都落盘解析（文件小），保持「文件即真相」——手改文件后即刻生效。
    const mapPath = () => mapFilePath(storeDir);
    const readMap = () => loadProjectMap(storeDir);
    const writeMap = (map) => saveProjectMap(storeDir, map);
    // 按 名称 / id / 完整地址（去尾部斜杠）/ 域名 匹配，兼容配置里直接写服务器地址的形式。
    // 域名一级是为「配置里写 https://host，插件里配的是 http://host:8080/jenkins」这类同机不同写法准备。
    const normUrl = (u) => String(u || '').trim().replace(/\/+$/, '');
    const findServer = (nameOrIdOrUrl) => {
        const ref = String(nameOrIdOrUrl || '').trim();
        if (ref === '')
            return undefined;
        const all = readServers();
        const exact = all.find((s) => s.name === ref || s.id === ref || normUrl(s.baseUrl) === normUrl(ref));
        if (exact !== undefined)
            return exact;
        const host = serverHost(ref);
        if (host === '')
            return undefined;
        return all.find((s) => serverHost(s.baseUrl) === host);
    };
    const deps = { ctx, readServers, writeServers, findServer, readMap, writeMap, mapPath, readCacheJson, writeCacheJson, storeReady };
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
                        // 围栏拒绝（Host 非回环且不在受信任主机内 / 跨站标记）：浏览器侧会看到
                        // 「加载失败」但请求根本没到 runOp，这里单独留痕，避免出现无法解释的空日志。
                        logFailure({
                            stage: 'route-guard',
                            code: 'forbidden',
                            message: '请求未通过 /dsh-jenkins/api 信任围栏（Host 非回环 / 未在受信任主机内 / 跨站）',
                            request: req.method + ' /dsh-jenkins/api',
                            note: 'host=' + String(req.headers.host || '') + ' origin=' + String(req.headers.origin || '') + ' sec-fetch-site=' + String(req.headers['sec-fetch-site'] || ''),
                        });
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
                            logFailure({ stage: 'route-guard', code: 'body-too-large', message: '请求体超过 1MB 上限', request: 'POST /dsh-jenkins/api' });
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
                            logFailure({ stage: 'route-guard', code: 'params-invalid', message: '请求体不是合法 JSON', request: 'POST /dsh-jenkins/api', bodySnippet: text });
                            writeApiJson(res, 400, { ok: false, error: { code: 'params-invalid', message: 'Parameters must be JSON' } });
                            return;
                        }
                    }
                    try {
                        const payload = await runOp(deps, request);
                        // 失败一律落日志：这是「加载失败」类问题的唯一留痕点（含各分支的提前返回）。
                        if (payload === null || payload === undefined || payload.ok !== true) {
                            logFailure({
                                stage: 'route',
                                op: String(request.op || ''),
                                code: payload && payload.code ? String(payload.code) : 'unknown',
                                message: payload && payload.error ? String(payload.error) : 'operation failed',
                                sessionId: typeof request.sessionId === 'string' ? request.sessionId : undefined,
                                request: 'POST /dsh-jenkins/api',
                            });
                        }
                        writeApiJson(res, 200, { ok: true, value: payload });
                    }
                    catch (e) {
                        // runOp 内部已兜底大部分分支；此处防御性映射为与命令 handler 相同的错误载荷。
                        const code = errCodeOf(e);
                        logFailure({
                            stage: 'route',
                            op: String(request.op || ''),
                            code,
                            message: e instanceof Error ? e.message : String(e),
                            sessionId: typeof request.sessionId === 'string' ? request.sessionId : undefined,
                            request: 'POST /dsh-jenkins/api',
                            note: 'uncaught from runOp',
                        });
                        writeApiJson(res, 200, {
                            ok: true,
                            value: { ok: false, code, error: e instanceof Error ? e.message : String(e) },
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
                + '{ "op": "list|save|delete|test|jobs|jobDetail|jobHistory|trigger|queueStatus|buildStatus|buildLog|cancel|updateCheck|pluginUpdateStart|pluginUpdateStatus|cacheGet|cacheSet|mapLoad|mapSave|mapDiscover|workspaceConfig|workspaceTrigger|saveTemplate", ... }。',
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
                    if (payload === null || payload === undefined || payload.ok !== true) {
                        logFailure({
                            stage: 'command',
                            op: String(req.op || ''),
                            code: payload && payload.code ? String(payload.code) : 'unknown',
                            message: payload && payload.error ? String(payload.error) : 'operation failed',
                        });
                    }
                    return { kind: 'success', text: JSON.stringify(payload) };
                }
                catch (e) {
                    const code = errCodeOf(e);
                    logFailure({
                        stage: 'command',
                        op: String(req.op || ''),
                        code,
                        message: e instanceof Error ? e.message : String(e),
                        note: 'uncaught from runOp',
                    });
                    return { kind: 'error', text: JSON.stringify({ ok: false, code, error: e instanceof Error ? e.message : String(e) }) };
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
            if (!result.ok) {
                logFailure({
                    stage: 'tool',
                    op: 'trigger',
                    code: result.code ? String(result.code) : 'unknown',
                    message: result.error ? String(result.error) : 'trigger failed',
                    note: 'dsh_jenkins_build job=' + args.job,
                });
                return '触发失败：' + result.error + ' / Trigger failed: ' + result.error;
            }
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
                logFailure({
                    stage: 'tool',
                    op: 'buildStatus',
                    code: result.code ? String(result.code) : 'unknown',
                    message: result.error ? String(result.error) : 'status query failed',
                    note: 'dsh_jenkins_status job=' + args.job,
                });
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
