/**
 * dsh-jenkins —— 构建完整日志弹框：从历史条目点击打开，拉取 Jenkins consoleText 展示。
 */

import { useEffect, useState } from 'react'
import { t, tErr } from '../i18n.ts'
import { ansiToHtml } from '../ansi.ts'
import type { RunFn } from '../rpc.ts'
import type { HistoryEntry } from '../storage.ts'

const MAX_LOG_KB = 500

export interface BuildLogModalProps {
  entry: HistoryEntry
  run: RunFn
  sessionId: string
  onClose(): void
}

export function BuildLogModal({ entry, run, sessionId, onClose }: BuildLogModalProps) {
  const [loading, setLoading] = useState(true)
  const [log, setLog] = useState('')
  const [error, setError] = useState('')
  const [truncated, setTruncated] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    const segments = Array.isArray(entry.segments) && entry.segments.length
      ? entry.segments
      : (entry.job || '').split('/').filter(Boolean)
    run(sessionId, {
      op: 'buildLog',
      serverId: entry.serverId,
      segments,
      buildNumber: entry.buildNumber,
    }).then((res) => {
      if (!alive) return
      if (res && res.ok) {
        setLog(String(res.log || ''))
        setTruncated(!!res.truncated)
        setError('')
      } else {
        setError(tErr(res, t('logFailed')))
      }
      setLoading(false)
    }).catch((e) => {
      if (!alive) return
      setError(e instanceof Error ? e.message : String(e))
      setLoading(false)
    })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id])

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(log)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  return (
    <div className="dshj-backdrop dshj-json-backdrop" onClick={onClose}>
      <div className="dshj-modal dshj-log-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dshj-modal-header">
          <div>
            <div className="dshj-modal-title">{t('logTitle')}</div>
            <div className="dshj-modal-sub">
              {entry.job}
              {entry.buildNumber ? ' #' + entry.buildNumber : ''}
              {entry.server ? ' · ' + entry.server : ''}
            </div>
          </div>
          <button type="button" className="dshj-close" aria-label={t('close')} title={t('close')} onClick={onClose}>✕</button>
        </div>
        <div className="dshj-modal-body dshj-log-body">
          {loading ? (
            <div className="dshj-empty">
              <span className="dshj-spinner" />
              <div>{t('logLoading')}</div>
            </div>
          ) : error ? (
            <div className="dshj-empty">
              <div className="dshj-err">{error}</div>
            </div>
          ) : log ? (
            // ANSI 控制序列（颜色/加粗）转 HTML 渲染，还原终端配色
            <pre className="dshj-code dshj-log-code" dangerouslySetInnerHTML={{ __html: ansiToHtml(log) }} />
          ) : (
            <pre className="dshj-code dshj-log-code">{t('logEmpty')}</pre>
          )}
          {truncated && !loading && !error ? (
            <div className="dshj-log-truncated">{t('logTruncated', { kb: MAX_LOG_KB })}</div>
          ) : null}
        </div>
        {!loading && !error ? (
          <div className="dshj-modal-footer">
            <button type="button" className="dshj-btn dshj-btn-small" onClick={() => void copy()}>
              {copied ? t('copied') : t('copy')}
            </button>
            {entry.url ? (
              <a className="dshj-btn dshj-btn-small dshj-link" href={entry.url} target="_blank" rel="noopener noreferrer">
                {t('openBuildPage')} ↗
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
