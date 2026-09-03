/**
 * dsh-jenkins —— 工作区配置文件（dsh-jenkins.{json,js,ts}）解析。
 *
 * 数组形式，每个元素 = 一个发布目标（job + server + environments 参数）。
 * .json 直接解析；.js / .ts 用 node 子进程求值（.ts 需 tsx 加载器）。
 * 另提供按「文件内容」解析（parseConfigFromContent），供发布 tab「选择配置」
 * 从文件管理器任意选取的配置文件使用。
 */
import type { FsService, ShellService, WorkspaceConfig } from './types.ts';
export interface FoundConfigFile {
    name: string;
    target: string;
}
/** 校验并归一化配置（数组格式，每个元素 = { job, server, parameters }）。 */
export declare function normalizeConfig(raw: unknown): WorkspaceConfig;
/** 加载工作区配置（不存在返回 null）。 */
export declare function loadWorkspaceConfig(fsService: FsService, shell: ShellService, cwd: string): Promise<(WorkspaceConfig & {
    file: string;
}) | null>;
/**
 * 按「文件内容」解析配置（发布 tab「选择配置」经文件管理器任意选文件时使用）。
 *
 * 内容已在浏览器侧读取，故不受宿主文件沙箱 / 工作区根限制：
 * - .json：直接 JSON.parse；
 * - .js / .cjs / .mjs / .ts：把内容写入系统临时目录下的独立文件，用 node 动态 import
 *   求值 default 导出（.ts 经 tsx 加载器），随后删除临时目录。
 *   .js 按内容判定模块体系：出现 ESM 语法（import/export）用 .mjs，否则按 CommonJS 用 .cjs
 *   （与内置模板约定一致）。仅适合自包含数组导出；含相对 / 包导入的高级配置会求值失败并回传错误。
 */
export declare function parseConfigFromContent(shell: ShellService, filename: string, content: string): Promise<WorkspaceConfig & {
    file: string;
}>;
//# sourceMappingURL=workspace-config.d.ts.map