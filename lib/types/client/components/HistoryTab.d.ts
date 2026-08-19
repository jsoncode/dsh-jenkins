/**
 * dsh-jenkins —— 统一弹框「历史」tab：聚合所有工作区最近 50 次发布，可按工作区筛选
 * （默认全部）。进行中条目由全局轮询器实时回填结果；点击已完成条目可查看完整构建日志。
 * 内容来自原「发布历史」弹框，去掉弹框外框，由 JenkinsConfigModal 提供容器。
 */
import { type StorageApi } from '../storage.ts';
import type { RunFn } from '../rpc.ts';
import type { Poller } from '../poller.ts';
export interface HistoryTabProps {
    cwd: string;
    sessionId: string;
    run: RunFn;
    poller: Poller;
    storage: StorageApi;
    useWorkspaces?: (selector: (s: {
        items?: Array<{
            path?: string;
        }>;
    }) => unknown) => unknown;
}
export declare function HistoryTab({ cwd, sessionId, run, poller, storage, useWorkspaces }: HistoryTabProps): import("react").JSX.Element;
//# sourceMappingURL=HistoryTab.d.ts.map