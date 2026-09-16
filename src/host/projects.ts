/**
 * dsh-jenkins —— 集中式「项目配置」（项目名 → 发布目标数组）纯逻辑：
 * 归一化 / 校验 / 合并 / 从配置载荷解析。
 *
 * - 数据形状与工作区配置文件同构：每个发布目标 =
 *   `{ name?, job, server, environments }`（`name` 为该环境的显示名，如 uat环境 /
 *   prod灰度），项目名做 key，值为数组；**数组顺序 = 环境顺序、数量不限**
 *   （第 1 项为默认环境，通常写 UAT）；
 * - 落盘 / 读取见 project-map.ts（独立文件 `$DSH_HOME/dsh-jenkins-map.json`）；
 * - 兼容两种来源：map 格式本身，以及旧版**数组**格式（工作区根目录
 *   dsh-jenkins.json/js/ts 的内容 —— 发现式配置即用它合并进 map）。
 *
 * 本模块只做「解析 + 校验 + 合并」，不触碰文件系统；读文件由 project-map.ts 负责。
 */

import type { ProjectConfigMap, ProjectTarget } from './types.ts'

/** 环境参数表：仅接受 string / number / boolean 三种标量值。 */
function normalizeEnvironments(raw: unknown, label: string): Record<string, string | number | boolean> {
  if (raw === null || raw === undefined) return {}
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(label + ' 的 environments 需为对象（键值对）')
  }
  const out: Record<string, string | number | boolean> = {}
  for (const key of Object.keys(raw as Record<string, unknown>)) {
    const value = (raw as Record<string, unknown>)[key]
    if (value === null || value === undefined) { out[key] = ''; continue }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value
      continue
    }
    // 嵌套对象 / 数组：序列化为 JSON 字符串（Jenkins 参数只支持标量）
    try { out[key] = JSON.stringify(value) } catch { out[key] = String(value) }
  }
  return out
}

/**
 * 归一化单个发布目标（job / server 必填；name 与 environments 可省略）。
 * `name` 省略 / 空串时**不写该字段**，文件保持干净（显示时由界面按下标回退）。
 */
export function normalizeProjectTarget(raw: unknown, label: string): ProjectTarget {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(label + ' 需为对象')
  const record = raw as Record<string, unknown>
  const job = String(record.job || '').trim()
  if (!job) throw new Error(label + ' 缺少 job（Jenkins 任务路径）')
  const server = String(record.server || '').trim()
  if (!server) throw new Error(label + ' 缺少 server（服务器名称 / id / 地址）')
  // name：该环境的显示名（如 uat环境 / prod灰度 / prod环境）；空则省略
  const name = String(record.name || '').trim()
  // environments 与 parameters 互为别名（前者为配置文件写法，后者为内部归一化写法）。
  const env = record.environments !== undefined ? record.environments : record.parameters
  const target: ProjectTarget = { job, server, environments: normalizeEnvironments(env, label) }
  if (name) target.name = name
  return target
}

/** 归一化一个项目的发布目标数组（至少 1 项；数量不限）。 */
export function normalizeProjectTargets(raw: unknown, projectName: string): ProjectTarget[] {
  if (!Array.isArray(raw)) throw new Error('项目「' + projectName + '」的值需为数组（每个元素一个发布目标）')
  if (raw.length === 0) throw new Error('项目「' + projectName + '」至少需要一个发布目标')
  return raw.map((item, i) => normalizeProjectTarget(item, '项目「' + projectName + '」第 ' + (i + 1) + ' 个发布目标'))
}

/** 归一化整个 map（严格模式：任一项非法即抛错；allowEmpty 时接受空 map）。 */
export function normalizeProjectMap(raw: unknown, opts?: { allowEmpty?: boolean }): ProjectConfigMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('集中配置需为对象：{ "项目名": [ 发布目标, ... ], ... }')
  }
  const source = raw as Record<string, unknown>
  const out: ProjectConfigMap = {}
  const names = Object.keys(source)
  if (names.length === 0 && !(opts && opts.allowEmpty)) throw new Error('集中配置不能为空')
  for (const name of names) {
    const key = String(name).trim()
    if (!key) throw new Error('项目名不能为空')
    out[key] = normalizeProjectTargets(source[name], key)
  }
  return out
}

/** 宽松归一化（读数据文件用）：跳过非法项，绝不抛错。 */
export function sanitizeProjectMap(raw: unknown): ProjectConfigMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const source = raw as Record<string, unknown>
  const out: ProjectConfigMap = {}
  for (const name of Object.keys(source)) {
    const key = String(name).trim()
    if (!key) continue
    const list = source[name]
    if (!Array.isArray(list)) continue
    const targets: ProjectTarget[] = []
    for (const item of list) {
      try {
        targets.push(normalizeProjectTarget(item, '项目「' + key + '」发布目标'))
      } catch { /* 跳过非法项 */ }
    }
    if (targets.length > 0) out[key] = targets
  }
  return out
}

/**
 * 从文件名推导项目名：去掉扩展名与 `dsh-jenkins` 前缀；
 * 文件本身就叫 `dsh-jenkins.*`（工作区根目录配置）时退回**所属文件夹名**，
 * 都没有则用 `imported`。
 */
export function projectNameFromFilename(filename: string): string {
  const normalized = String(filename || '').trim().replace(/\\/g, '/')
  const parts = normalized.split('/').filter((p) => p.length > 0)
  const base = parts.length > 0 ? parts[parts.length - 1] : ''
  const stem = base.replace(/\.(json|js|cjs|mjs|ts)$/i, '')
  const stripped = stem.replace(/^dsh-jenkins[._-]?/i, '').trim()
  if (stripped) return stripped
  return parts.length > 1 ? parts[parts.length - 2] : 'imported'
}

/** 合并两份项目配置（incoming 覆盖同名项目，其余保留）。 */
export function mergeProjectMaps(base: ProjectConfigMap, incoming: ProjectConfigMap): ProjectConfigMap {
  const out: ProjectConfigMap = { ...base }
  for (const name of Object.keys(incoming)) out[name] = incoming[name]
  return out
}

/**
 * 只补缺失地合并（发现式配置的默认策略）：incoming 中已存在的同名项目保持原样，
 * 不覆盖用户手改过的内容；返回新 map 与被新增的项目名列表。
 */
export function mergeMissingProjects(base: ProjectConfigMap, incoming: ProjectConfigMap): { map: ProjectConfigMap; added: string[] } {
  const out: ProjectConfigMap = { ...base }
  const added: string[] = []
  for (const name of Object.keys(incoming)) {
    if (name in out) continue
    out[name] = incoming[name]
    added.push(name)
  }
  return { map: out, added }
}
