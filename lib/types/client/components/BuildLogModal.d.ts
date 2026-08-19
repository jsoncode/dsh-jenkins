/**
 * dsh-jenkins —— 构建完整日志弹框：从历史条目点击打开，拉取 Jenkins consoleText 展示。
 */
import type { RunFn } from '../rpc.ts';
import type { HistoryEntry } from '../storage.ts';
export interface BuildLogModalProps {
    entry: HistoryEntry;
    run: RunFn;
    sessionId: string;
    onClose(): void;
}
export declare function BuildLogModal({ entry, run, sessionId, onClose }: BuildLogModalProps): import("react").JSX.Element;
//# sourceMappingURL=BuildLogModal.d.ts.map