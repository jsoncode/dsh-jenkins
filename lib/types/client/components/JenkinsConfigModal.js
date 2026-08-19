import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 统一「Jenkins 配置」弹框（shell.overlay）：
 * 侧边栏底部「Jenkins 配置」入口打开的单一弹框，三个 tab：
 * - 发布：原「执行 Jenkins Job」弹框内容（服务器 / Job / 参数 / 触发 / 轮询状态）；
 * - 配置：原设置页内容（服务器管理：增删改查 / 测试连接 / 模板）；
 * - 历史：原「发布历史」弹框内容（按工作区筛选 / 查看构建日志 / 清空）。
 *
 * 当前工作区（cwd）与会话 id 由宿主 overlay 的 useWorkspaces / useSessions 推导，
 * 三个 tab 共享同一份上下文。
 */
import { useMemo, useState } from 'react';
import { t } from "../i18n.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { PublishTab } from "./PublishTab.js";
import { SettingsPage } from "./SettingsPage.js";
import { HistoryTab } from "./HistoryTab.js";
const TABS = [
    { id: 'publish', label: t('tabPublish') },
    { id: 'config', label: t('tabConfig') },
    { id: 'history', label: t('tabHistory') },
];
export function JenkinsConfigModal({ run, poller, storage, useOpen, close, useWorkspaces, useSessions }) {
    const open = useOpen();
    const [tab, setTab] = useState('publish');
    const workspaceItems = useWorkspaces
        ? useWorkspaces((s) => (s && s.items) || [])
        : [];
    const currentSessionId = useSessions
        ? useSessions((s) => s && s.current)
        : undefined;
    const sessionId = currentSessionId || '';
    // 当前工作区：会话所属 workspace 优先，否则取第一个工作区（与旧 footer 入口同规则）。
    const cwd = useMemo(() => {
        const list = Array.isArray(workspaceItems) ? workspaceItems : [];
        const current = list.find((w) => Array.isArray(w.sessionIds) && w.sessionIds.indexOf(currentSessionId) !== -1);
        return (current && current.path) || (list.length ? list[0].path : null) || '';
    }, [workspaceItems, currentSessionId]);
    if (!open)
        return null;
    return (_jsx("div", { className: "dshj-backdrop", onClick: close, children: _jsxs("div", { className: "dshj-modal dshj-config-modal", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "dshj-modal-header", children: [_jsxs("div", { children: [_jsx("div", { className: "dshj-modal-title", children: t('settingsNav') }), _jsx("div", { className: "dshj-modal-sub", children: cwd || '' })] }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), title: t('close'), onClick: close, children: "\u2715" })] }), _jsx("div", { className: "dshj-tabs", role: "tablist", children: TABS.map((item) => (_jsx("button", { type: "button", role: "tab", "aria-selected": tab === item.id, className: 'dshj-tab' + (tab === item.id ? ' dshj-tab-active' : ''), onClick: () => setTab(item.id), children: item.label }, item.id))) }), _jsx("div", { className: "dshj-modal-body dshj-config-body", children: tab === 'publish' ? (_jsx(ErrorBoundary, { label: "PublishTab", children: _jsx(PublishTab, { initialCwd: cwd, sessionId: sessionId, run: run, poller: poller, storage: storage, workspaceItems: workspaceItems }) })) : tab === 'config' ? (_jsx(ErrorBoundary, { label: "SettingsPage", children: _jsx(SettingsPage, { run: run, sessionId: sessionId }) })) : (_jsx(ErrorBoundary, { label: "HistoryTab", children: _jsx(HistoryTab, { cwd: cwd, sessionId: sessionId, run: run, poller: poller, storage: storage, useWorkspaces: useWorkspaces }) })) })] }) }));
}
