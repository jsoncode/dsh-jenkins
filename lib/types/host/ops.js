/**
 * dsh-jenkins —— 操作分发（命令与模型工具共用）：runOp 全部分支。
 *
 * 分支：workspaceConfig / workspaceTrigger / saveTemplate / list / save / delete / test /
 * jobs / jobDetail / trigger / queueStatus / buildStatus / buildLog / cancel。
 */
import { extractParams, getCrumb, headerValue, jenkinsJson, jenkinsRequest, jobPath, jobSegments, normalizeBase, } from "./jenkins.js";
import { loadWorkspaceConfig } from "./workspace-config.js";
const maskToken = (t) => {
    if (!t)
        return '';
    if (t.length <= 6)
        return '••••••';
    return t.slice(0, 2) + '••••' + t.slice(-2);
};
const publicServer = (s) => ({
    id: s.id,
    name: s.name,
    baseUrl: s.baseUrl,
    username: s.username,
    tokenMasked: maskToken(s.token),
    hasToken: !!s.token,
    insecure: !!s.insecure,
    verified: !!s.verified,
});
/** 把异常/消息映射为本地化错误码（客户端按 code 显示中/英文）。 */
function errCodeOf(e) {
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
export async function runOp(deps, req) {
    const { ctx, readServers, writeServers, findServer } = deps;
    const op = req && req.op;
    if (op === 'workspaceConfig') {
        const cwd = String(req.cwd || '').trim();
        console.log('[dsh-jenkins] workspaceConfig cwd=', cwd);
        if (!cwd)
            return { ok: false, code: 'cwd-missing', error: 'Missing workspace path' };
        try {
            const fsService = ctx.get('fs');
            const shell = ctx.get('shell');
            if (fsService === undefined || shell === undefined) {
                return { ok: false, code: 'fs-missing', error: 'fs/shell service unavailable' };
            }
            const config = await loadWorkspaceConfig(fsService, shell, cwd);
            console.log('[dsh-jenkins] workspaceConfig found=', config !== null, config && config.file);
            return config === null
                ? { ok: true, found: false, config: null }
                : { ok: true, found: true, config };
        }
        catch (e) {
            console.error('[dsh-jenkins] workspaceConfig error', e);
            return { ok: false, code: errCodeOf(e), error: e instanceof Error ? e.message : String(e) };
        }
    }
    if (op === 'workspaceTrigger') {
        const cwd = String(req.cwd || '').trim();
        if (!cwd)
            return { ok: false, code: 'cwd-missing', error: 'Missing workspace path' };
        try {
            const fsService = ctx.get('fs');
            const shell = ctx.get('shell');
            if (fsService === undefined || shell === undefined) {
                return { ok: false, code: 'fs-missing', error: 'fs/shell service unavailable' };
            }
            const config = await loadWorkspaceConfig(fsService, shell, cwd);
            if (config === null)
                return { ok: false, code: 'no-config', error: 'No dsh-jenkins.json/js/ts config found in workspace root' };
            const entries = config.entries || [];
            // 服务器解析顺序：弹框选择的 serverId → 配置元素匹配的服务器 → 唯一服务器。
            let server = req.serverId ? findServer(String(req.serverId)) : undefined;
            if (server === undefined) {
                for (const en of entries) {
                    server = findServer(en.server);
                    if (server !== undefined)
                        break;
                }
            }
            if (server === undefined) {
                const all = readServers();
                if (all.length === 1)
                    server = all[0];
            }
            if (server === undefined) {
                return { ok: false, code: 'server-missing', error: 'Server from config not found; configure it in Settings → Jenkins first' };
            }
            // Job：弹框选择优先，否则取首个配置元素的 job。
            const segs = (req.job && String(req.job).trim() ? String(req.job).trim() : (entries[0] ? entries[0].job : '')).split('/').filter(Boolean);
            if (segs.length === 0)
                return { ok: false, code: 'job-path-invalid', error: 'Empty job path' };
            const jobKey = segs.join('/');
            // 表单参数覆盖：弹框提交的已选参数优先；否则用匹配元素（同服务器 + 同 job）的 environments，
            // 再退到同 job 元素 / 首个元素的 environments。
            let parameters = (req.parameters && typeof req.parameters === 'object' && Object.keys(req.parameters).length > 0)
                ? req.parameters
                : null;
            if (parameters === null) {
                // 注意：findServer 每次重新解析服务器列表，返回新对象，须按 id 比较
                const serverId = server.id;
                const match = entries.find((en) => {
                    const s = findServer(en.server);
                    return en.job === jobKey && s !== undefined && s.id === serverId;
                }) || entries.find((en) => en.job === jobKey)
                    || entries[0];
                parameters = (match && match.parameters) || {};
            }
            const result = await runOp(deps, { op: 'trigger', serverId: server.id, segments: segs, parameters });
            if (!result.ok)
                return result;
            let nextBuildNumber = null;
            if (result.queueId == null) {
                try {
                    const d = await runOp(deps, { op: 'jobDetail', serverId: server.id, jobUrl: normalizeBase(server.baseUrl) + jobPath(segs) });
                    if (d.ok)
                        nextBuildNumber = d.nextBuildNumber;
                }
                catch { /* keep null */ }
            }
            return { ok: true, queueId: result.queueId, location: result.location, serverId: server.id, segments: segs, nextBuildNumber };
        }
        catch (e) {
            return { ok: false, code: errCodeOf(e), error: e instanceof Error ? e.message : String(e) };
        }
    }
    if (op === 'saveTemplate') {
        // 把配置模板写入工作区根目录。文件名白名单（仅 dsh-jenkins.{json,js,ts}），
        // 内容来自客户端固定的模板（不是任意文件写入）；文件已存在且未传 overwrite 时不写，
        // 返回 existed 由客户端先确认再覆盖。
        const cwd = String(req.cwd || '').trim();
        if (!cwd)
            return { ok: false, code: 'cwd-missing', error: 'Missing workspace path' };
        const filename = String(req.filename || '').trim();
        if (filename !== 'dsh-jenkins.json' && filename !== 'dsh-jenkins.js' && filename !== 'dsh-jenkins.ts') {
            return { ok: false, code: 'template-name-invalid', error: 'Invalid template filename: ' + filename };
        }
        try {
            const fsService = ctx.get('fs');
            if (fsService === undefined)
                return { ok: false, code: 'fs-missing', error: 'fs service unavailable' };
            const target = await fsService.resolve(filename, { cwd });
            const existed = (await fsService.stat(target)) !== undefined;
            if (existed && req.overwrite !== true) {
                return { ok: true, existed: true, path: fsService.processPath(target) };
            }
            // 宿主 fs 服务默认在 workspace-write 沙箱下运行（HTTP 路由非会话作用域，
            // 缺省策略的可写根不含工作区，直接写会被 FS_SANDBOX_DENIED 拒绝）：
            // 显式以请求的工作区为写根传入沙箱策略，写入即被放行。
            await fsService.writeText(target, String(req.content ?? ''), undefined, undefined, {
                mode: 'workspace-write',
                workspaceRoot: cwd,
            });
            return { ok: true, existed, path: fsService.processPath(target) };
        }
        catch (e) {
            console.error('[dsh-jenkins] saveTemplate error', e);
            return { ok: false, code: 'template-save-failed', error: e instanceof Error ? e.message : String(e) };
        }
    }
    if (op === 'list') {
        return { ok: true, servers: readServers().map(publicServer) };
    }
    if (op === 'save') {
        const a = (req && req.server) || {};
        const baseUrl = normalizeBase(String(a.baseUrl || ''));
        const username = String(a.username || '').trim();
        const token = String(a.token || '').trim();
        if (!/^https?:\/\//i.test(baseUrl))
            return { ok: false, code: 'url-invalid', error: 'Server URL must start with http:// or https://' };
        if (!token)
            return { ok: false, code: 'token-required', error: 'Token is required' };
        if (!username)
            return { ok: false, code: 'username-required', error: 'Username is required' };
        // 名称选填（缺省用服务器地址），用户名必填。
        const name = String(a.name || '').trim() || baseUrl;
        // readServers 返回 JSON.parse 结果（可变），可安全增改。
        const servers = readServers();
        if (a.id) {
            const s = servers.find((x) => x.id === a.id);
            if (!s)
                return { ok: false, code: 'server-missing', error: 'Server not found' };
            s.name = name;
            s.baseUrl = baseUrl;
            s.username = username;
            s.insecure = !!a.insecure;
            // 配置已变化：清除已验证状态，需重新测试连接
            s.verified = false;
            if (token)
                s.token = token;
        }
        else {
            servers.push({
                id: 'srv-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
                name, baseUrl, username, token, insecure: !!a.insecure,
            });
        }
        await writeServers(servers);
        return { ok: true, servers: readServers().map(publicServer) };
    }
    if (op === 'delete') {
        const servers = readServers().filter((s) => s.id !== req.id);
        await writeServers(servers);
        return { ok: true, servers: readServers().map(publicServer) };
    }
    if (op === 'test') {
        const a = (req && req.server) || {};
        const stored = a.id ? findServer(String(a.id)) : null;
        let baseUrl = normalizeBase(String(a.baseUrl || ''));
        let username = String(a.username || '').trim();
        let token = String(a.token || '').trim();
        if (stored) {
            if (!baseUrl)
                baseUrl = stored.baseUrl;
            if (!username)
                username = stored.username;
            if (!token)
                token = stored.token;
        }
        if (!baseUrl || !token)
            return { ok: false, code: 'fields-missing', error: 'Server URL and Token are required' };
        const insecure = a.insecure !== undefined ? !!a.insecure : (stored ? !!stored.insecure : false);
        const server = { baseUrl, username: username || 'admin', token, insecure };
        // 记录已验证状态（仅针对已保存的服务器）：测试成功置位、失败清除，持久化到服务器配置。
        // 注意：readServers() 每次调用都会重新 JSON.parse 返回新对象数组，
        // 必须在同一次读取的数组上修改并写回，跨调用修改旧引用会导致写盘丢失。
        const persistVerified = async (v) => {
            if (!stored)
                return;
            const servers = readServers();
            const target = servers.find((s) => s.id === stored.id);
            if (target) {
                target.verified = v;
                await writeServers(servers);
            }
        };
        let r;
        try {
            r = await jenkinsRequest(ctx, server, '/api/json');
        }
        catch (e) {
            await persistVerified(false);
            return { ok: false, code: errCodeOf(e) || 'network-failed', error: e instanceof Error ? e.message : String(e) };
        }
        if (r.status === 401) {
            await persistVerified(false);
            return { ok: false, code: 'auth-failed', error: 'Authentication failed: wrong username or Token (HTTP 401)' };
        }
        if (r.status === 403) {
            await persistVerified(false);
            return { ok: false, code: 'forbidden', error: 'Permission denied (HTTP 403)' };
        }
        if (r.status >= 400) {
            await persistVerified(false);
            return { ok: false, code: 'connect-failed', error: 'Connection failed (HTTP ' + r.status + ')' };
        }
        let data = null;
        try {
            data = JSON.parse(r.body || '{}');
        }
        catch { /* ignore */ }
        await persistVerified(true);
        return { ok: true, version: data && data.version ? data.version : '', nodeName: data && data.nodeName ? data.nodeName : '' };
    }
    if (op === 'jobs') {
        const s = findServer(String(req.serverId || ''));
        if (!s)
            return { ok: false, code: 'server-missing', error: 'Server not found; configure it in settings first' };
        const tree = 'jobs[name,color,url,buildable,jobs[name,color,url,buildable,jobs[name,color,url,buildable]]]';
        const data = await jenkinsJson(ctx, s, '/api/json?tree=' + encodeURIComponent(tree));
        const jobs = [];
        const walk = (list, prefix, depth) => {
            for (const j of list || []) {
                const segs = prefix.concat([String(j.name)]);
                const isFolder = j.color === 'folder' || (Array.isArray(j.jobs) && j.jobs.length > 0);
                if (isFolder) {
                    if (depth < 3 && Array.isArray(j.jobs))
                        walk(j.jobs, segs, depth + 1);
                    else
                        jobs.push({ path: segs.join('/'), name: j.name, color: 'folder', buildable: false, folder: true, url: j.url || '' });
                }
                else {
                    jobs.push({ path: segs.join('/'), name: j.name, color: j.color || 'grey', buildable: !!j.buildable, folder: false, url: j.url || '' });
                }
            }
        };
        walk(data.jobs || [], [], 1);
        jobs.sort((x, y) => x.folder === y.folder ? String(x.name).localeCompare(String(y.name)) : x.folder ? -1 : 1);
        return { ok: true, jobs };
    }
    if (op === 'jobDetail') {
        const s = findServer(String(req.serverId || ''));
        if (!s)
            return { ok: false, code: 'server-missing', error: 'Server not found' };
        const segs = jobSegments(String(req.jobUrl || ''));
        if (segs.length === 0)
            return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' };
        const data = await jenkinsJson(ctx, s, jobPath(segs) + '/api/json');
        return {
            ok: true,
            name: data.name || '',
            buildable: !!data.buildable,
            color: data.color || '',
            nextBuildNumber: data.nextBuildNumber || null,
            url: data.url || '',
            lastBuild: data.lastBuild ? { number: data.lastBuild.number, building: !!data.lastBuild.building, result: data.lastBuild.result || null } : null,
            params: extractParams(data.property),
            segments: segs,
        };
    }
    if (op === 'trigger') {
        const s = findServer(String(req.serverId || ''));
        if (!s)
            return { ok: false, code: 'server-missing', error: 'Server not found' };
        const segs = Array.isArray(req.segments) && req.segments.length ? req.segments : jobSegments(String(req.jobUrl || ''));
        if (segs.length === 0)
            return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' };
        const params = req.parameters && typeof req.parameters === 'object' ? req.parameters : {};
        const hasParams = Object.keys(params).length > 0;
        const crumb = await getCrumb(ctx, s);
        const headers = {};
        if (crumb)
            headers[crumb.field] = crumb.value;
        const path = jobPath(segs) + (hasParams ? '/buildWithParameters' : '/build');
        const res = await jenkinsRequest(ctx, s, path, { method: 'POST', form: hasParams ? params : null, headers });
        if (res.status >= 300 && res.status < 400) {
            return { ok: false, code: 'redirect', error: 'Server returned a redirect (HTTP ' + res.status + '); check that the URL is the final one (e.g. https://…)' };
        }
        if (res.status >= 400) {
            const detail = (res.body || '').trim().slice(0, 300);
            return { ok: false, code: 'trigger-http', status: res.status, detail, error: 'Failed to trigger build (HTTP ' + res.status + '): ' + (detail || 'no response body') };
        }
        const loc = headerValue(res.headers, 'Location');
        const qm = loc ? String(loc).match(/\/queue\/item\/(\d+)/) : null;
        return { ok: true, queueId: qm ? Number(qm[1]) : null, location: loc || null };
    }
    if (op === 'queueStatus') {
        const s = findServer(String(req.serverId || ''));
        if (!s)
            return { ok: false, code: 'server-missing', error: 'Server not found' };
        const id = Number(req.queueId);
        if (!id)
            return { ok: false, code: 'queue-id-missing', error: 'Missing queue ID' };
        const data = await jenkinsJson(ctx, s, '/queue/item/' + id + '/api/json');
        const ex = data.executable;
        if (ex && ex.number)
            return { ok: true, state: 'started', buildNumber: ex.number, buildUrl: ex.url || '', why: data.why || '' };
        if (data.cancelled)
            return { ok: true, state: 'cancelled', why: data.why || '' };
        return { ok: true, state: 'queued', why: data.why || '', blocked: !!data.blocked };
    }
    if (op === 'buildStatus') {
        const s = findServer(String(req.serverId || ''));
        if (!s)
            return { ok: false, code: 'server-missing', error: 'Server not found' };
        const segs = Array.isArray(req.segments) && req.segments.length ? req.segments : jobSegments(String(req.jobUrl || ''));
        if (segs.length === 0)
            return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' };
        const num = Number(req.buildNumber);
        const path = jobPath(segs) + (num ? '/' + num : '/lastBuild') + '/api/json';
        try {
            const data = await jenkinsJson(ctx, s, path);
            return {
                ok: true,
                number: data.number || null,
                building: !!data.building,
                result: data.result || null,
                duration: data.duration || 0,
                timestamp: data.timestamp || 0,
                estimatedDuration: data.estimatedDuration || 0,
                url: data.url || '',
                displayName: data.displayName || '',
            };
        }
        catch (e) {
            const err = e;
            if (err && err.status === 404)
                return { ok: false, code: 'build-not-found', error: 'No build record found yet', notFound: true };
            throw e;
        }
    }
    if (op === 'buildLog') {
        const s = findServer(String(req.serverId || ''));
        if (!s)
            return { ok: false, code: 'server-missing', error: 'Server not found' };
        const segs = Array.isArray(req.segments) && req.segments.length ? req.segments : jobSegments(String(req.jobUrl || ''));
        if (segs.length === 0)
            return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' };
        const num = Number(req.buildNumber);
        if (!num)
            return { ok: false, code: 'build-not-found', error: 'Missing build number' };
        const path = jobPath(segs) + '/' + num + '/consoleText';
        const res = await jenkinsRequest(ctx, s, path);
        if (res.status === 404)
            return { ok: false, code: 'build-not-found', error: 'No build log found yet', notFound: true };
        if (res.status >= 400)
            return { ok: false, code: 'log-failed', status: res.status, error: 'Failed to fetch build log (HTTP ' + res.status + ')' };
        // consoleText 可能极大：截取末尾（最新内容）并标记已截断
        const MAX_LOG = 500 * 1024;
        const body = res.body || '';
        const truncated = body.length > MAX_LOG;
        return { ok: true, log: truncated ? body.slice(body.length - MAX_LOG) : body, truncated };
    }
    if (op === 'cancel') {
        const s = findServer(String(req.serverId || ''));
        if (!s)
            return { ok: false, code: 'server-missing', error: 'Server not found' };
        const crumb = await getCrumb(ctx, s);
        const headers = {};
        if (crumb)
            headers[crumb.field] = crumb.value;
        // 已开始（有构建号）：停掉构建；仍在排队：取消队列项（构建一旦开始队列项即消失，优先按构建号处理）
        const num = Number(req.buildNumber);
        if (num) {
            const segs = Array.isArray(req.segments) && req.segments.length ? req.segments : jobSegments(String(req.jobUrl || ''));
            if (segs.length === 0)
                return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' };
            const res = await jenkinsRequest(ctx, s, jobPath(segs) + '/' + num + '/stop', { method: 'POST', headers });
            if (res.status >= 400) {
                return { ok: false, code: 'cancel-failed', status: res.status, error: 'Failed to stop build (HTTP ' + res.status + ')' };
            }
            return { ok: true, target: 'build' };
        }
        const queueId = Number(req.queueId);
        if (queueId) {
            const res = await jenkinsRequest(ctx, s, '/queue/cancelItem?id=' + queueId, { method: 'POST', headers });
            if (res.status >= 400) {
                return { ok: false, code: 'cancel-failed', status: res.status, error: 'Failed to cancel queued build (HTTP ' + res.status + ')' };
            }
            return { ok: true, target: 'queue' };
        }
        return { ok: false, code: 'build-not-found', error: 'Missing build number or queue id' };
    }
    if (op === 'cacheGet') {
        return { ok: true, cache: deps.readCacheJson() };
    }
    if (op === 'cacheSet') {
        // 按顶层键合并写入（lastParams / history），避免两个域互相覆盖。
        const key = String(req.key || '');
        if (key !== 'lastParams' && key !== 'history') {
            return { ok: false, code: 'cache-key-invalid', error: 'Invalid cache key: ' + key };
        }
        const cache = deps.readCacheJson();
        cache[key] = req.value;
        await deps.writeCacheJson(cache);
        return { ok: true };
    }
    return { ok: false, code: 'unknown-op', error: 'Unknown operation: ' + String(op) };
}
