/**
 * dsh-jenkins —— Jenkins CLI 插件 · 宿主半边（可发布组合包，无硬编码路径）
 *
 * 参考 @lemcae/dsh-balance 的双面结构：
 * - settings namespace（dsh-jenkins.servers）持久化多服务器配置，base 层来自
 *   cordis.yml 的 config.servers（Schemastery 校验），用户层可经命令写入并持久化；
 * - `dsh-jenkins` 命令：客户端（设置页）经 ctx.remote.commands.execute 调用，
 *   参数为 JSON（{ op: 'list|save|delete|test|jobs|jobDetail|trigger|queueStatus|buildStatus', ... }），
 *   结果以 JSON 文本回传；
 * - 两个模型工具 dsh_jenkins_build / dsh_jenkins_status。
 *
 * 运行时依赖（@deepseek-ai/*）由 package.json 的 peerDependencies 声明，
 * 安装时由宿主解析，本文件不含任何绝对路径。
 */

import Schema from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'

export const name = 'dsh-jenkins'
export const inject = ['shell', 'tools', 'settings', 'commands']

/* ── 配置（docs/develop/basic/config）────────────────────────── */

const ServerSchema = Schema.object({
  id: Schema.string().required(),
  name: Schema.string().required(),
  baseUrl: Schema.string().required(),
  username: Schema.string().required(),
  token: Schema.string().required(),
  insecure: Schema.boolean().default(false),
})

export const Config = Schema.object({
  servers: Schema.array(ServerSchema).default([]),
})

/** 运行时 settings namespace：服务器列表以 JSON 字符串持久化到 $DSH_HOME/settings.yaml。 */
const JenkinsSettingsSchema = Schema.object({
  serversJson: Schema.string().default('[]'),
})

/* ── Jenkins REST 调用核心（curl.exe，经宿主 shell 服务执行）───── */

const psQuote = (v) => `'${String(v).replace(/'/g, "''")}'`
const normalizeBase = (u) => String(u || '').trim().replace(/\/+$/, '')

function jobSegments(jobUrl) {
  const m = String(jobUrl || '').match(/\/job\/(.+?)\/?$/)
  if (!m) return []
  return m[1].split('/job/').map((seg) => {
    try { return decodeURIComponent(seg) } catch { return seg }
  })
}
const jobPath = (segments) => segments.map((seg) => '/job/' + encodeURIComponent(seg)).join('')

function splitHeaders(stdout) {
  const i1 = stdout.indexOf('\r\n\r\n')
  if (i1 !== -1) return { headers: stdout.slice(0, i1), body: stdout.slice(i1 + 4) }
  const i2 = stdout.indexOf('\n\n')
  if (i2 !== -1) return { headers: stdout.slice(0, i2), body: stdout.slice(i2 + 2) }
  return { headers: stdout, body: '' }
}
function lastStatus(headers) {
  const matches = [...headers.matchAll(/HTTP\/\d(?:\.\d)?\s+(\d+)/g)]
  if (matches.length === 0) return 0
  return Number(matches[matches.length - 1][1])
}
function headerValue(headers, name) {
  const m = headers.match(new RegExp(`^${name}\\s*:\\s*(.+)$`, 'im'))
  return m ? m[1].trim() : undefined
}

async function runCurl(ctx, server, args, opts) {
  // 用 ctx.subprocess 直接 spawn curl.exe（绕开 pwsh-sandbox 受限令牌导致的
  // Schannel SEC_E_NO_CREDENTIALS —— 与 dsh-balance 拉余额同一路径）。
  const sub = ctx.get('subprocess')
  if (sub === undefined) throw new Error('subprocess 服务不可用，无法调用 Jenkins API')
  let curlPath
  try {
    curlPath = await sub.resolveExecutable('curl.exe')
  } catch {
    curlPath = await sub.resolveExecutable('curl')
  }
  let cwd = '.'
  const policy = ctx.get('sandboxPolicy')
  if (policy !== undefined && typeof policy.workspaceRoot === 'string' && policy.workspaceRoot.length > 0) cwd = policy.workspaceRoot
  const argv = [curlPath, '-sS', '-m', '40', '-u', (server.username || 'admin') + ':' + server.token]
  if (server.insecure) argv.push('-k')
  for (const a of args) argv.push(a)
  let handle
  try {
    handle = sub.spawn({
      argv,
      cwd,
      stdio: {
        stdin: opts && opts.stdin !== undefined ? { data: opts.stdin } : 'ignore',
        stdout: { mode: 'collect', maxBytes: 8 * 1024 * 1024 },
        stderr: { mode: 'collect', maxBytes: 64 * 1024 },
      },
      graceMs: 5000,
    })
  } catch (e) {
    throw new Error('启动 curl 失败：' + ((e && e.message) || String(e)))
  }
  let outcome
  try {
    outcome = await handle.done
  } catch (e) {
    throw new Error('启动 curl 失败：' + ((e && e.message) || String(e)))
  }
  const stdout = handle.collected && handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : ''
  const stderr = handle.collected && handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : ''
  return { exitCode: outcome.exitCode, stdout, stderr }
}

async function jenkinsRequest(ctx, server, path, opts) {
  const method = opts?.method ?? 'GET'
  const form = opts?.form !== undefined ? opts.form : null
  const headers = opts?.headers ?? {}
  const args = ['-D', '-']
  if (method === 'POST') args.push('-X', 'POST')
  for (const k of Object.keys(headers)) args.push('-H', `${k}: ${headers[k]}`)
  if (form !== null) args.push('--data-binary', '@-')
  args.push(normalizeBase(server.baseUrl) + path)

  const runOpts = {}
  if (form !== null) {
    const pairs = []
    for (const k of Object.keys(form)) pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent(form[k] == null ? '' : String(form[k])))
    runOpts.stdin = pairs.join('&')
  }
  const res = await runCurl(ctx, server, args, runOpts)
  if (res.exitCode !== 0 && res.exitCode !== null) {
    throw new Error('网络请求失败：' + ((res.stderr || '').trim() || `curl 退出码 ${res.exitCode}`))
  }
  const parsed = splitHeaders(res.stdout)
  return { status: lastStatus(parsed.headers), headers: parsed.headers, body: parsed.body }
}

async function jenkinsJson(ctx, server, path, opts) {
  const r = await jenkinsRequest(ctx, server, path, opts)
  if (r.status >= 400) {
    let msg = 'HTTP ' + r.status
    try {
      const j = JSON.parse(r.body || '{}')
      if (j.message) msg += '：' + j.message
    } catch { /* ignore */ }
    if (r.status === 401) msg = '认证失败（HTTP 401）：用户名或 Token 不正确'
    if (r.status === 403) msg = '权限不足（HTTP 403）：请检查 Token 权限'
    if (r.status === 404) msg = '资源不存在（HTTP 404）'
    const err = new Error(msg)
    err.status = r.status
    throw err
  }
  if (!r.body || !r.body.trim()) return null
  try { return JSON.parse(r.body) } catch (e) { throw new Error('响应解析失败：' + e.message) }
}

async function getCrumb(ctx, server) {
  try {
    const r = await jenkinsRequest(ctx, server, '/crumbIssuer/api/json')
    if (r.status >= 400) return null
    const j = JSON.parse(r.body || '{}')
    if (j && j.crumb) return { field: j.crumbRequestField || 'Jenkins-Crumb', value: j.crumb }
  } catch { /* ignore */ }
  return null
}

function normalizeParamDef(d) {
  const cls = d._class || ''
  const name = d.name || ''
  const desc = d.description || ''
  let type = 'string'
  let defaultValue = d.defaultValue
  let choices = null
  if (cls.indexOf('BooleanParameterDefinition') !== -1) type = 'boolean'
  else if (cls.indexOf('ChoiceParameterDefinition') !== -1) { type = 'choice'; choices = Array.isArray(d.choices) ? d.choices : [] }
  else if (cls.indexOf('PasswordParameterDefinition') !== -1) type = 'password'
  else if (cls.indexOf('TextParameterDefinition') !== -1) type = 'text'
  else if (cls.indexOf('CredentialsParameterDefinition') !== -1) type = 'credentials'
  else if (cls.indexOf('FileParameterDefinition') !== -1) type = 'file'
  return {
    name,
    description: desc,
    type,
    defaultValue: defaultValue === null || defaultValue === undefined ? '' : defaultValue,
    choices,
  }
}

function extractParams(prop) {
  const list = prop || []
  let holder = null
  for (let i = 0; i < list.length; i++) {
    const x = list[i]
    if (x && String(x._class || '').indexOf('ParametersDefinitionProperty') !== -1) { holder = x; break }
  }
  if (!holder) return []
  const defs = holder.parameterDefinitions || []
  const out = []
  for (let i = 0; i < defs.length; i++) out.push(normalizeParamDef(defs[i]))
  return out
}

/* ── 插件主体 ────────────────────────────────────────────────── */

export function apply(ctx, config) {
  const shell = ctx.get('shell')
  if (shell === undefined) return
  const settings = ctx.get('settings')
  const commands = ctx.get('commands')

  // settings namespace：服务器列表以 JSON 字符串存储（规避 settings 对数组
  // 的深冻结 + schemastery 校验原地改写导致的 "object is not extensible"）。
  let scope = null
  if (settings !== undefined) {
    scope = settings.register(settingsNamespace('dsh-jenkins'), JenkinsSettingsSchema, {
      base: { serversJson: JSON.stringify(config.servers || []) },
    })
  }
  const readServers = () => {
    let raw = '[]'
    if (scope !== null) {
      const value = scope.get()
      if (value && typeof value.serversJson === 'string') raw = value.serversJson
    } else {
      raw = JSON.stringify(config.servers || [])
    }
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  const writeServers = async (servers) => {
    if (scope !== null) await scope.update({ serversJson: JSON.stringify(servers) })
  }

  // 按名称 / id / baseUrl（去尾部斜杠）匹配，兼容配置里直接写服务器地址的形式。
  const normUrl = (u) => String(u || '').trim().replace(/\/+$/, '')
  const findServer = (nameOrIdOrUrl) => {
    const ref = normUrl(nameOrIdOrUrl)
    const all = readServers()
    return all.find((s) => s.name === nameOrIdOrUrl || s.id === nameOrIdOrUrl || normUrl(s.baseUrl) === ref)
  }
  const maskToken = (t) => {
    if (!t) return ''
    if (t.length <= 6) return '••••••'
    return t.slice(0, 2) + '••••' + t.slice(-2)
  }
  const publicServer = (s) => ({
    id: s.id,
    name: s.name,
    baseUrl: s.baseUrl,
    username: s.username,
    tokenMasked: maskToken(s.token),
    hasToken: !!s.token,
    insecure: !!s.insecure,
  })

  // ─── 操作分发：命令与工具共用 ─────────────────────────────────

  // 工作区根目录的 dsh-jenkins.{json,js,ts} 配置文件：数组形式，每个元素 = 一个发布目标（job + server + environments 参数）。
  const fsService = ctx.get('fs')

  async function findConfigFile(cwd) {
    if (fsService === undefined) throw new Error('fs 服务不可用，无法读取工作区配置')
    const names = ['dsh-jenkins.json', 'dsh-jenkins.js', 'dsh-jenkins.ts']
    for (const name of names) {
      try {
        const target = await fsService.resolve(name, { cwd })
        const info = await fsService.stat(target)
        if (info !== undefined) return { name, target }
      } catch { /* try next candidate */ }
    }
    return null
  }

  async function parseConfigFile(found) {
    const { name, target } = found
    if (name.endsWith('.json')) {
      const text = await fsService.readText(target)
      return JSON.parse(text)
    }
    // .js / .ts：用 node 子进程求值（ESM default 导出；.ts 需 tsx 加载器）。
    const abs = fsService.processPath(target)
    const script = "import('file:///'+process.argv[1].replace(/\\\\/g,'/')).then(m=>process.stdout.write(JSON.stringify(m.default??m))).catch(e=>{process.stderr.write(String((e&&e.message)||e));process.exit(1)})"
    const tsFlag = name.endsWith('.ts') ? '--import tsx/esm ' : ''
    const command = `node ${tsFlag}--input-type=module -e ${psQuote(script)} ${psQuote(abs)}`
    const spec = shell.resolve({ command, timeoutMs: 20000, stdoutMaxBytes: 2 * 1024 * 1024 })
    const res = await shell.run(spec)
    if (res.exitCode !== 0 && res.exitCode !== null) {
      const detail = ((res.stderr && res.stderr.text) || '').trim().slice(0, 300)
      throw new Error('配置文件解析失败：' + (detail || `node 退出码 ${res.exitCode}`))
    }
    return JSON.parse((res.stdout && res.stdout.text) || '{}')
  }

  function normalizeConfig(raw) {
    // 新格式：数组，每个元素 = 一个发布目标（job + server + environments 参数表）。
    if (!Array.isArray(raw)) throw new Error('配置文件需导出数组（每个元素一个发布目标：{ job, server, environments }）')
    if (raw.length === 0) throw new Error('配置文件数组不能为空')
    const entries = raw.map((e, i) => {
      if (!e || typeof e !== 'object' || Array.isArray(e)) {
        throw new Error('配置第 ' + (i + 1) + ' 项需为对象')
      }
      const job = String(e.job || '').trim()
      if (!job) throw new Error('配置第 ' + (i + 1) + ' 项缺少 job（Jenkins 任务路径）')
      const server = String(e.server || '').trim()
      if (!server) throw new Error('配置第 ' + (i + 1) + ' 项缺少 server（服务器名称或地址）')
      const parameters = (e.environments && typeof e.environments === 'object' && !Array.isArray(e.environments))
        ? e.environments
        : {}
      return { job, server, parameters }
    })
    return { format: 'array', entries }
  }

  async function loadWorkspaceConfig(cwd) {
    const found = await findConfigFile(cwd)
    if (found === null) return null
    const raw = await parseConfigFile(found)
    const config = normalizeConfig(raw)
    return { ...config, file: found.name }
  }

  /** 把异常/消息映射为本地化错误码（客户端按 code 显示中/英文）。 */
  function errCodeOf(e) {
    if (e && e.status === 401) return 'auth-failed'
    if (e && e.status === 403) return 'forbidden'
    if (e && e.status === 404) return 'not-found'
    const msg = (e && e.message) || String(e)
    if (msg.indexOf('网络请求失败') !== -1) return 'network-failed'
    if (msg.indexOf('无法解析任务路径') !== -1) return 'job-path-invalid'
    if (msg.indexOf('缺少队列 ID') !== -1) return 'queue-id-missing'
    if (msg.indexOf('缺少工作区路径') !== -1) return 'cwd-missing'
    if (msg.indexOf('响应解析失败') !== -1) return 'parse-failed'
    return undefined
  }

  async function runOp(req) {
    const op = req && req.op

    if (op === 'workspaceConfig') {
      const cwd = String(req.cwd || '').trim()
      console.log('[dsh-jenkins] workspaceConfig cwd=', cwd)
      if (!cwd) return { ok: false, code: 'cwd-missing', error: 'Missing workspace path' }
      try {
        const config = await loadWorkspaceConfig(cwd)
        console.log('[dsh-jenkins] workspaceConfig found=', config !== null, config && config.file)
        return config === null
          ? { ok: true, found: false, config: null }
          : { ok: true, found: true, config }
      } catch (e) {
        console.error('[dsh-jenkins] workspaceConfig error', e)
        return { ok: false, code: errCodeOf(e), error: (e && e.message) || String(e) }
      }
    }

    if (op === 'workspaceTrigger') {
      const cwd = String(req.cwd || '').trim()
      if (!cwd) return { ok: false, code: 'cwd-missing', error: 'Missing workspace path' }
      try {
        const config = await loadWorkspaceConfig(cwd)
        if (config === null) return { ok: false, code: 'no-config', error: 'No dsh-jenkins.json/js/ts config found in workspace root' }
        const entries = config.entries || []
        // 服务器解析顺序：弹框选择的 serverId → 配置元素匹配的服务器 → 唯一服务器。
        let server = req.serverId ? findServer(req.serverId) : undefined
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
        let parameters = (req.parameters && typeof req.parameters === 'object' && Object.keys(req.parameters).length > 0)
          ? req.parameters
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
        const result = await runOp({ op: 'trigger', serverId: server.id, segments: segs, parameters })
        if (!result.ok) return result
        let nextBuildNumber = null
        if (result.queueId == null) {
          try {
            const d = await runOp({ op: 'jobDetail', serverId: server.id, jobUrl: normalizeBase(server.baseUrl) + jobPath(segs) })
            if (d.ok) nextBuildNumber = d.nextBuildNumber
          } catch { /* keep null */ }
        }
        return { ok: true, queueId: result.queueId, location: result.location, serverId: server.id, segments: segs, nextBuildNumber }
      } catch (e) {
        return { ok: false, code: errCodeOf(e), error: (e && e.message) || String(e) }
      }
    }

    if (op === 'list') {
      return { ok: true, servers: readServers().map(publicServer) }
    }

    if (op === 'save') {
      const a = (req && req.server) || {}
      const baseUrl = normalizeBase(a.baseUrl)
      const username = String(a.username || '').trim()
      const token = String(a.token || '').trim()
      if (!/^https?:\/\//i.test(baseUrl)) return { ok: false, code: 'url-invalid', error: 'Server URL must start with http:// or https://' }
      if (!token) return { ok: false, code: 'token-required', error: 'Token is required' }
      // 名称选填（缺省用地址主机名），用户名选填（缺省 admin）。
      const name = String(a.name || '').trim() || (baseUrl.replace(/^https?:\/\//i, '').split('/')[0] || baseUrl)
      // readServers 返回 JSON.parse 结果（可变），可安全增改。
      const servers = readServers()
      if (a.id) {
        const s = servers.find((x) => x.id === a.id)
        if (!s) return { ok: false, code: 'server-missing', error: 'Server not found' }
        s.name = name
        s.baseUrl = baseUrl
        s.username = username
        s.insecure = !!a.insecure
        if (token) s.token = token
      } else {
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
      const a = (req && req.server) || {}
      const stored = a.id ? findServer(a.id) : null
      let baseUrl = normalizeBase(a.baseUrl)
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
      const r = await jenkinsRequest(ctx, server, '/api/json')
      if (r.status === 401) return { ok: false, code: 'auth-failed', error: 'Authentication failed: wrong username or Token (HTTP 401)' }
      if (r.status === 403) return { ok: false, code: 'forbidden', error: 'Permission denied (HTTP 403)' }
      if (r.status >= 400) return { ok: false, code: 'connect-failed', error: 'Connection failed (HTTP ' + r.status + ')' }
      let data = null
      try { data = JSON.parse(r.body || '{}') } catch { /* ignore */ }
      return { ok: true, version: data && data.version ? data.version : '', nodeName: data && data.nodeName ? data.nodeName : '' }
    }

    if (op === 'jobs') {
      const s = findServer(req.serverId)
      if (!s) return { ok: false, code: 'server-missing', error: 'Server not found; configure it in settings first' }
      const tree = 'jobs[name,color,url,buildable,jobs[name,color,url,buildable,jobs[name,color,url,buildable]]]'
      const data = await jenkinsJson(ctx, s, '/api/json?tree=' + encodeURIComponent(tree))
      const jobs = []
      const walk = (list, prefix, depth) => {
        for (const j of list || []) {
          const segs = prefix.concat([j.name])
          const isFolder = j.color === 'folder' || (Array.isArray(j.jobs) && j.jobs.length > 0)
          if (isFolder) {
            if (depth < 3 && Array.isArray(j.jobs)) walk(j.jobs, segs, depth + 1)
            else jobs.push({ path: segs.join('/'), name: j.name, color: 'folder', buildable: false, folder: true, url: j.url || '' })
          } else {
            jobs.push({ path: segs.join('/'), name: j.name, color: j.color || 'grey', buildable: !!j.buildable, folder: false, url: j.url || '' })
          }
        }
      }
      walk(data.jobs || [], [], 1)
      jobs.sort((x, y) => x.folder === y.folder ? x.name.localeCompare(y.name) : x.folder ? -1 : 1)
      return { ok: true, jobs }
    }

    if (op === 'jobDetail') {
      const s = findServer(req.serverId)
      if (!s) return { ok: false, code: 'server-missing', error: 'Server not found' }
      const segs = jobSegments(req.jobUrl)
      if (segs.length === 0) return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' }
      const data = await jenkinsJson(ctx, s, jobPath(segs) + '/api/json')
      return {
        ok: true,
        name: data.name || '',
        buildable: !!data.buildable,
        color: data.color || '',
        nextBuildNumber: data.nextBuildNumber || null,
        url: data.url || '',
        lastBuild: data.lastBuild ? { number: data.lastBuild.number, building: !!data.lastBuild.building, result: data.lastBuild.result || null } : null,
        params: extractParams(data.property),
        segments: segs,
      }
    }

    if (op === 'trigger') {
      const s = findServer(req.serverId)
      if (!s) return { ok: false, code: 'server-missing', error: 'Server not found' }
      const segs = Array.isArray(req.segments) && req.segments.length ? req.segments : jobSegments(req.jobUrl)
      if (segs.length === 0) return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' }
      const params = req.parameters && typeof req.parameters === 'object' ? req.parameters : {}
      const hasParams = Object.keys(params).length > 0
      const crumb = await getCrumb(ctx, s)
      const headers = {}
      if (crumb) headers[crumb.field] = crumb.value
      const path = jobPath(segs) + (hasParams ? '/buildWithParameters' : '/build')
      const res = await jenkinsRequest(ctx, s, path, { method: 'POST', form: hasParams ? params : null, headers })
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
      const s = findServer(req.serverId)
      if (!s) return { ok: false, code: 'server-missing', error: 'Server not found' }
      const id = Number(req.queueId)
      if (!id) return { ok: false, code: 'queue-id-missing', error: 'Missing queue ID' }
      const data = await jenkinsJson(ctx, s, '/queue/item/' + id + '/api/json')
      const ex = data.executable
      if (ex && ex.number) return { ok: true, state: 'started', buildNumber: ex.number, buildUrl: ex.url || '', why: data.why || '' }
      if (data.cancelled) return { ok: true, state: 'cancelled', why: data.why || '' }
      return { ok: true, state: 'queued', why: data.why || '', blocked: !!data.blocked }
    }

    if (op === 'buildStatus') {
      const s = findServer(req.serverId)
      if (!s) return { ok: false, code: 'server-missing', error: 'Server not found' }
      const segs = Array.isArray(req.segments) && req.segments.length ? req.segments : jobSegments(req.jobUrl)
      if (segs.length === 0) return { ok: false, code: 'job-path-invalid', error: 'Unable to parse job path' }
      const num = Number(req.buildNumber)
      const path = jobPath(segs) + (num ? '/' + num : '/lastBuild') + '/api/json'
      try {
        const data = await jenkinsJson(ctx, s, path)
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
        if (e && e.status === 404) return { ok: false, code: 'build-not-found', error: 'No build record found yet', notFound: true }
        throw e
      }
    }

    return { ok: false, code: 'unknown-op', error: 'Unknown operation: ' + String(op) }
  }

  // ─── 命令入口（设置页经 ctx.remote.commands.execute 调用）───────

  if (commands !== undefined) {
    commands.register({
      name: 'dsh-jenkins',
      description: 'Jenkins CLI：管理服务器配置并触发/查询构建（设置界面/工作区入口调用）。Manage Jenkins servers and trigger/query builds (used by the settings UI and workspace entry). 参数为 JSON：'
        + '{ "op": "list|save|delete|test|jobs|jobDetail|trigger|queueStatus|buildStatus|workspaceConfig|workspaceTrigger", ... }。',
      input: { hint: '{"op":"list"}' },
      recordInput: true,
      handler: async (invocation) => {
        const raw = (invocation.rawInput ?? '').trim()
        let req = {}
        if (raw.length > 0) {
          try { req = JSON.parse(raw) } catch {
            return { kind: 'error', text: JSON.stringify({ ok: false, code: 'params-invalid', error: 'Parameters must be JSON' }) }
          }
        }
        try {
          const payload = await runOp(req)
          return { kind: 'success', text: JSON.stringify(payload) }
        } catch (e) {
          return { kind: 'error', text: JSON.stringify({ ok: false, code: errCodeOf(e), error: (e && e.message) || String(e) }) }
        }
      },
    })
  }

  // ─── 模型工具（docs/develop/basic/tool）────────────────────────

  ctx.tools.register(defineTool({
    name: 'dsh_jenkins_build',
    description: '根据配置的 Jenkins 服务器触发一个 Job 构建（可选参数），返回队列号/构建号与状态。Trigger a Jenkins job build with optional parameters (config-driven servers); returns queue/build info.',
    parameters: {
      server: { type: 'string', required: true, description: '服务器名称（对应配置中的 name）/ Server name (as configured)' },
      job: { type: 'string', required: true, description: '任务路径，如 build-app 或 folder/build-app / Job path, e.g. build-app or folder/build-app' },
      parameters: { type: 'json', description: '可选参数键值对，如 {"BRANCH": "main"} / Optional key-value parameters' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args) {
      const server = findServer(args.server)
      if (!server) {
        const names = readServers().map((s) => s.name).join('、')
        return '找不到服务器「' + args.server + '」。已配置：' + (names || '（无）')
          + ' / Server "' + args.server + '" not found. Configured: ' + (names || '(none)')
      }
      const result = await runOp({ op: 'trigger', serverId: server.id, segments: args.job.split('/').filter(Boolean), parameters: args.parameters || {} })
      if (!result.ok) return '触发失败：' + result.error + ' / Trigger failed: ' + result.error
      return result.queueId
        ? `已触发构建：${args.job}（服务器 ${server.name}），队列 #${result.queueId}。可用 dsh_jenkins_status 查询状态。`
          + ` / Build triggered: ${args.job} (server ${server.name}), queue #${result.queueId}. Use dsh_jenkins_status to check status.`
        : `已触发构建：${args.job}（服务器 ${server.name}），未获得队列编号。可用 dsh_jenkins_status 查询状态。`
          + ` / Build triggered: ${args.job} (server ${server.name}), no queue number returned. Use dsh_jenkins_status to check status.`
    },
  }))

  ctx.tools.register(defineTool({
    name: 'dsh_jenkins_status',
    description: '查询 Jenkins Job 最近一次或指定编号构建的状态与结果。Query the latest (or a specific) build status/result of a Jenkins job.',
    parameters: {
      server: { type: 'string', required: true, description: '服务器名称（对应配置中的 name）/ Server name (as configured)' },
      job: { type: 'string', required: true, description: '任务路径，如 build-app 或 folder/build-app / Job path, e.g. build-app or folder/build-app' },
      buildNumber: { type: 'number', description: '可选：构建编号，缺省查询最近一次构建 / Optional build number; defaults to the latest build' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args) {
      const server = findServer(args.server)
      if (!server) {
        const names = readServers().map((s) => s.name).join('、')
        return '找不到服务器「' + args.server + '」。已配置：' + (names || '（无）')
          + ' / Server "' + args.server + '" not found. Configured: ' + (names || '(none)')
      }
      const result = await runOp({
        op: 'buildStatus',
        serverId: server.id,
        segments: args.job.split('/').filter(Boolean),
        buildNumber: args.buildNumber,
      })
      if (!result.ok) {
        if (result.notFound) return `任务 ${args.job} 尚未有构建记录 / Job ${args.job} has no build record yet`
        return '查询失败：' + result.error + ' / Query failed: ' + result.error
      }
      const dur = Math.round((result.duration || 0) / 1000)
      return `任务 ${args.job} #${result.number}：${result.building ? '构建中' : `已完成，结果 ${result.result ?? 'UNKNOWN'}`}`
        + `（耗时 ${dur} 秒）\n${result.url || ''}`
        + ` / Job ${args.job} #${result.number}: ${result.building ? 'building' : `done, result ${result.result ?? 'UNKNOWN'}`}`
        + ` (elapsed ${dur}s)\n${result.url || ''}`
    },
  }))
}
