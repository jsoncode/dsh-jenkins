/**
 * dsh-jenkins —— 工作区配置文件（dsh-jenkins.{json,js,ts}）解析。
 *
 * 数组形式，每个元素 = 一个发布目标（job + server + environments 参数）。
 * .json 直接解析；.js / .ts 用 node 子进程求值（.ts 需 tsx 加载器）。
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
//# sourceMappingURL=workspace-config.d.ts.map