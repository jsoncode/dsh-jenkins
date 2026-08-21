/**
 * dsh-jenkins —— 统一弹框「发布」tab：项目 → 服务器 / Job 选择 → 参数表单回显 →
 * 触发构建 → 轮询状态（排队 → 构建中 → 结果）。
 *
 * 不做配置门控：始终显示表单。顶部「项目」下拉列出 DSH 工作区，用户自选目标项目；
 * 若所选项目存在 dsh-jenkins 配置（dsh-jenkins.json/js/ts），自动启用配置增强
 * （服务器下拉取配置交集、参数默认值、提交走 workspaceTrigger）；无配置时直接
 * 走 trigger 通道（用户手动选服务器 / Job / 参数）。
 */

import { useEffect, useRef, useState } from 'react'
import { fmtDur, LANG, t, tErr } from '../i18n.ts'
import { matchServer, type CachedLaunch, type StorageApi } from '../storage.ts'
import type { RunFn } from '../rpc.ts'
import type { Poller } from '../poller.ts'
import { ServerEditorModal } from './ServerEditorModal.tsx'
import { InlineSelect, type InlineSelectOption } from './InlineSelect.tsx'

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
  entries: Array<{ job: string; server: string; parameters?: Record<string, string | number | boolean> }>
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
}

export function PublishTab({ initialCwd, sessionId, run, poller, storage, workspaceItems, onCountChange }: PublishTabProps) {
  // 项目列表：工作区路径（去空、去重、保持顺序）
  const paths = [...new Set((Array.isArray(workspaceItems) ? workspaceItems : [])
    .map((w) => (w && typeof w.path === 'string' ? w.path : ''))
    .filter((p): p is string => p !== ''))]
  const [project, setProject] = useState<string>(() => {
    if (initialCwd && paths.indexOf(initialCwd) !== -1) return initialCwd
    return paths.length ? paths[0] : ''
  })
  // 所选项目的 dsh-jenkins 配置（可选）：存在则启用配置增强；不存在不阻塞发布。
  const [config, setConfig] = useState<WorkspaceConfig | null>(null)
  useEffect(() => {
    let alive = true
    setConfig(null)
    if (!project) return
    run(sessionId, { op: 'workspaceConfig', cwd: project }).then((r) => {
      if (!alive) return
      const cfg = r && r.config as WorkspaceConfig | null | undefined
      if (r && r.ok && r.found && cfg && Array.isArray(cfg.entries) && cfg.entries.length > 0) setConfig(cfg)
    }).catch(() => { /* 配置探测失败不阻塞（按无配置处理） */ })
    return () => { alive = false }
  }, [project, sessionId, run])

  return (
    <>
      <div className="dshj-server-field">
        <label className="dshj-server-label">{t('projectField')}</label>
        {/* antd Select 风格：点击直接展开下拉面板，顶部搜索框输入即过滤 */}
        <InlineSelect
          value={project}
          placeholder={paths.length === 0 ? t('noWorkspacesHint') : t('projectPlaceholder')}
          searchPlaceholder={t('pickerSearchPlaceholder')}
          options={paths.map((p): InlineSelectOption => ({ id: p, label: p }))}
          disabled={paths.length === 0}
          onChange={(id) => setProject(id)}
        />
      </div>
      <LauncherContent cwd={project} sessionId={sessionId} config={config} run={run} poller={poller} storage={storage} onCountChange={onCountChange} />
    </>
  )
}

function LauncherContent({ cwd, sessionId, config, run, poller, storage, onCountChange }: {
  cwd: string
  sessionId: string
  config: WorkspaceConfig | null
  run: RunFn
  poller: Poller
  storage: StorageApi
  onCountChange?: (count: number) => void
}) {
  // 配置数组：每个元素 = { job, server, parameters }（server 即发布目标/环境标识）
  const entries = config && Array.isArray(config.entries) ? config.entries : []
  // 配置中引用过的服务器标识（名称 / id / 地址），用于与已配置服务器取交集
  const configServerRefs = entries.map((e) => e.server).filter(Boolean)
  // 上次发布回显缓存（按项目路径，宿主存储）：服务器 / Job / 参数
  const [cached, setCached] = useState<CachedLaunch | null>(null)
  useEffect(() => {
    let alive = true
    void storage.readCache(sessionId, cwd).then((c) => { if (alive) setCached(c) })
    return () => { alive = false }
  }, [storage, sessionId, cwd])
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')
  // 注意：不能用 `run` 命名构建状态，会遮蔽外层 RPC 助手 run()。
  const [runState, setRunState] = useState<RunState | null>(null)
  const [servers, setServers] = useState<Server[]>([])
  const [serverPool, setServerPool] = useState<Server[]>([]) // 下拉候选：配置交集（交集为空或未配置时退化为全部服务器）
  const [serverMismatch, setServerMismatch] = useState<string[]>([]) // 配置里未匹配到的服务器标识
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
  // 长横线 label（如 "---" / "————"）：渲染为虚线分割线（带备注），不随表单提交
  const IS_DASH_LABEL = /^[-—–]{3,}$/

  // 加载已配置服务器；下拉候选 = 配置引用过的服务器 ∩ 已配置服务器
  // （无配置或交集为空则退化为全部服务器，配置缺失时提示）。
  // 预选顺序：缓存上次使用的服务器（限交集内）→ 交集第一台（交集为空时全部第一台）。
  useEffect(() => {
    let alive = true
    run(sessionId, { op: 'list' }).then((r) => {
      if (!alive) return
      const list = (r && r.ok) ? ((r.servers as Server[]) || []) : []
      setServers(list)
      if (onCountChange) onCountChange(list.length)
      const matched = configServerRefs.length ? list.filter((s) => configServerRefs.some((ref) => matchServer(s, ref))) : []
      const unmatched = configServerRefs.filter((ref) => !list.some((s) => matchServer(s, ref)))
      const pool = matched.length ? matched : list
      setServerPool(pool)
      // 仅在「有配置引用但交集为空」时提示（此时下拉已退化为全部服务器）
      setServerMismatch(configServerRefs.length > 0 && matched.length === 0 ? unmatched : [])
      const cachedServer = cached && pool.find((s) => s.id === cached.serverId)
      const preferred = cachedServer || (pool.length ? pool[0] : null)
      setSelectedServerId(preferred ? preferred.id : '')
    }).catch(() => { if (alive) setServers([]) })
    return () => { alive = false }
  }, [cached, config, serverReloadKey])

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
        const cachedJob = cached && cached.jobPath ? (list.find((j) => j.path === cached.jobPath) || null) : null
        const entry = entries.find((en) => matchServer(selectedServer, en.server)) || null
        const preferred = cachedJob || (entry && list.find((j) => j.path === entry.job)) || null
        setSelectedJobPath(preferred ? preferred.path : '')
        setJobSearch(preferred ? preferred.path : '')
      } else {
        setJobsError((r && (r.error as string)) || t('jobsFailed'))
      }
    }).catch((e) => { if (alive) { setJobsLoading(false); setJobsError(e instanceof Error ? e.message : String(e)) } })
    return () => { alive = false }
  }, [selectedServerId, cached, config])

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
    const entry = selectedServer ? entries.find((en) => en.job === selectedJobPath && matchServer(selectedServer, en.server)) || null : null
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
  }, [selectedJobPath, cwd, cached, config, detail ? detail.params : null])

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
      // 有配置 → workspaceTrigger（合并配置元素参数/服务器匹配）；无配置 → 直接 trigger。
      const res = config
        ? await run(sessionId, { op: 'workspaceTrigger', cwd, serverId: selectedServerId, job: selectedJobPath, parameters: submitValues })
        : await run(sessionId, { op: 'trigger', serverId: selectedServerId, segments, parameters: submitValues })
      if (res && res.ok) {
        // 记录本次发布（服务器 / Job / 参数），下次打开弹框自动回显
        await storage.writeCache(sessionId, cwd, { serverId: selectedServerId, jobPath: selectedJobPath, parameters: submitValues })
        // 追加到发布历史（时间、Job、服务器、参数、轮询数据；结果在轮询结束时回填）
        const resServerId = (res.serverId as string) || selectedServerId
        const resSegments = Array.isArray(res.segments) && (res.segments as unknown[]).length
          ? (res.segments as string[])
          : segments
        const historyId = await storage.pushHistory(sessionId, cwd, {
          id: 'h' + Date.now() + '-' + Math.floor(Math.random() * 1e6),
          time: Date.now(),
          job: selectedJobPath,
          server: selectedServer ? selectedServer.name : '',
          serverId: resServerId,
          segments: resSegments,
          params: submitValues,
          result: null,
          queueId: (res.queueId as number) ?? null,
          buildNumber: (res.nextBuildNumber as number) ?? null,
          since: Date.now(),
          sessionId,
        })
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

  return (
    <>
      <div className="dshj-server-field">
        <label className="dshj-server-label">{t('serverField')}</label>
        <div className="dshj-server-ctrl">
          {/* 与「项目」同款内联下拉：候选 = 配置交集（无配置或交集为空时退化为全部服务器），
              带「（配置）」标记提示哪些被项目配置引用；空态禁用并显示提示 */}
          <InlineSelect
            value={selectedServerId}
            placeholder={t('noServersHint')}
            searchPlaceholder={t('pickerSearchPlaceholder')}
            options={serverPool.map((s): InlineSelectOption => ({
              id: s.id,
              label: s.name + (configServerRefs.some((ref) => matchServer(s, ref)) ? t('configMark') : ''),
            }))}
            disabled={!!runState || submitting || serverPool.length === 0}
            onChange={(id) => setSelectedServerId(id)}
          />
          {/* 未配置服务器时可直接打开「新增服务器」弹框，保存后自动刷新本列表 */}
          <button
            type="button"
            className="dshj-btn dshj-btn-small"
            title={t('goAdd')}
            disabled={!!runState || submitting}
            onClick={() => setAddServerOpen(true)}
          >
            {t('goAdd')}
          </button>
        </div>
      </div>
      {serverMismatch.length > 0 ? (
        <div className="dshj-server-field">
          <label className="dshj-server-label" />
          <div className="dshj-warn" style={{ fontSize: 12, lineHeight: 1.5 }}>{t('serverMismatch', { list: serverMismatch.join(LANG === 'zh' ? '、' : ', ') })}</div>
        </div>
      ) : null}
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
          {selectedServer && !jobsLoading && !jobsError ? (
            <span className="dshj-job-count">{t('jobCount', { n: jobs.length })}</span>
          ) : null}
        </div>
      </div>
      {/* 「Job 列表」下方的虚线分割线：分隔上方的选择区与下方的参数表单 */}
      <div className="dshj-divider" />
      {runState ? (
        <div>
          <div className="dshj-run-title">{runState.phase === 'queued' ? t('phaseQueued') : runState.phase === 'running' ? t('phaseRunning') : runState.phase === 'done' ? t('phaseDone') : t('phaseError')}</div>
          <div className={'dshj-run-message ' + (runState.phase === 'done' ? (runState.result === 'SUCCESS' ? 'dshj-ok' : (runState.result === 'FAILURE' || runState.result === 'ABORTED' ? 'dshj-err' : 'dshj-warn')) : '')}>{runState.message || ''}</div>
          {(runState.phase === 'queued' || runState.phase === 'running') ? <div className="dshj-spinner" /> : null}
          {runState.phase === 'done' ? (
            <div>
              <div className="dshj-run-line">{t('resultLabel', { n: runState.buildNumber as number }) + (runState.result || 'UNKNOWN')}</div>
              <div className="dshj-run-line">{t('duration') + fmtDur(runState.duration || 0)}</div>
              {runState.url ? <a className="dshj-link" href={runState.url} target="_blank" rel="noopener noreferrer">{t('openPage')}</a> : null}
            </div>
          ) : null}
          <div className="dshj-form-ops">
            <button type="button" className="dshj-btn" onClick={() => setRunState(null)}>{t('backParams')}</button>
            {runState.phase === 'done' ? <button type="button" className="dshj-btn dshj-btn-primary" onClick={onSubmit}>{t('rebuild')}</button> : null}
          </div>
        </div>
      )
        : !selectedJobPath ? <div className="dshj-empty">{t('selectJobFirst')}</div>
          : (
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
                          } else if (p && p.type === 'choice') {
                            control = (
                              <InlineSelect
                                value={String(v)}
                                searchPlaceholder={t('pickerSearchPlaceholder')}
                                options={(p.choices || []).map((c): InlineSelectOption => ({ id: String(c), label: String(c) }))}
                                onChange={(id) => set(id)}
                              />
                            )
                          } else if (p && p.type === 'text') {
                            control = <textarea className="dshj-textarea" rows={3} value={String(v === undefined || v === null ? '' : v)} onChange={(e) => set(e.target.value)} />
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
                                value={String(v === undefined || v === null ? '' : v)}
                                onChange={(e) => set(e.target.value)}
                              />
                            )
                          }
                          // 与「服务器 / Job 列表」行一致的栅格：左侧 label（右对齐、定宽），右侧 value（铺满）；
                          // 描述单独占一行（grid 第二行），不影响 label 与 value 的水平对齐
                          return (
                            <div key={k} className="dshj-form-field">
                              <label className="dshj-form-label" title={k}>{k}</label>
                              {control}
                              {p && p.description ? <div className="dshj-form-desc">{p.description}</div> : null}
                            </div>
                          )
                        })}
                      </div>
                    )}
              {detailError && formKeys.length > 0 ? <div className="dshj-err">{detailError}</div> : null}
              {actionError ? <div className="dshj-err">{actionError}</div> : null}
              <div className="dshj-form-ops dshj-submit-row">
                <button type="button" className="dshj-btn dshj-btn-primary" disabled={submitting} onClick={onSubmit}>{submitting ? t('submitting') : t('submit')}</button>
                <button type="button" className="dshj-link-btn" disabled={submitting} onClick={() => setParamsOpen(true)}>{t('viewParams')}</button>
              </div>
            </div>
          )}
      {paramsOpen ? (
        <div className="dshj-backdrop dshj-json-backdrop">
          <div className="dshj-modal dshj-json-modal" onClick={(e) => e.stopPropagation()}>
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
          </div>
        </div>
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
