import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 设置 → 「配置」tab：服务器管理 + 项目配置入口。
 *
 * 版面刻意保持轻量：
 * - **服务器**：列表 + 增删改（编辑在 ServerEditorModal 弹框里）+「配置模板」按钮；
 * - **项目配置**：一行摘要（`dsh-jenkins-map.json · N 个项目`），编辑集中在
 *   ProjectMapModal 弹框里 —— 内容大多由各工作区根目录的 dsh-jenkins.{json,js,ts}
 *   自动发现合并而来，通常无需手工维护。
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { t, tErr } from "../i18n.js";
import { projectOpError, sanitizeProjects } from "../projects.js";
import { ProjectMapModal } from "./ProjectMapModal.js";
import { ServerEditorModal } from "./ServerEditorModal.js";
import { TemplateModal } from "./TemplateModal.js";
import { ShowInMenuToggle } from "./ShowInMenuToggle.js";
export function SettingsPage({ run, sessionId, cwd, workspaceItems, onCountChange }) {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editor, setEditor] = useState({ open: false, server: null });
    const [testResults, setTestResults] = useState({}); // 每台服务器的测试结果（显示在卡片名称后）
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [templateOpen, setTemplateOpen] = useState(false);
    // 集中式项目配置（dsh-jenkins-map.json）：列表只显示一行摘要，编辑在弹框里
    const [projectMap, setProjectMap] = useState({});
    const [mapPath, setMapPath] = useState('');
    const [mapError, setMapError] = useState('');
    const [mapOpen, setMapOpen] = useState(false);
    // 工作区路径（去空去重）：作为「发现式配置」的扫描范围
    const workspaces = useMemo(() => [...new Set((Array.isArray(workspaceItems) ? workspaceItems : [])
            .map((w) => (w && typeof w.path === 'string' ? w.path : ''))
            .filter((p) => p !== ''))], [workspaceItems]);
    const workspacesKey = workspaces.join('\n');
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
    // 读取项目配置：宿主顺带把已打开工作区里新出现的 dsh-jenkins 配置发现进来（只补缺失）
    const loadMap = useCallback(() => {
        const cwds = workspacesKey ? workspacesKey.split('\n') : [];
        run(sessionId, { op: 'mapLoad', cwds }).then((r) => {
            if (r && r.ok) {
                setProjectMap(sanitizeProjects(r.map));
                setMapPath(String(r.path || ''));
                setMapError('');
            }
            else {
                setMapError(projectOpError(r, t('loading')));
            }
        }).catch((e) => setMapError(e instanceof Error ? e.message : String(e)));
    }, [run, sessionId, workspacesKey]);
    useEffect(() => { loadMap(); }, [loadMap]);
    const projectNames = Object.keys(projectMap);
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
    return (_jsxs("div", { className: "dshj-settings", children: [_jsx(ShowInMenuToggle, {}), _jsxs("div", { className: "dshj-head", children: [_jsx("div", { className: "dshj-title", children: t('settingsTitle') }), _jsxs("div", { className: "dshj-head-ops", children: [_jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", title: t('addServer'), onClick: openAdd, children: t('addServer') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", title: t('projectConfigBtn'), onClick: () => setTemplateOpen(true), children: t('projectConfigBtn') })] })] }), templateOpen ? (_jsx(TemplateModal, { run: run, sessionId: sessionId, cwd: cwd || '', workspaces: workspaces, onClose: () => setTemplateOpen(false) })) : null, editor.open ? (_jsx(ServerEditorModal, { run: run, sessionId: sessionId, server: editor.server, onSaved: () => load(), onClose: closeEditor })) : null, mapOpen ? (_jsx(ProjectMapModal, { run: run, sessionId: sessionId, servers: servers, workspaces: workspaces, mapPath: mapPath, initial: projectMap, onSaved: (next) => { setProjectMap(next); setMapError(''); }, onClose: () => setMapOpen(false) })) : null, loading ? _jsx("div", { className: "dshj-empty", children: t('loading') })
                : servers.length === 0 ? (_jsxs("div", { className: "dshj-empty", children: [_jsx("div", { children: t('serverEmpty') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: openAdd, style: { marginTop: 10 }, children: t('addServer') })] })) : (_jsx("div", { className: "dshj-list", children: servers.map((s) => {
                        // 名称后的连接状态：优先显示本次会话的测试结果（成功绿/失败红），
                        // 无测试结果但有持久化 verified 时显示「连接成功」；其余不显示。
                        const tr = testResults[s.id];
                        const statusText = tr ? tr.text : (s.verified ? t('connected') : '');
                        const statusOk = tr ? tr.ok : s.verified;
                        return (_jsxs("div", { className: "dshj-card", children: [_jsxs("div", { className: "dshj-card-main", children: [_jsxs("div", { className: "dshj-card-name-row", children: [_jsx("span", { className: "dshj-card-name", children: s.name }), statusText ? (_jsx("span", { className: 'dshj-card-test ' + (statusOk ? 'dshj-ok' : 'dshj-err'), children: statusText })) : null] }), _jsx("div", { className: "dshj-card-meta", children: s.baseUrl + '  ·  ' + s.username + '  ·  ' + (s.tokenMasked || '') })] }), _jsxs("div", { className: "dshj-card-ops", children: [_jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: () => doTestSaved(s), children: t('testBtn') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: () => openEdit(s), children: t('editBtn') }), _jsx("button", { type: "button", className: 'dshj-btn dshj-btn-small dshj-btn-danger' + (confirmDeleteId === s.id ? ' dshj-btn-solid' : ''), onClick: () => doDelete(s.id), children: confirmDeleteId === s.id ? t('confirmDelete') : t('deleteBtn') })] })] }, s.id));
                    }) })), _jsx("div", { className: "dshj-divider" }), _jsxs("div", { className: "dshj-maprow", title: t('projectsHint'), children: [_jsxs("div", { className: "dshj-maprow-main", children: [_jsx("div", { className: "dshj-title", children: t('projectsTitle') }), _jsx("div", { className: "dshj-maprow-meta", children: 'dsh-jenkins-map.json · ' + t('projectCount', { n: projectNames.length }) })] }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: () => setMapOpen(true), children: t('editMap') })] }), mapError ? _jsx("div", { className: "dshj-err", children: mapError }) : null] }));
}
