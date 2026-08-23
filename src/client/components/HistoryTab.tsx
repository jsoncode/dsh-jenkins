/**
 * dsh-jenkins —— 统一弹框「历史」tab：聚合所有工作区最近 50 次发布，可按工作区筛选
 * （默认全部）。进行中条目由全局轮询器实时回填结果。每条记录提供两个独立操作：
 * 「查看详情」打开构建日志弹框、「打开原始任务」在浏览器中跳转 Jenkins 页面。
 * 内容来自原「发布历史」弹框，去掉弹框外框，由 JenkinsConfigModal 提供容器。
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { t } from '../i18n.ts'
import { type HistoryEntry, type StorageApi } from '../storage.ts'
import type { RunFn } from '../rpc.ts'
import type { Poller } from '../poller.ts'
import { BuildLogModal } from './BuildLogModal.tsx'
import { InlineSelect, type InlineSelectOption } from './InlineSelect.tsx'
import { SvgCheck, SvgCopy } from './SvgIcons.tsx'
import { ModalPortal } from './ModalPortal.tsx'

export interface HistoryTabProps {
  cwd: string
  sessionId: string
  run: RunFn
  poller: Poller
  storage: StorageApi
  onCountChange?: (count: number) => void
  /** 上报本 tab 的 footer 操作按钮（由弹框渲染在固定 footer 区；null/undefined 表示无）。 */
  onFooter?: (node: ReactNode) => void
  /** 外部指定的日志目标（由父弹框控制，如发布 tab 的「查看完整日志」跳转）；缺省时内部自管。 */
  logTarget?: HistoryEntry | null
  onLogTargetChange?: (entry: HistoryEntry | null) => void
}

export function HistoryTab({ cwd, sessionId, run, poller, storage, onCountChange, onFooter, logTarget: logTargetProp, onLogTargetChange }: HistoryTabProps) {
  const [filter, setFilter] = useState('all')
  const [list, setList] = useState<HistoryEntry[]>([]) // 全量历史（每条含 cwd）
  // 日志目标：外部传入时受控（发布 tab 跳转复用），否则内部自管
  const [localTarget, setLocalTarget] = useState<HistoryEntry | null>(null)
  const logTarget = logTargetProp !== undefined ? logTargetProp : localTarget
  const setLogTarget = (e: HistoryEntry | null): void => {
    if (logTargetProp !== undefined) { if (onLogTargetChange) onLogTargetChange(e) }
    else setLocalTarget(e)
  }
  const reload = useCallback((): void => {
    void storage.readAllHistory(sessionId).then((h) => {
      setList(h)
      if (onCountChange) onCountChange((h || []).length)
    }).catch(() => undefined)
  }, [storage, sessionId, onCountChange])
  // 全局轮询器每次回填结果后刷新列表（进行中 → 完成实时可见）
  useEffect(() => poller.subscribe(reload), [poller, reload])
  useEffect(() => {
    let alive = true
    // 打开「历史」tab：先清除全部未读，再加载列表 —— 发布后未查看过的条目视为已读，
    // 随后刷新一次扫描（汇总归零），驱动 footer 的「已完成（未读）」绿色胶囊与
    // tab 未读点消失；同时唤醒空闲轮询（遗留的进行中任务在此被发现并恢复后台轮询）。
    void storage.markAllHistoryRead(sessionId).catch(() => undefined).then(() => {
      if (!alive) return
      reload()
      poller.refresh()
    })
    return () => { alive = false }
  }, [reload, poller, storage, sessionId])
  // 工作区选项：仅列出曾经发布过的记录里的工作区（去重排序），外加「全部」
  const wsPaths = [...new Set(list.map((e) => e.cwd).filter((p): p is string => !!p))].sort()
  const wsOptions = [{ id: 'all', label: t('historyAll') }].concat(wsPaths.map((p) => ({ id: p, label: p })))
  const filtered = filter === 'all' ? list : list.filter((e) => e.cwd === filter)
  // 分页：默认每页 20 条，可切换每页条数；筛选/数据变化时页号收敛到有效范围
  const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages, filter])
  const changePageSize = (v: string): void => {
    const n = Number(v)
    setPageSize(n > 0 ? n : 20)
    setPage(1)
  }
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)
  const fmtTime = (ts: number): string => {
    try { return new Date(ts).toLocaleString() } catch (e) { return String(ts) }
  }
  const resultClass = (r: string | null | undefined): string => {
    if (!r) return 'dshj-history-pending'
    if (r === 'SUCCESS') return 'dshj-ok'
    if (r === 'FAILURE' || r === 'ABORTED') return 'dshj-err'
    return 'dshj-warn'
  }
  // 有构建号或队列号 + 服务器 id 才能拉取日志（排队中的条目打开后等待首个日志输出再实时刷新）
  const canOpenLog = (e: HistoryEntry): boolean => !!e.serverId && !!(e.buildNumber || e.queueId)
  // 已配置服务器（用于为无 entry.url 的条目拼出 Jenkins 页面地址）
  const [servers, setServers] = useState<Array<{ id: string; name: string; baseUrl: string }>>([])
  useEffect(() => {
    let alive = true
    run(sessionId, { op: 'list' }).then((r) => {
      if (alive && r && r.ok) setServers(((r.servers as Array<{ id: string; name: string; baseUrl: string }>) || []))
    }).catch(() => undefined)
    return () => { alive = false }
  }, [run, sessionId])
  // 「打开原始任务」跳转地址：优先构建页（轮询完成时回填的 url）；没有则按服务器 + Job 路径
  // 拼出（有构建号给构建页，否则给 Job 页）；服务器已删除且无回填地址时返回空串（隐藏按钮）。
  const jobUrlOf = (e: HistoryEntry): string => {
    if (e.url) return e.url
    const s = servers.find((x) => x.id === e.serverId || (e.server && x.name === e.server))
    if (!s) return ''
    const base = (s.baseUrl || '').replace(/\/+$/, '')
    const segs = Array.isArray(e.segments) && e.segments.length ? e.segments : (e.job || '').split('/').filter(Boolean)
    if (segs.length === 0) return ''
    const jobPart = segs.map((seg) => '/job/' + encodeURIComponent(seg)).join('')
    return e.buildNumber ? base + jobPart + '/' + e.buildNumber + '/' : base + jobPart
  }
  // 参数复制：当前正在复制成功的条目 id（用于图标切换为对勾），1.5s 后复原
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const copyParams = async (e: HistoryEntry): Promise<void> => {
    if (!e.params) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(e.params, null, 2))
      setCopiedId(e.id)
      setTimeout(() => setCopiedId((cur) => (cur === e.id ? null : cur)), 1500)
    } catch { /* 剪贴板不可用时静默忽略 */ }
  }
  // 清空历史：先弹框确认再执行（避免误触直接清空）；scope 跟随当前工作区筛选
  const [confirmClear, setConfirmClear] = useState(false)
  const doClear = (): void => {
    setConfirmClear(false)
    void storage.clearHistory(sessionId, filter === 'all' ? null : filter).then(reload)
  }
  // footer 操作按钮：有历史记录时显示「清空」（点击弹确认框）；useMemo 保持引用稳定避免父组件渲染循环。
  const footerNode = useMemo<ReactNode>(() => {
    if (filtered.length === 0) return null
    return (
      <button
        type="button"
        className="dshj-btn dshj-btn-small dshj-btn-danger"
        onClick={() => setConfirmClear(true)}
      >
        {t('historyClear')}
      </button>
    )
  }, [filtered.length, storage, sessionId, reload])

  // 上报 footer；卸载时清空（与 PublishTab 同一模式）。
  useEffect(() => {
    onFooter?.(footerNode)
    return () => onFooter?.(null)
  }, [footerNode, onFooter])

  return (
    <>
      {/* 工作区筛选下拉：无 label，占满整行；与「发布」tab 同款内联下拉，可直接搜索工作区路径 */}
      <div className="dshj-server-field dshj-history-ws-field">
        <InlineSelect
          value={filter}
          placeholder={t('historyWsPlaceholder')}
          searchPlaceholder={t('historyWsPlaceholder')}
          options={wsOptions.map((o): InlineSelectOption => ({ id: o.id, label: o.label }))}
          onChange={(id) => setFilter(id)}
        />
      </div>
      {filtered.length === 0
        ? <div className="dshj-empty">{t('historyEmpty')}</div>
        : (
          <>
          <div className="dshj-history-list">
            {paged.map((e) => {
              const hasParams = !!e.params && Object.keys(e.params).length > 0
              const paramsText = hasParams ? Object.keys(e.params!).map((k) => k + '=' + String(e.params![k])).join(', ') : ''
              const jobUrl = jobUrlOf(e)
              return (
                <div key={e.id} className="dshj-history-item">
                  <div className="dshj-history-head">
                    <span className="dshj-history-time">{fmtTime(e.time)}</span>
                    {/* 未读标记：发布后未打开过「历史」tab 查看的条目（打开后自动清除） */}
                    {e.unread ? <span className="dshj-unread-tag">{t('unread')}</span> : null}
                    <span className={'dshj-history-result ' + resultClass(e.result)}>{e.result || t('historyPending')}</span>
                  </div>
                  <div className="dshj-history-main">{e.job + (e.env ? ' · ' + e.env : '')}</div>
                  <div className="dshj-history-meta">
                    {e.server ? <span className="dshj-chip">{e.server}</span> : null}
                    {e.buildNumber ? <span className="dshj-chip">#{e.buildNumber}</span> : e.queueId ? <span className="dshj-chip">Q#{e.queueId}</span> : null}
                    {filter === 'all' && e.cwd ? <span className="dshj-chip dshj-chip-ws">{e.cwd}</span> : null}
                  </div>
                  {hasParams ? (
                    <div className="dshj-history-params-row">
                      <div className="dshj-history-params" title={paramsText}>{t('historyParams') + paramsText}</div>
                      {/* 复制参数：剪贴板写入 JSON 格式（缩进 2 空格） */}
                      <button
                        type="button"
                        className="dshj-btn-icon dshj-history-params-copy"
                        title={copiedId === e.id ? t('copied') : t('copyParams')}
                        onClick={() => void copyParams(e)}
                      >
                        {copiedId === e.id ? <SvgCheck size={14} /> : <SvgCopy size={14} />}
                      </button>
                    </div>
                  ) : null}
                  {/* 操作按钮：整卡不再整体可点击，拆分为「查看完整日志」（打开日志弹框）与「打开原始任务」（浏览器跳转 Jenkins 页面） */}
                  {canOpenLog(e) || jobUrl ? (
                    <div className="dshj-history-actions">
                      {canOpenLog(e) ? (
                        <button type="button" className="dshj-btn dshj-btn-small" title={t('historyLogHint')} onClick={() => setLogTarget(e)}>{t('viewFullLog')}</button>
                      ) : null}
                      {jobUrl ? (
                        <a className="dshj-btn dshj-btn-small dshj-link" href={jobUrl} target="_blank" rel="noopener noreferrer">{t('openOriginalJob')} ↗</a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
          {/* 分页条：共 N 条 · 每页条数可切换 · 上一页/下一页 */}
          <div className="dshj-pagination">
            <span className="dshj-pagination-info">{t('paginationTotal', { n: filtered.length })}</span>
            <span className="dshj-pagination-size-label">{t('paginationSize')}</span>
            <select
              className="dshj-select dshj-pagination-size"
              value={pageSize}
              title={t('paginationSize')}
              onChange={(ev) => changePageSize(ev.target.value)}
            >
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <button
              type="button"
              className="dshj-btn dshj-btn-small"
              title={t('prevPage')}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >‹</button>
            <span className="dshj-pagination-page">{t('paginationPage', { cur: page, total: totalPages })}</span>
            <button
              type="button"
              className="dshj-btn dshj-btn-small"
              title={t('nextPage')}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >›</button>
          </div>
          </>
        )}
      {logTarget ? (
        <BuildLogModal entry={logTarget} run={run} sessionId={sessionId} poller={poller} onClose={() => setLogTarget(null)} />
      ) : null}
      {/* 清空历史确认弹框：点击「清空」后先确认（显示清空范围），确认后才真正执行 */}
      {confirmClear ? (
        <ModalPortal
          backdropClass="dshj-json-backdrop dshj-confirm-backdrop"
          modalClass="dshj-confirm-modal"
          onBackdropClose={() => setConfirmClear(false)}
        >
          <div className="dshj-modal-header">
            <div>
              <div className="dshj-modal-title">{t('confirmClearTitle')}</div>
              <div className="dshj-modal-sub">{t('historyTitle')}</div>
            </div>
            <button type="button" className="dshj-close" aria-label={t('close')} title={t('close')} onClick={() => setConfirmClear(false)}>✕</button>
          </div>
          <div className="dshj-modal-body">
            <div className="dshj-empty">
              {filter === 'all' ? t('confirmClearAll') : t('confirmClearCwd', { path: filter })}
            </div>
          </div>
          <div className="dshj-modal-footer">
            <button type="button" className="dshj-btn" onClick={() => setConfirmClear(false)}>{t('cancelBtn')}</button>
            <button type="button" className="dshj-btn dshj-btn-solid" onClick={doClear}>{t('confirmClear')}</button>
          </div>
        </ModalPortal>
      ) : null}
    </>
  )
}
