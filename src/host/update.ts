/**
 * dsh-jenkins —— 宿主半边：插件新版本检查（op: updateCheck）。
 *
 * 以 npm registry 搜索接口（keywords:dsh-jenkins）取线上最新版本，
 * 与**被安装根目录的 package.json** 的 version 比对（即本插件安装位置的
 * 包清单，经 import.meta.url 相对定位，不依赖任何绝对路径）：
 * 返回 { current, latest, hasUpdate }。name 不匹配视为未命中（不提示更新）。
 *
 * 结果在宿主进程内缓存 10 分钟，避免每次页面加载都请求 registry；
 * 网络失败静默降级为 { current, latest:'', hasUpdate:false }，不打扰用户。
 * 更新进程结束（pluginUpdateStatus 返回 done）后调用 resetInstalledVersionCache()，
 * 下一次 updateCheck 重读新版本号 —— 客户端据此隐藏「更新」胶囊。
 */

import { readFileSync } from 'node:fs'

/** npm registry 搜索接口：按关键字查本插件，size=1 取第一条。 */
const REGISTRY_URL = 'https://registry.npmjs.org/-/v1/search?text=keywords:dsh-jenkins&size=1&from=0'

/** 插件名判断条件：搜索结果 package.name 必须严格等于该值。 */
const PLUGIN_NAME = 'dsh-jenkins'

/** registry 结果缓存时长（毫秒）。 */
const CACHE_MS = 10 * 60_000

/** 单次 registry 请求超时（毫秒）。 */
const FETCH_TIMEOUT_MS = 8_000

export interface PluginUpdateInfo {
  /** 被安装根目录 package.json 里的当前版本；读取失败为空串。 */
  current: string
  /** registry 上的最新版本；网络失败 / 未命中时为空串。 */
  latest: string
  /** latest 是否比 current 更新。 */
  hasUpdate: boolean
}

interface RegistryPackage {
  name?: unknown
  version?: unknown
}

/* ── 版本号解析与比较（semver 子集：major.minor.patch[-pre]）────── */

interface ParsedVersion {
  nums: [number, number, number]
  pre: string[]
}

/** 解析 semver 版本串；非法返回 null（忽略前导 v，容忍空白）。 */
function parseVersion(input: string): ParsedVersion | null {
  const raw = String(input ?? '').trim().replace(/^v/i, '')
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(raw)
  if (m === null) return null
  const pre = m[4] !== undefined ? m[4].split('.').filter((p) => p.length > 0) : []
  return { nums: [Number(m[1]), Number(m[2]), Number(m[3])], pre }
}

/** 比较单个预发布标识：纯数字按数值比较，数字 < 字母串，其余按 ASCII。 */
function comparePreIdentifiers(a: string, b: string): number {
  const na = /^\d+$/.test(a) ? Number(a) : null
  const nb = /^\d+$/.test(b) ? Number(b) : null
  if (na !== null && nb !== null) return na === nb ? 0 : na < nb ? -1 : 1
  if (na !== null) return -1
  if (nb !== null) return 1
  return a === b ? 0 : a < b ? -1 : 1
}

/**
 * 判断 candidate 是否严格比 base 更新（semver 规则子集）：
 * 主版本三元组数值比较；预发布版劣于正式版，预发布标识逐段比较。
 * 任一侧无法解析时返回 false（宁可漏报也不误报）。
 */
export function isNewerVersion(candidate: string, base: string): boolean {
  const c = parseVersion(candidate)
  const b = parseVersion(base)
  if (c === null || b === null) return false
  for (let i = 0; i < 3; i++) {
    if (c.nums[i] !== b.nums[i]) return c.nums[i] > b.nums[i]
  }
  // 正式版 > 预发布版；两侧都是预发布才逐标识比较。
  if (c.pre.length === 0 && b.pre.length === 0) return false
  if (c.pre.length === 0) return true
  if (b.pre.length === 0) return false
  const len = Math.max(c.pre.length, b.pre.length)
  for (let i = 0; i < len; i++) {
    const ci = c.pre[i]
    const bi = b.pre[i]
    // 缺段的一侧更小：候选先耗尽 → 候选更旧；base 先耗尽 → 候选更新。
    if (ci === undefined) return false
    if (bi === undefined) return true
    const cmp = comparePreIdentifiers(ci, bi)
    if (cmp !== 0) return cmp > 0
  }
  return false
}

/* ── 安装位置 package.json 读取 ─────────────────────────────────── */

let installedVersionCache: string | null = null

/** 清空已读版本缓存：插件更新完成后调用，下次 updateCheck 重读新版本号。 */
export function resetInstalledVersionCache(): void {
  installedVersionCache = null
}

/**
 * 读取被安装根目录 package.json 的 version（并校验 name）。
 * 编译产物 lib/index.js 相对 `../package.json`；源码直跑（tsx src/…）相对
 * `../../package.json`。两候选都失败或 name 不符时回退 process.cwd()。
 * 结果进程内记忆（包清单运行期不变）。
 */
export function readInstalledVersion(): string {
  if (installedVersionCache !== null) return installedVersionCache
  const candidates = [
    new URL('../package.json', import.meta.url),
    new URL('../../package.json', import.meta.url),
  ]
  let fallback = ''
  for (const url of candidates) {
    try {
      const text = readFileSync(url, 'utf8')
      const pkg = JSON.parse(text) as { name?: unknown; version?: unknown }
      if (pkg.name === PLUGIN_NAME && typeof pkg.version === 'string') {
        installedVersionCache = pkg.version
        return pkg.version
      }
      if (fallback === '' && typeof pkg.version === 'string') fallback = pkg.version
    } catch { /* 候选不存在（如源码直跑的第一候选），试下一个 */ }
  }
  if (fallback === '') {
    try {
      const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { name?: unknown; version?: unknown }
      if (pkg.name === PLUGIN_NAME && typeof pkg.version === 'string') fallback = pkg.version
    } catch { /* cwd 也无包清单：保持空串 */ }
  }
  installedVersionCache = fallback
  return fallback
}

/* ── registry 查询（带进程内缓存）────────────────────────────────── */

let cache: { at: number; info: PluginUpdateInfo } | null = null

/** 从 registry 响应里取 name 严格匹配条目的版本（objects 可能有多个）。 */
function pickLatest(objects: unknown): string {
  if (!Array.isArray(objects)) return ''
  for (const item of objects) {
    const pkg = (item as { package?: RegistryPackage } | null)?.package
    if (pkg === undefined || pkg === null || pkg.name !== PLUGIN_NAME) continue
    return typeof pkg.version === 'string' ? pkg.version.trim() : ''
  }
  return ''
}

async function fetchLatest(): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(REGISTRY_URL, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return ''
    const body = await res.json().catch(() => null) as { objects?: unknown } | null
    return pickLatest(body?.objects)
  } catch {
    return ''
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 检查插件更新：registry 最新版 vs 被安装根目录 package.json 版本。
 * 进程内缓存 10 分钟；网络失败降级为 { current, latest:'', hasUpdate:false }。
 */
export async function checkPluginUpdate(): Promise<PluginUpdateInfo> {
  const current = readInstalledVersion()
  const hit = cache !== null && Date.now() - cache.at < CACHE_MS
  if (hit) {
    const cachedInfo = (cache as { info: PluginUpdateInfo }).info
    // 缓存命中但 current 变了（热升级）：按新 current 重算结论即可，不必再拉网。
    return { ...cachedInfo, current, hasUpdate: isNewerVersion(cachedInfo.latest, current) }
  }
  const latest = await fetchLatest()
  const info: PluginUpdateInfo = { current, latest, hasUpdate: isNewerVersion(latest, current) }
  cache = { at: Date.now(), info }
  return info
}
