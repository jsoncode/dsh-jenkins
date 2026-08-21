/**
 * dsh-jenkins —— 「编辑 Jenkins 服务器」弹框：新增 / 编辑服务器共用同一表单，
 * 在独立弹框中完成填写、测试连接与保存（点击蒙版不关闭，避免误触丢失输入）。
 */

import { useState } from 'react'
import { t, tErr } from '../i18n.ts'
import type { RunFn } from '../rpc.ts'

export interface PublicServer {
  id: string
  name: string
  baseUrl: string
  username: string
  tokenMasked: string
  hasToken: boolean
  insecure: boolean
  /** 最近一次测试连接是否通过（持久化；编辑保存后清除）。 */
  verified: boolean
}

interface ServerDraft {
  isNew: boolean
  id: string | null
  name: string
  baseUrl: string
  username: string
  token: string
  masked: string
  insecure: boolean
}

interface TestResult {
  ok: boolean
  text: string
}

export interface ServerEditorModalProps {
  run: RunFn
  sessionId: string
  /** 传入服务器为编辑模式；null 为新增模式。 */
  server: PublicServer | null
  /** 保存成功回调，参数为保存的服务器 id（新增为 null），供父组件做后续处理（如失效已验证状态）。 */
  onSaved?(id: string | null): void
  onClose(): void
}

const EMPTY_DRAFT: ServerDraft = { isNew: true, id: null, name: '', baseUrl: '', username: '', token: '', masked: '', insecure: false }

export function ServerEditorModal({ run, sessionId, server, onSaved, onClose }: ServerEditorModalProps) {
  const isNew = !server
  const [draft, setDraft] = useState<ServerDraft>(() => server
    ? { isNew: false, id: server.id, name: server.name, baseUrl: server.baseUrl, username: server.username, token: '', masked: server.tokenMasked || '', insecure: !!server.insecure }
    : { ...EMPTY_DRAFT })
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [testedOk, setTestedOk] = useState(false) // 本次表单测试通过；字段修改后失效

  const setField = (k: keyof Omit<ServerDraft, 'isNew' | 'id' | 'masked' | 'insecure'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestedOk(false)
    setDraft((prev) => ({ ...prev, [k]: e.target.value }))
  }
  const setInsecure = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestedOk(false)
    setDraft((prev) => ({ ...prev, insecure: e.target.checked }))
  }

  const doTest = () => {
    setBusy(true)
    setTestResult(null)
    run(sessionId, { op: 'test', server: { id: draft.id, name: draft.name, baseUrl: draft.baseUrl, username: draft.username, token: draft.token, insecure: !!draft.insecure } })
      .then((r) => {
        const ok = !!(r && r.ok)
        setTestedOk(ok)
        setTestResult(ok
          ? { ok: true, text: t('connected') + ((r.version as string) ? '（Jenkins ' + r.version + '）' : '') }
          : { ok: false, text: tErr(r, t('testFailed')) })
      })
      .catch((e) => {
        setTestedOk(false)
        setTestResult({ ok: false, text: e instanceof Error ? e.message : String(e) })
      })
      .finally(() => setBusy(false))
  }
  const doSave = () => {
    if (!draft.username.trim()) { setFormError(tErr({ code: 'username-required' }, t('saveFailed'))); return }
    setBusy(true)
    setFormError('')
    run(sessionId, { op: 'save', server: { id: draft.id, name: draft.name, baseUrl: draft.baseUrl, username: draft.username, token: draft.token, insecure: !!draft.insecure } })
      .then((r) => {
        if (r && r.ok) { if (onSaved) onSaved(draft.id); onClose() }
        else setFormError(tErr(r, t('saveFailed')))
      })
      .catch((e) => setFormError(e instanceof Error ? e.message : String(e)))
      .finally(() => setBusy(false))
  }

  // 已填写有效地址时，提供跳转 Jenkins 个人安全页创建 Token 的入口（用户名缺省用 admin）
  const tokenBase = draft.baseUrl.trim().replace(/\/+$/, '')
  const canCreateToken = /^https?:\/\//i.test(tokenBase)
  const tokenUrl = canCreateToken
    ? tokenBase + '/user/' + encodeURIComponent((draft.username || '').trim() || 'admin') + '/security/'
    : ''

  return (
    <div className="dshj-backdrop dshj-json-backdrop" onClick={onClose}>
      <div className="dshj-modal dshj-server-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dshj-modal-header">
          <div>
            <div className="dshj-modal-title">{isNew ? t('addTitle') : t('editTitle')}</div>
          </div>
          <button type="button" className="dshj-close" aria-label={t('close')} title={t('close')} onClick={onClose}>✕</button>
        </div>
        <div className="dshj-modal-body">
          <div className="dshj-field">
            <label>{t('nameLabel')}</label>
            <input className="dshj-input" value={draft.name} onChange={setField('name')} placeholder={t('namePlaceholder')} />
          </div>
          <div className="dshj-field">
            <label>{t('urlLabel')}<span className="dshj-req">*</span></label>
            <input className="dshj-input" value={draft.baseUrl} onChange={setField('baseUrl')} placeholder={t('urlPlaceholder')} />
          </div>
          <div className="dshj-field">
            <label>{t('usernameLabel')}<span className="dshj-req">*</span></label>
            <input className="dshj-input" value={draft.username} onChange={setField('username')} placeholder={t('usernamePlaceholder')} />
          </div>
          <div className="dshj-field">
            <label className="dshj-label-row">
              <span>{t('tokenLabel')}<span className="dshj-req">*</span>{draft.isNew ? '' : t('keepToken')}</span>
              {canCreateToken ? (
                <a className="dshj-link-btn" href={tokenUrl} target="_blank" rel="noopener noreferrer" title={tokenUrl}>{t('createToken')} ↗</a>
              ) : null}
            </label>
            <input
              type="password"
              className="dshj-input"
              value={draft.token}
              onChange={setField('token')}
              placeholder={draft.isNew ? t('tokenPlaceholder') : (t('tokenSaved') + (draft.masked || '••••'))}
              autoComplete="off"
            />
          </div>
          <div className="dshj-field">
            <label className="dshj-check">
              <input type="checkbox" checked={!!draft.insecure} onChange={setInsecure} />
              <span>{t('tlsLabel')}</span>
            </label>
          </div>
          {formError ? <div className="dshj-err">{formError}</div> : null}
          {testResult ? <div className={'dshj-result ' + (testResult.ok ? 'dshj-ok' : 'dshj-err')}>{testResult.text}</div> : null}
        </div>
        <div className="dshj-modal-footer">
          <button type="button" className={'dshj-btn' + (testedOk ? ' dshj-btn-success' : '')} disabled={busy} onClick={doTest}>{busy ? t('testing') : t('testBtn')}</button>
          <button type="button" className="dshj-btn" disabled={busy} onClick={onClose}>{t('cancelBtn')}</button>
          <button type="button" className="dshj-btn dshj-btn-primary" disabled={busy} onClick={doSave}>{t('saveBtn')}</button>
        </div>
      </div>
    </div>
  )
}
