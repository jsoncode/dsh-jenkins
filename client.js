/**
 * dsh-jenkins-cli —— 浏览器半边（client bundle）
 *
 * 格式：window.__ModuleLoader__.load({ id, factory }) —— 执行 bundle 只注册工厂，
 * 工厂在物化时运行并导出 { name, inject, apply }（参考 @lemcae/dsh-balance）。
 *
 * 功能：
 * 1. 设置 → Jenkins 页：多服务器管理（settings.section）。
 * 2. 侧边栏底部按钮（sidebar.footer.action）：当前工作区根目录存在
 *    dsh-jenkins-cli.{json,js,ts} 配置时显示，点击打开「执行 Jenkins Job」弹框。
 * 3. 弹框（shell.overlay）：环境 Tab（dev/uat/prod…）切换 → 参数表单回显 →
 *    触发构建 → 轮询状态（ctx.interval）。
 *
 * 与宿主通信：ctx.remote.commands.execute(sessionId, '/dsh-jenkins-cli <json>')。
 * 本文件不含任何绝对路径。
 */
window.__ModuleLoader__.load({
  id: 'dsh-jenkins-cli',
  factory: (require) => {
    const React = require('react')
    const module = { exports: {} }
    const exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    // ── 注入样式（与 dsh-balance 相同的 bundle CSS 注入模式）──
    const CSS_ID = 'dsh-jenkins-cli/settings.css'
    const css = [
      // 通用
      '.dshj-btn{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 14px;font-size:13px;cursor:pointer}',
      '.dshj-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}',
      '.dshj-btn:disabled{opacity:.5;cursor:not-allowed}',
      '.dshj-btn-primary{background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3));border-color:transparent;color:var(--dsw-alias-label-primary-foreground,#fff)}',
      '.dshj-btn-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-brand-primary,#1668e3))}',
      '.dshj-btn-capsule{border-radius:999px;background:transparent;border-color:var(--dsw-alias-brand-primary,#1668e3);color:var(--dsw-alias-brand-primary,#1668e3)}',
      '.dshj-btn-capsule:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1))}',
      '.dshj-btn-danger{color:var(--dsw-alias-state-error-primary);border-color:currentColor}',
      '.dshj-btn-small{padding:3px 10px;font-size:12px}',
      '.dshj-err{color:var(--dsw-alias-state-error-primary,#d33);font-size:13px;margin:8px 0}',
      '.dshj-ok{color:var(--dsw-alias-state-success-primary,#2a7d3c);font-size:13px;margin:8px 0}',
      '.dshj-warn{color:var(--dsw-alias-state-warn-primary,#b8860b)}',
      '.dshj-empty{padding:28px 16px;text-align:center;color:var(--dsw-alias-label-secondary,#888);font-size:13px}',
      '.dshj-input,.dshj-select,.dshj-textarea{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#222);border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:8px;padding:7px 10px;font-size:13px;font-family:inherit}',
      '.dshj-input:focus,.dshj-select:focus,.dshj-textarea:focus{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-1px;border-color:transparent}',
      '.dshj-field{margin-bottom:12px}',
      '.dshj-field>label{display:block;font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666);margin-bottom:4px}',
      '.dshj-check{display:inline-flex;align-items:center;gap:8px;font-size:13px;cursor:pointer}',
      '.dshj-form-ops{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}',
      // 侧边栏底部入口
      '.dshj-footer-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:28px;padding:0 8px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#888);cursor:pointer;font-size:12px;box-sizing:border-box}',
      '.dshj-footer-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));color:var(--dsw-alias-label-primary,#222)}',
      '.dshj-footer-btn-rail{width:36px;height:36px;padding:0;border-radius:50%}',
      '.dshj-footer-label{white-space:nowrap}',
      // 弹框
      '.dshj-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;pointer-events:auto}',
      '.dshj-modal{background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.28);width:720px;max-width:100%;max-height:84vh;display:flex;flex-direction:column;overflow:hidden;color:var(--dsw-alias-label-primary,#222);font-size:14px}',
      '.dshj-modal-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);flex:none}',
      '.dshj-modal-title{font-size:15px;font-weight:600}',
      '.dshj-modal-sub{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:2px;word-break:break-all}',
      '.dshj-close{border:none;background:transparent;color:var(--dsw-alias-label-secondary,#888);font-size:16px;cursor:pointer;padding:4px 8px;border-radius:6px}',
      '.dshj-close:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));color:var(--dsw-alias-label-primary,#222)}',
      '.dshj-tabs{display:flex;gap:6px;padding:10px 18px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);overflow-x:auto;flex:none}',
      '.dshj-tab{padding:5px 12px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,#666);font-size:13px;cursor:pointer;white-space:nowrap}',
      '.dshj-tab:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1))}',
      '.dshj-tab-active{background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3));color:var(--dsw-alias-label-primary-foreground,#fff);border-color:transparent;font-weight:500}',
      '.dshj-modal-body{flex:1;overflow-y:auto;padding:16px 18px;min-width:0}',
      '.dshj-job-title{font-size:15px;font-weight:600;margin-bottom:2px;word-break:break-all}',
      '.dshj-job-sub{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-bottom:14px}',
      '.dshj-desc{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:3px}',
      '.dshj-spinner{width:14px;height:14px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2,#ccc);border-top-color:var(--dsw-alias-brand-primary,#1668e3);animation:dshj-spin .8s linear infinite;margin:12px 0}',
      '@keyframes dshj-spin{to{transform:rotate(360deg)}}',
      '.dshj-run-title{font-size:15px;font-weight:600;margin-bottom:8px}',
      '.dshj-run-message{font-size:13px;margin-bottom:12px}',
      '.dshj-run-line{margin:4px 0;font-size:13px}',
      '.dshj-link{color:var(--dsw-alias-brand-primary,#1668e3);text-decoration:none}',
      '.dshj-link:hover{text-decoration:underline}',
      // 设置页
      '.dshj-settings{display:flex;flex-direction:column;gap:12px}',
      '.dshj-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}',
      '.dshj-title{font-size:14px;font-weight:600}',
      '.dshj-actions{display:flex;gap:8px;flex-wrap:wrap}',
      '.dshj-list{display:flex;flex-direction:column;gap:8px}',
      '.dshj-card{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-2,#fafafa)}',
      '.dshj-card-main{min-width:0}',
      '.dshj-card-name{font-size:13px;font-weight:600}',
      '.dshj-card-meta{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:2px;word-break:break-all}',
      '.dshj-card-ops{display:flex;gap:6px;flex:none;flex-wrap:wrap}',
      '.dshj-editor{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:14px 16px;background:var(--dsw-alias-bg-layer-2,#fafafa)}',
      '.dshj-editor-title{font-size:13px;font-weight:600;margin-bottom:12px}',
      '.dshj-editor-ops{display:flex;gap:8px;margin-top:4px;flex-wrap:wrap}',
      '.dshj-result{font-size:12px;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-2,#fafafa);margin-top:8px}',
    ].join('\n')
    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + CSS_ID + '"]') === null) {
      const tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-jenkins-cli'
      tag.dataset.pluginCss = CSS_ID
      tag.textContent = css
      document.head.appendChild(tag)
    }

    const name = 'dsh-jenkins-cli'
    const inject = ['slots', 'remote', 'remote.commands', 'timer']

    // ── 与宿主通信：commands.execute → JSON 文本 → 结果载荷 ──────────
    function makeRun(ctx) {
      return async function run(sessionId, op) {
        try {
          const execution = await ctx.remote.commands.execute(sessionId || '', '/dsh-jenkins-cli ' + JSON.stringify(op))
          const value = execution && execution.ok === true ? execution.value : undefined
          const text = value && value.result && typeof value.result.text === 'string' ? value.result.text : null
          if (text === null || text.length === 0) return { ok: false, error: '命令未返回结果' }
          try { return JSON.parse(text) } catch { return { ok: false, error: text.slice(0, 200) } }
        } catch (e) {
          return { ok: false, error: (e && e.message) || String(e) }
        }
      }
    }

    // ── 弹框开关（footer 按钮 ↔ overlay 弹框共享）────────────────────
    function makeStore() {
      const store = {
        launch: null, // { cwd, config }
        listeners: [],
        emit() { for (let i = 0; i < this.listeners.length; i++) this.listeners[i]() },
        subscribe(l) { this.listeners.push(l); return () => { const i = this.listeners.indexOf(l); if (i >= 0) this.listeners.splice(i, 1) } },
        open(launch) { this.launch = launch; this.emit() },
        close() { this.launch = null; this.emit() },
      }
      const useLaunch = () => {
        const [v, setV] = React.useState(store.launch)
        React.useEffect(() => store.subscribe(() => setV(store.launch)), [])
        return v
      }
      return { store, useLaunch }
    }

    const fmtDur = (ms) => {
      if (!ms || ms < 0) return '—'
      const s = Math.floor(ms / 1000)
      if (s < 60) return s + ' 秒'
      const m = Math.floor(s / 60)
      if (m < 60) return m + ' 分 ' + (s % 60) + ' 秒'
      const h = Math.floor(m / 60)
      return h + ' 时 ' + (m % 60) + ' 分'
    }

    const SvgPlay = ({ size }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
      React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
      React.createElement('polygon', { points: '10 8 16 12 10 16 10 8', fill: 'currentColor', stroke: 'none' }),
    )

    function apply(ctx) {
      const run = makeRun(ctx)
      const { store, useLaunch } = makeStore()
      const slots = ctx.get('slots')
      if (slots === undefined) return
      const el = React.createElement

      // ─── 侧边栏底部入口：当前工作区有 dsh-jenkins-cli 配置才显示 ──────────

      const FooterButton = (props) => {
        const wide = !!props.wide
        const workspaceItems = props.useWorkspaces
          ? props.useWorkspaces((s) => (s && s.items) || [])
          : []
        const currentSessionId = props.useSessions
          ? props.useSessions((s) => s && s.current)
          : null
        const [launch, setLaunch] = React.useState(null)
        const cwd = React.useMemo(() => {
          const list = Array.isArray(workspaceItems) ? workspaceItems : []
          const current = list.find((w) => Array.isArray(w.sessionIds) && w.sessionIds.indexOf(currentSessionId) !== -1)
          return (current && current.path) || (list.length ? list[0].path : null)
        }, [workspaceItems, currentSessionId])
        React.useEffect(() => {
          let alive = true
          setLaunch(null)
          if (!cwd) return
          run(currentSessionId || '', { op: 'workspaceConfig', cwd }).then((r) => {
            if (!alive) return
            if (r && r.ok && r.found && r.config) setLaunch({ cwd, config: r.config, sessionId: currentSessionId || '' })
          }).catch(() => { /* no config / error -> hide */ })
          return () => { alive = false }
        }, [cwd])
        if (!launch) return null
        return el('button', {
          type: 'button',
          className: 'dshj-footer-btn' + (wide ? '' : ' dshj-footer-btn-rail'),
          title: '执行 Jenkins Job（' + (launch.config.job || '') + ' · ' + launch.cwd + '）',
          'aria-label': '执行 Jenkins Job',
          onClick: () => store.open(launch),
        },
          el(SvgPlay, { size: wide ? 16 : 18 }),
          wide ? el('span', { className: 'dshj-footer-label' }, 'Jenkins') : null,
        )
      }

      // ─── 设置 → Jenkins 页：服务器管理 ───────────────────────────────

      const SettingsPage = (props) => {
        const sessionId = props.sessionId
        const [servers, setServers] = React.useState([])
        const [loading, setLoading] = React.useState(true)
        const [editing, setEditing] = React.useState(null)
        const [busy, setBusy] = React.useState(false)
        const [formError, setFormError] = React.useState('')
        const [testResult, setTestResult] = React.useState(null)
        const [confirmDeleteId, setConfirmDeleteId] = React.useState(null)

        const load = () => {
          setLoading(true)
          run(sessionId, { op: 'list' }).then((r) => {
            if (r && r.ok) setServers(r.servers || [])
          }).catch(() => { }).finally(() => setLoading(false))
        }
        React.useEffect(() => { load() }, [])

        const startAdd = () => {
          setEditing({ isNew: true, id: null, name: '', baseUrl: '', username: '', token: '', masked: '', insecure: false })
          setFormError('')
          setTestResult(null)
        }
        const startEdit = (s) => {
          setEditing({ isNew: false, id: s.id, name: s.name, baseUrl: s.baseUrl, username: s.username, token: '', masked: s.tokenMasked || '', insecure: !!s.insecure })
          setFormError('')
          setTestResult(null)
        }
        const setField = (k) => (e) => setEditing((prev) => (prev ? { ...prev, [k]: e.target.value } : prev))
        const setInsecure = (e) => setEditing((prev) => (prev ? { ...prev, insecure: e.target.checked } : prev))

        const doTest = () => {
          if (!editing) return
          setBusy(true)
          setTestResult(null)
          run(sessionId, { op: 'test', server: { id: editing.id, name: editing.name, baseUrl: editing.baseUrl, username: editing.username, token: editing.token, insecure: !!editing.insecure } })
            .then((r) => setTestResult(r && r.ok ? { ok: true, text: '连接成功' + (r.version ? '（Jenkins ' + r.version + '）' : '') } : { ok: false, text: (r && r.error) || '测试失败' }))
            .catch((e) => setTestResult({ ok: false, text: String(e && e.message || e) }))
            .finally(() => setBusy(false))
        }
        const doSave = () => {
          if (!editing) return
          setBusy(true)
          setFormError('')
          run(sessionId, { op: 'save', server: { id: editing.id, name: editing.name, baseUrl: editing.baseUrl, username: editing.username, token: editing.token, insecure: !!editing.insecure } })
            .then((r) => {
              if (r && r.ok) { setEditing(null); load() }
              else setFormError((r && r.error) || '保存失败')
            })
            .catch((e) => setFormError(String(e && e.message || e)))
            .finally(() => setBusy(false))
        }
        const doDelete = (id) => {
          if (confirmDeleteId !== id) { setConfirmDeleteId(id); return }
          setConfirmDeleteId(null)
          run(sessionId, { op: 'delete', id }).then((r) => { if (r && r.ok) load() })
        }
        const doTestSaved = (s) => {
          setTestResult(null)
          run(sessionId, { op: 'test', server: { id: s.id } })
            .then((r) => setTestResult(r && r.ok ? { ok: true, text: '连接成功：' + s.name + (r.version ? '（Jenkins ' + r.version + '）' : '') } : { ok: false, text: '连接失败：' + s.name + '：' + ((r && r.error) || '测试失败') }))
            .catch((e) => setTestResult({ ok: false, text: '连接失败：' + s.name + '：' + String(e && e.message || e) }))
        }

        return el('div', { className: 'dshj-settings' },
          el('div', { className: 'dshj-head' },
            el('div', { className: 'dshj-title' }, 'Jenkins 服务器配置（多服务器）'),
            el('div', { className: 'dshj-actions' },
              el('button', { type: 'button', className: 'dshj-btn dshj-btn-capsule', onClick: startAdd }, '＋ 添加服务器'),
            ),
          ),
          testResult ? el('div', { className: 'dshj-result ' + (testResult.ok ? 'dshj-ok' : 'dshj-err') }, testResult.text) : null,
          editing ? el('div', { className: 'dshj-editor' },
            el('div', { className: 'dshj-editor-title' }, editing.isNew ? '添加 Jenkins 服务器' : '编辑 Jenkins 服务器'),
            el('div', { className: 'dshj-field' },
              el('label', null, '名称'),
              el('input', { className: 'dshj-input', value: editing.name, onChange: setField('name'), placeholder: '例如：生产环境' }),
            ),
            el('div', { className: 'dshj-field' },
              el('label', null, '服务器地址'),
              el('input', { className: 'dshj-input', value: editing.baseUrl, onChange: setField('baseUrl'), placeholder: 'https://jenkins.example.com' }),
            ),
            el('div', { className: 'dshj-field' },
              el('label', null, '用户名'),
              el('input', { className: 'dshj-input', value: editing.username, onChange: setField('username'), placeholder: 'Jenkins 登录用户名' }),
            ),
            el('div', { className: 'dshj-field' },
              el('label', null, 'Token' + (editing.isNew ? '' : '（留空则不修改）')),
              el('input', { type: 'password', className: 'dshj-input', value: editing.token, onChange: setField('token'), placeholder: editing.isNew ? 'API Token 或密码' : ('已保存：' + (editing.masked || '••••')), autoComplete: 'off' }),
            ),
            el('div', { className: 'dshj-field' },
              el('label', { className: 'dshj-check' },
                el('input', { type: 'checkbox', checked: !!editing.insecure, onChange: setInsecure }),
                el('span', null, '跳过 TLS 证书校验（自签名证书）'),
              ),
            ),
            formError ? el('div', { className: 'dshj-err' }, formError) : null,
            el('div', { className: 'dshj-editor-ops' },
              el('button', { type: 'button', className: 'dshj-btn', disabled: busy, onClick: doTest }, busy ? '测试中…' : '测试连接'),
              el('button', { type: 'button', className: 'dshj-btn dshj-btn-primary', disabled: busy, onClick: doSave }, '保存'),
              el('button', { type: 'button', className: 'dshj-btn', disabled: busy, onClick: () => setEditing(null) }, '取消'),
            ),
          ) : null,
          loading ? el('div', { className: 'dshj-empty' }, '加载中…')
            : servers.length === 0 ? el('div', { className: 'dshj-empty' }, '还没有配置 Jenkins 服务器。点击“添加服务器”，填写地址、用户名与 Token。')
              : el('div', { className: 'dshj-list' },
                  servers.map((s) => el('div', { key: s.id, className: 'dshj-card' },
                    el('div', { className: 'dshj-card-main' },
                      el('div', { className: 'dshj-card-name' }, s.name),
                      el('div', { className: 'dshj-card-meta' }, s.baseUrl + '  ·  ' + s.username + '  ·  ' + (s.tokenMasked || '')),
                    ),
                    el('div', { className: 'dshj-card-ops' },
                      el('button', { type: 'button', className: 'dshj-btn dshj-btn-small', onClick: () => doTestSaved(s) }, '测试'),
                      el('button', { type: 'button', className: 'dshj-btn dshj-btn-small', onClick: () => startEdit(s) }, '编辑'),
                      el('button', { type: 'button', className: 'dshj-btn dshj-btn-small' + (confirmDeleteId === s.id ? ' dshj-btn-danger' : ''), onClick: () => doDelete(s.id) }, confirmDeleteId === s.id ? '确认删除' : '删除'),
                    ),
                  )),
                ),
        )
      }

      // ─── 执行 Jenkins Job 弹框：环境 Tab + 参数表单 + 触发 + 轮询 ────

      const LauncherModalInner = ({ launch }) => {
        const config = launch.config
        const sessionId = launch.sessionId || ''
        const environments = Array.isArray(config.environments) ? config.environments : []
        const [activeEnv, setActiveEnv] = React.useState(environments.length ? environments[0].name : '')
        const [formValues, setFormValues] = React.useState({})
        const [submitting, setSubmitting] = React.useState(false)
        const [actionError, setActionError] = React.useState('')
        const [run, setRun] = React.useState(null)

        const env = environments.find((e) => e.name === activeEnv) || null

        React.useEffect(() => {
          if (!env) { setFormValues({}); return }
          const init = {}
          const params = env.parameters || {}
          for (const k of Object.keys(params)) {
            const v = params[k]
            init[k] = typeof v === 'boolean' ? v : (v === null || v === undefined ? '' : String(v))
          }
          setFormValues(init)
          setRun(null)
          setActionError('')
        }, [activeEnv, launch.cwd])

        const runRef = React.useRef(run)
        runRef.current = run
        React.useEffect(() => {
          const cur = runRef.current
          if (!cur || (cur.phase !== 'queued' && cur.phase !== 'running')) return
          return ctx.interval(() => {
            const r = runRef.current
            if (!r) return
            if (Date.now() - (r.since || 0) > 600000) {
              setRun({ ...r, phase: 'error', message: '轮询超时（10 分钟），请到 Jenkins 页面查看实际状态' })
              return
            }
            if (r.phase === 'queued') {
              run(sessionId, { op: 'queueStatus', serverId: r.serverId, queueId: r.queueId }).then((res) => {
                const c = runRef.current
                if (!c || c.phase !== 'queued') return
                if (!res || !res.ok) { setRun({ ...c, phase: 'error', message: (res && res.error) || '查询队列失败' }); return }
                if (res.state === 'started') setRun({ ...c, phase: 'running', buildNumber: res.buildNumber, message: '构建已开始（#' + res.buildNumber + '）…' })
                else if (res.state === 'cancelled') setRun({ ...c, phase: 'error', message: '构建已取消：' + (res.why || '未知原因') })
                else setRun({ ...c, message: '排队中：' + (res.why || '等待可用执行器') })
              }).catch((e) => { const c = runRef.current; if (c) setRun({ ...c, phase: 'error', message: String(e && e.message || e) }) })
            } else {
              run(sessionId, { op: 'buildStatus', serverId: r.serverId, segments: r.segments, buildNumber: r.buildNumber }).then((res) => {
                const c = runRef.current
                if (!c || c.phase !== 'running') return
                if (!res || !res.ok) {
                  if (res && res.notFound) return
                  setRun({ ...c, phase: 'error', message: (res && res.error) || '查询构建状态失败' })
                  return
                }
                if (res.building) setRun({ ...c, message: '构建中…（已运行 ' + fmtDur(Date.now() - (res.timestamp || Date.now())) + '）' })
                else setRun({ ...c, phase: 'done', result: res.result || 'UNKNOWN', duration: res.duration || 0, url: res.url || '', buildNumber: res.number || c.buildNumber, message: '构建结束' })
              }).catch((e) => { const c = runRef.current; if (c) setRun({ ...c, phase: 'error', message: String(e && e.message || e) }) })
            }
          }, 2500)
        }, [run ? run.phase : null, run ? run.queueId : null, run ? run.buildNumber : null])

        const onSubmit = () => {
          if (!env || submitting) return
          setSubmitting(true)
          setActionError('')
          run(sessionId, { op: 'workspaceTrigger', cwd: launch.cwd, env: activeEnv }).then((res) => {
            setSubmitting(false)
            if (res && res.ok) {
              if (res.queueId) {
                setRun({ phase: 'queued', queueId: res.queueId, serverId: res.serverId, segments: res.segments, buildNumber: null, message: '已提交到构建队列（#' + res.queueId + '），等待开始…', since: Date.now() })
              } else {
                setRun({ phase: 'running', queueId: null, serverId: res.serverId, segments: res.segments, buildNumber: res.nextBuildNumber || null, message: '构建已触发（未获得队列编号），正在轮询状态…', since: Date.now() })
              }
            } else {
              setActionError((res && res.error) || '触发构建失败')
            }
          }).catch((e) => { setSubmitting(false); setActionError(String(e && e.message || e)) })
        }

        const paramKeys = env ? Object.keys(env.parameters || {}) : []

        return el('div', { className: 'dshj-backdrop', onClick: () => store.close() },
          el('div', { className: 'dshj-modal', onClick: (e) => e.stopPropagation() },
            el('div', { className: 'dshj-modal-header' },
              el('div', null,
                el('div', { className: 'dshj-modal-title' }, '执行 Jenkins Job'),
                el('div', { className: 'dshj-modal-sub' }, (config.job || '') + ' · ' + launch.cwd),
              ),
              el('button', { type: 'button', className: 'dshj-close', 'aria-label': '关闭', title: '关闭', onClick: () => store.close() }, '✕'),
            ),
            el('div', { className: 'dshj-tabs', role: 'tablist' },
              environments.map((e) => el('button', {
                key: e.name,
                type: 'button',
                role: 'tab',
                className: 'dshj-tab' + (e.name === activeEnv ? ' dshj-tab-active' : ''),
                'aria-selected': e.name === activeEnv,
                onClick: () => setActiveEnv(e.name),
              }, e.name)),
            ),
            el('div', { className: 'dshj-modal-body' },
              !env ? el('div', { className: 'dshj-empty' }, '配置中没有环境')
                : run ? el('div', null,
                    el('div', { className: 'dshj-run-title' }, run.phase === 'queued' ? '排队中' : run.phase === 'running' ? '构建中' : run.phase === 'done' ? '构建完成' : '出错了'),
                    el('div', { className: 'dshj-run-message ' + (run.phase === 'done' ? (run.result === 'SUCCESS' ? 'dshj-ok' : (run.result === 'FAILURE' || run.result === 'ABORTED' ? 'dshj-err' : 'dshj-warn')) : '') }, run.message || ''),
                    (run.phase === 'queued' || run.phase === 'running') ? el('div', { className: 'dshj-spinner' }) : null,
                    run.phase === 'done' ? el('div', null,
                      el('div', { className: 'dshj-run-line' }, '构建 #' + run.buildNumber + ' 结果：' + (run.result || 'UNKNOWN')),
                      el('div', { className: 'dshj-run-line' }, '耗时：' + fmtDur(run.duration || 0)),
                      run.url ? el('a', { className: 'dshj-link', href: run.url, target: '_blank', rel: 'noopener noreferrer' }, '打开构建页面 ↗') : null,
                    ) : null,
                    el('div', { className: 'dshj-form-ops' },
                      el('button', { type: 'button', className: 'dshj-btn', onClick: () => setRun(null) }, '返回参数'),
                      run.phase === 'done' ? el('button', { type: 'button', className: 'dshj-btn dshj-btn-primary', onClick: onSubmit }, '再次构建') : null,
                    ),
                  )
                  : el('div', null,
                      el('div', { className: 'dshj-job-title' }, config.job || ''),
                      el('div', { className: 'dshj-job-sub' }, '环境：' + activeEnv + (config.server ? ' · 服务器：' + config.server : '')),
                      paramKeys.length === 0
                        ? el('div', { className: 'dshj-empty' }, '该环境没有参数，可直接构建。')
                        : el('div', null,
                            paramKeys.map((k) => {
                              const v = formValues[k]
                              const isBool = typeof v === 'boolean'
                              return el('div', { key: k, className: 'dshj-field' },
                                el('label', null, k),
                                isBool
                                  ? el('label', { className: 'dshj-check' },
                                      el('input', { type: 'checkbox', checked: !!v, onChange: (e) => setFormValues((prev) => ({ ...prev, [k]: e.target.checked })) }),
                                      el('span', null, String(v)),
                                    )
                                  : el('input', { className: 'dshj-input', value: String(v === undefined || v === null ? '' : v), onChange: (e) => setFormValues((prev) => ({ ...prev, [k]: e.target.value })) }),
                              )
                            }),
                          ),
                      actionError ? el('div', { className: 'dshj-err' }, actionError) : null,
                      el('div', { className: 'dshj-form-ops' },
                        el('button', { type: 'button', className: 'dshj-btn dshj-btn-primary', disabled: submitting, onClick: onSubmit }, submitting ? '提交中…' : '提交构建'),
                      ),
                    ),
            ),
          ),
        )
      }

      const LauncherModal = () => {
        const launch = useLaunch()
        if (!launch) return null
        return el(LauncherModalInner, { launch })
      }

      // ─── 注册 Slots ───────────────────────────────────────────────

      slots.inject('sidebar.footer.action', () => slots.register(
        { name: 'sidebar.footer.action', id: 'dsh-jenkins-cli', order: 10 },
        FooterButton,
      ))

      slots.inject('settings.section', () => slots.register(
        { name: 'settings.section', id: 'dsh-jenkins-cli', order: 25, label: 'jenkins-cli设置' },
        (props) => {
          let sessionId = ''
          if (props && typeof props.useSessions === 'function') {
            const current = props.useSessions((state) => state && state.current)
            if (typeof current === 'string') sessionId = current
          }
          return el(SettingsPage, { sessionId })
        },
      ))

      slots.inject('shell.overlay', () => slots.register(
        { name: 'shell.overlay', id: 'dsh-jenkins-cli-launcher', order: 100 },
        LauncherModal,
      ))
    }

    exports.apply = apply
    exports.inject = inject
    exports.name = name
    return module.exports
  },
})
