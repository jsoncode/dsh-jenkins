/**
 * dsh-jenkins —— 设置 → Jenkins 配置页：服务器管理（settings.section）。
 * 新增 / 编辑服务器在独立弹框（ServerEditorModal）中操作，本页只负责列表与增删入口。
 */

import { useEffect, useState } from 'react'
import { t, tErr } from '../i18n.ts'
import type { RunFn } from '../rpc.ts'
import { ServerEditorModal } from './ServerEditorModal.tsx'
import type { PublicServer } from './ServerEditorModal.tsx'
import { TemplateModal } from './TemplateModal.tsx'

interface TestResult {
  ok: boolean
  text: string
}

export interface SettingsPageProps {
  run: RunFn
  sessionId: string
  onCountChange?: (count: number) => void
}

export function SettingsPage({ run, sessionId, onCountChange }: SettingsPageProps) {
  const [servers, setServers] = useState<PublicServer[]>([])
  const [loading, setLoading] = useState(true)
  const [editor, setEditor] = useState<{ open: boolean; server: PublicServer | null }>({ open: false, server: null })
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({}) // 每台服务器的测试结果（显示在卡片名称后）
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [templateOpen, setTemplateOpen] = useState(false)

  const load = () => {
    setLoading(true)
    run(sessionId, { op: 'list' }).then((r) => {
      if (r && r.ok) {
        const list = (r.servers as PublicServer[]) || []
        setServers(list)
        if (onCountChange) onCountChange(list.length)
      }
    }).catch(() => { }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditor({ open: true, server: null })
  }
  const openEdit = (s: PublicServer) => {
    setEditor({ open: true, server: s })
  }
  const closeEditor = () => setEditor({ open: false, server: null })

  const doDelete = (id: string) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return }
    setConfirmDeleteId(null)
    run(sessionId, { op: 'delete', id }).then((r) => { if (r && r.ok) load() })
  }
  const doTestSaved = (s: PublicServer) => {
    // 测试结果持久化在服务器配置（host 端 verified 字段）；此处同步本地状态即时反馈
    const applyVerified = (ok: boolean): void => {
      setServers((prev) => prev.map((x) => (x.id === s.id ? { ...x, verified: ok } : x)))
    }
    run(sessionId, { op: 'test', server: { id: s.id } })
      .then((r) => {
        const ok = !!(r && r.ok)
        applyVerified(ok)
        setTestResults((prev) => ({ ...prev, [s.id]: ok
          ? { ok: true, text: t('connected') + ((r.version as string) ? '（Jenkins ' + r.version + '）' : '') }
          : { ok: false, text: t('connectionFailed') + tErr(r, t('testFailed')) } }))
      })
      .catch((e) => {
        applyVerified(false)
        setTestResults((prev) => ({ ...prev, [s.id]: { ok: false, text: t('connectionFailed') + (e instanceof Error ? e.message : String(e)) } }))
      })
  }

  return (
    <div className="dshj-settings">
      <div className="dshj-head">
        <div className="dshj-title">{t('settingsTitle')}</div>
        <div className="dshj-head-ops">
          <button
            type="button"
            className="dshj-btn dshj-btn-small"
            title={t('addServer')}
            onClick={openAdd}
          >
            {t('addServer')}
          </button>
          <button
            type="button"
            className="dshj-btn dshj-btn-small"
            title={t('projectConfigBtn')}
            onClick={() => setTemplateOpen(true)}
          >
            {t('projectConfigBtn')}
          </button>
        </div>
      </div>
      {templateOpen ? <TemplateModal onClose={() => setTemplateOpen(false)} /> : null}
      {editor.open ? (
        <ServerEditorModal
          run={run}
          sessionId={sessionId}
          server={editor.server}
          onSaved={() => load()} // 编辑保存后 host 已清除该服务器 verified，重新拉取列表
          onClose={closeEditor}
        />
      ) : null}
      {loading ? <div className="dshj-empty">{t('loading')}</div>
        : servers.length === 0 ? (
          <div className="dshj-empty">
            <div>{t('serverEmpty')}</div>
            <button type="button" className="dshj-btn dshj-btn-small" onClick={openAdd} style={{ marginTop: 10 }}>{t('addServer')}</button>
          </div>
        ) : (
          <div className="dshj-list">
            {servers.map((s) => {
              // 名称后的连接状态：优先显示本次会话的测试结果（成功绿/失败红），
              // 无测试结果但有持久化 verified 时显示「连接成功」；其余不显示。
              const tr = testResults[s.id]
              const statusText = tr ? tr.text : (s.verified ? t('connected') : '')
              const statusOk = tr ? tr.ok : s.verified
              return (
                <div key={s.id} className="dshj-card">
                  <div className="dshj-card-main">
                    <div className="dshj-card-name-row">
                      <span className="dshj-card-name">{s.name}</span>
                      {statusText ? (
                        <span className={'dshj-card-test ' + (statusOk ? 'dshj-ok' : 'dshj-err')}>{statusText}</span>
                      ) : null}
                    </div>
                    <div className="dshj-card-meta">{s.baseUrl + '  ·  ' + s.username + '  ·  ' + (s.tokenMasked || '')}</div>
                  </div>
                  <div className="dshj-card-ops">
                    <button type="button" className="dshj-btn dshj-btn-small" onClick={() => doTestSaved(s)}>{t('testBtn')}</button>
                    <button type="button" className="dshj-btn dshj-btn-small" onClick={() => openEdit(s)}>{t('editBtn')}</button>
                    <button
                      type="button"
                      className={'dshj-btn dshj-btn-small dshj-btn-danger' + (confirmDeleteId === s.id ? ' dshj-btn-solid' : '')}
                      onClick={() => doDelete(s.id)}
                    >
                      {confirmDeleteId === s.id ? t('confirmDelete') : t('deleteBtn')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
