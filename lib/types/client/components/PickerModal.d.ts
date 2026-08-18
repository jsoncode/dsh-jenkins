/**
 * dsh-jenkins —— 通用选择器弹框：dsh Modal（按钮触发 → 搜索框 + 可滚动列表）。
 */
export interface PickerOption {
    id: string;
    label: string;
}
export interface PickerModalProps {
    open: boolean;
    title: string;
    search: string;
    setSearch: (value: string) => void;
    placeholder: string;
    options: PickerOption[];
    selectedId?: string;
    emptyText?: string;
    onSelect: (id: string) => void;
    onClose: () => void;
}
export declare function PickerModal({ open, title, search, setSearch, placeholder, options, selectedId, emptyText, onSelect, onClose }: PickerModalProps): import("react").JSX.Element;
//# sourceMappingURL=PickerModal.d.ts.map