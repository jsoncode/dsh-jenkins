/**
 * dsh-jenkins —— 浏览器半边：集中式项目配置的共享类型与工具。
 *
 * 与宿主概念对齐：
 * - 数据 = 项目名 → 发布目标数组（`{ name?, job, server, environments }`，与工作区配置文件同构），
 *   存放在独立文件 `$DSH_HOME/dsh-jenkins-map.json`；
 * - 数组顺序 = 环境顺序、**数量不限**（第 1 项为默认环境，通常写 UAT）；
 *   每项的 `name` 是环境显示名（如 uat环境 / prod灰度），缺省按下标回退 UAT / 生产 / 环境 N；
 * - 发布 / 历史记录用 `@project/<项目名>` 作为「缓存 + 历史分桶」键，
 *   与工作区路径互不冲突（历史 tab 会显示成「项目配置：xxx」）。
 */

import { t, tErr } from './i18n.ts'

/** 集中式项目在缓存 / 历史里的分桶键前缀。 */
export const PROJECT_CWD_PREFIX = '@project/'

/** 一个发布目标（与宿主 ProjectTarget 同构）。 */
export interface ProjectTarget {
  /** 该环境的显示名（选填，如 uat环境 / prod灰度 / prod环境）；空则按下标回退。 */
  name?: string
  job: string
  server: string
  environments: Record<string, string | number | boolean>
}

/** 集中式多项目配置。 */
export type ProjectConfigMap = Record<string, ProjectTarget[]>

/** 发布表单使用的配置元素（`environments` → `parameters`）。 */
export interface ConfigEntry {
  /** 该环境的显示名（选填；见 ProjectTarget.name）。 */
  name?: string
  job: string
  server: string
  parameters?: Record<string, string | number | boolean>
}

/** 项目名 → 缓存 / 历史分桶键。 */
export const projectCwd = (name: string): string => PROJECT_CWD_PREFIX + name

/** 是否为集中式项目的分桶键。 */
export const isProjectCwd = (key: string): boolean => typeof key === 'string' && key.startsWith(PROJECT_CWD_PREFIX)

/** 从分桶键取项目名。 */
export const projectNameOfCwd = (key: string): string => (isProjectCwd(key) ? key.slice(PROJECT_CWD_PREFIX.length) : '')

/** 从路径取「项目名」（工作区文件夹名，与宿主发现式配置的命名规则一致）。 */
export const folderNameOf = (p: string | undefined | null): string => {
  const trimmed = String(p || '').replace(/[\\/]+$/, '')
  return trimmed.replace(/^.*[\\/]/, '')
}

/** 未命名环境的回退显示名（按下标：0=UAT、1=生产，其余「环境 N」）。 */
export const envLabel = (index: number): string =>
  index === 0 ? t('envUat') : index === 1 ? t('envProd') : t('projectEnvName', { n: index + 1 })

/** 发布目标的显示名：优先 `name`，缺省按下标回退为 UAT / 生产 / 环境 N。 */
export const targetLabel = (target: { name?: string } | undefined | null, index: number): string => {
  const name = String((target && target.name) || '').trim()
  return name || envLabel(index)
}

/** 发布目标数组 → 发布表单配置元素。 */
export const targetsToEntries = (targets: ProjectTarget[] | undefined | null): ConfigEntry[] =>
  (Array.isArray(targets) ? targets : []).map((target) => {
    const entry: ConfigEntry = {
      job: String(target && target.job ? target.job : ''),
      server: String(target && target.server ? target.server : ''),
      parameters: (target && target.environments) || {},
    }
    const name = String((target && target.name) || '').trim()
    if (name) entry.name = name
    return entry
  })

/** 宽松解析发布目标数组；结构非法或没有有效项时返回 null。 */
export function parseTargets(raw: unknown): ProjectTarget[] | null {
  if (!Array.isArray(raw)) return null
  const targets: ProjectTarget[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    const record = item as Record<string, unknown>
    const job = String(record.job || '').trim()
    const server = String(record.server || '').trim()
    if (!job && !server) continue
    const envRaw = (record.environments && typeof record.environments === 'object' && !Array.isArray(record.environments))
      ? record.environments as Record<string, unknown>
      : (record.parameters && typeof record.parameters === 'object' && !Array.isArray(record.parameters))
        ? record.parameters as Record<string, unknown>
        : {}
    const environments: Record<string, string | number | boolean> = {}
    for (const key of Object.keys(envRaw)) {
      const value = envRaw[key]
      environments[key] = (value === null || value === undefined)
        ? ''
        : (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
          ? value
          : String(value)
    }
    const target: ProjectTarget = { job, server, environments }
    const name = String(record.name || '').trim()
    if (name) target.name = name
    targets.push(target)
  }
  return targets.length > 0 ? targets : null
}

/** 把宿主返回的 map 收敛成结构正确的对象（字段缺失 / 脏数据时跳过）。 */
export function sanitizeProjects(raw: unknown): ProjectConfigMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: ProjectConfigMap = {}
  const source = raw as Record<string, unknown>
  for (const name of Object.keys(source)) {
    const key = String(name).trim()
    if (!key) continue
    const targets = parseTargets(source[name])
    if (targets !== null) out[key] = targets
  }
  return out
}

/**
 * 项目配置 op 的错误文案：宿主回 `unknown-op` 说明宿主半边还是旧版本
 * （map 相关 op 尚未加载），给出可执行提示而非「未知操作」。
 */
export const projectOpError = (res: { code?: string; error?: string } | null | undefined, fallback?: string): string =>
  res && res.code === 'unknown-op' ? t('projectsHostStale') : tErr(res, fallback)
