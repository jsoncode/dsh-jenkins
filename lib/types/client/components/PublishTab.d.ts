/**
 * dsh-jenkins —— 统一弹框「发布」tab：项目 → 服务器（= 环境） → Job → 参数表单回显 →
 * 触发构建 → 轮询状态（排队 → 构建中 → 结果）。
 *
 * 只有三行选择项（环境不单独占一行：项目配置里每个环境本来就对应一台服务器）：
 * 1. **项目**：集中式项目配置（`$DSH_HOME/dsh-jenkins-map.json`，由各工作区根目录的
 *    dsh-jenkins.{json,js,ts} 自动发现合并而来）里的项目；
 * 2. **服务器**：候选 = 项目配置引用过的服务器 ∩ 已配置服务器（无交集时退化为全部），
 *    标签带环境名前缀（`UAT · 腾讯云UAT` / `生产 · 腾讯云生产`）—— **选服务器即切环境**，
 *    Job 与参数随该环境的发布目标自动切换；
 * 3. **Job 列表**：按所选服务器实时拉取，自动预选当前环境对应的 Job。
 *
 * 发布统一经 trigger 通道提交（服务器 / Job / 参数都由表单解析完毕）。
 */
import type { ReactNode } from 'react';
import { type HistoryEntry, type StorageApi } from '../storage.ts';
import type { RunFn } from '../rpc.ts';
import type { Poller } from '../poller.ts';
/** DSH 工作区条目（与 modal 的 useWorkspaces 返回形状一致）。 */
export interface WorkspaceItem {
    path?: string;
    sessionIds?: string[];
}
export interface PublishTabProps {
    /** 初始项目（当前会话所属工作区，弹框打开时传入）。 */
    initialCwd: string;
    sessionId: string;
    run: RunFn;
    poller: Poller;
    storage: StorageApi;
    workspaceItems: WorkspaceItem[];
    onCountChange?: (count: number) => void;
    /** 上报本 tab 的 footer 操作按钮（由弹框渲染在固定 footer 区；null/undefined 表示无）。 */
    onFooter?: (node: ReactNode) => void;
    /** 打开指定发布条目的构建日志（父弹框切到「历史」tab 并弹出日志）。 */
    onOpenLog?: (entry: HistoryEntry) => void;
}
export declare function PublishTab({ initialCwd, sessionId, run, poller, storage, workspaceItems, onCountChange, onFooter, onOpenLog }: PublishTabProps): import("react").JSX.Element;
//# sourceMappingURL=PublishTab.d.ts.map