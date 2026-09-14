/**
 * dsh-jenkins —— Jenkins REST 调用核心（curl.exe，经宿主 shell/subprocess 服务执行）。
 *
 * 与原实现行为一致：
 * - 用 ctx.get('subprocess') 直接 spawn curl.exe（绕开 pwsh-sandbox 受限令牌导致的
 *   Schannel SEC_E_NO_CREDENTIALS）；
 * - `-D -` 输出响应头用于解析状态码与 Location；
 * - 表单体经 stdin（--data-binary @-，UTF-8 无 BOM）。
 *
 * `-D -` 的输出可能是「多个响应头块」：走了 HTTP 代理的 HTTPS 请求会先打印
 * 代理的 `HTTP/1.1 200 Connection Established` 隧道块（1xx / 100-continue 同理），
 * 之后才是真实响应块。因此按块解析（parseCurlDump）而不是在第一个空行处切分，
 * 否则真实状态码会被隧道块的 200 掩盖、真实响应头会被当成正文导致 JSON 解析失败。
 */

import { logFailure } from './log.ts'
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

/** 响应块首行：`HTTP/1.1 200 Connection Established` / `HTTP/1.1 200 OK`。 */
const STATUS_LINE = /^HTTP\/\d(?:\.\d)?[ \t]+(\d{3})/
/** 合法响应头行：`Name: value`（用于区分头块与正文）。 */
const HEADER_LINE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+:[ \t]?/

/** 一个 `-D -` 输出块（响应头块）的解析结果。 */
interface DumpBlock {
  text: string
  status: number
  /** 块之后正文的起始下标。 */
  next: number
}

/**
 * 尝试把 `start` 处解析为一个响应头块（首行状态行 + 若干合法头行 + 空行结束）。
 * 不是头块（例如正文恰好以 `HTTP/` 开头，或头块被宿主收集上限截断）时返回 null。
 */
function blockAt(dump: string, start: number): DumpBlock | null {
  const lineEnd = dump.indexOf('\n', start)
  const firstLine = (lineEnd === -1 ? dump.slice(start) : dump.slice(start, lineEnd)).replace(/\r$/, '')
  const m = STATUS_LINE.exec(firstLine)
  if (m === null) return null
  // 头块结束：\r\n\r\n 或 \n\n（同一次查找里取更靠前者）
  const crlf = dump.indexOf('\r\n\r\n', start)
  const lf = dump.indexOf('\n\n', start)
  let end = -1
  let sep = 0
  if (crlf !== -1 && (lf === -1 || crlf <= lf)) { end = crlf; sep = 4 }
  else if (lf !== -1) { end = lf; sep = 2 }
  if (end === -1) return null
  const text = dump.slice(start, end)
  const lines = text.split(/\r?\n/)
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].length === 0) continue
    if (!HEADER_LINE.test(lines[i])) return null
  }
  return { text, status: Number(m[1]), next: end + sep }
}

/** `-D -` 输出的解析结果。 */
export interface CurlDump {
  /** 全部响应块状态码（含代理 CONNECT 隧道块 / 1xx），按出现顺序。 */
  statuses: number[]
  /** 最后一个（真实）响应块的头文本；无头块时为空串。 */
  headers: string
  /** 响应体。 */
  body: string
}

/**
 * 解析 `curl -D -` 的输出：顺序跳过所有响应头块（代理 CONNECT / 1xx / 重定向链），
 * 取最后一个块作为有效响应头，其余为正文。兼容 \r\n 与 \n 行尾。
 */
export function parseCurlDump(stdout: string): CurlDump {
  const statuses: number[] = []
  let headers = ''
  let pos = 0
  for (;;) {
    const block = blockAt(stdout, pos)
    if (block === null) break
    statuses.push(block.status)
    headers = block.text
    pos = block.next
  }
  // 兜底：只有头、没有结束空行的残缺 dump（curl 自身不会如此，防御性保留旧行为）。
  if (statuses.length === 0) {
    const m = STATUS_LINE.exec(stdout.replace(/^\uFEFF/, ''))
    if (m !== null) return { statuses: [Number(m[1])], headers: stdout, body: '' }
  }
  return { statuses, headers, body: stdout.slice(pos) }
}

/** 拆分 `-D -` 输出的响应头与响应体（兼容 \r\n 与 \n 两种行尾）。 */
function splitHeaders(stdout: string): { headers: string; body: string } {
  const dump = parseCurlDump(stdout)
  return { headers: dump.headers, body: dump.body }
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

/** 响应体片段（单行、截断）——仅用于失败日志。 */
const bodySnippet = (body: string): string =>
  (body || '').replace(/[\r\n\t]+/g, ' ').slice(0, 600)

/** 带 HTTP 状态码的错误（供 jenkinsJson 抛出）。 */
type CodedError = Error & { status?: number; code?: string }
const codedError = (code: string, message: string, status?: number): CodedError => {
  const err = new Error(message) as CodedError
  err.code = code
  if (status !== undefined) err.status = status
  return err
}

/**
 * 把异常映射为客户端本地化的错误码（中/英文案由客户端 i18n 的 errors 表提供）。
 * 优先用 jenkinsJson 打上的 err.code，其次按 HTTP 状态码，最后按消息关键词兜底。
 */
export function errorCodeOf(e: unknown): string | undefined {
  const err = e as { status?: number; code?: string; message?: string } | null
  if (err && typeof err.code === 'string' && err.code.length > 0) {
    if (err.code === 'http-401') return 'auth-failed'
    if (err.code === 'http-403') return 'forbidden'
    if (err.code === 'http-404') return 'not-found'
    if (err.code.startsWith('http-')) return 'connect-failed'
    return err.code
  }
  if (err && err.status === 401) return 'auth-failed'
  if (err && err.status === 403) return 'forbidden'
  if (err && err.status === 404) return 'not-found'
  const msg = (err && err.message) || String(e)
  if (msg.indexOf('网络请求失败') !== -1) return 'network-failed'
  if (msg.indexOf('无法解析任务路径') !== -1) return 'job-path-invalid'
  if (msg.indexOf('缺少队列 ID') !== -1) return 'queue-id-missing'
  if (msg.indexOf('缺少工作区路径') !== -1) return 'cwd-missing'
  if (msg.indexOf('响应解析失败') !== -1) return 'parse-failed'
  if (msg.indexOf('响应过大') !== -1) return 'response-too-large'
  if (msg.indexOf('未取得 HTTP 响应') !== -1) return 'empty-response'
  if (msg.indexOf('重定向') !== -1) return 'redirect'
  if (msg.indexOf('subprocess 服务不可用') !== -1 || msg.indexOf('启动 curl 失败') !== -1) return 'curl-unavailable'
  return undefined
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
  const stdoutRead = handle.collected && handle.collected.stdout ? handle.collected.stdout.readFrom(0) : null
  const stderrRead = handle.collected && handle.collected.stderr ? handle.collected.stderr.readFrom(0) : null
  return {
    exitCode: (await handle.done).exitCode,
    stdout: stdoutRead ? stdoutRead.text : '',
    stderr: stderrRead ? stderrRead.text : '',
    // 宿主收集上限（8MB）超出时保留的是「尾部」：响应头块会整体丢失，
    // 表现为 status=0 + JSON 解析失败。标记出来供上层给出准确报错并落日志。
    stdoutTruncated: stdoutRead !== null && (stdoutRead.lossy === true || stdoutRead.truncated === true),
  }
}

/** 失败日志里的服务器标识：显示名（有则带上）+ 地址，不含凭据。 */
const serverLabel = (server: JenkinsServerLike): string =>
  server.name ? `${server.name} <${normalizeBase(server.baseUrl)}>` : normalizeBase(server.baseUrl)

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
  let res: CurlResult
  try {
    res = await runCurl(ctx, server, args, runOpts)
  } catch (e) {
    // 连 curl 都没起来（subprocess 服务缺失 / 可执行文件解析失败）：同样留痕。
    logFailure({
      stage: 'curl',
      op: opts?.op,
      code: 'curl-spawn-failed',
      message: e instanceof Error ? e.message : String(e),
      server: serverLabel(server),
      user: server.username,
      request: method + ' ' + path,
    })
    throw e
  }
  const dump = parseCurlDump(res.stdout)
  const status = lastStatus(dump.headers)
  const response: HttpResponse = {
    status,
    headers: dump.headers,
    body: dump.body,
    statuses: dump.statuses,
    exitCode: res.exitCode,
    stderr: res.stderr,
    path,
    method,
    truncated: res.stdoutTruncated === true,
  }
  if (res.exitCode !== 0 && res.exitCode !== null) {
    const message = '网络请求失败：' + ((res.stderr || '').trim() || `curl 退出码 ${res.exitCode}`)
    logFailure({
      stage: 'http',
      op: opts?.op,
      code: 'network-failed',
      message,
      server: serverLabel(server),
      user: server.username,
      request: method + ' ' + path,
      httpStatus: status,
      httpStatuses: dump.statuses,
      curlExit: res.exitCode,
      curlStderr: res.stderr,
      bodySnippet: bodySnippet(dump.body),
    })
    throw new Error(message)
  }
  if (response.truncated === true) {
    logFailure({
      stage: 'http',
      op: opts?.op,
      code: 'response-too-large',
      message: `响应超过宿主收集上限（8MB），已丢弃响应头与正文开头，无法完整解析：${method} ${path}`,
      server: serverLabel(server),
      user: server.username,
      request: method + ' ' + path,
      httpStatus: status,
      httpStatuses: dump.statuses,
      curlExit: res.exitCode,
      note: `保留尾部 ${res.stdout.length} 字节`,
    })
  } else if (status === 0) {
    // curl 正常退出却没有任何响应头块：空响应 / 上游异常关闭 / 代理吞掉响应。
    logFailure({
      stage: 'http',
      op: opts?.op,
      code: 'empty-response',
      message: `未取得 HTTP 响应头（curl 退出码 ${res.exitCode}）：${method} ${path}`,
      server: serverLabel(server),
      user: server.username,
      request: method + ' ' + path,
      httpStatus: 0,
      curlExit: res.exitCode,
      curlStderr: res.stderr,
      bodySnippet: bodySnippet(dump.body),
      note: `stdout ${res.stdout.length} 字节`,
    })
  }
  return response
}

/** 发 Jenkins 请求并解析 JSON；>=400 抛带 status 的错误。 */
export async function jenkinsJson(
  ctx: HostCtxLike,
  server: JenkinsServerLike,
  path: string,
  opts?: JenkinsRequestOptions,
): Promise<unknown> {
  const r = await jenkinsRequest(ctx, server, path, opts)
  const evidence = {
    op: opts?.op,
    server: serverLabel(server),
    user: server.username,
    request: (r.method ?? 'GET') + ' ' + path,
    httpStatus: r.status,
    httpStatuses: r.statuses,
    curlExit: r.exitCode ?? null,
    curlStderr: r.stderr ?? '',
  }
  if (r.truncated === true) {
    const err = codedError('response-too-large', '响应过大：超过 8MB 收集上限（响应头已丢失），请缩小请求范围后重试', r.status)
    logFailure({ ...evidence, code: 'response-too-large', message: err.message, note: `响应体 ${(r.body || '').length} 字节（尾部）` })
    throw err
  }
  if (r.status === 0) {
    const err = codedError('empty-response', '未取得 HTTP 响应（curl 无响应头输出）：请检查服务器地址 / 代理 / 网络是否可达', 0)
    logFailure({ ...evidence, code: 'empty-response', message: err.message, bodySnippet: bodySnippet(r.body || '') })
    throw err
  }
  if (r.status >= 300 && r.status < 400) {
    const location = headerValue(r.headers, 'Location')
    const err = codedError(
      'redirect',
      '服务器返回重定向（HTTP ' + r.status + '）' + (location ? '：' + location : '') + '，请检查服务器地址是否为最终地址（如是否应使用 https://…）',
      r.status,
    )
    logFailure({ ...evidence, code: 'redirect', message: err.message, note: location ? 'Location: ' + location : undefined })
    throw err
  }
  if (r.status >= 400) {
    let msg = 'HTTP ' + r.status
    try {
      const j = JSON.parse(r.body || '{}') as { message?: string }
      if (j.message) msg += '：' + j.message
    } catch { /* ignore */ }
    if (r.status === 401) msg = '认证失败（HTTP 401）：用户名或 Token 不正确'
    if (r.status === 403) msg = '权限不足（HTTP 403）：请检查 Token 权限'
    if (r.status === 404) msg = '资源不存在（HTTP 404）'
    logFailure({ ...evidence, code: 'http-' + r.status, message: msg, bodySnippet: bodySnippet(r.body || '') })
    const err = codedError('http-' + r.status, msg, r.status)
    throw err
  }
  if (!r.body || !r.body.trim()) return null
  try { return JSON.parse(r.body) } catch (e) {
    const err = codedError('parse-failed', '响应解析失败：' + (e as Error).message, r.status)
    logFailure({
      ...evidence,
      code: 'parse-failed',
      message: err.message,
      bodySnippet: bodySnippet(r.body),
      note: `响应体 ${r.body.length} 字节`,
    })
    throw err
  }
}

/** 获取 CSRF crumb（失败静默返回 null）。 */
export async function getCrumb(ctx: HostCtxLike, server: JenkinsServerLike, op?: string): Promise<{ field: string; value: string } | null> {
  try {
    const r = await jenkinsRequest(ctx, server, '/crumbIssuer/api/json', op !== undefined ? { op } : undefined)
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
