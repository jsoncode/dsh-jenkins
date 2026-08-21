import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 构建完整日志弹框：从历史条目点击打开，拉取 Jenkins consoleText 展示。
 */
import { useEffect, useState } from 'react';
import { t, tErr } from "../i18n.js";
import { ansiToHtml } from "../ansi.js";
const MAX_LOG_KB = 500;
export function BuildLogModal({ entry, run, sessionId, onClose }) {
    const [loading, setLoading] = useState(true);
    const [log, setLog] = useState('');
    const [error, setError] = useState('');
    const [truncated, setTruncated] = useState(false);
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        let alive = true;
        const segments = Array.isArray(entry.segments) && entry.segments.length
            ? entry.segments
            : (entry.job || '').split('/').filter(Boolean);
        run(sessionId, {
            op: 'buildLog',
            serverId: entry.serverId,
            segments,
            buildNumber: entry.buildNumber,
        }).then((res) => {
            if (!alive)
                return;
            if (res && res.ok) {
                setLog(String(res.log || ''));
                setTruncated(!!res.truncated);
                setError('');
            }
            else {
                setError(tErr(res, t('logFailed')));
            }
            setLoading(false);
        }).catch((e) => {
            if (!alive)
                return;
            setError(e instanceof Error ? e.message : String(e));
            setLoading(false);
        });
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entry.id]);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(log);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
        catch { /* ignore */ }
    };
    return (_jsx("div", { className: "dshj-backdrop dshj-json-backdrop", onClick: onClose, children: _jsxs("div", { className: "dshj-modal dshj-log-modal", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "dshj-modal-header", children: [_jsxs("div", { children: [_jsx("div", { className: "dshj-modal-title", children: t('logTitle') }), _jsxs("div", { className: "dshj-modal-sub", children: [entry.job, entry.buildNumber ? ' #' + entry.buildNumber : '', entry.server ? ' · ' + entry.server : ''] })] }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), title: t('close'), onClick: onClose, children: "\u2715" })] }), _jsxs("div", { className: "dshj-modal-body dshj-log-body", children: [loading ? (_jsxs("div", { className: "dshj-empty", children: [_jsx("span", { className: "dshj-spinner" }), _jsx("div", { children: t('logLoading') })] })) : error ? (_jsx("div", { className: "dshj-empty", children: _jsx("div", { className: "dshj-err", children: error }) })) : log ? (
                        // ANSI 控制序列（颜色/加粗）转 HTML 渲染，还原终端配色
                        _jsx("pre", { className: "dshj-code dshj-log-code", dangerouslySetInnerHTML: { __html: ansiToHtml(log) } })) : (_jsx("pre", { className: "dshj-code dshj-log-code", children: t('logEmpty') })), truncated && !loading && !error ? (_jsx("div", { className: "dshj-log-truncated", children: t('logTruncated', { kb: MAX_LOG_KB }) })) : null] }), !loading && !error ? (_jsxs("div", { className: "dshj-modal-footer", children: [_jsx("button", { type: "button", className: "dshj-btn dshj-btn-small", onClick: () => void copy(), children: copied ? t('copied') : t('copy') }), entry.url ? (_jsxs("a", { className: "dshj-btn dshj-btn-small dshj-link", href: entry.url, target: "_blank", rel: "noopener noreferrer", children: [t('openBuildPage'), " \u2197"] })) : null] })) : null] }) }));
}
