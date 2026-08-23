import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 统一弹框「历史」tab：聚合所有工作区最近 50 次发布，可按工作区筛选
 * （默认全部）。进行中条目由全局轮询器实时回填结果。每条记录提供两个独立操作：
 * 「查看详情」打开构建日志弹框、「打开原始任务」在浏览器中跳转 Jenkins 页面。
 * 内容来自原「发布历史」弹框，去掉弹框外框，由 JenkinsConfigModal 提供容器。
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { t } from "../i18n.js";
import { BuildLogModal } from "./BuildLogModal.js";
import { InlineSelect } from "./InlineSelect.js";
import { SvgCheck, SvgCopy } from "./SvgIcons.js";
import { ModalPortal } from "./ModalPortal.js";
export function HistoryTab({ cwd, sessionId, run, poller, storage, onCountChange, onFooter, logTarget: logTargetProp, onLogTargetChange }) {
    const [filter, setFilter] = useState('all');
    const [list, setList] = useState([]); // 全量历史（每条含 cwd）
    // 日志目标：外部传入时受控（发布 tab 跳转复用），否则内部自管
    const [localTarget, setLocalTarget] = useState(null);
    const logTarget = logTargetProp !== undefined ? logTargetProp : localTarget;
    const setLogTarget = (e) => {
        if (logTargetProp !== undefined) {
            if (onLogTargetChange)
                onLogTargetChange(e);
        }
        else
            setLocalTarget(e);
    };
    const reload = useCallback(() => {
        void storage.readAllHistory(sessionId).then((h) => {
            setList(h);
            if (onCountChange)
                onCountChange((h || []).length);
        }).catch(() => undefined);
    }, [storage, sessionId, onCountChange]);
    // 全局轮询器每次回填结果后刷新列表（进行中 → 完成实时可见）
    useEffect(() => poller.subscribe(reload), [poller, reload]);
    useEffect(() => {
        let alive = true;
        // 打开「历史」tab：先清除全部未读，再加载列表 —— 发布后未查看过的条目视为已读，
        // 随后刷新一次扫描（汇总归零），驱动 footer 的「已完成（未读）」绿色胶囊与
        // tab 未读点消失；同时唤醒空闲轮询（遗留的进行中任务在此被发现并恢复后台轮询）。
        void storage.markAllHistoryRead(sessionId).catch(() => undefined).then(() => {
            if (!alive)
                return;
            reload();
            poller.refresh();
        });
        return () => { alive = false; };
    }, [reload, poller, storage, sessionId]);
    // 工作区选项：仅列出曾经发布过的记录里的工作区（去重排序），外加「全部」
    const wsPaths = [...new Set(list.map((e) => e.cwd).filter((p) => !!p))].sort();
    const wsOptions = [{ id: 'all', label: t('historyAll') }].concat(wsPaths.map((p) => ({ id: p, label: p })));
    const filtered = filter === 'all' ? list : list.filter((e) => e.cwd === filter);
    // 分页：默认每页 20 条，可切换每页条数；筛选/数据变化时页号收敛到有效范围
    const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    useEffect(() => {
        setPage((p) => Math.min(p, totalPages));
    }, [totalPages, filter]);
    const changePageSize = (v) => {
        const n = Number(v);
        setPageSize(n > 0 ? n : 20);
        setPage(1);
    };
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
    const fmtTime = (ts) => {
        try {
            return new Date(ts).toLocaleString();
        }
        catch (e) {
            return String(ts);
        }
    };
    const resultClass = (r) => {
        if (!r)
            return 'dshj-history-pending';
        if (r === 'SUCCESS')
            return 'dshj-ok';
        if (r === 'FAILURE' || r === 'ABORTED')
            return 'dshj-err';
        return 'dshj-warn';
    };
    // 有构建号或队列号 + 服务器 id 才能拉取日志（排队中的条目打开后等待首个日志输出再实时刷新）
    const canOpenLog = (e) => !!e.serverId && !!(e.buildNumber || e.queueId);
    // 已配置服务器（用于为无 entry.url 的条目拼出 Jenkins 页面地址）
    const [servers, setServers] = useState([]);
    useEffect(() => {
        let alive = true;
        run(sessionId, { op: 'list' }).then((r) => {
            if (alive && r && r.ok)
                setServers((r.servers || []));
        }).catch(() => undefined);
        return () => { alive = false; };
    }, [run, sessionId]);
    // 「打开原始任务」跳转地址：优先构建页（轮询完成时回填的 url）；没有则按服务器 + Job 路径
    // 拼出（有构建号给构建页，否则给 Job 页）；服务器已删除且无回填地址时返回空串（隐藏按钮）。
    const jobUrlOf = (e) => {
        if (e.url)
            return e.url;
        const s = servers.find((x) => x.id === e.serverId || (e.server && x.name === e.server));
        if (!s)
            return '';
        const base = (s.baseUrl || '').replace(/\/+$/, '');
        const segs = Array.isArray(e.segments) && e.segments.length ? e.segments : (e.job || '').split('/').filter(Boolean);
        if (segs.length === 0)
            return '';
        const jobPart = segs.map((seg) => '/job/' + encodeURIComponent(seg)).join('');
        return e.buildNumber ? base + jobPart + '/' + e.buildNumber + '/' : base + jobPart;
    };
    // 参数复制：当前正在复制成功的条目 id（用于图标切换为对勾），1.5s 后复原
    const [copiedId, setCopiedId] = useState(null);
    const copyParams = async (e) => {
        if (!e.params)
            return;
        try {
            await navigator.clipboard.writeText(JSON.stringify(e.params, null, 2));
            setCopiedId(e.id);
            setTimeout(() => setCopiedId((cur) => (cur === e.id ? null : cur)), 1500);
        }
        catch { /* 剪贴板不可用时静默忽略 */ }
    };
    // 清空历史：先弹框确认再执行（避免误触直接清空）；scope 跟随当前工作区筛选
    const [confirmClear, setConfirmClear] = useState(false);
    const doClear = () => {
        setConfirmClear(false);
        void storage.clearHistory(sessionId, filter === 'all' ? null : filter).then(reload);
    };
    // footer 操作按钮：有历史记录时显示「清空」（点击弹确认框）；useMemo 保持引用稳定避免父组件渲染循环。
    const footerNode = useMemo(() => {
        if (filtered.length === 0)
            return null;
        return (_jsx("button", { type: "button", className: "dshj-btn dshj-btn-small dshj-btn-danger", onClick: () => setConfirmClear(true), children: t('historyClear') }));
    }, [filtered.length, storage, sessionId, reload]);
    // 上报 footer；卸载时清空（与 PublishTab 同一模式）。
    useEffect(() => {
        onFooter?.(footerNode);
        return () => onFooter?.(null);
    }, [footerNode, onFooter]);
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "dshj-server-field dshj-history-ws-field", children: _jsx(InlineSelect, { value: filter, placeholder: t('historyWsPlaceholder'), searchPlaceholder: t('historyWsPlaceholder'), options: wsOptions.map((o) => ({ id: o.id, label: o.label })), onChange: (id) => setFilter(id) }) }), filtered.length === 0
                ? _jsx("div", { className: "dshj-empty", children: t('historyEmpty') })
                : (_jsxs(_Fragment, { children: [_jsx("div", { className: "dshj-history-list", children: paged.map((e) => {
                                const hasParams = !!e.params && Object.keys(e.params).length > 0;
                                const paramsText = hasParams ? Object.keys(e.params).map((k) => k + '=' + String(e.params[k])).join(', ') : '';
                                const jobUrl = jobUrlOf(e);
                                return (_jsxs("div", { className: "dshj-history-item", children: [_jsxs("div", { className: "dshj-history-head", children: [_jsx("span", { className: "dshj-history-time", children: fmtTime(e.time) }), e.unread ? _jsx("span", { className: "dshj-unread-tag", children: t('unread') }) : null, _jsx("span", { className: 'dshj-history-result ' + resultClass(e.result), children: e.result || t('historyPending') })] }), _jsx("div", { className: "dshj-history-main", children: e.job + (e.env ? ' · ' + e.env : '') }), _jsxs("div", { className: "dshj-history-meta", children: [e.server ? _jsx("span", { className: "dshj-chip", children: e.server }) : null, e.buildNumber ? _jsxs("span", { className: "dshj-chip", children: ["#", e.buildNumber] }) : e.queueId ? _jsxs("span", { className: "dshj-chip", children: ["Q#", e.queueId] }) : null, filter === 'all' && e.cwd ? _jsx("span", { className: "dshj-chip dshj-chip-ws", children: e.cwd }) : null] }), hasParams ? (_jsxs("div", { className: "dshj-history-params-row", children: [_jsx("div", { className: "dshj-history-params", title: paramsText, children: t('historyParams') + paramsText }), _jsx("button", { type: "button", className: "dshj-btn-icon dshj-history-params-copy", title: copiedId === e.id ? t('copied') : t('copyParams'), onClick: () => void copyParams(e), children: copiedId === e.id ? _jsx(SvgCheck, { size: 14 }) : _jsx(SvgCopy, { size: 14 }) })] })) : null, canOpenLog(e) || jobUrl ? (_jsxs("div", { className: "dshj-history-actions", children: [canOpenLog(e) ? (_jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", title: t('historyLogHint'), onClick: () => setLogTarget(e), children: t('viewFullLog') })) : null, jobUrl ? (_jsxs("a", { className: "dshj-btn dshj-btn-small dshj-link", href: jobUrl, target: "_blank", rel: "noopener noreferrer", children: [t('openOriginalJob'), " \u2197"] })) : null] })) : null] }, e.id));
                            }) }), _jsxs("div", { className: "dshj-pagination", children: [_jsx("span", { className: "dshj-pagination-info", children: t('paginationTotal', { n: filtered.length }) }), _jsx("span", { className: "dshj-pagination-size-label", children: t('paginationSize') }), _jsx("select", { className: "dshj-select dshj-pagination-size", value: pageSize, title: t('paginationSize'), onChange: (ev) => changePageSize(ev.target.value), children: PAGE_SIZE_OPTIONS.map((n) => _jsx("option", { value: n, children: n }, n)) }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", title: t('prevPage'), disabled: page <= 1, onClick: () => setPage((p) => Math.max(1, p - 1)), children: "\u2039" }), _jsx("span", { className: "dshj-pagination-page", children: t('paginationPage', { cur: page, total: totalPages }) }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", title: t('nextPage'), disabled: page >= totalPages, onClick: () => setPage((p) => Math.min(totalPages, p + 1)), children: "\u203A" })] })] })), logTarget ? (_jsx(BuildLogModal, { entry: logTarget, run: run, sessionId: sessionId, poller: poller, onClose: () => setLogTarget(null) })) : null, confirmClear ? (_jsxs(ModalPortal, { backdropClass: "dshj-json-backdrop dshj-confirm-backdrop", modalClass: "dshj-confirm-modal", onBackdropClose: () => setConfirmClear(false), children: [_jsxs("div", { className: "dshj-modal-header", children: [_jsxs("div", { children: [_jsx("div", { className: "dshj-modal-title", children: t('confirmClearTitle') }), _jsx("div", { className: "dshj-modal-sub", children: t('historyTitle') })] }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), title: t('close'), onClick: () => setConfirmClear(false), children: "\u2715" })] }), _jsx("div", { className: "dshj-modal-body", children: _jsx("div", { className: "dshj-empty", children: filter === 'all' ? t('confirmClearAll') : t('confirmClearCwd', { path: filter }) }) }), _jsxs("div", { className: "dshj-modal-footer", children: [_jsx("button", { type: "button", className: "dshj-btn", onClick: () => setConfirmClear(false), children: t('cancelBtn') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-solid", onClick: doClear, children: t('confirmClear') })] })] })) : null] }));
}
