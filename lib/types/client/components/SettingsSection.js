import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 设置弹框左侧菜单入口页（settings.section 'dsh-jenkins'）。
 *
 * 承载原「Jenkins 配置」统一弹框的全部内容（内嵌渲染，不套 ModalPortal 外壳）：
 * - 发布：原「执行 Jenkins Job」弹框内容（服务器 / Job / 参数 / 触发 / 轮询状态）；
 * - 配置：服务器管理（增删改查 / 测试连接 / 项目配置弹框）；
 * - 本机记录：原「发布历史」内容（按工作区筛选 / 查看构建日志 / 清空）；
 * - 历史记录：指定 Job 在 Jenkins 服务器上的真实构建记录（服务器 / Job 下拉 + 构建日志）。
 *
 * 与旧 footer 入口相比的上下文差异与对策：
 * - 设置页是全局页面、不天然跟随「当前会话」，因此顶部提供工作区选择器；
 *   默认值仍按会话所属 workspace → 第一个 workspace 的旧规则自动推导，
 *   用户手动切换后本页会话期内保持手选值（重新打开设置页恢复自动跟随）。
 * - 原 footer 按钮右侧的任务状态胶囊（构建中 / 成功未读 / 有更新）随入口迁移
 *   到本页标题行右侧；「有更新」胶囊仍可点击，打开插件更新确认弹框
 *   （shell.overlay 'dsh-jenkins-update'，不随本页内嵌）。
 * - 工作区 / 会话数据来自 settings.section 组件的标准插槽 hooks
 *   （useWorkspaces / useSessions，0.2.2-rc.1 与原 shell.overlay 同款注入）。
 * - 构建日志 / 服务器编辑 / 项目模板等二级弹框保持 ModalPortal（body 顶层
 *   fixed 蒙版）渲染，不受设置面板裁切，行为与旧弹框一致。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { t } from "../i18n.js";
import { JENKINS_LOGO } from "../logo.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { PublishTab } from "./PublishTab.js";
import { SettingsPage } from "./SettingsPage.js";
import { HistoryTab } from "./HistoryTab.js";
import { ServerHistoryTab } from "./ServerHistoryTab.js";
import { InlineSelect } from "./InlineSelect.js";
const EMPTY_SUMMARY = { building: 0, successUnread: 0 };
// tab 文案渲染时取词：模块加载早于 locale 订阅的初始 setLang，常量会在
// 模块期固化 import 时的语言（曾固化成英文不再跟随切换）。
const getTabs = () => [
    { id: 'publish', label: t('tabPublish') },
    { id: 'config', label: t('tabConfig') },
    { id: 'history', label: t('tabHistory') },
    { id: 'serverHistory', label: t('tabServerHistory') },
];
export function SettingsSection({ run, poller, storage, useUpdate, onUpdateRequest, reportSession, useWorkspaces, useSessions }) {
    const [tab, setTab] = useState('publish');
    const [configCount, setConfigCount] = useState(0); // 「配置」tab：已配置服务器数
    const [historyCount, setHistoryCount] = useState(0); // 「本机记录」tab：发布历史条数
    const [unreadCount, setUnreadCount] = useState(0); // 「本机记录」tab：未读条数（发布后未查看过该 tab）
    const [footerNode, setFooterNode] = useState(null); // 当前 tab 上报的 footer 内容（无内容时不渲染 footer 栏）
    const [logTarget, setLogTarget] = useState(null); // 跨 tab 的构建日志目标（发布 tab → 历史 tab）
    // 工作区手动选择覆盖（null = 跟随会话自动推导）；重新打开设置页组件重挂载即复位。
    const [cwdOverride, setCwdOverride] = useState(null);
    // 会话 id：上报给全局轮询器 / 更新检查（原 footer 入口同款逻辑）。
    const currentSessionId = useSessions
        ? useSessions((s) => s && s.current)
        : undefined;
    if (reportSession && currentSessionId)
        reportSession(currentSessionId);
    const sessionId = currentSessionId || '';
    const workspaceItems = useWorkspaces
        ? useWorkspaces((s) => (s && s.items) || [])
        : [];
    // 自动推导工作区：会话所属 workspace 优先，否则取第一个工作区（与旧 footer 入口同规则）。
    const derivedCwd = useMemo(() => {
        const list = Array.isArray(workspaceItems) ? workspaceItems : [];
        const current = list.find((w) => Array.isArray(w.sessionIds) && w.sessionIds.indexOf(currentSessionId) !== -1);
        return (current && current.path) || (list.length ? list[0].path : null) || '';
    }, [workspaceItems, currentSessionId]);
    // 手选值失效（工作区被关闭）时回落自动推导。
    const workspacePaths = useMemo(() => (Array.isArray(workspaceItems) ? workspaceItems : [])
        .map((w) => (w && typeof w.path === 'string' ? w.path : ''))
        .filter((p) => p !== ''), [workspaceItems]);
    const cwd = cwdOverride && workspacePaths.indexOf(cwdOverride) !== -1 ? cwdOverride : derivedCwd;
    // ─── 任务状态胶囊（原 footer 按钮右侧，随入口迁入本页标题行）──────
    const [summary, setSummary] = useState(EMPTY_SUMMARY);
    useEffect(() => {
        const update = () => { setSummary(poller.getSummary()); };
        update();
        return poller.subscribe(update);
    }, [poller]);
    // 会话切换（或首次挂载）时唤醒一次扫描，保证汇总跟随当前会话的数据
    useEffect(() => {
        if (currentSessionId)
            poller.refresh();
    }, [poller, currentSessionId]);
    const update = useUpdate();
    const showBuilding = summary.building > 0;
    const showDone = summary.successUnread > 0;
    const showUpdate = !!(update && update.hasUpdate && update.latest !== '');
    // 打开指定条目的构建日志：切到「本机记录」tab 并定位弹框
    const openLog = useCallback((entry) => {
        setLogTarget(entry);
        setTab('history');
    }, []);
    // 切换到其他 tab 时清空日志目标，避免切回「本机记录」时旧日志弹框再次弹出
    useEffect(() => { if (tab !== 'history')
        setLogTarget(null); }, [tab]);
    // 稳定引用：子组件 effect 依赖它，避免父组件每次渲染重建导致子组件 effect 反复触发
    const reportFooter = useCallback((node) => { setFooterNode(node); }, []);
    // 挂载即预加载两个 tab 的计数；工作区切换时重取（本页打开期间持续可见，无需开关门控）
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
    }, [sessionId, cwd]);
    // 页面挂载期间订阅轮询器：新发布 / 构建完成 / 清除未读都会刷新计数与未读标记
    useEffect(() => {
        return poller.subscribe(() => {
            void storage.readAllHistory(sessionId).then((h) => {
                const list = h || [];
                setHistoryCount(list.length);
                setUnreadCount(list.filter((e) => e.unread).length);
            }).catch(() => { });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poller]);
    // 每次进入本页回到「发布」tab（与旧弹框每次打开一致；重挂载天然复位，
    // 这里只兜底同一挂载内工作区切换后的复位）。
    const prevCwdRef = useRef(cwd);
    useEffect(() => {
        if (cwd !== prevCwdRef.current) {
            prevCwdRef.current = cwd;
            setTab('publish');
            setLogTarget(null);
        }
    }, [cwd]);
    return (_jsxs("div", { className: "dshj-settings-section", children: [_jsxs("div", { className: "dshj-section-head", children: [_jsxs("div", { className: "dshj-section-title", children: [_jsx("img", { src: JENKINS_LOGO, alt: "", className: "dshj-logo-badge" }), _jsxs("div", { className: "dshj-section-title-text", children: [_jsx("div", { className: "dshj-modal-title", children: t('settingsNav') }), _jsx("div", { className: "dshj-section-sub", children: cwd || '' })] })] }), showBuilding || showDone || showUpdate ? (_jsxs("span", { className: "dshj-section-caps", children: [showBuilding ? (_jsx("span", { className: "dshj-capsule dshj-capsule-building", title: t('footerBuilding') + ': ' + summary.building, children: summary.building })) : null, showDone ? (_jsx("span", { className: "dshj-capsule dshj-capsule-done", title: t('footerDoneUnread') + ': ' + summary.successUnread, children: summary.successUnread })) : null, showUpdate ? (_jsx("button", { type: "button", className: "dshj-capsule-wrap", title: t('footerUpdateTitle', { v: update.latest, c: update.current }), "aria-label": t('footerUpdate'), onClick: onUpdateRequest, children: _jsx("span", { className: "dshj-capsule dshj-capsule-update", children: t('footerUpdate') }) })) : null] })) : null, _jsxs("div", { className: "dshj-section-ws", children: [_jsx("span", { className: "dshj-section-ws-label", children: t('workspaceLabel') }), _jsx(InlineSelect, { value: cwd, placeholder: t('workspaceEmpty'), options: workspacePaths.map((p) => ({ id: p, label: p })), onChange: (id) => setCwdOverride(id), searchPlaceholder: t('pickerSearchPlaceholder'), emptyText: t('workspaceEmpty') })] })] }), _jsx("div", { className: "dshj-tabs dshj-section-tabs", role: "tablist", children: getTabs().map((item) => {
                    const count = item.id === 'config' ? configCount : item.id === 'history' ? historyCount : 0;
                    return (_jsxs("button", { type: "button", role: "tab", "aria-selected": tab === item.id, className: 'dshj-tab' + (tab === item.id ? ' dshj-tab-active' : ''), onClick: () => setTab(item.id), children: [item.label, item.id === 'history' && unreadCount > 0 ? _jsx("span", { className: "dshj-tab-dot", title: t('unreadCount', { n: unreadCount }) }) : null, count > 0 ? _jsx("span", { className: "dshj-badge", children: count }) : null] }, item.id));
                }) }), _jsx("div", { className: "dshj-modal-body dshj-config-body", children: tab === 'publish' ? (_jsx(ErrorBoundary, { label: "PublishTab", children: _jsx(PublishTab, { initialCwd: cwd, sessionId: sessionId, run: run, poller: poller, storage: storage, workspaceItems: workspaceItems, onCountChange: setConfigCount, onFooter: reportFooter, onOpenLog: openLog }) })) : tab === 'config' ? (_jsx(ErrorBoundary, { label: "SettingsPage", children: _jsx(SettingsPage, { run: run, sessionId: sessionId, cwd: cwd, workspaceItems: workspaceItems, onCountChange: setConfigCount }) })) : tab === 'history' ? (_jsx(ErrorBoundary, { label: "HistoryTab", children: _jsx(HistoryTab, { cwd: cwd, sessionId: sessionId, run: run, poller: poller, storage: storage, onCountChange: setHistoryCount, onFooter: reportFooter, logTarget: logTarget, onLogTargetChange: setLogTarget }) })) : (_jsx(ErrorBoundary, { label: "ServerHistoryTab", children: _jsx(ServerHistoryTab, { run: run, sessionId: sessionId, poller: poller }) })) }), footerNode ? _jsx("div", { className: "dshj-modal-footer dshj-section-footer", children: footerNode }) : null] }));
}
