/**
 * dsh-jenkins —— 项目配置弹框：集中式 map（`$DSH_HOME/dsh-jenkins-map.json`）的唯一编辑入口。
 *
 * 两个 tab：
 * - **表单**：项目紧凑列表（项目名 + 每个环境一行：环境名 / Job / 服务器 / 参数），
 *   - 环境**数量不限**（不再假定只有 UAT / 生产两项），每行可单独删除；
 *   - 环境名（`name`）选填，留空按下标回退 UAT / 生产 / 环境 N，发布时用于服务器下拉标签；
 *   - 环境参数收在「N 项参数」里点开才展开 —— 默认视图保持轻量。
 * - **JSON**：整个 map 的 JSON 直接编辑（与文件格式一致，可整段粘贴/导出）。
 *
 * 底部固定操作：`[ ] 覆盖同名项目` + `重新发现`（扫描已打开工作区的
 * dsh-jenkins.json/js/ts，以文件夹名为项目名合并进 map）；取消 / 保存。
 */

import { useMemo, useState } from 'react'
import { t } from '../i18n.ts'
import type { RunFn } from '../rpc.ts'
import { envLabel, projectOpError, sanitizeProjects, type ProjectConfigMap, type ProjectTarget } from '../projects.ts'
import { ModalPortal } from './ModalPortal.tsx'

type ParamType = 'string' | 'number' | 'boolean'

interface ParamDraft { key: string; value: string; type: ParamType }
interface TargetDraft { name: string; job: string; server: string; params: ParamDraft[] }
interface ProjectDraft { name: string; targets: TargetDraft[] }
/** 宿主「重新发现」逐工作区结果。 */
interface DiscoverResult {
  cwd?: string
  name?: string
  ok?: boolean
  count?: number
  file?: string
  reason?: string
}

export interface ProjectMapModalProps {
  run: RunFn
  sessionId: string
  /** 已打开的服务器（服务器字段「选择服务器」候选）。 */
  servers: Array<{ id: string; name: string; baseUrl: string }>
  /** 已打开的工作区路径（重新发现的扫描范围）。 */
  workspaces: string[]
  /** 宿主返回的项目配置文件绝对路径（展示用）。 */
  mapPath?: string
  /** 初始 map（弹框打开时已由调用方加载，避免二次请求）。 */
  initial: ProjectConfigMap
  onSaved(map: ProjectConfigMap): void
  onClose(): void
}

const draftType = (value: string | number | boolean): ParamType =>
  typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string'

/** map → 表单草稿（保持项目与环境顺序）。 */
const toDrafts = (map: ProjectConfigMap): ProjectDraft[] =>
  Object.keys(map).map((name) => ({
    name,
    targets: (map[name] || []).map((target): TargetDraft => ({
      name: target.name || '',
      job: target.job || '',
      server: target.server || '',
      params: Object.keys(target.environments || {}).map((key) => ({
        key,
        value: String((target.environments || {})[key]),
        type: draftType((target.environments || {})[key]),
      })),
    })),
  }))

/** 表单草稿 → map（按类型还原 string / number / boolean；空 name 不写字段）。 */
const toMap = (drafts: ProjectDraft[]): ProjectConfigMap => {
  const map: ProjectConfigMap = {}
  for (const draft of drafts) {
    const name = draft.name.trim()
    if (!name) continue
    map[name] = draft.targets
      .filter((target) => target.job.trim() || target.server.trim())
      .map((target): ProjectTarget => {
        const environments: Record<string, string | number | boolean> = {}
        for (const param of target.params) {
          const key = param.key.trim()
          if (!key) continue
          if (param.type === 'boolean') environments[key] = String(param.value).trim() === 'true'
          else if (param.type === 'number') {
            const num = Number(param.value)
            environments[key] = param.value.trim() !== '' && Number.isFinite(num) ? num : param.value
          } else environments[key] = param.value
        }
        const out: ProjectTarget = { job: target.job.trim(), server: target.server.trim(), environments }
        const envName = target.name.trim()
        if (envName) out.name = envName
        return out
      })
  }
  return map
}

/** 保存前校验：项目名唯一且非空、每项都有 job + server。返回错误文案（无错返回 ''）。 */
function validate(drafts: ProjectDraft[]): string {
  const seen = new Set<string>()
  for (let i = 0; i < drafts.length; i += 1) {
    const draft = drafts[i]
    const name = draft.name.trim()
    if (!name) return t('projectNameRequired')
    if (seen.has(name)) return t('projectNameDup', { name })
    seen.add(name)
    if (draft.targets.length === 0) return t('projectTargetsRequired', { name })
    for (let j = 0; j < draft.targets.length; j += 1) {
      const target = draft.targets[j]
      if (!target.job.trim() || !target.server.trim()) {
        // 报错用环境的显示名（name，缺省按下标回退）
        return t('projectTargetIncomplete', { name, n: String(target.name || '').trim() || envLabel(j) })
      }
    }
  }
  return ''
}

export function ProjectMapModal({ run, sessionId, servers, workspaces, mapPath, initial, onSaved, onClose }: ProjectMapModalProps) {
  const [drafts, setDrafts] = useState<ProjectDraft[]>(() => toDrafts(initial))
  const [mode, setMode] = useState<'form' | 'json'>('form')
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [openParams, setOpenParams] = useState<string>('') // `${项目序号}:${环境序号}` → 展开参数编辑
  const [overwrite, setOverwrite] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const serverOptions = useMemo(
    () => (Array.isArray(servers) ? servers : []).map((s) => ({ id: s.baseUrl, label: s.name + (s.baseUrl && s.name !== s.baseUrl ? ' · ' + s.baseUrl : '') })),
    [servers],
  )

  /* ── 表单编辑 ─────────────────────────────────────────────── */

  const patchProject = (index: number, patch: Partial<ProjectDraft>): void =>
    setDrafts((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  const patchTarget = (index: number, targetIndex: number, patch: Partial<TargetDraft>): void =>
    setDrafts((prev) => prev.map((item, i) => (i === index
      ? { ...item, targets: item.targets.map((target, j) => (j === targetIndex ? { ...target, ...patch } : target)) }
      : item)))
  const addProject = (): void => setDrafts((prev) => prev.concat([{ name: '', targets: [{ name: '', job: '', server: '', params: [] }] }]))
  const removeProject = (index: number): void => setDrafts((prev) => prev.filter((_, i) => i !== index))
  const addTarget = (index: number): void =>
    setDrafts((prev) => prev.map((item, i) => (i === index ? { ...item, targets: item.targets.concat([{ name: '', job: '', server: '', params: [] }]) } : item)))
  const removeTarget = (index: number, targetIndex: number): void =>
    setDrafts((prev) => prev.map((item, i) => (i === index ? { ...item, targets: item.targets.filter((_, j) => j !== targetIndex) } : item)))
  const addParam = (index: number, targetIndex: number): void =>
    setDrafts((prev) => prev.map((item, i) => (i === index
      ? { ...item, targets: item.targets.map((target, j) => (j === targetIndex ? { ...target, params: target.params.concat([{ key: '', value: '', type: 'string' as ParamType }]) } : target)) }
      : item)))
  const patchParam = (index: number, targetIndex: number, paramIndex: number, patch: Partial<ParamDraft>): void =>
    setDrafts((prev) => prev.map((item, i) => (i === index
      ? { ...item, targets: item.targets.map((target, j) => (j === targetIndex ? { ...target, params: target.params.map((p, k) => (k === paramIndex ? { ...p, ...patch } : p)) } : target)) }
      : item)))
  const removeParam = (index: number, targetIndex: number, paramIndex: number): void =>
    setDrafts((prev) => prev.map((item, i) => (i === index
      ? { ...item, targets: item.targets.map((target, j) => (j === targetIndex ? { ...target, params: target.params.filter((_, k) => k !== paramIndex) } : target)) }
      : item)))

  /* ── JSON 编辑 ────────────────────────────────────────────── */

  const switchMode = (next: 'form' | 'json'): void => {
    if (next === 'json') {
      setJsonText(JSON.stringify(toMap(drafts), null, 2))
      setJsonError('')
    }
    setMode(next)
    setError('')
    setNote('')
  }
  /** 解析 JSON 文本为草稿；失败设置错误并返回 null。 */
  const parseJson = (text: string): ProjectDraft[] | null => {
    let raw: unknown
    try {
      raw = JSON.parse(text.replace(/^\uFEFF/, ''))
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : String(e))
      return null
    }
    const map = sanitizeProjects(raw)
    if (Object.keys(map).length === 0 && JSON.stringify(raw).replace(/[\s{}[\]]/g, '') !== '') {
      setJsonError(t('projectInvalidTargets'))
      return null
    }
    setJsonError('')
    return toDrafts(map)
  }
  const applyJson = (): void => {
    const parsed = parseJson(jsonText)
    if (parsed === null) return
    setDrafts(parsed)
    setNote(t('jsonApplied'))
  }

  /* ── 保存 / 重新发现 ──────────────────────────────────────── */

  const save = async (): Promise<void> => {
    if (busy) return
    let effective = drafts
    if (mode === 'json') {
      const parsed = parseJson(jsonText)
      if (parsed === null) return
      effective = parsed
    }
    const problem = validate(effective)
    if (problem) { setError(problem); return }
    setBusy(true)
    setError('')
    setNote('')
    try {
      const res = await run(sessionId, { op: 'mapSave', map: toMap(effective) })
      if (res && res.ok) {
        onSaved(sanitizeProjects(res.map))
        onClose()
      } else {
        setError(projectOpError(res, t('saveFailed')))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const discover = async (): Promise<void> => {
    if (busy) return
    setBusy(true)
    setError('')
    setNote('')
    try {
      const res = await run(sessionId, { op: 'mapDiscover', cwds: workspaces, overwrite })
      if (!(res && res.ok)) { setError(projectOpError(res, t('saveFailed'))); return }
      const map = sanitizeProjects(res.map)
      setDrafts(toDrafts(map))
      if (mode === 'json') setJsonText(JSON.stringify(map, null, 2))
      const added = Array.isArray(res.added) ? (res.added as string[]) : []
      const updated = Array.isArray(res.updated) ? (res.updated as string[]) : []
      const results = Array.isArray(res.results) ? (res.results as DiscoverResult[]) : []
      const parts: string[] = []
      if (added.length > 0) parts.push(t('discoverAdded', { names: added.join('、') }))
      if (updated.length > 0) parts.push(t('discoverUpdated', { names: updated.join('、') }))
      if (parts.length === 0) {
        const found = results.filter((r) => r.ok).length
        parts.push(found > 0 ? t('discoverNothingNew', { n: found }) : t('discoverNoConfig'))
      }
      setNote(parts.join('；'))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <ModalPortal backdropClass="dshj-json-backdrop" modalClass="dshj-project-modal" onBackdropClose={onClose}>
      <div className="dshj-modal-header">
        <div>
          <div className="dshj-modal-title">{t('projectsTitle')}</div>
          <div className="dshj-modal-sub">{mapPath || 'dsh-jenkins-map.json'}</div>
        </div>
        <div className="dshj-tabs dshj-config-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'form'}
            className={'dshj-tab' + (mode === 'form' ? ' dshj-tab-active' : '')}
            onClick={() => switchMode('form')}
          >{t('formModeBtn')}</button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'json'}
            className={'dshj-tab' + (mode === 'json' ? ' dshj-tab-active' : '')}
            onClick={() => switchMode('json')}
          >{t('jsonModeBtn')}</button>
        </div>
        <button type="button" className="dshj-close" aria-label={t('close')} title={t('close')} onClick={onClose}>✕</button>
      </div>
      <div className="dshj-modal-body dshj-project-body">
        {mode === 'json' ? (
          <div className="dshj-project-json">
            <textarea
              className="dshj-textarea dshj-project-json-text"
              spellCheck={false}
              placeholder={t('importPlaceholder')}
              value={jsonText}
              onChange={(e) => { setJsonText(e.target.value); setJsonError(''); setNote('') }}
            />
            <div className="dshj-project-jsonbar">
              <span className="dshj-hint">{t('projectJsonHint')}</span>
              <button type="button" className="dshj-btn dshj-btn-small" onClick={applyJson}>{t('applyJsonBtn')}</button>
            </div>
            {jsonError ? <div className="dshj-err">{t('configParseFailed') + '：' + jsonError}</div> : null}
          </div>
        ) : (
          <div className="dshj-project-list">
            {/* 服务器输入框的候选（datalist 只渲染一次，避免重复 id） */}
            <datalist id="dshj-project-servers">
              {serverOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </datalist>
            {drafts.length === 0 ? <div className="dshj-empty">{t('projectsEmpty')}</div> : null}
            {drafts.map((draft, index) => (
              <div className="dshj-project-item" key={index}>
                <div className="dshj-project-item-head">
                  <input
                    className="dshj-input dshj-project-name"
                    value={draft.name}
                    placeholder={t('projectNamePlaceholder')}
                    onChange={(e) => patchProject(index, { name: e.target.value })}
                  />
                  <button type="button" className="dshj-btn dshj-btn-small dshj-btn-danger" onClick={() => removeProject(index)}>{t('deleteBtn')}</button>
                </div>
                {draft.targets.map((target, targetIndex) => {
                  const paramsKey = index + ':' + targetIndex
                  const paramsOpen = openParams === paramsKey
                  const shown = String(target.name || '').trim() || envLabel(targetIndex)
                  return (
                    <div className="dshj-project-env" key={targetIndex}>
                      {/* 环境显示名（选填）：发布时用于服务器下拉标签 / 历史记录；
                          留空则按下标回退，placeholder 直接显示回退值（UAT / 生产 / 环境 N） */}
                      <input
                        className="dshj-input dshj-env-name-input"
                        value={target.name || ''}
                        placeholder={envLabel(targetIndex)}
                        title={t('targetNameHint')}
                        onChange={(e) => patchTarget(index, targetIndex, { name: e.target.value })}
                      />
                      <input
                        className="dshj-input"
                        value={target.job}
                        placeholder={t('jobPathLabel')}
                        onChange={(e) => patchTarget(index, targetIndex, { job: e.target.value })}
                      />
                      <input
                        className="dshj-input dshj-project-server"
                        value={target.server}
                        placeholder={t('targetServerPlaceholder')}
                        list="dshj-project-servers"
                        onChange={(e) => patchTarget(index, targetIndex, { server: e.target.value })}
                      />
                      <button
                        type="button"
                        className={'dshj-btn dshj-btn-small dshj-param-toggle' + (paramsOpen ? ' dshj-btn-active' : '')}
                        title={t('envParamsLabel')}
                        onClick={() => setOpenParams(paramsOpen ? '' : paramsKey)}
                      >{t('paramCount', { n: target.params.length })}</button>
                      {/* 每个环境都能单独删除（数量不限，仅保留最后一个时禁用） */}
                      <button
                        type="button"
                        className="dshj-btn-icon dshj-target-del"
                        title={t('removeTarget', { name: shown })}
                        disabled={draft.targets.length <= 1}
                        onClick={() => removeTarget(index, targetIndex)}
                      >✕</button>
                    </div>
                  )
                })}
                <div className="dshj-project-item-ops">
                  <button type="button" className="dshj-btn dshj-btn-small" onClick={() => addTarget(index)}>{t('addTargetBtn')}</button>
                  <span className="dshj-project-env-count">{t('envCount', { n: draft.targets.length })}</span>
                </div>
                {/* 参数编辑：按环境展开（默认收起，保持列表轻量） */}
                {draft.targets.map((target, targetIndex) => {
                  if (openParams !== index + ':' + targetIndex) return null
                  return (
                    <div className="dshj-param-box" key={'p' + targetIndex}>
                      {target.params.map((param, paramIndex) => (
                        <div className="dshj-param-row" key={paramIndex}>
                          <input
                            className="dshj-input"
                            value={param.key}
                            placeholder={t('paramKeyPlaceholder')}
                            onChange={(e) => patchParam(index, targetIndex, paramIndex, { key: e.target.value })}
                          />
                          <input
                            className="dshj-input"
                            value={param.value}
                            placeholder={t('paramValuePlaceholder')}
                            onChange={(e) => patchParam(index, targetIndex, paramIndex, { value: e.target.value })}
                          />
                          <select
                            className="dshj-select dshj-param-type"
                            value={param.type}
                            onChange={(e) => patchParam(index, targetIndex, paramIndex, { type: e.target.value as ParamType })}
                          >
                            <option value="string">{t('paramTypeText')}</option>
                            <option value="number">{t('paramTypeNumber')}</option>
                            <option value="boolean">{t('paramTypeBool')}</option>
                          </select>
                          <button type="button" className="dshj-btn-icon dshj-param-del" title={t('deleteBtn')} onClick={() => removeParam(index, targetIndex, paramIndex)}>✕</button>
                        </div>
                      ))}
                      {target.params.length === 0 ? <div className="dshj-target-params-empty">{t('paramNone')}</div> : null}
                      <button type="button" className="dshj-btn dshj-btn-small" onClick={() => addParam(index, targetIndex)}>{t('addParamBtn')}</button>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
        {error ? <div className="dshj-err">{error}</div> : null}
        {note ? <div className="dshj-ok">{note}</div> : null}
      </div>
      <div className="dshj-modal-footer">
        <label className="dshj-check dshj-project-overwrite" title={t('discoverOverwriteHint')}>
          <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />
          <span>{t('discoverOverwrite')}</span>
        </label>
        <button type="button" className="dshj-link-btn" disabled={busy || workspaces.length === 0} title={t('discoverHint')} onClick={() => void discover()}>
          {busy ? t('saving') : t('discoverBtn')}
        </button>
        {mode === 'form' ? (
          <button type="button" className="dshj-btn" onClick={addProject}>{t('addProject')}</button>
        ) : null}
        <button type="button" className="dshj-btn" onClick={onClose}>{t('cancelBtn')}</button>
        <button type="button" className="dshj-btn dshj-btn-primary" disabled={busy} onClick={() => void save()}>
          {busy ? t('saving') : t('saveBtn')}
        </button>
      </div>
    </ModalPortal>
  )
}
