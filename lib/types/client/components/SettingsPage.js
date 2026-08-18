import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 设置 → Jenkins 配置页：服务器管理（settings.section）。
 */
import { useEffect, useState } from 'react';
import { t, tErr } from "../i18n.js";
import { TemplateSection } from "./TemplateSection.js";
import { SvgPlus } from "./SvgIcons.js";
export function SettingsPage({ run, sessionId }) {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [busy, setBusy] = useState(false);
    const [formError, setFormError] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [templateOpen, setTemplateOpen] = useState(false);
    const load = () => {
        setLoading(true);
        run(sessionId, { op: 'list' }).then((r) => {
            if (r && r.ok)
                setServers(r.servers || []);
        }).catch(() => { }).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);
    // 空列表时自动显示“添加服务器”表单，无需空态提示。
    const EMPTY_DRAFT = { isNew: true, id: null, name: '', baseUrl: '', username: '', token: '', masked: '', insecure: false };
    const draft = editing || EMPTY_DRAFT;
    const startAdd = () => {
        setEditing({ ...EMPTY_DRAFT });
        setFormError('');
        setTestResult(null);
    };
    const startEdit = (s) => {
        setEditing({ isNew: false, id: s.id, name: s.name, baseUrl: s.baseUrl, username: s.username, token: '', masked: s.tokenMasked || '', insecure: !!s.insecure });
        setFormError('');
        setTestResult(null);
    };
    const setField = (k) => (e) => setEditing((prev) => ({ ...(prev || EMPTY_DRAFT), [k]: e.target.value }));
    const setInsecure = (e) => setEditing((prev) => ({ ...(prev || EMPTY_DRAFT), insecure: e.target.checked }));
    const doTest = () => {
        setBusy(true);
        setTestResult(null);
        run(sessionId, { op: 'test', server: { id: draft.id, name: draft.name, baseUrl: draft.baseUrl, username: draft.username, token: draft.token, insecure: !!draft.insecure } })
            .then((r) => setTestResult(r && r.ok
            ? { ok: true, text: t('connected') + (r.version ? '（Jenkins ' + r.version + '）' : '') }
            : { ok: false, text: tErr(r, t('testFailed')) }))
            .catch((e) => setTestResult({ ok: false, text: e instanceof Error ? e.message : String(e) }))
            .finally(() => setBusy(false));
    };
    const doSave = () => {
        setBusy(true);
        setFormError('');
        run(sessionId, { op: 'save', server: { id: draft.id, name: draft.name, baseUrl: draft.baseUrl, username: draft.username, token: draft.token, insecure: !!draft.insecure } })
            .then((r) => {
            if (r && r.ok) {
                setEditing(null);
                load();
            }
            else
                setFormError(tErr(r, t('saveFailed')));
        })
            .catch((e) => setFormError(e instanceof Error ? e.message : String(e)))
            .finally(() => setBusy(false));
    };
    const doDelete = (id) => {
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id);
            return;
        }
        setConfirmDeleteId(null);
        run(sessionId, { op: 'delete', id }).then((r) => { if (r && r.ok)
            load(); });
    };
    const doTestSaved = (s) => {
        setTestResult(null);
        run(sessionId, { op: 'test', server: { id: s.id } })
            .then((r) => setTestResult(r && r.ok
            ? { ok: true, text: t('connected') + '：' + s.name + (r.version ? '（Jenkins ' + r.version + '）' : '') }
            : { ok: false, text: t('connectionFailed') + s.name + '：' + tErr(r, t('testFailed')) }))
            .catch((e) => setTestResult({ ok: false, text: t('connectionFailed') + s.name + '：' + (e instanceof Error ? e.message : String(e)) }));
    };
    return (_jsxs("div", { className: "dshj-settings", children: [_jsx("div", { className: "dshj-head", children: _jsxs("div", { className: "dshj-title-row", children: [_jsx("div", { className: "dshj-title", children: t('settingsTitle') }), _jsx("button", { type: "button", className: "dshj-btn-icon", title: t('addServer'), "aria-label": t('addServer'), onClick: startAdd, children: _jsx(SvgPlus, { size: 16 }) }), _jsx("button", { type: "button", className: 'dshj-btn dshj-btn-small' + (templateOpen ? ' dshj-btn-active' : ''), onClick: () => setTemplateOpen((v) => !v), children: t('templateBtn') })] }) }), testResult ? _jsx("div", { className: 'dshj-result ' + (testResult.ok ? 'dshj-ok' : 'dshj-err'), children: testResult.text }) : null, templateOpen ? _jsx(TemplateSection, {}) : null, (editing || servers.length === 0) && !loading ? (_jsxs("div", { className: "dshj-editor", children: [_jsx("div", { className: "dshj-editor-title", children: draft.isNew ? t('addTitle') : t('editTitle') }), _jsxs("div", { className: "dshj-field", children: [_jsx("label", { children: t('nameLabel') }), _jsx("input", { className: "dshj-input", value: draft.name, onChange: setField('name'), placeholder: t('namePlaceholder') })] }), _jsxs("div", { className: "dshj-field", children: [_jsxs("label", { children: [t('urlLabel'), _jsx("span", { className: "dshj-req", children: "*" })] }), _jsx("input", { className: "dshj-input", value: draft.baseUrl, onChange: setField('baseUrl'), placeholder: t('urlPlaceholder') })] }), _jsxs("div", { className: "dshj-field", children: [_jsx("label", { children: t('usernameLabel') }), _jsx("input", { className: "dshj-input", value: draft.username, onChange: setField('username'), placeholder: t('usernamePlaceholder') })] }), _jsxs("div", { className: "dshj-field", children: [_jsxs("label", { children: [t('tokenLabel'), _jsx("span", { className: "dshj-req", children: "*" }), draft.isNew ? '' : t('keepToken')] }), _jsx("input", { type: "password", className: "dshj-input", value: draft.token, onChange: setField('token'), placeholder: draft.isNew ? t('tokenPlaceholder') : (t('tokenSaved') + (draft.masked || '••••')), autoComplete: "off" })] }), _jsx("div", { className: "dshj-field", children: _jsxs("label", { className: "dshj-check", children: [_jsx("input", { type: "checkbox", checked: !!draft.insecure, onChange: setInsecure }), _jsx("span", { children: t('tlsLabel') })] }) }), formError ? _jsx("div", { className: "dshj-err", children: formError }) : null, _jsxs("div", { className: "dshj-editor-ops", children: [_jsx("button", { type: "button", className: "dshj-btn", disabled: busy, onClick: doTest, children: busy ? t('testing') : t('testBtn') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-primary", disabled: busy, onClick: doSave, children: t('saveBtn') }), _jsx("button", { type: "button", className: "dshj-btn", disabled: busy, onClick: () => setEditing(null), children: t('cancelBtn') })] })] })) : null, loading ? _jsx("div", { className: "dshj-empty", children: t('loading') })
                : servers.length === 0 ? null
                    : (_jsx("div", { className: "dshj-list", children: servers.map((s) => (_jsxs("div", { className: "dshj-card", children: [_jsxs("div", { className: "dshj-card-main", children: [_jsx("div", { className: "dshj-card-name", children: s.name }), _jsx("div", { className: "dshj-card-meta", children: s.baseUrl + '  ·  ' + s.username + '  ·  ' + (s.tokenMasked || '') })] }), _jsxs("div", { className: "dshj-card-ops", children: [_jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: () => doTestSaved(s), children: t('testBtn') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: () => startEdit(s), children: t('editBtn') }), _jsx("button", { type: "button", className: 'dshj-btn dshj-btn-small' + (confirmDeleteId === s.id ? ' dshj-btn-danger' : ''), onClick: () => doDelete(s.id), children: confirmDeleteId === s.id ? t('confirmDelete') : t('deleteBtn') })] })] }, s.id))) }))] }));
}
