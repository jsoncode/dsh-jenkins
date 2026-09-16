/**
 * dsh-jenkins —— 设置 → 「配置」tab：服务器管理 + 项目配置入口。
 *
 * 版面刻意保持轻量：
 * - **服务器**：列表 + 增删改（编辑在 ServerEditorModal 弹框里）+「配置模板」按钮；
 * - **项目配置**：一行摘要（`dsh-jenkins-map.json · N 个项目`），编辑集中在
 *   ProjectMapModal 弹框里 —— 内容大多由各工作区根目录的 dsh-jenkins.{json,js,ts}
 *   自动发现合并而来，通常无需手工维护。
 */
import type { RunFn } from '../rpc.ts';
export interface SettingsPageProps {
    run: RunFn;
    sessionId: string;
    /** 当前工作区（模板「保存到工作区」的默认目标根目录）。 */
    cwd?: string;
    /** 已打开的工作区列表（与统一弹框的 useWorkspaces 返回形状一致）。 */
    workspaceItems?: Array<{
        path?: string;
        sessionIds?: string[];
    }>;
    onCountChange?: (count: number) => void;
}
export declare function SettingsPage({ run, sessionId, cwd, workspaceItems, onCountChange }: SettingsPageProps): import("react").JSX.Element;
//# sourceMappingURL=SettingsPage.d.ts.map