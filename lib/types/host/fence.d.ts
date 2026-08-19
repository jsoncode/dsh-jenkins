/**
 * dsh-jenkins —— /dsh-jenkins/api 路由的浏览器信任围栏。
 *
 * 行为对齐 DSH /api 网关的围栏（dsh-client-connection 的 api-request-trust 语义）：
 * Host 头为回环地址或 webRuntime.trustedHosts 内的受信任主机，且携带同源浏览器
 * 标记（sec-fetch-site / origin）才放行。这是 DNS rebinding / 跨站防御，不是认证。
 * 独立实现（不依赖 dsh-client-connection 内部模块），与 dsh-better-sidebar 的
 * trust-fence.ts 保持同一语义。
 */
import type { IncomingHttpHeaders } from 'node:http';
/** 规范化后的 URL hostname 是否指向本地回环（localhost / 127.0.0.0/8 / [::1]）。 */
export declare function isLoopbackHostname(hostname: string): boolean;
/**
 * 判定一次 /dsh-jenkins/api 请求是否可放行。
 * @param headers - node HTTP 请求头。
 * @param trustedHosts - 部署的非回环受信任主机（webRuntime.trustedHosts，可为空）。
 * @returns true 表示 Host 是自有（回环或受信任）且浏览器标记为同源。
 */
export declare function isTrustedApiRequest(headers: IncomingHttpHeaders, trustedHosts: readonly string[]): boolean;
//# sourceMappingURL=fence.d.ts.map