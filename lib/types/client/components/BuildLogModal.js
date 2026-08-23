import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 构建完整日志弹框：从历史条目点击打开，拉取 Jenkins consoleText 展示。
 *
 * 实时性：进行中（排队 / 构建中）的条目每 1 秒轮询一次日志自动刷新，构建结束后
 * 自动停止轮询并做最后一次刷新（宿主当前无 socket 通道，1s 轮询是轻量替代；
 * 轮询器订阅保证「排队 → 构建中 → 完成」状态切换能驱动日志刷新与按钮显隐）。
 * footer 提供「终止」按钮（红色，两次点击确认，与设置页删除服务器同款交互），
 * 排队阶段取消队列项、已开始则停止构建。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { t, tErr } from "../i18n.js";
import { ansiToHtml } from "../ansi.js";
import { SvgCompress, SvgExpand } from "./SvgIcons.js";
import { ModalPortal } from "./ModalPortal.js";
const MAX_LOG_KB = 500;
const LOG_POLL_MS = 1000;
export function BuildLogModal({ entry, run, sessionId, onClose, poller }) {
    const [loading, setLoading] = useState(true);
    const [log, setLog] = useState('');
    const [error, setError] = useState('');
    const [truncated, setTruncated] = useState(false);
    const [copied, setCopied] = useState(false);
    // 终止构建：两次点击确认（第一次进入确认态，第二次执行），与设置页删除服务器同款交互
    const [armCancel, setArmCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelMsg, setCancelMsg] = useState('');
    const [cancelOk, setCancelOk] = useState(false);
    // 网页全屏（CSS 铺满视口，非系统全屏）：进入/退出切换
    const [fullscreen, setFullscreen] = useState(false);
    const segments = useMemo(() => {
        if (Array.isArray(entry.segments) && entry.segments.length)
            return entry.segments;
        return (entry.job || '').split('/').filter(Boolean);
    }, [entry]);
    // 订阅轮询器：构建状态变化（排队 → 构建中 → 完成）时重渲染，驱动日志刷新与终止按钮显隐
    const [, setTick] = useState(0);
    useEffect(() => (poller ? poller.subscribe(() => setTick((x) => x + 1)) : undefined), [poller]);
    const live = poller ? poller.getLive(entry.id) : undefined;
    // 当前有效构建号：历史快照可能停在排队阶段（无构建号），轮询器回填后取其最新值
    const buildNumber = entry.buildNumber ?? live?.buildNumber ?? null;
    const buildNumberRef = useRef(buildNumber);
    buildNumberRef.current = buildNumber;
    // 进行中：轮询器有实时数据按阶段判定；无实时数据（如未纳入轮询的条目）回退到历史快照
    const inFlight = live
        ? live.phase === 'queued' || live.phase === 'running'
        : entry.result == null && !!(buildNumber || entry.queueId);
    const inFlightRef = useRef(inFlight);
    inFlightRef.current = inFlight;
    // 终止仅对可定位的构建有效（有构建号或队列号）
    const canCancel = inFlight && (!!buildNumber || !!entry.queueId);
    const aliveRef = useRef(true);
    const fetchingRef = useRef(false);
    const fetchLog = useCallback(async () => {
        const num = buildNumberRef.current;
        if (!num) {
            // 排队中尚无构建号：保持等待态，不当作错误
            setLoading(false);
            return;
        }
        if (fetchingRef.current)
            return;
        fetchingRef.current = true;
        try {
            const res = await run(sessionId, {
                op: 'buildLog',
                serverId: entry.serverId,
                segments,
                buildNumber: num,
            });
            if (!aliveRef.current)
                return;
            if (res && res.ok) {
                setLog(String(res.log || ''));
                setTruncated(!!res.truncated);
                setError('');
            }
            else if (res && (res.notFound || res.code === 'build-not-found')) {
                // 构建记录尚未出现（竞态）：进行中时静默保留等待态，完成后才提示
                if (!inFlightRef.current)
                    setError(tErr(res, t('logFailed')));
                else
                    setError('');
            }
            else {
                setError(tErr(res, t('logFailed')));
            }
        }
        catch (e) {
            if (aliveRef.current)
                setError(e instanceof Error ? e.message : String(e));
        }
        finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [run, sessionId, entry.serverId, segments]);
    useEffect(() => {
        aliveRef.current = true;
        let timer;
        // 首次加载；进行中时每 1s 轮询一次日志，构建结束后做最后一次刷新并停止轮询
        void fetchLog();
        const tick = () => {
            if (inFlightRef.current)
                void fetchLog();
            else {
                if (timer !== undefined) {
                    clearInterval(timer);
                    timer = undefined;
                }
                void fetchLog();
            }
        };
        if (inFlightRef.current)
            timer = window.setInterval(tick, LOG_POLL_MS);
        return () => {
            aliveRef.current = false;
            if (timer !== undefined)
                clearInterval(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entry.id]);
    // 日志更新后自动滚到底部（用户上滚查看历史时暂停跟随）
    const codeRef = useRef(null);
    const stickRef = useRef(true);
    const onScroll = () => {
        const el = codeRef.current;
        if (!el)
            return;
        stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    };
    useEffect(() => {
        const el = codeRef.current;
        if (el && stickRef.current)
            el.scrollTop = el.scrollHeight;
    }, [log]);
    // ANSI 渲染结果按日志内容缓存：内容未变化时跳过重复转换
    const html = useMemo(() => ansiToHtml(log), [log]);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(log);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
        catch { /* ignore */ }
    };
    // 终止构建：排队阶段取消队列项；已开始则停掉构建（Jenkins stop）
    const doCancel = async () => {
        if (cancelling)
            return;
        setCancelling(true);
        setCancelMsg('');
        try {
            const res = await run(sessionId, {
                op: 'cancel',
                serverId: entry.serverId,
                segments,
                buildNumber: buildNumberRef.current ?? undefined,
                queueId: entry.queueId ?? undefined,
            });
            const ok = !!(res && res.ok);
            setCancelOk(ok);
            setCancelMsg(ok ? t('cancelRequested') : tErr(res, t('cancelFailed')));
            setArmCancel(false);
        }
        catch (e) {
            setCancelOk(false);
            setCancelMsg(e instanceof Error ? e.message : String(e));
        }
        finally {
            setCancelling(false);
        }
    };
    return (_jsxs(ModalPortal, { backdropClass: "dshj-json-backdrop", modalClass: 'dshj-log-modal' + (fullscreen ? ' dshj-log-fullscreen' : ''), onBackdropClose: onClose, children: [_jsxs("div", { className: "dshj-modal-header", children: [_jsxs("div", { children: [_jsxs("div", { className: "dshj-modal-title", children: [t('logTitle'), inFlight ? _jsx("span", { className: "dshj-log-live-tag", children: t('liveStatus') }) : null] }), _jsxs("div", { className: "dshj-modal-sub", children: [entry.job, entry.buildNumber ? ' #' + entry.buildNumber : '', entry.server ? ' · ' + entry.server : ''] })] }), _jsxs("div", { className: "dshj-head-ops", children: [_jsx("button", { type: "button", className: "dshj-btn-icon", "aria-label": fullscreen ? t('exitFullscreen') : t('enterFullscreen'), title: fullscreen ? t('exitFullscreen') : t('enterFullscreen'), onClick: () => setFullscreen((f) => !f), children: fullscreen ? _jsx(SvgCompress, { size: 15 }) : _jsx(SvgExpand, { size: 15 }) }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), title: t('close'), onClick: onClose, children: "\u2715" })] })] }), _jsxs("div", { className: "dshj-modal-body dshj-log-body", children: [loading ? (_jsxs("div", { className: "dshj-empty", children: [_jsx("span", { className: "dshj-spinner" }), _jsx("div", { children: t('logLoading') })] })) : error ? (_jsx("div", { className: "dshj-empty", children: _jsx("div", { className: "dshj-err", children: error }) })) : log ? (
                    // ANSI 控制序列（颜色/加粗）转 HTML 渲染，还原终端配色；进行中自动跟随底部
                    _jsx("pre", { ref: codeRef, className: "dshj-code dshj-log-code", onScroll: onScroll, dangerouslySetInnerHTML: { __html: html } })) : (_jsx("pre", { className: "dshj-code dshj-log-code", children: inFlight ? t('logWaiting') : t('logEmpty') })), truncated && !loading && !error ? (_jsx("div", { className: "dshj-log-truncated", children: t('logTruncated', { kb: MAX_LOG_KB }) })) : null] }), _jsxs("div", { className: "dshj-modal-footer", children: [inFlight ? _jsx("span", { className: "dshj-log-live", children: t('liveStatus') }) : null, cancelMsg ? _jsx("span", { className: 'dshj-log-cancel-msg ' + (cancelOk ? 'dshj-log-cancel-msg-ok' : 'dshj-log-cancel-msg-err'), children: cancelMsg }) : null, canCancel ? (_jsx("button", { type: "button", className: 'dshj-btn dshj-btn-small' + (armCancel || cancelling ? ' dshj-btn-solid' : ' dshj-btn-danger'), disabled: cancelling, onClick: () => { if (armCancel)
                            void doCancel();
                        else
                            setArmCancel(true); }, children: cancelling ? t('cancelling') : armCancel ? t('confirmCancelBuild') : t('cancelBuild') })) : null, log ? (_jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: () => void copy(), children: copied ? t('copied') : t('copy') })) : null, entry.url ? (_jsxs("a", { className: "dshj-btn dshj-btn-small dshj-link", href: entry.url, target: "_blank", rel: "noopener noreferrer", children: [t('openBuildPage'), " \u2197"] })) : null] })] }));
}
