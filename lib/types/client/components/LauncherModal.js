import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 执行 Jenkins Job 弹框（shell.overlay）：
 * 服务器 / Job 选择 → 参数表单回显 → 触发构建 → 轮询状态（排队 → 构建中 → 结果）。
 */
import { useEffect, useRef, useState } from 'react';
import { fmtDur, LANG, t, tErr } from "../i18n.js";
import { matchServer, storage } from "../storage.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { PickerModal } from "./PickerModal.js";
function LauncherModalInner({ launch, run, launchStore, historyStore, interval }) {
    const config = launch.config;
    const sessionId = launch.sessionId || '';
    // 配置数组：每个元素 = { job, server, parameters }（server 即发布目标/环境标识）
    const entries = config && Array.isArray(config.entries) ? config.entries : [];
    const firstEntry = entries[0] || null;
    // 配置中引用过的服务器标识（名称 / id / 地址），用于与已配置服务器取交集
    const configServerRefs = entries.map((e) => e.server).filter(Boolean);
    // 上次发布回显缓存（按工作区路径）：服务器 / Job / 参数
    const cached = storage.readCache()[launch.cwd] || null;
    const [formValues, setFormValues] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState('');
    // 注意：不能用 `run` 命名构建状态，会遮蔽外层 RPC 助手 run()。
    const [runState, setRunState] = useState(null);
    const [servers, setServers] = useState([]);
    const [serverPool, setServerPool] = useState([]); // 下拉候选：配置交集（交集为空时退化为全部服务器）
    const [serverMismatch, setServerMismatch] = useState([]); // 配置里未匹配到的服务器标识
    const [selectedServerId, setSelectedServerId] = useState('');
    const [detail, setDetail] = useState(null); // 服务端任务参数定义
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobsError, setJobsError] = useState('');
    const [selectedJobPath, setSelectedJobPath] = useState('');
    const [jobSearch, setJobSearch] = useState('');
    const [jobPickOpen, setJobPickOpen] = useState(false);
    const [jobPickSearch, setJobPickSearch] = useState('');
    const [paramsOpen, setParamsOpen] = useState(false); // 查看表单参数 JSON 弹框
    const selectedServer = servers.find((s) => s.id === selectedServerId) || null;
    // 长横线 label（如 "---" / "————"）：渲染为虚线分割线（带备注），不随表单提交
    const IS_DASH_LABEL = /^[-—–]{3,}$/;
    // 加载已配置服务器；下拉候选 = 配置引用过的服务器 ∩ 已配置服务器（交集为空则退化为全部，并提示）。
    // 预选顺序：缓存上次使用的服务器（限交集内）→ 交集第一台（交集为空时全部第一台）。
    useEffect(() => {
        let alive = true;
        run(sessionId, { op: 'list' }).then((r) => {
            if (!alive)
                return;
            const list = (r && r.ok) ? (r.servers || []) : [];
            setServers(list);
            const matched = list.filter((s) => configServerRefs.some((ref) => matchServer(s, ref)));
            const unmatched = configServerRefs.filter((ref) => !list.some((s) => matchServer(s, ref)));
            const pool = matched.length ? matched : list;
            setServerPool(pool);
            // 仅在交集为空时提示（此时下拉已退化为全部服务器）
            setServerMismatch(matched.length === 0 ? unmatched : []);
            const cachedServer = cached && pool.find((s) => s.id === cached.serverId);
            const preferred = cachedServer || (pool.length ? pool[0] : null);
            setSelectedServerId(preferred ? preferred.id : '');
        }).catch(() => { if (alive)
            setServers([]); });
        return () => { alive = false; };
    }, []);
    // 按所选服务器拉取真实 Job 列表（排除文件夹）；配置里该服务器对应的 job 若存在则预选
    // （缓存上次使用的 Job 优先；配置里没有匹配的 job 时留空由用户选择）。
    useEffect(() => {
        let alive = true;
        setJobs([]);
        setJobsError('');
        setSelectedJobPath('');
        setJobSearch('');
        if (!selectedServer) {
            setJobsLoading(false);
            return;
        }
        setJobsLoading(true);
        run(sessionId, { op: 'jobs', serverId: selectedServer.id }).then((r) => {
            if (!alive)
                return;
            setJobsLoading(false);
            if (r && r.ok) {
                const list = (r.jobs || []).filter((j) => !j.folder);
                setJobs(list);
                const cachedJob = cached && cached.jobPath ? (list.find((j) => j.path === cached.jobPath) || null) : null;
                const entry = entries.find((en) => matchServer(selectedServer, en.server)) || null;
                const preferred = cachedJob || (entry && list.find((j) => j.path === entry.job)) || null;
                setSelectedJobPath(preferred ? preferred.path : '');
                setJobSearch(preferred ? preferred.path : '');
            }
            else {
                setJobsError((r && r.error) || t('jobsFailed'));
            }
        }).catch((e) => { if (alive) {
            setJobsLoading(false);
            setJobsError(e instanceof Error ? e.message : String(e));
        } });
        return () => { alive = false; };
    }, [selectedServerId]);
    // 选了 Job 才拉取服务端任务参数（jobDetail）；未选则不请求（避免 404）。
    useEffect(() => {
        let alive = true;
        setDetail(null);
        setDetailError('');
        if (!selectedServer || !selectedJobPath) {
            setDetailLoading(false);
            return;
        }
        setDetailLoading(true);
        const base = (selectedServer.baseUrl || '').replace(/\/+$/, '');
        const segments = selectedJobPath.split('/').map((s) => encodeURIComponent(s));
        const jobUrl = segments.length ? base + '/job/' + segments.join('/job/') : base;
        run(sessionId, { op: 'jobDetail', serverId: selectedServer.id, jobUrl }).then((r) => {
            if (!alive)
                return;
            setDetailLoading(false);
            if (r && r.ok)
                setDetail(r);
            else {
                setDetail(null);
                setDetailError(tErr(r, t('detailFailed')));
            }
        }).catch((e) => {
            if (alive) {
                setDetailLoading(false);
                setDetail(null);
                setDetailError(e instanceof Error ? e.message : String(e));
            }
        });
        return () => { alive = false; };
    }, [selectedJobPath]);
    // 统一初始化表单：匹配「当前服务器 + 当前 Job」的配置元素参数（优先）+ 服务端参数默认值（补全缺失键）。
    // Job / 服务器切换 / 服务端参数变化时重建，干净丢弃上一选择的字段。
    useEffect(() => {
        const init = {};
        const entry = selectedServer ? entries.find((en) => en.job === selectedJobPath && matchServer(selectedServer, en.server)) || null : null;
        if (entry) {
            const params = entry.parameters || {};
            for (const k of Object.keys(params)) {
                const v = params[k];
                init[k] = typeof v === 'boolean' ? v : (v === null || v === undefined ? '' : String(v));
            }
        }
        const serverParams = detail && Array.isArray(detail.params) ? detail.params : [];
        for (const p of serverParams) {
            if (p.name in init)
                continue;
            init[p.name] = p.type === 'boolean'
                ? String(p.defaultValue) === 'true'
                : (p.defaultValue === null || p.defaultValue === undefined ? '' : String(p.defaultValue));
        }
        // 回显上次发布参数：仅当缓存的 Job 与当前选择一致时，覆盖同名字段
        const fresh = storage.readCache()[launch.cwd] || null;
        if (fresh && fresh.jobPath === selectedJobPath && fresh.parameters) {
            for (const k of Object.keys(init)) {
                if (Object.prototype.hasOwnProperty.call(fresh.parameters, k)) {
                    const v = fresh.parameters[k];
                    init[k] = typeof v === 'boolean' ? v : (v === null || v === undefined ? '' : String(v));
                }
            }
        }
        setFormValues(init);
        setRunState(null);
        setActionError('');
    }, [selectedJobPath, launch.cwd, detail ? detail.params : null]);
    const runRef = useRef(runState);
    runRef.current = runState;
    useEffect(() => {
        const cur = runRef.current;
        if (!cur || (cur.phase !== 'queued' && cur.phase !== 'running'))
            return;
        return interval(() => {
            const r = runRef.current;
            if (!r)
                return;
            if (Date.now() - (r.since || 0) > 600000) {
                setRunState({ ...r, phase: 'error', message: t('pollTimeout') });
                return;
            }
            if (r.phase === 'queued') {
                run(sessionId, { op: 'queueStatus', serverId: r.serverId, queueId: r.queueId }).then((res) => {
                    const c = runRef.current;
                    if (!c || c.phase !== 'queued')
                        return;
                    if (!res || !res.ok) {
                        setRunState({ ...c, phase: 'error', message: tErr(res, t('queuePollFailed')) });
                        return;
                    }
                    if (res.state === 'started')
                        setRunState({ ...c, phase: 'running', buildNumber: res.buildNumber, message: t('buildStarted', { n: res.buildNumber }) });
                    else if (res.state === 'cancelled') {
                        storage.updateHistoryResult(launch.cwd, c.historyId, 'CANCELLED');
                        setRunState({ ...c, phase: 'error', message: t('cancelled') + (res.why || t('unknownReason')) });
                    }
                    else
                        setRunState({ ...c, message: t('queuing') + (res.why || t('waitingExecutor')) });
                }).catch((e) => { const c = runRef.current; if (c)
                    setRunState({ ...c, phase: 'error', message: e instanceof Error ? e.message : String(e) }); });
            }
            else {
                run(sessionId, { op: 'buildStatus', serverId: r.serverId, segments: r.segments, buildNumber: r.buildNumber }).then((res) => {
                    const c = runRef.current;
                    if (!c || c.phase !== 'running')
                        return;
                    if (!res || !res.ok) {
                        if (res && res.notFound)
                            return;
                        setRunState({ ...c, phase: 'error', message: tErr(res, t('buildPollFailed')) });
                        return;
                    }
                    if (res.building)
                        setRunState({ ...c, message: t('buildingRun', { d: fmtDur(Date.now() - (res.timestamp || Date.now())) }) });
                    else {
                        storage.updateHistoryResult(launch.cwd, c.historyId, res.result || 'UNKNOWN');
                        setRunState({ ...c, phase: 'done', result: res.result || 'UNKNOWN', duration: res.duration || 0, url: res.url || '', buildNumber: res.number || c.buildNumber, message: t('buildEnded') });
                    }
                }).catch((e) => { const c = runRef.current; if (c)
                    setRunState({ ...c, phase: 'error', message: e instanceof Error ? e.message : String(e) }); });
            }
        }, 2500);
    }, [runState ? runState.phase : null, runState ? runState.queueId : null, runState ? runState.buildNumber : null]);
    const onSubmit = () => {
        if (submitting)
            return;
        if (!selectedJobPath) {
            setActionError(t('jobRequired'));
            return;
        }
        setSubmitting(true);
        setParamsOpen(false);
        setActionError('');
        // 只提交「配置里设置过的」+「与服务端默认值不同的」字段，未配置的交给 Jenkins 默认。
        const entry = selectedServer ? entries.find((en) => en.job === selectedJobPath && matchServer(selectedServer, en.server)) || null : null;
        const entryParams = (entry && entry.parameters) || {};
        const serverDefaults = {};
        if (detail && Array.isArray(detail.params)) {
            for (const p of detail.params)
                serverDefaults[p.name] = p.defaultValue;
        }
        const submitValues = {};
        for (const k of Object.keys(formValues)) {
            if (IS_DASH_LABEL.test(k))
                continue; // 分割线字段不随表单提交
            const inConfig = Object.prototype.hasOwnProperty.call(entryParams, k);
            if (inConfig)
                submitValues[k] = formValues[k];
            else if (serverDefaults[k] === undefined || String(formValues[k]) !== String(serverDefaults[k]))
                submitValues[k] = formValues[k];
        }
        run(sessionId, { op: 'workspaceTrigger', cwd: launch.cwd, serverId: selectedServerId, job: selectedJobPath, parameters: submitValues }).then((res) => {
            setSubmitting(false);
            if (res && res.ok) {
                // 记录本次发布（服务器 / Job / 参数），下次打开弹框自动回显
                storage.writeCache(launch.cwd, { serverId: selectedServerId, jobPath: selectedJobPath, parameters: submitValues });
                // 追加到发布历史（时间、Job、服务器、参数；结果在轮询结束时回填）
                const historyId = storage.pushHistory(launch.cwd, {
                    id: 'h' + Date.now() + '-' + Math.floor(Math.random() * 1e6),
                    time: Date.now(),
                    job: selectedJobPath,
                    server: selectedServer ? selectedServer.name : '',
                    params: submitValues,
                    result: null,
                });
                if (res.queueId) {
                    setRunState({ phase: 'queued', queueId: res.queueId, serverId: res.serverId, segments: res.segments, buildNumber: null, historyId, message: t('queuedMsg', { n: res.queueId }), since: Date.now() });
                }
                else {
                    setRunState({ phase: 'running', queueId: null, serverId: res.serverId, segments: res.segments, buildNumber: res.nextBuildNumber || null, historyId, message: t('triggeredMsg'), since: Date.now() });
                }
            }
            else {
                setActionError(tErr(res, t('triggerFailed')));
            }
        }).catch((e) => { setSubmitting(false); setActionError(e instanceof Error ? e.message : String(e)); });
    };
    const serverParamsByName = {};
    if (detail && Array.isArray(detail.params)) {
        for (const p of detail.params)
            serverParamsByName[p.name] = p;
    }
    const formKeys = Object.keys(formValues);
    // 表单参数 JSON 视图：保留每个字段的完整定义（类型/默认值/描述/选项）与当前值，便于调试
    const formParamsJson = {};
    for (const k of formKeys) {
        const p = serverParamsByName[k];
        const item = { value: formValues[k] };
        if (p) {
            if (p.description)
                item.description = p.description;
            if (p.type)
                item.type = p.type;
            if (p.defaultValue !== null && p.defaultValue !== undefined)
                item.defaultValue = p.defaultValue;
            if (Array.isArray(p.choices) && p.choices.length)
                item.choices = p.choices;
        }
        else {
            item.source = 'config';
        }
        if (IS_DASH_LABEL.test(k))
            item.submitted = false;
        formParamsJson[k] = item;
    }
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "dshj-backdrop", children: [_jsxs("div", { className: "dshj-modal", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "dshj-modal-header", children: [_jsxs("div", { children: [_jsx("div", { className: "dshj-modal-title", children: t('runJob') }), _jsx("div", { className: "dshj-modal-sub", children: (selectedJobPath || (firstEntry && firstEntry.job) || '') + ' · ' + launch.cwd })] }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), title: t('close'), onClick: () => launchStore.close(), children: "\u2715" })] }), _jsxs("div", { className: "dshj-server-field", children: [_jsx("label", { className: "dshj-server-label", children: t('serverField') }), _jsx("select", { className: "dshj-select", value: selectedServerId, disabled: !!runState || submitting || serverPool.length === 0, onChange: (e) => setSelectedServerId(e.target.value), children: serverPool.length === 0
                                        ? _jsx("option", { value: "", disabled: true, children: t('noServersHint') }, "__none")
                                        : serverPool.map((s) => (_jsx("option", { value: s.id, children: s.name + (configServerRefs.some((ref) => matchServer(s, ref)) ? t('configMark') : '') }, s.id))) })] }), serverMismatch.length > 0 ? (_jsxs("div", { className: "dshj-server-field", children: [_jsx("label", { className: "dshj-server-label" }), _jsx("div", { className: "dshj-warn", style: { fontSize: 12, lineHeight: 1.5 }, children: t('serverMismatch', { list: serverMismatch.join(LANG === 'zh' ? '、' : ', ') }) })] })) : null, _jsxs("div", { className: "dshj-server-field", children: [_jsx("label", { className: "dshj-server-label", children: t('jobField') }), _jsxs("button", { type: "button", className: 'dshj-picker' + (jobSearch ? '' : ' dshj-picker-empty') + (jobsError ? ' dshj-picker-error' : ''), disabled: !!runState || submitting || jobsLoading || !selectedServer, onClick: () => { setJobPickSearch(''); setJobPickOpen(true); }, children: [_jsx("span", { className: "dshj-picker-value", children: jobSearch
                                                ? jobSearch
                                                : !selectedServer ? t('jobPlaceholder')
                                                    : jobsLoading ? t('jobsLoading')
                                                        : jobsError ? t('jobsFailed')
                                                            : jobs.length === 0 ? t('jobsEmpty')
                                                                : t('jobPlaceholder') }), _jsx("span", { className: "dshj-picker-caret", children: "\u25BE" })] }), _jsx(PickerModal, { open: jobPickOpen, title: t('jobField'), search: jobPickSearch, setSearch: setJobPickSearch, placeholder: t('jobPlaceholder'), options: jobs
                                        .filter((j) => !j.folder && (j.path.toLowerCase().indexOf(jobPickSearch.toLowerCase()) !== -1 || j.name.toLowerCase().indexOf(jobPickSearch.toLowerCase()) !== -1))
                                        .map((j) => ({ id: j.path, label: j.path })), selectedId: selectedJobPath || undefined, emptyText: jobsError ? t('jobsFailed') : jobs.length === 0 ? t('jobsEmpty') : undefined, onSelect: (id) => { setSelectedJobPath(id); setJobSearch(id); setJobPickOpen(false); }, onClose: () => setJobPickOpen(false) })] }), _jsx("div", { className: "dshj-divider" }), _jsx("div", { className: "dshj-modal-body", children: runState ? (_jsxs("div", { children: [_jsx("div", { className: "dshj-run-title", children: runState.phase === 'queued' ? t('phaseQueued') : runState.phase === 'running' ? t('phaseRunning') : runState.phase === 'done' ? t('phaseDone') : t('phaseError') }), _jsx("div", { className: 'dshj-run-message ' + (runState.phase === 'done' ? (runState.result === 'SUCCESS' ? 'dshj-ok' : (runState.result === 'FAILURE' || runState.result === 'ABORTED' ? 'dshj-err' : 'dshj-warn')) : ''), children: runState.message || '' }), (runState.phase === 'queued' || runState.phase === 'running') ? _jsx("div", { className: "dshj-spinner" }) : null, runState.phase === 'done' ? (_jsxs("div", { children: [_jsx("div", { className: "dshj-run-line", children: t('resultLabel', { n: runState.buildNumber }) + (runState.result || 'UNKNOWN') }), _jsx("div", { className: "dshj-run-line", children: t('duration') + fmtDur(runState.duration || 0) }), runState.url ? _jsx("a", { className: "dshj-link", href: runState.url, target: "_blank", rel: "noopener noreferrer", children: t('openPage') }) : null] })) : null, _jsxs("div", { className: "dshj-form-ops", children: [_jsx("button", { type: "button", className: "dshj-btn", onClick: () => setRunState(null), children: t('backParams') }), runState.phase === 'done' ? _jsx("button", { type: "button", className: "dshj-btn dshj-btn-primary", onClick: onSubmit, children: t('rebuild') }) : null] })] }))
                                : !selectedJobPath ? _jsx("div", { className: "dshj-empty", children: t('selectJobFirst') })
                                    : (_jsxs("div", { children: [detailLoading ? _jsx("div", { className: "dshj-empty", children: t('loadingParams') })
                                                : detailError && formKeys.length === 0 ? _jsx("div", { className: "dshj-err dshj-empty", children: detailError })
                                                    : formKeys.length === 0 ? _jsx("div", { className: "dshj-empty", children: t('noParams') })
                                                        : (_jsx("div", { className: "dshj-form-grid", children: formKeys.map((k) => {
                                                                const v = formValues[k];
                                                                const p = serverParamsByName[k];
                                                                const set = (nv) => setFormValues((prev) => ({ ...prev, [k]: nv }));
                                                                // 长横线 label：不渲染 label+控件行，改为虚线分割线（备注文本显示在线上）
                                                                if (IS_DASH_LABEL.test(k)) {
                                                                    return (_jsx("div", { className: "dshj-form-divider", children: p && p.description ? _jsx("span", { className: "dshj-form-divider-text", children: p.description }) : null }, k));
                                                                }
                                                                let control;
                                                                if (p && p.type === 'boolean') {
                                                                    control = (_jsxs("label", { className: "dshj-check", children: [_jsx("input", { type: "checkbox", checked: !!v, onChange: (e) => set(e.target.checked) }), _jsx("span", { children: String(v) })] }));
                                                                }
                                                                else if (p && p.type === 'choice') {
                                                                    control = (_jsx("select", { className: "dshj-select", value: String(v), onChange: (e) => set(e.target.value), children: (p.choices || []).map((c) => _jsx("option", { value: String(c), children: String(c) }, String(c))) }));
                                                                }
                                                                else if (p && p.type === 'text') {
                                                                    control = _jsx("textarea", { className: "dshj-textarea", rows: 3, value: String(v === undefined || v === null ? '' : v), onChange: (e) => set(e.target.value) });
                                                                }
                                                                else if (typeof v === 'boolean') {
                                                                    control = (_jsxs("label", { className: "dshj-check", children: [_jsx("input", { type: "checkbox", checked: !!v, onChange: (e) => set(e.target.checked) }), _jsx("span", { children: String(v) })] }));
                                                                }
                                                                else {
                                                                    control = (_jsx("input", { className: "dshj-input", type: p && p.type === 'password' ? 'password' : 'text', value: String(v === undefined || v === null ? '' : v), onChange: (e) => set(e.target.value) }));
                                                                }
                                                                // 与「服务器 / Job 列表」行一致的栅格：左侧 label（右对齐、定宽），右侧 value（定宽）；
                                                                // 描述单独占一行（grid 第二行），不影响 label 与 value 的水平对齐
                                                                return (_jsxs("div", { className: "dshj-form-field", children: [_jsx("label", { className: "dshj-form-label", title: k, children: k }), control, p && p.description ? _jsx("div", { className: "dshj-form-desc", children: p.description }) : null] }, k));
                                                            }) })), detailError && formKeys.length > 0 ? _jsx("div", { className: "dshj-err", children: detailError }) : null, actionError ? _jsx("div", { className: "dshj-err", children: actionError }) : null, _jsxs("div", { className: "dshj-form-ops dshj-submit-row", children: [_jsx("button", { type: "button", className: "dshj-btn dshj-btn-primary", disabled: submitting, onClick: onSubmit, children: submitting ? t('submitting') : t('submit') }), _jsx("button", { type: "button", className: "dshj-link-btn", disabled: submitting, onClick: () => setParamsOpen(true), children: t('viewParams') })] })] })) })] }), paramsOpen ? (_jsx("div", { className: "dshj-backdrop dshj-json-backdrop", children: _jsxs("div", { className: "dshj-modal dshj-json-modal", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "dshj-modal-header", children: [_jsxs("div", { children: [_jsx("div", { className: "dshj-modal-title", children: t('formParamsJson') }), _jsx("div", { className: "dshj-modal-sub", children: selectedJobPath || '' })] }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), title: t('close'), onClick: () => setParamsOpen(false), children: "\u2715" })] }), _jsx("div", { className: "dshj-modal-body", children: _jsx("pre", { className: "dshj-code", children: JSON.stringify(formParamsJson, null, 2) }) })] }) })) : null] }) }));
}
export function LauncherModal({ run, launchStore, historyStore, interval, useLaunch }) {
    const launch = useLaunch();
    if (!launch)
        return null;
    return (_jsx(ErrorBoundary, { label: "LauncherModalInner", children: _jsx(LauncherModalInner, { launch: launch, run: run, launchStore: launchStore, historyStore: historyStore, interval: interval }) }));
}
