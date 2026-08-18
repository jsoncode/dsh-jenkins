/**
 * dsh-jenkins —— 设置 → Jenkins 配置页：服务器管理（settings.section）。
 */

import { useEffect, useState } from 'react'
import { t, tErr } from '../i18n.ts'
import type { RunFn } from '../rpc.ts'
import { TemplateSection } from './TemplateSection.tsx'
import { SvgPlus } from './SvgIcons.tsx'

interface PublicServer {
  id: string
  name: string
  baseUrl: string
  username: string
  tokenMasked: string
  hasToken: boolean
  insecure: boolean
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

export interface SettingsPageProps {
  run: RunFn
  sessionId: string
}

export function SettingsPage({ run, sessionId }: SettingsPageProps) {
  const [servers, setServers] = useState<PublicServer[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ServerDraft | null>(null)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [templateOpen, setTemplateOpen] = useState(false)

  const load = () => {
    setLoading(true)
    run(sessionId, { op: 'list' }).then((r) => {
      if (r && r.ok) setServers((r.servers as PublicServer[]) || [])
    }).catch(() => { }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  // 空列表时自动显示“添加服务器”表单，无需空态提示。
  const EMPTY_DRAFT: ServerDraft = { isNew: true, id: null, name: '', baseUrl: '', username: '', token: '', masked: '', insecure: false }
  const draft = editing || EMPTY_DRAFT

  const startAdd = () => {
    setEditing({ ...EMPTY_DRAFT })
    setFormError('')
    setTestResult(null)
  }
  const startEdit = (s: PublicServer) => {
    setEditing({ isNew: false, id: s.id, name: s.name, baseUrl: s.baseUrl, username: s.username, token: '', masked: s.tokenMasked || '', insecure: !!s.insecure })
    setFormError('')
    setTestResult(null)
  }
  const setField = (k: keyof Omit<ServerDraft, 'isNew' | 'id' | 'masked' | 'insecure'>) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditing((prev) => ({ ...(prev || EMPTY_DRAFT), [k]: e.target.value }))
  const setInsecure = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditing((prev) => ({ ...(prev || EMPTY_DRAFT), insecure: e.target.checked }))

  const doTest = () => {
    setBusy(true)
    setTestResult(null)
    run(sessionId, { op: 'test', server: { id: draft.id, name: draft.name, baseUrl: draft.baseUrl, username: draft.username, token: draft.token, insecure: !!draft.insecure } })
      .then((r) => setTestResult(r && r.ok
        ? { ok: true, text: t('connected') + ((r.version as string) ? '（Jenkins ' + r.version + '）' : '') }
        : { ok: false, text: tErr(r, t('testFailed')) }))
      .catch((e) => setTestResult({ ok: false, text: e instanceof Error ? e.message : String(e) }))
      .finally(() => setBusy(false))
  }
  const doSave = () => {
    setBusy(true)
    setFormError('')
    run(sessionId, { op: 'save', server: { id: draft.id, name: draft.name, baseUrl: draft.baseUrl, username: draft.username, token: draft.token, insecure: !!draft.insecure } })
      .then((r) => {
        if (r && r.ok) { setEditing(null); load() }
        else setFormError(tErr(r, t('saveFailed')))
      })
      .catch((e) => setFormError(e instanceof Error ? e.message : String(e)))
      .finally(() => setBusy(false))
  }
  const doDelete = (id: string) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return }
    setConfirmDeleteId(null)
    run(sessionId, { op: 'delete', id }).then((r) => { if (r && r.ok) load() })
  }
  const doTestSaved = (s: PublicServer) => {
    setTestResult(null)
    run(sessionId, { op: 'test', server: { id: s.id } })
      .then((r) => setTestResult(r && r.ok
        ? { ok: true, text: t('connected') + '：' + s.name + ((r.version as string) ? '（Jenkins ' + r.version + '）' : '') }
        : { ok: false, text: t('connectionFailed') + s.name + '：' + tErr(r, t('testFailed')) }))
      .catch((e) => setTestResult({ ok: false, text: t('connectionFailed') + s.name + '：' + (e instanceof Error ? e.message : String(e)) }))
  }

  return (
    <div className="dshj-settings">
      <div className="dshj-head">
        <div className="dshj-title-row">
          <div className="dshj-title">{t('settingsTitle')}</div>
          <button
            type="button"
            className="dshj-btn-icon"
            title={t('addServer')}
            aria-label={t('addServer')}
            onClick={startAdd}
          >
            <SvgPlus size={16} />
          </button>
          <button
            type="button"
            className={'dshj-btn dshj-btn-small' + (templateOpen ? ' dshj-btn-active' : '')}
            onClick={() => setTemplateOpen((v) => !v)}
          >
            {t('templateBtn')}
          </button>
        </div>
      </div>
      {testResult ? <div className={'dshj-result ' + (testResult.ok ? 'dshj-ok' : 'dshj-err')}>{testResult.text}</div> : null}
      {templateOpen ? <TemplateSection /> : null}
      {(editing || servers.length === 0) && !loading ? (
        <div className="dshj-editor">
          <div className="dshj-editor-title">{draft.isNew ? t('addTitle') : t('editTitle')}</div>
          <div className="dshj-field">
            <label>{t('nameLabel')}</label>
            <input className="dshj-input" value={draft.name} onChange={setField('name')} placeholder={t('namePlaceholder')} />
          </div>
          <div className="dshj-field">
            <label>{t('urlLabel')}<span className="dshj-req">*</span></label>
            <input className="dshj-input" value={draft.baseUrl} onChange={setField('baseUrl')} placeholder={t('urlPlaceholder')} />
          </div>
          <div className="dshj-field">
            <label>{t('usernameLabel')}</label>
            <input className="dshj-input" value={draft.username} onChange={setField('username')} placeholder={t('usernamePlaceholder')} />
          </div>
          <div className="dshj-field">
            <label>{t('tokenLabel')}<span className="dshj-req">*</span>{draft.isNew ? '' : t('keepToken')}</label>
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
          <div className="dshj-editor-ops">
            <button type="button" className="dshj-btn" disabled={busy} onClick={doTest}>{busy ? t('testing') : t('testBtn')}</button>
            <button type="button" className="dshj-btn dshj-btn-primary" disabled={busy} onClick={doSave}>{t('saveBtn')}</button>
            <button type="button" className="dshj-btn" disabled={busy} onClick={() => setEditing(null)}>{t('cancelBtn')}</button>
          </div>
        </div>
      ) : null}
      {loading ? <div className="dshj-empty">{t('loading')}</div>
        : servers.length === 0 ? null
          : (
            <div className="dshj-list">
              {servers.map((s) => (
                <div key={s.id} className="dshj-card">
                  <div className="dshj-card-main">
                    <div className="dshj-card-name">{s.name}</div>
                    <div className="dshj-card-meta">{s.baseUrl + '  ·  ' + s.username + '  ·  ' + (s.tokenMasked || '')}</div>
                  </div>
                  <div className="dshj-card-ops">
                    <button type="button" className="dshj-btn dshj-btn-small" onClick={() => doTestSaved(s)}>{t('testBtn')}</button>
                    <button type="button" className="dshj-btn dshj-btn-small" onClick={() => startEdit(s)}>{t('editBtn')}</button>
                    <button
                      type="button"
                      className={'dshj-btn dshj-btn-small' + (confirmDeleteId === s.id ? ' dshj-btn-danger' : '')}
                      onClick={() => doDelete(s.id)}
                    >
                      {confirmDeleteId === s.id ? t('confirmDelete') : t('deleteBtn')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  )
}
