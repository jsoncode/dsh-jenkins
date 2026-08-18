import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 配置模板内联区（js / ts / json Tab，置于表单上方）。
 */
import { useState } from 'react';
import { t } from "../i18n.js";
import { TEMPLATES } from "../templates.js";
/** 剪贴板兜底（execCommand 已废弃但仍是最后的降级路径）。 */
function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
    }
    catch { /* ignore */ }
    document.body.removeChild(ta);
    done();
}
export function TemplateSection() {
    const [active, setActive] = useState('json');
    const [copied, setCopied] = useState(false);
    const tabs = ['json', 'js', 'ts'];
    const code = TEMPLATES[active] || '';
    const doCopy = () => {
        const done = () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        };
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(done).catch(() => fallbackCopy(code, done));
        }
        else {
            fallbackCopy(code, done);
        }
    };
    return (_jsxs("div", { className: "dshj-template", children: [_jsxs("div", { className: "dshj-template-head", children: [_jsx("div", { className: "dshj-template-title", children: t('templateTitle') }), _jsx("div", { className: "dshj-template-tabs", role: "tablist", children: tabs.map((tab) => (_jsx("button", { type: "button", role: "tab", className: 'dshj-tab' + (tab === active ? ' dshj-tab-active' : ''), "aria-selected": tab === active, onClick: () => { setActive(tab); setCopied(false); }, children: tab }, tab))) })] }), _jsx("div", { className: "dshj-hint", children: t('templateHint') }), _jsxs("div", { className: "dshj-code-head", children: [_jsx("span", { className: "dshj-code-file", children: 'dsh-jenkins.' + active }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: doCopy, children: copied ? t('copied') : t('copy') })] }), _jsx("pre", { className: "dshj-code", children: code })] }));
}
