/**
 * dsh-jenkins —— 构建完整日志弹框：从历史条目点击打开，拉取 Jenkins consoleText 展示。
 *
 * 实时性：进行中（排队 / 构建中）的条目每 1 秒轮询一次日志自动刷新，构建结束后
 * 自动停止轮询并做最后一次刷新（宿主当前无 socket 通道，1s 轮询是轻量替代；
 * 轮询器订阅保证「排队 → 构建中 → 完成」状态切换能驱动日志刷新与按钮显隐）。
 * footer 提供「终止」按钮（红色，两次点击确认，与设置页删除服务器同款交互），
 * 排队阶段取消队列项、已开始则停止构建。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { t, tErr } from '../i18n.ts'
import { ansiToHtml } from '../ansi.ts'
import type { RunFn } from '../rpc.ts'
import type { HistoryEntry } from '../storage.ts'
import type { Poller } from '../poller.ts'
import { SvgCompress, SvgExpand } from './SvgIcons.tsx'

const MAX_LOG_KB = 500
const LOG_POLL_MS = 1000

export interface BuildLogModalProps {
  entry: HistoryEntry
  run: RunFn
  sessionId: string
  onClose(): void
  /** 全局轮询器：用于实时判断构建是否仍在进行（进行中才持续刷新日志 / 显示终止按钮）。 */
  poller?: Poller
}

export function BuildLogModal({ entry, run, sessionId, onClose, poller }: BuildLogModalProps) {
  const [loading, setLoading] = useState(true)
  const [log, setLog] = useState('')
  const [error, setError] = useState('')
  const [truncated, setTruncated] = useState(false)
  const [copied, setCopied] = useState(false)
  // 终止构建：两次点击确认（第一次进入确认态，第二次执行），与设置页删除服务器同款交互
  const [armCancel, setArmCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelMsg, setCancelMsg] = useState('')
  const [cancelOk, setCancelOk] = useState(false)
  // 网页全屏（CSS 铺满视口，非系统全屏）：进入/退出切换
  const [fullscreen, setFullscreen] = useState(false)

  const segments = useMemo<string[]>(() => {
    if (Array.isArray(entry.segments) && entry.segments.length) return entry.segments
    return (entry.job || '').split('/').filter(Boolean)
  }, [entry])

  // 订阅轮询器：构建状态变化（排队 → 构建中 → 完成）时重渲染，驱动日志刷新与终止按钮显隐
  const [, setTick] = useState(0)
  useEffect(() => (poller ? poller.subscribe(() => setTick((x) => x + 1)) : undefined), [poller])

  const live = poller ? poller.getLive(entry.id) : undefined
  // 当前有效构建号：历史快照可能停在排队阶段（无构建号），轮询器回填后取其最新值
  const buildNumber = entry.buildNumber ?? live?.buildNumber ?? null
  const buildNumberRef = useRef(buildNumber)
  buildNumberRef.current = buildNumber
  // 进行中：轮询器有实时数据按阶段判定；无实时数据（如未纳入轮询的条目）回退到历史快照
  const inFlight = live
    ? live.phase === 'queued' || live.phase === 'running'
    : entry.result == null && !!(buildNumber || entry.queueId)
  const inFlightRef = useRef(inFlight)
  inFlightRef.current = inFlight
  // 终止仅对可定位的构建有效（有构建号或队列号）
  const canCancel = inFlight && (!!buildNumber || !!entry.queueId)

  const aliveRef = useRef(true)
  const fetchingRef = useRef(false)
  const fetchLog = useCallback(async (): Promise<void> => {
    const num = buildNumberRef.current
    if (!num) {
      // 排队中尚无构建号：保持等待态，不当作错误
      setLoading(false)
      return
    }
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const res = await run(sessionId, {
        op: 'buildLog',
        serverId: entry.serverId,
        segments,
        buildNumber: num,
      })
      if (!aliveRef.current) return
      if (res && res.ok) {
        setLog(String(res.log || ''))
        setTruncated(!!res.truncated)
        setError('')
      } else if (res && (res.notFound || res.code === 'build-not-found')) {
        // 构建记录尚未出现（竞态）：进行中时静默保留等待态，完成后才提示
        if (!inFlightRef.current) setError(tErr(res, t('logFailed')))
        else setError('')
      } else {
        setError(tErr(res, t('logFailed')))
      }
    } catch (e) {
      if (aliveRef.current) setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [run, sessionId, entry.serverId, segments])

  useEffect(() => {
    aliveRef.current = true
    let timer: number | undefined
    // 首次加载；进行中时每 1s 轮询一次日志，构建结束后做最后一次刷新并停止轮询
    void fetchLog()
    const tick = (): void => {
      if (inFlightRef.current) void fetchLog()
      else {
        if (timer !== undefined) { clearInterval(timer); timer = undefined }
        void fetchLog()
      }
    }
    if (inFlightRef.current) timer = window.setInterval(tick, LOG_POLL_MS)
    return () => {
      aliveRef.current = false
      if (timer !== undefined) clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id])

  // 日志更新后自动滚到底部（用户上滚查看历史时暂停跟随）
  const codeRef = useRef<HTMLPreElement>(null)
  const stickRef = useRef(true)
  const onScroll = (): void => {
    const el = codeRef.current
    if (!el) return
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
  }
  useEffect(() => {
    const el = codeRef.current
    if (el && stickRef.current) el.scrollTop = el.scrollHeight
  }, [log])
  // ANSI 渲染结果按日志内容缓存：内容未变化时跳过重复转换
  const html = useMemo(() => ansiToHtml(log), [log])

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(log)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  // 终止构建：排队阶段取消队列项；已开始则停掉构建（Jenkins stop）
  const doCancel = async (): Promise<void> => {
    if (cancelling) return
    setCancelling(true)
    setCancelMsg('')
    try {
      const res = await run(sessionId, {
        op: 'cancel',
        serverId: entry.serverId,
        segments,
        buildNumber: buildNumberRef.current ?? undefined,
        queueId: entry.queueId ?? undefined,
      })
      const ok = !!(res && res.ok)
      setCancelOk(ok)
      setCancelMsg(ok ? t('cancelRequested') : tErr(res, t('cancelFailed')))
      setArmCancel(false)
    } catch (e) {
      setCancelOk(false)
      setCancelMsg(e instanceof Error ? e.message : String(e))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="dshj-backdrop dshj-json-backdrop" onClick={onClose}>
      <div className={'dshj-modal dshj-log-modal' + (fullscreen ? ' dshj-log-fullscreen' : '')} onClick={(e) => e.stopPropagation()}>
        <div className="dshj-modal-header">
          <div>
            <div className="dshj-modal-title">
              {t('logTitle')}
              {inFlight ? <span className="dshj-log-live-tag">{t('liveStatus')}</span> : null}
            </div>
            <div className="dshj-modal-sub">
              {entry.job}
              {entry.buildNumber ? ' #' + entry.buildNumber : ''}
              {entry.server ? ' · ' + entry.server : ''}
            </div>
          </div>
          <div className="dshj-head-ops">
            {/* 网页全屏切换：CSS 铺满视口，非系统全屏 */}
            <button
              type="button"
              className="dshj-btn-icon"
              aria-label={fullscreen ? t('exitFullscreen') : t('enterFullscreen')}
              title={fullscreen ? t('exitFullscreen') : t('enterFullscreen')}
              onClick={() => setFullscreen((f) => !f)}
            >
              {fullscreen ? <SvgCompress size={15} /> : <SvgExpand size={15} />}
            </button>
            <button type="button" className="dshj-close" aria-label={t('close')} title={t('close')} onClick={onClose}>✕</button>
          </div>
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
            // ANSI 控制序列（颜色/加粗）转 HTML 渲染，还原终端配色；进行中自动跟随底部
            <pre ref={codeRef} className="dshj-code dshj-log-code" onScroll={onScroll} dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <pre className="dshj-code dshj-log-code">{inFlight ? t('logWaiting') : t('logEmpty')}</pre>
          )}
          {truncated && !loading && !error ? (
            <div className="dshj-log-truncated">{t('logTruncated', { kb: MAX_LOG_KB })}</div>
          ) : null}
        </div>
        <div className="dshj-modal-footer">
          {inFlight ? <span className="dshj-log-live">{t('liveStatus')}</span> : null}
          {cancelMsg ? <span className={'dshj-log-cancel-msg ' + (cancelOk ? 'dshj-log-cancel-msg-ok' : 'dshj-log-cancel-msg-err')}>{cancelMsg}</span> : null}
          {canCancel ? (
            <button
              type="button"
              className={'dshj-btn dshj-btn-small' + (armCancel || cancelling ? ' dshj-btn-solid' : ' dshj-btn-danger')}
              disabled={cancelling}
              onClick={() => { if (armCancel) void doCancel(); else setArmCancel(true) }}
            >
              {cancelling ? t('cancelling') : armCancel ? t('confirmCancelBuild') : t('cancelBuild')}
            </button>
          ) : null}
          {log ? (
            <button type="button" className="dshj-btn dshj-btn-small" onClick={() => void copy()}>
              {copied ? t('copied') : t('copy')}
            </button>
          ) : null}
          {entry.url ? (
            <a className="dshj-btn dshj-btn-small dshj-link" href={entry.url} target="_blank" rel="noopener noreferrer">
              {t('openBuildPage')} ↗
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
