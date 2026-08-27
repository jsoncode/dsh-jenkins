/**
 * dsh-jenkins —— 「项目配置」弹框：以弹框形式查看 dsh-Jenkins 配置模板（json / js / ts Tab）。
 * 遮罩盖在主弹框之上（z-index 1100），点击遮罩或 ✕ 均可关闭弹框。
 * 「保存到工作区」：把当前格式的模板写入「项目下拉框选中」的工作区根目录
 * （默认当前工作区；文件已存在时先确认覆盖）。
 */
import type { RunFn } from '../rpc.ts';
export interface TemplateModalProps {
    run: RunFn;
    sessionId: string;
    /** 默认目标工作区根目录（当前会话所属工作区；弹框打开时的默认选中项）。 */
    cwd: string;
    /** 可选目标项目（工作区路径去重列表）；供「项目」下拉选择保存位置。 */
    workspaces?: string[];
    onClose(): void;
}
export declare function TemplateModal({ run, sessionId, cwd, workspaces, onClose }: TemplateModalProps): import("react").JSX.Element;
//# sourceMappingURL=TemplateModal.d.ts.map