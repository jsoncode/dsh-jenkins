import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 「编辑 Jenkins 服务器」弹框：新增 / 编辑服务器共用同一表单，
 * 在独立弹框中完成填写、测试连接与保存（点击蒙版不关闭，避免误触丢失输入）。
 */
import { useState } from 'react';
import { t, tErr } from "../i18n.js";
const EMPTY_DRAFT = { isNew: true, id: null, name: '', baseUrl: '', username: '', token: '', masked: '', insecure: false };
export function ServerEditorModal({ run, sessionId, server, onSaved, onClose }) {
    const isNew = !server;
    const [draft, setDraft] = useState(() => server
        ? { isNew: false, id: server.id, name: server.name, baseUrl: server.baseUrl, username: server.username, token: '', masked: server.tokenMasked || '', insecure: !!server.insecure }
        : { ...EMPTY_DRAFT });
    const [busy, setBusy] = useState(false);
    const [formError, setFormError] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [testedOk, setTestedOk] = useState(false); // 本次表单测试通过；字段修改后失效
    const setField = (k) => (e) => {
        setTestedOk(false);
        setDraft((prev) => ({ ...prev, [k]: e.target.value }));
    };
    const setInsecure = (e) => {
        setTestedOk(false);
        setDraft((prev) => ({ ...prev, insecure: e.target.checked }));
    };
    const doTest = () => {
        setBusy(true);
        setTestResult(null);
        run(sessionId, { op: 'test', server: { id: draft.id, name: draft.name, baseUrl: draft.baseUrl, username: draft.username, token: draft.token, insecure: !!draft.insecure } })
            .then((r) => {
            const ok = !!(r && r.ok);
            setTestedOk(ok);
            setTestResult(ok
                ? { ok: true, text: t('connected') + (r.version ? '（Jenkins ' + r.version + '）' : '') }
                : { ok: false, text: tErr(r, t('testFailed')) });
        })
            .catch((e) => {
            setTestedOk(false);
            setTestResult({ ok: false, text: e instanceof Error ? e.message : String(e) });
        })
            .finally(() => setBusy(false));
    };
    const doSave = () => {
        if (!draft.username.trim()) {
            setFormError(tErr({ code: 'username-required' }, t('saveFailed')));
            return;
        }
        setBusy(true);
        setFormError('');
        run(sessionId, { op: 'save', server: { id: draft.id, name: draft.name, baseUrl: draft.baseUrl, username: draft.username, token: draft.token, insecure: !!draft.insecure } })
            .then((r) => {
            if (r && r.ok) {
                if (onSaved)
                    onSaved(draft.id);
                onClose();
            }
            else
                setFormError(tErr(r, t('saveFailed')));
        })
            .catch((e) => setFormError(e instanceof Error ? e.message : String(e)))
            .finally(() => setBusy(false));
    };
    // 已填写有效地址时，提供跳转 Jenkins 个人安全页创建 Token 的入口（用户名缺省用 admin）
    const tokenBase = draft.baseUrl.trim().replace(/\/+$/, '');
    const canCreateToken = /^https?:\/\//i.test(tokenBase);
    const tokenUrl = canCreateToken
        ? tokenBase + '/user/' + encodeURIComponent((draft.username || '').trim() || 'admin') + '/security/'
        : '';
    return (_jsx("div", { className: "dshj-backdrop dshj-json-backdrop", onClick: onClose, children: _jsxs("div", { className: "dshj-modal dshj-server-modal", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "dshj-modal-header", children: [_jsx("div", { children: _jsx("div", { className: "dshj-modal-title", children: isNew ? t('addTitle') : t('editTitle') }) }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), title: t('close'), onClick: onClose, children: "\u2715" })] }), _jsxs("div", { className: "dshj-modal-body", children: [_jsxs("div", { className: "dshj-field", children: [_jsx("label", { children: t('nameLabel') }), _jsx("input", { className: "dshj-input", value: draft.name, onChange: setField('name'), placeholder: t('namePlaceholder') })] }), _jsxs("div", { className: "dshj-field", children: [_jsxs("label", { children: [t('urlLabel'), _jsx("span", { className: "dshj-req", children: "*" })] }), _jsx("input", { className: "dshj-input", value: draft.baseUrl, onChange: setField('baseUrl'), placeholder: t('urlPlaceholder') })] }), _jsxs("div", { className: "dshj-field", children: [_jsxs("label", { children: [t('usernameLabel'), _jsx("span", { className: "dshj-req", children: "*" })] }), _jsx("input", { className: "dshj-input", value: draft.username, onChange: setField('username'), placeholder: t('usernamePlaceholder') })] }), _jsxs("div", { className: "dshj-field", children: [_jsxs("label", { className: "dshj-label-row", children: [_jsxs("span", { children: [t('tokenLabel'), _jsx("span", { className: "dshj-req", children: "*" }), draft.isNew ? '' : t('keepToken')] }), canCreateToken ? (_jsxs("a", { className: "dshj-link-btn", href: tokenUrl, target: "_blank", rel: "noopener noreferrer", title: tokenUrl, children: [t('createToken'), " \u2197"] })) : null] }), _jsx("input", { type: "password", className: "dshj-input", value: draft.token, onChange: setField('token'), placeholder: draft.isNew ? t('tokenPlaceholder') : (t('tokenSaved') + (draft.masked || '••••')), autoComplete: "off" })] }), _jsx("div", { className: "dshj-field", children: _jsxs("label", { className: "dshj-check", children: [_jsx("input", { type: "checkbox", checked: !!draft.insecure, onChange: setInsecure }), _jsx("span", { children: t('tlsLabel') })] }) }), formError ? _jsx("div", { className: "dshj-err", children: formError }) : null, testResult ? _jsx("div", { className: 'dshj-result ' + (testResult.ok ? 'dshj-ok' : 'dshj-err'), children: testResult.text }) : null] }), _jsxs("div", { className: "dshj-modal-footer", children: [_jsx("button", { type: "button", className: 'dshj-btn' + (testedOk ? ' dshj-btn-success' : ''), disabled: busy, onClick: doTest, children: busy ? t('testing') : t('testBtn') }), _jsx("button", { type: "button", className: "dshj-btn", disabled: busy, onClick: onClose, children: t('cancelBtn') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-primary", disabled: busy, onClick: doSave, children: t('saveBtn') })] })] }) }));
}
