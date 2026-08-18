/**
 * dsh-jenkins —— 浏览器半边：与宿主通信（commands.execute → JSON 文本 → 结果载荷）。
 */

import { t } from './i18n.ts'

export interface RunResult {
  ok: boolean
  error?: string
  code?: string
  [key: string]: unknown
}

export type RunFn = (sessionId: string, op: Record<string, unknown>) => Promise<RunResult>

export function makeRun(ctx: { remote: { commands: { execute(sessionId: string, command: string): Promise<unknown> } } }): RunFn {
  return async function run(sessionId: string, op: Record<string, unknown>): Promise<RunResult> {
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
