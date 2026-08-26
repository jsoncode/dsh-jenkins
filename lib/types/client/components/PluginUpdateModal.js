import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 浏览器半边：插件「更新」交互（确认弹框 → 日志大弹框）。
 *
 * 点击 footer 按钮最右侧的「更新」胶囊（.dshj-capsule-wrap 热区）→ 确认弹框
 * （展示新版本 / 当前版本与将要执行的 dsh CLI 更新命令）→ 点击「确认更新」→
 * 打开**大日志弹框**：宿主后台执行 `dsh plugin --profile web update dsh-jenkins`，
 * 本组件每 600ms 轮询 pluginUpdateStatus op 拉取累计输出与运行状态
 * （running / done / exitCode），以深色终端面板实时展示详细日志（ANSI 渲染、
 * 自动跟随底部）；结束后成功/失败着色提示，成功后触发一次 updateCheck 重查
 * （宿主已使版本缓存失效），让「更新」胶囊消失。
 *
 * 弹框信息完整版：确认弹框带命令块；日志弹框标题下展示执行命令，状态行 + 终端
 * 日志 + 复制按钮 + 完成提示（重启生效）+ 后台继续提示。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { t, tErr } from "../i18n.js";
import { ansiToHtml } from "../ansi.js";
import { ModalPortal } from "./ModalPortal.js";
const LOG_POLL_MS = 600;
/** 展示给用户的更新命令（与宿主 plugin-update.ts 的 spawn 参数一致）。 */
const UPDATE_COMMAND = 'dsh plugin --profile web update dsh-jenkins';
/** 状态行文案与着色：running=转圈，成功=绿，失败=红。 */
function statusView(status) {
    if (status === null || status.running)
        return { text: t('updateRunning'), cls: '' };
    if (status.done && status.exitCode === 0)
        return { text: t('updateSuccess'), cls: 'dshj-update-status-ok' };
    const code = status.exitCode === null ? '?' : String(status.exitCode);
    return { text: t('updateFailed', { code }) + (status.error ? `：${status.error}` : ''), cls: 'dshj-update-status-err' };
}
/** 极简 HTML 转义（占位文案经转义后插入 pre）。 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
/** 更新交互弹框：按 store 的 UI 状态渲染确认弹框或日志大弹框（none 时不渲染）。 */
export function PluginUpdateModal({ run, useUpdate, useUi, closeUi, onConfirm, recheck }) {
    const ui = useUi();
    const update = useUpdate();
    if (ui === 'confirm') {
        const tip = update !== null
            ? t('updateConfirmMsg', { v: update.latest, c: update.current })
            : '';
        return (_jsxs(ModalPortal, { backdropClass: "dshj-json-backdrop dshj-confirm-backdrop", modalClass: "dshj-modal-sm", onBackdropClose: closeUi, children: [_jsxs("div", { className: "dshj-modal-header", children: [_jsx("span", { className: "dshj-modal-title", children: t('updateConfirmTitle') }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), onClick: closeUi, children: "\u2715" })] }), _jsxs("div", { className: "dshj-modal-body", children: [_jsx("div", { children: tip }), _jsx("pre", { className: "dshj-code dshj-update-cmd", children: UPDATE_COMMAND })] }), _jsxs("div", { className: "dshj-modal-footer", children: [_jsx("button", { type: "button", className: "dshj-btn", onClick: closeUi, children: t('cancelBtn') }), _jsx("button", { type: "button", className: "dshj-btn dshj-btn-primary", onClick: onConfirm, children: t('updateBtn') })] })] }));
    }
    if (ui === 'log') {
        return _jsx(UpdateLogDialog, { run: run, onClose: closeUi, recheck: recheck });
    }
    return null;
}
/** 日志大弹框：标题（+运行标记）+ 执行命令副标题 + 状态行 / 终端日志 / 完成提示 + 复制 / 关闭。 */
function UpdateLogDialog({ run, onClose, recheck }) {
    const [status, setStatus] = useState(null);
    const [startError, setStartError] = useState('');
    const [copied, setCopied] = useState(false);
    const logRef = useRef(null);
    const recheckedRef = useRef(false);
    const lastLenRef = useRef(-1);
    const output = status?.output ?? '';
    const running = status === null || status.running;
    // 轮询与启动逻辑（启动失败展示错误；成功后 recheck 让胶囊消失）
    useEffect(() => {
        let cancelled = false;
        let stopped = false;
        void run('', { op: 'pluginUpdateStart' }).then((res) => {
            if (cancelled)
                return;
            if (!res || !res.ok) {
                setStartError(tErr(res, t('updateLogStartFailed')));
                stopped = true;
            }
        }).catch(() => { });
        const poll = async () => {
            if (stopped)
                return;
            try {
                const res = await run('', { op: 'pluginUpdateStatus' });
                if (cancelled)
                    return;
                const st = res.status;
                if (st === undefined || typeof st !== 'object')
                    return;
                setStatus(st);
                if (st.done && st.exitCode === 0 && !recheckedRef.current) {
                    recheckedRef.current = true;
                    recheck();
                }
            }
            catch { /* 网络抖动保持上一次状态 */ }
        };
        void poll();
        const id = setInterval(() => { void poll(); }, LOG_POLL_MS);
        return () => { cancelled = true; clearInterval(id); };
    }, [run, recheck]);
    // 自动滚底（运行中 / 结束瞬间）
    useEffect(() => {
        const el = logRef.current;
        if (el === null)
            return;
        if (running) {
            el.scrollTop = el.scrollHeight;
        }
        else if (output.length !== lastLenRef.current) {
            el.scrollTop = el.scrollHeight;
            lastLenRef.current = output.length;
        }
    }, [output, running]);
    const st = statusView(status);
    const html = useMemo(() => {
        if (output.length === 0)
            return escapeHtml(t('updateNoOutput'));
        return ansiToHtml(output);
    }, [output]);
    const copy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
        catch { /* 剪贴板不可用时静默 */ }
    }, [output]);
    const doneOk = !!(status && status.done && status.exitCode === 0);
    return (_jsxs(ModalPortal, { backdropClass: "dshj-json-backdrop dshj-confirm-backdrop", modalClass: "dshj-modal-log", onBackdropClose: onClose, children: [_jsxs("div", { className: "dshj-modal-header", children: [_jsxs("div", { children: [_jsxs("div", { className: "dshj-modal-title", children: [t('updateLogTitle'), running && !startError ? _jsx("span", { className: "dshj-log-live-tag", children: t('liveStatus') }) : null] }), _jsx("div", { className: "dshj-modal-sub dshj-update-cmd-sub", children: UPDATE_COMMAND })] }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), onClick: onClose, children: "\u2715" })] }), _jsx("div", { className: "dshj-modal-body", children: startError ? (_jsx("div", { className: "dshj-empty", children: _jsx("div", { className: "dshj-err", children: startError }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: 'dshj-update-status' + (st.cls !== '' ? ' ' + st.cls : ''), children: [running ? _jsx("span", { className: "dshj-spinner-inline", "aria-hidden": "true" }) : null, st.text] }), _jsx("pre", { ref: logRef, className: "dshj-update-log", "aria-label": t('updateLogTitle'), dangerouslySetInnerHTML: { __html: html } }), running ? _jsx("div", { className: "dshj-hint", children: t('updateBgHint') }) : null] })) }), _jsxs("div", { className: "dshj-modal-footer", children: [doneOk ? _jsx("span", { className: "dshj-update-hint", children: t('updateRestartHint') }) : null, output.length > 0 ? (_jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: () => void copy(), children: copied ? t('copied') : t('copy') })) : null, _jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: onClose, children: t('close') })] })] }));
}
