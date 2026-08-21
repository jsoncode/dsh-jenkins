import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 设置 → Jenkins 配置页：服务器管理（settings.section）。
 * 新增 / 编辑服务器在独立弹框（ServerEditorModal）中操作，本页只负责列表与增删入口。
 */
import { useEffect, useState } from 'react';
import { t, tErr } from "../i18n.js";
import { ServerEditorModal } from "./ServerEditorModal.js";
import { TemplateModal } from "./TemplateModal.js";
export function SettingsPage({ run, sessionId, onCountChange }) {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editor, setEditor] = useState({ open: false, server: null });
    const [testResults, setTestResults] = useState({}); // 每台服务器的测试结果（显示在卡片名称后）
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [templateOpen, setTemplateOpen] = useState(false);
    const load = () => {
        setLoading(true);
        run(sessionId, { op: 'list' }).then((r) => {
            if (r && r.ok) {
                const list = r.servers || [];
                setServers(list);
                if (onCountChange)
                    onCountChange(list.length);
            }
        }).catch(() => { }).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);
    const openAdd = () => {
        setEditor({ open: true, server: null });
    };
    const openEdit = (s) => {
        setEditor({ open: true, server: s });
    };
    const closeEditor = () => setEditor({ open: false, server: null });
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
        // 测试结果持久化在服务器配置（host 端 verified 字段）；此处同步本地状态即时反馈
        const applyVerified = (ok) => {
            setServers((prev) => prev.map((x) => (x.id === s.id ? { ...x, verified: ok } : x)));
        };
        run(sessionId, { op: 'test', server: { id: s.id } })
            .then((r) => {
            const ok = !!(r && r.ok);
            applyVerified(ok);
            setTestResults((prev) => ({ ...prev, [s.id]: ok
                    ? { ok: true, text: t('connected') + (r.version ? '（Jenkins ' + r.version + '）' : '') }
                    : { ok: false, text: t('connectionFailed') + tErr(r, t('testFailed')) } }));
        })
            .catch((e) => {
            applyVerified(false);
            setTestResults((prev) => ({ ...prev, [s.id]: { ok: false, text: t('connectionFailed') + (e instanceof Error ? e.message : String(e)) } }));
        });
    };
    return (_jsxs("div", { className: "dshj-settings", children: [_jsxs("div", { className: "dshj-head", children: [_jsx("div", { className: "dshj-title", children: t('settingsTitle') }), _jsxs("div", { className: "dshj-head-ops", children: [_jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", title: t('addServer'), onClick: openAdd, children: t('addServer') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", title: t('projectConfigBtn'), onClick: () => setTemplateOpen(true), children: t('projectConfigBtn') })] })] }), templateOpen ? _jsx(TemplateModal, { onClose: () => setTemplateOpen(false) }) : null, editor.open ? (_jsx(ServerEditorModal, { run: run, sessionId: sessionId, server: editor.server, onSaved: () => load(), onClose: closeEditor })) : null, loading ? _jsx("div", { className: "dshj-empty", children: t('loading') })
                : servers.length === 0 ? (_jsxs("div", { className: "dshj-empty", children: [_jsx("div", { children: t('serverEmpty') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: openAdd, style: { marginTop: 10 }, children: t('addServer') })] })) : (_jsx("div", { className: "dshj-list", children: servers.map((s) => {
                        // 名称后的连接状态：优先显示本次会话的测试结果（成功绿/失败红），
                        // 无测试结果但有持久化 verified 时显示「连接成功」；其余不显示。
                        const tr = testResults[s.id];
                        const statusText = tr ? tr.text : (s.verified ? t('connected') : '');
                        const statusOk = tr ? tr.ok : s.verified;
                        return (_jsxs("div", { className: "dshj-card", children: [_jsxs("div", { className: "dshj-card-main", children: [_jsxs("div", { className: "dshj-card-name-row", children: [_jsx("span", { className: "dshj-card-name", children: s.name }), statusText ? (_jsx("span", { className: 'dshj-card-test ' + (statusOk ? 'dshj-ok' : 'dshj-err'), children: statusText })) : null] }), _jsx("div", { className: "dshj-card-meta", children: s.baseUrl + '  ·  ' + s.username + '  ·  ' + (s.tokenMasked || '') })] }), _jsxs("div", { className: "dshj-card-ops", children: [_jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: () => doTestSaved(s), children: t('testBtn') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: () => openEdit(s), children: t('editBtn') }), _jsx("button", { type: "button", className: 'dshj-btn dshj-btn-small dshj-btn-danger' + (confirmDeleteId === s.id ? ' dshj-btn-solid' : ''), onClick: () => doDelete(s.id), children: confirmDeleteId === s.id ? t('confirmDelete') : t('deleteBtn') })] })] }, s.id));
                    }) }))] }));
}
