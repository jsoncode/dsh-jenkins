/**
 * dsh-jenkins —— 发布历史弹框：聚合所有工作区最近 50 次发布，可按工作区筛选（默认全部）。
 */

import { useEffect, useState } from 'react'
import { t } from '../i18n.ts'
import { storage, type HistoryEntry } from '../storage.ts'

export interface HistoryModalProps {
  historyStore: { close(): void }
  useWorkspaces?: (selector: (s: { items?: Array<{ path?: string }> }) => unknown) => unknown
  useLaunch(): string | null
}

export function HistoryModal({ historyStore, useWorkspaces, useLaunch }: HistoryModalProps) {
  const cwd = useLaunch()
  const workspaceItems = useWorkspaces && typeof useWorkspaces === 'function'
    ? (useWorkspaces((s) => (s && s.items) || []) as Array<{ path?: string }>)
    : []
  const realPaths = (Array.isArray(workspaceItems) ? workspaceItems : [])
    .map((w) => (w && typeof w.path === 'string' ? w.path : null))
    .filter((p): p is string => !!p)
  const [filter, setFilter] = useState('all')
  const [list, setList] = useState<HistoryEntry[]>([]) // 全量历史（每条含 cwd）
  useEffect(() => {
    if (!cwd) { setList([]); return }
    setList(storage.readAllHistory())
  }, [cwd])
  if (!cwd) return null
  // 工作区选项：真实工作区 + 有历史记录的路径（去重排序），外加「全部」
  const wsPaths = [...new Set([...realPaths, ...list.map((e) => e.cwd).filter((p): p is string => !!p)])].sort()
  const wsOptions = [{ id: 'all', label: t('historyAll') }].concat(wsPaths.map((p) => ({ id: p, label: p })))
  const filtered = filter === 'all' ? list : list.filter((e) => e.cwd === filter)
  const filterLabel = filter === 'all' ? t('historyAll') : filter
  const fmtTime = (ts: number): string => {
    try { return new Date(ts).toLocaleString() } catch (e) { return String(ts) }
  }
  const resultClass = (r: string | null | undefined): string => {
    if (!r) return 'dshj-history-pending'
    if (r === 'SUCCESS') return 'dshj-ok'
    if (r === 'FAILURE' || r === 'ABORTED') return 'dshj-err'
    return 'dshj-warn'
  }
  return (
    <div className="dshj-backdrop" onClick={() => historyStore.close()}>
      <div className="dshj-modal dshj-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dshj-modal-header">
          <div>
            <div className="dshj-modal-title">{t('historyTitle')}</div>
            <div className="dshj-modal-sub">{filterLabel}</div>
          </div>
          <button type="button" className="dshj-close" aria-label={t('close')} title={t('close')} onClick={() => historyStore.close()}>✕</button>
        </div>
        <div className="dshj-modal-body">
          <div className="dshj-server-field">
            <label className="dshj-server-label">{t('historyWsField')}</label>
            <select
              className="dshj-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {wsOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          {filtered.length === 0
            ? <div className="dshj-empty">{t('historyEmpty')}</div>
            : (
              <div className="dshj-history-list">
                {filtered.map((e) => (
                  <div key={e.id} className="dshj-history-item">
                    <div className="dshj-history-head">
                      <span className="dshj-history-time">{fmtTime(e.time)}</span>
                      <span className={'dshj-history-result ' + resultClass(e.result)}>{e.result || t('historyPending')}</span>
                    </div>
                    {filter === 'all' ? <div className="dshj-history-ws">{e.cwd}</div> : null}
                    <div className="dshj-history-main">{e.job + (e.env ? ' · ' + e.env : '') + (e.server ? ' · ' + e.server : '')}</div>
                    <div className="dshj-history-params">{t('historyParams') + Object.keys(e.params || {}).map((k) => k + '=' + String(e.params![k])).join(', ')}</div>
                  </div>
                ))}
              </div>
            )}
        </div>
        {filtered.length > 0
          ? (
            <div className="dshj-history-ops">
              <button
                type="button"
                className="dshj-btn dshj-btn-small dshj-btn-danger"
                onClick={() => {
                  storage.clearHistory(filter === 'all' ? null : filter)
                  setList(storage.readAllHistory())
                }}
              >
                {t('historyClear')}
              </button>
            </div>
          )
          : null}
      </div>
    </div>
  )
}
