/**
 * dsh-jenkins —— 「项目配置」弹框：以弹框形式查看 dsh-Jenkins 配置模板（json / js / ts Tab）。
 * 遮罩盖在主弹框之上（z-index 1100），点击遮罩或 ✕ 均可关闭弹框。
 */
export interface TemplateModalProps {
    onClose(): void;
}
export declare function TemplateModal({ onClose }: TemplateModalProps): import("react").JSX.Element;
//# sourceMappingURL=TemplateModal.d.ts.map