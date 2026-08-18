/**
 * dsh-jenkins —— Jenkins CLI 插件 · 宿主半边（可发布组合包，无硬编码路径）
 *
 * - settings namespace（dsh-jenkins.servers）持久化多服务器配置，base 层来自
 *   cordis.yml 的 config.servers（Schemastery 校验），用户层可经命令写入并持久化；
 * - `dsh-jenkins` 命令：客户端（设置页）经 ctx.remote.commands.execute 调用，
 *   参数为 JSON（{ op: 'list|save|delete|test|jobs|jobDetail|trigger|queueStatus|buildStatus|...' }），
 *   结果以 JSON 文本回传；
 * - 两个模型工具 dsh_jenkins_build / dsh_jenkins_status。
 *
 * 运行时依赖（@deepseek-ai/*）由 package.json 的 peerDependencies 声明，
 * 安装时由宿主解析，本文件不含任何绝对路径。
 */
import Schema from '@deepseek-ai/schemastery';
import type { Context } from '@deepseek-ai/cordis';
import type { OpRequest, OpResult, ServerConfig } from './types.ts';
export declare const name = "dsh-jenkins";
export declare const inject: string[];
export declare const Config: Schema<Schemastery.ObjectS<{
    servers: Schema<({
        id?: string | null | undefined;
        name?: string | null | undefined;
        baseUrl?: string | null | undefined;
        username?: string | null | undefined;
        token?: string | null | undefined;
        insecure?: boolean | null | undefined;
    } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<{
        id: Schema<string, string>;
        name: Schema<string, string>;
        baseUrl: Schema<string, string>;
        username: Schema<string, string>;
        token: Schema<string, string>;
        insecure: Schema<boolean, boolean>;
    }>[]>;
}>, Schemastery.ObjectT<{
    servers: Schema<({
        id?: string | null | undefined;
        name?: string | null | undefined;
        baseUrl?: string | null | undefined;
        username?: string | null | undefined;
        token?: string | null | undefined;
        insecure?: boolean | null | undefined;
    } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<{
        id: Schema<string, string>;
        name: Schema<string, string>;
        baseUrl: Schema<string, string>;
        username: Schema<string, string>;
        token: Schema<string, string>;
        insecure: Schema<boolean, boolean>;
    }>[]>;
}>>;
export declare function apply(ctx: Context, config: {
    servers?: ServerConfig[];
}): void;
export type { OpRequest, OpResult, ServerConfig };
//# sourceMappingURL=index.d.ts.map