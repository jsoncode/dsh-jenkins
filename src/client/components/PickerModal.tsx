/**
 * dsh-jenkins —— 通用选择器弹框：dsh Modal（按钮触发 → 搜索框 + 可滚动列表）。
 */

import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { t } from '../i18n.ts'

export interface PickerOption {
  id: string
  label: string
}

export interface PickerModalProps {
  open: boolean
  title: string
  search: string
  setSearch: (value: string) => void
  placeholder: string
  options: PickerOption[]
  selectedId?: string
  emptyText?: string
  onSelect: (id: string) => void
  onClose: () => void
}

export function PickerModal({ open, title, search, setSearch, placeholder, options, selectedId, emptyText, onSelect, onClose }: PickerModalProps) {
  // headless 模式：完全接管卡片布局（固定高度 + 内部滚动），避免内容撑开时的首帧跳动
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      closeLabel={t('close')}
      headless
      className="dshj-picker-modal"
    >
      <div className="dshj-picker-card">
        <div className="dshj-picker-card-head">
          <span className="dshj-picker-card-title">{title}</span>
          <button type="button" className="dshj-close" aria-label={t('close')} title={t('close')} onClick={onClose}>✕</button>
        </div>
        <div className="dshj-picker-card-body">
          <input
            className="dshj-input"
            autoFocus
            value={search}
            placeholder={placeholder}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="dshj-picker-list">
            {options.length === 0
              ? <div className="dshj-empty">{emptyText || t('pickerNoMatch')}</div>
              : options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={'dshj-picker-item' + (o.id === selectedId ? ' dshj-picker-active' : '')}
                    onClick={() => onSelect(o.id)}
                  >
                    {o.label}
                  </button>
                ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
