/**
 * dsh-jenkins —— 统一弹框「历史」tab：聚合所有工作区最近 50 次发布，可按工作区筛选
 * （默认全部）。进行中条目由全局轮询器实时回填结果；点击已完成条目可查看完整构建日志。
 * 内容来自原「发布历史」弹框，去掉弹框外框，由 JenkinsConfigModal 提供容器。
 */

import { useEffect, useState } from 'react'
import { t } from '../i18n.ts'
import { type HistoryEntry, type StorageApi } from '../storage.ts'
import type { RunFn } from '../rpc.ts'
import type { Poller } from '../poller.ts'
import { BuildLogModal } from './BuildLogModal.tsx'
import { PickerModal, type PickerOption } from './PickerModal.tsx'

export interface HistoryTabProps {
  cwd: string
  sessionId: string
  run: RunFn
  poller: Poller
  storage: StorageApi
  useWorkspaces?: (selector: (s: { items?: Array<{ path?: string }> }) => unknown) => unknown
}

export function HistoryTab({ cwd, sessionId, run, poller, storage, useWorkspaces }: HistoryTabProps) {
  const workspaceItems = useWorkspaces && typeof useWorkspaces === 'function'
    ? (useWorkspaces((s) => (s && s.items) || []) as Array<{ path?: string }>)
    : []
  const realPaths = (Array.isArray(workspaceItems) ? workspaceItems : [])
    .map((w) => (w && typeof w.path === 'string' ? w.path : null))
    .filter((p): p is string => !!p)
  const [filter, setFilter] = useState('all')
  const [list, setList] = useState<HistoryEntry[]>([]) // 全量历史（每条含 cwd）
  const [logTarget, setLogTarget] = useState<HistoryEntry | null>(null)
  const [wsPickOpen, setWsPickOpen] = useState(false)
  const [wsPickSearch, setWsPickSearch] = useState('')
  const reload = (): void => {
    void storage.readAllHistory(sessionId).then(setList).catch(() => undefined)
  }
  // 全局轮询器每次回填结果后刷新列表（进行中 → 完成实时可见）
  useEffect(() => poller.subscribe(reload), [poller, storage, sessionId])
  useEffect(() => {
    reload()
    // tab 打开即唤醒一次扫描：空闲轮询下，遗留的进行中任务（如页面重载后）
    // 需要在此被发现并恢复后台轮询，否则列表会一直停在「进行中」。
    poller.refresh()
  }, [cwd, storage, sessionId, poller])
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
  // 有构建号 + 服务器 id 才能拉取日志
  const canOpenLog = (e: HistoryEntry): boolean => !!e.buildNumber && !!e.serverId
  return (
    <>
      <div className="dshj-server-field dshj-history-ws-field">
        <label className="dshj-server-label">{t('historyWsField')}</label>
        {/* 与「Job 列表」同款选择按钮：点击打开搜索选择弹框 */}
        <button
          type="button"
          className={'dshj-picker' + (filter === 'all' ? ' dshj-picker-empty' : '')}
          onClick={() => { setWsPickSearch(''); setWsPickOpen(true) }}
        >
          <span className="dshj-picker-value">{filterLabel}</span>
          <span className="dshj-picker-caret">▾</span>
        </button>
        <PickerModal
          open={wsPickOpen}
          title={t('historyWsField')}
          search={wsPickSearch}
          setSearch={setWsPickSearch}
          placeholder={t('historyWsPlaceholder')}
          options={wsOptions
            .filter((o) => o.label.toLowerCase().indexOf(wsPickSearch.toLowerCase()) !== -1)
            .map((o): PickerOption => ({ id: o.id, label: o.label }))}
          selectedId={filter}
          emptyText={undefined}
          onSelect={(id) => { setFilter(id); setWsPickOpen(false) }}
          onClose={() => setWsPickOpen(false)}
        />
      </div>
      {filtered.length === 0
        ? <div className="dshj-empty">{t('historyEmpty')}</div>
        : (
          <div className="dshj-history-list">
            {filtered.map((e) => {
              const paramsText = Object.keys(e.params || {}).map((k) => k + '=' + String(e.params![k])).join(', ')
              return (
                <div
                  key={e.id}
                  className={'dshj-history-item' + (canOpenLog(e) ? ' dshj-history-item-clickable' : '')}
                  title={canOpenLog(e) ? t('historyLogHint') : undefined}
                  onClick={() => { if (canOpenLog(e)) setLogTarget(e) }}
                >
                  <div className="dshj-history-head">
                    <span className="dshj-history-time">{fmtTime(e.time)}</span>
                    <span className={'dshj-history-result ' + resultClass(e.result)}>{e.result || t('historyPending')}</span>
                  </div>
                  <div className="dshj-history-main">{e.job + (e.env ? ' · ' + e.env : '')}</div>
                  <div className="dshj-history-meta">
                    {e.server ? <span className="dshj-chip">{e.server}</span> : null}
                    {e.buildNumber ? <span className="dshj-chip">#{e.buildNumber}</span> : null}
                    {filter === 'all' && e.cwd ? <span className="dshj-chip dshj-chip-ws">{e.cwd}</span> : null}
                  </div>
                  {paramsText ? <div className="dshj-history-params">{t('historyParams') + paramsText}</div> : null}
                </div>
              )
            })}
          </div>
        )}
      {filtered.length > 0
        ? (
          <div className="dshj-history-ops">
            <button
              type="button"
              className="dshj-btn dshj-btn-small dshj-btn-danger"
              onClick={() => {
                void storage.clearHistory(sessionId, filter === 'all' ? null : filter).then(reload)
              }}
            >
              {t('historyClear')}
            </button>
          </div>
        )
        : null}
      {logTarget ? (
        <BuildLogModal entry={logTarget} run={run} sessionId={sessionId} onClose={() => setLogTarget(null)} />
      ) : null}
    </>
  )
}
