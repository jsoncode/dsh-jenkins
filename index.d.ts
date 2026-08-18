export interface ServerConfig {
  id: string
  name: string
  baseUrl: string
  username: string
  token: string
  insecure?: boolean
}

export interface Config {
  servers: ServerConfig[]
}

/** dsh-jenkins.{json,js,ts} 工作区配置文件：数组形式，每个元素 = 一个发布目标 */
export interface WorkspaceDeployTarget {
  /** Jenkins 任务路径，如 build-app 或 folder/build-app */
  job: string
  /** 服务器标识：已配置服务器的名称 / id / 地址，弹框按此与插件已配置服务器取交集并预选 */
  server: string
  /** 该发布目标的构建参数表（布尔渲染为复选框） */
  environments?: Record<string, string | number | boolean>
}

/** 工作区配置文件导出内容（dsh-jenkins.json / .js / .ts 的 default/module.exports） */
export type WorkspaceConfig = WorkspaceDeployTarget[]

export const name: string
export const Config: import('@deepseek-ai/schemastery').default<Config>
export const inject: string[]
export function apply(ctx: import('@deepseek-ai/cordis').Context, config: Config): void
