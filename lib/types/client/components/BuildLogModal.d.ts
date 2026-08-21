/**
 * dsh-jenkins —— 构建完整日志弹框：从历史条目点击打开，拉取 Jenkins consoleText 展示。
 *
 * 实时性：进行中（排队 / 构建中）的条目每 1 秒轮询一次日志自动刷新，构建结束后
 * 自动停止轮询并做最后一次刷新（宿主当前无 socket 通道，1s 轮询是轻量替代；
 * 轮询器订阅保证「排队 → 构建中 → 完成」状态切换能驱动日志刷新与按钮显隐）。
 * footer 提供「终止」按钮（红色，两次点击确认，与设置页删除服务器同款交互），
 * 排队阶段取消队列项、已开始则停止构建。
 */
import type { RunFn } from '../rpc.ts';
import type { HistoryEntry } from '../storage.ts';
import type { Poller } from '../poller.ts';
export interface BuildLogModalProps {
    entry: HistoryEntry;
    run: RunFn;
    sessionId: string;
    onClose(): void;
    /** 全局轮询器：用于实时判断构建是否仍在进行（进行中才持续刷新日志 / 显示终止按钮）。 */
    poller?: Poller;
}
export declare function BuildLogModal({ entry, run, sessionId, onClose, poller }: BuildLogModalProps): import("react").JSX.Element;
//# sourceMappingURL=BuildLogModal.d.ts.map