/**
 * dsh-jenkins —— 发布历史弹框：聚合所有工作区最近 50 次发布，可按工作区筛选（默认全部）。
 */
export interface HistoryModalProps {
    historyStore: {
        close(): void;
    };
    useWorkspaces?: (selector: (s: {
        items?: Array<{
            path?: string;
        }>;
    }) => unknown) => unknown;
    useLaunch(): string | null;
}
export declare function HistoryModal({ historyStore, useWorkspaces, useLaunch }: HistoryModalProps): import("react").JSX.Element | null;
//# sourceMappingURL=HistoryModal.d.ts.map