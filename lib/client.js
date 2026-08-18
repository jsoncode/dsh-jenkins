window.__ModuleLoader__.load({ id: 'dsh-jenkins', factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let react = require("react");
let react_jsx_runtime = require("react/jsx-runtime");
let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
//#region src/client/styles.ts
/**
* dsh-jenkins —— 浏览器半边：样式注入（与 dsh-balance 相同的 bundle CSS 注入模式）。
*/
const CSS_ID = "dsh-jenkins/settings.css";
const css = [
	".dshj-btn{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 14px;font-size:13px;cursor:pointer}",
	".dshj-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}",
	".dshj-btn:disabled{opacity:.5;cursor:not-allowed}",
	".dshj-btn-primary{background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3));border-color:transparent;color:var(--dsw-alias-label-primary-foreground,#fff)}",
	".dshj-btn-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-brand-primary,#1668e3))}",
	".dshj-title-row{display:flex;align-items:center;gap:4px}",
	".dshj-btn-icon{border:none;background:transparent;color:var(--dsw-alias-label-secondary,#888);width:24px;height:24px;padding:0;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}",
	".dshj-btn-icon:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));color:var(--dsw-alias-label-primary,#222)}",
	".dshj-btn-danger{color:var(--dsw-alias-state-error-primary);border-color:currentColor}",
	".dshj-btn-small{padding:3px 10px;font-size:12px}",
	".dshj-btn-active{border-color:var(--dsw-alias-brand-primary,#1668e3);color:var(--dsw-alias-brand-primary,#1668e3)}",
	".dshj-err{color:var(--dsw-alias-state-error-primary,#d33);font-size:13px;margin:8px 0}",
	".dshj-ok{color:var(--dsw-alias-state-success-primary,#2a7d3c);font-size:13px;margin:8px 0}",
	".dshj-warn{color:var(--dsw-alias-state-warn-primary,#b8860b)}",
	".dshj-empty{padding:28px 16px;text-align:center;color:var(--dsw-alias-label-secondary,#888);font-size:13px}",
	".dshj-input,.dshj-select,.dshj-textarea{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#222);border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:8px;padding:8px 12px;font-size:13px;font-family:inherit;transition:border-color .15s,box-shadow .15s,background .15s}",
	".dshj-input:hover,.dshj-select:hover,.dshj-textarea:hover{border-color:var(--dsw-alias-border-l3,#b8b8b8)}",
	".dshj-input:focus,.dshj-select:focus,.dshj-textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary,#1668e3);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 18%,transparent)}",
	".dshj-input::placeholder,.dshj-textarea::placeholder{color:var(--dsw-alias-label-tertiary,#aaa)}",
	".dshj-textarea{min-height:72px;resize:vertical;line-height:1.5}",
	".dshj-select{cursor:pointer;appearance:none;-webkit-appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--dsw-alias-label-secondary,#888) 50%),linear-gradient(135deg,var(--dsw-alias-label-secondary,#888) 50%,transparent 50%);background-position:calc(100% - 16px) 50%,calc(100% - 11px) 50%;background-size:5px 5px;background-repeat:no-repeat;padding-right:28px}",
	".dshj-field{margin-bottom:12px}",
	".dshj-field>label{display:block;font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666);margin-bottom:4px}",
	".dshj-form-grid{display:grid;grid-template-columns:1fr;gap:14px 0;margin-top:10px}",
	".dshj-form-field{display:grid;grid-template-columns:168px 340px;align-items:center;gap:4px 10px}",
	".dshj-form-label{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666);text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:default}",
	".dshj-form-desc{grid-column:2;font-size:12px;color:var(--dsw-alias-label-secondary,#888);line-height:1.5;word-break:break-word}",
	".dshj-req{color:var(--dsw-alias-state-error-primary,#d33);margin-left:2px}",
	".dshj-check{display:inline-flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;user-select:none}",
	".dshj-check input[type=checkbox]{width:15px;height:15px;margin:0;accent-color:var(--dsw-alias-brand-primary,#1668e3);cursor:pointer}",
	".dshj-form-ops{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}",
	".dshj-submit-row{margin-top:22px;margin-left:178px}",
	".dshj-link-btn{border:none;background:transparent;color:var(--dsw-alias-brand-primary,#1668e3);font-size:13px;cursor:pointer;padding:6px 10px;border-radius:6px;text-decoration:none}",
	".dshj-link-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));text-decoration:underline}",
	".dshj-link-btn:disabled{opacity:.5;cursor:not-allowed}",
	".dshj-form-divider{display:flex;align-items:center;gap:10px;margin:16px 0 6px}",
	".dshj-form-divider::before,.dshj-form-divider::after{content:\"\";flex:1;height:0;border-top:1px dashed var(--dsw-alias-border-l3,#bbb)}",
	".dshj-form-divider-text{font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70%}",
	".dshj-footer-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:28px;padding:0 8px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#888);cursor:pointer;font-size:12px;box-sizing:border-box}",
	".dshj-footer-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));color:var(--dsw-alias-label-primary,#222)}",
	".dshj-footer-btn-rail{width:36px;height:36px;padding:0;border-radius:50%}",
	".dshj-footer-group{display:flex;align-items:center;gap:8px;width:100%;padding:0 6px 6px;box-sizing:border-box}",
	".dshj-footer-group .dshj-footer-btn{flex:1;min-width:0}",
	".dshj-footer-rail-group{flex-direction:column;width:auto;padding:0;gap:4px}",
	".dshj-footer-rail-group .dshj-footer-btn{flex:none}",
	".dshj-footer-logo{height:16px;width:auto;flex:none;display:block}",
	".dshj-footer-rail-group .dshj-footer-logo{height:20px}",
	".dshj-footer-label{white-space:nowrap}",
	".dshj-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;pointer-events:auto}",
	".dshj-modal{background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.28);width:720px;max-width:100%;min-height:400px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;color:var(--dsw-alias-label-primary,#222);font-size:14px}",
	".dshj-modal-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);flex:none}",
	".dshj-modal-title{font-size:15px;font-weight:600}",
	".dshj-modal-sub{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:2px;word-break:break-all}",
	".dshj-close{border:none;background:transparent;color:var(--dsw-alias-label-secondary,#888);font-size:16px;cursor:pointer;padding:4px 8px;border-radius:6px}",
	".dshj-close:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));color:var(--dsw-alias-label-primary,#222)}",
	".dshj-tabs{display:flex;gap:6px;padding:10px 18px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);overflow-x:auto;flex:none}",
	".dshj-tab{padding:5px 12px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,#666);font-size:13px;cursor:pointer;white-space:nowrap}",
	".dshj-tab:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1))}",
	".dshj-tab-active{background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3));color:var(--dsw-alias-label-primary-foreground,#fff);border-color:transparent;font-weight:500}",
	".dshj-server-field{display:grid;grid-template-columns:168px 340px;align-items:center;gap:10px;padding:10px 18px 0;flex:none}",
	".dshj-server-label{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666);text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
	".dshj-divider{border-top:1px dashed var(--dsw-alias-border-l3,#bbb);margin:14px 18px 2px;flex:none}",
	".dshj-picker-error .dshj-picker-value{color:var(--dsw-alias-state-error-primary,#d33)}",
	".dshj-picker{display:flex;align-items:center;gap:8px;width:100%;height:34px;padding:0 12px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:8px;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#222);font-size:13px;font-family:inherit;cursor:pointer;transition:border-color .15s,box-shadow .15s}",
	".dshj-picker:hover:not(:disabled){border-color:var(--dsw-alias-border-l3,#b8b8b8)}",
	".dshj-picker:focus{outline:none;border-color:var(--dsw-alias-brand-primary,#1668e3);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 18%,transparent)}",
	".dshj-picker:disabled{opacity:.5;cursor:not-allowed}",
	".dshj-picker-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}",
	".dshj-picker-empty .dshj-picker-value{color:var(--dsw-alias-label-tertiary,#aaa)}",
	".dshj-picker-caret{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary,#888)}",
	".dshj-picker-modal{width:min(480px,100%);height:min(72vh,480px);animation:none;transition:none}",
	".dshj-json-backdrop{z-index:1100}",
	".dshj-json-modal{width:min(620px,100%);height:min(72vh,520px);min-height:360px}",
	".dshj-picker-card{display:flex;flex-direction:column;height:100%;min-height:0;gap:0}",
	".dshj-picker-card-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);flex:none}",
	".dshj-picker-card-title{font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary,#222)}",
	".dshj-picker-card-body{display:flex;flex-direction:column;gap:10px;flex:1;min-height:0;padding:14px 18px;overflow:hidden}",
	".dshj-picker-card-body .dshj-input{flex:none}",
	".dshj-picker-list{display:flex;flex-direction:column;gap:2px;flex:1;min-height:0;overflow-y:auto;padding:2px}",
	".dshj-picker-item{flex:none;display:block;width:100%;text-align:left;padding:8px 10px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#222);font-size:13px;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
	".dshj-picker-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}",
	".dshj-picker-active{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.09));font-weight:600}",
	".dshj-modal-body{flex:1;overflow-y:auto;padding:16px 18px;min-width:0;min-height:0}",
	".dshj-history-modal{min-height:400px;max-height:80vh;width:560px}",
	".dshj-history-list{display:flex;flex-direction:column;gap:8px}",
	".dshj-history-item{border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:10px;padding:8px 12px;background:var(--dsw-alias-bg-base,#fff)}",
	".dshj-history-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px}",
	".dshj-history-time{font-size:12px;color:var(--dsw-alias-label-secondary,#888)}",
	".dshj-history-result{font-size:12px;font-weight:600}",
	".dshj-history-pending{color:var(--dsw-alias-label-tertiary,#aaa)}",
	".dshj-history-main{font-size:13px;font-weight:500;word-break:break-all}",
	".dshj-history-ws{font-size:11px;color:var(--dsw-alias-label-tertiary,#aaa);margin-bottom:2px;word-break:break-all}",
	".dshj-history-params{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:3px;word-break:break-all}",
	".dshj-history-ops{margin-top:12px;display:flex;justify-content:flex-end}",
	".dshj-spinner{width:14px;height:14px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2,#ccc);border-top-color:var(--dsw-alias-brand-primary,#1668e3);animation:dshj-spin .8s linear infinite;margin:12px 0}",
	"@keyframes dshj-spin{to{transform:rotate(360deg)}}",
	".dshj-run-title{font-size:15px;font-weight:600;margin-bottom:8px}",
	".dshj-run-message{font-size:13px;margin-bottom:12px}",
	".dshj-run-line{margin:4px 0;font-size:13px}",
	".dshj-link{color:var(--dsw-alias-brand-primary,#1668e3);text-decoration:none}",
	".dshj-link:hover{text-decoration:underline}",
	".dshj-settings{display:flex;flex-direction:column;gap:12px}",
	".dshj-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}",
	".dshj-title{font-size:14px;font-weight:600}",
	".dshj-list{display:flex;flex-direction:column;gap:8px}",
	".dshj-card{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-2,#fafafa)}",
	".dshj-card-main{min-width:0}",
	".dshj-card-name{font-size:13px;font-weight:600}",
	".dshj-card-meta{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:2px;word-break:break-all}",
	".dshj-card-ops{display:flex;gap:6px;flex:none;flex-wrap:wrap}",
	".dshj-editor{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:14px 16px;background:var(--dsw-alias-bg-layer-2,#fafafa)}",
	".dshj-editor-title{font-size:13px;font-weight:600;margin-bottom:12px}",
	".dshj-editor-ops{display:flex;gap:8px;margin-top:4px;flex-wrap:wrap}",
	".dshj-result{font-size:12px;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-2,#fafafa);margin-top:8px}",
	".dshj-template{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:12px 14px;background:var(--dsw-alias-bg-layer-2,#fafafa)}",
	".dshj-template-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px}",
	".dshj-template-title{font-size:13px;font-weight:600}",
	".dshj-template-tabs{display:flex;gap:6px}",
	".dshj-code-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}",
	".dshj-code-file{font-size:12px;color:var(--dsw-alias-label-secondary,#888);font-family:ui-monospace,SFMono-Regular,Consolas,monospace}",
	".dshj-code{margin:0;padding:12px 14px;background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;overflow:auto;max-height:52vh;font-size:12px;line-height:1.55;color:var(--dsw-alias-label-primary,#222);white-space:pre;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}",
	".dshj-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-bottom:10px}"
].join("\n");
/** 注入 <style>（幂等：已存在则不重复注入）。 */
function injectStyles() {
	if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=\"dsh-jenkins/settings.css\"]") === null) {
		const tag = document.createElement("style");
		tag.dataset.plugin = "dsh-jenkins";
		tag.dataset.pluginCss = CSS_ID;
		tag.textContent = css;
		document.head.appendChild(tag);
	}
}
//#endregion
//#region src/client/i18n.ts
/**
* dsh-jenkins —— 浏览器半边：语言与文案（中英双语，跟随主界面语言）。
*/
function resolveLang() {
	if (typeof document !== "undefined") {
		const host = document.documentElement.lang || navigator.language || "zh-CN";
		return /^zh/i.test(host) ? "zh" : "en";
	}
	return "zh";
}
const LANG = resolveLang();
const COPY = {
	zh: {
		settingsNav: "Jenkins 配置",
		settingsTitle: "Jenkins 服务器配置",
		serverField: "服务器",
		serverPlaceholder: "搜索并选择服务器…",
		noServersHint: "未配置服务器，请先到设置中添加",
		configMark: "（配置）",
		jobField: "Job 列表",
		jobPlaceholder: "搜索并选择 Job…",
		jobsLoading: "加载 Job 列表…",
		jobsFailed: "加载 Job 列表失败",
		jobsEmpty: "该服务器下没有可构建的 Job",
		historyBtn: "历史",
		historyTitle: "发布历史",
		historyEmpty: "暂无发布记录，发布一次后这里会显示历史",
		historyClear: "清空",
		historyParams: "参数：",
		historyPending: "进行中",
		historyAll: "全部",
		historyWsField: "工作区",
		historyWsPlaceholder: "搜索并选择工作区…",
		pickerNoMatch: "无匹配选项",
		pickerSearchPlaceholder: "搜索…",
		jobRequired: "请先选择要发布的 Job",
		selectJobFirst: "请先在 Job 列表中选择要发布的 Job",
		templateBtn: "模板",
		templateTitle: "配置模板",
		templateHint: "选择格式查看 dsh-Jenkins 配置模板（放到工作区根目录，数组形式配置多个发布目标：job + server + environments 参数）",
		copy: "复制",
		copied: "已复制",
		loadingParams: "加载任务参数…",
		detailFailed: "加载任务参数失败",
		typeLabel: "（{t}）",
		typeString: "字符串",
		typeText: "多行文本",
		typeBoolean: "布尔",
		typeChoice: "下拉选择",
		typePassword: "密码",
		typeCredentials: "凭据",
		typeFile: "文件",
		addServer: "添加服务器",
		addTitle: "添加 Jenkins 服务器",
		editTitle: "编辑 Jenkins 服务器",
		nameLabel: "名称（选填）",
		namePlaceholder: "选填，留空用服务器地址",
		urlLabel: "服务器地址",
		urlPlaceholder: "https://jenkins.example.com",
		usernameLabel: "用户名（选填）",
		usernamePlaceholder: "选填，缺省 admin",
		tokenLabel: "Token",
		tokenPlaceholder: "API Token 或密码",
		tokenSaved: "已保存：",
		keepToken: "（留空则不修改）",
		tlsLabel: "跳过 TLS 证书校验（自签名证书）",
		testBtn: "测试连接",
		testing: "测试中…",
		saveBtn: "保存",
		cancelBtn: "取消",
		loading: "加载中…",
		connected: "连接成功",
		testFailed: "测试失败",
		connectionFailed: "连接失败：",
		saveFailed: "保存失败",
		deleteBtn: "删除",
		confirmDelete: "确认删除",
		editBtn: "编辑",
		runJob: "执行 Jenkins Job",
		close: "关闭",
		phaseQueued: "排队中",
		phaseRunning: "构建中",
		phaseDone: "构建完成",
		phaseError: "出错了",
		queuedMsg: "已提交到构建队列（#{n}），等待开始…",
		triggeredMsg: "构建已触发（未获得队列编号），正在轮询状态…",
		pollTimeout: "轮询超时（10 分钟），请到 Jenkins 页面查看实际状态",
		queuePollFailed: "查询队列失败",
		buildPollFailed: "查询构建状态失败",
		buildStarted: "构建已开始（#{n}）…",
		cancelled: "构建已取消：",
		unknownReason: "未知原因",
		queuing: "排队中：",
		waitingExecutor: "等待可用执行器",
		buildingRun: "构建中…（已运行 {d}）",
		buildEnded: "构建结束",
		resultLabel: "构建 #{n} 结果：",
		duration: "耗时：",
		openPage: "打开构建页面 ↗",
		backParams: "返回参数",
		rebuild: "再次构建",
		serverMismatch: "配置中的服务器未匹配到已配置服务器：{list}，已显示全部服务器，请手动选择",
		noParams: "该任务没有参数，可直接构建。",
		submit: "提交构建",
		submitting: "提交中…",
		viewParams: "查看表单参数",
		formParamsJson: "表单参数（JSON）",
		triggerFailed: "触发构建失败",
		cmdNoResult: "命令未返回结果",
		sec: " 秒",
		min: " 分 ",
		hour: " 时 ",
		errors: {
			"url-invalid": "服务器地址需以 http:// 或 https:// 开头",
			"token-required": "请填写 Token",
			"server-missing": "服务器不存在，请先在设置中配置",
			"fields-missing": "请填写服务器地址和 Token",
			"auth-failed": "认证失败：用户名或 Token 不正确（HTTP 401）",
			"forbidden": "权限不足（HTTP 403）",
			"connect-failed": "连接失败，请检查服务器地址",
			"no-config": "工作区根目录未找到 dsh-jenkins.json/js/ts 配置",
			"redirect": "服务器返回重定向，请检查服务器地址是否为最终地址（如 https://…）",
			"trigger-http": "触发构建失败",
			"network-failed": "网络请求失败，请检查网络或 Jenkins 地址",
			"not-found": "资源不存在（HTTP 404）",
			"job-path-invalid": "无法解析任务路径",
			"queue-id-missing": "缺少队列 ID",
			"cwd-missing": "缺少工作区路径",
			"parse-failed": "响应解析失败",
			"build-not-found": "尚未找到构建记录",
			"unknown-op": "未知操作",
			"params-invalid": "参数需为 JSON"
		}
	},
	en: {
		settingsNav: "Jenkins Cli Config",
		settingsTitle: "Jenkins Server Config",
		serverField: "Server",
		serverPlaceholder: "Search and select server…",
		noServersHint: "No servers configured; add one in settings",
		configMark: " (config)",
		jobField: "Job List",
		jobPlaceholder: "Search and select a job…",
		jobsLoading: "Loading jobs…",
		jobsFailed: "Failed to load jobs",
		jobsEmpty: "No buildable jobs on this server",
		historyBtn: "History",
		historyTitle: "Publish History",
		historyEmpty: "No publish history yet",
		historyClear: "Clear",
		historyParams: "Params: ",
		historyPending: "Running",
		historyAll: "All",
		historyWsField: "Workspace",
		historyWsPlaceholder: "Search and select workspace…",
		pickerNoMatch: "No matching options",
		pickerSearchPlaceholder: "Search…",
		jobRequired: "Please select a job to publish",
		selectJobFirst: "Select a job from the list first",
		templateBtn: "Template",
		templateTitle: "Config Template",
		templateHint: "Choose a format to view the dsh-jenkins config template (place it in the workspace root; an array of deploy targets, each with job + server + environments params)",
		copy: "Copy",
		copied: "Copied",
		loadingParams: "Loading job parameters…",
		detailFailed: "Failed to load job parameters",
		typeLabel: " ({t})",
		typeString: "string",
		typeText: "text",
		typeBoolean: "boolean",
		typeChoice: "choice",
		typePassword: "password",
		typeCredentials: "credentials",
		typeFile: "file",
		addServer: "Add server",
		addTitle: "Add Jenkins Server",
		editTitle: "Edit Jenkins Server",
		nameLabel: "Name (optional)",
		namePlaceholder: "Optional; defaults to server URL",
		urlLabel: "Server URL",
		urlPlaceholder: "https://jenkins.example.com",
		usernameLabel: "Username (optional)",
		usernamePlaceholder: "Optional; defaults to admin",
		tokenLabel: "Token",
		tokenPlaceholder: "API Token or password",
		tokenSaved: "Saved: ",
		keepToken: " (leave blank to keep)",
		tlsLabel: "Skip TLS verification (self-signed cert)",
		testBtn: "Test connection",
		testing: "Testing…",
		saveBtn: "Save",
		cancelBtn: "Cancel",
		loading: "Loading…",
		connected: "Connected",
		testFailed: "Test failed",
		connectionFailed: "Connection failed: ",
		saveFailed: "Save failed",
		deleteBtn: "Delete",
		confirmDelete: "Confirm delete",
		editBtn: "Edit",
		runJob: "Run Jenkins Job",
		close: "Close",
		phaseQueued: "Queued",
		phaseRunning: "Building",
		phaseDone: "Build finished",
		phaseError: "Error",
		queuedMsg: "Submitted to queue (#{n}), waiting…",
		triggeredMsg: "Build triggered (no queue id); polling…",
		pollTimeout: "Polling timed out (10 min); check Jenkins",
		queuePollFailed: "Queue query failed",
		buildPollFailed: "Status query failed",
		buildStarted: "Build started (#{n})…",
		cancelled: "Build cancelled: ",
		unknownReason: "unknown reason",
		queuing: "Queued: ",
		waitingExecutor: "waiting for an executor",
		buildingRun: "Building… (running {d})",
		buildEnded: "Build finished",
		resultLabel: "Build #{n} result: ",
		duration: "Duration: ",
		openPage: "Open build page ↗",
		backParams: "Back",
		rebuild: "Rebuild",
		serverMismatch: "Config servers not found in the configured list: {list}; showing all servers, please select manually",
		noParams: "No parameters for this job; build directly.",
		submit: "Submit build",
		submitting: "Submitting…",
		viewParams: "View form params",
		formParamsJson: "Form Params (JSON)",
		triggerFailed: "Failed to trigger build",
		cmdNoResult: "Command returned no result",
		sec: "s",
		min: "m ",
		hour: "h ",
		errors: {
			"url-invalid": "Server URL must start with http:// or https://",
			"token-required": "Token is required",
			"server-missing": "Server not found; configure it in settings first",
			"fields-missing": "Enter server URL and Token",
			"auth-failed": "Authentication failed: wrong username or Token (HTTP 401)",
			"forbidden": "Permission denied (HTTP 403)",
			"connect-failed": "Connection failed; check the server URL",
			"no-config": "No dsh-jenkins.json/js/ts config in workspace root",
			"redirect": "Server returned a redirect; check that the URL is the final one (e.g. https://…)",
			"trigger-http": "Failed to trigger build",
			"network-failed": "Network request failed; check the network or the Jenkins URL",
			"not-found": "Resource not found (HTTP 404)",
			"job-path-invalid": "Unable to parse job path",
			"queue-id-missing": "Missing queue ID",
			"cwd-missing": "Missing workspace path",
			"parse-failed": "Failed to parse response",
			"build-not-found": "No build record found yet",
			"unknown-op": "Unknown operation",
			"params-invalid": "Parameters must be JSON"
		}
	}
};
const dict = COPY[LANG] || COPY.zh;
/** 取文案并替换 {var} 占位符。 */
const t = (key, vars) => {
	let s = dict[key] !== void 0 ? dict[key] : String(key);
	if (vars) for (const k of Object.keys(vars)) s = s.split("{" + k + "}").join(String(vars[k]));
	return s;
};
/** 宿主错误通过 code 映射为本地化文本，未知错误回退原文。 */
const tErr = (res, fallback) => {
	if (res && res.code) {
		const local = dict.errors[res.code];
		if (local !== void 0) {
			const zh = LANG === "zh";
			if (res.code === "trigger-http") return t("triggerFailed") + (zh ? "（HTTP " : " (HTTP ") + res.status + (zh ? "）：" : "): ") + (res.detail || "");
			if (res.code === "network-failed") {
				const detail = res.error ? String(res.error).replace(/^(网络请求失败|Network request failed)[:：]\s*/, "").trim() : "";
				return local + (detail ? (zh ? "：" : ": ") + detail : "");
			}
			return local;
		}
	}
	return res && res.error || fallback || "";
};
/** 时长格式化（配合 t('sec'/'min'/'hour')）。 */
const fmtDur = (ms) => {
	if (!ms || ms < 0) return "—";
	const s = Math.floor(ms / 1e3);
	if (s < 60) return s + t("sec");
	const m = Math.floor(s / 60);
	if (m < 60) return m + t("min") + s % 60 + t("sec");
	return Math.floor(m / 60) + t("hour") + m % 60 + t("min");
};
//#endregion
//#region src/client/rpc.ts
/**
* dsh-jenkins —— 浏览器半边：与宿主通信（commands.execute → JSON 文本 → 结果载荷）。
*/
function makeRun(ctx) {
	return async function run(sessionId, op) {
		try {
			const execution = await ctx.remote.commands.execute(sessionId || "", "/dsh-jenkins " + JSON.stringify(op));
			const value = execution && execution.ok === true ? execution.value : void 0;
			const text = value && value.result && typeof value.result.text === "string" ? value.result.text : null;
			if (text === null || text.length === 0) return {
				ok: false,
				error: t("cmdNoResult")
			};
			try {
				return JSON.parse(text);
			} catch {
				return {
					ok: false,
					error: text.slice(0, 200)
				};
			}
		} catch (e) {
			return {
				ok: false,
				error: e instanceof Error ? e.message : String(e)
			};
		}
	};
}
//#endregion
//#region src/client/store.ts
/**
* dsh-jenkins —— 浏览器半边：弹框开关（footer 按钮 ↔ overlay 弹框共享）。
*/
function createStore() {
	return {
		value: null,
		listeners: [],
		emit() {
			for (let i = 0; i < this.listeners.length; i++) this.listeners[i]();
		},
		subscribe(l) {
			this.listeners.push(l);
			return () => {
				const i = this.listeners.indexOf(l);
				if (i >= 0) this.listeners.splice(i, 1);
			};
		},
		open(value) {
			this.value = value;
			this.emit();
		},
		close() {
			this.value = null;
			this.emit();
		}
	};
}
function makeLaunchStore() {
	const store = createStore();
	const useLaunch = () => {
		const [v, setV] = (0, react.useState)(store.value);
		(0, react.useEffect)(() => store.subscribe(() => setV(store.value)), []);
		return v;
	};
	return {
		store,
		useLaunch
	};
}
function makeHistoryStore() {
	const store = createStore();
	const useLaunch = () => {
		const [v, setV] = (0, react.useState)(store.value);
		(0, react.useEffect)(() => store.subscribe(() => setV(store.value)), []);
		return v;
	};
	return {
		store,
		useLaunch
	};
}
//#endregion
//#region src/client/logo.ts
/**
* dsh-jenkins —— Jenkins 官方 logo（assets/logo.svg 压缩后内联为 data URI，由脚本注入，勿手改）。
*/
const JENKINS_LOGO = "data:image/svg+xml;base64," + [
	"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMjYiIGhlaWdodD0i",
	"MzEyIj48ZyB0cmFuc2Zvcm09Im1hdHJpeCgxLjI1LDAsMCwtMS4yNSwwLDMxMikiPjxnID48cGF0aCBk",
	"PSJtIDE3Ny43MTgsMTI5LjI2NCBjIDAsLTQ5LjQyODggLTM5LjE3NSwtODkuNDk5MiAtODcuNSwtODku",
	"NDk5MiAtNDguMzI0MiwwIC04Ny40OTkyNSw0MC4wNzA0IC04Ny40OTkyNSw4OS40OTkyIDAsNDkuNDMg",
	"MzkuMTc1MDUsODkuNTAxIDg3LjQ5OTI1LDg5LjUwMSA0OC4zMjUsMCA4Ny41LC00MC4wNzEgODcuNSwt",
	"ODkuNTAxIiBzdHlsZT0iZmlsbDojZDMzODMzO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2Rk",
	"O3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0gNi4yODQzOCwxMDcuMDk4IGMgMCwwIC02LjMzNDM4LDkz",
	"LjMzMyA3OS42NjYwMiw5NiBsIC01Ljk5OTYsMTAgLTQ2LjY2NjQsLTE1LjY2NyAtMTMuMzMzNiwtMTUu",
	"MzMzIC0xMS42NjY0MiwtMjIuMzM0IC02LjY2NzE5LC0yNiAyLC0xNy4zMzMiIHN0eWxlPSJmaWxsOiNl",
	"ZjNkM2E7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiIC8+PHBhdGgg",
	"ZD0iTSAzMC4yODgzLDE5MC4zMTkgQyAxNC45MzYzLDE3NC42MTEgNS40MzYzMywxNTIuOTIzIDUuNDM2",
	"MzMsMTI4LjkzIGwgMCwwIGMgMCwtMjMuOTg4IDkuNDk5OTcsLTQ1LjY3ODggMjQuODUxOTcsLTYxLjM4",
	"MzkgbCAwLDAgQyA0NS42NDc3LDUxLjg0MSA2Ni44MTUyLDQyLjE1IDkwLjIxNjgsNDIuMTUgbCAwLDAg",
	"YyAyMy40MDIyLDAgNDQuNTcxMiw5LjY5MSA1OS45MjkyLDI1LjM5NjEgbCAwLDAgYyAxNS4zNTEsMTUu",
	"NzA1MSAyNC44NTMsMzcuMzk1OSAyNC44NTMsNjEuMzgzOSBsIDAsMCBjIDAsMjMuOTkzIC05LjUwMiw0",
	"NS42ODEgLTI0Ljg1Myw2MS4zODkgbCAwLDAgYyAtMTUuMzU4LDE1LjcwMiAtMzYuNTI3LDI1LjM5MyAt",
	"NTkuOTI5MiwyNS4zOTUgbCAwLDAgQyA2Ni44MTUyLDIxNS43MTIgNDUuNjQ3NywyMDYuMDIxIDMwLjI4",
	"ODMsMTkwLjMxOSBsIDAsMCB6IE0gMjYuNDAyMyw2My43NDY5IEMgMTAuMDg2Nyw4MC40MzI4IDAsMTAz",
	"LjQ5MyAwLDEyOC45MyBsIDAsMCBjIDAsMjUuNDQxIDEwLjA4NjcsNDguNDk5IDI2LjQwMjMsNjUuMTg2",
	"IGwgMCwwIGMgMTYuMzExOCwxNi42OSAzOC44OTE1LDI3LjAzNSA2My44MTQ1LDI3LjAzMiBsIDAsMCBj",
	"IDI0LjkyMzIsMC4wMDMgNDcuNTA1MiwtMTAuMzQyIDYzLjgxNDIsLTI3LjAzMiBsIDAsMCBjIDE2LjMx",
	"NywtMTYuNjg3IDI2LjQwNSwtMzkuNzQ3IDI2LjQwMywtNjUuMTg2IGwgMCwwIGMgMC4wMDIsLTI1LjQz",
	"NyAtMTAuMDg2LC00OC40OTcyIC0yNi40MDMsLTY1LjE4MzEgbCAwLDAgQyAxMzcuNzIyLDQ3LjA1Nzgg",
	"MTE1LjE0LDM2LjcxNDEgOTAuMjE2OCwzNi43MTQxIGwgMCwwIGMgLTI0LjkyMywwIC00Ny41MDI3LDEw",
	"LjM0MzcgLTYzLjgxNDUsMjcuMDMyOCBsIDAsMCIgc3R5bGU9ImZpbGw6IzIzMWYyMDtmaWxsLW9wYWNp",
	"dHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIgLz48cGF0aCBkPSJtIDEyNy4wNTEsMTI4",
	"Ljc2OCAtMTMuMzM0LC0yIC0xOC4wMDAyLC0yIC0xMS42NjcyLC0wLjMzMyAtMTEuMzMyOCwwLjMzMyAt",
	"OC42NjcyLDIuNjY3IC03LjY2NjgsOC4zMzMgLTYsMTcgLTEuMzMzMiwzLjY2NyAtOCwyLjY2NiAtNC42",
	"NjY4LDcuNjY3IC0zLjMzMzIsMTEgMy42NjcyLDkuNjY3IDguNjY2LDMgNywtMy4zMzQgMy4zMzQsLTcu",
	"MzMzIDQsMC42NjcgMS4zMzI4LDEuNjY2IC0xLjMzMjgsNy42NjcgLTAuMzM0LDkuNjY3IDIsMTMuMzMz",
	"IC0wLjA3ODEsNy42MTYgNi4wNzgxLDkuNzE3IDEwLjY2NjgsNy42NjcgMTguNjY3Miw4IDIwLjY2NjIs",
	"LTMgMTgsLTEzIDguMzM0LC0xMy4zMzMgNS4zMzMsLTkuNjY3IDEuMzMzLC0yNCAtNCwtMjAuNjY3IC03",
	"LjMzMywtMTguMzMzIC03LC05LjY2NyIgc3R5bGU9ImZpbGw6I2YwZDZiNztmaWxsLW9wYWNpdHk6MTtm",
	"aWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSIgLz48cGF0aCBkPSJtIDExNS43MTcsNzEuMTAyIC00",
	"Ny42Njc0LC0yIDAsLTggNCwtMjggLTIsLTIuMzM0IC0zMy4zMzI4LDExLjMzNCAtMi4zMzQsNCAtMy4z",
	"MzMyLDM3LjY2NiAtNy42NjU2LDIyLjY2NyAtMS42NjcyLDUuMzMzIDI2LjY2NiwxOC4zMzMgOC4zMzQs",
	"My4zMzQgNy4zMzI4LC05IDYuMzMzMiwtNS42NjcgNy4zMzQsLTIuMzMzIDMuMzMyOCwtMSA0LC0xNy4z",
	"MzMgMywtMy42NjY4IDcuNjY3MiwyLjY2NjggLTUuMzM0LC0xMC4zMzQgMjkuMDAwMiwtMTMuNjY2IC0z",
	"LjY2NiwtMiIgc3R5bGU9ImZpbGw6IzMzNTA2MTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9k",
	"ZDtzdHJva2U6bm9uZSIgLz48cGF0aCBkPSJtIDM2LjcxNjgsMTg3LjQzNSA4LjY2NiwzIDcsLTMuMzM0",
	"IDMuMzM0LC03LjMzMyA0LDAuNjY3IDEsNCAtMiw3LjY2NiAyLDE4LjMzNCAtMS42NjcyLDEwIDYsNyAx",
	"MywxMC4zMzMgLTMuNjY2OCw1IC0xOC4zMzMyLC05IC03LjY2NjgsLTYgLTQuMzMzMiwtOS4zMzMgLTYu",
	"NjY2OCwtOSAtMiwtMTAuNjY3IDEuMzM0LC0xMS4zMzMiIHN0eWxlPSJmaWxsOiM2ZDZiNmQ7ZmlsbC1v",
	"cGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiIC8+PHBhdGggZD0ibSA1MC4zODI4",
	"LDIxOC43NjggYyAwLDAgNSwxMi4zMzMgMjUsMTguMzMzIDIwLDYgMSw0LjMzNCAxLDQuMzM0IGwgLTIx",
	"LjY2NiwtOC4zMzQgLTguMzM0LC04LjMzMyAtMy42NjYsLTYuNjY3IDcuNjY2LDAuNjY3IiBzdHlsZT0i",
	"ZmlsbDojZGNkOWQ4O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAv",
	"PjxwYXRoIGQ9Im0gNDAuMzgyOCwxODkuNzY4IGMgMCwwIC03LDIzLjMzNCAxOS42NjY4LDI2LjY2NyBs",
	"IC0xLDQgLTE4LjMzMjgsLTQuMzM0IC01LjMzNCwtMTcuMzMzIDEuMzM0LC0xMS4zMzMgMy42NjYsMi4z",
	"MzMiIHN0eWxlPSJmaWxsOiNkY2Q5ZDg7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ry",
	"b2tlOm5vbmUiIC8+PHBhdGggZD0ibSA1MS4wNDk2LDE1OC43NjggNC4zNjQ1LDQuMjI5IGMgMCwwIDEu",
	"OTY5OSwtMC4yMjkgMi4zMDI3LC0yLjU2MiAwLjMzMjgsLTIuMzM0IDEuMzMyOCwtMjMuMzM0IDE1LjY2",
	"NiwtMzQuNjY4IDEuMzA3NCwtMS4wMzQgLTEwLjY2NiwxLjY2OCAtMTAuNjY2LDEuNjY4IGwgLTEwLjY2",
	"NzIsMTYuNjY2IiBzdHlsZT0iZmlsbDojZjdlNGNkO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVu",
	"b2RkO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0gMTEyLjM4NSwxNjUuMTAxIGMgMCwwIDAuNzc3LDEw",
	"LjEwNCAzLjQ5OCw5LjMyNyAyLjcyMSwtMC43NzcgMi43MjEsLTMuNDk4IDIuNzIxLC0zLjQ5OCAwLDAg",
	"LTYuNjA4LC00LjI3NSAtNi4yMTksLTUuODI5IiBzdHlsZT0iZmlsbDojZjdlNGNkO2ZpbGwtb3BhY2l0",
	"eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0gMTQwLjA1LDIwMi4x",
	"MDEgYyAwLDAgLTUuNDk0LC0xLjE2IC02LC02IC0wLjUwNiwtNC44NDEgNiwtMSA3LC0wLjY2NyIgc3R5",
	"bGU9ImZpbGw6I2Y3ZTRjZDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9u",
	"ZSIgLz48cGF0aCBkPSJtIDk5LjcxNjgsMjAxLjc2NyBjIDAsMCAtNy4zMzQsLTEgLTcuMzM0LC01LjY2",
	"NiAwLC00LjY2NyA4LjMzNDIsLTQuMzM0IDEwLjY2NzIsLTIuMzM0IiBzdHlsZT0iZmlsbDojZjdlNGNk",
	"O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0g",
	"NTQuMzgyOCwxODAuMTAxIGMgMCwwIC0xMi42NjcyLDcuNjY3IC0xNCwwLjMzMyAtMS4zMzMyLC03LjMz",
	"MyAtNC4zMzQsLTEyLjY2NyAyLC0yMC4zMzMgbCAtNC4zMzMyLDEuMzMzIC00LDEwLjMzMyAtMS4zMzI4",
	"LDEwIDcuNjY2LDguMDAxIDguNjY2OCwtMC42NjcgNSwtNCAwLjMzMzIsLTUiIHN0eWxlPSJmaWxsOiNm",
	"N2U0Y2Q7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiIC8+PHBhdGgg",
	"ZD0ibSA2MC4zODI4LDIwMS4xMDEgYyAwLDAgNS42NjY4LDI5LjMzMyAzNC4zMzQsMzUgMjMuNjAxMiw0",
	"LjY2NSAzNS45OTkyLC0xIDQwLjY2NjIsLTYuMzMzIDAsMCAtMjEsMjQuOTk5IC00MS4wMDAyLDE3LjMz",
	"MyAtMjAsLTcuNjY3IC0zNC42NjYsLTIxLjY2NyAtMzQuMzMzMiwtMzAuNjY2IDAuNTY3NiwtMTUuMzI4",
	"IDAuMzMzMiwtMTUuMzM0IDAuMzMzMiwtMTUuMzM0IiBzdHlsZT0iZmlsbDojZjdlNGNkO2ZpbGwtb3Bh",
	"Y2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0gMTM3LjcxNywy",
	"MjYuNDM1IGMgMCwwIC05LjY2NiwwLjMzMyAtMTAsLTguMzM0IDAsMCAtMC4wMDEsLTEuMzMzIDAuNjY2",
	"LC0yLjY2NiAwLDAgNy42NjgsOC42NjcgMTIuMzM0LDQiIHN0eWxlPSJmaWxsOiNmN2U0Y2Q7ZmlsbC1v",
	"cGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiIC8+PHBhdGggZD0ibSA5NS4zODg3",
	"LDIxNC41MzIgYyAwLDAgLTEuNjY0MSwxMy4zMDMgLTEzLjAwNTksNS41NjkgLTcuMzMzMiwtNSAtNi42",
	"NjYsLTEyIC01LjMzMzIsLTEzLjMzMyAxLjMzMzIsLTEuMzM0IDAuOTcwNywtNC4wMTkgMS45ODU2LC0y",
	"LjE3NiAxLjAxNDQsMS44NDMgMC42ODA0LDcuODQzIDQuMzQ3Niw5LjUwOSAzLjY2NjgsMS42NjcgOS42",
	"Nzc3LDMuNTI5IDEyLjAwNTksMC40MzEiIHN0eWxlPSJmaWxsOiNmN2U0Y2Q7ZmlsbC1vcGFjaXR5OjE7",
	"ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiIC8+PHBhdGggZD0ibSA2NC4wNDk2LDEyNC40MzUg",
	"LTMxLjMzMjgsLTE0IGMgMCwwIDEzLC01MS42NjcgNi4zMzI4LC02Ny42NjcgbCAtNC42NjY4LDEuNjY2",
	"IC0wLjMzMzIsMTkuNjY3MiAtOC42NjU2LDM3LjMzMjggLTMuNjY3MiwxMC4zMzQgMzIuNjY2LDIxLjk5",
	"OSA5LjY2NjgsLTkuMzMyIiBzdHlsZT0iZmlsbDojNDk3MjhiO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVs",
	"ZTpldmVub2RkO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0gNjcuMjcxNSw5NS44NTc4IDQuNDQ1Mywt",
	"NS40MjM4IDAsLTIwIC01LjMzNCwwIGMgMCwwIC0wLjY2NiwxNCAtMC42NjYsMTUuNjY3MiAwLDEuNjY2",
	"OCAwLjY2Niw3LjY2NjggMC42NjYsNy42NjY4IiBzdHlsZT0iZmlsbDojNDk3MjhiO2ZpbGwtb3BhY2l0",
	"eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0gNjcuMzgyOCw2Ny40",
	"MzQgLTE1LC0wLjY2NiA0LjMzNCwtMyAxMC42NjYsLTEuNjY2OCIgc3R5bGU9ImZpbGw6IzQ5NzI4Yjtm",
	"aWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSIgLz48cGF0aCBkPSJtIDEx",
	"OC43MTcsNzAuNzY4IDEyLjMzMywwLjMzMzIgMywtMzAuNjY3MiAtMTIuNjY3LC0xLjY2NiAtMi42NjYs",
	"MzIiIHN0eWxlPSJmaWxsOiMzMzUwNjE7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ry",
	"b2tlOm5vbmUiIC8+PHBhdGggZD0ibSAxMjIuMDUsNzAuNzY4IDE4LjY2NywxIGMgMCwwIDcuNjY2LDE5",
	"LjMzMzIgNy42NjYsMjAuMzMzMiAwLDEgNi42NjcsMjcuOTk5OCA2LjY2NywyNy45OTk4IGwgLTE1LDE1",
	"LjY2NiAtMywyLjY2NyAtOCwtOCAwLC0zMSAtNywtMjguNjY2IiBzdHlsZT0iZmlsbDojMzM1MDYxO2Zp",
	"bGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0gMTMw",
	"LjM4Myw3My4xMDEyIC0xMS42NjYsLTIuMzMzMiAxLjY2NiwtOS4zMzQgYyA0LjMzMywtMiAxMS42Njcs",
	"My4zMzQgMTEuNjY3LDMuMzM0IiBzdHlsZT0iZmlsbDojNDk3MjhiO2ZpbGwtb3BhY2l0eToxO2ZpbGwt",
	"cnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0gMTMwLjcxNywxMzEuNDM0IDIzLjMz",
	"MywtMTcuMzMzIDAuNjY3LDggLTE3LjY2NywxNi4zMzMgLTYuMzMzLC03IiBzdHlsZT0iZmlsbDojNDk3",
	"MjhiO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9",
	"Ik0gNzguOTUwOCw1LjA5ODA1IDcyLjA0OTYsMzMuMTAyIDY4LjYxNzIsNTMuNzY0OCA2OC4wNDk2LDY5",
	"LjEwMiBsIDMxLjIzNDgsMS42NjI4IDE5LjQzMjYsMC4wMDMyIC0xLjc2NywtMzUuMDAzMiAzLC0yNi45",
	"OTk5NiAtMC4zMzMsLTUgLTI1LjMzMjYsLTIgLTE1LjMzMzYsMy4zMzMyMSIgc3R5bGU9ImZpbGw6I2Zm",
	"ZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSIgLz48cGF0aCBk",
	"PSJtIDExNC4zODMsNzEuMTAxMiBjIDAsMCAtMS42NjYsLTM0LjY2NzIgMy4zMzQsLTU5LjMzMzIgMCww",
	"IC0xMCwtNi4zMzQwMiAtMjQuNjY3NCwtOC4wMDAwMyBsIDI4LjAwMDQsMSAzLjMzMywyIC00LDU0LjY2",
	"NjAzIC0xLDExLjY2OCIgc3R5bGU9ImZpbGw6I2RjZDlkODtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6",
	"ZXZlbm9kZDtzdHJva2U6bm9uZSIgLz48cGF0aCBkPSJtIDEzNC42MTgsNDMuMDk4IDEzLDMuNjY2OCAy",
	"NC42NjYsMS4zMzMyIDMuNjY3LDExLjMzMjkgLTYuNjY3LDE5LjY2NzEgLTcuNjY2LDEgLTEwLjY2Nywt",
	"My4zMzMyIC0xMC4yMzQsLTQuOTk2OCAtNS40MzMsMC45OTY4IC00LjIzNCwtMS42NjM2IiBzdHlsZT0i",
	"ZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAv",
	"PjxwYXRoIGQ9Im0gMTM0LjM4Myw0OS43NjggYyAwLDAgOC42NjYsMy45OTkyIDEwLDMuNjY2IGwgLTMu",
	"NjY2LDE4LjMzNCA0LjMzMywxLjY2NiBjIDAsMCAzLC0xNy4zMzI4IDMsLTE5LjMzMjggMCwwIDE4LjY2",
	"NiwtMSAyMC4zMzMsLTEgMCwwIDQsNy42NjY4IDMsMTUuNjY2OCBsIDMuNjY3LC0xMC42NjY4IDAuMzMz",
	"LC02IC01LjMzMywtOCAtNiwtMS4zMzMyIC0xMCwwLjMzMzIgLTMuMzMzLDQuMzMyOCAtMTEuNjY3LC0x",
	"LjY2NiAtMy42NjcsLTEuMzM0IiBzdHlsZT0iZmlsbDojZGNkOWQ4O2ZpbGwtb3BhY2l0eToxO2ZpbGwt",
	"cnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0gMTIxLjI4NCw3My40MzA5IC03LjMz",
	"MywxOC42NjcxIC03LjY2NywxMSBjIDAsMCAxLjY2Niw0LjY2NyA0LDQuNjY3IDIuMzM0LDAgNy42Njcs",
	"MCA3LjY2NywwIGwgNy4zMzMsLTIuNjY3IC0wLjY2NiwtMTIuMzMzMiAtMy4zMzQsLTE5LjMzMzkiIHN0",
	"eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5v",
	"bmUiIC8+PHBhdGggZD0ibSAxMjIuNzE3LDc5Ljc2OCBjIDAsMCAtOS4zMzQsMTcuOTk5MiAtOS4zMzQs",
	"MjAuNjY2IDAsMCAxLjY2Niw0IDQsMyAyLjMzNCwtMSA3LjMzNCwtMy42NjYgNy4zMzQsLTMuNjY2IGwg",
	"MCw2LjMzMyAtMTEuMzM0LDIuMzM0IC03LjY2NiwtMSAxMywtMzAuNjY3IDIuNjY2LC0wLjMzNCIgc3R5",
	"bGU9ImZpbGw6I2RjZDlkODtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9u",
	"ZSIgLz48cGF0aCBkPSJtIDgxLjk1MTIsMTIzLjc2NCAtOS4yMzQ0LDEuMDA0IC04LjY2NzIsMi42Njcg",
	"MCwtMyA0LjIzNDgsLTQuNjcgMTMuMzMzMiwtNiIgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNp",
	"dHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIgLz48cGF0aCBkPSJtIDY3LjA1MDgsMTIy",
	"Ljc2NSBjIDAsMCAxMC4zMzQsLTQuMzM0IDEzLjY2NzIsLTMuMzM0IGwgMC4zMzE2LC0zLjk5NiAtOS4z",
	"MzE2LDEuOTk2IC01LjY2NzIsNCAxLDEuMzM0IiBzdHlsZT0iZmlsbDojZGNkOWQ4O2ZpbGwtb3BhY2l0",
	"eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0gMTM0LjU4MiwxMDYu",
	"NjMgYyAtNS42NTYsMC4xNjYgLTEwLjc2NiwwLjgzOCAtMTUuMjQsMi4xIDAuMzA0LDEuODM0IC0wLjI2",
	"NSwzLjYzNCAwLjE5Miw0Ljk1NSAxLjI0NywwLjg5OCAzLjMzNywwLjg4NCA1LjIyMiwxLjA5NSAtMS42",
	"MywwLjgwMSAtMy45MiwxLjExOCAtNS44MDEsMC42NTUgLTAuMDQ0LDEuMjczIC0wLjYxNSwyLjA2MiAt",
	"MC45NjEsMy4wNTggMy4xOCwxLjEzNSAxMC42ODcsOC41NzYgMTQuOTEsNi4xMTIgMi4wMTIsLTEuMTcy",
	"IDIuODY3LC03Ljg2NiAzLjAyMywtMTEuMTIxIDAuMTMsLTIuNyAtMC4yNDUsLTUuNDI0IC0xLjM0NSwt",
	"Ni44NTQiIHN0eWxlPSJmaWxsOiNkMzM4MzM7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7",
	"c3Ryb2tlOm5vbmUiIC8+PHBhdGggZD0ibSAxMzQuNTgyLDEwNi42MyBjIC01LjY1NiwwLjE2NiAtMTAu",
	"NzY2LDAuODM4IC0xNS4yNCwyLjEgMC4zMDQsMS44MzQgLTAuMjY1LDMuNjM0IDAuMTkyLDQuOTU1IDEu",
	"MjQ3LDAuODk4IDMuMzM3LDAuODg0IDUuMjIyLDEuMDk1IC0xLjYzLDAuODAxIC0zLjkyLDEuMTE4IC01",
	"LjgwMSwwLjY1NSAtMC4wNDQsMS4yNzMgLTAuNjE1LDIuMDYyIC0wLjk2MSwzLjA1OCAzLjE4LDEuMTM1",
	"IDEwLjY4Nyw4LjU3NiAxNC45MSw2LjExMiAyLjAxMiwtMS4xNzIgMi44NjcsLTcuODY2IDMuMDIzLC0x",
	"MS4xMjEgMC4xMywtMi43IC0wLjI0NSwtNS40MjQgLTEuMzQ1LC02Ljg1NCB6IiBzdHlsZT0iZmlsbDpu",
	"b25lO3N0cm9rZTojZDMzODMzO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tl",
	"LWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLW9wYWNpdHk6MTtzdHJva2Ut",
	"ZGFzaGFycmF5Om5vbmUiIC8+PHBhdGggZD0ibSAxMDcuNTM1LDExNS44NzYgYyAtMC4wMTUsLTAuNDI4",
	"IC0wLjAzMywtMC44NTkgLTAuMDUsLTEuMjkxIC0xLjc2NiwtMS4xNiAtNC42MTcsLTEuMTQ2IC02LjU1",
	"NSwtMi4xMjEgMi44NTcsLTAuMTI1IDUuMTA2LC0wLjgxMyA3LjA1MiwtMS43ODMgLTAuMDQzLC0xLjA3",
	"OCAtMC4wODQsLTIuMTU1IC0wLjEyNiwtMy4yMzMgLTMuMjM3LC0yLjIxNiAtNi4xOTQsLTUuNTE2IC0x",
	"MC4wMDUyLC03LjU5NDEgLTEuODAyLC0wLjk4MjggLTguMTI2MiwtMy41MTE3IC0xMC4wNDM0LC0zLjA2",
	"NDggLTEuMDg0NywwLjI1MTkgLTEuMTgyNCwxLjU5OCAtMS42MTYsMi44NjY4IC0wLjkyMzgsMi43MTcx",
	"IC0zLjA1MDgsNy4wNDIxIC0zLjIzNjMsMTEuMTMyMSAtMC4yMzYzLDUuMTY2IC0wLjc1NzgsMTMuODI0",
	"IDQuODA5NCwxMi43NiA0LjQ5MTQsLTAuODU3IDkuNzE1MiwtMi45MjYgMTMuMTkyNSwtNC44MjYgMi4x",
	"MjUsLTEuMTYyIDMuMzU0LC0yLjU5OCA2LjU3OCwtMi44NDYiIHN0eWxlPSJmaWxsOiNkMzM4MzM7Zmls",
	"bC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiIC8+PHBhdGggZD0ibSAxMDcu",
	"NTM1LDExNS44NzYgYyAtMC4wMTUsLTAuNDI4IC0wLjAzMywtMC44NTkgLTAuMDUsLTEuMjkxIC0xLjc2",
	"NiwtMS4xNiAtNC42MTcsLTEuMTQ2IC02LjU1NSwtMi4xMjEgMi44NTcsLTAuMTI1IDUuMTA2LC0wLjgx",
	"MyA3LjA1MiwtMS43ODMgLTAuMDQzLC0xLjA3OCAtMC4wODQsLTIuMTU1IC0wLjEyNiwtMy4yMzMgLTMu",
	"MjM3LC0yLjIxNiAtNi4xOTQsLTUuNTE2IC0xMC4wMDUyLC03LjU5NDEgLTEuODAyLC0wLjk4MjggLTgu",
	"MTI2MiwtMy41MTE3IC0xMC4wNDM0LC0zLjA2NDggLTEuMDg0NywwLjI1MTkgLTEuMTgyNCwxLjU5OCAt",
	"MS42MTYsMi44NjY4IC0wLjkyMzgsMi43MTcxIC0zLjA1MDgsNy4wNDIxIC0zLjIzNjMsMTEuMTMyMSAt",
	"MC4yMzYzLDUuMTY2IC0wLjc1NzgsMTMuODI0IDQuODA5NCwxMi43NiA0LjQ5MTQsLTAuODU3IDkuNzE1",
	"MiwtMi45MjYgMTMuMTkyNSwtNC44MjYgMi4xMjUsLTEuMTYyIDMuMzU0LC0yLjU5OCA2LjU3OCwtMi44",
	"NDYgeiIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I2QzMzgzMztzdHJva2Utd2lkdGg6MjtzdHJva2Ut",
	"bGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9r",
	"ZS1vcGFjaXR5OjE7c3Ryb2tlLWRhc2hhcnJheTpub25lIiAvPjxwYXRoIGQ9Im0gMTEwLjc1LDEwOS43",
	"MTIgYyAtMC40OTQsMi44MTQgLTEuMDY1LDMuNjE3IC0wLjg0NCw2LjA3MiA3LjUwNSw1LjAwNCA4Ljkx",
	"NCwtOC41OTUgMC44NDQsLTYuMDcyIiBzdHlsZT0iZmlsbDojZDMzODMzO2ZpbGwtb3BhY2l0eToxO2Zp",
	"bGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0gMTEwLjc1LDEwOS43MTIgYyAt",
	"MC40OTQsMi44MTQgLTEuMDY1LDMuNjE3IC0wLjg0NCw2LjA3MiA3LjUwNSw1LjAwNCA4LjkxNCwtOC41",
	"OTUgMC44NDQsLTYuMDcyIHoiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNkMzM4MzM7c3Ryb2tlLXdp",
	"ZHRoOjI7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVy",
	"bGltaXQ6NDtzdHJva2Utb3BhY2l0eToxO3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIgLz48cGF0aCBkPSJt",
	"IDEyMS42MTcsMTA3LjQzMSBjIDAsMCAtMi4zMzQsMy4zMzQgLTAuNjY3LDQuMzM0IDEuNjY3LDEgMy4z",
	"MzQsLTAuMDAxIDQuMzM0LDEuNjY2IDEsMS42NjcgMCwyLjY2NyAwLjMzMyw0LjY2NyAwLjMzMywyIDIu",
	"MDAxLDIuMzM0IDMuNjY3LDIuNjY3IDEuNjY2LDAuMzMzIDYuMzM0LDEgNywtMC42NjcgbCAtMiw2IC00",
	"LDEuMzMzIC0xMi42NjcsLTcuMzMzIC0wLjY2NywtMy42NjcgMCwtNy4zMzMiIHN0eWxlPSJmaWxsOiNl",
	"ZjNkM2E7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiIC8+PHBhdGgg",
	"ZD0ibSA4Ni42MTcyLDk2LjQzMDkgYyAtMC40MDA0LDUuMjAyMSAtMC44MjQyLDEwLjM5NzEgLTEuMjk1",
	"NywxNS41OTQxIC0wLjcwNTUsNy43NiAxLjg2NCw2LjQwNiA4LjU5MDYsNi40MDYgMS4wMjc0LDAgNi4z",
	"MjU5LC0xLjIyNSA2LjcwNDksLTIgMS44MTgsLTMuNzEzIC0zLjA0LC0yLjg4OCAyLjA5NCwtNS42ODgg",
	"NC4zMzQsLTIuMzYzIDExLjk5LDEuNDM1IDEwLjIzOSw2LjY4OCAtMC45OCwxLjE2OCAtNS4xMDYsMC4z",
	"NjQgLTYuNTg1LDEuMTMxIC0yLjYwNCwxLjM1IC01LjIwOCwyLjcgLTcuODEyMyw0LjA1IC0zLjMxMzIs",
	"MS43MTkgLTEwLjk3MDcsNC4yMjUgLTE0LjUwMzEsMS44MjMgLTguOTUwNCwtNi4wODcgMC41NjQ5LC0y",
	"MS4yOTYgMy43NTc4LC0yNy42NDU5IiBzdHlsZT0iZmlsbDojZWYzZDNhO2ZpbGwtb3BhY2l0eToxO2Zp",
	"bGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0gOTUuMzg4NywyMTQuNTMyIGMg",
	"LTkuMDg1MiwyLjExNiAtMTMuNTk5NiwtMy44MDIgLTE2LjM1MzUsLTkuOTQgLTIuNDU5LDAuNTk2IC0x",
	"LjQ4MDUsMy45NCAtMC44NTk0LDUuNjQ0IDEuNjI2Miw0LjQ3MiA4LjE3OTcsMTAuNDI1IDEzLjUzNDQs",
	"OS42MTggMi4zMDQzLC0wLjM0NyA1LjQyMjYsLTIuNDU0IDMuNjc4NSwtNS4zMjIiIHN0eWxlPSJmaWxs",
	"OiMyMzFmMjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiIC8+PHBh",
	"dGggZD0ibSAxMzkuNjU1LDIwNC4xODYgYyAwLjE0MywtMC4wMDYgMC4yODgsLTAuMDExIDAuNDMxLC0w",
	"LjAxNyAyLjA1MywtNC4yNjUgMy44MywtOC43ODMgNi40MiwtMTIuNTQ4IC0xLjczNSwtNC4wNDEgLTEz",
	"LjEzOCwtNy42MTcgLTEyLjk2MiwtMC4zNjEgMi40NjYsMS4wNzggNi43MjMsMC4yMiA4LjkwOSwxLjU5",
	"NyAtMS4yNjQsMy40NjkgLTMuMDg4LDYuNDIyIC0yLjc5OCwxMS4zMjkiIHN0eWxlPSJmaWxsOiMyMzFm",
	"MjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiIC8+PHBhdGggZD0i",
	"bSAxMDAuMDQsMjA0LjA3NSBjIDEuOTQ4LC0zLjU3MSAyLjU4MiwtNy4zMjMgNS4zNTEsLTEwLjAyMiAx",
	"LjI0NywtMS4yMTUgMy42NzIsLTIuNjk2IDIuNDcsLTYuMDc1IC0wLjI4MSwtMC43OTcgLTIuMzM0LC0y",
	"LjU3NCAtMy41MTksLTIuOTIzIC00LjMyOSwtMS4yNzggLTE0LjQxNjIsLTAuMjY0IC0xMS4wMDAyLDUu",
	"MTMzIDMuNTgwMSwtMC4xNjcgOC4zOTIyLC0yLjMyNSAxMS4wNjgyLDAuMjc0IC0yLjA1NSwzLjI4NSAt",
	"NS43MTg2LDkuNzg0IC00LjM3LDEzLjYxMyIgc3R5bGU9ImZpbGw6IzIzMWYyMDtmaWxsLW9wYWNpdHk6",
	"MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSIgLz48cGF0aCBkPSJtIDEzOC4wMywxNjcuNzgx",
	"IGMgLTYuNTE4LC00LjE4NyAtMTMuNzg2LC04Ljc0IC0yNC40NjYsLTcuNjg0IC0yLjI4MiwxLjk4NCAt",
	"My4xNTIsNi4zOTkgLTAuOTM1LDkuMzE1IDEuMTU0LC0xLjk4NCAwLjQyOSwtNS42MzMgMy42NDUsLTYu",
	"MTgyIDYuMDYsLTEuMDM3IDEzLjExMywzLjcwNyAxNy40NzIsNS4zNjUgMi43MDMsNC41NTcgLTAuMjMz",
	"LDYuMjMzIC0yLjY2OCw5LjE2NiAtNC45ODUsNi4wMDkgLTExLjY3MiwxMy40NTcgLTExLjQyOSwyMi40",
	"NTMgMi4wMTUsMS40NjEgMi4xODksLTIuMjMgMi40NzgsLTIuOTAyIDIuNjAzLC02LjA5MiA5LjE1NCwt",
	"MTMuODgzIDEzLjkzNSwtMTkuMDk3IDEuMTc0LC0xLjI4NCAzLjEwNywtMi41MTYgMy4zMjIsLTMuMzY1",
	"IDAuNjIsLTIuNDY5IC0xLjYxMywtNS40MjcgLTEuMzU0LC03LjA2OSIgc3R5bGU9ImZpbGw6IzIzMWYy",
	"MDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSIgLz48cGF0aCBkPSJt",
	"IDUyLjEwMTYsMTcyLjE4OSBjIC0yLjA0MywxLjE2NiAtMi41MjkzLDYuMzAyIC00LjkyNzgsNi40NDgg",
	"LTMuNDI3NywwLjIwOCAtMi44MDI3LC02LjY2MyAtMi43ODksLTEwLjY4MSAtMi4zNTk0LDIuMTQyIC0y",
	"Ljc3NDMsOC43MzcgLTEuMDQxLDEyLjEyNCAtMS45NzU0LDAuOTcgLTIuODU3NSwtMS4wNyAtMy45NTMy",
	"LC0xLjc4OSAxLjQwODIsMTAuMjMgMTQuOTY0OSw0Ljc0NSAxMi43MTEsLTYuMTAyIiBzdHlsZT0iZmls",
	"bDojMjMxZjIwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAvPjxw",
	"YXRoIGQ9Im0gMTQyLjE4LDE2My41MjEgYyAtMy4wMzQsLTUuNzc1IC03LjMyNiwtMTIuMTM1IC0xNi4y",
	"MjksLTEyLjMyIC0wLjE4MSwxLjg2NSAtMC4zMiw0LjcwMyAwLjAxLDUuODI2IDYuODA2LDAuNjU0IDEx",
	"LjAwOCw0LjExOCAxNi4yMTksNi40OTQiIHN0eWxlPSJmaWxsOiMyMzFmMjA7ZmlsbC1vcGFjaXR5OjE7",
	"ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiIC8+PHBhdGggZD0ibSA5OS41MjY2LDE1OS43Nzcg",
	"YyA1LjY3ODQsLTIuOTg2IDE2LjExNDQsLTMuMzA3IDIzLjgzMjQsLTMuMDgxIDAuNDE0LC0xLjY5MSAw",
	"LjQwNCwtMy43OCAwLjQyLC01Ljg0MiAtOS45MjEsLTAuNDk1IC0yMS42NTEsMS45NiAtMjQuMjUyNCw4",
	"LjkyMyIgc3R5bGU9ImZpbGw6IzIzMWYyMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtz",
	"dHJva2U6bm9uZSIgLz48cGF0aCBkPSJtIDk4LjQ0NzMsMTU0LjIwOSBjIDMuOTI2NywtOS44NTkgMTcu",
	"NDIyNywtOC43MjQgMjguODAzNywtOC40NTIgLTAuNTAxLC0xLjI4IC0xLjU4NywtMi43OTIgLTIuOTM3",
	"LC0zLjMzOSAtMy42NDcsLTEuNDg0IC0xMy43MDYsLTIuNjEgLTE4Ljc2OSwwLjA3OSAtMy4yMTEsMS43",
	"MDcgLTUuMjc0LDUuNTY0IC03LjAzMzMsNy44MjUgLTAuODQ5NiwxLjA5MiAtNS4wODAxLDMuODgxIC0w",
	"LjA2NDQsMy44ODciIHN0eWxlPSJmaWxsOiMyMzFmMjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2",
	"ZW5vZGQ7c3Ryb2tlOm5vbmUiIC8+PHBhdGggZD0ibSAxMzcuNTU2LDk5LjgyNjIgYyAtNC42MDgsLTcu",
	"ODkyMiAtOS4wMTcsLTE1Ljk5ODEgLTE0LjQ4NCwtMjIuOTU5NCAyLjI5Miw2LjczOTEgMy4yNzMsMTgu",
	"MDE4NCAzLjYxOSwyNi42MTcyIDQuNzk1LDIuMjQ0IDguOTAxLC0wLjUwNSAxMC44NjUsLTMuNjU3OCIg",
	"c3R5bGU9ImZpbGw6IzgxYjBjNDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6",
	"bm9uZSIgLz48cGF0aCBkPSJtIDE2Mi4zNTIsNzEuNDYwOSBjIC01LjE1OSwtMS4wMzI4IC04Ljc4NCwt",
	"Ni4wNDY4IC0xMy44MTcsLTUuNzI1IDIuNzY2LDMuODk5MyA3LjYxMyw1LjU0MyAxMy44MTcsNS43MjUi",
	"IHN0eWxlPSJmaWxsOiMyMzFmMjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tl",
	"Om5vbmUiIC8+PHBhdGggZD0ibSAxNjQuNjI4LDYzLjM4NzEgYyAtNC4yMDUsLTAuNDQ0MSAtOS4xNDQs",
	"LTEuMTI1IC0xMy40MDksLTAuNzc0MiAyLjAxOSwzLjA4NCA5Ljc5OCwyLjAxOTkgMTMuNDA5LDAuNzc0",
	"MiIgc3R5bGU9ImZpbGw6IzIzMWYyMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJv",
	"a2U6bm9uZSIgLz48cGF0aCBkPSJtIDE2Ni4wODUsNTYuNDI2MiBjIC00LjcyNiwtMC4xMDI0IC0xMC42",
	"LC0wLjAwODIgLTE1LjA5MiwwLjM2ODcgMi42NTcsMi44NTM5IDEyLjAyNywxLjA1OSAxNS4wOTIsLTAu",
	"MzY4NyIgc3R5bGU9ImZpbGw6IzIzMWYyMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtz",
	"dHJva2U6bm9uZSIgLz48cGF0aCBkPSJtIDEyOC42NjQsMzcuMzc3IGMgMC42NzgsLTUuOTM1MiAzLjAz",
	"MSwtMTEuOTQ4OSAyLjczNiwtMTguNDQ4OSAtMi42MTMsLTAuODgxMiAtNC4xMTQsLTEuNjUxOSAtNy42",
	"MTUsLTEuNjQ3MiAtMC4yNDcsNS41MjQyIC0wLjk4NiwxMy45NjkxIC0wLjc2NSwxOS4yMzUxIDEuNzIy",
	"LC0wLjExNCA0LjI2MSwxLjIzMDEgNS42NDQsMC44NjEiIHN0eWxlPSJmaWxsOiNkY2Q5ZDg7ZmlsbC1v",
	"cGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiIC8+PHBhdGggZD0ibSAxMjEuMDQ1",
	"LDEyNC44NDkgYyAtMi4zNzMsLTEuNTQ5IC00LjM5NCwtMy40ODMgLTYuNjczLC01LjEzNyAtNS4wNTQs",
	"LTAuMjUgLTcuODEyLDAuMzUgLTExLjUyNSwzLjI1MiAwLjA2MSwwLjIzMyAwLjQzNCwwLjEyOSAwLjQ0",
	"OCwwLjQxNSA1LjQxLC0yLjQxMSAxMi4yODcsMC45ODIgMTcuNzUsMS40NyIgc3R5bGU9ImZpbGw6I2Yw",
	"ZDZiNztmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSIgLz48cGF0aCBk",
	"PSJtIDkyLjY0NDUsODcuOTcxMSBjIDEuNDg2NCw2LjQ0MSA3LjMxMDYsOS43NzY5IDEyLjU5OTUsMTMu",
	"MzIzOSA1LjQ1OSwtNi45MjgyIDguNzc5LC0xNS44MzggMTIuNDM1LC0yNC40MzYgLTguNjM4LDIuNjAz",
	"OSAtMTcuNDY0LDYuODI4OSAtMjUuMDM0NSwxMS4xMTIxIiBzdHlsZT0iZmlsbDojODFiMGM0O2ZpbGwt",
	"b3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIiAvPjxwYXRoIGQ9Im0gMTIzLjAy",
	"LDM2LjUxNiBjIC0wLjIyMSwtNS4yNjYgMC41MTgsLTEzLjcxMDkgMC43NjUsLTE5LjIzNTEgMy41MDEs",
	"LTAuMDA0NyA1LjAwMiwwLjc2NiA3LjYxNSwxLjY0NzIgMC4yOTUsNi41IC0yLjA1OCwxMi41MTM3IC0y",
	"LjczNiwxOC40NDg5IC0xLjM4MywwLjM2OTEgLTMuOTIyLC0wLjk3NSAtNS42NDQsLTAuODYxIHogTSA2",
	"OC41MDU5LDY2LjQ2NDggQyA3MC44MTQ1LDQ1LjI0MTggNzQuMTU4MiwyNy40MDEyIDgwLjI5MSw4LjYw",
	"NzgxIDkzLjkwMjMsNC40NzUgMTEwLjMxMSw0LjExNDg0IDEyMi4zNDIsNy44NDQxNCAxMjAuMTMzLDE4",
	"LjQ1MTIgMTIxLjA5OCwzMS4zNjQ4IDExOS44MDcsNDIuNjg0IGMgLTAuOTczLDguNTA3OCAtMC40Nzcs",
	"MTcuMDY4IC0xLjgxMSwyNS43NDggLTE0LjU3OCwzLjAzMjggLTM1LjE4MzUsMC43MDkgLTQ5LjQ5MDEs",
	"LTEuOTY3MiB6IG0gNTIuOTM3MSwxLjgzNCBjIC0wLjEyMywtOS4xMTQ4IDAuNDA4LC0xOC4xMDU4IDEu",
	"MTA0LC0yNy4yMzIgMy41LDAuNTI1NCA1Ljg3NSwwLjg3NjIgOS4xMjcsMS41ODkxIC0xLjA1Niw4Ljc4",
	"NTkgLTAuOTI2LDE4LjY3MjIgLTMuMDc3LDI2LjQ0NDEgLTIuNDg2LC0wLjAyMzggLTQuNjc1LDAuMDI4",
	"OSAtNy4xNTQsLTAuODAxMiB6IG0gMTcuNzU1LDEuNDY5MiBjIC0xLjY2MSwwLjM4MDggLTMuNTk1LDAu",
	"MDE0OCAtNS4xODIsLTAuMDE2IDAuNzQ2LC03LjQzMDEgMi41NTYsLTE1LjYyOSAzLjE5MywtMjMuNDI4",
	"MiAyLjQ5NywtMC4wNzc3IDMuODMxLDEuMSA1Ljg4NSwxLjQ5NjEgMC4xMSw2Ljg0NjEgLTAuNTk4LDE2",
	"LjI3ODEgLTMuODk2LDIxLjk0ODEgeiBtIDI2Ljg4NCwtMjQuNTYyOSBjIDUuMjA1LDEuMjY0IDguNDc4",
	"LDcuNjM5IDcuMDIyLDE0LjE4NTkgLTAuOTc3LDQuNCAtMi43MTcsMTIuNjg1MiAtNC41NzksMTUuNSAt",
	"MS4zNzYsMi4wODIgLTUuMTA3LDQuODA3OCAtOC4wODYsMi45IC00Ljg0NiwtMy4xMDMxIC0xMy4zODMs",
	"LTQuMDAzOSAtMTYuOTE3LC03Ljc2MDEgMS43NzIsLTUuOSAyLjMyMiwtMTQuMDAzOSAzLjA1MywtMjEu",
	"NDc5NyA2LjA1NCwtMC4zNzc0IDEzLjUwMywxLjY2NiAxOC41MzgsLTAuNTAyNCAtMy41MTUsLTEuMTM4",
	"NiAtOC4wNzYsLTEuMTQ3NiAtMTEuMTEzLC0yLjgwNyAyLjQ4MiwtMS4xOTg4IDguMjkzLC0wLjk1NjYg",
	"MTIuMDgyLC0wLjAzNjcgeiBNIDExNy42NzksNzYuODU5IGMgLTMuNjU2LDguNTk4IC02Ljk3NiwxNy41",
	"MDc4IC0xMi40MzUsMjQuNDM2IEMgOTkuOTU1MSw5Ny43NDggOTQuMTMwOSw5NC40MTIxIDkyLjY0NDUs",
	"ODcuOTcxMSAxMDAuMjE1LDgzLjY4NzkgMTA5LjA0MSw3OS40NjI5IDExNy42NzksNzYuODU5IHogbSA5",
	"LjAxMiwyNi42MjUgYyAtMC4zNDYsLTguNTk4OCAtMS4zMjcsLTE5Ljg3ODEgLTMuNjE5LC0yNi42MTcy",
	"IDUuNDY3LDYuOTYxMyA5Ljg3NiwxNS4wNjcyIDE0LjQ4NCwyMi45NTk0IC0xLjk2NCwzLjE1MjggLTYu",
	"MDcsNS45MDE4IC0xMC44NjUsMy42NTc4IHogbSAtMTAuMjE2LDMuNjMgYyAtMi4wNzEsMC4yMjMgLTMu",
	"ODI5LC0yLjM4MSAtNi41MjIsLTEuMjU1IC0wLjYxNywtMC42ODIgLTEuMTc4LC0xLjQyMSAtMS44MDcs",
	"LTIuMDg3IDUuOTQ4LC03LjE2ODEgOC42NTEsLTE3LjMzOCAxMy4yNDUsLTI1Ljc2MTggMi40NjUsOC4w",
	"OTE4IDIuMTgxLDE2Ljk1NyAyLjcyNCwyNS43ODg4IC0zLjM4NywtMC4yMTUgLTUuMjY2LDMuMDYzIC03",
	"LjY0LDMuMzE1IHogbSAtNi41NjksOC42NyBjIC0wLjIyMSwtMi40NTUgMC4zNSwtMy4yNTggMC44NDQs",
	"LTYuMDcyIDguMDcsLTIuNTIzIDYuNjYxLDExLjA3NiAtMC44NDQsNi4wNzIgeiBtIC04Ljk0OSwyLjkz",
	"OCBjIC0zLjQ3NzMsMS45IC04LjcwMTEsMy45NjkgLTEzLjE5MjUsNC44MjYgLTUuNTY3MiwxLjA2NSAt",
	"NS4wNDU3LC03LjU5NCAtNC44MDk0LC0xMi43NiAwLjE4NTUsLTQuMDkgMi4zMTI1LC04LjQxNSAzLjIz",
	"NjMsLTExLjEzMjEgMC40MzM2LC0xLjI2ODggMC41MzEzLC0yLjYxNDkgMS42MTYsLTIuODY2OCAxLjkx",
	"NzIsLTAuNDQ2OSA4LjI0MTQsMi4wODIgMTAuMDQzNCwzLjA2NDggMy44MTEyLDIuMDc4MSA2Ljc2ODIs",
	"NS4zNzgxIDEwLjAwNTIsNy41OTQxIDAuMDQyLDEuMDc4IDAuMDgzLDIuMTU1IDAuMTI2LDMuMjMzIC0x",
	"Ljk0NiwwLjk3IC00LjE5NSwxLjY1OCAtNy4wNTIsMS43ODMgMS45MzgsMC45NzUgNC43ODksMC45NjEg",
	"Ni41NTUsMi4xMjEgMC4wMTcsMC40MzIgMC4wMzUsMC44NjMgMC4wNSwxLjI5MSAtMy4yMjQsMC4yNDgg",
	"LTQuNDUzLDEuNjg0IC02LjU3OCwyLjg0NiB6IG0gLTMzLjIxMzYsNi4wMzMgYyAtMi44ODYsLTIuOTMg",
	"OC4wOTQ1LC02LjkyNCAxMS41OTA2LC03LjEzOSAtMC4wMTk1LDEuODU0IDEuMDU2NiwzLjYwMiAwLjgz",
	"OTgsNC45MzIgLTQuMTUyMywwLjcyOSAtOS42MDkzLDAuMjQ4IC0xMi40MzA0LDIuMjA3IHogbSAzNS41",
	"NTE2LC0xLjM3NiBjIC0wLjAxNCwtMC4yODYgLTAuMzg3LC0wLjE4MiAtMC40NDgsLTAuNDE1IDMuNzEz",
	"LC0yLjkwMiA2LjQ3MSwtMy41MDIgMTEuNTI1LC0zLjI1MiAyLjI3OSwxLjY1NCA0LjMsMy41ODggNi42",
	"NzMsNS4xMzcgLTUuNDYzLC0wLjQ4OCAtMTIuMzQsLTMuODgxIC0xNy43NSwtMS40NyB6IG0gMzIuNjMy",
	"LC05Ljg5NSBjIC0wLjE1NiwzLjI1NSAtMS4wMTEsOS45NDkgLTMuMDIzLDExLjEyMSAtNC4yMjMsMi40",
	"NjUgLTExLjczLC00Ljk3NyAtMTQuOTEsLTYuMTEyIDAuMzQ2LC0wLjk5NiAwLjkxNywtMS43ODUgMC45",
	"NjEsLTMuMDU4IDEuODgxLDAuNDYzIDQuMTcxLDAuMTQ2IDUuODAxLC0wLjY1NSAtMS44ODUsLTAuMjEx",
	"IC0zLjk3NSwtMC4xOTcgLTUuMjIyLC0xLjA5NSAtMC40NTcsLTEuMzIxIDAuMTEyLC0zLjEyMSAtMC4x",
	"OTIsLTQuOTU1IDQuNDc0LC0xLjI2MiA5LjU4NCwtMS45MzQgMTUuMjQsLTIuMSAxLjEsMS40MyAxLjQ3",
	"NSw0LjE1NCAxLjM0NSw2Ljg1NCB6IG0gLTczLjA0MjIsOC40MzcgYyAtMC45MDYzLDAuNjQ2IC03LjAz",
	"NzEsOC42MjMgLTcuODc3LDguMjkyIEMgNDMuOTE0MSwxMjUuODM4IDMzLjU0MSwxMTguMjczIDI0LjI3",
	"MTUsMTExLjExOCAzMy4xMDk0LDkyLjE1MzkgMzYuNjc3LDY4LjkxOTkgMzcuMzA3NCw0Ni41MjYyIDQ3",
	"LjQzMTYsNDEuNzkxIDU2LjMyNDIsMzQuOTY0OCA3MC4wNjI1LDM0LjI1MiA2OC40NzI3LDQ1LjUgNjcu",
	"MDIxNSw1NS41MzUyIDY2LjExOTEsNjYuMTI1IGMgLTMuNDUxOSwxLjQ1NTEgLTguNDA0MywtMC4wNjYg",
	"LTExLjYzNDcsMC40NTEyIC0wLjAyNzQsMy44OTI5IDQuOTMzNiwxLjcwNDcgNS4zNDY4LDQuMzIyNiAw",
	"LjMxMTQsMS45ODAxIC0yLjcyOTYsMi4xMzAxIC0xLjczOTQsNS4yNDgxIDIuNTI1NCwtMC45MTggMy44",
	"NTE2LC0yLjk0NTcgNi41NDQ5LC0zLjcwNzEgMi40NjEsNS4zODQgLTAuMDM0NCwxNC45MTAyIDAuMzIw",
	"MywxOS40MTAyIDAuMDY3MiwwLjg0NDkgMC40MjE5LDQuNjgwOSAyLjMxNDUsNC4wMDc4IDEuNjc1LC0w",
	"LjU5NTcgLTAuMDk1NywtMTAuMjAxOSAwLjA4NzksLTE0LjQ2MDkgMC4xNjcyLC0zLjkyMzkgLTAuNDcz",
	"OSwtNy43MjA3IDEuMTE1MiwtMTAuMTg0IDEzLjI3NTQsMS44MDcgMjYuNzY1NiwyLjk3NSA0MS4xMjk0",
	"LDMuMzY5MSAtMy4xNiwxLjM1NTkgLTYuOTE0LDIuNjM5MSAtMTEuMDI5OCw0Ljk1OSAtMi4yMzEyLDEu",
	"MjU3OCAtOS4yNjQ0LDMuODc1IC05LjkwODIsNS45OTQyIC0xLjAyNzMsMy4zNzY5IDIuNjk1Myw1LjE3",
	"NTcgMy4zMzIsOC4wNzA3IC02LjcwMTEsLTMuNjU0NyAtOC4wMDg1LDMuNTAzMSAtOS41OTM3LDguNTc0",
	"MSAtMS40MzYzLDQuNTkzIC0yLjI1MzksOC4wMjQgLTIuNjA2MywxMC42NzMgLTUuNzcyNiwyLjc1MiAt",
	"MTEuOTQ0NSw1LjUzOSAtMTYuOTEzMiw5LjA2OCB6IG0gNjcuMTc5Miw3LjMyNyBjIDkuMjQzLDQuNDgy",
	"IDEwLjkwOSwtMTYuNzUxIDcuMjg2LC0yMy41OTEgMC41NiwtMi4wNCAyLjQ4NiwtMi44MjEgMy4yNzIs",
	"LTQuNjU1IC01LjE1OCwtOS4yMzk5IC0xMC44ODcsLTE3Ljg2NDkgLTE2LjE1LC0yNi45OTYxIDMuOTE1",
	"LDIuNDM3MSA5LjUwNywwLjQzNTkgMTQuMTE0LDIuMjYwMSAxLjY4NCwwLjY2NiAyLjkwMyw0LjUyMTEg",
	"NC4xNzgsNy42MDUxIDMuNTA3LDguNDg0OCA3LjE4OSwxOS4xODE5IDguODI3LDI3LjI3ODkgMC4zNywx",
	"Ljg0NSAxLjM3OCw1Ljg2NSAxLjE1Miw3LjUwNyAtMC40MDMsMi45NCAtNC4zOTIsNS4xMiAtNi40MjEs",
	"Ni45MzggLTMuNzM4LDMuMzU4IC02LjA5Miw2LjMxMyAtOS45OTEsOS40NTMgLTEuNTgxLC0yLjMzNCAt",
	"NC45NzQsLTMuOTAyIC02LjI2NywtNS44IHogbSAtODguMzE3OSw4MS45NjggYyAtNC40MDQzLC00Ljg0",
	"NiAtMy40ODI0LC0xMy45MjYgLTIuOTQ5MiwtMjAuMzg2IDcuOTYwOSw1LjAwOCAxOC41MjczLC0wLjM5",
	"NiAxOC40Mjc3LC04LjkxNCAzLjgwMDgsMC4xMDEgMS40MTk5LDQuNzQ3IDAuNzMyNCw3Ljc0IC0yLjI0",
	"NjgsOS43NzYgMy43ODUyLDIwLjM5NyAwLjI3MzUsMjkuMzM3IC02LjgxODQsLTAuNTE3IC0xMi40Miwt",
	"My4zMDIgLTE2LjQ4NDQsLTcuNzc3IHogbSAzMS41MTM3LDI4LjEyNiBjIC05Ljk3MDcsLTIuODI2IC0y",
	"Mi43NDkzLC0xMC4wNzEgLTI2Ljg0NjUsLTE5LjAyOCAzLjE3MjYsMC40NjEgNS4zNzUsMi4wNjEgOC41",
	"MDQ3LDIuMjU5IDEuMTgyOCwwLjA3NyAyLjczMjQsLTAuNDk2IDQuMDkxOCwtMC4xNTggMi43MDksMC42",
	"NzIgNC45OTUzLDYuNzQ2IDcuMDM5LDkuMDA2IDEuOTkyMiwyLjIwNyA0LjM4NjcsMy4xNSA2LjAyNTQs",
	"NS4xNjIgMS4wNTI4LDAuNTA4IDIuNjA5NCwwLjQ3MyAyLjY2OTIsMi4wNTQgLTAuNDU2MywwLjQ4OCAt",
	"MC45MzY4LDAuODYgLTEuNDgzNiwwLjcwNSB6IG0gNTEuOTAzMiwtMi42NTggYyAtMTAuMzQ5LDUuODM5",
	"IC0yNy44NjYxLDEwLjIzMSAtMzguODc0Nyw0Ljc0MyAtOC44ODI4LC00LjQyOSAtMjAuODg5OSwtMTEu",
	"NzU3IC0yNC45ODM2LC0yMS4wNDMgMy44MjQyLC04Ljk2MSAtMS4xMzI4LC0xNy4xNzIgLTEuNDQ5Miwt",
	"MjYuMjcgLTAuMTY4LC00Ljg0MSAyLjI3OTMsLTkuMDY3IDIuNDY2OCwtMTQuMzM3IC0xLjMwODYsLTIu",
	"MTU5IC01LjMwNjcsLTIuNDI1IC04LjA3NDMsLTIuMjc3IC0wLjkzMTYsNC42NjIgLTIuNTYyNSw5Ljkw",
	"MiAtNy4zNjMyLDEwLjQyOCAtNi43OTMsMC43NDMgLTExLjc1OTgsLTQuODc5IC0xMi4wNjg0LC0xMC43",
	"NTQgLTAuMzY1MiwtNi45MDkgNS4zMDY2LC0xOC4zNiAxMy4zNDU3LC0xNy41NjUgMy4xMDU1LDAuMzA3",
	"IDMuODY4NCwzLjQyIDcuMjUyLDMuMzg4IDEuODMzOSwtMy42NTkgLTIuODI4OSwtNC44MDggLTMuMzA4",
	"NiwtNy40MjUgLTAuMTI1LC0wLjY3NiAwLjM4NjcsLTMuMzE4IDAuNjg0MywtNC41NTcgMS40NjAyLC02",
	"LjAzMyA0LjcxNTMsLTEzLjg0MSA3LjkxOTIsLTE4LjQzNCA0LjA2NjQsLTUuODI2IDEyLjA1NTUsLTYu",
	"NzA0IDIwLjY1MDQsLTcuMjc1IDEuNTM1MSwzLjMwNyA3LjE5MDIsMy4wMzUgMTAuODc1LDIuMTcgLTQu",
	"NDE2LDEuNzQ5IC04LjUyMTUsNS45ODkgLTExLjkyMzksOS43NDIgLTMuOTA4Miw0LjMwNiAtNy44Njcx",
	"LDguOTI1IC04LjA2NzEsMTQuNTUzIDcuMzg1NSwtMTAuMjQ2IDEzLjQ4NzEsLTE5LjE5NCAyNi45MTY4",
	"LC0yMy43MDEgMTAuMTYxOCwtMy40MDggMjIuMDI5OCwxLjU2MiAyOS44Mzc4LDcuMDQ1IDMuMjQsMi4y",
	"NzkgNS4xNzQsNS44OTUgNy40NzcsOS4yMDUgOC42MTcsMTIuMzk1IDEyLjYzOCwzMC4wODcgMTEuNzU0",
	"LDQ3LjIzNSAtMC4zNjQsNy4wNzIgLTAuMzQ4LDE0LjEyIC0yLjcyMSwxOC44NzggLTIuNDgsNC45NzUg",
	"LTEwLjg2OCw5LjQyNiAtMTUuNzc4LDQuOTI2IC0wLjkxLDQuODM4IDQuMDgzLDcuODMgOS45NDgsNi4w",
	"ODkgLTQuMTgyLDUuMzk3IC04LjU3MSwxMS44ODIgLTE0LjUxNSwxNS4yMzYgeiBNIDE0NC40NDQsNzcu",
	"MTE2OCBjIDguMDg3LDQuMDIwMyAyMy4xOTcsMTAuODIxMSAyOC4yNjcsLTAuMDE0OCAxLjg3MSwtMy45",
	"OTQyIDQuMDY2LC0xMC43NDYxIDUuMDM1LC0xNC44NjkyIDEuMzY5LC01LjgxNjggLTEuNDg0LC0xOC4w",
	"NDMgLTcuNDYzLC0xOS45OTQ5IC01LjI4MSwtMS43MjM4IC0xMS40NDMsLTEuNjE4OCAtMTcuODA0LC0w",
	"LjM0MSAtMC43NDksMC42MjMgLTEuNTgzLDEuNzA5IC0yLjE2NiwyLjg0MSAtNC41NDIsMC4xNzYyIC04",
	"Ljc5NSwtMC4yNDM4IC0xMi4zODMsLTIuMTEwOSAwLjM0LC0zLjM1OSAtMS45MzIsLTMuODk4MSAtNC4w",
	"NjIsLTQuNTg5OSAtMS41NzksLTYuMjYwOSAzLjE1OSwtMTQuNDM3MSAyLjAyNSwtMjAuMTQ2MSAtMC44",
	"MDksLTQuMDY3MiAtNS44MTMsLTQuNjk2MSAtOS40OTEsLTUuNDU3IC0wLjEyLC0yLjI2MDIgMC4xNjEs",
	"LTQuMTQ2ODkgMC40MTIsLTYuMDU5IC0wLjg0MSwtMy4wOTg4MyAtNC42MTMsLTQuODYyODkgLTguMTg3",
	"LC01LjI5NDkyIC0xMS43NTksLTEuNDE0MDY0IC0yOS42MTMzLC0yLjA0OTIyMSAtNDAuOTIzOSwyLjAx",
	"Nzk3IC0zLjE1NjIsNy43NDE3NSAtNS42NDI2LDE3LjE1Nzg1IC04LjI3MTUsMjUuOTk4MDUgLTExLjAz",
	"MTIsLTEuMTc4MSAtMTkuOTUzMSw0Ljc1OTggLTI4LjM2NCw4LjY1IC0yLjkxMjEsMS4zNSAtNi45NDA2",
	"LDIuMDkzNyAtOC4wMjg1LDQuNDExNyAtMS4wNTQ3LDIuMjQ0MiAtMC42MjMxLDYuNTQ1MyAtMC44ODQ4",
	"LDEwLjYwODIgLTAuNjY2LDEwLjM3NyAtMS4yMzYzLDIwLjM4NiAtMy45NzY2LDMxLjAxMSAtMS4yMzA0",
	"LDQuNzY3OSAtMy4zNzUsOC45NzUgLTQuODcxMSwxMy41NjkxIC0xLjM4MjgsNC4yNTc5IC0zLjc5ODgs",
	"OS41MTk5IC00LjQyODksMTMuNzY1OSAtMC45MzQzLDYuMjkzIDQuOTkxNCw2LjY0MyA4Ljc4MDUsOS4z",
	"NyA1Ljg1NzQsNC4yMTcgMTAuNDU1MSw2LjU0OSAxNi43OTg4LDEwLjM1NSAxLjg3ODksMS4xMjcgNy41",
	"NDUsMy45OCA4LjE4OTUsNS4yOTQgMS4yODEyLDIuNjA1IC0yLjE5OTIsNi4yNzggLTMuMTI5Nyw4LjMy",
	"IC0xLjQ3MTksMy4yMjkgLTIuMjM5NSw1Ljk3MiAtMi40NTA0LDkuMTU4IC01LjMyMTUsMC44NDEgLTku",
	"MzU1NSw0LjAwOCAtMTEuNzkyMiw3LjU3OSAtNC4wMzA4LDUuOTEgLTYuODI2MiwxNi44NDQgLTMuMzM4",
	"NywyNS4xNjEgMC4yNzM1LDAuNjU1IDEuNjM3NSwxLjk0MyAxLjgzODcsMi45NDkgMC4zOTY5LDEuOTgx",
	"IC0wLjc0NjksNC42MTUgLTAuODE4LDYuNzIyIC0wLjM2NjQsMTAuODEgMS44MjksMjAuMTI0IDkuMTA2",
	"MywyMy4zODQgMi45NTQzLDExLjc2OSAxMy41MjgxLDE1LjY4MiAyMy40OTAyLDIxLjUzMSAzLjcyMzks",
	"Mi4xODYgNy44Mjg5LDMuNTgzIDEyLjA2ODQsNS4xNDMgMTUuMjA4Miw1LjU5NyAzOC41NDE5LDQuNTQz",
	"IDUxLjE2MzksLTUuMDAzIDUuMzUyLC00LjA0OCAxMy45MDcsLTEyLjU5NSAxNi45NjcsLTE4Ljc4MyA4",
	"LjA4MiwtMTYuMzM3IDcuNTA4LC00My42NCAxLjg1NSwtNjMuNTEzIC0wLjc2LC0yLjY2OCAtMS44NjIs",
	"LTYuNTkgLTMuNDAxLC05Ljc5NSAtMS4wNzMsLTIuMjM4IC00LjQwOCwtNi43MTYgLTQuMDAzLC04LjY5",
	"MiAwLjQxNywtMi4wNDMgNy42MDQsLTcuNSA5LjE0NSwtOC45ODYgMi43NzUsLTIuNjc3IDguMDQ3LC02",
	"LjIzIDguNDc0LC05LjYwOCAwLjQ1OSwtMy41OTUgLTEuNTg0LC04LjUxMyAtMi42MTksLTExLjk4MiAt",
	"My40NiwtMTEuNTc2OSAtNi44MzYsLTIyLjI3ODEgLTEwLjc1OSwtMzIuNTk5MiIgc3R5bGU9ImZpbGw6",
	"IzIzMWYyMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSIgLz48cGF0",
	"aCBkPSJtIDkwLjQ5MSwxNTcuMjU1IGMgMC40Mzg3LDAuNTg0IDIuODUwOCwxLjQ3MSA2LjIyNTgsLTAu",
	"MTU0IDAsMCAtNCwtMC42NjcgLTMuNjY3MiwtNy4zMzYgbCAtMS42NjY4LDAuMzM0IGMgMCwwIC0xLjcy",
	"MjYsNi4wNDcgLTAuODkxOCw3LjE1NiIgc3R5bGU9ImZpbGw6I2Y3ZTRjZDtmaWxsLW9wYWNpdHk6MTtm",
	"aWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSIgLz48cGF0aCBkPSJtIDExOS43MTcsOTkuOTM0IGMg",
	"MCwtMS4wMTIxIC0wLjgyMSwtMS44MzI4IC0xLjgzNCwtMS44MzI4IC0xLjAxMiwwIC0xLjgzMywwLjgy",
	"MDcgLTEuODMzLDEuODMyOCAwLDEuMDEyIDAuODIxLDEuODM0IDEuODMzLDEuODM0IDEuMDEzLDAgMS44",
	"MzQsLTAuODIyIDEuODM0LC0xLjgzNCIgc3R5bGU9ImZpbGw6IzFkMTkxOTtmaWxsLW9wYWNpdHk6MTtm",
	"aWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSIgLz48cGF0aCBkPSJtIDEyMS41NSw5MS40MzQgYyAw",
	"LC0xLjAxMjEgLTAuODIxLC0xLjgzMjggLTEuODM0LC0xLjgzMjggLTEuMDEyLDAgLTEuODMzLDAuODIw",
	"NyAtMS44MzMsMS44MzI4IDAsMS4wMTIxIDAuODIxLDEuODM0IDEuODMzLDEuODM0IDEuMDEzLDAgMS44",
	"MzQsLTAuODIxOSAxLjgzNCwtMS44MzQiIHN0eWxlPSJmaWxsOiMxZDE5MTk7ZmlsbC1vcGFjaXR5OjE7"
].join("");
//#endregion
//#region src/client/components/SvgIcons.tsx
/**
* dsh-jenkins —— 内联 SVG 图标组件。
*/
function SvgPlus({ size }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 16 16",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.5,
		strokeLinecap: "round",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 3.5v9M3.5 8h9" })
	});
}
function SvgClock({ size }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: 12,
			cy: 12,
			r: 10
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("polyline", { points: "12 6 12 12 16 14" })]
	});
}
//#endregion
//#region src/client/components/FooterButton.tsx
/**
* dsh-jenkins —— 侧边栏底部入口（sidebar.footer.action）：
* 当前工作区根目录存在 dsh-Jenkins 配置时显示，点击打开「执行 Jenkins Job」弹框。
*/
function FooterButton({ run, launchStore, historyStore, wide = false, useWorkspaces, useSessions }) {
	const workspaceItems = useWorkspaces ? useWorkspaces((s) => s && s.items || []) : [];
	const currentSessionId = useSessions ? useSessions((s) => s && s.current) : null;
	if (!useWorkspaces || !useSessions) console.warn("[dsh-jenkins] footer slot missing standard props", {
		hasWs: !!useWorkspaces,
		hasSs: !!useSessions
	});
	const [launch, setLaunch] = (0, react.useState)(null);
	const isDeployTargets = (cfg) => !!(cfg && Array.isArray(cfg.entries) && cfg.entries.length > 0);
	const cwd = (0, react.useMemo)(() => {
		const list = Array.isArray(workspaceItems) ? workspaceItems : [];
		const current = list.find((w) => Array.isArray(w.sessionIds) && w.sessionIds.indexOf(currentSessionId) !== -1);
		return current && current.path || (list.length ? list[0].path : null);
	}, [workspaceItems, currentSessionId]);
	(0, react.useEffect)(() => {
		let alive = true;
		setLaunch(null);
		if (!cwd) return;
		console.log("[dsh-jenkins] footer check cwd=", cwd, "session=", currentSessionId, "workspaces=", (workspaceItems || []).map((w) => w.path));
		run(currentSessionId || "", {
			op: "workspaceConfig",
			cwd
		}).then((r) => {
			if (!alive) return;
			console.log("[dsh-jenkins] workspaceConfig result", r);
			if (r && r.ok && r.found && isDeployTargets(r.config)) setLaunch({
				cwd,
				config: r.config,
				sessionId: currentSessionId || ""
			});
		}).catch((e) => {
			console.error("[dsh-jenkins] workspaceConfig failed", cwd, e);
		});
		return () => {
			alive = false;
		};
	}, [cwd, currentSessionId]);
	if (!launch) return null;
	const firstJob = launch.config && Array.isArray(launch.config.entries) && launch.config.entries[0] && launch.config.entries[0].job || "";
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "dshj-footer-group" + (wide ? "" : " dshj-footer-rail-group"),
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "dshj-footer-btn" + (wide ? "" : " dshj-footer-btn-rail"),
			title: t("runJob") + "（" + firstJob + " · " + launch.cwd + "）",
			"aria-label": t("runJob"),
			onClick: () => launchStore.open(launch),
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				src: JENKINS_LOGO,
				alt: "",
				className: "dshj-footer-logo"
			}), wide ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "dshj-footer-label",
				children: "Jenkins"
			}) : null]
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "dshj-footer-btn" + (wide ? "" : " dshj-footer-btn-rail"),
			title: t("historyBtn"),
			"aria-label": t("historyBtn"),
			onClick: () => historyStore.open(launch.cwd),
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SvgClock, { size: wide ? 16 : 18 }), wide ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "dshj-footer-label",
				children: t("historyBtn")
			}) : null]
		})]
	}) });
}
//#endregion
//#region src/client/storage.ts
/** 发布参数回显缓存（按工作区路径，浏览器 localStorage；不可用时静默降级）。 */
const CACHE_KEY = "dsh-jenkins.lastParams.v1";
const readCache = () => {
	try {
		const raw = window.localStorage.getItem(CACHE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch (e) {
		return {};
	}
};
const writeCache = (cwd, entry) => {
	try {
		const all = readCache();
		all[cwd] = entry;
		window.localStorage.setItem(CACHE_KEY, JSON.stringify(all));
	} catch (e) {}
};
/** 发布历史记录（按工作区路径，浏览器 localStorage；最近 50 条）。 */
const HISTORY_KEY = "dsh-jenkins.history.v1";
const readHistory = (cwd) => {
	try {
		const all = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "{}");
		return Array.isArray(all[cwd]) ? all[cwd] : [];
	} catch (e) {
		return [];
	}
};
const writeHistory = (cwd, list) => {
	try {
		const all = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "{}");
		all[cwd] = list;
		window.localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
	} catch (e) {}
};
const pushHistory = (cwd, entry) => {
	const list = readHistory(cwd);
	list.unshift(entry);
	if (list.length > 50) list.length = 50;
	writeHistory(cwd, list);
	return entry.id;
};
const updateHistoryResult = (cwd, id, result) => {
	const list = readHistory(cwd);
	const hit = list.find((e) => e.id === id);
	if (!hit) return;
	hit.result = result;
	writeHistory(cwd, list);
};
/** 聚合所有工作区的历史，每条附带所属工作区路径。 */
const readAllHistory = () => {
	try {
		const all = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "{}");
		const out = [];
		for (const cwd of Object.keys(all)) {
			if (!Array.isArray(all[cwd])) continue;
			for (const e of all[cwd]) out.push(Object.assign({}, e, { cwd }));
		}
		return out;
	} catch (e) {
		return [];
	}
};
/** cwd 为 null 时清空全部工作区历史。 */
const clearHistory = (cwd) => {
	try {
		const all = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "{}");
		if (cwd === null) for (const k of Object.keys(all)) delete all[k];
		else delete all[cwd];
		window.localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
	} catch (e) {}
};
const storage = {
	readCache,
	writeCache,
	readHistory,
	pushHistory,
	updateHistoryResult,
	readAllHistory,
	clearHistory
};
/** 服务器匹配：配置里的 server（名称 / id / 地址）与已配置服务器比对（地址去尾部斜杠）。 */
const normServerUrl = (u) => String(u || "").trim().replace(/\/+$/, "");
function matchServer(s, ref) {
	const r = String(ref || "").trim();
	return s.name === r || s.id === r || normServerUrl(s.baseUrl) === normServerUrl(r);
}
//#endregion
//#region src/client/components/HistoryModal.tsx
/**
* dsh-jenkins —— 发布历史弹框：聚合所有工作区最近 50 次发布，可按工作区筛选（默认全部）。
*/
function HistoryModal({ historyStore, useWorkspaces, useLaunch }) {
	const cwd = useLaunch();
	const workspaceItems = useWorkspaces && typeof useWorkspaces === "function" ? useWorkspaces((s) => s && s.items || []) : [];
	const realPaths = (Array.isArray(workspaceItems) ? workspaceItems : []).map((w) => w && typeof w.path === "string" ? w.path : null).filter((p) => !!p);
	const [filter, setFilter] = (0, react.useState)("all");
	const [list, setList] = (0, react.useState)([]);
	(0, react.useEffect)(() => {
		if (!cwd) {
			setList([]);
			return;
		}
		setList(storage.readAllHistory());
	}, [cwd]);
	if (!cwd) return null;
	const wsPaths = [.../* @__PURE__ */ new Set([...realPaths, ...list.map((e) => e.cwd).filter((p) => !!p)])].sort();
	const wsOptions = [{
		id: "all",
		label: t("historyAll")
	}].concat(wsPaths.map((p) => ({
		id: p,
		label: p
	})));
	const filtered = filter === "all" ? list : list.filter((e) => e.cwd === filter);
	const filterLabel = filter === "all" ? t("historyAll") : filter;
	const fmtTime = (ts) => {
		try {
			return new Date(ts).toLocaleString();
		} catch (e) {
			return String(ts);
		}
	};
	const resultClass = (r) => {
		if (!r) return "dshj-history-pending";
		if (r === "SUCCESS") return "dshj-ok";
		if (r === "FAILURE" || r === "ABORTED") return "dshj-err";
		return "dshj-warn";
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "dshj-backdrop",
		onClick: () => historyStore.close(),
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-modal dshj-history-modal",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-modal-title",
						children: t("historyTitle")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-modal-sub",
						children: filterLabel
					})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-close",
						"aria-label": t("close"),
						title: t("close"),
						onClick: () => historyStore.close(),
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-body",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-server-field",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
							className: "dshj-server-label",
							children: t("historyWsField")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
							className: "dshj-select",
							value: filter,
							onChange: (e) => setFilter(e.target.value),
							children: wsOptions.map((o) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: o.id,
								children: o.label
							}, o.id))
						})]
					}), filtered.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-empty",
						children: t("historyEmpty")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-history-list",
						children: filtered.map((e) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshj-history-item",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dshj-history-head",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshj-history-time",
										children: fmtTime(e.time)
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshj-history-result " + resultClass(e.result),
										children: e.result || t("historyPending")
									})]
								}),
								filter === "all" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dshj-history-ws",
									children: e.cwd
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dshj-history-main",
									children: e.job + (e.env ? " · " + e.env : "") + (e.server ? " · " + e.server : "")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dshj-history-params",
									children: t("historyParams") + Object.keys(e.params || {}).map((k) => k + "=" + String(e.params[k])).join(", ")
								})
							]
						}, e.id))
					})]
				}),
				filtered.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-history-ops",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn dshj-btn-small dshj-btn-danger",
						onClick: () => {
							storage.clearHistory(filter === "all" ? null : filter);
							setList(storage.readAllHistory());
						},
						children: t("historyClear")
					})
				}) : null
			]
		})
	});
}
//#endregion
//#region src/client/components/ErrorBoundary.tsx
/**
* dsh-jenkins —— 渲染错误边界：组件崩溃时显示错误而非白屏。
*/
var ErrorBoundary = class extends react.Component {
	constructor(props) {
		super(props);
		this.state = { error: null };
	}
	static getDerivedStateFromError(error) {
		return { error };
	}
	render() {
		if (this.state.error !== null) {
			console.error("[dsh-jenkins] render error in", this.props.label || "component", this.state.error);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-empty dshj-err",
				children: (this.props.label || "component") + " error: " + String(this.state.error && this.state.error.message || this.state.error)
			});
		}
		return this.props.children;
	}
};
//#endregion
//#region src/client/components/PickerModal.tsx
/**
* dsh-jenkins —— 通用选择器弹框：dsh Modal（按钮触发 → 搜索框 + 可滚动列表）。
*/
function PickerModal({ open, title, search, setSearch, placeholder, options, selectedId, emptyText, onSelect, onClose }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open,
		onClose,
		title,
		closeLabel: t("close"),
		headless: true,
		className: "dshj-picker-modal",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-picker-card",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-picker-card-head",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-picker-card-title",
					children: title
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dshj-close",
					"aria-label": t("close"),
					title: t("close"),
					onClick: onClose,
					children: "✕"
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-picker-card-body",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					className: "dshj-input",
					autoFocus: true,
					value: search,
					placeholder,
					onChange: (e) => setSearch(e.target.value)
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-picker-list",
					children: options.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-empty",
						children: emptyText || t("pickerNoMatch")
					}) : options.map((o) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-picker-item" + (o.id === selectedId ? " dshj-picker-active" : ""),
						onClick: () => onSelect(o.id),
						children: o.label
					}, o.id))
				})]
			})]
		})
	});
}
//#endregion
//#region src/client/components/LauncherModal.tsx
/**
* dsh-jenkins —— 执行 Jenkins Job 弹框（shell.overlay）：
* 服务器 / Job 选择 → 参数表单回显 → 触发构建 → 轮询状态（排队 → 构建中 → 结果）。
*/
function LauncherModalInner({ launch, run, launchStore, historyStore, interval }) {
	const config = launch.config;
	const sessionId = launch.sessionId || "";
	const entries = config && Array.isArray(config.entries) ? config.entries : [];
	const firstEntry = entries[0] || null;
	const configServerRefs = entries.map((e) => e.server).filter(Boolean);
	const cached = storage.readCache()[launch.cwd] || null;
	const [formValues, setFormValues] = (0, react.useState)({});
	const [submitting, setSubmitting] = (0, react.useState)(false);
	const [actionError, setActionError] = (0, react.useState)("");
	const [runState, setRunState] = (0, react.useState)(null);
	const [servers, setServers] = (0, react.useState)([]);
	const [serverPool, setServerPool] = (0, react.useState)([]);
	const [serverMismatch, setServerMismatch] = (0, react.useState)([]);
	const [selectedServerId, setSelectedServerId] = (0, react.useState)("");
	const [detail, setDetail] = (0, react.useState)(null);
	const [detailLoading, setDetailLoading] = (0, react.useState)(false);
	const [detailError, setDetailError] = (0, react.useState)("");
	const [jobs, setJobs] = (0, react.useState)([]);
	const [jobsLoading, setJobsLoading] = (0, react.useState)(false);
	const [jobsError, setJobsError] = (0, react.useState)("");
	const [selectedJobPath, setSelectedJobPath] = (0, react.useState)("");
	const [jobSearch, setJobSearch] = (0, react.useState)("");
	const [jobPickOpen, setJobPickOpen] = (0, react.useState)(false);
	const [jobPickSearch, setJobPickSearch] = (0, react.useState)("");
	const [paramsOpen, setParamsOpen] = (0, react.useState)(false);
	const selectedServer = servers.find((s) => s.id === selectedServerId) || null;
	const IS_DASH_LABEL = /^[-—–]{3,}$/;
	(0, react.useEffect)(() => {
		let alive = true;
		run(sessionId, { op: "list" }).then((r) => {
			if (!alive) return;
			const list = r && r.ok ? r.servers || [] : [];
			setServers(list);
			const matched = list.filter((s) => configServerRefs.some((ref) => matchServer(s, ref)));
			const unmatched = configServerRefs.filter((ref) => !list.some((s) => matchServer(s, ref)));
			const pool = matched.length ? matched : list;
			setServerPool(pool);
			setServerMismatch(matched.length === 0 ? unmatched : []);
			const preferred = cached && pool.find((s) => s.id === cached.serverId) || (pool.length ? pool[0] : null);
			setSelectedServerId(preferred ? preferred.id : "");
		}).catch(() => {
			if (alive) setServers([]);
		});
		return () => {
			alive = false;
		};
	}, []);
	(0, react.useEffect)(() => {
		let alive = true;
		setJobs([]);
		setJobsError("");
		setSelectedJobPath("");
		setJobSearch("");
		if (!selectedServer) {
			setJobsLoading(false);
			return;
		}
		setJobsLoading(true);
		run(sessionId, {
			op: "jobs",
			serverId: selectedServer.id
		}).then((r) => {
			if (!alive) return;
			setJobsLoading(false);
			if (r && r.ok) {
				const list = (r.jobs || []).filter((j) => !j.folder);
				setJobs(list);
				const cachedJob = cached && cached.jobPath ? list.find((j) => j.path === cached.jobPath) || null : null;
				const entry = entries.find((en) => matchServer(selectedServer, en.server)) || null;
				const preferred = cachedJob || entry && list.find((j) => j.path === entry.job) || null;
				setSelectedJobPath(preferred ? preferred.path : "");
				setJobSearch(preferred ? preferred.path : "");
			} else setJobsError(r && r.error || t("jobsFailed"));
		}).catch((e) => {
			if (alive) {
				setJobsLoading(false);
				setJobsError(e instanceof Error ? e.message : String(e));
			}
		});
		return () => {
			alive = false;
		};
	}, [selectedServerId]);
	(0, react.useEffect)(() => {
		let alive = true;
		setDetail(null);
		setDetailError("");
		if (!selectedServer || !selectedJobPath) {
			setDetailLoading(false);
			return;
		}
		setDetailLoading(true);
		const base = (selectedServer.baseUrl || "").replace(/\/+$/, "");
		const segments = selectedJobPath.split("/").map((s) => encodeURIComponent(s));
		const jobUrl = segments.length ? base + "/job/" + segments.join("/job/") : base;
		run(sessionId, {
			op: "jobDetail",
			serverId: selectedServer.id,
			jobUrl
		}).then((r) => {
			if (!alive) return;
			setDetailLoading(false);
			if (r && r.ok) setDetail(r);
			else {
				setDetail(null);
				setDetailError(tErr(r, t("detailFailed")));
			}
		}).catch((e) => {
			if (alive) {
				setDetailLoading(false);
				setDetail(null);
				setDetailError(e instanceof Error ? e.message : String(e));
			}
		});
		return () => {
			alive = false;
		};
	}, [selectedJobPath]);
	(0, react.useEffect)(() => {
		const init = {};
		const entry = selectedServer ? entries.find((en) => en.job === selectedJobPath && matchServer(selectedServer, en.server)) || null : null;
		if (entry) {
			const params = entry.parameters || {};
			for (const k of Object.keys(params)) {
				const v = params[k];
				init[k] = typeof v === "boolean" ? v : v === null || v === void 0 ? "" : String(v);
			}
		}
		const serverParams = detail && Array.isArray(detail.params) ? detail.params : [];
		for (const p of serverParams) {
			if (p.name in init) continue;
			init[p.name] = p.type === "boolean" ? String(p.defaultValue) === "true" : p.defaultValue === null || p.defaultValue === void 0 ? "" : String(p.defaultValue);
		}
		const fresh = storage.readCache()[launch.cwd] || null;
		if (fresh && fresh.jobPath === selectedJobPath && fresh.parameters) {
			for (const k of Object.keys(init)) if (Object.prototype.hasOwnProperty.call(fresh.parameters, k)) {
				const v = fresh.parameters[k];
				init[k] = typeof v === "boolean" ? v : v === null || v === void 0 ? "" : String(v);
			}
		}
		setFormValues(init);
		setRunState(null);
		setActionError("");
	}, [
		selectedJobPath,
		launch.cwd,
		detail ? detail.params : null
	]);
	const runRef = (0, react.useRef)(runState);
	runRef.current = runState;
	(0, react.useEffect)(() => {
		const cur = runRef.current;
		if (!cur || cur.phase !== "queued" && cur.phase !== "running") return;
		return interval(() => {
			const r = runRef.current;
			if (!r) return;
			if (Date.now() - (r.since || 0) > 6e5) {
				setRunState({
					...r,
					phase: "error",
					message: t("pollTimeout")
				});
				return;
			}
			if (r.phase === "queued") run(sessionId, {
				op: "queueStatus",
				serverId: r.serverId,
				queueId: r.queueId
			}).then((res) => {
				const c = runRef.current;
				if (!c || c.phase !== "queued") return;
				if (!res || !res.ok) {
					setRunState({
						...c,
						phase: "error",
						message: tErr(res, t("queuePollFailed"))
					});
					return;
				}
				if (res.state === "started") setRunState({
					...c,
					phase: "running",
					buildNumber: res.buildNumber,
					message: t("buildStarted", { n: res.buildNumber })
				});
				else if (res.state === "cancelled") {
					storage.updateHistoryResult(launch.cwd, c.historyId, "CANCELLED");
					setRunState({
						...c,
						phase: "error",
						message: t("cancelled") + (res.why || t("unknownReason"))
					});
				} else setRunState({
					...c,
					message: t("queuing") + (res.why || t("waitingExecutor"))
				});
			}).catch((e) => {
				const c = runRef.current;
				if (c) setRunState({
					...c,
					phase: "error",
					message: e instanceof Error ? e.message : String(e)
				});
			});
			else run(sessionId, {
				op: "buildStatus",
				serverId: r.serverId,
				segments: r.segments,
				buildNumber: r.buildNumber
			}).then((res) => {
				const c = runRef.current;
				if (!c || c.phase !== "running") return;
				if (!res || !res.ok) {
					if (res && res.notFound) return;
					setRunState({
						...c,
						phase: "error",
						message: tErr(res, t("buildPollFailed"))
					});
					return;
				}
				if (res.building) setRunState({
					...c,
					message: t("buildingRun", { d: fmtDur(Date.now() - (res.timestamp || Date.now())) })
				});
				else {
					storage.updateHistoryResult(launch.cwd, c.historyId, res.result || "UNKNOWN");
					setRunState({
						...c,
						phase: "done",
						result: res.result || "UNKNOWN",
						duration: res.duration || 0,
						url: res.url || "",
						buildNumber: res.number || c.buildNumber,
						message: t("buildEnded")
					});
				}
			}).catch((e) => {
				const c = runRef.current;
				if (c) setRunState({
					...c,
					phase: "error",
					message: e instanceof Error ? e.message : String(e)
				});
			});
		}, 2500);
	}, [
		runState ? runState.phase : null,
		runState ? runState.queueId : null,
		runState ? runState.buildNumber : null
	]);
	const onSubmit = () => {
		if (submitting) return;
		if (!selectedJobPath) {
			setActionError(t("jobRequired"));
			return;
		}
		setSubmitting(true);
		setParamsOpen(false);
		setActionError("");
		const entry = selectedServer ? entries.find((en) => en.job === selectedJobPath && matchServer(selectedServer, en.server)) || null : null;
		const entryParams = entry && entry.parameters || {};
		const serverDefaults = {};
		if (detail && Array.isArray(detail.params)) for (const p of detail.params) serverDefaults[p.name] = p.defaultValue;
		const submitValues = {};
		for (const k of Object.keys(formValues)) {
			if (IS_DASH_LABEL.test(k)) continue;
			if (Object.prototype.hasOwnProperty.call(entryParams, k)) submitValues[k] = formValues[k];
			else if (serverDefaults[k] === void 0 || String(formValues[k]) !== String(serverDefaults[k])) submitValues[k] = formValues[k];
		}
		run(sessionId, {
			op: "workspaceTrigger",
			cwd: launch.cwd,
			serverId: selectedServerId,
			job: selectedJobPath,
			parameters: submitValues
		}).then((res) => {
			setSubmitting(false);
			if (res && res.ok) {
				storage.writeCache(launch.cwd, {
					serverId: selectedServerId,
					jobPath: selectedJobPath,
					parameters: submitValues
				});
				const historyId = storage.pushHistory(launch.cwd, {
					id: "h" + Date.now() + "-" + Math.floor(Math.random() * 1e6),
					time: Date.now(),
					job: selectedJobPath,
					server: selectedServer ? selectedServer.name : "",
					params: submitValues,
					result: null
				});
				if (res.queueId) setRunState({
					phase: "queued",
					queueId: res.queueId,
					serverId: res.serverId,
					segments: res.segments,
					buildNumber: null,
					historyId,
					message: t("queuedMsg", { n: res.queueId }),
					since: Date.now()
				});
				else setRunState({
					phase: "running",
					queueId: null,
					serverId: res.serverId,
					segments: res.segments,
					buildNumber: res.nextBuildNumber || null,
					historyId,
					message: t("triggeredMsg"),
					since: Date.now()
				});
			} else setActionError(tErr(res, t("triggerFailed")));
		}).catch((e) => {
			setSubmitting(false);
			setActionError(e instanceof Error ? e.message : String(e));
		});
	};
	const serverParamsByName = {};
	if (detail && Array.isArray(detail.params)) for (const p of detail.params) serverParamsByName[p.name] = p;
	const formKeys = Object.keys(formValues);
	const formParamsJson = {};
	for (const k of formKeys) {
		const p = serverParamsByName[k];
		const item = { value: formValues[k] };
		if (p) {
			if (p.description) item.description = p.description;
			if (p.type) item.type = p.type;
			if (p.defaultValue !== null && p.defaultValue !== void 0) item.defaultValue = p.defaultValue;
			if (Array.isArray(p.choices) && p.choices.length) item.choices = p.choices;
		} else item.source = "config";
		if (IS_DASH_LABEL.test(k)) item.submitted = false;
		formParamsJson[k] = item;
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "dshj-backdrop",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-modal",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-modal-title",
						children: t("runJob")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-modal-sub",
						children: (selectedJobPath || firstEntry && firstEntry.job || "") + " · " + launch.cwd
					})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-close",
						"aria-label": t("close"),
						title: t("close"),
						onClick: () => launchStore.close(),
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-server-field",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						className: "dshj-server-label",
						children: t("serverField")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
						className: "dshj-select",
						value: selectedServerId,
						disabled: !!runState || submitting || serverPool.length === 0,
						onChange: (e) => setSelectedServerId(e.target.value),
						children: serverPool.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: "",
							disabled: true,
							children: t("noServersHint")
						}, "__none") : serverPool.map((s) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: s.id,
							children: s.name + (configServerRefs.some((ref) => matchServer(s, ref)) ? t("configMark") : "")
						}, s.id))
					})]
				}),
				serverMismatch.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-server-field",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", { className: "dshj-server-label" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-warn",
						style: {
							fontSize: 12,
							lineHeight: 1.5
						},
						children: t("serverMismatch", { list: serverMismatch.join(LANG === "zh" ? "、" : ", ") })
					})]
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-server-field",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
							className: "dshj-server-label",
							children: t("jobField")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "dshj-picker" + (jobSearch ? "" : " dshj-picker-empty") + (jobsError ? " dshj-picker-error" : ""),
							disabled: !!runState || submitting || jobsLoading || !selectedServer,
							onClick: () => {
								setJobPickSearch("");
								setJobPickOpen(true);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshj-picker-value",
								children: jobSearch ? jobSearch : !selectedServer ? t("jobPlaceholder") : jobsLoading ? t("jobsLoading") : jobsError ? t("jobsFailed") : jobs.length === 0 ? t("jobsEmpty") : t("jobPlaceholder")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshj-picker-caret",
								children: "▾"
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PickerModal, {
							open: jobPickOpen,
							title: t("jobField"),
							search: jobPickSearch,
							setSearch: setJobPickSearch,
							placeholder: t("jobPlaceholder"),
							options: jobs.filter((j) => !j.folder && (j.path.toLowerCase().indexOf(jobPickSearch.toLowerCase()) !== -1 || j.name.toLowerCase().indexOf(jobPickSearch.toLowerCase()) !== -1)).map((j) => ({
								id: j.path,
								label: j.path
							})),
							selectedId: selectedJobPath || void 0,
							emptyText: jobsError ? t("jobsFailed") : jobs.length === 0 ? t("jobsEmpty") : void 0,
							onSelect: (id) => {
								setSelectedJobPath(id);
								setJobSearch(id);
								setJobPickOpen(false);
							},
							onClose: () => setJobPickOpen(false)
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "dshj-divider" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-modal-body",
					children: runState ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-run-title",
							children: runState.phase === "queued" ? t("phaseQueued") : runState.phase === "running" ? t("phaseRunning") : runState.phase === "done" ? t("phaseDone") : t("phaseError")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-run-message " + (runState.phase === "done" ? runState.result === "SUCCESS" ? "dshj-ok" : runState.result === "FAILURE" || runState.result === "ABORTED" ? "dshj-err" : "dshj-warn" : ""),
							children: runState.message || ""
						}),
						runState.phase === "queued" || runState.phase === "running" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "dshj-spinner" }) : null,
						runState.phase === "done" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dshj-run-line",
								children: t("resultLabel", { n: runState.buildNumber }) + (runState.result || "UNKNOWN")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dshj-run-line",
								children: t("duration") + fmtDur(runState.duration || 0)
							}),
							runState.url ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								className: "dshj-link",
								href: runState.url,
								target: "_blank",
								rel: "noopener noreferrer",
								children: t("openPage")
							}) : null
						] }) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshj-form-ops",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshj-btn",
								onClick: () => setRunState(null),
								children: t("backParams")
							}), runState.phase === "done" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshj-btn dshj-btn-primary",
								onClick: onSubmit,
								children: t("rebuild")
							}) : null]
						})
					] }) : !selectedJobPath ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-empty",
						children: t("selectJobFirst")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
						detailLoading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-empty",
							children: t("loadingParams")
						}) : detailError && formKeys.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-err dshj-empty",
							children: detailError
						}) : formKeys.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-empty",
							children: t("noParams")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-form-grid",
							children: formKeys.map((k) => {
								const v = formValues[k];
								const p = serverParamsByName[k];
								const set = (nv) => setFormValues((prev) => ({
									...prev,
									[k]: nv
								}));
								if (IS_DASH_LABEL.test(k)) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dshj-form-divider",
									children: p && p.description ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshj-form-divider-text",
										children: p.description
									}) : null
								}, k);
								let control;
								if (p && p.type === "boolean") control = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "dshj-check",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: !!v,
										onChange: (e) => set(e.target.checked)
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: String(v) })]
								});
								else if (p && p.type === "choice") control = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
									className: "dshj-select",
									value: String(v),
									onChange: (e) => set(e.target.value),
									children: (p.choices || []).map((c) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: String(c),
										children: String(c)
									}, String(c)))
								});
								else if (p && p.type === "text") control = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									className: "dshj-textarea",
									rows: 3,
									value: String(v === void 0 || v === null ? "" : v),
									onChange: (e) => set(e.target.value)
								});
								else if (typeof v === "boolean") control = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "dshj-check",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: !!v,
										onChange: (e) => set(e.target.checked)
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: String(v) })]
								});
								else control = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									className: "dshj-input",
									type: p && p.type === "password" ? "password" : "text",
									value: String(v === void 0 || v === null ? "" : v),
									onChange: (e) => set(e.target.value)
								});
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dshj-form-field",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
											className: "dshj-form-label",
											title: k,
											children: k
										}),
										control,
										p && p.description ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "dshj-form-desc",
											children: p.description
										}) : null
									]
								}, k);
							})
						}),
						detailError && formKeys.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-err",
							children: detailError
						}) : null,
						actionError ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-err",
							children: actionError
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshj-form-ops dshj-submit-row",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshj-btn dshj-btn-primary",
								disabled: submitting,
								onClick: onSubmit,
								children: submitting ? t("submitting") : t("submit")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshj-link-btn",
								disabled: submitting,
								onClick: () => setParamsOpen(true),
								children: t("viewParams")
							})]
						})
					] })
				})
			]
		}), paramsOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-backdrop dshj-json-backdrop",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-modal dshj-json-modal",
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-modal-title",
						children: t("formParamsJson")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-modal-sub",
						children: selectedJobPath || ""
					})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-close",
						"aria-label": t("close"),
						title: t("close"),
						onClick: () => setParamsOpen(false),
						children: "✕"
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-modal-body",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
						className: "dshj-code",
						children: JSON.stringify(formParamsJson, null, 2)
					})
				})]
			})
		}) : null]
	}) });
}
function LauncherModal({ run, launchStore, historyStore, interval, useLaunch }) {
	const launch = useLaunch();
	if (!launch) return null;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorBoundary, {
		label: "LauncherModalInner",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LauncherModalInner, {
			launch,
			run,
			launchStore,
			historyStore,
			interval
		})
	});
}
//#endregion
//#region src/client/templates.ts
/**
* dsh-jenkins —— dsh-Jenkins 配置模板（json / js / ts，按界面语言选择）。
*
* 数组格式：每个元素 = 一个发布目标（job + server + environments 参数表），
* server 支持服务器名称 / id / 地址，弹框自动取交集并预选。
*/
const TEMPLATES = LANG === "zh" ? {
	json: "[\n  {\n    \"job\": \"build-app\",\n    \"server\": \"http://uat.example.com\",\n    \"environments\": { \"BRANCH\": \"main\", \"DEPLOY\": false }\n  },\n  {\n    \"job\": \"build-app\",\n    \"server\": \"http://prod.example.com\",\n    \"environments\": { \"BRANCH\": \"release-1.0\", \"DEPLOY\": true }\n  }\n]",
	js: "// dsh-jenkins.js — CommonJS 导出（工作区无 \"type\":\"module\" 时使用）\nmodule.exports = [\n  {\n    job: 'build-app',\n    server: 'http://uat.example.com',\n    environments: { BRANCH: 'main', DEPLOY: false },\n  },\n  {\n    job: 'build-app',\n    server: 'http://prod.example.com',\n    environments: { BRANCH: 'release-1.0', DEPLOY: true },\n  },\n]",
	ts: "// dsh-jenkins.ts — ESM 导出（经 tsx 求值）\nexport default [\n  {\n    job: 'build-app',\n    server: 'http://uat.example.com',\n    environments: { BRANCH: 'main', DEPLOY: false },\n  },\n  {\n    job: 'build-app',\n    server: 'http://prod.example.com',\n    environments: { BRANCH: 'release-1.0', DEPLOY: true },\n  },\n] satisfies Array<Record<string, unknown>>"
} : {
	json: "[\n  {\n    \"job\": \"build-app\",\n    \"server\": \"http://uat.example.com\",\n    \"environments\": { \"BRANCH\": \"main\", \"DEPLOY\": false }\n  },\n  {\n    \"job\": \"build-app\",\n    \"server\": \"http://prod.example.com\",\n    \"environments\": { \"BRANCH\": \"release-1.0\", \"DEPLOY\": true }\n  }\n]",
	js: "// dsh-jenkins.js — CommonJS export (use when the workspace has no \"type\":\"module\")\nmodule.exports = [\n  {\n    job: 'build-app',\n    server: 'http://uat.example.com',\n    environments: { BRANCH: 'main', DEPLOY: false },\n  },\n  {\n    job: 'build-app',\n    server: 'http://prod.example.com',\n    environments: { BRANCH: 'release-1.0', DEPLOY: true },\n  },\n]",
	ts: "// dsh-jenkins.ts — ESM export (evaluated via tsx)\nexport default [\n  {\n    job: 'build-app',\n    server: 'http://uat.example.com',\n    environments: { BRANCH: 'main', DEPLOY: false },\n  },\n  {\n    job: 'build-app',\n    server: 'http://prod.example.com',\n    environments: { BRANCH: 'release-1.0', DEPLOY: true },\n  },\n] satisfies Array<Record<string, unknown>>"
};
//#endregion
//#region src/client/components/TemplateSection.tsx
/**
* dsh-jenkins —— 配置模板内联区（js / ts / json Tab，置于表单上方）。
*/
/** 剪贴板兜底（execCommand 已废弃但仍是最后的降级路径）。 */
function fallbackCopy(text, done) {
	const ta = document.createElement("textarea");
	ta.value = text;
	ta.style.position = "fixed";
	ta.style.opacity = "0";
	document.body.appendChild(ta);
	ta.select();
	try {
		document.execCommand("copy");
	} catch {}
	document.body.removeChild(ta);
	done();
}
function TemplateSection() {
	const [active, setActive] = (0, react.useState)("json");
	const [copied, setCopied] = (0, react.useState)(false);
	const tabs = [
		"json",
		"js",
		"ts"
	];
	const code = TEMPLATES[active] || "";
	const doCopy = () => {
		const done = () => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		};
		if (navigator && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done).catch(() => fallbackCopy(code, done));
		else fallbackCopy(code, done);
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "dshj-template",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-template-head",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-template-title",
					children: t("templateTitle")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-template-tabs",
					role: "tablist",
					children: tabs.map((tab) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						role: "tab",
						className: "dshj-tab" + (tab === active ? " dshj-tab-active" : ""),
						"aria-selected": tab === active,
						onClick: () => {
							setActive(tab);
							setCopied(false);
						},
						children: tab
					}, tab))
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-hint",
				children: t("templateHint")
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-code-head",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-code-file",
					children: "dsh-jenkins." + active
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dshj-btn dshj-btn-small",
					onClick: doCopy,
					children: copied ? t("copied") : t("copy")
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
				className: "dshj-code",
				children: code
			})
		]
	});
}
//#endregion
//#region src/client/components/SettingsPage.tsx
/**
* dsh-jenkins —— 设置 → Jenkins 配置页：服务器管理（settings.section）。
*/
function SettingsPage({ run, sessionId }) {
	const [servers, setServers] = (0, react.useState)([]);
	const [loading, setLoading] = (0, react.useState)(true);
	const [editing, setEditing] = (0, react.useState)(null);
	const [busy, setBusy] = (0, react.useState)(false);
	const [formError, setFormError] = (0, react.useState)("");
	const [testResult, setTestResult] = (0, react.useState)(null);
	const [confirmDeleteId, setConfirmDeleteId] = (0, react.useState)(null);
	const [templateOpen, setTemplateOpen] = (0, react.useState)(false);
	const load = () => {
		setLoading(true);
		run(sessionId, { op: "list" }).then((r) => {
			if (r && r.ok) setServers(r.servers || []);
		}).catch(() => {}).finally(() => setLoading(false));
	};
	(0, react.useEffect)(() => {
		load();
	}, []);
	const EMPTY_DRAFT = {
		isNew: true,
		id: null,
		name: "",
		baseUrl: "",
		username: "",
		token: "",
		masked: "",
		insecure: false
	};
	const draft = editing || EMPTY_DRAFT;
	const startAdd = () => {
		setEditing({ ...EMPTY_DRAFT });
		setFormError("");
		setTestResult(null);
	};
	const startEdit = (s) => {
		setEditing({
			isNew: false,
			id: s.id,
			name: s.name,
			baseUrl: s.baseUrl,
			username: s.username,
			token: "",
			masked: s.tokenMasked || "",
			insecure: !!s.insecure
		});
		setFormError("");
		setTestResult(null);
	};
	const setField = (k) => (e) => setEditing((prev) => ({
		...prev || EMPTY_DRAFT,
		[k]: e.target.value
	}));
	const setInsecure = (e) => setEditing((prev) => ({
		...prev || EMPTY_DRAFT,
		insecure: e.target.checked
	}));
	const doTest = () => {
		setBusy(true);
		setTestResult(null);
		run(sessionId, {
			op: "test",
			server: {
				id: draft.id,
				name: draft.name,
				baseUrl: draft.baseUrl,
				username: draft.username,
				token: draft.token,
				insecure: !!draft.insecure
			}
		}).then((r) => setTestResult(r && r.ok ? {
			ok: true,
			text: t("connected") + (r.version ? "（Jenkins " + r.version + "）" : "")
		} : {
			ok: false,
			text: tErr(r, t("testFailed"))
		})).catch((e) => setTestResult({
			ok: false,
			text: e instanceof Error ? e.message : String(e)
		})).finally(() => setBusy(false));
	};
	const doSave = () => {
		setBusy(true);
		setFormError("");
		run(sessionId, {
			op: "save",
			server: {
				id: draft.id,
				name: draft.name,
				baseUrl: draft.baseUrl,
				username: draft.username,
				token: draft.token,
				insecure: !!draft.insecure
			}
		}).then((r) => {
			if (r && r.ok) {
				setEditing(null);
				load();
			} else setFormError(tErr(r, t("saveFailed")));
		}).catch((e) => setFormError(e instanceof Error ? e.message : String(e))).finally(() => setBusy(false));
	};
	const doDelete = (id) => {
		if (confirmDeleteId !== id) {
			setConfirmDeleteId(id);
			return;
		}
		setConfirmDeleteId(null);
		run(sessionId, {
			op: "delete",
			id
		}).then((r) => {
			if (r && r.ok) load();
		});
	};
	const doTestSaved = (s) => {
		setTestResult(null);
		run(sessionId, {
			op: "test",
			server: { id: s.id }
		}).then((r) => setTestResult(r && r.ok ? {
			ok: true,
			text: t("connected") + "：" + s.name + (r.version ? "（Jenkins " + r.version + "）" : "")
		} : {
			ok: false,
			text: t("connectionFailed") + s.name + "：" + tErr(r, t("testFailed"))
		})).catch((e) => setTestResult({
			ok: false,
			text: t("connectionFailed") + s.name + "：" + (e instanceof Error ? e.message : String(e))
		}));
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "dshj-settings",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-head",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-title-row",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-title",
							children: t("settingsTitle")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshj-btn-icon",
							title: t("addServer"),
							"aria-label": t("addServer"),
							onClick: startAdd,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SvgPlus, { size: 16 })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshj-btn dshj-btn-small" + (templateOpen ? " dshj-btn-active" : ""),
							onClick: () => setTemplateOpen((v) => !v),
							children: t("templateBtn")
						})
					]
				})
			}),
			testResult ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-result " + (testResult.ok ? "dshj-ok" : "dshj-err"),
				children: testResult.text
			}) : null,
			templateOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TemplateSection, {}) : null,
			(editing || servers.length === 0) && !loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-editor",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-editor-title",
						children: draft.isNew ? t("addTitle") : t("editTitle")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-field",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", { children: t("nameLabel") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "dshj-input",
							value: draft.name,
							onChange: setField("name"),
							placeholder: t("namePlaceholder")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-field",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("urlLabel"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshj-req",
							children: "*"
						})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "dshj-input",
							value: draft.baseUrl,
							onChange: setField("baseUrl"),
							placeholder: t("urlPlaceholder")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-field",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", { children: t("usernameLabel") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "dshj-input",
							value: draft.username,
							onChange: setField("username"),
							placeholder: t("usernamePlaceholder")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-field",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [
							t("tokenLabel"),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshj-req",
								children: "*"
							}),
							draft.isNew ? "" : t("keepToken")
						] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "password",
							className: "dshj-input",
							value: draft.token,
							onChange: setField("token"),
							placeholder: draft.isNew ? t("tokenPlaceholder") : t("tokenSaved") + (draft.masked || "••••"),
							autoComplete: "off"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-field",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: "dshj-check",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: !!draft.insecure,
								onChange: setInsecure
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("tlsLabel") })]
						})
					}),
					formError ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-err",
						children: formError
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-editor-ops",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshj-btn",
								disabled: busy,
								onClick: doTest,
								children: busy ? t("testing") : t("testBtn")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshj-btn dshj-btn-primary",
								disabled: busy,
								onClick: doSave,
								children: t("saveBtn")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshj-btn",
								disabled: busy,
								onClick: () => setEditing(null),
								children: t("cancelBtn")
							})
						]
					})
				]
			}) : null,
			loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-empty",
				children: t("loading")
			}) : servers.length === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-list",
				children: servers.map((s) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-card",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-card-main",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-card-name",
							children: s.name
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-card-meta",
							children: s.baseUrl + "  ·  " + s.username + "  ·  " + (s.tokenMasked || "")
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-card-ops",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshj-btn dshj-btn-small",
								onClick: () => doTestSaved(s),
								children: t("testBtn")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshj-btn dshj-btn-small",
								onClick: () => startEdit(s),
								children: t("editBtn")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshj-btn dshj-btn-small" + (confirmDeleteId === s.id ? " dshj-btn-danger" : ""),
								onClick: () => doDelete(s.id),
								children: confirmDeleteId === s.id ? t("confirmDelete") : t("deleteBtn")
							})
						]
					})]
				}, s.id))
			})
		]
	});
}
//#endregion
//#region src/client/plugin.tsx
function createPlugin() {
	return {
		name: "dsh-jenkins",
		inject: [
			"slots",
			"remote",
			"remote.commands",
			"timer"
		],
		apply(ctx) {
			const run = makeRun(ctx);
			const { store: launchStore, useLaunch } = makeLaunchStore();
			const { store: historyStore, useLaunch: useHistoryLaunch } = makeHistoryStore();
			const slots = ctx.get("slots");
			if (slots === void 0) return;
			injectStyles();
			slots.inject("sidebar.footer.action", () => slots.register({
				name: "sidebar.footer.action",
				id: "dsh-jenkins",
				order: 10
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FooterButton, {
				run,
				launchStore,
				historyStore,
				wide: props.wide,
				useWorkspaces: props.useWorkspaces,
				useSessions: props.useSessions
			})));
			slots.inject("settings.section", () => slots.register({
				name: "settings.section",
				id: "dsh-jenkins",
				order: 25,
				label: () => t("settingsNav")
			}, (props) => {
				let sessionId = "";
				const useSessions = props.useSessions;
				if (useSessions) {
					const current = useSessions((state) => state && state.current);
					if (typeof current === "string") sessionId = current;
				}
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingsPage, {
					run,
					sessionId
				});
			}));
			slots.inject("shell.overlay", () => slots.register({
				name: "shell.overlay",
				id: "dsh-jenkins-launcher",
				order: 100
			}, () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LauncherModal, {
				run,
				launchStore,
				historyStore,
				interval: (cb, ms) => ctx.interval(cb, ms),
				useLaunch
			})));
			slots.inject("shell.overlay", () => slots.register({
				name: "shell.overlay",
				id: "dsh-jenkins-history",
				order: 110
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryModal, {
				historyStore,
				useLaunch: useHistoryLaunch,
				useWorkspaces: props.useWorkspaces
			})));
		}
	};
}
//#endregion
//#region src/client/index.ts
/**
* dsh-jenkins —— 浏览器半边入口（tsdown 打包，对齐 @lemcae/dsh-balance）。
*
* 本文件为纯 ESM 模块，直接导出插件形状 { name, inject, apply }；
* window.__ModuleLoader__.load 工厂包装由 tsdown 的 banner/intro/footer
* 在构建时生成（见 tsdown.config.ts）。外部依赖（react /
* react/jsx-runtime / @deepseek-ai/dsh-client-ui-primitives）构建时保持
* external，运行时经 factory 的 require 解析宿主模块表（seed）。
*/
const plugin = createPlugin();
const name = plugin.name;
const inject = plugin.inject;
const apply = plugin.apply;
//#endregion
exports.apply = apply;
exports.inject = inject;
exports.name = name;

return module.exports; } });
//# sourceMappingURL=client.js.map