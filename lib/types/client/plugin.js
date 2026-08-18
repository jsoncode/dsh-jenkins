import { jsx as _jsx } from "react/jsx-runtime";
import { injectStyles } from "./styles.js";
import { makeRun } from "./rpc.js";
import { makeHistoryStore, makeLaunchStore } from "./store.js";
import { FooterButton } from "./components/FooterButton.js";
import { HistoryModal } from "./components/HistoryModal.js";
import { LauncherModal } from "./components/LauncherModal.js";
import { SettingsPage } from "./components/SettingsPage.js";
import { t } from "./i18n.js";
export function createPlugin() {
    return {
        name: 'dsh-jenkins',
        inject: ['slots', 'remote', 'remote.commands', 'timer'],
        apply(ctx) {
            const run = makeRun(ctx);
            const { store: launchStore, useLaunch } = makeLaunchStore();
            const { store: historyStore, useLaunch: useHistoryLaunch } = makeHistoryStore();
            const slots = ctx.get('slots');
            if (slots === undefined)
                return;
            injectStyles();
            // ─── 侧边栏底部入口：当前工作区有 dsh-Jenkins 配置才显示 ──────────
            slots.inject('sidebar.footer.action', () => slots.register({ name: 'sidebar.footer.action', id: 'dsh-jenkins', order: 10 }, (props) => (_jsx(FooterButton, { run: run, launchStore: launchStore, historyStore: historyStore, wide: props.wide, useWorkspaces: props.useWorkspaces, useSessions: props.useSessions }))));
            // ─── 设置 → Jenkins 配置页：服务器管理 ─────────────────────
            slots.inject('settings.section', () => slots.register({ name: 'settings.section', id: 'dsh-jenkins', order: 25, label: () => t('settingsNav') }, (props) => {
                let sessionId = '';
                const useSessions = props.useSessions;
                if (useSessions) {
                    const current = useSessions((state) => state && state.current);
                    if (typeof current === 'string')
                        sessionId = current;
                }
                return _jsx(SettingsPage, { run: run, sessionId: sessionId });
            }));
            // ─── 执行 Jenkins Job 弹框 ─────────────────────────────────
            slots.inject('shell.overlay', () => slots.register({ name: 'shell.overlay', id: 'dsh-jenkins-launcher', order: 100 }, () => (_jsx(LauncherModal, { run: run, launchStore: launchStore, historyStore: historyStore, interval: (cb, ms) => ctx.interval(cb, ms), useLaunch: useLaunch }))));
            // ─── 发布历史弹框 ───────────────────────────────────────────
            slots.inject('shell.overlay', () => slots.register({ name: 'shell.overlay', id: 'dsh-jenkins-history', order: 110 }, (props) => (_jsx(HistoryModal, { historyStore: historyStore, useLaunch: useHistoryLaunch, useWorkspaces: props.useWorkspaces }))));
        },
    };
}
