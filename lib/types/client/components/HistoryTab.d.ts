/**
 * dsh-jenkins —— 统一弹框「历史」tab：聚合所有工作区最近 50 次发布，可按工作区筛选
 * （默认全部）。进行中条目由全局轮询器实时回填结果；点击已完成条目可查看完整构建日志。
 * 内容来自原「发布历史」弹框，去掉弹框外框，由 JenkinsConfigModal 提供容器。
 */
import type { ReactNode } from 'react';
import { type StorageApi } from '../storage.ts';
import type { RunFn } from '../rpc.ts';
import type { Poller } from '../poller.ts';
export interface HistoryTabProps {
    cwd: string;
    sessionId: string;
    run: RunFn;
    poller: Poller;
    storage: StorageApi;
    onCountChange?: (count: number) => void;
    /** 上报本 tab 的 footer 操作按钮（由弹框渲染在固定 footer 区；null/undefined 表示无）。 */
    onFooter?: (node: ReactNode) => void;
}
export declare function HistoryTab({ cwd, sessionId, run, poller, storage, onCountChange, onFooter }: HistoryTabProps): import("react").JSX.Element;
//# sourceMappingURL=HistoryTab.d.ts.map