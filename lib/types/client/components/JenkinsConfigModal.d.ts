/**
 * dsh-jenkins —— 统一「Jenkins 配置」弹框（shell.overlay）：
 * 侧边栏底部「Jenkins 配置」入口打开的单一弹框，三个 tab：
 * - 发布：原「执行 Jenkins Job」弹框内容（服务器 / Job / 参数 / 触发 / 轮询状态）；
 * - 配置：原设置页内容（服务器管理：增删改查 / 测试连接 / 项目配置弹框）；
 * - 历史：原「发布历史」弹框内容（按工作区筛选 / 查看构建日志 / 清空）。
 *
 * 当前工作区（cwd）与会话 id 由宿主 overlay 的 useWorkspaces / useSessions 推导，
 * 三个 tab 共享同一份上下文。
 */
import type { RunFn } from '../rpc.ts';
import type { Poller } from '../poller.ts';
import type { StorageApi } from '../storage.ts';
import type { FooterOrderStoreApi } from '../store.ts';
type WorkspaceItem = {
    path?: string;
    sessionIds?: string[];
};
export interface JenkinsConfigModalProps {
    run: RunFn;
    poller: Poller;
    storage: StorageApi;
    useOpen(): boolean;
    close(): void;
    /** footer 排序策略共享 store（配置 tab 的开关 ↔ footer 注册）。 */
    footerOrderStore: FooterOrderStoreApi;
    useWorkspaces?: (selector: (s: {
        items?: WorkspaceItem[];
    }) => unknown) => unknown;
    useSessions?: (selector: (s: {
        current?: string;
    }) => unknown) => unknown;
}
export declare function JenkinsConfigModal({ run, poller, storage, useOpen, close, footerOrderStore, useWorkspaces, useSessions }: JenkinsConfigModalProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=JenkinsConfigModal.d.ts.map