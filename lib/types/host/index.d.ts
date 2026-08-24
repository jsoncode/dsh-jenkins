/**
 * dsh-jenkins —— Jenkins CLI 插件 · 宿主半边（可发布组合包，无硬编码路径）
 *
 * - settings namespace（dsh-jenkins.servers）持久化多服务器配置，base 层来自
 *   cordis.yml 的 config.servers（Schemastery 校验），用户层可经命令写入并持久化；
 * - `/dsh-jenkins/api` HTTP 路由（webServer 注册 + 信任围栏）：浏览器半边（设置页 /
 *   执行弹框 / 后台轮询）经 fetch 调用，参数为 JSON（{ op: 'list|save|delete|test|jobs|jobDetail|jobHistory|trigger|queueStatus|buildStatus|...' }），
 *   结果以 JSON 信封回传。请求不进入对话命令通道，页面不会出现 command 节点 / 调试卡片；
 * - `dsh-jenkins` 命令：保留兼容（用户/模型在对话中显式执行时可用），
 *   浏览器半边默认不再走命令通道；
 * - 两个模型工具 dsh_jenkins_build / dsh_jenkins_status。
 *
 * 运行时依赖（@deepseek-ai/*）由 package.json 的 peerDependencies 声明，
 * 安装时由宿主解析，本文件不含任何绝对路径。
 */
import type { Context } from '@deepseek-ai/cordis';
import type { OpRequest, OpResult, ServerConfig } from './types.ts';
export declare const name = "dsh-jenkins";
export declare const inject: string[];
export declare const Config: import('@deepseek-ai/schemastery').default<{
    servers: ServerConfig[];
}>;
export declare function apply(ctx: Context, config: {
    servers?: ServerConfig[];
}): void;
export type { OpRequest, OpResult, ServerConfig };
//# sourceMappingURL=index.d.ts.map