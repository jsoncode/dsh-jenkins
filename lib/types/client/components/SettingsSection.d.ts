/**
 * dsh-jenkins —— 设置弹框左侧菜单入口页（settings.section 'dsh-jenkins'）。
 *
 * 承载原「Jenkins 配置」统一弹框的全部内容（内嵌渲染，不套 ModalPortal 外壳）：
 * - 发布：原「执行 Jenkins Job」弹框内容（服务器 / Job / 参数 / 触发 / 轮询状态）；
 * - 配置：服务器管理（增删改查 / 测试连接 / 项目配置弹框）；
 * - 本机记录：原「发布历史」内容（按工作区筛选 / 查看构建日志 / 清空）；
 * - 历史记录：指定 Job 在 Jenkins 服务器上的真实构建记录（服务器 / Job 下拉 + 构建日志）。
 *
 * 与旧 footer 入口相比的上下文差异与对策：
 * - 设置页是全局页面、不天然跟随「当前会话」，因此顶部提供工作区选择器；
 *   默认值仍按会话所属 workspace → 第一个 workspace 的旧规则自动推导，
 *   用户手动切换后本页会话期内保持手选值（重新打开设置页恢复自动跟随）。
 * - 原 footer 按钮右侧的任务状态胶囊（构建中 / 成功未读 / 有更新）随入口迁移
 *   到本页标题行右侧；「有更新」胶囊仍可点击，打开插件更新确认弹框
 *   （shell.overlay 'dsh-jenkins-update'，不随本页内嵌）。
 * - 工作区 / 会话数据来自 settings.section 组件的标准插槽 hooks
 *   （useWorkspaces / useSessions，0.2.2-rc.1 与原 shell.overlay 同款注入）。
 * - 构建日志 / 服务器编辑 / 项目模板等二级弹框保持 ModalPortal（body 顶层
 *   fixed 蒙版）渲染，不受设置面板裁切，行为与旧弹框一致。
 */
import type { RunFn } from '../rpc.ts';
import type { Poller } from '../poller.ts';
import type { StorageApi } from '../storage.ts';
import type { UpdateInfo } from '../store.ts';
type WorkspaceItem = {
    path?: string;
    sessionIds?: string[];
};
export interface SettingsSectionProps {
    run: RunFn;
    poller: Poller;
    storage: StorageApi;
    /** 插件更新信息（store）：hasUpdate 时显示「有更新」胶囊。 */
    useUpdate(): UpdateInfo | null;
    /** 点击「有更新」胶囊：打开更新确认弹框（shell.overlay 更新流程）。 */
    onUpdateRequest(): void;
    /** 上报当前会话 id（供全局轮询 / 历史读取复用宿主命令）。 */
    reportSession?(sessionId: string): void;
    /** settings.section 标准插槽 hook：工作区快照选择器。 */
    useWorkspaces?: (selector: (s: {
        items?: WorkspaceItem[];
    }) => unknown) => unknown;
    /** settings.section 标准插槽 hook：当前会话快照选择器。 */
    useSessions?: (selector: (s: {
        current?: string;
    }) => unknown) => unknown;
}
export declare function SettingsSection({ run, poller, storage, useUpdate, onUpdateRequest, reportSession, useWorkspaces, useSessions }: SettingsSectionProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=SettingsSection.d.ts.map