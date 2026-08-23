/**
 * dsh-jenkins —— 设置 → Jenkins 配置页：服务器管理（settings.section）。
 * 新增 / 编辑服务器在独立弹框（ServerEditorModal）中操作，本页只负责列表与增删入口。
 */
import type { RunFn } from '../rpc.ts';
export interface SettingsPageProps {
    run: RunFn;
    sessionId: string;
    /** 当前工作区（模板「保存到工作区」的目标根目录）。 */
    cwd?: string;
    onCountChange?: (count: number) => void;
}
export declare function SettingsPage({ run, sessionId, cwd, onCountChange }: SettingsPageProps): import("react").JSX.Element;
//# sourceMappingURL=SettingsPage.d.ts.map