/**
 * dsh-jenkins —— 侧边栏底部入口（sidebar.footer.action）：
 * 常驻的「Jenkins 配置」按钮（位于 dsh 配置按钮上方的 footer.action 区），
 * 点击打开统一弹框（发布 / 配置 / 历史 三个 tab）。不再按工作区配置门控 ——
 * 服务器配置入口本就应随时可达。
 *
 * 按钮右侧两个任务状态小胶囊（数据来自全局轮询器每次扫描的汇总）：
 * - 橙色：构建中（含排队）任务数，无进行中任务时不显示；
 * - 绿色：构建成功但尚未在「历史」tab 查看过的条数，打开历史后自动消失。
 */
import type { Poller } from '../poller.ts';
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
}
export declare function FooterButton({ onOpen, reportSession, wide, useSessions, poller }: FooterButtonProps): import("react").JSX.Element;
//# sourceMappingURL=FooterButton.d.ts.map