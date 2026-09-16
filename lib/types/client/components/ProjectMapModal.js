import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 项目配置弹框：集中式 map（`$DSH_HOME/dsh-jenkins-map.json`）的唯一编辑入口。
 *
 * 两个 tab：
 * - **表单**：项目紧凑列表（项目名 + 每个环境一行：环境名 / Job / 服务器 / 参数），
 *   - 环境**数量不限**（不再假定只有 UAT / 生产两项），每行可单独删除；
 *   - 环境名（`name`）选填，留空按下标回退 UAT / 生产 / 环境 N，发布时用于服务器下拉标签；
 *   - 环境参数收在「N 项参数」里点开才展开 —— 默认视图保持轻量。
 * - **JSON**：整个 map 的 JSON 直接编辑（与文件格式一致，可整段粘贴/导出）。
 *
 * 底部固定操作：`[ ] 覆盖同名项目` + `重新发现`（扫描已打开工作区的
 * dsh-jenkins.json/js/ts，以文件夹名为项目名合并进 map）；取消 / 保存。
 */
import { useMemo, useState } from 'react';
import { t } from "../i18n.js";
import { envLabel, projectOpError, sanitizeProjects } from "../projects.js";
import { ModalPortal } from "./ModalPortal.js";
const draftType = (value) => typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string';
/** map → 表单草稿（保持项目与环境顺序）。 */
const toDrafts = (map) => Object.keys(map).map((name) => ({
    name,
    targets: (map[name] || []).map((target) => ({
        name: target.name || '',
        job: target.job || '',
        server: target.server || '',
        params: Object.keys(target.environments || {}).map((key) => ({
            key,
            value: String((target.environments || {})[key]),
            type: draftType((target.environments || {})[key]),
        })),
    })),
}));
/** 表单草稿 → map（按类型还原 string / number / boolean；空 name 不写字段）。 */
const toMap = (drafts) => {
    const map = {};
    for (const draft of drafts) {
        const name = draft.name.trim();
        if (!name)
            continue;
        map[name] = draft.targets
            .filter((target) => target.job.trim() || target.server.trim())
            .map((target) => {
            const environments = {};
            for (const param of target.params) {
                const key = param.key.trim();
                if (!key)
                    continue;
                if (param.type === 'boolean')
                    environments[key] = String(param.value).trim() === 'true';
                else if (param.type === 'number') {
                    const num = Number(param.value);
                    environments[key] = param.value.trim() !== '' && Number.isFinite(num) ? num : param.value;
                }
                else
                    environments[key] = param.value;
            }
            const out = { job: target.job.trim(), server: target.server.trim(), environments };
            const envName = target.name.trim();
            if (envName)
                out.name = envName;
            return out;
        });
    }
    return map;
};
/** 保存前校验：项目名唯一且非空、每项都有 job + server。返回错误文案（无错返回 ''）。 */
function validate(drafts) {
    const seen = new Set();
    for (let i = 0; i < drafts.length; i += 1) {
        const draft = drafts[i];
        const name = draft.name.trim();
        if (!name)
            return t('projectNameRequired');
        if (seen.has(name))
            return t('projectNameDup', { name });
        seen.add(name);
        if (draft.targets.length === 0)
            return t('projectTargetsRequired', { name });
        for (let j = 0; j < draft.targets.length; j += 1) {
            const target = draft.targets[j];
            if (!target.job.trim() || !target.server.trim()) {
                // 报错用环境的显示名（name，缺省按下标回退）
                return t('projectTargetIncomplete', { name, n: String(target.name || '').trim() || envLabel(j) });
            }
        }
    }
    return '';
}
export function ProjectMapModal({ run, sessionId, servers, workspaces, mapPath, initial, onSaved, onClose }) {
    const [drafts, setDrafts] = useState(() => toDrafts(initial));
    const [mode, setMode] = useState('form');
    const [jsonText, setJsonText] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [openParams, setOpenParams] = useState(''); // `${项目序号}:${环境序号}` → 展开参数编辑
    const [overwrite, setOverwrite] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [note, setNote] = useState('');
    const serverOptions = useMemo(() => (Array.isArray(servers) ? servers : []).map((s) => ({ id: s.baseUrl, label: s.name + (s.baseUrl && s.name !== s.baseUrl ? ' · ' + s.baseUrl : '') })), [servers]);
    /* ── 表单编辑 ─────────────────────────────────────────────── */
    const patchProject = (index, patch) => setDrafts((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    const patchTarget = (index, targetIndex, patch) => setDrafts((prev) => prev.map((item, i) => (i === index
        ? { ...item, targets: item.targets.map((target, j) => (j === targetIndex ? { ...target, ...patch } : target)) }
        : item)));
    const addProject = () => setDrafts((prev) => prev.concat([{ name: '', targets: [{ name: '', job: '', server: '', params: [] }] }]));
    const removeProject = (index) => setDrafts((prev) => prev.filter((_, i) => i !== index));
    const addTarget = (index) => setDrafts((prev) => prev.map((item, i) => (i === index ? { ...item, targets: item.targets.concat([{ name: '', job: '', server: '', params: [] }]) } : item)));
    const removeTarget = (index, targetIndex) => setDrafts((prev) => prev.map((item, i) => (i === index ? { ...item, targets: item.targets.filter((_, j) => j !== targetIndex) } : item)));
    const addParam = (index, targetIndex) => setDrafts((prev) => prev.map((item, i) => (i === index
        ? { ...item, targets: item.targets.map((target, j) => (j === targetIndex ? { ...target, params: target.params.concat([{ key: '', value: '', type: 'string' }]) } : target)) }
        : item)));
    const patchParam = (index, targetIndex, paramIndex, patch) => setDrafts((prev) => prev.map((item, i) => (i === index
        ? { ...item, targets: item.targets.map((target, j) => (j === targetIndex ? { ...target, params: target.params.map((p, k) => (k === paramIndex ? { ...p, ...patch } : p)) } : target)) }
        : item)));
    const removeParam = (index, targetIndex, paramIndex) => setDrafts((prev) => prev.map((item, i) => (i === index
        ? { ...item, targets: item.targets.map((target, j) => (j === targetIndex ? { ...target, params: target.params.filter((_, k) => k !== paramIndex) } : target)) }
        : item)));
    /* ── JSON 编辑 ────────────────────────────────────────────── */
    const switchMode = (next) => {
        if (next === 'json') {
            setJsonText(JSON.stringify(toMap(drafts), null, 2));
            setJsonError('');
        }
        setMode(next);
        setError('');
        setNote('');
    };
    /** 解析 JSON 文本为草稿；失败设置错误并返回 null。 */
    const parseJson = (text) => {
        let raw;
        try {
            raw = JSON.parse(text.replace(/^\uFEFF/, ''));
        }
        catch (e) {
            setJsonError(e instanceof Error ? e.message : String(e));
            return null;
        }
        const map = sanitizeProjects(raw);
        if (Object.keys(map).length === 0 && JSON.stringify(raw).replace(/[\s{}[\]]/g, '') !== '') {
            setJsonError(t('projectInvalidTargets'));
            return null;
        }
        setJsonError('');
        return toDrafts(map);
    };
    const applyJson = () => {
        const parsed = parseJson(jsonText);
        if (parsed === null)
            return;
        setDrafts(parsed);
        setNote(t('jsonApplied'));
    };
    /* ── 保存 / 重新发现 ──────────────────────────────────────── */
    const save = async () => {
        if (busy)
            return;
        let effective = drafts;
        if (mode === 'json') {
            const parsed = parseJson(jsonText);
            if (parsed === null)
                return;
            effective = parsed;
        }
        const problem = validate(effective);
        if (problem) {
            setError(problem);
            return;
        }
        setBusy(true);
        setError('');
        setNote('');
        try {
            const res = await run(sessionId, { op: 'mapSave', map: toMap(effective) });
            if (res && res.ok) {
                onSaved(sanitizeProjects(res.map));
                onClose();
            }
            else {
                setError(projectOpError(res, t('saveFailed')));
            }
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
        finally {
            setBusy(false);
        }
    };
    const discover = async () => {
        if (busy)
            return;
        setBusy(true);
        setError('');
        setNote('');
        try {
            const res = await run(sessionId, { op: 'mapDiscover', cwds: workspaces, overwrite });
            if (!(res && res.ok)) {
                setError(projectOpError(res, t('saveFailed')));
                return;
            }
            const map = sanitizeProjects(res.map);
            setDrafts(toDrafts(map));
            if (mode === 'json')
                setJsonText(JSON.stringify(map, null, 2));
            const added = Array.isArray(res.added) ? res.added : [];
            const updated = Array.isArray(res.updated) ? res.updated : [];
            const results = Array.isArray(res.results) ? res.results : [];
            const parts = [];
            if (added.length > 0)
                parts.push(t('discoverAdded', { names: added.join('、') }));
            if (updated.length > 0)
                parts.push(t('discoverUpdated', { names: updated.join('、') }));
            if (parts.length === 0) {
                const found = results.filter((r) => r.ok).length;
                parts.push(found > 0 ? t('discoverNothingNew', { n: found }) : t('discoverNoConfig'));
            }
            setNote(parts.join('；'));
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs(ModalPortal, { backdropClass: "dshj-json-backdrop", modalClass: "dshj-project-modal", onBackdropClose: onClose, children: [_jsxs("div", { className: "dshj-modal-header", children: [_jsxs("div", { children: [_jsx("div", { className: "dshj-modal-title", children: t('projectsTitle') }), _jsx("div", { className: "dshj-modal-sub", children: mapPath || 'dsh-jenkins-map.json' })] }), _jsxs("div", { className: "dshj-tabs dshj-config-tabs", role: "tablist", children: [_jsx("button", { type: "button", role: "tab", "aria-selected": mode === 'form', className: 'dshj-tab' + (mode === 'form' ? ' dshj-tab-active' : ''), onClick: () => switchMode('form'), children: t('formModeBtn') }), _jsx("button", { type: "button", role: "tab", "aria-selected": mode === 'json', className: 'dshj-tab' + (mode === 'json' ? ' dshj-tab-active' : ''), onClick: () => switchMode('json'), children: t('jsonModeBtn') })] }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), title: t('close'), onClick: onClose, children: "\u2715" })] }), _jsxs("div", { className: "dshj-modal-body dshj-project-body", children: [mode === 'json' ? (_jsxs("div", { className: "dshj-project-json", children: [_jsx("textarea", { className: "dshj-textarea dshj-project-json-text", spellCheck: false, placeholder: t('importPlaceholder'), value: jsonText, onChange: (e) => { setJsonText(e.target.value); setJsonError(''); setNote(''); } }), _jsxs("div", { className: "dshj-project-jsonbar", children: [_jsx("span", { className: "dshj-hint", children: t('projectJsonHint') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: applyJson, children: t('applyJsonBtn') })] }), jsonError ? _jsx("div", { className: "dshj-err", children: t('configParseFailed') + '：' + jsonError }) : null] })) : (_jsxs("div", { className: "dshj-project-list", children: [_jsx("datalist", { id: "dshj-project-servers", children: serverOptions.map((option) => _jsx("option", { value: option.id, children: option.label }, option.id)) }), drafts.length === 0 ? _jsx("div", { className: "dshj-empty", children: t('projectsEmpty') }) : null, drafts.map((draft, index) => (_jsxs("div", { className: "dshj-project-item", children: [_jsxs("div", { className: "dshj-project-item-head", children: [_jsx("input", { className: "dshj-input dshj-project-name", value: draft.name, placeholder: t('projectNamePlaceholder'), onChange: (e) => patchProject(index, { name: e.target.value }) }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small dshj-btn-danger", onClick: () => removeProject(index), children: t('deleteBtn') })] }), draft.targets.map((target, targetIndex) => {
                                        const paramsKey = index + ':' + targetIndex;
                                        const paramsOpen = openParams === paramsKey;
                                        const shown = String(target.name || '').trim() || envLabel(targetIndex);
                                        return (_jsxs("div", { className: "dshj-project-env", children: [_jsx("input", { className: "dshj-input dshj-env-name-input", value: target.name || '', placeholder: envLabel(targetIndex), title: t('targetNameHint'), onChange: (e) => patchTarget(index, targetIndex, { name: e.target.value }) }), _jsx("input", { className: "dshj-input", value: target.job, placeholder: t('jobPathLabel'), onChange: (e) => patchTarget(index, targetIndex, { job: e.target.value }) }), _jsx("input", { className: "dshj-input dshj-project-server", value: target.server, placeholder: t('targetServerPlaceholder'), list: "dshj-project-servers", onChange: (e) => patchTarget(index, targetIndex, { server: e.target.value }) }), _jsx("button", { type: "button", className: 'dshj-btn dshj-btn-small dshj-param-toggle' + (paramsOpen ? ' dshj-btn-active' : ''), title: t('envParamsLabel'), onClick: () => setOpenParams(paramsOpen ? '' : paramsKey), children: t('paramCount', { n: target.params.length }) }), _jsx("button", { type: "button", className: "dshj-btn-icon dshj-target-del", title: t('removeTarget', { name: shown }), disabled: draft.targets.length <= 1, onClick: () => removeTarget(index, targetIndex), children: "\u2715" })] }, targetIndex));
                                    }), _jsxs("div", { className: "dshj-project-item-ops", children: [_jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: () => addTarget(index), children: t('addTargetBtn') }), _jsx("span", { className: "dshj-project-env-count", children: t('envCount', { n: draft.targets.length }) })] }), draft.targets.map((target, targetIndex) => {
                                        if (openParams !== index + ':' + targetIndex)
                                            return null;
                                        return (_jsxs("div", { className: "dshj-param-box", children: [target.params.map((param, paramIndex) => (_jsxs("div", { className: "dshj-param-row", children: [_jsx("input", { className: "dshj-input", value: param.key, placeholder: t('paramKeyPlaceholder'), onChange: (e) => patchParam(index, targetIndex, paramIndex, { key: e.target.value }) }), _jsx("input", { className: "dshj-input", value: param.value, placeholder: t('paramValuePlaceholder'), onChange: (e) => patchParam(index, targetIndex, paramIndex, { value: e.target.value }) }), _jsxs("select", { className: "dshj-select dshj-param-type", value: param.type, onChange: (e) => patchParam(index, targetIndex, paramIndex, { type: e.target.value }), children: [_jsx("option", { value: "string", children: t('paramTypeText') }), _jsx("option", { value: "number", children: t('paramTypeNumber') }), _jsx("option", { value: "boolean", children: t('paramTypeBool') })] }), _jsx("button", { type: "button", className: "dshj-btn-icon dshj-param-del", title: t('deleteBtn'), onClick: () => removeParam(index, targetIndex, paramIndex), children: "\u2715" })] }, paramIndex))), target.params.length === 0 ? _jsx("div", { className: "dshj-target-params-empty", children: t('paramNone') }) : null, _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: () => addParam(index, targetIndex), children: t('addParamBtn') })] }, 'p' + targetIndex));
                                    })] }, index)))] })), error ? _jsx("div", { className: "dshj-err", children: error }) : null, note ? _jsx("div", { className: "dshj-ok", children: note }) : null] }), _jsxs("div", { className: "dshj-modal-footer", children: [_jsxs("label", { className: "dshj-check dshj-project-overwrite", title: t('discoverOverwriteHint'), children: [_jsx("input", { type: "checkbox", checked: overwrite, onChange: (e) => setOverwrite(e.target.checked) }), _jsx("span", { children: t('discoverOverwrite') })] }), _jsx("button", { type: "button", className: "dshj-link-btn", disabled: busy || workspaces.length === 0, title: t('discoverHint'), onClick: () => void discover(), children: busy ? t('saving') : t('discoverBtn') }), mode === 'form' ? (_jsx("button", { type: "button", className: "dshj-btn", onClick: addProject, children: t('addProject') })) : null, _jsx("button", { type: "button", className: "dshj-btn", onClick: onClose, children: t('cancelBtn') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-primary", disabled: busy, onClick: () => void save(), children: busy ? t('saving') : t('saveBtn') })] })] }));
}
