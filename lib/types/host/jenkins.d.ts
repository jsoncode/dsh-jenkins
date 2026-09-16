/**
 * dsh-jenkins —— Jenkins REST 调用核心（curl.exe，经宿主 shell/subprocess 服务执行）。
 *
 * 与原实现行为一致：
 * - 用 ctx.get('subprocess') 直接 spawn curl.exe（绕开 pwsh-sandbox 受限令牌导致的
 *   Schannel SEC_E_NO_CREDENTIALS）；
 * - `-D -` 输出响应头用于解析状态码与 Location；
 * - 表单体经 stdin（--data-binary @-，UTF-8 无 BOM）。
 *
 * `-D -` 的输出可能是「多个响应头块」：走了 HTTP 代理的 HTTPS 请求会先打印
 * 代理的 `HTTP/1.1 200 Connection Established` 隧道块（1xx / 100-continue 同理），
 * 之后才是真实响应块。因此按块解析（parseCurlDump）而不是在第一个空行处切分，
 * 否则真实状态码会被隧道块的 200 掩盖、真实响应头会被当成正文导致 JSON 解析失败。
 */
import type { HttpResponse, JenkinsParamDef, JenkinsRequestOptions, JenkinsServerLike, ShellService } from './types.ts';
declare const psQuote: (v: string | number | boolean) => string;
declare const normalizeBase: (u: string) => string;
/**
 * 取地址的**域名**（主机名小写）：忽略协议 / 端口 / 上下文路径 / URL 内嵌凭据。
 * 与浏览器半边 `client/storage.ts` 的 serverHost 保持一致（同一个匹配语义）。
 */
export declare function serverHost(u: string): string;
/** 从 job URL 中提取路径段（decode 后）。 */
export declare function jobSegments(jobUrl: string): string[];
export declare const jobPath: (segments: string[]) => string;
/** `-D -` 输出的解析结果。 */
export interface CurlDump {
    /** 全部响应块状态码（含代理 CONNECT 隧道块 / 1xx），按出现顺序。 */
    statuses: number[];
    /** 最后一个（真实）响应块的头文本；无头块时为空串。 */
    headers: string;
    /** 响应体。 */
    body: string;
}
/**
 * 解析 `curl -D -` 的输出：顺序跳过所有响应头块（代理 CONNECT / 1xx / 重定向链），
 * 取最后一个块作为有效响应头，其余为正文。兼容 \r\n 与 \n 行尾。
 */
export declare function parseCurlDump(stdout: string): CurlDump;
/** 拆分 `-D -` 输出的响应头与响应体（兼容 \r\n 与 \n 两种行尾）。 */
declare function splitHeaders(stdout: string): {
    headers: string;
    body: string;
};
/** 取响应头里最后一个 HTTP 状态码（重定向链末尾）。 */
declare function lastStatus(headers: string): number;
declare function headerValue(headers: string, name: string): string | undefined;
/**
 * 把异常映射为客户端本地化的错误码（中/英文案由客户端 i18n 的 errors 表提供）。
 * 优先用 jenkinsJson 打上的 err.code，其次按 HTTP 状态码，最后按消息关键词兜底。
 */
export declare function errorCodeOf(e: unknown): string | undefined;
export interface HostCtxLike {
    get(name: string): unknown;
}
/** 发一次 Jenkins HTTP 请求，返回状态码 / 响应头 / 响应体。 */
export declare function jenkinsRequest(ctx: HostCtxLike, server: JenkinsServerLike, path: string, opts?: JenkinsRequestOptions): Promise<HttpResponse>;
/** 发 Jenkins 请求并解析 JSON；>=400 抛带 status 的错误。 */
export declare function jenkinsJson(ctx: HostCtxLike, server: JenkinsServerLike, path: string, opts?: JenkinsRequestOptions): Promise<unknown>;
/** 获取 CSRF crumb（失败静默返回 null）。 */
export declare function getCrumb(ctx: HostCtxLike, server: JenkinsServerLike, op?: string): Promise<{
    field: string;
    value: string;
} | null>;
/**
 * 归一化 Jenkins 参数定义（服务端 `_class` → 本地 type）。
 *
 * 覆盖范围（REST 里能直接读到的类型）：
 * - 内置：string / text / boolean / password / choice / file / credentials；
 * - 插件：uno-choice（Active Choices：`org.biouno.unochoice.ChoiceParameter` /
 *   `CascadeChoiceParameter` / `MultiSelectParameter`，选项是脚本生成的 → 这里只能拿到
 *   默认值，选项列表留给构建页解析兜底）、Extended Choice（`value` 里是列表字符串）、
 *   DynamicReference（`name` 为空的「分隔行」，映射成界面的虚线条）。
 */
export declare function normalizeParamDef(d: Record<string, unknown>): JenkinsParamDef;
/**
 * 从 job detail 的 property 列表提取参数定义。
 * - `name` 为空的分隔行按上面的规则处理（有文字 → 虚线条，纯横线 → 丢弃）；
 * - 同名参数只保留第一个（插件偶尔会重复定义隐藏字段）。
 */
export declare function extractParams(prop: unknown[] | undefined): JenkinsParamDef[];
/**
 * 构建页 HTML → 各参数的选项列表（uno-choice / 动态 choice 的脚本选项只有渲染后才可见）。
 *
 * 页面结构（Jenkins 新版表单）：
 * ```html
 * <div class="jenkins-form-item">
 *   <div class="jenkins-form-label">project</div>
 *   <div class="setting-main">
 *     <input name="name" type="hidden" value="project">
 *     <select name="value"><option value="a">a</option>…</select>
 * ```
 * 因此：每个 `<select>` 向前找最近的 `<input name="name" … value="X">`，X 即参数名。
 */
export declare function parseBuildPageChoices(html: string): Record<string, {
    choices: string[];
    multiSelect: boolean;
    defaultValue: string;
}>;
export { psQuote, normalizeBase, splitHeaders, lastStatus, headerValue };
export type { ShellService };
//# sourceMappingURL=jenkins.d.ts.map