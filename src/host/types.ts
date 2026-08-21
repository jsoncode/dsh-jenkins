/**
 * dsh-jenkins —— 宿主半边共享类型。
 */

export interface ServerConfig {
  id: string
  name: string
  baseUrl: string
  username: string
  token: string
  insecure?: boolean
  /** 最近一次测试连接是否通过（持久化；编辑保存后清除，需重新测试）。 */
  verified?: boolean
}

/** 对外（浏览器侧）暴露的服务器视图：Token 掩码，不含明文。 */
export interface PublicServer {
  id: string
  name: string
  baseUrl: string
  username: string
  tokenMasked: string
  hasToken: boolean
  insecure: boolean
  verified: boolean
}

/** 发起 Jenkins 请求所需的最小服务器视图（未持久化的测试连接也适用）。 */
export interface JenkinsServerLike {
  baseUrl: string
  username: string
  token: string
  insecure?: boolean
}

/** Jenkins 任务参数定义（normalizeParamDef 的产物）。 */
export interface JenkinsParamDef {
  name: string
  description: string
  type: string
  defaultValue: string | number | boolean
  choices: string[] | null
}

/** 命令 / 工具入参（op 分发请求）。 */
export interface OpRequest {
  op: string
  [key: string]: unknown
}

export interface OpResult {
  ok: boolean
  code?: string
  error?: string
  [key: string]: unknown
}

export interface CurlResult {
  exitCode: number | null
  stdout: string
  stderr: string
}

export interface HttpResponse {
  status: number
  headers: string
  body: string
}

/** 工作区 dsh-jenkins.{json,js,ts} 配置：数组，每个元素一个发布目标。 */
export interface WorkspaceDeployTarget {
  job: string
  server: string
  parameters: Record<string, string | number | boolean>
}

export interface WorkspaceConfig {
  format: 'array'
  entries: WorkspaceDeployTarget[]
  file?: string
}

/** curl 请求选项。 */
export interface JenkinsRequestOptions {
  method?: 'GET' | 'POST'
  form?: Record<string, string | number | boolean> | null
  headers?: Record<string, string>
  stdin?: string
}

/** 宿主 shell 服务最小视图。 */
export interface ShellService {
  resolve(spec: Record<string, unknown>): unknown
  run(spec: unknown): Promise<{
    exitCode: number | null
    stdout?: { text: string }
    stderr?: { text: string }
  }>
}

/** 宿主 subprocess 服务最小视图。 */
export interface SubprocessService {
  resolveExecutable(name: string): Promise<string>
  spawn(opts: Record<string, unknown>): Promise<{
    done: Promise<{ exitCode: number | null }>
    collected?: {
      stdout?: { readFrom(offset: number): { text: string } }
      stderr?: { readFrom(offset: number): { text: string } }
    }
  }>
}

/** 宿主 fs 服务最小视图。 */
export interface FsService {
  resolve(name: string, opts?: { cwd: string }): Promise<string>
  stat(target: string): Promise<unknown>
  readText(target: string): Promise<string>
  processPath(target: string): string
}

/** 宿主 sandboxPolicy 最小视图。 */
export interface SandboxPolicy {
  workspaceRoot?: string
}
