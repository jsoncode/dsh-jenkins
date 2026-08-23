/**
 * dsh-jenkins —— 「项目配置」弹框：以弹框形式查看 dsh-Jenkins 配置模板（json / js / ts Tab）。
 * 遮罩盖在主弹框之上（z-index 1100），点击遮罩或 ✕ 均可关闭弹框。
 * 「保存到工作区」：把当前格式的模板写入当前工作区根目录（文件已存在时先确认覆盖）。
 */
import type { RunFn } from '../rpc.ts';
export interface TemplateModalProps {
    run: RunFn;
    sessionId: string;
    /** 目标工作区根目录（保存模板的位置；为空时禁用保存按钮）。 */
    cwd: string;
    onClose(): void;
}
export declare function TemplateModal({ run, sessionId, cwd, onClose }: TemplateModalProps): import("react").JSX.Element;
//# sourceMappingURL=TemplateModal.d.ts.map