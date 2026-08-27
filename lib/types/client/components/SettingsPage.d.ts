/**
 * dsh-jenkins —— 设置 → Jenkins 配置页：服务器管理（settings.section）。
 * 新增 / 编辑服务器在独立弹框（ServerEditorModal）中操作，本页只负责列表与增删入口。
 */
import type { RunFn } from '../rpc.ts';
export interface SettingsPageProps {
    run: RunFn;
    sessionId: string;
    /** 当前工作区（模板「保存到工作区」的默认目标根目录）。 */
    cwd?: string;
    /** 已打开的工作区列表（与统一弹框的 useWorkspaces 返回形状一致）；供模板弹框选择保存位置。 */
    workspaceItems?: Array<{
        path?: string;
        sessionIds?: string[];
    }>;
    onCountChange?: (count: number) => void;
}
export declare function SettingsPage({ run, sessionId, cwd, workspaceItems, onCountChange }: SettingsPageProps): import("react").JSX.Element;
//# sourceMappingURL=SettingsPage.d.ts.map