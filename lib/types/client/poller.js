/**
 * dsh-jenkins —— 全局构建状态轮询器。
 *
 * 与组件生命周期解耦：只要有「进行中」的发布历史（result 为空且带轮询数据），
 * 无论执行弹框 / 历史弹框是否打开、是否被关闭，都会在后台持续轮询并回填结果，
 * 避免关闭弹框或打开历史弹框后状态永远停在「进行中」。
 * 历史读写走宿主存储（$DSH_HOME），不依赖浏览器 localStorage。
 *
 * 空闲不轮询：当没有进行中的任务时（hasInFlight 为 false），tick() 直接返回，
 * 连宿主存储的 cacheGet 扫描请求都不发 —— 页面静止时零网络开销。新任务触发
 * （发布 tab 提交后）或历史 tab 打开时会显式 refresh() 唤醒扫描，
 * 发现进行中任务后自动恢复定时轮询。
 */
const POLL_TIMEOUT_MS = 10 * 60 * 1000;
export function createPoller(run, storage, getSession) {
    const listeners = new Set();
    const live = new Map();
    const inflight = new Set();
    let scanning = false;
    /** 是否还有「进行中」任务：false 时 tick() 直接短路，不发任何请求。 */
    let hasInFlight = false;
    const emit = () => {
        for (const fn of Array.from(listeners)) {
            try {
                fn();
            }
            catch { /* 订阅者异常不影响轮询 */ }
        }
    };
    const segmentsOf = (e) => {
        if (Array.isArray(e.segments) && e.segments.length)
            return e.segments;
        return e.job ? e.job.split('/').filter(Boolean) : [];
    };
    const pollEntry = async (e) => {
        const key = e.id;
        if (inflight.has(key))
            return;
        inflight.add(key);
        try {
            const cwd = e.cwd || '';
            const serverId = e.serverId;
            const segments = segmentsOf(e);
            if (!serverId || segments.length === 0)
                return;
            const sessionId = e.sessionId || getSession() || '';
            const since = e.since || e.time;
            if (Date.now() - since > POLL_TIMEOUT_MS) {
                await storage.updateHistoryResult(sessionId, cwd, key, 'TIMEOUT');
                live.set(key, { entryId: key, cwd, phase: 'error', status: 'timeout', buildNumber: e.buildNumber ?? null, since });
                emit();
                return;
            }
            // 排队中 → 查询队列；已开始（有构建号）→ 查询构建状态
            if (e.queueId != null && e.buildNumber == null) {
                const res = await run(sessionId, { op: 'queueStatus', serverId, queueId: e.queueId }).catch(() => null);
                if (res && res.ok) {
                    if (res.state === 'started') {
                        await storage.updateHistoryPoll(sessionId, cwd, key, { buildNumber: res.buildNumber });
                        live.set(key, { entryId: key, cwd, phase: 'running', status: 'started', buildNumber: res.buildNumber, since });
                    }
                    else if (res.state === 'cancelled') {
                        await storage.updateHistoryResult(sessionId, cwd, key, 'CANCELLED');
                        live.set(key, { entryId: key, cwd, phase: 'cancelled', status: 'cancelled', buildNumber: null, since });
                    }
                    else {
                        live.set(key, { entryId: key, cwd, phase: 'queued', status: 'queued', buildNumber: null, since });
                    }
                }
            }
            else if (e.buildNumber != null) {
                const res = await run(sessionId, { op: 'buildStatus', serverId, segments, buildNumber: e.buildNumber }).catch(() => null);
                if (res && res.ok) {
                    if (res.building) {
                        live.set(key, { entryId: key, cwd, phase: 'running', status: 'building', buildNumber: e.buildNumber ?? null, since });
                    }
                    else {
                        await storage.updateHistoryResult(sessionId, cwd, key, res.result || 'UNKNOWN');
                        if (res.url)
                            await storage.updateHistoryPoll(sessionId, cwd, key, { url: res.url });
                        live.set(key, {
                            entryId: key, cwd, phase: 'done', status: 'done', buildNumber: e.buildNumber ?? null, since,
                            result: res.result || 'UNKNOWN', duration: res.duration || 0, url: res.url || '',
                        });
                    }
                }
                else if (res && res.notFound) {
                    // 构建记录尚未出现（竞态），保持待轮询状态
                }
                else {
                    // 查询失败：保留进行中，下轮重试
                    live.set(key, { entryId: key, cwd, phase: 'running', status: 'building', buildNumber: e.buildNumber ?? null, since });
                }
            }
        }
        finally {
            inflight.delete(key);
            emit();
        }
    };
    const scan = async () => {
        const sessionId = getSession() || '';
        let entries = [];
        try {
            entries = await storage.readAllHistory(sessionId);
        }
        catch { /* 忽略读取失败 */ }
        let found = false;
        for (const e of entries) {
            if (e.result !== null && e.result !== undefined)
                continue;
            if (e.queueId == null && e.buildNumber == null)
                continue;
            found = true;
            void pollEntry(e);
        }
        // 每次扫描后重算进行中标记：全部完成 → 空闲，后续 tick 直接短路。
        hasInFlight = found;
    };
    return {
        tick() {
            // 空闲时不轮询：不发 cacheGet 扫描请求，零性能开销。
            if (!hasInFlight)
                return;
            if (scanning)
                return;
            scanning = true;
            void scan().finally(() => { scanning = false; });
        },
        refresh() {
            if (scanning)
                return;
            scanning = true;
            void scan().finally(() => { scanning = false; });
        },
        subscribe(fn) {
            listeners.add(fn);
            return () => { listeners.delete(fn); };
        },
        getLive(entryId) { return live.get(entryId); },
    };
}
