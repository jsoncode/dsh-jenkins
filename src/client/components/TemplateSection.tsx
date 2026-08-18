/**
 * dsh-jenkins —— 配置模板内联区（js / ts / json Tab，置于表单上方）。
 */

import { useState } from 'react'
import { t } from '../i18n.ts'
import { TEMPLATES } from '../templates.ts'

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

export function TemplateSection() {
  const [active, setActive] = useState<'json' | 'js' | 'ts'>('json')
  const [copied, setCopied] = useState(false)
  const tabs: Array<'json' | 'js' | 'ts'> = ['json', 'js', 'ts']
  const code = TEMPLATES[active] || ''
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
              onClick={() => { setActive(tab); setCopied(false) }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="dshj-hint">{t('templateHint')}</div>
      <div className="dshj-code-head">
        <span className="dshj-code-file">{'dsh-jenkins.' + active}</span>
        <button type="button" className="dshj-btn dshj-btn-small" onClick={doCopy}>{copied ? t('copied') : t('copy')}</button>
      </div>
      <pre className="dshj-code">{code}</pre>
    </div>
  )
}
