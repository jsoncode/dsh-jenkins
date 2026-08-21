/**
 * dsh-jenkins —— 「项目配置」弹框：以弹框形式查看 dsh-Jenkins 配置模板（json / js / ts Tab）。
 * 遮罩盖在主弹框之上（z-index 1100），点击遮罩或 ✕ 均可关闭弹框。
 */

import { t } from '../i18n.ts'
import { TemplateSection } from './TemplateSection.tsx'

export interface TemplateModalProps {
  onClose(): void
}

export function TemplateModal({ onClose }: TemplateModalProps) {
  return (
    <div className="dshj-backdrop dshj-json-backdrop" onClick={onClose}>
      <div className="dshj-modal dshj-template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dshj-modal-header">
          <div>
            <div className="dshj-modal-title">{t('templateTitle')}</div>
          </div>
          <button type="button" className="dshj-close" aria-label={t('close')} title={t('close')} onClick={onClose}>✕</button>
        </div>
        <div className="dshj-modal-body">
          <TemplateSection />
        </div>
      </div>
    </div>
  )
}
