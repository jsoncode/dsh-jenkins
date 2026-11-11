/**
 * dsh-jenkins —— 设置弹框左侧菜单入口页（settings.section 'dsh-jenkins'）。
 *
 * 承载原「Jenkins 配置」统一弹框的全部内容（内嵌渲染，不套 ModalPortal 外壳）：
 * - 发布：原「执行 Jenkins Job」弹框内容（服务器 / Job / 参数 / 触发 / 轮询状态）；
 * - 配置：服务器管理（增删改查 / 测试连接 / 项目配置弹框）；
 * - 本机记录：原「发布历史」内容（按工作区筛选 / 查看构建日志 / 清空）；
 * - 历史记录：指定 Job 在 Jenkins 服务器上的真实构建记录（服务器 / Job 下拉 + 构建日志）。
 *
 * 与旧 footer 入口相比的上下文差异与对策：
 * - 设置页是全局页面、不天然跟随「当前会话」，因此顶部提供工作区选择器；
 *   默认值仍按会话所属 workspace → 第一个 workspace 的旧规则自动推导，
 *   用户手动切换后本页会话期内保持手选值（重新打开设置页恢复自动跟随）。
 * - 原 footer 按钮右侧的任务状态胶囊（构建中 / 成功未读 / 有更新）随入口迁移
 *   到本页标题行右侧；「有更新」胶囊仍可点击，打开插件更新确认弹框
 *   （shell.overlay 'dsh-jenkins-update'，不随本页内嵌）。
 * - 工作区 / 会话数据来自 settings.section 组件的标准插槽 hooks
 *   （useWorkspaces / useSessions，0.2.2-rc.1 与原 shell.overlay 同款注入）。
 * - 构建日志 / 服务器编辑 / 项目模板等二级弹框保持 ModalPortal（body 顶层
 *   fixed 蒙版）渲染，不受设置面板裁切，行为与旧弹框一致。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { t } from '../i18n.ts'
import type { RunFn } from '../rpc.ts'
import type { Poller, TaskSummary } from '../poller.ts'
import type { StorageApi, HistoryEntry } from '../storage.ts'
import type { UpdateInfo } from '../store.ts'
import { JENKINS_LOGO } from '../logo.ts'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import { PublishTab } from './PublishTab.tsx'
import { SettingsPage } from './SettingsPage.tsx'
import { HistoryTab } from './HistoryTab.tsx'
import { ServerHistoryTab } from './ServerHistoryTab.tsx'
import { InlineSelect } from './InlineSelect.tsx'

type ConfigTab = 'publish' | 'config' | 'history' | 'serverHistory'

type WorkspaceItem = { path?: string; sessionIds?: string[] }

export interface SettingsSectionProps {
  run: RunFn
  poller: Poller
  storage: StorageApi
  /** 插件更新信息（store）：hasUpdate 时显示「有更新」胶囊。 */
  useUpdate(): UpdateInfo | null
  /** 点击「有更新」胶囊：打开更新确认弹框（shell.overlay 更新流程）。 */
  onUpdateRequest(): void
  /** 上报当前会话 id（供全局轮询 / 历史读取复用宿主命令）。 */
  reportSession?(sessionId: string): void
  /** settings.section 标准插槽 hook：工作区快照选择器。 */
  useWorkspaces?: (selector: (s: { items?: WorkspaceItem[] }) => unknown) => unknown
  /** settings.section 标准插槽 hook：当前会话快照选择器。 */
  useSessions?: (selector: (s: { current?: string }) => unknown) => unknown
}

const EMPTY_SUMMARY: TaskSummary = { building: 0, successUnread: 0 }

// tab 文案渲染时取词：模块加载早于 locale 订阅的初始 setLang，常量会在
// 模块期固化 import 时的语言（曾固化成英文不再跟随切换）。
const getTabs = (): Array<{ id: ConfigTab; label: string }> => [
  { id: 'publish', label: t('tabPublish') },
  { id: 'config', label: t('tabConfig') },
  { id: 'history', label: t('tabHistory') },
  { id: 'serverHistory', label: t('tabServerHistory') },
]

export function SettingsSection({ run, poller, storage, useUpdate, onUpdateRequest, reportSession, useWorkspaces, useSessions }: SettingsSectionProps) {
  const [tab, setTab] = useState<ConfigTab>('publish')
  const [configCount, setConfigCount] = useState(0) // 「配置」tab：已配置服务器数
  const [historyCount, setHistoryCount] = useState(0) // 「本机记录」tab：发布历史条数
  const [unreadCount, setUnreadCount] = useState(0) // 「本机记录」tab：未读条数（发布后未查看过该 tab）
  const [footerNode, setFooterNode] = useState<ReactNode>(null) // 当前 tab 上报的 footer 内容（无内容时不渲染 footer 栏）
  const [logTarget, setLogTarget] = useState<HistoryEntry | null>(null) // 跨 tab 的构建日志目标（发布 tab → 历史 tab）
  // 工作区手动选择覆盖（null = 跟随会话自动推导）；重新打开设置页组件重挂载即复位。
  const [cwdOverride, setCwdOverride] = useState<string | null>(null)

  // 会话 id：上报给全局轮询器 / 更新检查（原 footer 入口同款逻辑）。
  const currentSessionId = useSessions
    ? (useSessions((s) => s && s.current) as string | undefined)
    : undefined
  if (reportSession && currentSessionId) reportSession(currentSessionId)
  const sessionId = currentSessionId || ''

  const workspaceItems = useWorkspaces
    ? (useWorkspaces((s) => (s && s.items) || []) as WorkspaceItem[])
    : []
  // 自动推导工作区：会话所属 workspace 优先，否则取第一个工作区（与旧 footer 入口同规则）。
  const derivedCwd = useMemo(() => {
    const list = Array.isArray(workspaceItems) ? workspaceItems : []
    const current = list.find((w) => Array.isArray(w.sessionIds) && w.sessionIds.indexOf(currentSessionId as string) !== -1)
    return (current && current.path) || (list.length ? list[0].path : null) || ''
  }, [workspaceItems, currentSessionId])

  // 手选值失效（工作区被关闭）时回落自动推导。
  const workspacePaths = useMemo(
    () => (Array.isArray(workspaceItems) ? workspaceItems : [])
      .map((w) => (w && typeof w.path === 'string' ? w.path : ''))
      .filter((p): p is string => p !== ''),
    [workspaceItems],
  )
  const cwd = cwdOverride && workspacePaths.indexOf(cwdOverride) !== -1 ? cwdOverride : derivedCwd

  // ─── 任务状态胶囊（原 footer 按钮右侧，随入口迁入本页标题行）──────
  const [summary, setSummary] = useState<TaskSummary>(EMPTY_SUMMARY)
  useEffect(() => {
    const update = (): void => { setSummary(poller.getSummary()) }
    update()
    return poller.subscribe(update)
  }, [poller])
  // 会话切换（或首次挂载）时唤醒一次扫描，保证汇总跟随当前会话的数据
  useEffect(() => {
    if (currentSessionId) poller.refresh()
  }, [poller, currentSessionId])
  const update = useUpdate()
  const showBuilding = summary.building > 0
  const showDone = summary.successUnread > 0
  const showUpdate = !!(update && update.hasUpdate && update.latest !== '')

  // 打开指定条目的构建日志：切到「本机记录」tab 并定位弹框
  const openLog = useCallback((entry: HistoryEntry) => {
    setLogTarget(entry)
    setTab('history')
  }, [])
  // 切换到其他 tab 时清空日志目标，避免切回「本机记录」时旧日志弹框再次弹出
  useEffect(() => { if (tab !== 'history') setLogTarget(null) }, [tab])
  // 稳定引用：子组件 effect 依赖它，避免父组件每次渲染重建导致子组件 effect 反复触发
  const reportFooter = useCallback((node: ReactNode) => { setFooterNode(node) }, [])

  // 挂载即预加载两个 tab 的计数；工作区切换时重取（本页打开期间持续可见，无需开关门控）
  useEffect(() => {
    run(sessionId, { op: 'list' }).then((r) => {
      if (r && r.ok) setConfigCount(((r.servers as unknown[]) || []).length)
    }).catch(() => { })
    void storage.readAllHistory(sessionId).then((h) => {
      const list = h || []
      setHistoryCount(list.length)
      setUnreadCount(list.filter((e) => e.unread).length)
    }).catch(() => { })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, cwd])
  // 页面挂载期间订阅轮询器：新发布 / 构建完成 / 清除未读都会刷新计数与未读标记
  useEffect(() => {
    return poller.subscribe(() => {
      void storage.readAllHistory(sessionId).then((h) => {
        const list = h || []
        setHistoryCount(list.length)
        setUnreadCount(list.filter((e) => e.unread).length)
      }).catch(() => { })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poller])

  // 每次进入本页回到「发布」tab（与旧弹框每次打开一致；重挂载天然复位，
  // 这里只兜底同一挂载内工作区切换后的复位）。
  const prevCwdRef = useRef(cwd)
  useEffect(() => {
    if (cwd !== prevCwdRef.current) {
      prevCwdRef.current = cwd
      setTab('publish')
      setLogTarget(null)
    }
  }, [cwd])

  return (
    <div className="dshj-settings-section">
      {/* 标题行：logo + 标题 + 任务状态胶囊 + 工作区选择器 */}
      <div className="dshj-section-head">
        <div className="dshj-section-title">
          <img src={JENKINS_LOGO} alt="" className="dshj-logo-badge" />
          <div className="dshj-section-title-text">
            <div className="dshj-modal-title">{t('settingsNav')}</div>
            <div className="dshj-section-sub">{cwd || ''}</div>
          </div>
        </div>
        {showBuilding || showDone || showUpdate ? (
          <span className="dshj-section-caps">
            {showBuilding ? (
              <span className="dshj-capsule dshj-capsule-building" title={t('footerBuilding') + ': ' + summary.building}>
                {summary.building}
              </span>
            ) : null}
            {showDone ? (
              <span className="dshj-capsule dshj-capsule-done" title={t('footerDoneUnread') + ': ' + summary.successUnread}>
                {summary.successUnread}
              </span>
            ) : null}
            {/* 有更新：可点击，打开更新确认弹框（与旧 footer 胶囊同行为） */}
            {showUpdate ? (
              <button
                type="button"
                className="dshj-capsule-wrap"
                title={t('footerUpdateTitle', { v: update.latest, c: update.current })}
                aria-label={t('footerUpdate')}
                onClick={onUpdateRequest}
              >
                <span className="dshj-capsule dshj-capsule-update">{t('footerUpdate')}</span>
              </button>
            ) : null}
          </span>
        ) : null}
        <div className="dshj-section-ws">
          <span className="dshj-section-ws-label">{t('workspaceLabel')}</span>
          <InlineSelect
            value={cwd}
            placeholder={t('workspaceEmpty')}
            options={workspacePaths.map((p) => ({ id: p, label: p }))}
            onChange={(id) => setCwdOverride(id)}
            searchPlaceholder={t('pickerSearchPlaceholder')}
            emptyText={t('workspaceEmpty')}
          />
        </div>
      </div>
      {/* tab 行（标题行下方整行） */}
      <div className="dshj-tabs dshj-section-tabs" role="tablist">
        {getTabs().map((item) => {
          const count = item.id === 'config' ? configCount : item.id === 'history' ? historyCount : 0
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={'dshj-tab' + (tab === item.id ? ' dshj-tab-active' : '')}
              onClick={() => setTab(item.id)}
            >
              {item.label}
              {item.id === 'history' && unreadCount > 0 ? <span className="dshj-tab-dot" title={t('unreadCount', { n: unreadCount })} /> : null}
              {count > 0 ? <span className="dshj-badge">{count}</span> : null}
            </button>
          )
        })}
      </div>
      <div className="dshj-modal-body dshj-config-body">
        {tab === 'publish' ? (
          <ErrorBoundary label="PublishTab">
            <PublishTab initialCwd={cwd} sessionId={sessionId} run={run} poller={poller} storage={storage} workspaceItems={workspaceItems} onCountChange={setConfigCount} onFooter={reportFooter} onOpenLog={openLog} />
          </ErrorBoundary>
        ) : tab === 'config' ? (
          <ErrorBoundary label="SettingsPage">
            <SettingsPage run={run} sessionId={sessionId} cwd={cwd} workspaceItems={workspaceItems} onCountChange={setConfigCount} />
          </ErrorBoundary>
        ) : tab === 'history' ? (
          <ErrorBoundary label="HistoryTab">
            <HistoryTab cwd={cwd} sessionId={sessionId} run={run} poller={poller} storage={storage} onCountChange={setHistoryCount} onFooter={reportFooter} logTarget={logTarget} onLogTargetChange={setLogTarget} />
          </ErrorBoundary>
        ) : (
          <ErrorBoundary label="ServerHistoryTab">
            <ServerHistoryTab run={run} sessionId={sessionId} poller={poller} />
          </ErrorBoundary>
        )}
      </div>
      {footerNode ? <div className="dshj-modal-footer dshj-section-footer">{footerNode}</div> : null}
    </div>
  )
}
