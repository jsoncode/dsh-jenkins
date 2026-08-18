/**
 * dsh-jenkins —— 侧边栏底部入口（sidebar.footer.action）：
 * 当前工作区根目录存在 dsh-Jenkins 配置时显示，点击打开「执行 Jenkins Job」弹框。
 */
import type { RunFn } from '../rpc.ts';
import type { LaunchInfo } from '../store.ts';
type WorkspaceItem = {
    path?: string;
    sessionIds?: string[];
};
export interface FooterButtonProps {
    run: RunFn;
    launchStore: {
        open(launch: LaunchInfo): void;
    };
    historyStore: {
        open(cwd: string): void;
    };
    wide?: boolean;
    useWorkspaces?: (selector: (s: {
        items?: WorkspaceItem[];
    }) => unknown) => unknown;
    useSessions?: (selector: (s: {
        current?: string;
    }) => unknown) => unknown;
}
export declare function FooterButton({ run, launchStore, historyStore, wide, useWorkspaces, useSessions }: FooterButtonProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=FooterButton.d.ts.map