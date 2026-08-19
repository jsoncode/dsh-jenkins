/**
 * dsh-jenkins —— /dsh-jenkins/api 路由的浏览器信任围栏。
 *
 * 行为对齐 DSH /api 网关的围栏（dsh-client-connection 的 api-request-trust 语义）：
 * Host 头为回环地址或 webRuntime.trustedHosts 内的受信任主机，且携带同源浏览器
 * 标记（sec-fetch-site / origin）才放行。这是 DNS rebinding / 跨站防御，不是认证。
 * 独立实现（不依赖 dsh-client-connection 内部模块），与 dsh-better-sidebar 的
 * trust-fence.ts 保持同一语义。
 */

import type { IncomingHttpHeaders } from 'node:http'

/** 规范化后的 URL hostname 是否指向本地回环（localhost / 127.0.0.0/8 / [::1]）。 */
export function isLoopbackHostname(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '[::1]') return true
  const parts = hostname.split('.')
  return parts.length === 4
    && parts[0] === '127'
    && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)
}

/** 规范化一个 Host 头 authority 为 URL，解析失败返回 undefined。 */
function parseAuthority(authority: string): URL | undefined {
  try {
    return new URL(`http://${authority}`)
  } catch {
    return undefined
  }
}

/** 规范化 authority 形式：hostname，或带端口的 hostname:port。 */
function canonicalAuthority(entry: string, entryUrl: URL): string {
  const port = entryUrl.port !== '' ? entryUrl.port : new URL(`https://${entry}`).port
  return port === '' ? entryUrl.hostname : `${entryUrl.hostname}:${port}`
}

/** 请求 authority 是否匹配 trustedHosts 中的一项（精确或省略端口）。 */
function isTrustedAuthority(hostUrl: URL, trustedHosts: readonly string[]): boolean {
  return trustedHosts.some((entry) => {
    const entryUrl = parseAuthority(entry)
    if (entryUrl === undefined) return false
    return canonicalAuthority(entry, entryUrl) === entryUrl.hostname
      ? entryUrl.hostname === hostUrl.hostname
      : entryUrl.host === hostUrl.host
  })
}

/**
 * 判定一次 /dsh-jenkins/api 请求是否可放行。
 * @param headers - node HTTP 请求头。
 * @param trustedHosts - 部署的非回环受信任主机（webRuntime.trustedHosts，可为空）。
 * @returns true 表示 Host 是自有（回环或受信任）且浏览器标记为同源。
 */
export function isTrustedApiRequest(headers: IncomingHttpHeaders, trustedHosts: readonly string[]): boolean {
  const raw = headers.host
  if (typeof raw !== 'string' || raw === '') return false
  const hostUrl = parseAuthority(raw)
  if (hostUrl === undefined) return false
  if (!isLoopbackHostname(hostUrl.hostname) && !isTrustedAuthority(hostUrl, trustedHosts)) return false
  if (headers['sec-fetch-site'] === 'cross-site') return false
  const origin = headers.origin
  if (typeof origin !== 'string' || origin === '') return true
  try {
    return new URL(origin).host === hostUrl.host
  } catch {
    return false
  }
}
