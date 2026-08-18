import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 通用选择器弹框：dsh Modal（按钮触发 → 搜索框 + 可滚动列表）。
 */
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives';
import { t } from "../i18n.js";
export function PickerModal({ open, title, search, setSearch, placeholder, options, selectedId, emptyText, onSelect, onClose }) {
    // headless 模式：完全接管卡片布局（固定高度 + 内部滚动），避免内容撑开时的首帧跳动
    return (_jsx(Modal, { open: open, onClose: onClose, title: title, closeLabel: t('close'), headless: true, className: "dshj-picker-modal", children: _jsxs("div", { className: "dshj-picker-card", children: [_jsxs("div", { className: "dshj-picker-card-head", children: [_jsx("span", { className: "dshj-picker-card-title", children: title }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), title: t('close'), onClick: onClose, children: "\u2715" })] }), _jsxs("div", { className: "dshj-picker-card-body", children: [_jsx("input", { className: "dshj-input", autoFocus: true, value: search, placeholder: placeholder, onChange: (e) => setSearch(e.target.value) }), _jsx("div", { className: "dshj-picker-list", children: options.length === 0
                                ? _jsx("div", { className: "dshj-empty", children: emptyText || t('pickerNoMatch') })
                                : options.map((o) => (_jsx("button", { type: "button", className: 'dshj-picker-item' + (o.id === selectedId ? ' dshj-picker-active' : ''), onClick: () => onSelect(o.id), children: o.label }, o.id))) })] })] }) }));
}
