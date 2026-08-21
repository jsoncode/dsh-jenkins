/**
 * dsh-jenkins —— antd Select 风格的内联下拉选择器：
 * 点击触发器展开面板，面板顶部为搜索框（输入即过滤），选项列表内部滚动，
 * 支持点击外部 / Esc 关闭与上下键 + Enter 键盘选择。
 *
 * 面板通过 portal 渲染到 document.body 并以 position:fixed 定位，
 * 避免被父弹框（overflow:hidden）裁剪；滚动 / 窗口尺寸变化时跟随触发器更新位置，
 * 下方空间不足时自动向上展开。
 */
export interface InlineSelectOption {
    id: string;
    label: string;
}
export interface InlineSelectProps {
    value: string;
    placeholder?: string;
    options: InlineSelectOption[];
    disabled?: boolean;
    onChange(id: string): void;
    searchPlaceholder?: string;
    emptyText?: string;
    /** 面板最大高度（px），默认 260。 */
    panelMaxHeight?: number;
}
export declare function InlineSelect({ value, placeholder, options, disabled, onChange, searchPlaceholder, emptyText, panelMaxHeight }: InlineSelectProps): import("react").JSX.Element;
//# sourceMappingURL=InlineSelect.d.ts.map