import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 侧边栏底部入口（sidebar.footer.action）：
 * 当前工作区根目录存在 dsh-Jenkins 配置时显示，点击打开「执行 Jenkins Job」弹框。
 */
import { useEffect, useMemo, useState } from 'react';
import { t } from "../i18n.js";
import { JENKINS_LOGO } from "../logo.js";
import { SvgClock } from "./SvgIcons.js";
export function FooterButton({ run, launchStore, historyStore, wide = false, useWorkspaces, useSessions }) {
    const workspaceItems = useWorkspaces
        ? useWorkspaces((s) => (s && s.items) || [])
        : [];
    const currentSessionId = useSessions
        ? useSessions((s) => s && s.current)
        : null;
    if (!useWorkspaces || !useSessions) {
        console.warn('[dsh-jenkins] footer slot missing standard props', { hasWs: !!useWorkspaces, hasSs: !!useSessions });
    }
    const [launch, setLaunch] = useState(null);
    // 只有「新数组格式」的配置（entries 非空）才显示入口；旧格式/无效配置一律视为未配置。
    // 防御旧宿主返回旧结构（{job, server, environments}）导致入口误显示。
    const isDeployTargets = (cfg) => !!(cfg && Array.isArray(cfg.entries) && cfg.entries.length > 0);
    const cwd = useMemo(() => {
        const list = Array.isArray(workspaceItems) ? workspaceItems : [];
        const current = list.find((w) => Array.isArray(w.sessionIds) && w.sessionIds.indexOf(currentSessionId) !== -1);
        return (current && current.path) || (list.length ? list[0].path : null);
    }, [workspaceItems, currentSessionId]);
    useEffect(() => {
        let alive = true;
        setLaunch(null);
        if (!cwd)
            return;
        console.log('[dsh-jenkins] footer check cwd=', cwd, 'session=', currentSessionId, 'workspaces=', (workspaceItems || []).map((w) => w.path));
        run(currentSessionId || '', { op: 'workspaceConfig', cwd }).then((r) => {
            if (!alive)
                return;
            console.log('[dsh-jenkins] workspaceConfig result', r);
            // 仅配置存在、且为新数组格式才显示入口；配置缺失 / 旧格式 / 无效均视为未配置
            if (r && r.ok && r.found && isDeployTargets(r.config))
                setLaunch({ cwd, config: r.config, sessionId: currentSessionId || '' });
        }).catch((e) => {
            console.error('[dsh-jenkins] workspaceConfig failed', cwd, e);
        });
        return () => { alive = false; };
    }, [cwd, currentSessionId]);
    if (!launch)
        return null;
    const firstJob = (launch.config && Array.isArray(launch.config.entries) && launch.config.entries[0] && launch.config.entries[0].job) || '';
    return (_jsx(_Fragment, { children: _jsxs("div", { className: 'dshj-footer-group' + (wide ? '' : ' dshj-footer-rail-group'), children: [_jsxs("button", { type: "button", className: 'dshj-footer-btn' + (wide ? '' : ' dshj-footer-btn-rail'), title: t('runJob') + '（' + firstJob + ' · ' + launch.cwd + '）', "aria-label": t('runJob'), onClick: () => launchStore.open(launch), children: [_jsx("img", { src: JENKINS_LOGO, alt: "", className: "dshj-footer-logo" }), wide ? _jsx("span", { className: "dshj-footer-label", children: "Jenkins" }) : null] }), _jsxs("button", { type: "button", className: 'dshj-footer-btn' + (wide ? '' : ' dshj-footer-btn-rail'), title: t('historyBtn'), "aria-label": t('historyBtn'), onClick: () => historyStore.open(launch.cwd), children: [_jsx(SvgClock, { size: wide ? 16 : 18 }), wide ? _jsx("span", { className: "dshj-footer-label", children: t('historyBtn') }) : null] })] }) }));
}
