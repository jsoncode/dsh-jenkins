/**
 * dsh-jenkins —— 浏览器半边插件主体（slots 注册）。
 *
 * 本文件不包含 __ModuleLoader__ 包装：构建为单文件 CJS 后由
 * scripts/wrap-client.mjs 包装成宿主工厂格式。外部依赖（react 等）在打包时
 * external，运行时经 factory 的 require 解析到宿主模块表（seed）。
 *
 * 入口结构（统一弹框）：
 * - sidebar.footer.action：常驻「Jenkins 配置」按钮（位于 dsh 配置按钮上方），
 *   打开统一弹框；
 * - shell.overlay（dsh-jenkins-config）：统一弹框，四个 tab —— 发布 / 配置 / 本机记录 / 历史记录，
 *   分别承载原执行 Job 弹框、设置页、发布历史弹框、服务器真实构建记录的内容；
 * - 原 launcher / history 两个独立 overlay 与 settings.section 注册已移除。
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