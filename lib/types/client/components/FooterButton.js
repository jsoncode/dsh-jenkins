import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 侧边栏底部入口（sidebar.footer.action）：
 * 常驻的「Jenkins 配置」按钮（位于 dsh 配置按钮上方的 footer.action 区），
 * 点击打开统一弹框（发布 / 配置 / 历史 三个 tab）。不再按工作区配置门控 ——
 * 服务器配置入口本就应随时可达。
 */
import { t } from "../i18n.js";
import { JENKINS_LOGO } from "../logo.js";
export function FooterButton({ onOpen, reportSession, wide = false, useSessions }) {
    const currentSessionId = useSessions
        ? useSessions((s) => s && s.current)
        : null;
    if (reportSession && currentSessionId)
        reportSession(currentSessionId);
    return (_jsx("div", { className: 'dshj-footer-group' + (wide ? '' : ' dshj-footer-rail-group'), children: _jsxs("button", { type: "button", className: 'dshj-footer-btn' + (wide ? '' : ' dshj-footer-btn-rail'), title: t('configBtn'), "aria-label": t('configBtn'), onClick: onOpen, children: [_jsx("img", { src: JENKINS_LOGO, alt: "", className: "dshj-footer-logo" }), wide ? _jsx("span", { className: "dshj-footer-label", children: t('configBtn') }) : null] }) }));
}
