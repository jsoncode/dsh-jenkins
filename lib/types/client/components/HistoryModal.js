import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 发布历史弹框：聚合所有工作区最近 50 次发布，可按工作区筛选（默认全部）。
 */
import { useEffect, useState } from 'react';
import { t } from "../i18n.js";
import { storage } from "../storage.js";
export function HistoryModal({ historyStore, useWorkspaces, useLaunch }) {
    const cwd = useLaunch();
    const workspaceItems = useWorkspaces && typeof useWorkspaces === 'function'
        ? useWorkspaces((s) => (s && s.items) || [])
        : [];
    const realPaths = (Array.isArray(workspaceItems) ? workspaceItems : [])
        .map((w) => (w && typeof w.path === 'string' ? w.path : null))
        .filter((p) => !!p);
    const [filter, setFilter] = useState('all');
    const [list, setList] = useState([]); // 全量历史（每条含 cwd）
    useEffect(() => {
        if (!cwd) {
            setList([]);
            return;
        }
        setList(storage.readAllHistory());
    }, [cwd]);
    if (!cwd)
        return null;
    // 工作区选项：真实工作区 + 有历史记录的路径（去重排序），外加「全部」
    const wsPaths = [...new Set([...realPaths, ...list.map((e) => e.cwd).filter((p) => !!p)])].sort();
    const wsOptions = [{ id: 'all', label: t('historyAll') }].concat(wsPaths.map((p) => ({ id: p, label: p })));
    const filtered = filter === 'all' ? list : list.filter((e) => e.cwd === filter);
    const filterLabel = filter === 'all' ? t('historyAll') : filter;
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
    return (_jsx("div", { className: "dshj-backdrop", onClick: () => historyStore.close(), children: _jsxs("div", { className: "dshj-modal dshj-history-modal", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "dshj-modal-header", children: [_jsxs("div", { children: [_jsx("div", { className: "dshj-modal-title", children: t('historyTitle') }), _jsx("div", { className: "dshj-modal-sub", children: filterLabel })] }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), title: t('close'), onClick: () => historyStore.close(), children: "\u2715" })] }), _jsxs("div", { className: "dshj-modal-body", children: [_jsxs("div", { className: "dshj-server-field", children: [_jsx("label", { className: "dshj-server-label", children: t('historyWsField') }), _jsx("select", { className: "dshj-select", value: filter, onChange: (e) => setFilter(e.target.value), children: wsOptions.map((o) => _jsx("option", { value: o.id, children: o.label }, o.id)) })] }), filtered.length === 0
                            ? _jsx("div", { className: "dshj-empty", children: t('historyEmpty') })
                            : (_jsx("div", { className: "dshj-history-list", children: filtered.map((e) => (_jsxs("div", { className: "dshj-history-item", children: [_jsxs("div", { className: "dshj-history-head", children: [_jsx("span", { className: "dshj-history-time", children: fmtTime(e.time) }), _jsx("span", { className: 'dshj-history-result ' + resultClass(e.result), children: e.result || t('historyPending') })] }), filter === 'all' ? _jsx("div", { className: "dshj-history-ws", children: e.cwd }) : null, _jsx("div", { className: "dshj-history-main", children: e.job + (e.env ? ' · ' + e.env : '') + (e.server ? ' · ' + e.server : '') }), _jsx("div", { className: "dshj-history-params", children: t('historyParams') + Object.keys(e.params || {}).map((k) => k + '=' + String(e.params[k])).join(', ') })] }, e.id))) }))] }), filtered.length > 0
                    ? (_jsx("div", { className: "dshj-history-ops", children: _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small dshj-btn-danger", onClick: () => {
                                storage.clearHistory(filter === 'all' ? null : filter);
                                setList(storage.readAllHistory());
                            }, children: t('historyClear') }) }))
                    : null] }) }));
}
