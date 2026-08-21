import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— antd Select 风格的内联下拉选择器：
 * 点击触发器展开面板，面板顶部为搜索框（输入即过滤），选项列表内部滚动，
 * 支持点击外部 / Esc 关闭与上下键 + Enter 键盘选择。
 *
 * 面板通过 portal 渲染到 document.body 并以 position:fixed 定位，
 * 避免被父弹框（overflow:hidden）裁剪；滚动 / 窗口尺寸变化时跟随触发器更新位置，
 * 下方空间不足时自动向上展开。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { t } from "../i18n.js";
export function InlineSelect({ value, placeholder, options, disabled, onChange, searchPlaceholder, emptyText, panelMaxHeight = 260 }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [active, setActive] = useState(0);
    const [pos, setPos] = useState(null);
    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const searchRef = useRef(null);
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? options.filter((o) => o.label.toLowerCase().indexOf(q) !== -1) : options;
    }, [options, search]);
    const selected = options.find((o) => o.id === value) || null;
    // 根据触发器视口位置计算面板位置：优先向下展开，下方空间不足时向上展开
    const updatePos = () => {
        const el = triggerRef.current;
        if (!el)
            return;
        const r = el.getBoundingClientRect();
        const gap = 4;
        const spaceBelow = window.innerHeight - r.bottom - gap;
        const spaceAbove = r.top - gap;
        const height = Math.min(panelMaxHeight, Math.max(spaceBelow, spaceAbove, 120));
        const up = spaceBelow < height && spaceAbove >= spaceBelow;
        setPos({
            top: up ? Math.max(gap, r.top - height - gap) : r.bottom + gap,
            left: r.left,
            width: r.width,
            height,
        });
    };
    // 点击触发器外部关闭（面板 portal 在 body 上，需同时判断面板自身）
    useEffect(() => {
        if (!open)
            return;
        const onDoc = (e) => {
            const target = e.target;
            if (rootRef.current && rootRef.current.contains(target))
                return;
            if (panelRef.current && panelRef.current.contains(target))
                return;
            setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);
    // 打开时：定位面板、重置搜索与高亮，并聚焦搜索框
    useEffect(() => {
        if (!open)
            return;
        updatePos();
        setSearch('');
        setActive(0);
        const raf = requestAnimationFrame(() => { if (searchRef.current)
            searchRef.current.focus(); });
        return () => cancelAnimationFrame(raf);
    }, [open]);
    // 弹框 body / 页面滚动（capture 捕获不冒泡的 scroll）与窗口 resize 时跟随更新位置
    useEffect(() => {
        if (!open)
            return;
        const onScroll = () => updatePos();
        const onResize = () => updatePos();
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onResize);
        };
    }, [open, panelMaxHeight]);
    // 搜索词变化时高亮回到第一项
    useEffect(() => { setActive(0); }, [search]);
    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            setOpen(false);
            return;
        }
        if (!open) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                e.preventDefault();
                setOpen(true);
            }
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => (filtered.length ? Math.min(a + 1, filtered.length - 1) : 0));
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            const opt = filtered[active];
            if (opt) {
                onChange(opt.id);
                setOpen(false);
            }
            return;
        }
    };
    const panel = open && pos ? createPortal(_jsxs("div", { ref: panelRef, className: "dshj-combo-panel", style: { top: pos.top, left: pos.left, width: pos.width, height: pos.height }, children: [_jsx("div", { className: "dshj-combo-search", children: _jsx("input", { ref: searchRef, className: "dshj-input", value: search, placeholder: searchPlaceholder || '', onChange: (e) => setSearch(e.target.value), onKeyDown: onKeyDown }) }), _jsx("div", { className: "dshj-combo-list", children: filtered.length === 0 ? (_jsx("div", { className: "dshj-combo-empty", children: emptyText || t('pickerNoMatch') })) : filtered.map((o, i) => (_jsxs("button", { type: "button", className: 'dshj-combo-item'
                        + (i === active ? ' dshj-combo-item-active' : '')
                        + (o.id === value ? ' dshj-combo-item-selected' : ''), onMouseEnter: () => setActive(i), onClick: () => { onChange(o.id); setOpen(false); }, children: [_jsx("span", { className: "dshj-combo-item-label", children: o.label }), o.id === value ? _jsx("span", { className: "dshj-combo-check", children: "\u2713" }) : null] }, o.id))) })] }), document.body) : null;
    return (_jsxs("div", { className: "dshj-combo", ref: rootRef, children: [_jsxs("button", { ref: triggerRef, type: "button", className: 'dshj-picker' + (selected ? '' : ' dshj-picker-empty'), disabled: disabled, onClick: () => setOpen((v) => !v), onKeyDown: onKeyDown, children: [_jsx("span", { className: "dshj-picker-value", children: selected ? selected.label : (placeholder || '') }), _jsx("span", { className: "dshj-picker-caret", children: open ? '▴' : '▾' })] }), panel] }));
}
