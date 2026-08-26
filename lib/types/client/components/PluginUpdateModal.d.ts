/**
 * dsh-jenkins —— 浏览器半边：插件「更新」交互（确认弹框 → 日志大弹框）。
 *
 * 点击 footer 按钮最右侧的「更新」胶囊（.dshj-capsule-wrap 热区）→ 确认弹框
 * （展示新版本 / 当前版本与将要执行的 dsh CLI 更新命令）→ 点击「确认更新」→
 * 打开**大日志弹框**：宿主后台执行 `dsh plugin --profile web update dsh-jenkins`，
 * 本组件每 600ms 轮询 pluginUpdateStatus op 拉取累计输出与运行状态
 * （running / done / exitCode），以深色终端面板实时展示详细日志（ANSI 渲染、
 * 自动跟随底部）；结束后成功/失败着色提示，成功后触发一次 updateCheck 重查
 * （宿主已使版本缓存失效），让「更新」胶囊消失。
 *
 * 弹框信息完整版：确认弹框带命令块；日志弹框标题下展示执行命令，状态行 + 终端
 * 日志 + 复制按钮 + 完成提示（重启生效）+ 后台继续提示。
 */
import type { RunFn } from '../rpc.ts';
import type { UpdateInfo, UpdateUi } from '../store.ts';
export interface PluginUpdateModalProps {
    /** 宿主 op 通道（pluginUpdateStart / pluginUpdateStatus / updateCheck）。 */
    run: RunFn;
    /** 插件更新信息（store）：确认弹框展示 当前 → 最新 版本号。 */
    useUpdate(): UpdateInfo | null;
    /** 更新交互 UI 状态（store）：none / confirm / log。 */
    useUi(): UpdateUi;
    /** 关闭当前更新弹框（置 none）。 */
    closeUi(): void;
    /** 确认更新：关闭确认弹框并打开日志大弹框。 */
    onConfirm(): void;
    /** 更新成功后重查版本（宿主已使版本缓存失效），用于隐藏「更新」胶囊。 */
    recheck(): void;
}
/** 更新交互弹框：按 store 的 UI 状态渲染确认弹框或日志大弹框（none 时不渲染）。 */
export declare function PluginUpdateModal({ run, useUpdate, useUi, closeUi, onConfirm, recheck }: PluginUpdateModalProps): import("react").JSX.Element | null;
//# sourceMappingURL=PluginUpdateModal.d.ts.map