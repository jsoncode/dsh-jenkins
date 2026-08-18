/**
 * dsh-jenkins —— Jenkins REST 调用核心（curl.exe，经宿主 shell/subprocess 服务执行）。
 *
 * 与原实现行为一致：
 * - 用 ctx.get('subprocess') 直接 spawn curl.exe（绕开 pwsh-sandbox 受限令牌导致的
 *   Schannel SEC_E_NO_CREDENTIALS）；
 * - `-D -` 输出响应头用于解析状态码与 Location；
 * - 表单体经 stdin（--data-binary @-，UTF-8 无 BOM）。
 */

import type {
  CurlResult,
  HttpResponse,
  JenkinsParamDef,
  JenkinsRequestOptions,
  JenkinsServerLike,
  ShellService,
  SubprocessService,
} from './types.ts'

const psQuote = (v: string | number | boolean): string => `'${String(v).replace(/'/g, "''")}'`

const normalizeBase = (u: string): string => String(u || '').trim().replace(/\/+$/, '')

/** 从 job URL 中提取路径段（decode 后）。 */
export function jobSegments(jobUrl: string): string[] {
  const m = String(jobUrl || '').match(/\/job\/(.+?)\/?$/)
  if (!m) return []
  return m[1].split('/job/').map((seg) => {
    try { return decodeURIComponent(seg) } catch { return seg }
  })
}

export const jobPath = (segments: string[]): string =>
  segments.map((seg) => '/job/' + encodeURIComponent(seg)).join('')

/** 拆分 `-D -` 输出的响应头与响应体（兼容 \r\n 与 \n 两种行尾）。 */
function splitHeaders(stdout: string): { headers: string; body: string } {
  const i1 = stdout.indexOf('\r\n\r\n')
  if (i1 !== -1) return { headers: stdout.slice(0, i1), body: stdout.slice(i1 + 4) }
  const i2 = stdout.indexOf('\n\n')
  if (i2 !== -1) return { headers: stdout.slice(0, i2), body: stdout.slice(i2 + 2) }
  return { headers: stdout, body: '' }
}

/** 取响应头里最后一个 HTTP 状态码（重定向链末尾）。 */
function lastStatus(headers: string): number {
  const matches = [...headers.matchAll(/HTTP\/\d(?:\.\d)?\s+(\d+)/g)]
  if (matches.length === 0) return 0
  return Number(matches[matches.length - 1][1])
}

function headerValue(headers: string, name: string): string | undefined {
  const m = headers.match(new RegExp(`^${name}\\s*:\\s*(.+)$`, 'im'))
  return m ? m[1].trim() : undefined
}

export interface HostCtxLike {
  get(name: string): unknown
}

/** 执行 curl（经 subprocess 直接 spawn，避免 shell 引号/令牌问题）。 */
async function runCurl(ctx: HostCtxLike, server: JenkinsServerLike, args: string[], opts?: JenkinsRequestOptions): Promise<CurlResult> {
  const sub = ctx.get('subprocess') as SubprocessService | undefined
  if (sub === undefined) throw new Error('subprocess 服务不可用，无法调用 Jenkins API')
  let curlPath: string
  try {
    curlPath = await sub.resolveExecutable('curl.exe')
  } catch {
    curlPath = await sub.resolveExecutable('curl')
  }
  let cwd = '.'
  const policy = ctx.get('sandboxPolicy') as { workspaceRoot?: string } | undefined
  if (policy !== undefined && typeof policy.workspaceRoot === 'string' && policy.workspaceRoot.length > 0) cwd = policy.workspaceRoot
  const argv = [curlPath, '-sS', '-m', '40', '-u', (server.username || 'admin') + ':' + server.token]
  if (server.insecure) argv.push('-k')
  for (const a of args) argv.push(a)
  let handle: Awaited<ReturnType<SubprocessService['spawn']>>
  try {
    handle = await sub.spawn({
      argv,
      cwd,
      stdio: {
        stdin: opts !== undefined && opts.stdin !== undefined ? { data: opts.stdin } : 'ignore',
        stdout: { mode: 'collect', maxBytes: 8 * 1024 * 1024 },
        stderr: { mode: 'collect', maxBytes: 64 * 1024 },
      },
      graceMs: 5000,
    })
  } catch (e) {
    throw new Error('启动 curl 失败：' + ((e && (e as Error).message) || String(e)))
  }
  try {
    await handle.done
  } catch (e) {
    throw new Error('启动 curl 失败：' + ((e && (e as Error).message) || String(e)))
  }
  const stdout = handle.collected && handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : ''
  const stderr = handle.collected && handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : ''
  return { exitCode: (await handle.done).exitCode, stdout, stderr }
}

/** 发一次 Jenkins HTTP 请求，返回状态码 / 响应头 / 响应体。 */
export async function jenkinsRequest(
  ctx: HostCtxLike,
  server: JenkinsServerLike,
  path: string,
  opts?: JenkinsRequestOptions,
): Promise<HttpResponse> {
  const method = opts?.method ?? 'GET'
  const form = opts?.form !== undefined ? opts.form : null
  const headers = opts?.headers ?? {}
  const args = ['-D', '-']
  if (method === 'POST') args.push('-X', 'POST')
  for (const k of Object.keys(headers)) args.push('-H', `${k}: ${headers[k]}`)
  if (form !== null) args.push('--data-binary', '@-')
  args.push(normalizeBase(server.baseUrl) + path)

  const runOpts: JenkinsRequestOptions = {}
  if (form !== null) {
    const pairs: string[] = []
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

/** 发 Jenkins 请求并解析 JSON；>=400 抛带 status 的错误。 */
export async function jenkinsJson(
  ctx: HostCtxLike,
  server: JenkinsServerLike,
  path: string,
  opts?: JenkinsRequestOptions,
): Promise<unknown> {
  const r = await jenkinsRequest(ctx, server, path, opts)
  if (r.status >= 400) {
    let msg = 'HTTP ' + r.status
    try {
      const j = JSON.parse(r.body || '{}') as { message?: string }
      if (j.message) msg += '：' + j.message
    } catch { /* ignore */ }
    if (r.status === 401) msg = '认证失败（HTTP 401）：用户名或 Token 不正确'
    if (r.status === 403) msg = '权限不足（HTTP 403）：请检查 Token 权限'
    if (r.status === 404) msg = '资源不存在（HTTP 404）'
    const err = new Error(msg) as Error & { status?: number }
    err.status = r.status
    throw err
  }
  if (!r.body || !r.body.trim()) return null
  try { return JSON.parse(r.body) } catch (e) { throw new Error('响应解析失败：' + (e as Error).message) }
}

/** 获取 CSRF crumb（失败静默返回 null）。 */
export async function getCrumb(ctx: HostCtxLike, server: JenkinsServerLike): Promise<{ field: string; value: string } | null> {
  try {
    const r = await jenkinsRequest(ctx, server, '/crumbIssuer/api/json')
    if (r.status >= 400) return null
    const j = JSON.parse(r.body || '{}') as { crumb?: string; crumbRequestField?: string }
    if (j && j.crumb) return { field: j.crumbRequestField || 'Jenkins-Crumb', value: j.crumb }
  } catch { /* ignore */ }
  return null
}

/** 归一化 Jenkins 参数定义（服务端 _class → 本地 type）。 */
export function normalizeParamDef(d: Record<string, unknown>): JenkinsParamDef {
  const cls = String(d._class || '')
  const name = String(d.name || '')
  const desc = String(d.description || '')
  let type = 'string'
  let defaultValue: string | number | boolean = d.defaultValue as string | number | boolean
  let choices: string[] | null = null
  if (cls.indexOf('BooleanParameterDefinition') !== -1) type = 'boolean'
  else if (cls.indexOf('ChoiceParameterDefinition') !== -1) { type = 'choice'; choices = Array.isArray(d.choices) ? (d.choices as string[]) : [] }
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

/** 从 job detail 的 property 列表提取参数定义。 */
export function extractParams(prop: unknown[] | undefined): JenkinsParamDef[] {
  const list = prop || []
  let holder: Record<string, unknown> | null = null
  for (let i = 0; i < list.length; i++) {
    const x = list[i] as Record<string, unknown> | null
    if (x && String(x._class || '').indexOf('ParametersDefinitionProperty') !== -1) { holder = x; break }
  }
  if (!holder) return []
  const defs = (holder.parameterDefinitions as Record<string, unknown>[]) || []
  const out: JenkinsParamDef[] = []
  for (let i = 0; i < defs.length; i++) out.push(normalizeParamDef(defs[i]))
  return out
}

export { psQuote, normalizeBase, splitHeaders, lastStatus, headerValue }
export type { ShellService }
