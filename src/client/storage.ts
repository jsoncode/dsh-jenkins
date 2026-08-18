/**
 * dsh-jenkins —— 浏览器半边：localStorage 存储（发布参数回显缓存 + 发布历史）。
 */

export interface CachedLaunch {
  serverId?: string
  jobPath?: string
  parameters?: Record<string, string | number | boolean>
}

export interface HistoryEntry {
  id: string
  time: number
  job: string
  server: string
  env?: string
  params?: Record<string, string | number | boolean>
  result?: string | null
  cwd?: string
}

/** 发布参数回显缓存（按工作区路径，浏览器 localStorage；不可用时静默降级）。 */
const CACHE_KEY = 'dsh-jenkins.lastParams.v1'
const readCache = (): Record<string, CachedLaunch> => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) { return {} }
}
const writeCache = (cwd: string, entry: CachedLaunch): void => {
  try {
    const all = readCache()
    all[cwd] = entry
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(all))
  } catch (e) { /* ignore */ }
}

/** 发布历史记录（按工作区路径，浏览器 localStorage；最近 50 条）。 */
const HISTORY_KEY = 'dsh-jenkins.history.v1'
const readHistory = (cwd: string): HistoryEntry[] => {
  try {
    const all = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || '{}')
    return Array.isArray(all[cwd]) ? all[cwd] : []
  } catch (e) { return [] }
}
const writeHistory = (cwd: string, list: HistoryEntry[]): void => {
  try {
    const all = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || '{}')
    all[cwd] = list
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(all))
  } catch (e) { /* ignore */ }
}
const pushHistory = (cwd: string, entry: HistoryEntry): string => {
  const list = readHistory(cwd)
  list.unshift(entry)
  if (list.length > 50) list.length = 50
  writeHistory(cwd, list)
  return entry.id
}
const updateHistoryResult = (cwd: string, id: string, result: string): void => {
  const list = readHistory(cwd)
  const hit = list.find((e) => e.id === id)
  if (!hit) return
  hit.result = result
  writeHistory(cwd, list)
}
/** 聚合所有工作区的历史，每条附带所属工作区路径。 */
const readAllHistory = (): HistoryEntry[] => {
  try {
    const all = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || '{}')
    const out: HistoryEntry[] = []
    for (const cwd of Object.keys(all)) {
      if (!Array.isArray(all[cwd])) continue
      for (const e of all[cwd]) out.push(Object.assign({}, e, { cwd }))
    }
    return out
  } catch (e) { return [] }
}
/** cwd 为 null 时清空全部工作区历史。 */
const clearHistory = (cwd: string | null): void => {
  try {
    const all = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || '{}')
    if (cwd === null) { for (const k of Object.keys(all)) delete all[k] }
    else delete all[cwd]
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(all))
  } catch (e) { /* ignore */ }
}

export const storage = {
  readCache,
  writeCache,
  readHistory,
  pushHistory,
  updateHistoryResult,
  readAllHistory,
  clearHistory,
}

/** 服务器匹配：配置里的 server（名称 / id / 地址）与已配置服务器比对（地址去尾部斜杠）。 */
export const normServerUrl = (u: string): string => String(u || '').trim().replace(/\/+$/, '')

export function matchServer(s: { name: string; id: string; baseUrl: string }, ref: string): boolean {
  const r = String(ref || '').trim()
  return s.name === r || s.id === r || normServerUrl(s.baseUrl) === normServerUrl(r)
}
