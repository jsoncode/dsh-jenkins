/**
 * dsh-jenkins —— 浏览器半边插件主体（slots 注册）。
 *
 * 本文件不包含 __ModuleLoader__ 包装：产物由 tsdown banner/footer 生成
 * window.__ModuleLoader__.load({ id, factory }) 工厂。外部依赖（react 等）在打包时
 * external，运行时经 factory 的 require 解析到宿主模块表（seed）。
 *
 * 入口结构（DSH 0.2.2-rc.1 改版，入口不再放侧边栏左下角）：
 * - settings.section（id 'dsh-jenkins'，order 100）：设置弹框左侧菜单新增一格，
 *   页面内嵌原「Jenkins 配置」统一弹框的全部内容（发布 / 配置 / 本机记录 /
 *   历史记录 四个 tab；不套 ModalPortal 外壳）；标题行右侧保留任务状态胶囊
 *   （构建中 / 成功未读 / 「有更新」新版本提示，点击进入更新确认 → 更新日志弹框）；
 * - settings.section.icon（同 id）：左侧菜单导航图标（Jenkins logo）；
 * - shell.overlay（dsh-jenkins-update）：插件更新流程弹框（确认更新 / 更新日志）；
 * - 原 sidebar.footer.action 注册与 shell.overlay（dsh-jenkins-config）统一弹框
 *   注册已移除（内容迁入设置页内嵌渲染）；构建日志 / 服务器编辑 / 项目模板等
 *   二级弹框仍是 body 顶层蒙版（ModalPortal），不受设置面板裁切。
 *
 * settings.section 注册包在 ctx.slots.inject('settings.section', ...) 里：
 * 该 slot 由宿主 sidebar.settings 项挂载后才存在，seat 存在才注册。
 */
import type { ReactNode } from 'react';
/** 浏览器侧插件上下文（宿主注入）。 */
export interface ClientCtx {
    get<T = unknown>(name: string): T | undefined;
    /** cordis 事件订阅（可选：宿主 locale 服务缺失时的 'locale/change' 兜底通道）。 */
    on?(event: string, listener: (payload: unknown) => void): unknown;
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