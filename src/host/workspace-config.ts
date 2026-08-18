/**
 * dsh-jenkins —— 工作区配置文件（dsh-jenkins.{json,js,ts}）解析。
 *
 * 数组形式，每个元素 = 一个发布目标（job + server + environments 参数）。
 * .json 直接解析；.js / .ts 用 node 子进程求值（.ts 需 tsx 加载器）。
 */

import type { FsService, ShellService, WorkspaceConfig, WorkspaceDeployTarget } from './types.ts'
import { psQuote } from './jenkins.ts'

export interface FoundConfigFile {
  name: string
  target: string
}

/** 在工作区根目录查找配置文件（按 json → js → ts 顺序）。 */
async function findConfigFile(fsService: FsService, cwd: string): Promise<FoundConfigFile | null> {
  const names = ['dsh-jenkins.json', 'dsh-jenkins.js', 'dsh-jenkins.ts']
  for (const name of names) {
    try {
      const target = await fsService.resolve(name, { cwd })
      const info = await fsService.stat(target)
      if (info !== undefined) return { name, target }
    } catch { /* try next candidate */ }
  }
  return null
}

/** 解析配置文件内容（json 直读；js/ts 经 node 子进程求值 default 导出）。 */
async function parseConfigFile(fsService: FsService, shell: ShellService, found: FoundConfigFile): Promise<unknown> {
  const { name, target } = found
  if (name.endsWith('.json')) {
    const text = await fsService.readText(target)
    return JSON.parse(text)
  }
  // .js / .ts：用 node 子进程求值（ESM default 导出；.ts 需 tsx 加载器）。
  const abs = fsService.processPath(target)
  const script = "import('file:///'+process.argv[1].replace(/\\\\/g,'/')).then(m=>process.stdout.write(JSON.stringify(m.default??m))).catch(e=>{process.stderr.write(String((e&&e.message)||e));process.exit(1)})"
  const tsFlag = name.endsWith('.ts') ? '--import tsx/esm ' : ''
  const command = `node ${tsFlag}--input-type=module -e ${psQuote(script)} ${psQuote(abs)}`
  const spec = shell.resolve({ command, timeoutMs: 20000, stdoutMaxBytes: 2 * 1024 * 1024 })
  const res = await shell.run(spec)
  if (res.exitCode !== 0 && res.exitCode !== null) {
    const detail = ((res.stderr && res.stderr.text) || '').trim().slice(0, 300)
    throw new Error('配置文件解析失败：' + (detail || `node 退出码 ${res.exitCode}`))
  }
  return JSON.parse((res.stdout && res.stdout.text) || '{}')
}

/** 校验并归一化配置（数组格式，每个元素 = { job, server, parameters }）。 */
export function normalizeConfig(raw: unknown): WorkspaceConfig {
  // 新格式：数组，每个元素 = 一个发布目标（job + server + environments 参数表）。
  if (!Array.isArray(raw)) throw new Error('配置文件需导出数组（每个元素一个发布目标：{ job, server, environments }）')
  if (raw.length === 0) throw new Error('配置文件数组不能为空')
  const entries = raw.map((e, i) => {
    if (!e || typeof e !== 'object' || Array.isArray(e)) {
      throw new Error('配置第 ' + (i + 1) + ' 项需为对象')
    }
    const record = e as Record<string, unknown>
    const job = String(record.job || '').trim()
    if (!job) throw new Error('配置第 ' + (i + 1) + ' 项缺少 job（Jenkins 任务路径）')
    const server = String(record.server || '').trim()
    if (!server) throw new Error('配置第 ' + (i + 1) + ' 项缺少 server（服务器名称或地址）')
    const parameters = (record.environments && typeof record.environments === 'object' && !Array.isArray(record.environments))
      ? (record.environments as Record<string, string | number | boolean>)
      : {}
    return { job, server, parameters } satisfies WorkspaceDeployTarget
  })
  return { format: 'array', entries }
}

/** 加载工作区配置（不存在返回 null）。 */
export async function loadWorkspaceConfig(fsService: FsService, shell: ShellService, cwd: string): Promise<(WorkspaceConfig & { file: string }) | null> {
  const found = await findConfigFile(fsService, cwd)
  if (found === null) return null
  const raw = await parseConfigFile(fsService, shell, found)
  const config = normalizeConfig(raw)
  return { ...config, file: found.name }
}
