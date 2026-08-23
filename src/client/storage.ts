/**
 * dsh-jenkins —— 浏览器半边：缓存存储（发布参数回显 + 发布历史）。
 *
 * 存储方式：不再使用浏览器 localStorage，统一走 DSH 官方 settings 存储——
 * 宿主侧持久化到 $DSH_HOME/settings.yaml（dsh-jenkins 命名空间），因此无论
 * 从哪里打开 dsh 服务（本机任意入口）都能访问同一份缓存。所有方法为异步，
 * 经宿主命令（cacheGet / cacheSet）读写；宿主不可用时退化为内存镜像（不落盘）。
 */

import type { RunFn } from './rpc.ts'

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
  serverId?: string
  segments?: string[]
  env?: string
  params?: Record<string, string | number | boolean>
  result?: string | null
  cwd?: string
  /** 轮询所需：队列号（排队阶段） */
  queueId?: number | null
  /** 轮询所需：构建号（已开始后回填） */
  buildNumber?: number | null
  /** 构建页面 URL（完成后回填，供日志弹框/链接跳转） */
  url?: string
  /** 触发时刻（用于轮询超时判定） */
  since?: number
  /** 触发时的会话 id（后台轮询经 commands.execute 复用） */
  sessionId?: string
  /** 未读标记：发布后未打开过「历史」tab 查看即为未读；打开历史 tab 时自动清除。 */
  unread?: boolean
}

interface CacheShape {
  lastParams: Record<string, CachedLaunch>
  history: Record<string, HistoryEntry[]>
}

const HISTORY_LIMIT = 50

export interface StorageApi {
  readCache(sessionId: string, cwd: string): Promise<CachedLaunch | null>
  writeCache(sessionId: string, cwd: string, entry: CachedLaunch): Promise<void>
  pushHistory(sessionId: string, cwd: string, entry: HistoryEntry): Promise<string>
  updateHistoryResult(sessionId: string, cwd: string, id: string, result: string): Promise<void>
  updateHistoryPoll(
    sessionId: string,
    cwd: string,
    id: string,
    patch: Partial<Pick<HistoryEntry, 'buildNumber' | 'queueId' | 'url'>>,
  ): Promise<void>
  readAllHistory(sessionId: string): Promise<HistoryEntry[]>
  /** 清除全部发布历史的未读标记（打开「历史」tab 时调用）。 */
  markAllHistoryRead(sessionId: string): Promise<void>
  clearHistory(sessionId: string, cwd: string | null): Promise<void>
}

export function createStorage(run: RunFn): StorageApi {
  // 内存镜像：读时从宿主刷新，写时同步宿主（宿主不可用时的兜底，不落浏览器存储）。
  let mirror: CacheShape = { lastParams: {}, history: {} }

  const readAll = async (sessionId: string): Promise<CacheShape> => {
    try {
      const res = await run(sessionId, { op: 'cacheGet' })
      if (res && res.ok && res.cache && typeof res.cache === 'object') {
        const c = res.cache as Partial<CacheShape>
        mirror = {
          lastParams: c.lastParams && typeof c.lastParams === 'object'
            ? c.lastParams as Record<string, CachedLaunch>
            : {},
          history: c.history && typeof c.history === 'object'
            ? c.history as Record<string, HistoryEntry[]>
            : {},
        }
      }
    } catch { /* 宿主不可用：保留内存镜像 */ }
    return mirror
  }

  const persist = async (sessionId: string, key: 'lastParams' | 'history'): Promise<void> => {
    try {
      await run(sessionId, { op: 'cacheSet', key, value: mirror[key] })
    } catch { /* 忽略持久化失败（内存镜像仍可用） */ }
  }

  // 一次性迁移：旧版本浏览器 localStorage 数据 → 宿主存储（宿主为空时导入，随后清理 localStorage）。
  let migrated = false
  const migrateLegacy = async (sessionId: string): Promise<void> => {
    if (migrated || typeof window === 'undefined') return
    migrated = true
    try {
      const rawLast = window.localStorage.getItem('dsh-jenkins.lastParams.v1')
      const rawHistory = window.localStorage.getItem('dsh-jenkins.history.v1')
      if (!rawLast && !rawHistory) return
      const lastParams = rawLast ? JSON.parse(rawLast) : {}
      const history = rawHistory ? JSON.parse(rawHistory) : {}
      if (typeof lastParams !== 'object' || lastParams === null) return
      if (typeof history !== 'object' || history === null) return
      const all = await readAll(sessionId)
      const empty = Object.keys(all.lastParams).length === 0 && Object.keys(all.history).length === 0
      if (empty) {
        mirror = { lastParams, history }
        await persist(sessionId, 'lastParams')
        await persist(sessionId, 'history')
      }
      window.localStorage.removeItem('dsh-jenkins.lastParams.v1')
      window.localStorage.removeItem('dsh-jenkins.history.v1')
    } catch { /* 迁移失败不阻塞 */ }
  }

  const historyOf = (all: CacheShape, cwd: string): HistoryEntry[] => {
    const list = all.history[cwd]
    return Array.isArray(list) ? list : []
  }

  return {
    readCache: async (sessionId, cwd) => {
      await migrateLegacy(sessionId)
      const all = await readAll(sessionId)
      return all.lastParams[cwd] || null
    },
    writeCache: async (sessionId, cwd, entry) => {
      await migrateLegacy(sessionId)
      await readAll(sessionId)
      mirror.lastParams[cwd] = entry
      await persist(sessionId, 'lastParams')
    },
    pushHistory: async (sessionId, cwd, entry) => {
      await migrateLegacy(sessionId)
      const all = await readAll(sessionId)
      const list = historyOf(all, cwd)
      // 新发布的记录默认未读：打开「历史」tab 前保持未读标记（供未读徽标 / footer 已完成胶囊计数）。
      list.unshift(Object.assign({}, entry, { unread: true }))
      if (list.length > HISTORY_LIMIT) list.length = HISTORY_LIMIT
      mirror.history[cwd] = list
      await persist(sessionId, 'history')
      return entry.id
    },
    updateHistoryResult: async (sessionId, cwd, id, result) => {
      const all = await readAll(sessionId)
      const hit = historyOf(all, cwd).find((e) => e.id === id)
      if (!hit) return
      hit.result = result
      mirror.history[cwd] = historyOf(all, cwd)
      await persist(sessionId, 'history')
    },
    updateHistoryPoll: async (sessionId, cwd, id, patch) => {
      const all = await readAll(sessionId)
      const hit = historyOf(all, cwd).find((e) => e.id === id)
      if (!hit) return
      if (patch.buildNumber !== undefined) hit.buildNumber = patch.buildNumber
      if (patch.queueId !== undefined) hit.queueId = patch.queueId
      if (patch.url !== undefined) hit.url = patch.url
      mirror.history[cwd] = historyOf(all, cwd)
      await persist(sessionId, 'history')
    },
    readAllHistory: async (sessionId) => {
      await migrateLegacy(sessionId)
      const all = await readAll(sessionId)
      const out: HistoryEntry[] = []
      for (const cwd of Object.keys(all.history)) {
        for (const e of historyOf(all, cwd)) out.push(Object.assign({}, e, { cwd }))
      }
      return out
    },
    markAllHistoryRead: async (sessionId) => {
      const all = await readAll(sessionId)
      let dirty = false
      for (const cwd of Object.keys(all.history)) {
        const list = historyOf(all, cwd)
        for (const e of list) {
          if (e.unread) { e.unread = false; dirty = true }
        }
        if (dirty) mirror.history[cwd] = list
      }
      if (dirty) await persist(sessionId, 'history')
    },
    clearHistory: async (sessionId, cwd) => {
      const all = await readAll(sessionId)
      if (cwd === null) mirror.history = {}
      else delete mirror.history[cwd]
      await persist(sessionId, 'history')
    },
  }
}

/** 服务器匹配：配置里的 server（名称 / id / 地址）与已配置服务器比对（地址去尾部斜杠）。 */
export const normServerUrl = (u: string): string => String(u || '').trim().replace(/\/+$/, '')

export function matchServer(s: { name: string; id: string; baseUrl: string }, ref: string): boolean {
  const r = String(ref || '').trim()
  return s.name === r || s.id === r || normServerUrl(s.baseUrl) === normServerUrl(r)
}
