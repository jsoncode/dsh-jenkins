/**
 * dsh-jenkins —— 全局构建状态轮询器。
 *
 * 与组件生命周期解耦：只要有「进行中」的发布历史（result 为空且带轮询数据），
 * 无论执行弹框 / 历史弹框是否打开、是否被关闭，都会在后台持续轮询并回填结果，
 * 避免关闭弹框或打开历史弹框后状态永远停在「进行中」。
 * 历史读写走宿主存储（$DSH_HOME），不依赖浏览器 localStorage。
 *
 * 空闲不轮询：当没有进行中的任务时（hasInFlight 为 false），tick() 直接返回，
 * 连宿主存储的 cacheGet 扫描请求都不发 —— 页面静止时零网络开销。新任务触发
 * （发布 tab 提交后）或历史 tab 打开时会显式 refresh() 唤醒扫描，
 * 发现进行中任务后自动恢复定时轮询。
 */

import type { HistoryEntry, StorageApi } from './storage.ts'
import type { RunFn } from './rpc.ts'

export type LivePhase = 'queued' | 'running' | 'done' | 'error' | 'cancelled'

export interface LiveBuild {
  entryId: string
  cwd: string
  phase: LivePhase
  /** 当前展示文案（已本地化处理前的语义，客户端按阶段渲染） */
  status: string
  buildNumber: number | null
  result?: string
  duration?: number
  url?: string
  since: number
}

/** 任务数量汇总（footer 胶囊消费）：构建中（含排队）数量 + 已成功但未读的数量。 */
export interface TaskSummary {
  /** 进行中的任务数（result 为空且带轮询数据：排队 / 构建中）。 */
  building: number
  /** 构建成功但尚未在「历史」tab 查看过的条数（打开历史后清零）。 */
  successUnread: number
}

export interface Poller {
  /** 触发一轮扫描（异步，可重复调用，内部防重入；空闲时直接返回，不发请求）。 */
  tick(): void
  /** 立即扫描一次（发布提交后 / 历史弹框打开时调用，加速首轮反馈并唤醒空闲轮询）。 */
  refresh(): void
  subscribe(fn: () => void): () => void
  getLive(entryId: string): LiveBuild | undefined
  /** 当前任务数量汇总（由最近一次扫描计算；footer 胶囊直接读取）。 */
  getSummary(): TaskSummary
}

const POLL_TIMEOUT_MS = 10 * 60 * 1000

export function createPoller(run: RunFn, storage: StorageApi, getSession: () => string): Poller {
  const listeners = new Set<() => void>()
  const live = new Map<string, LiveBuild>()
  const inflight = new Set<string>()
  let scanning = false
  /** 扫描期间又有 refresh() 请求时置位，当前扫描结束后补跑一次（避免清除未读后汇总不刷新）。 */
  let pendingRefresh = false
  /** 是否还有「进行中」任务：false 时 tick() 直接短路，不发任何请求。 */
  let hasInFlight = false
  /** 任务数量汇总：每次扫描后按历史快照重算（footer 胶囊数据源）。 */
  const summary: TaskSummary = { building: 0, successUnread: 0 }

  const emit = (): void => {
    for (const fn of Array.from(listeners)) {
      try { fn() } catch { /* 订阅者异常不影响轮询 */ }
    }
  }

  /** 按历史快照重算汇总：构建中（result 为空且带轮询数据）+ 成功未读（SUCCESS 且 unread）。 */
  const computeSummary = (entries: HistoryEntry[]): void => {
    let building = 0
    let successUnread = 0
    for (const e of entries) {
      if (e.result === null || e.result === undefined) {
        if (e.queueId != null || e.buildNumber != null) building++
      } else if (e.result === 'SUCCESS' && e.unread === true) {
        successUnread++
      }
    }
    summary.building = building
    summary.successUnread = successUnread
  }

  const segmentsOf = (e: HistoryEntry): string[] => {
    if (Array.isArray(e.segments) && e.segments.length) return e.segments
    return e.job ? e.job.split('/').filter(Boolean) : []
  }

  const pollEntry = async (e: HistoryEntry): Promise<void> => {
    const key = e.id
    if (inflight.has(key)) return
    inflight.add(key)
    try {
      const cwd = e.cwd || ''
      const serverId = e.serverId
      const segments = segmentsOf(e)
      if (!serverId || segments.length === 0) return
      const sessionId = e.sessionId || getSession() || ''
      const since = e.since || e.time
      if (Date.now() - since > POLL_TIMEOUT_MS) {
        await storage.updateHistoryResult(sessionId, cwd, key, 'TIMEOUT')
        live.set(key, { entryId: key, cwd, phase: 'error', status: 'timeout', buildNumber: e.buildNumber ?? null, since })
        emit()
        return
      }
      // 排队中 → 查询队列；已开始（有构建号）→ 查询构建状态
      if (e.queueId != null && e.buildNumber == null) {
        const res = await run(sessionId, { op: 'queueStatus', serverId, queueId: e.queueId }).catch(() => null)
        if (res && res.ok) {
          if (res.state === 'started') {
            await storage.updateHistoryPoll(sessionId, cwd, key, { buildNumber: res.buildNumber as number })
            live.set(key, { entryId: key, cwd, phase: 'running', status: 'started', buildNumber: res.buildNumber as number, since })
          } else if (res.state === 'cancelled') {
            await storage.updateHistoryResult(sessionId, cwd, key, 'CANCELLED')
            live.set(key, { entryId: key, cwd, phase: 'cancelled', status: 'cancelled', buildNumber: null, since })
          } else {
            live.set(key, { entryId: key, cwd, phase: 'queued', status: 'queued', buildNumber: null, since })
          }
        }
      } else if (e.buildNumber != null) {
        const res = await run(sessionId, { op: 'buildStatus', serverId, segments, buildNumber: e.buildNumber }).catch(() => null)
        if (res && res.ok) {
          if (res.building) {
            live.set(key, { entryId: key, cwd, phase: 'running', status: 'building', buildNumber: e.buildNumber ?? null, since })
          } else {
            await storage.updateHistoryResult(sessionId, cwd, key, (res.result as string) || 'UNKNOWN')
            if (res.url) await storage.updateHistoryPoll(sessionId, cwd, key, { url: res.url as string })
            live.set(key, {
              entryId: key, cwd, phase: 'done', status: 'done', buildNumber: e.buildNumber ?? null, since,
              result: (res.result as string) || 'UNKNOWN', duration: (res.duration as number) || 0, url: (res.url as string) || '',
            })
          }
        } else if (res && res.notFound) {
          // 构建记录尚未出现（竞态），保持待轮询状态
        } else {
          // 查询失败：保留进行中，下轮重试
          live.set(key, { entryId: key, cwd, phase: 'running', status: 'building', buildNumber: e.buildNumber ?? null, since })
        }
      }
    } finally {
      inflight.delete(key)
      emit()
    }
  }

  const scan = async (): Promise<void> => {
    const sessionId = getSession() || ''
    let entries: HistoryEntry[] = []
    try {
      entries = await storage.readAllHistory(sessionId)
    } catch { /* 忽略读取失败 */ }
    // 汇总随每次扫描更新（含空闲扫描：历史 tab 清除未读后刷新，footer 已完成胶囊随之消失）。
    computeSummary(entries)
    let found = false
    for (const e of entries) {
      if (e.result !== null && e.result !== undefined) continue
      if (e.queueId == null && e.buildNumber == null) continue
      found = true
      void pollEntry(e)
    }
    // 每次扫描后重算进行中标记：全部完成 → 空闲，后续 tick 直接短路。
    hasInFlight = found
    // 空闲扫描（无进行中任务）也要通知订阅者：汇总 / 计数变化需要被 footer / 弹框感知。
    emit()
  }

  // refresh 实现提为具名函数：扫描期间再次 refresh 时置位 pendingRefresh，当前扫描结束后补跑
  // （如打开历史清除未读后立即刷新汇总），避免请求被丢弃导致 footer 胶囊 / 未读点不更新。
  const refreshImpl = (): void => {
    if (scanning) { pendingRefresh = true; return }
    scanning = true
    void scan().finally(() => {
      scanning = false
      if (pendingRefresh) {
        pendingRefresh = false
        refreshImpl()
      }
    })
  }

  return {
    tick() {
      // 空闲时不轮询：不发 cacheGet 扫描请求，零性能开销。
      if (!hasInFlight) return
      if (scanning) return
      scanning = true
      void scan().finally(() => { scanning = false })
    },
    refresh: refreshImpl,
    subscribe(fn) {
      listeners.add(fn)
      return () => { listeners.delete(fn) }
    },
    getLive(entryId) { return live.get(entryId) },
    getSummary() { return summary },
  }
}
