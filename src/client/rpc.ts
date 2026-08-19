/**
 * dsh-jenkins —— 浏览器半边：与宿主通信。
 *
 * 默认走宿主 webServer 注册的带信任围栏的 HTTP 路由 /dsh-jenkins/api
 * （fetch POST JSON → { ok, value } 信封），请求不进入对话命令通道，因此不会在
 * 页面产生 command 节点（空状态行 / {"ok":true,...} 调试卡片），后台轮询也不会
 * 每 3 秒给会话追加一条记录。
 *
 * 老宿主（未注册该路由，如 headless 组合）自动回退到 commands.execute 命令通道，
 * 仅作兼容，不影响新宿主上的行为。
 */

import { t } from './i18n.ts'

export interface RunResult {
  ok: boolean
  error?: string
  code?: string
  [key: string]: unknown
}

export type RunFn = (sessionId: string, op: Record<string, unknown>) => Promise<RunResult>

/** /dsh-jenkins/api 响应信封（与宿主 index.ts 的 ApiEnvelope 对应）。 */
interface ApiEnvelope {
  ok?: boolean
  value?: unknown
  error?: { code?: string; message?: string }
}

/**
 * 尝试经 HTTP 路由执行一次 op。
 * @returns 路由可用并返回有效载荷时返回 RunResult；否则返回 null（调用方回退命令通道）。
 */
async function runHttp(sessionId: string, op: Record<string, unknown>): Promise<RunResult | null> {
  try {
    const response = await fetch('/dsh-jenkins/api', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(Object.assign({ sessionId: sessionId || '' }, op)),
    })
    if (!response.ok) return null
    const parsed: ApiEnvelope | null = await response.json().catch(() => null)
    if (parsed === null || parsed.ok !== true || parsed.value === undefined) return null
    const value = parsed.value
    return value !== null && typeof value === 'object'
      ? value as RunResult
      : { ok: false, error: String(value) }
  } catch {
    return null
  }
}

export function makeRun(ctx: { remote: { commands: { execute(sessionId: string, command: string): Promise<unknown> } } }): RunFn {
  return async function run(sessionId: string, op: Record<string, unknown>): Promise<RunResult> {
    // 优先 HTTP 路由（不产生对话 command 节点）。
    const viaHttp = await runHttp(sessionId, op)
    if (viaHttp !== null) return viaHttp
    // 兼容回退：老宿主经命令通道（命令生命周期会记录进会话，仅老宿主出现）。
    try {
      const execution = await ctx.remote.commands.execute(sessionId || '', '/dsh-jenkins ' + JSON.stringify(op))
      const value = execution && (execution as { ok?: boolean; value?: unknown }).ok === true
        ? (execution as { value?: unknown }).value
        : undefined
      const text = value && (value as { result?: { text?: string } }).result
        && typeof (value as { result: { text?: string } }).result.text === 'string'
        ? (value as { result: { text: string } }).result.text
        : null
      if (text === null || text.length === 0) return { ok: false, error: t('cmdNoResult') }
      try { return JSON.parse(text) } catch { return { ok: false, error: text.slice(0, 200) } }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  }
}
