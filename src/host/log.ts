/**
 * dsh-jenkins —— 失败请求日志（$DSH_HOME/dsh-jenkins.log）。
 *
 * 目标：任何一次「加载失败」的请求（Job 列表 / 任务详情 / 构建历史 / 触发 / 日志 …）
 * 都能事后从日志里还原出：什么时间、哪个 op、哪台服务器、请求什么路径、
 * HTTP 状态码、curl 退出码与 stderr、宿主返回给浏览器的错误码与消息、以及
 * 响应体片段（便于识别重定向页 / 登录页 / 空响应 / 被截断的大响应）。
 *
 * 约定：
 * - 与数据文件同目录（默认 $DSH_HOME），文件 dsh-jenkins.log，格式 JSONL（一行一条）；
 * - 单文件超过 LOG_MAX_BYTES 时轮转为 dsh-jenkins.log.1（只保留一份历史）；
 * - 绝不记录 Token / 凭据（argv 不落日志，正文做兜底脱敏）；
 * - 写日志失败绝不影响主流程（best-effort，内部吞掉异常）。
 */

import { appendFile, mkdir, rename, rm, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { resolveStoreDir } from './store.ts'

export const LOG_FILE = 'dsh-jenkins.log'
/** 单个日志文件上限（超出后轮转为 .1）。 */
export const LOG_MAX_BYTES = 2 * 1024 * 1024

const MESSAGE_MAX = 600
const BODY_MAX = 800
const STDERR_MAX = 400

/** 一条失败记录（全部字段可选，按可获得的证据填写）。 */
export interface FailureRecord {
  /** 逻辑操作名（op 分发分支）：jobs / jobDetail / jobHistory / trigger / buildStatus / … */
  op?: string
  /** 宿主错误码（客户端据此显示本地化文案）：network-failed / parse-failed / auth-failed … */
  code?: string
  /** 面向用户的错误消息（runOp 返回值或异常 message）。 */
  message?: string
  /** 失败发生的位置：route / command / tool / http / route-guard。 */
  stage?: string
  /** Jenkins 服务器地址（不含凭据）。 */
  server?: string
  /** Jenkins 用户名（协助定位 401/403；非机密）。 */
  user?: string
  /** 请求行，如 `GET /api/json?tree=jobs[...]`。 */
  request?: string
  /** 最终 HTTP 状态码（0 = 未取到 HTTP 响应）。 */
  httpStatus?: number
  /** 全部响应块状态码（含代理 CONNECT 隧道块 / 1xx），按出现顺序。 */
  httpStatuses?: number[]
  /** curl 退出码（null = 被信号终止）。 */
  curlExit?: number | null
  /** curl stderr 片段（网络/TLS/超时诊断）。 */
  curlStderr?: string
  /** 响应体片段（已脱敏、压成单行、截断）。 */
  bodySnippet?: string
  /** 补充说明：响应体字节数 / 是否被宿主收集上限截断 / 重定向目标等。 */
  note?: string
  /** 浏览器会话 id（同一会话内的多次失败可归并）。 */
  sessionId?: string
}

const clip = (value: unknown, max: number): string => {
  const text = typeof value === 'string' ? value : String(value ?? '')
  const flat = text.replace(/[\r\n\t]+/g, ' ')
  return flat.length > max ? flat.slice(0, max) + '…' : flat
}

/**
 * 兜底脱敏：即使调用方误传了带凭据的文本，也不把 Token 落盘。
 * 覆盖 `Basic <base64>`、`user:token` 形态的 URL 凭据、常见 token 字段，
 * 以及 Jenkins HTML 页里内嵌的 CSRF crumb（会话级凭据，同样不应落盘）。
 */
export function redactSecrets(text: string): string {
  return text
    .replace(/Basic\s+[A-Za-z0-9+/=._-]{6,}/gi, 'Basic ***')
    .replace(/(https?:\/\/)[^/\s:@]+:[^/\s@]+@/gi, '$1***:***@')
    .replace(/("?(?:token|password|passwd|apikey|api_key|api_token|secret)"?\s*[:=]\s*"?)([^"\s,}]{4,})/gi, '$1***')
    .replace(/(crumb-value\s*=\s*")([^"]{4,})(")/gi, '$1***$3')
    .replace(/("?(?:crumb|crumbRequestField|Jenkins-Crumb)"?\s*[:=]\s*"?)([^"\s,}]{4,})/gi, '$1***')
}

/** 日志文件的绝对路径（与 dsh-jenkins.json 同目录）。 */
export function logFilePath(): string {
  return join(resolveStoreDir(), LOG_FILE)
}

/** 序列化一条记录：时间 + level + 证据字段（省略空值）。 */
function render(rec: FailureRecord): string {
  const entry: Record<string, unknown> = { time: new Date().toISOString(), level: 'error' }
  const text = (name: keyof FailureRecord, value: unknown, max: number): void => {
    if (value === undefined || value === null || value === '') return
    entry[name] = typeof value === 'string' ? redactSecrets(clip(value, max)) : value
  }
  text('stage', rec.stage, 40)
  text('op', rec.op, 60)
  text('code', rec.code, 60)
  text('message', rec.message, MESSAGE_MAX)
  text('server', rec.server, 300)
  text('user', rec.user, 120)
  text('request', rec.request, 500)
  if (typeof rec.httpStatus === 'number') entry.httpStatus = rec.httpStatus
  if (Array.isArray(rec.httpStatuses) && rec.httpStatuses.length > 0) entry.httpStatuses = rec.httpStatuses
  if (rec.curlExit !== undefined && rec.curlExit !== null) entry.curlExit = rec.curlExit
  text('curlStderr', rec.curlStderr, STDERR_MAX)
  text('bodySnippet', rec.bodySnippet, BODY_MAX)
  text('note', rec.note, 300)
  text('sessionId', rec.sessionId, 80)
  return JSON.stringify(entry)
}

/* ── 串行写入队列（进程内），避免并发 append 交错 ───────────────── */

let chain: Promise<void> = Promise.resolve()
let initialized = false
let size = 0

function enqueue(task: () => Promise<void>): void {
  // 日志失败不影响主流程：队列吞掉异常后继续。
  chain = chain.then(task).catch(() => { /* ignore */ })
}

/**
 * 记录一条失败请求。
 * 立即返回（写入在后台串行队列中完成）；任何 IO 异常都不向调用方抛出。
 */
export function logFailure(rec: FailureRecord): void {
  const line = render(rec) + '\n'
  const dir = resolveStoreDir()
  const target = join(dir, LOG_FILE)
  const backup = target + '.1'
  enqueue(async () => {
    if (!initialized) {
      await mkdir(dir, { recursive: true })
      try { size = (await stat(target)).size } catch { size = 0 }
      initialized = true
    }
    if (size > LOG_MAX_BYTES) {
      try {
        // Windows 下 rename 到已存在的文件会失败：先删旧备份再改名。
        await rm(backup, { force: true })
        await rename(target, backup)
        size = 0
      } catch { /* 轮转失败：继续追加（宁可文件偏大，也不丢记录） */ }
    }
    await appendFile(target, line, 'utf8')
    size += Buffer.byteLength(line, 'utf8')
  })
  // 宿主控制台同步留一条紧凑记录，便于实时观察（完整证据在日志文件里）。
  const head = [rec.stage, rec.op, rec.code].filter((x) => x !== undefined && x !== '').join('/')
  console.error(`[dsh-jenkins] 失败已记录 (${head || 'request'}): ${clip(rec.message ?? '', 200)} → ${target}`)
}

/** 等待日志队列落盘（测试/关闭钩子用）。 */
export function flushFailureLog(): Promise<void> {
  return chain
}

/** 测试用：重置「已初始化 + 当前文件大小」缓存（轮转用例需要）。 */
export function resetFailureLogState(): void {
  initialized = false
  size = 0
}
