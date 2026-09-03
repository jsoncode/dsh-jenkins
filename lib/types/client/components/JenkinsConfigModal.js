import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 统一「Jenkins 配置」弹框（shell.overlay）：
 * 侧边栏底部「Jenkins 配置」入口打开的单一弹框，四个 tab：
 * - 发布：原「执行 Jenkins Job」弹框内容（服务器 / Job / 参数 / 触发 / 轮询状态）；
 * - 配置：原设置页内容（服务器管理：增删改查 / 测试连接 / 项目配置弹框）；
 * - 本机记录：原「发布历史」弹框内容（按工作区筛选 / 查看构建日志 / 清空）；
 * - 历史记录：指定 Job 在 Jenkins 服务器上的真实构建记录（服务器 / Job 下拉 + 构建日志）。
 *
 * tab 按钮放在弹框标题右侧（标题栏内），压缩弹框高度。
 * 当前工作区（cwd）与会话 id 由宿主 overlay 的 useWorkspaces / useSessions 推导，
 * 四个 tab 共享同一份上下文。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { t } from "../i18n.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { PublishTab } from "./PublishTab.js";
import { SettingsPage } from "./SettingsPage.js";
import { HistoryTab } from "./HistoryTab.js";
import { ServerHistoryTab } from "./ServerHistoryTab.js";
import { ModalPortal } from "./ModalPortal.js";
// tab 文案渲染时取词：模块加载早于 locale 订阅的初始 setLang，常量会在
// 模块期固化 import 时的语言（曾固化成英文不再跟随切换）。
const getTabs = () => [
    { id: 'publish', label: t('tabPublish') },
    { id: 'config', label: t('tabConfig') },
    { id: 'history', label: t('tabHistory') },
    { id: 'serverHistory', label: t('tabServerHistory') },
];
export function JenkinsConfigModal({ run, poller, storage, useOpen, close, useWorkspaces, useSessions }) {
    const open = useOpen();
    const [tab, setTab] = useState('publish');
    const [configCount, setConfigCount] = useState(0); // 「配置」tab：已配置服务器数
    const [historyCount, setHistoryCount] = useState(0); // 「历史」tab：发布历史条数
    const [unreadCount, setUnreadCount] = useState(0); // 「历史」tab：未读条数（发布后未查看过历史 tab）
    const [footerNode, setFooterNode] = useState(null); // 当前 tab 上报的 footer 内容（无内容时不渲染 footer 栏）
    const [logTarget, setLogTarget] = useState(null); // 跨 tab 的构建日志目标（发布 tab → 历史 tab）
    // 打开指定条目的构建日志：切到「历史」tab 并定位弹框
    const openLog = useCallback((entry) => {
        setLogTarget(entry);
        setTab('history');
    }, []);
    // 切换到其他 tab 时清空日志目标，避免切回「历史」时旧日志弹框再次弹出
    useEffect(() => { if (tab !== 'history')
        setLogTarget(null); }, [tab]);
    // 每次打开弹框回到「发布」tab：进行中任务列表在「请先选择 Job」引导区实时展示
    const prevOpenRef = useRef(open);
    useEffect(() => {
        if (open && !prevOpenRef.current) {
            setTab('publish');
            setLogTarget(null);
        }
        prevOpenRef.current = open;
    }, [open]);
    // 稳定引用：子组件 effect 依赖它，避免父组件每次渲染重建导致子组件 effect 反复触发
    const reportFooter = useCallback((node) => { setFooterNode(node); }, []);
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
    // 打开弹框即预加载两个 tab 的计数（未切换到对应 tab 时胶囊也有数字）
    useEffect(() => {
        run(sessionId, { op: 'list' }).then((r) => {
            if (r && r.ok)
                setConfigCount((r.servers || []).length);
        }).catch(() => { });
        void storage.readAllHistory(sessionId).then((h) => {
            const list = h || [];
            setHistoryCount(list.length);
            setUnreadCount(list.filter((e) => e.unread).length);
        }).catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);
    // 弹框打开期间订阅轮询器：新发布 / 构建完成 / 清除未读都会刷新计数与未读标记（关闭后取消订阅）
    useEffect(() => {
        if (!open)
            return;
        return poller.subscribe(() => {
            void storage.readAllHistory(sessionId).then((h) => {
                const list = h || [];
                setHistoryCount(list.length);
                setUnreadCount(list.filter((e) => e.unread).length);
            }).catch(() => { });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, poller]);
    if (!open)
        return null;
    return (_jsxs(ModalPortal, { modalClass: "dshj-config-modal", onBackdropClose: close, children: [_jsxs("div", { className: "dshj-modal-header dshj-config-header", children: [_jsxs("div", { className: "dshj-config-title", children: [_jsx("div", { className: "dshj-modal-title", children: t('settingsNav') }), _jsx("div", { className: "dshj-modal-sub", children: cwd || '' })] }), _jsx("div", { className: "dshj-tabs dshj-config-tabs", role: "tablist", children: getTabs().map((item) => {
                            const count = item.id === 'config' ? configCount : item.id === 'history' ? historyCount : 0;
                            return (_jsxs("button", { type: "button", role: "tab", "aria-selected": tab === item.id, className: 'dshj-tab' + (tab === item.id ? ' dshj-tab-active' : ''), onClick: () => setTab(item.id), children: [item.label, item.id === 'history' && unreadCount > 0 ? _jsx("span", { className: "dshj-tab-dot", title: t('unreadCount', { n: unreadCount }) }) : null, count > 0 ? _jsx("span", { className: "dshj-badge", children: count }) : null] }, item.id));
                        }) }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), title: t('close'), onClick: close, children: "\u2715" })] }), _jsx("div", { className: "dshj-modal-body dshj-config-body", children: tab === 'publish' ? (_jsx(ErrorBoundary, { label: "PublishTab", children: _jsx(PublishTab, { initialCwd: cwd, sessionId: sessionId, run: run, poller: poller, storage: storage, workspaceItems: workspaceItems, onCountChange: setConfigCount, onFooter: reportFooter, onOpenLog: openLog }) })) : tab === 'config' ? (_jsx(ErrorBoundary, { label: "SettingsPage", children: _jsx(SettingsPage, { run: run, sessionId: sessionId, cwd: cwd, workspaceItems: workspaceItems, onCountChange: setConfigCount }) })) : tab === 'history' ? (_jsx(ErrorBoundary, { label: "HistoryTab", children: _jsx(HistoryTab, { cwd: cwd, sessionId: sessionId, run: run, poller: poller, storage: storage, onCountChange: setHistoryCount, onFooter: reportFooter, logTarget: logTarget, onLogTargetChange: setLogTarget }) })) : (_jsx(ErrorBoundary, { label: "ServerHistoryTab", children: _jsx(ServerHistoryTab, { run: run, sessionId: sessionId, poller: poller }) })) }), footerNode ? _jsx("div", { className: "dshj-modal-footer", children: footerNode }) : null] }));
}
