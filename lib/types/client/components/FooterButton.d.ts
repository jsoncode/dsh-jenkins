/**
 * dsh-jenkins —— 侧边栏底部入口（sidebar.footer.action）：
 * 常驻的「Jenkins 配置」按钮（位于 dsh 配置按钮上方的 footer.action 区），
 * 点击打开统一弹框（发布 / 配置 / 历史 三个 tab）。不再按工作区配置门控 ——
 * 服务器配置入口本就应随时可达。
 *
 * 按钮右侧任务状态小胶囊（数据来自全局轮询器每次扫描的汇总）+ 更新提示胶囊：
 * - 橙色：构建中（含排队）任务数，无进行中任务时不显示；
 * - 绿色：构建成功但尚未在「历史」tab 查看过的条数，打开历史后自动消失；
 * - 蓝色【有更新】：npm registry 上出现比本地安装版本更新的 dsh-jenkins
 *   版本时显示，位于胶囊组最右侧（数据来自全局更新检查）；可点击 ——
 *   等宽、撑满按钮高度的透明点击热区（视觉仍是小胶囊），点击打开更新确认弹框。
 */
import type { Poller } from '../poller.ts';
import type { UpdateInfo } from '../store.ts';
export interface FooterButtonProps {
    /** 打开统一「Jenkins 配置」弹框。 */
    onOpen(): void;
    /** 上报当前会话 id（供全局轮询 / 历史读取复用宿主命令）。 */
    reportSession?: (sessionId: string) => void;
    wide?: boolean;
    useSessions?: (selector: (s: {
        current?: string;
    }) => unknown) => unknown;
    /** 全局轮询器：提供构建中 / 成功未读的任务数量汇总（footer 胶囊数据源）。 */
    poller?: Poller;
    /** 插件更新信息（store）：hasUpdate 时显示「有更新」胶囊。 */
    useUpdate?: () => UpdateInfo | null;
    /** 点击「有更新」胶囊：打开更新确认弹框。 */
    onUpdateRequest?: () => void;
}
export declare function FooterButton({ onOpen, reportSession, wide, useSessions, poller, useUpdate, onUpdateRequest }: FooterButtonProps): import("react").JSX.Element;
//# sourceMappingURL=FooterButton.d.ts.map