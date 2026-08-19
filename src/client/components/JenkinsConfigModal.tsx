/**
 * dsh-jenkins —— 统一「Jenkins 配置」弹框（shell.overlay）：
 * 侧边栏底部「Jenkins 配置」入口打开的单一弹框，三个 tab：
 * - 发布：原「执行 Jenkins Job」弹框内容（服务器 / Job / 参数 / 触发 / 轮询状态）；
 * - 配置：原设置页内容（服务器管理：增删改查 / 测试连接 / 模板）；
 * - 历史：原「发布历史」弹框内容（按工作区筛选 / 查看构建日志 / 清空）。
 *
 * 当前工作区（cwd）与会话 id 由宿主 overlay 的 useWorkspaces / useSessions 推导，
 * 三个 tab 共享同一份上下文。
 */

import { useMemo, useState } from 'react'
import { t } from '../i18n.ts'
import type { RunFn } from '../rpc.ts'
import type { Poller } from '../poller.ts'
import type { StorageApi } from '../storage.ts'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import { PublishTab } from './PublishTab.tsx'
import { SettingsPage } from './SettingsPage.tsx'
import { HistoryTab } from './HistoryTab.tsx'

type ConfigTab = 'publish' | 'config' | 'history'

type WorkspaceItem = { path?: string; sessionIds?: string[] }

export interface JenkinsConfigModalProps {
  run: RunFn
  poller: Poller
  storage: StorageApi
  useOpen(): boolean
  close(): void
  useWorkspaces?: (selector: (s: { items?: WorkspaceItem[] }) => unknown) => unknown
  useSessions?: (selector: (s: { current?: string }) => unknown) => unknown
}

const TABS: Array<{ id: ConfigTab; label: string }> = [
  { id: 'publish', label: t('tabPublish') },
  { id: 'config', label: t('tabConfig') },
  { id: 'history', label: t('tabHistory') },
]

export function JenkinsConfigModal({ run, poller, storage, useOpen, close, useWorkspaces, useSessions }: JenkinsConfigModalProps) {
  const open = useOpen()
  const [tab, setTab] = useState<ConfigTab>('publish')
  const workspaceItems = useWorkspaces
    ? (useWorkspaces((s) => (s && s.items) || []) as WorkspaceItem[])
    : []
  const currentSessionId = useSessions
    ? (useSessions((s) => s && s.current) as string | undefined)
    : undefined
  const sessionId = currentSessionId || ''
  // 当前工作区：会话所属 workspace 优先，否则取第一个工作区（与旧 footer 入口同规则）。
  const cwd = useMemo(() => {
    const list = Array.isArray(workspaceItems) ? workspaceItems : []
    const current = list.find((w) => Array.isArray(w.sessionIds) && w.sessionIds.indexOf(currentSessionId as string) !== -1)
    return (current && current.path) || (list.length ? list[0].path : null) || ''
  }, [workspaceItems, currentSessionId])
  if (!open) return null
  return (
    <div className="dshj-backdrop" onClick={close}>
      <div className="dshj-modal dshj-config-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dshj-modal-header">
          <div>
            <div className="dshj-modal-title">{t('settingsNav')}</div>
            <div className="dshj-modal-sub">{cwd || ''}</div>
          </div>
          <button type="button" className="dshj-close" aria-label={t('close')} title={t('close')} onClick={close}>✕</button>
        </div>
        <div className="dshj-tabs" role="tablist">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={'dshj-tab' + (tab === item.id ? ' dshj-tab-active' : '')}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="dshj-modal-body dshj-config-body">
          {tab === 'publish' ? (
            <ErrorBoundary label="PublishTab">
              <PublishTab initialCwd={cwd} sessionId={sessionId} run={run} poller={poller} storage={storage} workspaceItems={workspaceItems} />
            </ErrorBoundary>
          ) : tab === 'config' ? (
            <ErrorBoundary label="SettingsPage">
              <SettingsPage run={run} sessionId={sessionId} />
            </ErrorBoundary>
          ) : (
            <ErrorBoundary label="HistoryTab">
              <HistoryTab cwd={cwd} sessionId={sessionId} run={run} poller={poller} storage={storage} useWorkspaces={useWorkspaces as HistoryTabWorkspaceHooks['useWorkspaces']} />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  )
}

/** history tab 宿主注入的 hooks 形状。 */
interface HistoryTabWorkspaceHooks {
  useWorkspaces(selector: (s: { items?: Array<{ path?: string }> }) => unknown): unknown
}
