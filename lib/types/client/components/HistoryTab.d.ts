/**
 * dsh-jenkins —— 统一弹框「历史」tab：聚合所有工作区最近 50 次发布，可按工作区筛选
 * （默认全部）。进行中条目由全局轮询器实时回填结果。每条记录提供两个独立操作：
 * 「查看详情」打开构建日志弹框、「打开原始任务」在浏览器中跳转 Jenkins 页面。
 * 内容来自原「发布历史」弹框，去掉弹框外框，由 JenkinsConfigModal 提供容器。
 */
import type { ReactNode } from 'react';
import { type HistoryEntry, type StorageApi } from '../storage.ts';
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
    /** 外部指定的日志目标（由父弹框控制，如发布 tab 的「查看完整日志」跳转）；缺省时内部自管。 */
    logTarget?: HistoryEntry | null;
    onLogTargetChange?: (entry: HistoryEntry | null) => void;
}
export declare function HistoryTab({ cwd, sessionId, run, poller, storage, onCountChange, onFooter, logTarget: logTargetProp, onLogTargetChange }: HistoryTabProps): import("react").JSX.Element;
//# sourceMappingURL=HistoryTab.d.ts.map