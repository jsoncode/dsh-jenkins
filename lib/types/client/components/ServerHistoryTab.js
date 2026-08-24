import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 统一弹框「历史记录」tab：查看指定 Job 在 Jenkins 服务器上的真实构建记录
 * （区别于「本机记录」tab 的本地发布历史）。
 *
 * 页面结构：服务器下拉 → Job 下拉 → 分割线 → 「日志记录」列表。每条记录展示
 * 状态 / `#构建号 - 发布人 - 项目名称` / 时间 / 描述，点击任意记录打开「构建日志」弹框
 * （复用 BuildLogModal）查看该次构建的完整日志（进行中的构建自动实时刷新、可终止）。
 * 数据来自宿主 op jobHistory（Jenkins remote API：job/<path>/api/json?tree=builds[...]）。
 */
import { useEffect, useMemo, useState } from 'react';
import { t, tErr } from "../i18n.js";
import { BuildLogModal } from "./BuildLogModal.js";
import { InlineSelect } from "./InlineSelect.js";
/** 去掉描述里的 HTML 标签（Jenkins build description 常含 <br> 等）。 */
const stripHtml = (s) => String(s || '')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
/** displayName（如 "#359 - jason - app"）去掉前导 "#<number> - "，只留发布人/项目部分。 */
const displaySuffix = (name, number) => {
    const s = String(name || '').trim();
    if (number == null)
        return s;
    const m = s.match(new RegExp('^#' + number + '\\s*-\\s*(.*)$'));
    return m ? m[1] : s;
};
/** 记录名称：`#<id> - <发布人> - <项目名称>`（取自 Jenkins displayName，如 "#359 - jason - cxagroup-hr-portal-ui"）。 */
const nameText = (b) => {
    const num = b.number != null ? '#' + b.number : '#?';
    const suffix = displaySuffix(b.displayName, b.number);
    return suffix ? num + ' - ' + suffix : num;
};
export function ServerHistoryTab({ run, sessionId, poller }) {
    const [servers, setServers] = useState([]);
    const [serverId, setServerId] = useState('');
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobsError, setJobsError] = useState('');
    const [jobPath, setJobPath] = useState('');
    // 构建记录：null = 尚未加载（未选 Job）；[] = 已加载但为空
    const [records, setRecords] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [logTarget, setLogTarget] = useState(null);
    // 分页：与「本机记录」tab 同款（默认每页 20 条，可切换）
    const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    // 日志模糊搜索关键词（对当前 Job 已加载的全部记录过滤）
    const [search, setSearch] = useState('');
    const selectedServer = servers.find((s) => s.id === serverId) || null;
    // 加载已配置服务器；空态默认选中第一台（触发 Job 列表加载）
    useEffect(() => {
        let alive = true;
        run(sessionId, { op: 'list' }).then((r) => {
            if (!alive)
                return;
            const list = (r && r.ok) ? (r.servers || []) : [];
            setServers(list);
            if (list.length > 0)
                setServerId((cur) => cur || list[0].id);
        }).catch(() => undefined);
        return () => { alive = false; };
    }, [run, sessionId]);
    // 服务器变化 → 拉取该服务器的真实 Job 列表（排除文件夹），并重置 Job 与记录
    useEffect(() => {
        let alive = true;
        setJobs([]);
        setJobsError('');
        setJobPath('');
        setRecords(null);
        setError('');
        const server = servers.find((s) => s.id === serverId);
        if (!server) {
            setJobsLoading(false);
            return;
        }
        setJobsLoading(true);
        run(sessionId, { op: 'jobs', serverId }).then((r) => {
            if (!alive)
                return;
            setJobsLoading(false);
            if (r && r.ok) {
                setJobs((r.jobs || []).filter((j) => !j.folder));
            }
            else {
                setJobsError((r && r.error) || t('jobsFailed'));
            }
        }).catch(() => { if (alive) {
            setJobsLoading(false);
            setJobsError(t('jobsFailed'));
        } });
        return () => { alive = false; };
    }, [serverId, servers, run, sessionId]);
    // Job 变化 → 从服务器拉取该 Job 的真实构建记录（op jobHistory）
    useEffect(() => {
        let alive = true;
        setRecords(null);
        setError('');
        setPage(1);
        setSearch('');
        const server = servers.find((s) => s.id === serverId);
        if (!server || !jobPath) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const segments = jobPath.split('/').filter(Boolean);
        run(sessionId, { op: 'jobHistory', serverId, segments }).then((r) => {
            if (!alive)
                return;
            setLoading(false);
            if (r && r.ok) {
                setRecords(r.builds || []);
            }
            else {
                setRecords([]);
                setError(tErr(r, t('serverHistoryFailed')));
            }
        }).catch((e) => {
            if (alive) {
                setLoading(false);
                setRecords([]);
                setError(e instanceof Error ? e.message : String(e));
            }
        });
        return () => { alive = false; };
    }, [jobPath, serverId, servers, run, sessionId]);
    // 模糊搜索：对当前 Job 已加载的全部记录，按 名称（#编号-发布人-项目）/ 状态 / 描述 等做
    // 大小写不敏感的子串匹配；命中后再分页（statusText 需先于 useMemo 定义，避免 TDZ）
    const statusText = (b) => b.building ? t('historyPending') : (b.result || '—');
    const list = records || [];
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q)
            return list;
        return list.filter((b) => {
            const hay = [
                nameText(b),
                b.number != null ? '#' + b.number : '',
                statusText(b),
                b.result || '',
                stripHtml(b.description),
                b.displayName,
            ].join(' ').toLowerCase();
            return hay.indexOf(q) !== -1;
        });
    }, [list, search]);
    // 分页：筛选/数据变化时页号收敛到有效范围
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    useEffect(() => {
        setPage((p) => Math.min(p, totalPages));
    }, [totalPages, jobPath]);
    const changePageSize = (v) => {
        const n = Number(v);
        setPageSize(n > 0 ? n : 20);
        setPage(1);
    };
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
    const fmtTime = (ts) => {
        if (!ts)
            return '—';
        try {
            return new Date(ts).toLocaleString();
        }
        catch (e) {
            return String(ts);
        }
    };
    const resultClass = (b) => {
        if (b.building || b.result == null)
            return 'dshj-history-pending';
        if (b.result === 'SUCCESS')
            return 'dshj-ok';
        if (b.result === 'FAILURE' || b.result === 'ABORTED')
            return 'dshj-err';
        return 'dshj-warn';
    };
    // 描述行：优先服务器返回的 description（去 HTML）；为空时回退 displayName 去 #编号 前缀
    const descText = (b) => {
        const d = stripHtml(b.description);
        if (d)
            return d;
        const dn = displaySuffix(b.displayName, b.number);
        return dn || '—';
    };
    // 打开构建日志：把服务器记录转换为 HistoryEntry 形状，复用 BuildLogModal
    const openLog = (b) => {
        if (!selectedServer || !jobPath)
            return;
        setLogTarget({
            id: 'srv-' + serverId + '-' + jobPath.replace(/[\\/]/g, '_') + '-' + b.number,
            time: b.timestamp || Date.now(),
            job: jobPath,
            server: selectedServer.name,
            serverId,
            segments: jobPath.split('/').filter(Boolean),
            buildNumber: b.number ?? undefined,
            result: b.building ? null : b.result,
            url: b.url || '',
            queueId: null,
            since: b.timestamp || Date.now(),
        });
    };
    const serverOptions = useMemo(() => servers.map((s) => ({ id: s.id, label: s.name })), [servers]);
    const jobOptions = useMemo(() => jobs.map((j) => ({ id: j.path, label: j.path })), [jobs]);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "dshj-server-field", children: [_jsx("label", { className: "dshj-server-label", children: t('serverField') }), _jsx("div", { className: "dshj-server-ctrl", children: _jsx(InlineSelect, { value: serverId, placeholder: t('noServersHint'), searchPlaceholder: t('pickerSearchPlaceholder'), options: serverOptions, disabled: servers.length === 0, onChange: (id) => setServerId(id) }) })] }), _jsxs("div", { className: "dshj-server-field", children: [_jsx("label", { className: "dshj-server-label", children: t('jobField') }), _jsx("div", { className: "dshj-server-ctrl", children: _jsx(InlineSelect, { value: jobPath, placeholder: !serverId ? t('jobPlaceholder')
                                : jobsLoading ? t('jobsLoading')
                                    : jobsError ? t('jobsFailed')
                                        : jobs.length === 0 ? t('jobsEmpty')
                                            : t('jobPlaceholder'), searchPlaceholder: t('jobPlaceholder'), emptyText: jobsError ? t('jobsFailed') : t('jobsEmpty'), options: jobOptions, disabled: jobsLoading || !serverId, onChange: (id) => setJobPath(id) }) })] }), _jsx("div", { className: "dshj-divider" }), _jsxs("div", { className: "dshj-server-history-head", children: [_jsx("div", { className: "dshj-server-history-title", children: t('serverHistoryList') }), _jsxs("div", { className: "dshj-server-history-search", children: [_jsx("input", { className: "dshj-input", type: "text", value: search, placeholder: t('serverHistorySearchPlaceholder'), disabled: !serverId || !jobPath || loading || list.length === 0, onChange: (e) => setSearch(e.target.value) }), search ? (_jsx("button", { type: "button", className: "dshj-server-history-clear", "aria-label": t('close'), title: t('close'), onClick: () => setSearch(''), children: "\u2715" })) : null] })] }), !serverId || !jobPath ? (_jsx("div", { className: "dshj-empty", children: t('serverHistorySelectJob') })) : loading ? (_jsxs("div", { className: "dshj-empty", children: [_jsx("span", { className: "dshj-spinner" }), _jsx("div", { children: t('serverHistoryLoading') })] })) : error ? (_jsx("div", { className: "dshj-empty", children: _jsx("div", { className: "dshj-err", children: error }) })) : list.length === 0 ? (_jsx("div", { className: "dshj-empty", children: t('serverHistoryEmpty') })) : filtered.length === 0 ? (_jsx("div", { className: "dshj-empty", children: t('serverHistoryNoMatch') })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "dshj-history-list", children: paged.map((b) => (
                        /* 整卡可点击：点击打开该次构建的完整日志（复用「构建日志」弹框） */
                        _jsxs("button", { type: "button", className: "dshj-history-item dshj-server-history-item", title: t('historyLogHint'), onClick: () => openLog(b), children: [_jsxs("div", { className: "dshj-history-head", children: [_jsxs("div", { className: "dshj-server-history-left", children: [_jsx("span", { className: 'dshj-history-result ' + resultClass(b), children: statusText(b) }), _jsx("span", { className: "dshj-server-history-name", children: nameText(b) })] }), _jsx("span", { className: "dshj-history-time", children: fmtTime(b.timestamp) })] }), _jsx("div", { className: "dshj-server-history-desc", children: descText(b) })] }, b.number))) }), _jsxs("div", { className: "dshj-pagination", children: [_jsx("span", { className: "dshj-pagination-info", children: t('paginationTotal', { n: filtered.length }) }), _jsx("span", { className: "dshj-pagination-size-label", children: t('paginationSize') }), _jsx("select", { className: "dshj-select dshj-pagination-size", value: pageSize, title: t('paginationSize'), onChange: (ev) => changePageSize(ev.target.value), children: PAGE_SIZE_OPTIONS.map((n) => _jsx("option", { value: n, children: n }, n)) }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", title: t('prevPage'), disabled: page <= 1, onClick: () => setPage((p) => Math.max(1, p - 1)), children: "\u2039" }), _jsx("span", { className: "dshj-pagination-page", children: t('paginationPage', { cur: page, total: totalPages }) }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", title: t('nextPage'), disabled: page >= totalPages, onClick: () => setPage((p) => Math.min(totalPages, p + 1)), children: "\u203A" })] })] })), logTarget ? (_jsx(BuildLogModal, { entry: logTarget, run: run, sessionId: sessionId, poller: poller, onClose: () => setLogTarget(null) })) : null] }));
}
