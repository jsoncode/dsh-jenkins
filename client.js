/**
 * dsh-jenkins-cli —— 浏览器半边（client bundle）
 *
 * 格式：window.__ModuleLoader__.load({ id, factory }) —— 执行 bundle 只注册工厂，
 * 工厂在物化时运行并导出 { name, inject, apply }（参考 @lemcae/dsh-balance）。
 *
 * 功能：
 * 1. 设置 → Jenkins Cli 配置页：多服务器管理（settings.section）。
 * 2. 侧边栏底部按钮（sidebar.footer.action）：当前工作区根目录存在
 *    dsh-jenkins-cli.{json,js,ts} 配置时显示，点击打开「执行 Jenkins Job」弹框。
 * 3. 弹框（shell.overlay）：环境 Tab（dev/uat/prod…）切换 → 参数表单回显 →
 *    触发构建 → 轮询状态（ctx.interval）。
 *
 * 界面文案支持中/英文（跟随主界面语言 document.lang / navigator.language）；
 * 宿主错误通过 code 映射为本地化文本（tErr），未知错误回退原文。
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

    // ── 语言与文案 ──────────────────────────────────────────────
    function resolveLang() {
      if (typeof document !== 'undefined') {
        const host = document.documentElement.lang || navigator.language || 'zh-CN'
        return /^zh/i.test(host) ? 'zh' : 'en'
      }
      return 'zh'
    }
    const LANG = resolveLang()
    const COPY = {
      zh: {
        settingsNav: 'Jenkins Cli 配置',
        settingsTitle: 'Jenkins 服务器配置',
        addServer: '添加服务器',
        addTitle: '添加 Jenkins 服务器',
        editTitle: '编辑 Jenkins 服务器',
        nameLabel: '名称（选填）',
        namePlaceholder: '选填，留空用服务器地址',
        urlLabel: '服务器地址',
        urlPlaceholder: 'https://jenkins.example.com',
        usernameLabel: '用户名（选填）',
        usernamePlaceholder: '选填，缺省 admin',
        tokenLabel: 'Token',
        tokenPlaceholder: 'API Token 或密码',
        tokenSaved: '已保存：',
        keepToken: '（留空则不修改）',
        tlsLabel: '跳过 TLS 证书校验（自签名证书）',
        testBtn: '测试连接',
        testing: '测试中…',
        saveBtn: '保存',
        cancelBtn: '取消',
        loading: '加载中…',
        connected: '连接成功',
        testFailed: '测试失败',
        connectionFailed: '连接失败：',
        saveFailed: '保存失败',
        deleteBtn: '删除',
        confirmDelete: '确认删除',
        editBtn: '编辑',
        runJob: '执行 Jenkins Job',
        close: '关闭',
        noEnv: '配置中没有环境',
        phaseQueued: '排队中',
        phaseRunning: '构建中',
        phaseDone: '构建完成',
        phaseError: '出错了',
        queuedMsg: '已提交到构建队列（#{n}），等待开始…',
        triggeredMsg: '构建已触发（未获得队列编号），正在轮询状态…',
        pollTimeout: '轮询超时（10 分钟），请到 Jenkins 页面查看实际状态',
        queuePollFailed: '查询队列失败',
        buildPollFailed: '查询构建状态失败',
        buildStarted: '构建已开始（#{n}）…',
        cancelled: '构建已取消：',
        unknownReason: '未知原因',
        queuing: '排队中：',
        waitingExecutor: '等待可用执行器',
        buildingRun: '构建中…（已运行 {d}）',
        buildEnded: '构建结束',
        resultLabel: '构建 #{n} 结果：',
        duration: '耗时：',
        openPage: '打开构建页面 ↗',
        backParams: '返回参数',
        rebuild: '再次构建',
        envLabel: '环境：',
        serverLabel: ' · 服务器：',
        noParams: '该环境没有参数，可直接构建。',
        submit: '提交构建',
        submitting: '提交中…',
        triggerFailed: '触发构建失败',
        cmdNoResult: '命令未返回结果',
        sec: ' 秒',
        min: ' 分 ',
        hour: ' 时 ',
        available: '可用',
        errors: {
          'url-invalid': '服务器地址需以 http:// 或 https:// 开头',
          'token-required': '请填写 Token',
          'server-missing': '服务器不存在，请先在设置中配置',
          'fields-missing': '请填写服务器地址和 Token',
          'auth-failed': '认证失败：用户名或 Token 不正确（HTTP 401）',
          'forbidden': '权限不足（HTTP 403）',
          'connect-failed': '连接失败，请检查服务器地址',
          'no-config': '工作区根目录未找到 dsh-jenkins-cli.json/js/ts 配置',
          'env-missing': '环境不存在',
          'redirect': '服务器返回重定向，请检查服务器地址是否为最终地址（如 https://…）',
          'trigger-http': '触发构建失败',
          'network-failed': '网络请求失败，请检查网络或 Jenkins 地址',
          'not-found': '资源不存在（HTTP 404）',
          'job-path-invalid': '无法解析任务路径',
          'queue-id-missing': '缺少队列 ID',
          'cwd-missing': '缺少工作区路径',
          'parse-failed': '响应解析失败',
        },
      },
      en: {
        settingsNav: 'Jenkins Cli Config',
        settingsTitle: 'Jenkins Server Config',
        addServer: 'Add server',
        addTitle: 'Add Jenkins Server',
        editTitle: 'Edit Jenkins Server',
        nameLabel: 'Name (optional)',
        namePlaceholder: 'Optional; defaults to server URL',
        urlLabel: 'Server URL',
        urlPlaceholder: 'https://jenkins.example.com',
        usernameLabel: 'Username (optional)',
        usernamePlaceholder: 'Optional; defaults to admin',
        tokenLabel: 'Token',
        tokenPlaceholder: 'API Token or password',
        tokenSaved: 'Saved: ',
        keepToken: ' (leave blank to keep)',
        tlsLabel: 'Skip TLS verification (self-signed cert)',
        testBtn: 'Test connection',
        testing: 'Testing…',
        saveBtn: 'Save',
        cancelBtn: 'Cancel',
        loading: 'Loading…',
        connected: 'Connected',
        testFailed: 'Test failed',
        connectionFailed: 'Connection failed: ',
        saveFailed: 'Save failed',
        deleteBtn: 'Delete',
        confirmDelete: 'Confirm delete',
        editBtn: 'Edit',
        runJob: 'Run Jenkins Job',
        close: 'Close',
        noEnv: 'No environments in config',
        phaseQueued: 'Queued',
        phaseRunning: 'Building',
        phaseDone: 'Build finished',
        phaseError: 'Error',
        queuedMsg: 'Submitted to queue (#{n}), waiting…',
        triggeredMsg: 'Build triggered (no queue id); polling…',
        pollTimeout: 'Polling timed out (10 min); check Jenkins',
        queuePollFailed: 'Queue query failed',
        buildPollFailed: 'Status query failed',
        buildStarted: 'Build started (#{n})…',
        cancelled: 'Build cancelled: ',
        unknownReason: 'unknown reason',
        queuing: 'Queued: ',
        waitingExecutor: 'waiting for an executor',
        buildingRun: 'Building… (running {d})',
        buildEnded: 'Build finished',
        resultLabel: 'Build #{n} result: ',
        duration: 'Duration: ',
        openPage: 'Open build page ↗',
        backParams: 'Back',
        rebuild: 'Rebuild',
        envLabel: 'Environment: ',
        serverLabel: ' · Server: ',
        noParams: 'No parameters; build directly.',
        submit: 'Submit build',
        submitting: 'Submitting…',
        triggerFailed: 'Failed to trigger build',
        cmdNoResult: 'Command returned no result',
        sec: 's',
        min: 'm ',
        hour: 'h ',
        available: 'Available',
        errors: {
          'url-invalid': 'Server URL must start with http:// or https://',
          'token-required': 'Token is required',
          'server-missing': 'Server not found; configure it in settings first',
          'fields-missing': 'Enter server URL and Token',
          'auth-failed': 'Authentication failed: wrong username or Token (HTTP 401)',
          'forbidden': 'Permission denied (HTTP 403)',
          'connect-failed': 'Connection failed; check the server URL',
          'no-config': 'No dsh-jenkins-cli.json/js/ts config in workspace root',
          'env-missing': 'Environment not found',
          'redirect': 'Server returned a redirect; check that the URL is the final one (e.g. https://…)',
          'trigger-http': 'Failed to trigger build',
          'network-failed': 'Network request failed; check the network or the Jenkins URL',
          'not-found': 'Resource not found (HTTP 404)',
          'job-path-invalid': 'Unable to parse job path',
          'queue-id-missing': 'Missing queue ID',
          'cwd-missing': 'Missing workspace path',
          'parse-failed': 'Failed to parse response',
        },
      },
    }
    const dict = COPY[LANG] || COPY.zh
    const t = (key, vars) => {
      let s = dict[key] !== undefined ? dict[key] : String(key)
      if (vars) {
        for (const k of Object.keys(vars)) {
          s = s.split('{' + k + '}').join(String(vars[k]))
        }
      }
      return s
    }
    const tErr = (res, fallback) => {
      if (res && res.code) {
        const local = dict.errors[res.code]
        if (local !== undefined) {
          const zh = LANG === 'zh'
          const sep = zh ? '：' : ': '
          if (res.code === 'env-missing') {
            return local + sep + res.envName + (zh ? '（' : ' (') + t('available') + (zh ? '：' : ': ') + (res.available || []).join('、') + (zh ? '）' : ')')
          }
          if (res.code === 'trigger-http') {
            return t('triggerFailed') + (zh ? '（HTTP ' : ' (HTTP ') + res.status + (zh ? '）：' : '): ') + (res.detail || '')
          }
          return local
        }
      }
      return (res && res.error) || fallback || ''
    }

    // ── 注入样式（与 dsh-balance 相同的 bundle CSS 注入模式）──
    const CSS_ID = 'dsh-jenkins-cli/settings.css'
    const css = [
      // 通用
      '.dshj-btn{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 14px;font-size:13px;cursor:pointer}',
      '.dshj-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}',
      '.dshj-btn:disabled{opacity:.5;cursor:not-allowed}',
      '.dshj-btn-primary{background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3));border-color:transparent;color:var(--dsw-alias-label-primary-foreground,#fff)}',
      '.dshj-btn-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-brand-primary,#1668e3))}',
      '.dshj-title-row{display:flex;align-items:center;gap:4px}',
      '.dshj-btn-icon{border:none;background:transparent;color:var(--dsw-alias-label-secondary,#888);width:24px;height:24px;padding:0;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}',
      '.dshj-btn-icon:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));color:var(--dsw-alias-label-primary,#222)}',
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
      '.dshj-req{color:var(--dsw-alias-state-error-primary,#d33);margin-left:2px}',
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
          if (text === null || text.length === 0) return { ok: false, error: t('cmdNoResult') }
          try { return JSON.parse(text) } catch { return { ok: false, error: text.slice(0, 200) } }
        } catch (e) {
          return { ok: false, error: (e && e.message) || String(e) }
        }
      }
    }

    // ── 弹框开关（footer 按钮 ↔ overlay 弹框共享）────────────────────
    function makeStore() {
      const store = {
        launch: null, // { cwd, config, sessionId }
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
      if (s < 60) return s + t('sec')
      const m = Math.floor(s / 60)
      if (m < 60) return m + t('min') + (s % 60) + t('sec')
      const h = Math.floor(m / 60)
      return h + t('hour') + (m % 60) + t('min')
    }

    const SvgPlay = ({ size }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
      React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
      React.createElement('polygon', { points: '10 8 16 12 10 16 10 8', fill: 'currentColor', stroke: 'none' }),
    )

    const SvgPlus = ({ size }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', 'aria-hidden': true },
      React.createElement('path', { d: 'M8 3.5v9M3.5 8h9' }),
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
          title: t('runJob') + '（' + (launch.config.job || '') + ' · ' + launch.cwd + '）',
          'aria-label': t('runJob'),
          onClick: () => store.open(launch),
        },
          el(SvgPlay, { size: wide ? 16 : 18 }),
          wide ? el('span', { className: 'dshj-footer-label' }, 'Jenkins') : null,
        )
      }

      // ─── 设置 → Jenkins Cli 配置页：服务器管理 ─────────────────────

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

        // 空列表时自动显示“添加服务器”表单，无需空态提示。
        const EMPTY_DRAFT = { isNew: true, id: null, name: '', baseUrl: '', username: '', token: '', masked: '', insecure: false }
        const draft = editing || EMPTY_DRAFT

        const startAdd = () => {
          setEditing({ ...EMPTY_DRAFT })
          setFormError('')
          setTestResult(null)
        }
        const startEdit = (s) => {
          setEditing({ isNew: false, id: s.id, name: s.name, baseUrl: s.baseUrl, username: s.username, token: '', masked: s.tokenMasked || '', insecure: !!s.insecure })
          setFormError('')
          setTestResult(null)
        }
        const setField = (k) => (e) => setEditing((prev) => ({ ...(prev || EMPTY_DRAFT), [k]: e.target.value }))
        const setInsecure = (e) => setEditing((prev) => ({ ...(prev || EMPTY_DRAFT), insecure: e.target.checked }))

        const doTest = () => {
          setBusy(true)
          setTestResult(null)
          run(sessionId, { op: 'test', server: { id: draft.id, name: draft.name, baseUrl: draft.baseUrl, username: draft.username, token: draft.token, insecure: !!draft.insecure } })
            .then((r) => setTestResult(r && r.ok ? { ok: true, text: t('connected') + (r.version ? '（Jenkins ' + r.version + '）' : '') } : { ok: false, text: tErr(r, t('testFailed')) }))
            .catch((e) => setTestResult({ ok: false, text: String(e && e.message || e) }))
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
            .then((r) => setTestResult(r && r.ok ? { ok: true, text: t('connected') + '：' + s.name + (r.version ? '（Jenkins ' + r.version + '）' : '') } : { ok: false, text: t('connectionFailed') + s.name + '：' + tErr(r, t('testFailed')) }))
            .catch((e) => setTestResult({ ok: false, text: t('connectionFailed') + s.name + '：' + String(e && e.message || e) }))
        }

        return el('div', { className: 'dshj-settings' },
          el('div', { className: 'dshj-head' },
            el('div', { className: 'dshj-title-row' },
              el('div', { className: 'dshj-title' }, t('settingsTitle')),
              el('button', {
                type: 'button',
                className: 'dshj-btn-icon',
                title: t('addServer'),
                'aria-label': t('addServer'),
                onClick: startAdd,
              },
                el(SvgPlus, { size: 16 }),
              ),
            ),
          ),
          testResult ? el('div', { className: 'dshj-result ' + (testResult.ok ? 'dshj-ok' : 'dshj-err') }, testResult.text) : null,
          (editing || servers.length === 0) && !loading ? el('div', { className: 'dshj-editor' },
            el('div', { className: 'dshj-editor-title' }, draft.isNew ? t('addTitle') : t('editTitle')),
            el('div', { className: 'dshj-field' },
              el('label', null, t('nameLabel')),
              el('input', { className: 'dshj-input', value: draft.name, onChange: setField('name'), placeholder: t('namePlaceholder') }),
            ),
            el('div', { className: 'dshj-field' },
              el('label', null, t('urlLabel'), el('span', { className: 'dshj-req' }, '*')),
              el('input', { className: 'dshj-input', value: draft.baseUrl, onChange: setField('baseUrl'), placeholder: t('urlPlaceholder') }),
            ),
            el('div', { className: 'dshj-field' },
              el('label', null, t('usernameLabel')),
              el('input', { className: 'dshj-input', value: draft.username, onChange: setField('username'), placeholder: t('usernamePlaceholder') }),
            ),
            el('div', { className: 'dshj-field' },
              el('label', null, t('tokenLabel'), el('span', { className: 'dshj-req' }, '*'), draft.isNew ? '' : t('keepToken')),
              el('input', { type: 'password', className: 'dshj-input', value: draft.token, onChange: setField('token'), placeholder: draft.isNew ? t('tokenPlaceholder') : (t('tokenSaved') + (draft.masked || '••••')), autoComplete: 'off' }),
            ),
            el('div', { className: 'dshj-field' },
              el('label', { className: 'dshj-check' },
                el('input', { type: 'checkbox', checked: !!draft.insecure, onChange: setInsecure }),
                el('span', null, t('tlsLabel')),
              ),
            ),
            formError ? el('div', { className: 'dshj-err' }, formError) : null,
            el('div', { className: 'dshj-editor-ops' },
              el('button', { type: 'button', className: 'dshj-btn', disabled: busy, onClick: doTest }, busy ? t('testing') : t('testBtn')),
              el('button', { type: 'button', className: 'dshj-btn dshj-btn-primary', disabled: busy, onClick: doSave }, t('saveBtn')),
              el('button', { type: 'button', className: 'dshj-btn', disabled: busy, onClick: () => setEditing(null) }, t('cancelBtn')),
            ),
          ) : null,
          loading ? el('div', { className: 'dshj-empty' }, t('loading'))
            : servers.length === 0 ? null
              : el('div', { className: 'dshj-list' },
                  servers.map((s) => el('div', { key: s.id, className: 'dshj-card' },
                    el('div', { className: 'dshj-card-main' },
                      el('div', { className: 'dshj-card-name' }, s.name),
                      el('div', { className: 'dshj-card-meta' }, s.baseUrl + '  ·  ' + s.username + '  ·  ' + (s.tokenMasked || '')),
                    ),
                    el('div', { className: 'dshj-card-ops' },
                      el('button', { type: 'button', className: 'dshj-btn dshj-btn-small', onClick: () => doTestSaved(s) }, t('testBtn')),
                      el('button', { type: 'button', className: 'dshj-btn dshj-btn-small', onClick: () => startEdit(s) }, t('editBtn')),
                      el('button', { type: 'button', className: 'dshj-btn dshj-btn-small' + (confirmDeleteId === s.id ? ' dshj-btn-danger' : ''), onClick: () => doDelete(s.id) }, confirmDeleteId === s.id ? t('confirmDelete') : t('deleteBtn')),
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
              setRun({ ...r, phase: 'error', message: t('pollTimeout') })
              return
            }
            if (r.phase === 'queued') {
              run(sessionId, { op: 'queueStatus', serverId: r.serverId, queueId: r.queueId }).then((res) => {
                const c = runRef.current
                if (!c || c.phase !== 'queued') return
                if (!res || !res.ok) { setRun({ ...c, phase: 'error', message: tErr(res, t('queuePollFailed')) }); return }
                if (res.state === 'started') setRun({ ...c, phase: 'running', buildNumber: res.buildNumber, message: t('buildStarted', { n: res.buildNumber }) })
                else if (res.state === 'cancelled') setRun({ ...c, phase: 'error', message: t('cancelled') + (res.why || t('unknownReason')) })
                else setRun({ ...c, message: t('queuing') + (res.why || t('waitingExecutor')) })
              }).catch((e) => { const c = runRef.current; if (c) setRun({ ...c, phase: 'error', message: String(e && e.message || e) }) })
            } else {
              run(sessionId, { op: 'buildStatus', serverId: r.serverId, segments: r.segments, buildNumber: r.buildNumber }).then((res) => {
                const c = runRef.current
                if (!c || c.phase !== 'running') return
                if (!res || !res.ok) {
                  if (res && res.notFound) return
                  setRun({ ...c, phase: 'error', message: tErr(res, t('buildPollFailed')) })
                  return
                }
                if (res.building) setRun({ ...c, message: t('buildingRun', { d: fmtDur(Date.now() - (res.timestamp || Date.now())) }) })
                else setRun({ ...c, phase: 'done', result: res.result || 'UNKNOWN', duration: res.duration || 0, url: res.url || '', buildNumber: res.number || c.buildNumber, message: t('buildEnded') })
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
                setRun({ phase: 'queued', queueId: res.queueId, serverId: res.serverId, segments: res.segments, buildNumber: null, message: t('queuedMsg', { n: res.queueId }), since: Date.now() })
              } else {
                setRun({ phase: 'running', queueId: null, serverId: res.serverId, segments: res.segments, buildNumber: res.nextBuildNumber || null, message: t('triggeredMsg'), since: Date.now() })
              }
            } else {
              setActionError(tErr(res, t('triggerFailed')))
            }
          }).catch((e) => { setSubmitting(false); setActionError(String(e && e.message || e)) })
        }

        const paramKeys = env ? Object.keys(env.parameters || {}) : []

        return el('div', { className: 'dshj-backdrop', onClick: () => store.close() },
          el('div', { className: 'dshj-modal', onClick: (e) => e.stopPropagation() },
            el('div', { className: 'dshj-modal-header' },
              el('div', null,
                el('div', { className: 'dshj-modal-title' }, t('runJob')),
                el('div', { className: 'dshj-modal-sub' }, (config.job || '') + ' · ' + launch.cwd),
              ),
              el('button', { type: 'button', className: 'dshj-close', 'aria-label': t('close'), title: t('close'), onClick: () => store.close() }, '✕'),
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
              !env ? el('div', { className: 'dshj-empty' }, t('noEnv'))
                : run ? el('div', null,
                    el('div', { className: 'dshj-run-title' }, run.phase === 'queued' ? t('phaseQueued') : run.phase === 'running' ? t('phaseRunning') : run.phase === 'done' ? t('phaseDone') : t('phaseError')),
                    el('div', { className: 'dshj-run-message ' + (run.phase === 'done' ? (run.result === 'SUCCESS' ? 'dshj-ok' : (run.result === 'FAILURE' || run.result === 'ABORTED' ? 'dshj-err' : 'dshj-warn')) : '') }, run.message || ''),
                    (run.phase === 'queued' || run.phase === 'running') ? el('div', { className: 'dshj-spinner' }) : null,
                    run.phase === 'done' ? el('div', null,
                      el('div', { className: 'dshj-run-line' }, t('resultLabel', { n: run.buildNumber }) + (run.result || 'UNKNOWN')),
                      el('div', { className: 'dshj-run-line' }, t('duration') + fmtDur(run.duration || 0)),
                      run.url ? el('a', { className: 'dshj-link', href: run.url, target: '_blank', rel: 'noopener noreferrer' }, t('openPage')) : null,
                    ) : null,
                    el('div', { className: 'dshj-form-ops' },
                      el('button', { type: 'button', className: 'dshj-btn', onClick: () => setRun(null) }, t('backParams')),
                      run.phase === 'done' ? el('button', { type: 'button', className: 'dshj-btn dshj-btn-primary', onClick: onSubmit }, t('rebuild')) : null,
                    ),
                  )
                  : el('div', null,
                      el('div', { className: 'dshj-job-title' }, config.job || ''),
                      el('div', { className: 'dshj-job-sub' }, t('envLabel') + activeEnv + (config.server ? t('serverLabel') + config.server : '')),
                      paramKeys.length === 0
                        ? el('div', { className: 'dshj-empty' }, t('noParams'))
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
                        el('button', { type: 'button', className: 'dshj-btn dshj-btn-primary', disabled: submitting, onClick: onSubmit }, submitting ? t('submitting') : t('submit')),
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
        { name: 'settings.section', id: 'dsh-jenkins-cli', order: 25, label: () => dict.settingsNav },
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
