/**
 * dsh-jenkins —— 执行 Jenkins Job 弹框（shell.overlay）：
 * 服务器 / Job 选择 → 参数表单回显 → 触发构建 → 轮询状态（排队 → 构建中 → 结果）。
 */
import type { RunFn } from '../rpc.ts';
import type { LaunchInfo } from '../store.ts';
export interface LauncherModalProps {
    run: RunFn;
    launchStore: {
        close(): void;
    };
    historyStore: {
        open(cwd: string): void;
    };
    /** 宿主 timer 服务（fiber 卸载时自动清理），与 ctx.interval 同语义。 */
    interval(callback: () => void, ms: number): () => void;
}
export declare function LauncherModal({ run, launchStore, historyStore, interval, useLaunch }: {
    run: RunFn;
    launchStore: {
        close(): void;
    };
    historyStore: {
        open(cwd: string): void;
    };
    interval(callback: () => void, ms: number): () => void;
    useLaunch(): LaunchInfo | null;
}): import("react").JSX.Element | null;
//# sourceMappingURL=LauncherModal.d.ts.map