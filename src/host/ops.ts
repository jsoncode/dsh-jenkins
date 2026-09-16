/**
 * dsh-jenkins —— 操作分发（命令与模型工具共用）：runOp 全部分支。
 *
 * 分支：mapLoad / mapSave / mapDiscover / workspaceConfig / configParseContent /
 * workspaceTrigger / saveTemplate / list / save / delete / test /
 * jobs / jobDetail / jobHistory / trigger / queueStatus / buildStatus / buildLog / cancel /
 * updateCheck / pluginUpdateStart / pluginUpdateStatus。
 */

import type { HostCtxLike } from './jenkins.ts'
import {
  errorCodeOf,
  extractParams,
  getCrumb,
  headerValue,
  jenkinsJson,
  jenkinsRequest,
  jobPath,
  jobSegments,
  normalizeBase,
  parseBuildPageChoices,
} from './jenkins.ts'
import { loadWorkspaceConfig, parseConfigFromContent } from './workspace-config.ts'
import { mergeMissingProjects, mergeProjectMaps, normalizeProjectMap, projectNameFromFilename } from './projects.ts'
import { MAP_FILE } from './project-map.ts'
import { checkPluginUpdate } from './update.ts'
import { getPluginUpdateStatus, startPluginUpdate } from './plugin-update.ts'
import type { FsService, HttpResponse, JenkinsParamDef, OpRequest, OpResult, ProjectConfigMap, ProjectTarget, PublicServer, ServerConfig, ShellService } from './types.ts'

export interface OpsDeps {
  ctx: HostCtxLike
  readServers(): ServerConfig[]
  writeServers(servers: ServerConfig[]): Promise<void>
  findServer(nameOrIdOrUrl: string): ServerConfig | undefined
  /** 读取集中式项目配置（独立文件 $DSH_HOME/dsh-jenkins-map.json）。 */
  readMap(): Promise<ProjectConfigMap>
  /** 写入集中式项目配置（整体替换）。 */
  writeMap(map: ProjectConfigMap): Promise<void>
  /** 项目配置文件绝对路径（界面展示 / 日志用）。 */
  mapPath(): string
  /** 读取浏览器缓存（$DSH_HOME/dsh-jenkins.json 的 cache 字段）。 */
  readCacheJson(): Record<string, unknown>
  /** 写入浏览器缓存（整体替换）。 */
  writeCacheJson(cache: Record<string, unknown>): Promise<void>
  /** 数据文件初始化（加载/迁移）完成信号；runOp 开头等待，避免读到空镜像。 */
  storeReady?: Promise<void>
}

/** 解析请求里的工作区路径列表（去空、去重、保持顺序）。 */
function readCwds(req: OpRequest): string[] {
  const raw = Array.isArray(req.cwds) ? (req.cwds as unknown[]) : []
  const out: string[] = []
  for (const item of raw) {
    const cwd = String(item || '').trim()
    if (cwd && out.indexOf(cwd) === -1) out.push(cwd)
  }
  return out
}

/**
 * 发现式配置：扫描各工作区根目录的 dsh-jenkins.{json,js,ts}（数组格式），
 * 以**文件夹名**作为项目名，元素转成集中配置的文件形状（parameters → environments）。
 * 单个工作区失败不影响其它工作区，逐条返回结果供界面提示。
 */
async function discoverFromWorkspaces(
  fsService: FsService,
  shell: ShellService,
  cwds: string[],
): Promise<{ discovered: ProjectConfigMap; results: Array<Record<string, unknown>> }> {
  const discovered: ProjectConfigMap = {}
  const results: Array<Record<string, unknown>> = []
  for (const cwd of cwds) {
    const trimmed = cwd.replace(/[\\/]+$/, '')
    const name = trimmed.replace(/^.*[\\/]/, '') || projectNameFromFilename('')
    try {
      const config = await loadWorkspaceConfig(fsService, shell, cwd)
      if (config === null) {
        results.push({ cwd, ok: false, reason: 'not-found' })
        continue
      }
      // 工作区配置内部形状（parameters）→ 集中配置文件形状（environments）；name 一起带过去
      discovered[name] = config.entries.map((en) => {
        const target: ProjectTarget = { job: en.job, server: en.server, environments: en.parameters || {} }
        const envName = String(en.name || '').trim()
        if (envName) target.name = envName
        return target
      })
      results.push({ cwd, name, ok: true, count: config.entries.length, file: config.file || '' })
    } catch (e) {
      results.push({ cwd, ok: false, reason: e instanceof Error ? e.message : String(e) })
    }
  }
  return { discovered, results }
}

const maskToken = (t: string): string => {
  if (!t) return ''
  if (t.length <= 6) return '••••••'
  return t.slice(0, 2) + '••••' + t.slice(-2)
}

/**
 * 补齐「脚本生成的选项」：uno-choice（Active Choices）/ Cascade / Extended Choice 的选项是
 * 渲染时才由脚本算出来的，REST `/api/json` 只给 `_class` + 默认值。
 * 这类参数（choice 但 choices 为空）回落到**构建页 HTML**（`job/<path>/build`）解析
 * `<select>` 的 option 列表；拿不到时把该参数降级为文本输入，避免出现「空下拉框」。
 *
 * 只在确实存在这类参数时才多发一次请求；失败一律静默降级（不影响其它参数与发布流程）。
 */
async function resolveDynamicChoices(
  ctx: HostCtxLike,
  server: ServerConfig,
  segs: string[],
  params: JenkinsParamDef[],
  jobUrl: string,
): Promise<JenkinsParamDef[]> {
  const pending = params.filter((p) => p.type === 'choice' && (p.choices === null || p.choices.length === 0))
  if (pending.length === 0) return params
  let pageChoices: Record<string, { choices: string[]; multiSelect: boolean; defaultValue: string }> = {}
  try {
    // 构建页（参数表单）；jobUrl 来自 job detail，可直接复用其路径。
    // 注意：Jenkins 对 GET `/build` 常回 405，**但正文就是参数表单**（含渲染好的 <select>），
    // 因此只要不是 5xx 且正文非空就尝试解析 —— 解析不到内容时下面的降级逻辑照常生效。
    const path = String(jobUrl || '').trim() !== ''
      ? String(jobUrl).replace(/^https?:\/\/[^/]+/i, '').replace(/\/+$/, '') + '/build'
      : jobPath(segs) + '/build'
    const res = await jenkinsRequest(ctx, server, path, { headers: { accept: 'text/html' }, op: 'jobDetail' })
    if (res.status < 500 && res.body) pageChoices = parseBuildPageChoices(res.body)
  } catch { /* 构建页取不到：下面按降级处理 */ }
  return params.map((p) => {
    if (p.type !== 'choice' || (p.choices !== null && p.choices.length > 0)) return p
    const page = pageChoices[p.name]
    if (page && page.choices.length > 0) {
      return {
        ...p,
        choices: page.choices,
        // 页面上的 selected 比 REST 的默认值更可信（脚本默认值只有渲染后才定）
        defaultValue: page.defaultValue !== '' ? page.defaultValue : p.defaultValue,
        ...(page.multiSelect || p.multiSelect ? { multiSelect: true } : {}),
      }
    }
    // 解析不到选项：降级为文本输入（用户仍可手填），避免界面出现空下拉框
    return { ...p, type: 'string', choices: null, dynamic: true }
  })
}

const publicServer = (s: ServerConfig): PublicServer => ({
  id: s.id,
  name: s.name,
  baseUrl: s.baseUrl,
  username: s.username,
  tokenMasked: maskToken(s.token),
  hasToken: !!s.token,
  insecure: !!s.insecure,
  verified: !!s.verified,
})

/** 把异常/消息映射为本地化错误码（客户端按 code 显示中/英文）。 */
export const errCodeOf = errorCodeOf

export async function runOp(deps: OpsDeps, req: OpRequest): Promise<OpResult> {
  // 等待数据文件初始化完成（首次加载或旧数据迁移），避免操作读到空镜像。
  if (deps.storeReady) await deps.storeReady
  const { ctx, readServers, writeServers, findServer, readMap, writeMap } = deps
  const op = req && req.op

  if (op === 'workspaceConfig') {
    const cwd = String(req.cwd || '').trim()
    console.log('[dsh-jenkins] workspaceConfig cwd=', cwd)
    if (!cwd) return { ok: false, code: 'cwd-missing', error: 'Missing workspace path' }
    try {
      const fsService = ctx.get('fs') as FsService | undefined
      const shell = ctx.get('shell') as ShellService | undefined
      if (fsService === undefined || shell === undefined) {
        return { ok: false, code: 'fs-missing', error: 'fs/shell service unavailable' }
      }
      const config = await loadWorkspaceConfig(fsService, shell, cwd)
      console.log('[dsh-jenkins] workspaceConfig found=', config !== null, config && config.file)
      return config === null
        ? { ok: true, found: false, config: null }
        : { ok: true, found: true, config }
    } catch (e) {
      console.error('[dsh-jenkins] workspaceConfig error', e)
      return { ok: false, code: errCodeOf(e), error: e instanceof Error ? e.message : String(e) }
    }
  }

  if (op === 'configParseContent') {
    // 「发布」tab「选择配置」：用户在文件管理器中任意选中一个 dsh-jenkins 配置文件，
    // 浏览器侧已读取其内容，这里按内容解析并归一化（.json 直读；.js/.ts 经 node 求值）。
    const filename = String(req.filename || '').trim()
    const content = typeof req.content === 'string' ? req.content : ''
    if (!filename || !content.trim()) return { ok: false, code: 'config-empty', error: 'Missing config file content' }
    try {
      const shell = ctx.get('shell') as ShellService | undefined
      if (shell === undefined) return { ok: false, code: 'fs-missing', error: 'shell service unavailable' }
      const config = await parseConfigFromContent(shell, filename, content)
      return { ok: true, config }
    } catch (e) {
      console.error('[dsh-jenkins] configParseContent error', e)
      return { ok: false, code: errCodeOf(e), error: e instanceof Error ? e.message : String(e) }
    }
  }

  /* ── 集中式项目配置（$DSH_HOME/dsh-jenkins-map.json）────────────────────────
   * 数据 = 项目名 → 发布目标数组（{ job, server, environments }）。
   * 发现式配置：工作区根目录的 dsh-jenkins.{json,js,ts}（数组格式）以**文件夹名**
   * 作为项目名合并进 map；默认只补缺失，不覆盖用户已有项目。
   * ──────────────────────────────────────────────────────────────────────── */

  if (op === 'mapLoad') {
    // 打开界面时调用：读 map，顺带把已打开工作区里新出现的配置发现进来（只补缺失）。
    const cwds = readCwds(req)
    const map = await readMap()
    const base = { ok: true, map, file: MAP_FILE, path: deps.mapPath(), added: [] as string[], results: [] as Array<Record<string, unknown>> }
    if (cwds.length === 0) return base
    const fsService = ctx.get('fs') as FsService | undefined
    const shell = ctx.get('shell') as ShellService | undefined
    // 发现依赖 fs/shell：不可用时仍返回已读到的 map（界面照常可用，只是没有新发现）
    if (fsService === undefined || shell === undefined) return { ...base, discoverError: 'fs-missing' }
    const { discovered, results } = await discoverFromWorkspaces(fsService, shell, cwds)
    const merged = mergeMissingProjects(map, discovered)
    if (merged.added.length > 0) {
      await writeMap(merged.map)
      console.log('[dsh-jenkins] discovered projects →', merged.added.join(', '))
    }
    return { ...base, map: merged.map, added: merged.added, results }
  }

  if (op === 'mapSave') {
    // 项目配置弹框保存：整体替换 map（允许清空为 {}）。
    let map: ProjectConfigMap
    try {
      map = normalizeProjectMap(req.map, { allowEmpty: true })
    } catch (e) {
      return { ok: false, code: 'project-invalid', error: e instanceof Error ? e.message : String(e) }
    }
    await writeMap(map)
    return { ok: true, map, file: MAP_FILE, path: deps.mapPath() }
  }

  if (op === 'mapDiscover') {
    // 「重新发现」：显式重新扫描工作区（overwrite=true 时用工作区配置覆盖同名项目）。
    const cwds = readCwds(req)
    if (cwds.length === 0) return { ok: false, code: 'cwd-missing', error: 'Missing workspace paths' }
    const fsService = ctx.get('fs') as FsService | undefined
    const shell = ctx.get('shell') as ShellService | undefined
    if (fsService === undefined || shell === undefined) {
      return { ok: false, code: 'fs-missing', error: 'fs/shell service unavailable' }
    }
    const overwrite = req.overwrite === true
    const { discovered, results } = await discoverFromWorkspaces(fsService, shell, cwds)
    const current = await readMap()
    const names = Object.keys(discovered)
    const added = names.filter((n) => !(n in current))
    const updated = overwrite ? names.filter((n) => n in current) : []
    const map = overwrite ? mergeProjectMaps(current, discovered) : mergeMissingProjects(current, discovered).map
    if (added.length > 0 || updated.length > 0) await writeMap(map)
    return { ok: true, map, file: MAP_FILE, path: deps.mapPath(), added, updated, results }
  }

  if (op === 'workspaceTrigger') {
    const cwd = String(req.cwd || '').trim()
    // 配置来源工作区：发布 tab「选择配置」从其他项目加载配置时传入；
    // 缺省回退到 cwd（所选项目）。cwd 仍作为缓存/历史记录的工作区键。
    const configCwd = String(req.configCwd || '').trim() || cwd
    if (!configCwd) return { ok: false, code: 'cwd-missing', error: 'Missing workspace path' }
    try {
      const fsService = ctx.get('fs') as FsService | undefined
      const shell = ctx.get('shell') as ShellService | undefined
      if (fsService === undefined || shell === undefined) {
        return { ok: false, code: 'fs-missing', error: 'fs/shell service unavailable' }
      }
      const config = await loadWorkspaceConfig(fsService, shell, configCwd)
      if (config === null) return { ok: false, code: 'no-config', error: 'No dsh-jenkins.json/js/ts config found in workspace root' }
      const entries = config.entries || []
      // 服务器解析顺序：弹框选择的 serverId → 配置元素匹配的服务器 → 唯一服务器。
      let server: ServerConfig | undefined = req.serverId ? findServer(String(req.serverId)) : undefined
      if (server === undefined) {
        for (const en of entries) {
          server = findServer(en.server)
          if (server !== undefined) break
        }
      }
      if (server === undefined) {
        const all = readServers()
        if (all.length === 1) server = all[0]
      }
      if (server === undefined) {
        return { ok: false, code: 'server-missing', error: 'Server from config not found; configure it in Settings → Jenkins first' }
      }
      // Job：弹框选择优先，否则取首个配置元素的 job。
      const segs = (req.job && String(req.job).trim() ? String(req.job).trim() : (entries[0] ? entries[0].job : '')).split('/').filter(Boolean)
      if (segs.length === 0) return { ok: false, code: 'job-path-invalid', error: 'Empty job path' }
      const jobKey = segs.join('/')
      // 表单参数覆盖：弹框提交的已选参数优先；否则用匹配元素（同服务器 + 同 job）的 environments，
      // 再退到同 job 元素 / 首个元素的 environments。
      let parameters: Record<string, string | number | boolean> | null =
        (req.parameters && typeof req.parameters === 'object' && Object.keys(req.parameters).length > 0)
          ? (req.parameters as Record<string, string | number | boolean>)
          : null
      if (parameters === null) {
        // 注意：findServer 每次重新解析服务器列表，返回新对象，须按 id 比较
        const serverId = server.id
        const match = entries.find((en) => {
          const s = findServer(en.server)
          return en.job === jobKey && s !== undefined && s.id === serverId
        }) || entries.find((en) => en.job === jobKey)
          || entries[0]
        parameters = (match && match.parameters) || {}
      }
      const result = await runOp(deps, { op: 'trigger', serverId: server.id, segments: segs, parameters })
      if (!result.ok) return result
      let nextBuildNumber: number | null = null
      if (result.queueId == null) {
        try {
          const d = await runOp(deps, { op: 'jobDetail', serverId: server.id, jobUrl: normalizeBase(server.baseUrl) + jobPath(segs) })
          if (d.ok) nextBuildNumber = d.nextBuildNumber as number | null
        } catch { /* keep null */ }
      }
      return { ok: true, queueId: result.queueId, location: result.location, serverId: server.id, segments: segs, nextBuildNumber }
    } catch (e) {
      return { ok: false, code: errCodeOf(e), error: e instanceof Error ? e.message : String(e) }
    }
  }

  if (op === 'saveTemplate') {
    // 把配置模板写入工作区根目录。文件名白名单（仅 dsh-jenkins.{json,js,ts}），
    // 内容来自客户端固定的模板（不是任意文件写入）；文件已存在且未传 overwrite 时不写，
    // 返回 existed 由客户端先确认再覆盖。
    const cwd = String(req.cwd || '').trim()
    if (!cwd) return { ok: false, code: 'cwd-missing', error: 'Missing workspace path' }
    const filename = String(req.filename || '').trim()
    if (filename !== 'dsh-jenkins.json' && filename !== 'dsh-jenkins.js' && filename !== 'dsh-jenkins.ts') {
      return { ok: false, code: 'template-name-invalid', error: 'Invalid template filename: ' + filename }
    }
    try {
      const fsService = ctx.get('fs') as FsService | undefined
      if (fsService === undefined) return { ok: false, code: 'fs-missing', error: 'fs service unavailable' }
      const target = await fsService.resolve(filename, { cwd })
      const existed = (await fsService.stat(target)) !== undefined
      if (existed && req.overwrite !== true) {
        return { ok: true, existed: true, path: fsService.processPath(target) }
      }
      // 宿主 fs 服务默认在 workspace-write 沙箱下运行（HTTP 路由非会话作用域，
      // 缺省策略的可写根不含工作区，直接写会被 FS_SANDBOX_DENIED 拒绝）：
      // 显式以请求的工作区为写根传入沙箱策略，写入即被放行。
      await fsService.writeText(target, String(req.content ?? ''), undefined, undefined, {
        mode: 'workspace-write',
        workspaceRoot: cwd,
      })
      return { ok: true, existed, path: fsService.processPath(target) }
    } catch (e) {
      console.error('[dsh-jenkins] saveTemplate error', e)
      return { ok: false, code: 'template-save-failed', error: e instanceof Error ? e.message : String(e) }
    }
  }

  if (op === 'list') {
    return { ok: true, servers: readServers().map(publicServer) }
  }

  if (op === 'save') {
    const a = (req && (req.server as Record<string, unknown> | undefined)) || {}
    const baseUrl = normalizeBase(String(a.baseUrl || ''))
    const username = String(a.username || '').trim()
    const token = String(a.token || '').trim()
    if (!/^https?:\/\//i.test(baseUrl)) return { ok: false, code: 'url-invalid', error: 'Server URL must start with http:// or https://' }
    if (!username) return { ok: false, code: 'username-required', error: 'Username is required' }
    // 名称选填（缺省用服务器地址），用户名必填。
    const name = String(a.name || '').trim() || baseUrl
    // readServers 返回 JSON.parse 结果（可变），可安全增改。
    const servers = readServers()
    if (a.id) {
      const s = servers.find((x) => x.id === a.id)
      if (!s) return { ok: false, code: 'server-missing', error: 'Server not found' }
      // 编辑已保存过 Token 的服务器时允许 Token 留空：沿用上次保存的旧值，
      // 不重复校验（与前端「留空则不修改」提示一致）；仅存量记录本身没有
      // Token（数据异常）时才要求填写。新增服务器仍必须提供 Token。
      const effectiveToken = token || s.token
      if (!effectiveToken) return { ok: false, code: 'token-required', error: 'Token is required' }
      // 连接相关字段（地址/用户名/TLS/Token 本身）是否变化：变化才清除已验证
      // 状态、要求重新测试连接；仅改名或 Token 留空保存不影响「连接成功」标记。
      const connChanged = s.baseUrl !== baseUrl
        || s.username !== username
        || !!s.insecure !== !!a.insecure
        || (!!token && token !== s.token)
      s.name = name
      s.baseUrl = baseUrl
      s.username = username
      s.token = effectiveToken
      s.insecure = !!a.insecure
      if (connChanged) s.verified = false
    } else {
      if (!token) return { ok: false, code: 'token-required', error: 'Token is required' }
      servers.push({
        id: 'srv-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
        name, baseUrl, username, token, insecure: !!a.insecure,
      })
    }
    await writeServers(servers)
    return { ok: true, servers: readServers().map(publicServer) }
  }

  if (op === 'delete') {
    const servers = readServers().filter((s) => s.id !== req.id)
    await writeServers(servers)
    return { ok: true, servers: readServers().map(publicServer) }
  }

  if (op === 'test') {
    const a = (req && (req.server as Record<string, unknown> | undefined)) || {}
    const stored = a.id ? findServer(String(a.id)) : null
    let baseUrl = normalizeBase(String(a.baseUrl || ''))
    let username = String(a.username || '').trim()
    let token = String(a.token || '').trim()
    if (stored) {
      if (!baseUrl) baseUrl = stored.baseUrl
      if (!username) username = stored.username
      if (!token) token = stored.token
    }
    if (!baseUrl || !token) return { ok: false, code: 'fields-missing', error: 'Server URL and Token are required' }
    const insecure = a.insecure !== undefined ? !!a.insecure : (stored ? !!stored.insecure : false)
    const server = { baseUrl, username: username || 'admin', token, insecure }
    // 记录已验证状态（仅针对已保存的服务器）：测试成功置位、失败清除，持久化到服务器配置。
    // 注意：readServers() 每次调用都会重新 JSON.parse 返回新对象数组，
    // 必须在同一次读取的数组上修改并写回，跨调用修改旧引用会导致写盘丢失。
    const persistVerified = async (v: boolean): Promise<void> => {
      if (!stored) return
      const servers = readServers()
      const target = servers.find((s) => s.id === stored.id)
      if (target) {
        target.verified = v
        await writeServers(servers)
      }
    }
    let r: HttpResponse
    try {
      r = await jenkinsRequest(ctx, server, '/api/json', { op: 'test' })
    } catch (e) {
      await persistVerified(false)
      return { ok: false, code: errCodeOf(e) || 'network-failed', error: e instanceof Error ? e.message : String(e) }
    }
    if (r.status === 401) { await persistVerified(false); return { ok: false, code: 'auth-failed', error: 'Authentication failed: wrong username or Token (HTTP 401)' } }
    if (r.status === 403) { await persistVerified(false); return { ok: false, code: 'forbidden', error: 'Permission denied (HTTP 403)' } }
    if (r.status >= 400) { await persistVerified(false); return { ok: false, code: 'connect-failed', error: 'Connection failed (HTTP ' + r.status + ')' } }
    let data: { version?: string; nodeName?: string } | null = null
    try { data = JSON.parse(r.body || '{}') } catch { /* ignore */ }
    await persistVerified(true)
    // 版本号来自响应头 X-Jenkins（root api/json 正文里没有 version 字段）：
    // 头块解析修正后这里才拿得到真实版本。
    const version = (data && data.version) || headerValue(r.headers, 'X-Jenkins') || ''
    return { ok: true, version, nodeName: data && data.nodeName ? data.nodeName : '' }
  }

  if (op === 'jobs') {
    const s = findServer(String(req.serverId || ''))
    if (!s) return { ok: false, code: 'server-missing', error: 'Server not found; configure it in settings first' }
    // 三层 tree：顶层 + 两层文件夹；文件夹内的 Job 最多展开到第 3 层，更深的
    // 文件夹以 folder 占位返回（客户端会过滤，不会误当作可构建 Job）。
    const tree = 'jobs[name,color,url,buildable,jobs[name,color,url,buildable,jobs[name,color,url,buildable]]]'
    let data: { jobs?: Array<Record<string, unknown>> } | null
    try {
      data = await jenkinsJson(ctx, s, '/api/json?tree=' + encodeURIComponent(tree), { op: 'jobs' }) as { jobs?: Array<Record<string, unknown>> } | null
    } catch (e) {
      // 认证 / 权限 / 网络 / 重定向 / 解析失败等原因由 jenkins.ts 落日志；
      // 这里统一转成 { ok:false, code } 返回（避免抛异常让调用方拿到无 code 的报错）。
      return { ok: false, code: errCodeOf(e), error: e instanceof Error ? e.message : String(e) }
    }
    // 空响应（重定向后无正文 / 200 空体 / 响应头被收集上限截断）时不能直接取 data.jobs，
    // 否则会抛 TypeError，变成一个无法解读的报错。此处给出明确原因。
    if (data === null || typeof data !== 'object') {
      return { ok: false, code: 'empty-response', error: 'Jenkins 返回空响应，无法读取 Job 列表（请检查服务器地址、重定向与代理设置）' }
    }
    if (data.jobs !== undefined && !Array.isArray(data.jobs)) {
      return { ok: false, code: 'parse-failed', error: '响应格式异常：jobs 字段不是数组（代理 / 登录页可能返回了非 Jenkins 内容）' }
    }
    const jobs: Array<Record<string, unknown>> = []
    const walk = (list: Array<Record<string, unknown>> | undefined, prefix: string[], depth: number): void => {
      for (const j of list || []) {
        const segs = prefix.concat([String(j.name)])
        const isFolder = j.color === 'folder' || (Array.isArray(j.jobs) && (j.jobs as unknown[]).length > 0)
        if (isFolder) {
          if (depth < 3 && Array.isArray(j.jobs)) walk(j.jobs as Array<Record<string, unknown>>, segs, depth + 1)
          else jobs.push({ path: segs.join('/'), name: j.name, color: 'folder', buildable: false, folder: true, url: j.url || '' })
        } else {
          jobs.push({ path: segs.join('/'), name: j.name, color: j.color || 'grey', buildable: !!j.buildable, folder: false, url: j.url || '' })
        }
      }
    }
    walk(data.jobs || [], [], 1)
    jobs.sort((x, y) => x.folder === y.folder ? String(x.name).localeCompare(String(y.name)) : x.folder ? -1 : 1)
    return { ok: true, jobs }
  }

  if (op === 'jobDetail') {
    const s = findServer(String(req.serverId || ''))
    if (!s) return { ok: false, code: 'server-missing', error: 'Server not found' }
    const segs = jobSegments(String(req.jobUrl || ''))
    if (segs.length === 0) return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' }
    const data = await jenkinsJson(ctx, s, jobPath(segs) + '/api/json', { op: 'jobDetail' }) as {
      name?: string
      buildable?: boolean
      color?: string
      nextBuildNumber?: number
      url?: string
      lastBuild?: { number?: number; building?: boolean; result?: string | null }
      property?: Array<Record<string, unknown>>
    }
    const params = extractParams(data.property)
    return {
      ok: true,
      name: data.name || '',
      buildable: !!data.buildable,
      color: data.color || '',
      nextBuildNumber: data.nextBuildNumber || null,
      url: data.url || '',
      lastBuild: data.lastBuild ? { number: data.lastBuild.number, building: !!data.lastBuild.building, result: data.lastBuild.result || null } : null,
      params: await resolveDynamicChoices(ctx, s, segs, params, data.url || ''),
      segments: segs,
    }
  }

  if (op === 'jobHistory') {
    // 「历史记录」tab：拉取指定 Job 在服务器上的真实构建历史（Jenkins remote API
    // job/<path>/api/json?tree=builds[...]），返回最近最多 100 条构建记录。
    const s = findServer(String(req.serverId || ''))
    if (!s) return { ok: false, code: 'server-missing', error: 'Server not found' }
    const segs = Array.isArray(req.segments) && (req.segments as unknown[]).length ? (req.segments as string[]) : jobSegments(String(req.jobUrl || ''))
    if (segs.length === 0) return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' }
    // 深度 tree 一次取全字段（避免每条构建一次请求）：编号 / 时间 / 结果 / 是否构建中 / 耗时 / 地址 / 描述 / 显示名。
    const tree = 'builds[number,timestamp,result,building,duration,url,description,displayName]'
    const data = await jenkinsJson(ctx, s, jobPath(segs) + '/api/json?tree=' + encodeURIComponent(tree), { op: 'jobHistory' }) as {
      builds?: Array<Record<string, unknown>>
    }
    const builds = (data.builds || []).map((b) => ({
      number: b.number == null ? null : Number(b.number),
      timestamp: b.timestamp == null ? null : Number(b.timestamp),
      result: b.result == null ? null : String(b.result),
      building: !!b.building,
      duration: b.duration == null ? 0 : Number(b.duration),
      url: String(b.url || ''),
      description: String(b.description || ''),
      displayName: String(b.displayName || ''),
    }))
    return { ok: true, builds, job: segs.join('/'), server: s.name }
  }

  if (op === 'trigger') {
    const s = findServer(String(req.serverId || ''))
    if (!s) return { ok: false, code: 'server-missing', error: 'Server not found' }
    const segs = Array.isArray(req.segments) && (req.segments as unknown[]).length ? (req.segments as string[]) : jobSegments(String(req.jobUrl || ''))
    if (segs.length === 0) return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' }
    const params = req.parameters && typeof req.parameters === 'object' ? (req.parameters as Record<string, string | number | boolean>) : {}
    const hasParams = Object.keys(params).length > 0
    const crumb = await getCrumb(ctx, s, 'trigger')
    const headers: Record<string, string> = {}
    if (crumb) headers[crumb.field] = crumb.value
    const path = jobPath(segs) + (hasParams ? '/buildWithParameters' : '/build')
    const res = await jenkinsRequest(ctx, s, path, { method: 'POST', form: hasParams ? params : null, headers, op: 'trigger' })
    if (res.status >= 300 && res.status < 400) {
      return { ok: false, code: 'redirect', error: 'Server returned a redirect (HTTP ' + res.status + '); check that the URL is the final one (e.g. https://…)' }
    }
    if (res.status >= 400) {
      const detail = (res.body || '').trim().slice(0, 300)
      return { ok: false, code: 'trigger-http', status: res.status, detail, error: 'Failed to trigger build (HTTP ' + res.status + '): ' + (detail || 'no response body') }
    }
    const loc = headerValue(res.headers, 'Location')
    const qm = loc ? String(loc).match(/\/queue\/item\/(\d+)/) : null
    return { ok: true, queueId: qm ? Number(qm[1]) : null, location: loc || null }
  }

  if (op === 'queueStatus') {
    const s = findServer(String(req.serverId || ''))
    if (!s) return { ok: false, code: 'server-missing', error: 'Server not found' }
    const id = Number(req.queueId)
    if (!id) return { ok: false, code: 'queue-id-missing', error: 'Missing queue ID' }
    const data = await jenkinsJson(ctx, s, '/queue/item/' + id + '/api/json', { op: 'queueStatus' }) as {
      executable?: { number?: number; url?: string }
      cancelled?: boolean
      blocked?: boolean
      why?: string
    }
    const ex = data.executable
    if (ex && ex.number) return { ok: true, state: 'started', buildNumber: ex.number, buildUrl: ex.url || '', why: data.why || '' }
    if (data.cancelled) return { ok: true, state: 'cancelled', why: data.why || '' }
    return { ok: true, state: 'queued', why: data.why || '', blocked: !!data.blocked }
  }

  if (op === 'buildStatus') {
    const s = findServer(String(req.serverId || ''))
    if (!s) return { ok: false, code: 'server-missing', error: 'Server not found' }
    const segs = Array.isArray(req.segments) && (req.segments as unknown[]).length ? (req.segments as string[]) : jobSegments(String(req.jobUrl || ''))
    if (segs.length === 0) return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' }
    const num = Number(req.buildNumber)
    const path = jobPath(segs) + (num ? '/' + num : '/lastBuild') + '/api/json'
    try {
      const data = await jenkinsJson(ctx, s, path, { op: 'buildStatus' }) as {
        number?: number
        building?: boolean
        result?: string | null
        duration?: number
        timestamp?: number
        estimatedDuration?: number
        url?: string
        displayName?: string
      }
      return {
        ok: true,
        number: data.number || null,
        building: !!data.building,
        result: data.result || null,
        duration: data.duration || 0,
        timestamp: data.timestamp || 0,
        estimatedDuration: data.estimatedDuration || 0,
        url: data.url || '',
        displayName: data.displayName || '',
      }
    } catch (e) {
      const err = e as { status?: number }
      if (err && err.status === 404) return { ok: false, code: 'build-not-found', error: 'No build record found yet', notFound: true }
      throw e
    }
  }

  if (op === 'buildLog') {
    const s = findServer(String(req.serverId || ''))
    if (!s) return { ok: false, code: 'server-missing', error: 'Server not found' }
    const segs = Array.isArray(req.segments) && (req.segments as unknown[]).length ? (req.segments as string[]) : jobSegments(String(req.jobUrl || ''))
    if (segs.length === 0) return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' }
    const num = Number(req.buildNumber)
    if (!num) return { ok: false, code: 'build-not-found', error: 'Missing build number' }
    const path = jobPath(segs) + '/' + num + '/consoleText'
    const res = await jenkinsRequest(ctx, s, path, { op: 'buildLog' })
    if (res.status === 404) return { ok: false, code: 'build-not-found', error: 'No build log found yet', notFound: true }
    if (res.status >= 400) return { ok: false, code: 'log-failed', status: res.status, error: 'Failed to fetch build log (HTTP ' + res.status + ')' }
    // consoleText 可能极大：截取末尾（最新内容）并标记已截断
    const MAX_LOG = 500 * 1024
    const body = res.body || ''
    const truncated = body.length > MAX_LOG
    return { ok: true, log: truncated ? body.slice(body.length - MAX_LOG) : body, truncated }
  }

  if (op === 'cancel') {
    const s = findServer(String(req.serverId || ''))
    if (!s) return { ok: false, code: 'server-missing', error: 'Server not found' }
    const crumb = await getCrumb(ctx, s, 'cancel')
    const headers: Record<string, string> = {}
    if (crumb) headers[crumb.field] = crumb.value
    // 已开始（有构建号）：停掉构建；仍在排队：取消队列项（构建一旦开始队列项即消失，优先按构建号处理）
    const num = Number(req.buildNumber)
    if (num) {
      const segs = Array.isArray(req.segments) && (req.segments as unknown[]).length ? (req.segments as string[]) : jobSegments(String(req.jobUrl || ''))
      if (segs.length === 0) return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' }
      const res = await jenkinsRequest(ctx, s, jobPath(segs) + '/' + num + '/stop', { method: 'POST', headers, op: 'cancel' })
      if (res.status >= 400) {
        return { ok: false, code: 'cancel-failed', status: res.status, error: 'Failed to stop build (HTTP ' + res.status + ')' }
      }
      return { ok: true, target: 'build' }
    }
    const queueId = Number(req.queueId)
    if (queueId) {
      const res = await jenkinsRequest(ctx, s, '/queue/cancelItem?id=' + queueId, { method: 'POST', headers, op: 'cancel' })
      if (res.status >= 400) {
        return { ok: false, code: 'cancel-failed', status: res.status, error: 'Failed to cancel queued build (HTTP ' + res.status + ')' }
      }
      return { ok: true, target: 'queue' }
    }
    return { ok: false, code: 'build-not-found', error: 'Missing build number or queue id' }
  }

  if (op === 'updateCheck') {
    // 插件新版本检查：npm registry（keywords:dsh-jenkins）最新版 vs 被安装根目录
    // package.json 版本；完全实时（无缓存），网络失败静默降级。
    const update = await checkPluginUpdate()
    return { ok: true, update }
  }

  if (op === 'pluginUpdateStart') {
    // 后台执行 `dsh plugin --profile web update dsh-jenkins`，
    // stdout/stderr 进入宿主环形缓冲，客户端轮询 status 拉取日志。
    const start = startPluginUpdate()
    return start.ok
      ? { ok: true, alreadyRunning: start.alreadyRunning === true }
      : { ok: false, code: 'spawn-failed', error: start.error ?? 'failed to spawn dsh' }
  }

  if (op === 'pluginUpdateStatus') {
    // 客户端轮询拉取更新进程的累计输出与运行状态。
    // 版本号本身由 update.ts 实时读取（无缓存），更新结束后无需失效动作。
    const status = getPluginUpdateStatus()
    return { ok: true, status }
  }

  if (op === 'cacheGet') {
    return { ok: true, cache: deps.readCacheJson() }
  }

  if (op === 'cacheSet') {
    // 按顶层键合并写入（lastParams / history），避免两个域互相覆盖。
    const key = String(req.key || '')
    if (key !== 'lastParams' && key !== 'history') {
      return { ok: false, code: 'cache-key-invalid', error: 'Invalid cache key: ' + key }
    }
    const cache = deps.readCacheJson()
    cache[key] = req.value
    await deps.writeCacheJson(cache)
    return { ok: true }
  }

  return { ok: false, code: 'unknown-op', error: 'Unknown operation: ' + String(op) }
}
