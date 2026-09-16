/**
 * dsh-jenkins —— 统一弹框「发布」tab：项目 → 服务器（= 环境） → Job → 参数表单回显 →
 * 触发构建 → 轮询状态（排队 → 构建中 → 结果）。
 *
 * 只有三行选择项（环境不单独占一行：项目配置里每个环境本来就对应一台服务器）：
 * 1. **项目**：集中式项目配置（`$DSH_HOME/dsh-jenkins-map.json`，由各工作区根目录的
 *    dsh-jenkins.{json,js,ts} 自动发现合并而来）里的项目；
 * 2. **服务器**：候选 = 项目配置引用过的服务器 ∩ 已配置服务器（无交集时退化为全部），
 *    标签带环境名前缀（`UAT · 腾讯云UAT` / `生产 · 腾讯云生产`）—— **选服务器即切环境**，
 *    Job 与参数随该环境的发布目标自动切换；
 * 3. **Job 列表**：按所选服务器实时拉取，自动预选当前环境对应的 Job。
 *
 * 发布统一经 trigger 通道提交（服务器 / Job / 参数都由表单解析完毕）。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { fmtDur, t, tErr } from '../i18n.ts'
import { matchServer, type CachedLaunch, type HistoryEntry, type StorageApi } from '../storage.ts'
import {
  folderNameOf,
  projectCwd,
  sanitizeProjects,
  targetLabel,
  targetsToEntries,
  type ConfigEntry,
  type ProjectConfigMap,
} from '../projects.ts'
import type { RunFn } from '../rpc.ts'
import type { Poller } from '../poller.ts'
import { ServerEditorModal } from './ServerEditorModal.tsx'
import { InlineSelect, type InlineSelectOption } from './InlineSelect.tsx'
import { ModalPortal } from './ModalPortal.tsx'

interface Server {
  id: string
  name: string
  baseUrl: string
  username: string
  tokenMasked: string
  hasToken: boolean
  insecure: boolean
}

interface JobItem {
  path: string
  name: string
  color: string
  buildable: boolean
  folder: boolean
  url: string
}

interface ParamDef {
  name: string
  description: string
  type: string
  defaultValue: string | number | boolean
  choices: string[] | null
  /** 多选（Extended Choice multiSelect / uno-choice MultiSelect）：勾选列表，按 delimiter 拼接提交。 */
  multiSelect?: boolean
  /** 多选值分隔符（默认 `,`）。 */
  delimiter?: string
  /** 原本是下拉但选项由脚本生成且未能解析 → 已降级为文本输入（界面给出提示）。 */
  dynamic?: boolean
}

type RunPhase = 'queued' | 'running' | 'done' | 'error'

interface RunState {
  phase: RunPhase
  queueId: number | null
  serverId: string
  segments: string[]
  buildNumber: number | null
  historyId: string
  message: string
  since: number
  result?: string
  duration?: number
  url?: string
}

/** DSH 工作区条目（与 modal 的 useWorkspaces 返回形状一致）。 */
export interface WorkspaceItem {
  path?: string
  sessionIds?: string[]
}

/** dsh-jenkins 工作区配置（存在时用于增强，不存在不阻塞）。 */
interface WorkspaceConfig {
  entries: ConfigEntry[]
  /** 配置文件相对工作区根目录的文件名（dsh-jenkins.json/js/ts）。 */
  file?: string
}

export interface PublishTabProps {
  /** 初始项目（当前会话所属工作区，弹框打开时传入）。 */
  initialCwd: string
  sessionId: string
  run: RunFn
  poller: Poller
  storage: StorageApi
  workspaceItems: WorkspaceItem[]
  onCountChange?: (count: number) => void
  /** 上报本 tab 的 footer 操作按钮（由弹框渲染在固定 footer 区；null/undefined 表示无）。 */
  onFooter?: (node: ReactNode) => void
  /** 打开指定发布条目的构建日志（父弹框切到「历史」tab 并弹出日志）。 */
  onOpenLog?: (entry: HistoryEntry) => void
}

export function PublishTab({ initialCwd, sessionId, run, poller, storage, workspaceItems, onCountChange, onFooter, onOpenLog }: PublishTabProps) {
  // 工作区路径（去空、去重、保持顺序）：仅作为「发现式配置」的扫描范围传给宿主
  const paths = useMemo(() => [...new Set((Array.isArray(workspaceItems) ? workspaceItems : [])
    .map((w) => (w && typeof w.path === 'string' ? w.path : ''))
    .filter((p): p is string => p !== ''))], [workspaceItems])
  const pathsKey = paths.join('\n')
  // 集中式项目配置（dsh-jenkins-map.json）：项目名 → 发布目标数组
  const [projects, setProjects] = useState<ProjectConfigMap>({})
  // 当前项目名（'' = 暂无：不套用任何项目配置，手动选服务器 / Job）
  const [project, setProject] = useState('')
  // 首次载入后按当前工作区文件夹名自动选中同名项目（只做一次，之后尊重用户选择）
  const autoPickedRef = useRef(false)
  // 当前项目的发布目标（转成发布表单元素）
  const entries = useMemo<ConfigEntry[]>(() => targetsToEntries(projects[project]), [projects, project])
  // 项目名（排序）：下拉里「暂无」之后列出
  const projectNames = useMemo(() => Object.keys(projects).sort((a, b) => a.localeCompare(b)), [projects])
  const config = useMemo<WorkspaceConfig | null>(() => (entries.length > 0 ? { entries } : null), [entries])
  // 缓存 / 历史分桶键：@project/<项目名>（历史 tab 显示为「项目配置：xxx」）
  const launchCwd = project ? projectCwd(project) : ''

  // 载入项目配置：宿主顺带把已打开工作区里新出现的 dsh-jenkins 配置发现进来（只补缺失）
  useEffect(() => {
    let alive = true
    run(sessionId, { op: 'mapLoad', cwds: pathsKey ? pathsKey.split('\n') : [] }).then((r) => {
      if (!alive || !(r && r.ok)) return
      const map = sanitizeProjects(r.map)
      setProjects(map)
      if (!autoPickedRef.current) {
        autoPickedRef.current = true
        const name = folderNameOf(initialCwd)
        if (name && map[name]) setProject(name)
      }
    }).catch(() => { /* 读取失败不阻塞（按无项目配置处理） */ })
    return () => { alive = false }
  }, [sessionId, run, pathsKey, initialCwd])

  return (
    <>
      {/* 第 1 行：项目（环境不单独占位 —— 环境 = 项目配置里的服务器，落在下方【服务器】字段上） */}
      <div className="dshj-server-field">
        <label className="dshj-server-label">{t('projectField')}</label>
        <div className="dshj-server-ctrl">
          {/* antd Select 风格：点击直接展开下拉面板，顶部搜索框输入即过滤；
              首项固定「暂无」（手动选服务器 / Job），其后为项目配置里的项目 */}
          <InlineSelect
            value={project}
            placeholder={projectNames.length === 0 ? t('noProjectsHint') : t('projectPlaceholder')}
            searchPlaceholder={t('pickerSearchPlaceholder')}
            options={[{ id: '', label: t('projectNone') }]
              .concat(projectNames.map((name): InlineSelectOption => ({ id: name, label: name })))}
            onChange={(id) => setProject(id)}
          />
        </div>
      </div>
      <LauncherContent cwd={launchCwd} sessionId={sessionId} config={config} run={run} poller={poller} storage={storage} onCountChange={onCountChange} onFooter={onFooter} onOpenLog={onOpenLog} />
    </>
  )
}

function LauncherContent({ cwd, sessionId, config, run, poller, storage, onCountChange, onFooter, onOpenLog }: {
  /** 缓存 / 历史分桶键（项目配置 = @project/<项目名>；「暂无」= 空串）。 */
  cwd: string
  sessionId: string
  config: WorkspaceConfig | null
  run: RunFn
  poller: Poller
  storage: StorageApi
  onCountChange?: (count: number) => void
  onFooter?: (node: ReactNode) => void
  onOpenLog?: (entry: HistoryEntry) => void
}) {
  // 配置数组：每个元素 = { job, server, parameters }（server 即发布目标/环境标识）
  const entries = config && Array.isArray(config.entries) ? config.entries : []
  // 配置中引用过的服务器标识（名称 / id / 地址），用于与已配置服务器取交集
  const configServerRefs = entries.map((e) => e.server).filter(Boolean)
  // 上次发布回显缓存（按项目路径，宿主存储）：服务器 / Job / 参数；
  // 项目为「暂无」时（cwd 为空）不回显，避免把当前工作区的旧参数混入手动/外部配置
  const [cached, setCached] = useState<CachedLaunch | null>(null)
  useEffect(() => {
    let alive = true
    if (!cwd) { setCached(null); return }
    void storage.readCache(sessionId, cwd).then((c) => { if (alive) setCached(c) })
    return () => { alive = false }
  }, [storage, sessionId, cwd])
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')
  // 注意：不能用 `run` 命名构建状态，会遮蔽外层 RPC 助手 run()。
  const [runState, setRunState] = useState<RunState | null>(null)
  // 进行中任务列表（result 为空且带轮询数据）：弹框打开时展示在「请先选择 Job」处，
  // 提交构建后同样以该列表呈现（更统一）；订阅轮询器保证实时可见
  const [inFlightList, setInFlightList] = useState<HistoryEntry[]>([])
  const loadInFlight = useCallback((): void => {
    void storage.readAllHistory(sessionId).then((h) => {
      setInFlightList((h || []).filter((e) => e.result == null && (e.queueId != null || e.buildNumber != null)))
    }).catch(() => undefined)
  }, [storage, sessionId])
  useEffect(() => { loadInFlight() }, [loadInFlight])
  useEffect(() => poller.subscribe(loadInFlight), [poller, loadInFlight])
  const [servers, setServers] = useState<Server[]>([])
  const [serverPool, setServerPool] = useState<Server[]>([]) // 下拉候选：配置交集（交集为空或未配置时退化为全部服务器）
  const [selectedServerId, setSelectedServerId] = useState('')
  const [addServerOpen, setAddServerOpen] = useState(false) // 「去添加」新增服务器弹框
  const [serverReloadKey, setServerReloadKey] = useState(0) // 新增服务器保存成功后重新加载列表
  const [detail, setDetail] = useState<{ params?: ParamDef[]; nextBuildNumber?: number | null } | null>(null) // 服务端任务参数定义
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsError, setJobsError] = useState('')
  const [selectedJobPath, setSelectedJobPath] = useState('')
  const [jobSearch, setJobSearch] = useState('')
  const [paramsOpen, setParamsOpen] = useState(false) // 查看表单参数 JSON 弹框

  const selectedServer = servers.find((s) => s.id === selectedServerId) || null
  // 长横线 label（如 "---" / "————"，或宿主为脚本分隔行生成的 "---1"）：渲染为虚线分割线，不随表单提交
  const IS_DASH_LABEL = /^[-—–]{3,}\d*$/
  // 当前环境：项目配置里 server 与所选服务器匹配的那一项（按 名称 / id / 完整地址 / 域名 匹配）。
  // 环境名**不写进服务器下拉标签**（两套命名交叉显示容易误读）；它只用于 Job / 参数 / 历史记录。
  const activeEntry = selectedServer
    ? (entries.find((en) => matchServer(selectedServer, en.server)) || null)
    : null
  const activeIndex = activeEntry ? entries.indexOf(activeEntry) : -1
  // 默认（未切换时）用第一个环境预选服务器：项目配置数组的第 1 项（通常是 UAT）
  const defaultEntry = entries.length > 0 ? entries[0] : null

  // 加载已配置服务器；下拉候选 = 配置引用过的服务器 ∩ 已配置服务器
  // （无配置或交集为空则退化为全部服务器）。
  // 预选顺序：项目配置第 1 个环境的服务器（默认 UAT）→ 缓存上次使用的服务器 → 候选第一台。
  useEffect(() => {
    let alive = true
    run(sessionId, { op: 'list' }).then((r) => {
      if (!alive) return
      const list = (r && r.ok) ? ((r.servers as Server[]) || []) : []
      setServers(list)
      if (onCountChange) onCountChange(list.length)
      const matched = configServerRefs.length ? list.filter((s) => configServerRefs.some((ref) => matchServer(s, ref))) : []
      const pool = matched.length ? matched : list
      setServerPool(pool)
      const preferServer = defaultEntry ? (pool.find((s) => matchServer(s, defaultEntry.server)) || null) : null
      const cachedServer = cached && pool.find((s) => s.id === cached.serverId)
      const preferred = preferServer || cachedServer || (pool.length ? pool[0] : null)
      setSelectedServerId(preferred ? preferred.id : '')
    }).catch(() => { if (alive) setServers([]) })
    return () => { alive = false }
  }, [cached, config, defaultEntry, serverReloadKey])

  // 按所选服务器拉取真实 Job 列表（排除文件夹）；配置里该服务器对应的 job 若存在则预选
  // （缓存上次使用的 Job 优先；配置里没有匹配的 job 时留空由用户选择）。
  useEffect(() => {
    let alive = true
    setJobs([])
    setJobsError('')
    setSelectedJobPath('')
    setJobSearch('')
    if (!selectedServer) { setJobsLoading(false); return }
    setJobsLoading(true)
    run(sessionId, { op: 'jobs', serverId: selectedServer.id }).then((r) => {
      if (!alive) return
      setJobsLoading(false)
      if (r && r.ok) {
        const list = ((r.jobs as JobItem[]) || []).filter((j) => !j.folder)
        setJobs(list)
        // 预选顺序：当前环境（= 所选服务器）对应的 job → 缓存上次使用的 Job → 配置里同服务器的 job
        const preferJob = activeEntry && activeEntry.job ? (list.find((j) => j.path === activeEntry.job) || null) : null
        const cachedJob = cached && cached.jobPath ? (list.find((j) => j.path === cached.jobPath) || null) : null
        const entry = entries.find((en) => matchServer(selectedServer, en.server)) || null
        const preferred = preferJob || cachedJob || (entry && list.find((j) => j.path === entry.job)) || null
        setSelectedJobPath(preferred ? preferred.path : '')
        setJobSearch(preferred ? preferred.path : '')
      } else {
        // 失败原因按宿主返回的 code 本地化（未知 code 回退原文）；宿主已把该请求写入
        // $DSH_HOME/dsh-jenkins.log，便于事后排查。
        setJobsError(tErr(r, t('jobsFailed')))
      }
    }).catch((e) => { if (alive) { setJobsLoading(false); setJobsError(e instanceof Error ? e.message : String(e)) } })
    return () => { alive = false }
  }, [selectedServerId, cached, config, activeEntry])

  // 选了 Job 才拉取服务端任务参数（jobDetail）；未选则不请求（避免 404）。
  useEffect(() => {
    let alive = true
    setDetail(null)
    setDetailError('')
    if (!selectedServer || !selectedJobPath) { setDetailLoading(false); return }
    setDetailLoading(true)
    const base = (selectedServer.baseUrl || '').replace(/\/+$/, '')
    const segments = selectedJobPath.split('/').map((s) => encodeURIComponent(s))
    const jobUrl = segments.length ? base + '/job/' + segments.join('/job/') : base
    run(sessionId, { op: 'jobDetail', serverId: selectedServer.id, jobUrl }).then((r) => {
      if (!alive) return
      setDetailLoading(false)
      if (r && r.ok) setDetail(r as { params?: ParamDef[]; nextBuildNumber?: number | null })
      else { setDetail(null); setDetailError(tErr(r, t('detailFailed'))) }
    }).catch((e) => {
      if (alive) { setDetailLoading(false); setDetail(null); setDetailError(e instanceof Error ? e.message : String(e)) }
    })
    return () => { alive = false }
  }, [selectedJobPath])

  // 统一初始化表单：匹配「当前服务器 + 当前 Job」的配置元素参数（优先）+ 服务端参数默认值（补全缺失键）。
  // Job / 服务器切换 / 项目切换 / 服务端参数变化时重建，干净丢弃上一选择的字段。
  useEffect(() => {
    const init: Record<string, string | number | boolean> = {}
    // 参数来源：当前环境（= 所选服务器匹配到的配置元素，且 Job 与当前选择一致）
    // → 匹配「当前服务器 + 当前 Job」的配置元素。
    const activeMatched = activeEntry && activeEntry.job === selectedJobPath && selectedServer && matchServer(selectedServer, activeEntry.server)
      ? activeEntry
      : null
    const entry = activeMatched || (selectedServer ? entries.find((en) => en.job === selectedJobPath && matchServer(selectedServer, en.server)) || null : null)
    if (entry) {
      const params = entry.parameters || {}
      for (const k of Object.keys(params)) {
        const v = params[k]
        init[k] = typeof v === 'boolean' ? v : (v === null || v === undefined ? '' : String(v))
      }
    }
    const serverParams = detail && Array.isArray(detail.params) ? detail.params : []
    for (const p of serverParams) {
      if (p.name in init) continue
      init[p.name] = p.type === 'boolean'
        ? String(p.defaultValue) === 'true'
        : (p.defaultValue === null || p.defaultValue === undefined ? '' : String(p.defaultValue))
    }
    // 回显上次发布参数：仅当缓存的 Job 与当前选择一致时，覆盖同名字段
    if (cached && cached.jobPath === selectedJobPath && cached.parameters) {
      for (const k of Object.keys(init)) {
        if (Object.prototype.hasOwnProperty.call(cached.parameters, k)) {
          const v = cached.parameters[k]
          init[k] = typeof v === 'boolean' ? v : (v === null || v === undefined ? '' : String(v))
        }
      }
    }
    setFormValues(init)
    setRunState(null)
    setActionError('')
  }, [selectedJobPath, cwd, cached, config, activeEntry, detail ? detail.params : null])

  const runRef = useRef(runState)
  runRef.current = runState
  // 轮询由全局 poller 负责（与弹框生命周期解耦，关闭后继续后台轮询）。
  // tab 打开时订阅 poller，把该条发布的实时状态映射到本地展示。
  useEffect(() => {
    const off = poller.subscribe(() => {
      const cur = runRef.current
      if (!cur) return
      const live = poller.getLive(cur.historyId)
      if (!live) return
      setRunState((prev) => {
        if (!prev || prev.historyId !== live.entryId) return prev
        const base = {
          ...prev,
          phase: live.phase === 'queued' ? 'queued' as const
            : live.phase === 'running' ? 'running' as const
              : live.phase === 'done' ? 'done' as const
                : live.phase === 'cancelled' ? 'error' as const
                  : 'error' as const,
          buildNumber: live.buildNumber ?? prev.buildNumber,
          result: live.result,
          duration: live.duration,
          url: live.url,
        }
        let message: string
        if (live.status === 'timeout') message = t('pollTimeout')
        else if (live.phase === 'queued') message = t('queuedMsg', { n: prev.queueId as number })
        else if (live.phase === 'cancelled') message = t('cancelled')
        else if (live.phase === 'running' && live.status === 'started') message = t('buildStarted', { n: live.buildNumber as number })
        else if (live.phase === 'running') message = t('buildingRun', { d: fmtDur(Date.now() - (live.since || Date.now())) })
        else if (live.phase === 'done') message = t('buildEnded')
        else message = t('buildPollFailed')
        return { ...base, message }
      })
    })
    return off
  }, [poller])

  const onSubmit = async () => {
    if (submitting) return
    if (!selectedJobPath) { setActionError(t('jobRequired')); return }
    setSubmitting(true)
    setParamsOpen(false)
    setActionError('')
    // 只提交「配置里设置过的」+「与服务端默认值不同的」字段，未配置的交给 Jenkins 默认。
    const entry = selectedServer ? entries.find((en) => en.job === selectedJobPath && matchServer(selectedServer, en.server)) || null : null
    const entryParams = (entry && entry.parameters) || {}
    const serverDefaults: Record<string, string | number | boolean> = {}
    if (detail && Array.isArray(detail.params)) {
      for (const p of detail.params) serverDefaults[p.name] = p.defaultValue
    }
    const submitValues: Record<string, string | number | boolean> = {}
    for (const k of Object.keys(formValues)) {
      if (IS_DASH_LABEL.test(k)) continue // 分割线字段不随表单提交
      const inConfig = Object.prototype.hasOwnProperty.call(entryParams, k)
      if (inConfig) submitValues[k] = formValues[k]
      else if (serverDefaults[k] === undefined || String(formValues[k]) !== String(serverDefaults[k])) submitValues[k] = formValues[k]
    }
    const segments = selectedJobPath.split('/').filter(Boolean)
    try {
      // 服务器 / Job / 参数都已由表单解析完毕（项目配置只是表单的默认值来源），
      // 因此统一走 trigger 通道；cwd 仅作缓存 / 历史记录的分桶键。
      const res = await run(sessionId, { op: 'trigger', serverId: selectedServerId, segments, parameters: submitValues })
      if (res && res.ok) {
        // 记录本次发布（服务器 / Job / 参数），下次打开弹框自动回显（仅所选项目非「暂无」时）
        if (cwd) await storage.writeCache(sessionId, cwd, { serverId: selectedServerId, jobPath: selectedJobPath, parameters: submitValues })
        // 追加到发布历史（时间、Job、服务器、参数、轮询数据；结果在轮询结束时回填）
        const resServerId = (res.serverId as string) || selectedServerId
        const resSegments = Array.isArray(res.segments) && (res.segments as unknown[]).length
          ? (res.segments as string[])
          : segments
        const entryObj: HistoryEntry = {
          id: 'h' + Date.now() + '-' + Math.floor(Math.random() * 1e6),
          time: Date.now(),
          job: selectedJobPath,
          server: selectedServer ? selectedServer.name : '',
          serverId: resServerId,
          segments: resSegments,
          // 环境显示名（配置里的 name；未命名则按下标回退）——「本机记录」里直接显示
          env: activeIndex >= 0 ? targetLabel(activeEntry, activeIndex) : '',
          params: submitValues,
          result: null,
          queueId: (res.queueId as number) ?? null,
          buildNumber: (res.nextBuildNumber as number) ?? null,
          since: Date.now(),
          sessionId,
        }
        const historyId = await storage.pushHistory(sessionId, cwd, entryObj)
        // 立即刷新进行中列表：刚提交的任务马上出现在列表中（无需等下一个轮询周期）
        loadInFlight()
        if (res.queueId) {
          setRunState({ phase: 'queued', queueId: res.queueId as number, serverId: resServerId, segments: resSegments, buildNumber: null, historyId, message: t('queuedMsg', { n: res.queueId as number }), since: Date.now() })
        } else {
          setRunState({ phase: 'running', queueId: null, serverId: resServerId, segments: resSegments, buildNumber: (res.nextBuildNumber as number) || null, historyId, message: t('triggeredMsg'), since: Date.now() })
        }
        // 立即触发一轮轮询（无需等下一个定时周期）
        poller.refresh()
      } else {
        setActionError(tErr(res, t('triggerFailed')))
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }
  // 稳定包装：footer 按钮经它触发「最新一次渲染」的 onSubmit；onSubmit 本身每次渲染重建，
  // 直接进 useMemo 依赖会导致 footer 节点引用不稳定、父组件 setState 循环。
  const onSubmitRef = useRef(onSubmit)
  onSubmitRef.current = onSubmit
  const stableSubmit = useCallback(() => { void onSubmitRef.current() }, [])

  const serverParamsByName: Record<string, ParamDef> = {}
  if (detail && Array.isArray(detail.params)) {
    for (const p of detail.params) serverParamsByName[p.name] = p
  }
  const formKeys = Object.keys(formValues)
  // 表单参数 JSON 视图：保留每个字段的完整定义（类型/默认值/描述/选项）与当前值，便于调试
  const formParamsJson: Record<string, Record<string, unknown>> = {}
  for (const k of formKeys) {
    const p = serverParamsByName[k]
    const item: Record<string, unknown> = { value: formValues[k] }
    if (p) {
      if (p.description) item.description = p.description
      if (p.type) item.type = p.type
      if (p.defaultValue !== null && p.defaultValue !== undefined) item.defaultValue = p.defaultValue
      if (Array.isArray(p.choices) && p.choices.length) item.choices = p.choices
    } else {
      item.source = 'config'
    }
    if (IS_DASH_LABEL.test(k)) item.submitted = false
    formParamsJson[k] = item
  }
  // 「打开在线发布」跳转地址：已选服务器 + Job → Jenkins 发布页（/build，参数化 Job 即
  // 「Build with Parameters」表单页）；已选服务器但未选 Job → Jenkins 服务首页（baseUrl）；
  // 服务器未选时为空串（按钮置灰禁用）
  const onlineConfigUrl = useMemo<string>(() => {
    if (!selectedServer) return ''
    const base = (selectedServer.baseUrl || '').replace(/\/+$/, '')
    if (!selectedJobPath) return base
    const segs = selectedJobPath.split('/').filter(Boolean).map((s) => encodeURIComponent(s))
    if (segs.length === 0) return base
    return base + '/job/' + segs.join('/job/') + '/build'
  }, [selectedServer, selectedJobPath])

  // footer 操作按钮：运行态 = 返回参数（+ 完成后重新构建）；表单态 = 查看参数 + 触发构建。
  // 【打开在线发布】始终展示（无法拼出地址时置灰禁用）；useMemo 保证节点引用只在状态实际变化时更新，
  // 配合父组件 setState 引用比较避免渲染循环。
  const footerNode = useMemo<ReactNode>(() => {
    const publishLink = onlineConfigUrl ? (
      <a className="dshj-link-btn" href={onlineConfigUrl} target="_blank" rel="noopener noreferrer">{t('openOnlinePublish')} ↗</a>
    ) : (
      <span className="dshj-link-btn dshj-link-btn-disabled" title={t('openOnlinePublishDisabled')}>{t('openOnlinePublish')} ↗</span>
    )
    if (runState) {
      return (
        <>
          <button type="button" className="dshj-btn" onClick={() => setRunState(null)}>{t('backParams')}</button>
          {publishLink}
          {runState.phase === 'done' ? (
            <button type="button" className="dshj-btn dshj-btn-primary" onClick={stableSubmit}>{t('rebuild')}</button>
          ) : null}
        </>
      )
    }
    return (
      <>
        {selectedJobPath ? (
          <button type="button" className="dshj-link-btn" disabled={submitting} onClick={() => setParamsOpen(true)}>{t('viewParams')}</button>
        ) : null}
        {publishLink}
        {selectedJobPath ? (
          <button type="button" className="dshj-btn dshj-btn-primary" disabled={submitting} onClick={stableSubmit}>{submitting ? t('submitting') : t('submit')}</button>
        ) : null}
      </>
    )
  }, [runState, selectedJobPath, submitting, stableSubmit, onlineConfigUrl])

  // 上报 footer；卸载时清空。onFooter 由父组件 useCallback 稳定，effect 只随 footerNode 变化触发。
  useEffect(() => {
    onFooter?.(footerNode)
    return () => onFooter?.(null)
  }, [footerNode, onFooter])

  // 进行中任务简洁列表（提交后与「未选 Job」引导区共用同一视图，更统一）：
  // 展示 Job、服务器、#构建号/Q#队列号与「进行中」徽标，点击跳转「历史」打开该条日志。
  const renderInFlight = (showHint: boolean): ReactNode => (
    <div className="dshj-inflight">
      {showHint ? <div className="dshj-select-hint">{t('selectJobFirst')}</div> : null}
      <div className="dshj-inflight-title">{t('inFlightTitle')}</div>
      <div className="dshj-inflight-list">
        {inFlightList.map((e) => (
          <button
            key={e.id}
            type="button"
            className="dshj-inflight-item"
            title={t('inFlightHint')}
            onClick={() => { if (onOpenLog) onOpenLog(e) }}
          >
            <span className="dshj-inflight-main">{e.job + (e.env ? ' · ' + e.env : '')}</span>
            <span className="dshj-inflight-meta">
              {e.server ? <span className="dshj-chip">{e.server}</span> : null}
              {e.buildNumber ? <span className="dshj-chip">#{e.buildNumber}</span> : e.queueId ? <span className="dshj-chip">Q#{e.queueId}</span> : null}
              <span className="dshj-history-result dshj-history-pending">{t('historyPending')}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <div className="dshj-server-field">
        <label className="dshj-server-label">{t('serverField')}</label>
        <div className="dshj-server-ctrl">
          {/* 与「项目」同款内联下拉：**选服务器即选环境** —— 候选 = 项目配置引用过的服务器 ∩
              已配置服务器（按 名称 / id / 完整地址 / 域名 匹配）；标签只显示插件里的服务器名，
              不混入配置里的环境名。无配置或交集为空时退化为全部服务器。 */}
          <InlineSelect
            value={selectedServerId}
            placeholder={t('noServersHint')}
            searchPlaceholder={t('pickerSearchPlaceholder')}
            options={serverPool.map((s): InlineSelectOption => ({ id: s.id, label: s.name }))}
            disabled={!!runState || submitting || serverPool.length === 0}
            onChange={(id) => setSelectedServerId(id)}
          />
          {/* 未配置服务器时可直接打开「新增服务器」弹框，保存后自动刷新本列表；
              右侧固定 120px 等宽，保证与 Job 行的下拉框宽度一致 */}
          <button
            type="button"
            className="dshj-btn dshj-btn-small dshj-server-side"
            title={t('goAdd')}
            disabled={!!runState || submitting}
            onClick={() => setAddServerOpen(true)}
          >
            {t('goAdd')}
          </button>
        </div>
        {/* 项目配置引用的服务器一台都没匹配到已配置服务器时的提示（此时下拉退化为全部服务器） */}
        {configServerRefs.length > 0 && !configServerRefs.some((ref) => servers.some((s) => matchServer(s, ref))) ? (
          <div className="dshj-config-source"><span className="dshj-warn">{t('projectServerUnmatched')}</span></div>
        ) : null}
      </div>
      <div className="dshj-server-field">
        <label className="dshj-server-label">{t('jobField')}</label>
        <div className="dshj-server-ctrl">
          {/* 与服务器同款内联下拉：加载/出错/空态的状态文本显示在触发器中 */}
          <InlineSelect
            value={selectedJobPath}
            placeholder={!selectedServer ? t('jobPlaceholder')
              : jobsLoading ? t('jobsLoading')
                : jobsError ? t('jobsFailed')
                  : jobs.length === 0 ? t('jobsEmpty')
                    : t('jobPlaceholder')}
            searchPlaceholder={t('jobPlaceholder')}
            emptyText={jobsError ? t('jobsFailed') : t('jobsEmpty')}
            options={jobs
              .filter((j) => !j.folder)
              .map((j): InlineSelectOption => ({ id: j.path, label: j.path }))}
            disabled={!!runState || submitting || jobsLoading || !selectedServer}
            onChange={(id) => { setSelectedJobPath(id); setJobSearch(id) }}
          />
          {/* 右侧固定 120px 等宽（无计数时保留空位），保证与服务器行的下拉框宽度一致 */}
          <span className={'dshj-job-count dshj-server-side' + (selectedServer && !jobsLoading && !jobsError ? '' : ' dshj-server-side-empty')}>
            {selectedServer && !jobsLoading && !jobsError ? t('jobCount', { n: jobs.length }) : ''}
          </span>
        </div>
      </div>
      {/* 「Job 列表」下方的虚线分割线：分隔上方的选择区与下方的参数表单 */}
      <div className="dshj-divider" />
      {runState ? (
        <div>
          {/* 提交后不再展示冗长的状态块（排队中/消息/查看完整日志），统一用「进行中的发布」
              列表呈现 —— 点击列表项即可打开该条构建日志（实时刷新 / 可终止）。 */}
          {runState.phase === 'error' && runState.message ? (
            <div className="dshj-run-message dshj-err">{runState.message}</div>
          ) : null}
          {runState.phase === 'done' ? (
            <div>
              <div className="dshj-run-line">{t('resultLabel', { n: runState.buildNumber as number }) + (runState.result || 'UNKNOWN')}</div>
              <div className="dshj-run-line">{t('duration') + fmtDur(runState.duration || 0)}</div>
              {runState.url ? <a className="dshj-link" href={runState.url} target="_blank" rel="noopener noreferrer">{t('openPage')}</a> : null}
            </div>
          ) : null}
          {inFlightList.length > 0 ? renderInFlight(false)
            : runState.phase !== 'done' ? (
              <div className="dshj-empty">
                <span className="dshj-spinner" />
                <div>{t('submittedMsg')}</div>
              </div>
            ) : null}
        </div>
      )
        : !selectedJobPath ? (
          <div>
            {/* 未选 Job 时的引导区：有进行中任务时展示简洁列表，点击跳转「历史」打开该条日志 */}
            {inFlightList.length > 0 ? renderInFlight(true) : <div className="dshj-empty">{t('selectJobFirst')}</div>}
          </div>
        ) : (
            <div>
              {detailLoading ? <div className="dshj-empty">{t('loadingParams')}</div>
                : detailError && formKeys.length === 0 ? <div className="dshj-err dshj-empty">{detailError}</div>
                  : formKeys.length === 0 ? <div className="dshj-empty">{t('noParams')}</div>
                    : (
                      <div className="dshj-form-grid">
                        {formKeys.map((k) => {
                          const v = formValues[k]
                          const p = serverParamsByName[k]
                          const set = (nv: string | number | boolean) => setFormValues((prev) => ({ ...prev, [k]: nv }))
                          // 描述提示语展示位置：输入框/多行文本放入控件 placeholder，下拉框放入搜索框
                          // placeholder，均不单独占一行；仅布尔（checkbox）等无 placeholder 的类型
                          // 仍在控件下方显示一行
                          const descInControl = !p || p.type === 'string' || p.type === 'password' || p.type === 'credentials' || p.type === 'file' || p.type === 'text' || p.type === 'choice'
                          // 长横线 label：不渲染 label+控件行，改为虚线分割线（备注文本显示在线上）
                          if (IS_DASH_LABEL.test(k)) {
                            return (
                              <div key={k} className="dshj-form-divider">
                                {p && p.description ? <span className="dshj-form-divider-text">{p.description}</span> : null}
                              </div>
                            )
                          }
                          let control
                          if (p && p.type === 'boolean') {
                            control = (
                              <label className="dshj-check">
                                <input type="checkbox" checked={!!v} onChange={(e) => set(e.target.checked)} />
                                <span>{String(v)}</span>
                              </label>
                            )
                          } else if (p && p.type === 'choice' && p.multiSelect) {
                            // 多选（Extended Choice multiSelect / uno-choice MultiSelect）：
                            // 勾选列表，值按 delimiter 拼接提交（Jenkins 就吃这个格式）
                            const delim = p.delimiter || ','
                            const picked = String(v === undefined || v === null ? '' : v)
                              .split(delim).map((s) => s.trim()).filter((s) => s !== '')
                            control = (
                              <div className="dshj-check-list">
                                {(p.choices || []).map((c) => {
                                  const on = picked.indexOf(String(c)) !== -1
                                  return (
                                    <label className="dshj-check" key={String(c)}>
                                      <input
                                        type="checkbox"
                                        checked={on}
                                        onChange={() => set((on ? picked.filter((x) => x !== String(c)) : picked.concat([String(c)])).join(delim))}
                                      />
                                      <span>{String(c)}</span>
                                    </label>
                                  )
                                })}
                              </div>
                            )
                          } else if (p && p.type === 'choice') {
                            control = (
                              <InlineSelect
                                value={String(v)}
                                searchPlaceholder={p && p.description ? p.description : t('pickerSearchPlaceholder')}
                                options={(p.choices || []).map((c): InlineSelectOption => ({ id: String(c), label: String(c) }))}
                                onChange={(id) => set(id)}
                              />
                            )
                          } else if (p && p.type === 'text') {
                            control = (
                              <textarea
                                className="dshj-textarea"
                                rows={3}
                                placeholder={p && p.description ? p.description : undefined}
                                value={String(v === undefined || v === null ? '' : v)}
                                onChange={(e) => set(e.target.value)}
                              />
                            )
                          } else if (typeof v === 'boolean') {
                            control = (
                              <label className="dshj-check">
                                <input type="checkbox" checked={!!v} onChange={(e) => set(e.target.checked)} />
                                <span>{String(v)}</span>
                              </label>
                            )
                          } else {
                            control = (
                              <input
                                className="dshj-input"
                                type={p && p.type === 'password' ? 'password' : 'text'}
                                placeholder={p && p.description ? p.description : undefined}
                                value={String(v === undefined || v === null ? '' : v)}
                                onChange={(e) => set(e.target.value)}
                              />
                            )
                          }
                          // 与「服务器 / Job 列表」行一致的栅格：左侧 label（右对齐、定宽），右侧 value（铺满）；
                          // 描述提示：输入框/下拉框类型已放入 placeholder（不占行），布尔类型仍单独占一行（grid 第二行）
                          return (
                            <div key={k} className="dshj-form-field">
                              <label className="dshj-form-label" title={k}>{k}</label>
                              {control}
                              {p && p.description && !descInControl ? <div className="dshj-form-desc">{p.description}</div> : null}
                              {/* 原来是下拉、但选项由脚本生成且没能解析出来 → 已降级为文本输入，给出提示 */}
                              {p && p.dynamic ? <div className="dshj-form-desc dshj-warn">{t('paramDynamicHint')}</div> : null}
                            </div>
                          )
                        })}
                      </div>
                    )}
              {detailError && formKeys.length > 0 ? <div className="dshj-err">{detailError}</div> : null}
              {actionError ? <div className="dshj-err">{actionError}</div> : null}
            </div>
          )}
      {paramsOpen ? (
        <ModalPortal backdropClass="dshj-json-backdrop" modalClass="dshj-json-modal" onBackdropClose={() => setParamsOpen(false)}>
          <div className="dshj-modal-header">
            <div>
              <div className="dshj-modal-title">{t('formParamsJson')}</div>
              <div className="dshj-modal-sub">{selectedJobPath || ''}</div>
            </div>
            <button type="button" className="dshj-close" aria-label={t('close')} title={t('close')} onClick={() => setParamsOpen(false)}>✕</button>
          </div>
          <div className="dshj-modal-body">
            <pre className="dshj-code">{JSON.stringify(formParamsJson, null, 2)}</pre>
          </div>
        </ModalPortal>
      ) : null}
      {addServerOpen ? (
        <ServerEditorModal
          run={run}
          sessionId={sessionId}
          server={null}
          onSaved={() => setServerReloadKey((k) => k + 1)}
          onClose={() => setAddServerOpen(false)}
        />
      ) : null}
    </>
  )
}
