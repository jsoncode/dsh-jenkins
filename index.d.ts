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

export const name: string
export const Config: import('@deepseek-ai/schemastery').default<Config>
export const inject: string[]
export function apply(ctx: import('@deepseek-ai/cordis').Context, config: Config): void
