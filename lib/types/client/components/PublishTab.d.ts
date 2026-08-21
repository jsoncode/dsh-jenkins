/**
 * dsh-jenkins —— 统一弹框「发布」tab：项目 → 服务器 / Job 选择 → 参数表单回显 →
 * 触发构建 → 轮询状态（排队 → 构建中 → 结果）。
 *
 * 不做配置门控：始终显示表单。顶部「项目」下拉列出 DSH 工作区，用户自选目标项目；
 * 若所选项目存在 dsh-jenkins 配置（dsh-jenkins.json/js/ts），自动启用配置增强
 * （服务器下拉取配置交集、参数默认值、提交走 workspaceTrigger）；无配置时直接
 * 走 trigger 通道（用户手动选服务器 / Job / 参数）。
 */
import type { ReactNode } from 'react';
import { type StorageApi } from '../storage.ts';
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
}
export declare function PublishTab({ initialCwd, sessionId, run, poller, storage, workspaceItems, onCountChange, onFooter }: PublishTabProps): import("react").JSX.Element;
//# sourceMappingURL=PublishTab.d.ts.map