import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 统一弹框「历史」tab：聚合所有工作区最近 50 次发布，可按工作区筛选
 * （默认全部）。进行中条目由全局轮询器实时回填结果；点击已完成条目可查看完整构建日志。
 * 内容来自原「发布历史」弹框，去掉弹框外框，由 JenkinsConfigModal 提供容器。
 */
import { useEffect, useState } from 'react';
import { t } from "../i18n.js";
import { BuildLogModal } from "./BuildLogModal.js";
import { PickerModal } from "./PickerModal.js";
export function HistoryTab({ cwd, sessionId, run, poller, storage, useWorkspaces }) {
    const workspaceItems = useWorkspaces && typeof useWorkspaces === 'function'
        ? useWorkspaces((s) => (s && s.items) || [])
        : [];
    const realPaths = (Array.isArray(workspaceItems) ? workspaceItems : [])
        .map((w) => (w && typeof w.path === 'string' ? w.path : null))
        .filter((p) => !!p);
    const [filter, setFilter] = useState('all');
    const [list, setList] = useState([]); // 全量历史（每条含 cwd）
    const [logTarget, setLogTarget] = useState(null);
    const [wsPickOpen, setWsPickOpen] = useState(false);
    const [wsPickSearch, setWsPickSearch] = useState('');
    const reload = () => {
        void storage.readAllHistory(sessionId).then(setList).catch(() => undefined);
    };
    // 全局轮询器每次回填结果后刷新列表（进行中 → 完成实时可见）
    useEffect(() => poller.subscribe(reload), [poller, storage, sessionId]);
    useEffect(() => {
        reload();
        // tab 打开即唤醒一次扫描：空闲轮询下，遗留的进行中任务（如页面重载后）
        // 需要在此被发现并恢复后台轮询，否则列表会一直停在「进行中」。
        poller.refresh();
    }, [cwd, storage, sessionId, poller]);
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
    // 有构建号 + 服务器 id 才能拉取日志
    const canOpenLog = (e) => !!e.buildNumber && !!e.serverId;
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "dshj-server-field dshj-history-ws-field", children: [_jsx("label", { className: "dshj-server-label", children: t('historyWsField') }), _jsxs("button", { type: "button", className: 'dshj-picker' + (filter === 'all' ? ' dshj-picker-empty' : ''), onClick: () => { setWsPickSearch(''); setWsPickOpen(true); }, children: [_jsx("span", { className: "dshj-picker-value", children: filterLabel }), _jsx("span", { className: "dshj-picker-caret", children: "\u25BE" })] }), _jsx(PickerModal, { open: wsPickOpen, title: t('historyWsField'), search: wsPickSearch, setSearch: setWsPickSearch, placeholder: t('historyWsPlaceholder'), options: wsOptions
                            .filter((o) => o.label.toLowerCase().indexOf(wsPickSearch.toLowerCase()) !== -1)
                            .map((o) => ({ id: o.id, label: o.label })), selectedId: filter, emptyText: undefined, onSelect: (id) => { setFilter(id); setWsPickOpen(false); }, onClose: () => setWsPickOpen(false) })] }), filtered.length === 0
                ? _jsx("div", { className: "dshj-empty", children: t('historyEmpty') })
                : (_jsx("div", { className: "dshj-history-list", children: filtered.map((e) => {
                        const paramsText = Object.keys(e.params || {}).map((k) => k + '=' + String(e.params[k])).join(', ');
                        return (_jsxs("div", { className: 'dshj-history-item' + (canOpenLog(e) ? ' dshj-history-item-clickable' : ''), title: canOpenLog(e) ? t('historyLogHint') : undefined, onClick: () => { if (canOpenLog(e))
                                setLogTarget(e); }, children: [_jsxs("div", { className: "dshj-history-head", children: [_jsx("span", { className: "dshj-history-time", children: fmtTime(e.time) }), _jsx("span", { className: 'dshj-history-result ' + resultClass(e.result), children: e.result || t('historyPending') })] }), _jsx("div", { className: "dshj-history-main", children: e.job + (e.env ? ' · ' + e.env : '') }), _jsxs("div", { className: "dshj-history-meta", children: [e.server ? _jsx("span", { className: "dshj-chip", children: e.server }) : null, e.buildNumber ? _jsxs("span", { className: "dshj-chip", children: ["#", e.buildNumber] }) : null, filter === 'all' && e.cwd ? _jsx("span", { className: "dshj-chip dshj-chip-ws", children: e.cwd }) : null] }), paramsText ? _jsx("div", { className: "dshj-history-params", children: t('historyParams') + paramsText }) : null] }, e.id));
                    }) })), filtered.length > 0
                ? (_jsx("div", { className: "dshj-history-ops", children: _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small dshj-btn-danger", onClick: () => {
                            void storage.clearHistory(sessionId, filter === 'all' ? null : filter).then(reload);
                        }, children: t('historyClear') }) }))
                : null, logTarget ? (_jsx(BuildLogModal, { entry: logTarget, run: run, sessionId: sessionId, onClose: () => setLogTarget(null) })) : null] }));
}
