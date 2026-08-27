/**
 * dsh-jenkins —— 「项目配置」弹框：以弹框形式查看 dsh-Jenkins 配置模板（json / js / ts Tab）。
 * 遮罩盖在主弹框之上（z-index 1100），点击遮罩或 ✕ 均可关闭弹框。
 * 「保存到工作区」：把当前格式的模板写入「项目下拉框选中」的工作区根目录
 * （默认当前工作区；文件已存在时先确认覆盖）。
 */

import { t } from '../i18n.ts'
import type { RunFn } from '../rpc.ts'
import { TemplateSection } from './TemplateSection.tsx'
import { ModalPortal } from './ModalPortal.tsx'

export interface TemplateModalProps {
  run: RunFn
  sessionId: string
  /** 默认目标工作区根目录（当前会话所属工作区；弹框打开时的默认选中项）。 */
  cwd: string
  /** 可选目标项目（工作区路径去重列表）；供「项目」下拉选择保存位置。 */
  workspaces?: string[]
  onClose(): void
}

export function TemplateModal({ run, sessionId, cwd, workspaces, onClose }: TemplateModalProps) {
  return (
    <ModalPortal backdropClass="dshj-json-backdrop" modalClass="dshj-template-modal" onBackdropClose={onClose}>
      <div className="dshj-modal-header">
        <div>
          <div className="dshj-modal-title">{t('templateTitle')}</div>
        </div>
        <button type="button" className="dshj-close" aria-label={t('close')} title={t('close')} onClick={onClose}>✕</button>
      </div>
      <div className="dshj-modal-body">
        <TemplateSection run={run} sessionId={sessionId} cwd={cwd} workspaces={workspaces} />
      </div>
    </ModalPortal>
  )
}
