/**
 * dsh-jenkins —— Jenkins REST 调用核心（curl.exe，经宿主 shell/subprocess 服务执行）。
 *
 * 与原实现行为一致：
 * - 用 ctx.get('subprocess') 直接 spawn curl.exe（绕开 pwsh-sandbox 受限令牌导致的
 *   Schannel SEC_E_NO_CREDENTIALS）；
 * - `-D -` 输出响应头用于解析状态码与 Location；
 * - 表单体经 stdin（--data-binary @-，UTF-8 无 BOM）。
 */
import type { HttpResponse, JenkinsParamDef, JenkinsRequestOptions, JenkinsServerLike, ShellService } from './types.ts';
declare const psQuote: (v: string | number | boolean) => string;
declare const normalizeBase: (u: string) => string;
/** 从 job URL 中提取路径段（decode 后）。 */
export declare function jobSegments(jobUrl: string): string[];
export declare const jobPath: (segments: string[]) => string;
/** 拆分 `-D -` 输出的响应头与响应体（兼容 \r\n 与 \n 两种行尾）。 */
declare function splitHeaders(stdout: string): {
    headers: string;
    body: string;
};
/** 取响应头里最后一个 HTTP 状态码（重定向链末尾）。 */
declare function lastStatus(headers: string): number;
declare function headerValue(headers: string, name: string): string | undefined;
export interface HostCtxLike {
    get(name: string): unknown;
}
/** 发一次 Jenkins HTTP 请求，返回状态码 / 响应头 / 响应体。 */
export declare function jenkinsRequest(ctx: HostCtxLike, server: JenkinsServerLike, path: string, opts?: JenkinsRequestOptions): Promise<HttpResponse>;
/** 发 Jenkins 请求并解析 JSON；>=400 抛带 status 的错误。 */
export declare function jenkinsJson(ctx: HostCtxLike, server: JenkinsServerLike, path: string, opts?: JenkinsRequestOptions): Promise<unknown>;
/** 获取 CSRF crumb（失败静默返回 null）。 */
export declare function getCrumb(ctx: HostCtxLike, server: JenkinsServerLike): Promise<{
    field: string;
    value: string;
} | null>;
/** 归一化 Jenkins 参数定义（服务端 _class → 本地 type）。 */
export declare function normalizeParamDef(d: Record<string, unknown>): JenkinsParamDef;
/** 从 job detail 的 property 列表提取参数定义。 */
export declare function extractParams(prop: unknown[] | undefined): JenkinsParamDef[];
export { psQuote, normalizeBase, splitHeaders, lastStatus, headerValue };
export type { ShellService };
//# sourceMappingURL=jenkins.d.ts.map