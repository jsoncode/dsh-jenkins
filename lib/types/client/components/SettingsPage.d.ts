/**
 * dsh-jenkins —— 设置 → Jenkins 配置页：服务器管理（settings.section）。
 */
import type { RunFn } from '../rpc.ts';
export interface SettingsPageProps {
    run: RunFn;
    sessionId: string;
}
export declare function SettingsPage({ run, sessionId }: SettingsPageProps): import("react").JSX.Element;
//# sourceMappingURL=SettingsPage.d.ts.map