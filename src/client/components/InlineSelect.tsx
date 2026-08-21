/**
 * dsh-jenkins —— antd Select 风格的内联下拉选择器：
 * 点击触发器展开面板，面板顶部为搜索框（输入即过滤），选项列表内部滚动，
 * 支持点击外部 / Esc 关闭与上下键 + Enter 键盘选择。
 *
 * 面板通过 portal 渲染到 document.body 并以 position:fixed 定位，
 * 避免被父弹框（overflow:hidden）裁剪；滚动 / 窗口尺寸变化时跟随触发器更新位置，
 * 下方空间不足时自动向上展开。
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { t } from '../i18n.ts'

export interface InlineSelectOption {
  id: string
  label: string
}

export interface InlineSelectProps {
  value: string
  placeholder?: string
  options: InlineSelectOption[]
  disabled?: boolean
  onChange(id: string): void
  searchPlaceholder?: string
  emptyText?: string
  /** 面板最大高度（px），默认 260。 */
  panelMaxHeight?: number
}

interface PanelPos {
  top: number
  left: number
  width: number
  height: number
}

export function InlineSelect({ value, placeholder, options, disabled, onChange, searchPlaceholder, emptyText, panelMaxHeight = 260 }: InlineSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState<PanelPos | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? options.filter((o) => o.label.toLowerCase().indexOf(q) !== -1) : options
  }, [options, search])

  const selected = options.find((o) => o.id === value) || null

  // 根据触发器视口位置计算面板位置：优先向下展开，下方空间不足时向上展开
  const updatePos = () => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const gap = 4
    const spaceBelow = window.innerHeight - r.bottom - gap
    const spaceAbove = r.top - gap
    const height = Math.min(panelMaxHeight, Math.max(spaceBelow, spaceAbove, 120))
    const up = spaceBelow < height && spaceAbove >= spaceBelow
    setPos({
      top: up ? Math.max(gap, r.top - height - gap) : r.bottom + gap,
      left: r.left,
      width: r.width,
      height,
    })
  }

  // 点击触发器外部关闭（面板 portal 在 body 上，需同时判断面板自身）
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node
      if (rootRef.current && rootRef.current.contains(target)) return
      if (panelRef.current && panelRef.current.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  // 打开时：定位面板、重置搜索与高亮，并聚焦搜索框
  useEffect(() => {
    if (!open) return
    updatePos()
    setSearch('')
    setActive(0)
    const raf = requestAnimationFrame(() => { if (searchRef.current) searchRef.current.focus() })
    return () => cancelAnimationFrame(raf)
  }, [open])

  // 弹框 body / 页面滚动（capture 捕获不冒泡的 scroll）与窗口 resize 时跟随更新位置
  useEffect(() => {
    if (!open) return
    const onScroll = () => updatePos()
    const onResize = () => updatePos()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open, panelMaxHeight])

  // 搜索词变化时高亮回到第一项
  useEffect(() => { setActive(0) }, [search])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); return }
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); setOpen(true) }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (filtered.length ? Math.min(a + 1, filtered.length - 1) : 0))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const opt = filtered[active]
      if (opt) { onChange(opt.id); setOpen(false) }
      return
    }
  }

  const panel = open && pos ? createPortal(
    <div ref={panelRef} className="dshj-combo-panel" style={{ top: pos.top, left: pos.left, width: pos.width, height: pos.height }}>
      <div className="dshj-combo-search">
        <input
          ref={searchRef}
          className="dshj-input"
          value={search}
          placeholder={searchPlaceholder || ''}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="dshj-combo-list">
        {filtered.length === 0 ? (
          <div className="dshj-combo-empty">{emptyText || t('pickerNoMatch')}</div>
        ) : filtered.map((o, i) => (
          <button
            key={o.id}
            type="button"
            className={'dshj-combo-item'
              + (i === active ? ' dshj-combo-item-active' : '')
              + (o.id === value ? ' dshj-combo-item-selected' : '')}
            onMouseEnter={() => setActive(i)}
            onClick={() => { onChange(o.id); setOpen(false) }}
          >
            <span className="dshj-combo-item-label">{o.label}</span>
            {o.id === value ? <span className="dshj-combo-check">✓</span> : null}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  ) : null

  return (
    <div className="dshj-combo" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={'dshj-picker' + (selected ? '' : ' dshj-picker-empty')}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
      >
        <span className="dshj-picker-value">{selected ? selected.label : (placeholder || '')}</span>
        <span className="dshj-picker-caret">{open ? '▴' : '▾'}</span>
      </button>
      {panel}
    </div>
  )
}
