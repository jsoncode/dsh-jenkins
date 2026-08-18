/**
 * dsh-jenkins —— 浏览器半边插件主体（slots 注册）。
 *
 * 本文件不包含 __ModuleLoader__ 包装：构建为单文件 CJS 后由
 * scripts/wrap-client.mjs 包装成宿主工厂格式。外部依赖（react 等）在打包时
 * external，运行时经 factory 的 require 解析到宿主模块表（seed）。
 */
import type { ReactNode } from 'react';
/** 浏览器侧插件上下文（宿主注入）。 */
export interface ClientCtx {
    get<T = unknown>(name: string): T | undefined;
    interval(callback: () => void, ms: number): () => void;
    remote: {
        commands: {
            execute(sessionId: string, command: string): Promise<unknown>;
        };
    };
}
export interface ClientPluginModule {
    name: string;
    inject: string[];
    apply(ctx: ClientCtx): void;
}
export declare function createPlugin(): ClientPluginModule;
export type { ReactNode };
//# sourceMappingURL=plugin.d.ts.map