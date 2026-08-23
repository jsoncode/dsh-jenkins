/**
 * dsh-jenkins —— 配置模板内容区（json / js / ts Tab），供「项目配置」弹框展示。
 * 「保存到工作区」：把当前格式模板写入当前工作区根目录（host op saveTemplate）；
 * 目标文件已存在时先弹确认，确认后才覆盖。
 */

import { useState } from 'react'
import { t, tErr } from '../i18n.ts'
import type { RunFn } from '../rpc.ts'
import { TEMPLATES } from '../templates.ts'
import { ModalPortal } from './ModalPortal.tsx'

export interface TemplateSectionProps {
  run: RunFn
  sessionId: string
  /** 目标工作区根目录（保存模板的位置；为空时禁用保存按钮）。 */
  cwd: string
}

/** 剪贴板兜底（execCommand 已废弃但仍是最后的降级路径）。 */
function fallbackCopy(text: string, done: () => void): void {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  try { document.execCommand('copy') } catch { /* ignore */ }
  document.body.removeChild(ta)
  done()
}

export function TemplateSection({ run, sessionId, cwd }: TemplateSectionProps) {
  const [active, setActive] = useState<'json' | 'js' | 'ts'>('json')
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false) // 保存中（按钮转禁用）
  const [saved, setSaved] = useState(false) // 保存成功提示（1.8s 后复原）
  const [saveError, setSaveError] = useState('')
  const [confirmOverwrite, setConfirmOverwrite] = useState(false) // 目标文件已存在，待确认覆盖
  const tabs: Array<'json' | 'js' | 'ts'> = ['json', 'js', 'ts']
  const code = TEMPLATES[active] || ''
  const filename = 'dsh-jenkins.' + active
  const doCopy = () => {
    const done = () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done).catch(() => fallbackCopy(code, done))
    } else {
      fallbackCopy(code, done)
    }
  }
  // 保存模板到工作区根目录：overwrite=false 时若文件已存在返回 existed，由用户确认后再覆盖
  const doSave = async (overwrite: boolean): Promise<void> => {
    if (!cwd || saving) return
    setSaving(true)
    setSaveError('')
    setSaved(false)
    try {
      const res = await run(sessionId, { op: 'saveTemplate', cwd, filename, content: code, overwrite })
      if (res && res.ok) {
        if (res.existed === true && !overwrite) {
          setConfirmOverwrite(true) // 已存在：先确认再覆盖
        } else {
          setSaved(true)
          setTimeout(() => setSaved(false), 1800)
        }
      } else {
        setSaveError(tErr(res, t('saveFailed')))
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="dshj-template">
      <div className="dshj-template-head">
        <div className="dshj-template-title">{t('templateTitle')}</div>
        <div className="dshj-template-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              className={'dshj-tab' + (tab === active ? ' dshj-tab-active' : '')}
              aria-selected={tab === active}
              onClick={() => { setActive(tab); setCopied(false); setSaved(false); setSaveError('') }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="dshj-hint">{t('templateHint')}</div>
      {saveError ? <div className="dshj-err" style={{ margin: '0 0 8px' }}>{saveError}</div> : null}
      <div className="dshj-code-head">
        <span className="dshj-code-file">{filename}</span>
        <div className="dshj-code-ops">
          <button type="button" className="dshj-btn dshj-btn-small" onClick={doCopy}>{copied ? t('copied') : t('copy')}</button>
          <button
            type="button"
            className={'dshj-btn dshj-btn-small' + (saved ? ' dshj-btn-success' : ' dshj-btn-primary')}
            disabled={!cwd || saving}
            title={cwd ? (t('saveToWorkspace') + ' → ' + cwd) : t('noWorkspaceHint')}
            onClick={() => void doSave(false)}
          >
            {saving ? t('savingToWorkspace') : saved ? t('savedToWorkspace') : t('saveToWorkspace')}
          </button>
        </div>
      </div>
      <pre className="dshj-code">{code}</pre>
      {/* 覆盖确认弹框：目标文件已存在时弹出（仅确认后写入，避免误覆盖已有配置） */}
      {confirmOverwrite ? (
        <ModalPortal
          backdropClass="dshj-json-backdrop dshj-confirm-backdrop"
          modalClass="dshj-confirm-modal"
          onBackdropClose={() => setConfirmOverwrite(false)}
        >
          <div className="dshj-modal-header">
            <div>
              <div className="dshj-modal-title">{t('overwriteConfirmTitle')}</div>
              <div className="dshj-modal-sub">{filename}</div>
            </div>
            <button type="button" className="dshj-close" aria-label={t('close')} title={t('close')} onClick={() => setConfirmOverwrite(false)}>✕</button>
          </div>
          <div className="dshj-modal-body">
            <div className="dshj-empty">{t('overwriteConfirm', { name: filename })}</div>
          </div>
          <div className="dshj-modal-footer">
            <button type="button" className="dshj-btn" onClick={() => setConfirmOverwrite(false)}>{t('cancelBtn')}</button>
            <button
              type="button"
              className="dshj-btn dshj-btn-solid"
              disabled={saving}
              onClick={() => { setConfirmOverwrite(false); void doSave(true) }}
            >
              {t('overwriteBtn')}
            </button>
          </div>
        </ModalPortal>
      ) : null}
    </div>
  )
}
