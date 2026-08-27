import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 配置模板内容区（json / js / ts Tab），供「项目配置」弹框展示。
 * 「保存到工作区」：把当前格式模板写入「项目下拉框选中」的工作区根目录
 * （host op saveTemplate）；默认选中当前工作区，可切换到任意已打开的项目，
 * 避免在多项目场景下存错位置。目标文件已存在时先弹确认，确认后才覆盖。
 */
import { useState } from 'react';
import { t, tErr } from "../i18n.js";
import { TEMPLATES } from "../templates.js";
import { InlineSelect } from "./InlineSelect.js";
import { ModalPortal } from "./ModalPortal.js";
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
export function TemplateSection({ run, sessionId, cwd, workspaces }) {
    const [active, setActive] = useState('json');
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false); // 保存中（按钮转禁用）
    const [saved, setSaved] = useState(false); // 保存成功提示（1.8s 后复原）
    const [saveError, setSaveError] = useState('');
    const [confirmOverwrite, setConfirmOverwrite] = useState(false); // 目标文件已存在，待确认覆盖
    // 目标项目候选：工作区列表去重；当前工作区不在列表中时补为首项（保证原行为可达）。
    const projects = (() => {
        const base = [...new Set((Array.isArray(workspaces) ? workspaces : [])
                .filter((p) => typeof p === 'string' && p !== ''))];
        if (cwd && base.indexOf(cwd) === -1)
            return [cwd].concat(base);
        return base.length ? base : (cwd ? [cwd] : []);
    })();
    const [target, setTarget] = useState(() => {
        if (cwd && projects.indexOf(cwd) !== -1)
            return cwd;
        return projects.length ? projects[0] : '';
    });
    const tabs = ['json', 'js', 'ts'];
    const code = TEMPLATES[active] || '';
    const filename = 'dsh-jenkins.' + active;
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
    // 保存模板到选中项目的工作区根目录：overwrite=false 时若文件已存在返回 existed，
    // 由用户确认后再覆盖。
    const doSave = async (overwrite) => {
        if (!target || saving)
            return;
        setSaving(true);
        setSaveError('');
        setSaved(false);
        try {
            const res = await run(sessionId, { op: 'saveTemplate', cwd: target, filename, content: code, overwrite });
            if (res && res.ok) {
                if (res.existed === true && !overwrite) {
                    setConfirmOverwrite(true); // 已存在：先确认再覆盖
                }
                else {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 1800);
                }
            }
            else {
                setSaveError(tErr(res, t('saveFailed')));
            }
        }
        catch (e) {
            setSaveError(e instanceof Error ? e.message : String(e));
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "dshj-template", children: [_jsxs("div", { className: "dshj-template-head", children: [_jsx("div", { className: "dshj-template-title", children: t('templateTitle') }), _jsx("div", { className: "dshj-template-tabs", role: "tablist", children: tabs.map((tab) => (_jsx("button", { type: "button", role: "tab", className: 'dshj-tab' + (tab === active ? ' dshj-tab-active' : ''), "aria-selected": tab === active, onClick: () => { setActive(tab); setCopied(false); setSaved(false); setSaveError(''); }, children: tab }, tab))) })] }), _jsxs("div", { className: "dshj-template-project", children: [_jsx("label", { children: t('projectField') }), _jsx(InlineSelect, { value: target, placeholder: projects.length === 0 ? t('noWorkspacesHint') : t('projectPlaceholder'), searchPlaceholder: t('pickerSearchPlaceholder'), options: projects.map((p) => ({ id: p, label: p })), disabled: projects.length === 0, onChange: (id) => setTarget(id) })] }), _jsx("div", { className: "dshj-hint", children: t('templateHint') }), saveError ? _jsx("div", { className: "dshj-err", style: { margin: '0 0 8px' }, children: saveError }) : null, _jsxs("div", { className: "dshj-code-head", children: [_jsx("span", { className: "dshj-code-file", children: filename }), _jsxs("div", { className: "dshj-code-ops", children: [_jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: doCopy, children: copied ? t('copied') : t('copy') }), _jsx("button", { type: "button", className: 'dshj-btn dshj-btn-small' + (saved ? ' dshj-btn-success' : ' dshj-btn-primary'), disabled: !target || saving, title: target ? (t('saveToWorkspace') + ' → ' + target) : t('noWorkspaceHint'), onClick: () => void doSave(false), children: saving ? t('savingToWorkspace') : saved ? t('savedToWorkspace') : t('saveToWorkspace') })] })] }), _jsx("pre", { className: "dshj-code", children: code }), confirmOverwrite ? (_jsxs(ModalPortal, { backdropClass: "dshj-json-backdrop dshj-confirm-backdrop", modalClass: "dshj-confirm-modal", onBackdropClose: () => setConfirmOverwrite(false), children: [_jsxs("div", { className: "dshj-modal-header", children: [_jsxs("div", { children: [_jsx("div", { className: "dshj-modal-title", children: t('overwriteConfirmTitle') }), _jsxs("div", { className: "dshj-modal-sub", children: [filename, target ? ' → ' + target : ''] })] }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), title: t('close'), onClick: () => setConfirmOverwrite(false), children: "\u2715" })] }), _jsx("div", { className: "dshj-modal-body", children: _jsx("div", { className: "dshj-empty", children: t('overwriteConfirm', { name: filename }) }) }), _jsxs("div", { className: "dshj-modal-footer", children: [_jsx("button", { type: "button", className: "dshj-btn", onClick: () => setConfirmOverwrite(false), children: t('cancelBtn') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-solid", disabled: saving, onClick: () => { setConfirmOverwrite(false); void doSave(true); }, children: t('overwriteBtn') })] })] })) : null] }));
}
