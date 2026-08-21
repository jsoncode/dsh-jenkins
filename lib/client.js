window.__ModuleLoader__.load({ id: 'dsh-jenkins', factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let react = require("react");
let react_jsx_runtime = require("react/jsx-runtime");
let react_dom = require("react-dom");
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
	".dshj-head-ops{display:flex;align-items:center;gap:8px;flex:none}",
	".dshj-btn-icon{border:none;background:transparent;color:var(--dsw-alias-label-secondary,#888);width:24px;height:24px;padding:0;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}",
	".dshj-btn-icon:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));color:var(--dsw-alias-label-primary,#222)}",
	".dshj-btn-danger{color:var(--dsw-alias-state-error-primary);border-color:currentColor}",
	".dshj-btn-success{color:var(--dsw-alias-state-success-primary,#2a7d3c);border-color:currentColor;background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 10%,transparent)}",
	".dshj-btn-success:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 16%,transparent)}",
	".dshj-btn-solid{background:var(--dsw-alias-state-error-primary,#d33);border-color:transparent;color:#fff}",
	".dshj-btn-solid:hover:not(:disabled){background:var(--dsw-alias-state-error-primary,#d33)}",
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
	".dshj-field>.dshj-label-row{display:flex;align-items:center;justify-content:space-between;gap:8px}",
	".dshj-form-grid{display:grid;grid-template-columns:1fr;gap:14px 0;margin-top:10px}",
	".dshj-form-field{display:grid;grid-template-columns:168px minmax(0,1fr);align-items:center;gap:4px 10px}",
	".dshj-form-field>.dshj-input,.dshj-form-field>.dshj-select,.dshj-form-field>.dshj-textarea{width:100%;min-width:0}",
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
	".dshj-footer-btn{box-sizing:border-box;cursor:pointer;width:calc(100% + 4px);height:42px;color:var(--dsw-alias-label-primary);background:transparent;border:none;border-radius:12px;flex:none;align-items:center;gap:8px;margin:4px -2px;padding:0 10px 0 8px;font-family:inherit;font-size:14px;line-height:22px;display:flex;overflow:hidden}",
	".dshj-footer-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}",
	".dshj-footer-btn-rail{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;margin:8px 0 10px;padding:0}",
	".dshj-footer-group{width:100%;min-width:0}",
	".dshj-footer-rail-group{width:auto}",
	".dshj-footer-logo{height:20px;width:auto;flex:none;display:block}",
	".dshj-footer-rail-group .dshj-footer-logo{height:22px}",
	".dshj-footer-label{white-space:nowrap;overflow:hidden}",
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
	".dshj-badge{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;margin-left:6px;border-radius:999px;font-size:11px;line-height:1;font-weight:600;background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));color:var(--dsw-alias-label-secondary,#666)}",
	".dshj-tab-active .dshj-badge{background:var(--dsw-alias-label-primary-foreground,#fff);color:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3))}",
	".dshj-server-field{display:grid;grid-template-columns:168px minmax(0,1fr);align-items:center;gap:10px;padding:10px 18px 0;flex:none}",
	".dshj-server-label{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666);text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
	".dshj-server-ctrl{display:flex;align-items:center;gap:8px;min-width:0}",
	".dshj-server-ctrl .dshj-combo{flex:1;min-width:0}",
	".dshj-job-count{flex:none;font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap}",
	".dshj-divider{border-top:1px dashed var(--dsw-alias-border-l3,#bbb);margin:14px 18px 2px;flex:none}",
	".dshj-picker{display:flex;align-items:center;gap:8px;width:100%;height:34px;padding:0 12px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:8px;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#222);font-size:13px;font-family:inherit;cursor:pointer;transition:border-color .15s,box-shadow .15s}",
	".dshj-picker:hover:not(:disabled){border-color:var(--dsw-alias-border-l3,#b8b8b8)}",
	".dshj-picker:focus{outline:none;border-color:var(--dsw-alias-brand-primary,#1668e3);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 18%,transparent)}",
	".dshj-picker:disabled{opacity:.5;cursor:not-allowed}",
	".dshj-picker-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}",
	".dshj-picker-empty .dshj-picker-value{color:var(--dsw-alias-label-tertiary,#aaa)}",
	".dshj-picker-caret{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary,#888)}",
	".dshj-combo{position:relative;min-width:0}",
	".dshj-combo .dshj-picker{width:100%}",
	".dshj-combo-panel{position:fixed;z-index:2000;display:flex;flex-direction:column;background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);overflow:hidden}",
	".dshj-combo-search{padding:8px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);flex:none}",
	".dshj-combo-search .dshj-input{padding:6px 10px;font-size:13px}",
	".dshj-combo-list{flex:1;min-height:0;overflow-y:auto;padding:4px}",
	".dshj-combo-item{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;text-align:left;padding:7px 10px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#222);font-size:13px;cursor:pointer;font-family:inherit}",
	".dshj-combo-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}",
	".dshj-combo-item-active{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}",
	".dshj-combo-item-selected{color:var(--dsw-alias-brand-primary,#1668e3);font-weight:500}",
	".dshj-combo-check{flex:none;font-size:12px}",
	".dshj-combo-empty{padding:14px;text-align:center;color:var(--dsw-alias-label-tertiary,#999);font-size:13px}",
	".dshj-json-backdrop{z-index:1100}",
	".dshj-json-modal{width:min(620px,100%);height:min(72vh,520px);min-height:360px}",
	".dshj-server-modal{width:min(480px,100%);max-height:80vh}",
	".dshj-modal-body{flex:1;overflow-y:auto;padding:16px 18px;min-width:0;min-height:0}",
	".dshj-modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--dsw-alias-border-l1,#eee);flex:none;flex-wrap:wrap}",
	".dshj-config-modal{width:min(880px,100%);max-height:80vh;min-height:480px}",
	".dshj-config-body{padding:14px 18px 18px}",
	".dshj-config-body .dshj-server-field{padding:4px 0 0}",
	".dshj-config-body .dshj-divider{margin:14px 0 2px}",
	".dshj-config-body .dshj-history-ws-field{grid-template-columns:96px minmax(0,1fr)}",
	".dshj-history-modal{min-height:420px;max-height:82vh;width:640px}",
	".dshj-history-list{display:flex;flex-direction:column;gap:10px;padding:14px 2px 4px}",
	".dshj-history-item{border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:10px;padding:10px 14px;background:var(--dsw-alias-bg-base,#fff);transition:border-color .15s,background .15s,transform .15s}",
	".dshj-history-item-clickable{cursor:pointer}",
	".dshj-history-item-clickable:hover{border-color:var(--dsw-alias-brand-primary,#1668e3);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 5%,var(--dsw-alias-bg-base,#fff))}",
	".dshj-history-item-clickable:hover .dshj-history-main{color:var(--dsw-alias-brand-primary,#1668e3)}",
	".dshj-history-head{display:flex;align-items:center;justify-content:space-between;gap:8px}",
	".dshj-history-time{font-size:12px;color:var(--dsw-alias-label-tertiary,#999)}",
	".dshj-history-result{font-size:11px;font-weight:600;padding:2px 10px;border-radius:999px;white-space:nowrap;flex:none;margin:0}",
	".dshj-history-result.dshj-ok{color:var(--dsw-alias-state-success-primary,#2a7d3c);background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 14%,transparent)}",
	".dshj-history-result.dshj-err{color:var(--dsw-alias-state-error-primary,#d33);background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d33) 14%,transparent)}",
	".dshj-history-result.dshj-warn{color:var(--dsw-alias-state-warn-primary,#b8860b);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b8860b) 14%,transparent)}",
	".dshj-history-pending{color:var(--dsw-alias-state-warn-primary,#b8860b);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b8860b) 12%,transparent)}",
	".dshj-history-main{font-size:13px;font-weight:600;margin-top:6px;word-break:break-all;transition:color .15s}",
	".dshj-history-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}",
	".dshj-chip{font-size:11px;color:var(--dsw-alias-label-secondary,#888);background:var(--dsw-alias-bg-layer-2,#f5f6f8);border:1px solid var(--dsw-alias-border-l1,#eee);padding:1px 9px;border-radius:999px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}",
	".dshj-chip-ws{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}",
	".dshj-history-params{font-size:12px;color:var(--dsw-alias-label-tertiary,#999);margin-top:7px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;word-break:keep-all}",
	".dshj-history-ops{margin-top:12px;display:flex;justify-content:flex-end;gap:8px}",
	".dshj-log-modal{width:min(880px,100%);height:min(78vh,640px);min-height:420px}",
	".dshj-log-body{display:flex;flex-direction:column;overflow:hidden;padding:14px 16px}",
	".dshj-log-body .dshj-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}",
	".dshj-log-code{flex:1;min-height:0;max-height:none;margin:0;overflow:auto}",
	".dshj-log-truncated{font-size:12px;color:var(--dsw-alias-state-warn-primary,#b8860b);margin-top:8px;flex:none}",
	".dshj-log-ops{flex:none}",
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
	".dshj-card-name-row{display:flex;align-items:center;gap:8px;min-width:0}",
	".dshj-card-name{font-size:13px;font-weight:600;flex:none}",
	".dshj-card-test{margin:0;font-size:12px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}",
	".dshj-card-meta{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:2px;word-break:break-all}",
	".dshj-card-ops{display:flex;gap:6px;flex:none;flex-wrap:wrap}",
	".dshj-editor-ops{display:flex;gap:8px;margin-top:4px;flex-wrap:wrap}",
	".dshj-result{font-size:12px;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-2,#fafafa);margin-top:8px}",
	".dshj-template{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:12px 14px;background:var(--dsw-alias-bg-layer-2,#fafafa)}",
	".dshj-template-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px}",
	".dshj-template-title{font-size:13px;font-weight:600}",
	".dshj-template-tabs{display:flex;gap:6px}",
	".dshj-code-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}",
	".dshj-code-file{font-size:12px;color:var(--dsw-alias-label-secondary,#888);font-family:ui-monospace,SFMono-Regular,Consolas,monospace}",
	".dshj-code{margin:0;padding:12px 14px;background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;overflow:auto;max-height:52vh;font-size:12px;line-height:1.55;color:var(--dsw-alias-label-primary,#222);white-space:pre;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}",
	".dshj-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-bottom:10px}",
	".dshj-template-modal{width:min(680px,100%);height:min(76vh,620px);min-height:420px}",
	".dshj-template-modal .dshj-modal-body{display:flex;flex-direction:column;overflow:hidden}",
	".dshj-template-modal .dshj-template{flex:1;min-height:0;display:flex;flex-direction:column;border:none;padding:0;background:transparent}",
	".dshj-template-modal .dshj-template-head{flex:none}",
	".dshj-template-modal .dshj-hint{flex:none}",
	".dshj-template-modal .dshj-code-head{flex:none}",
	".dshj-template-modal .dshj-code{flex:1;min-height:0;max-height:none}"
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
		configBtn: "Jenkins 配置",
		tabPublish: "发布",
		tabConfig: "配置",
		tabHistory: "历史",
		projectField: "项目",
		projectPlaceholder: "搜索并选择项目…",
		noWorkspacesHint: "未发现工作区，请先打开一个工作区",
		serverField: "服务器",
		serverPlaceholder: "搜索并选择服务器…",
		noServersHint: "未配置服务器，请先到设置中添加",
		goAdd: "去添加",
		configMark: "（配置）",
		jobField: "Job 列表",
		jobCount: "总 {n} 个 job",
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
		historyLogHint: "点击查看完整构建日志",
		logTitle: "构建日志",
		logLoading: "加载构建日志…",
		logFailed: "加载构建日志失败",
		logEmpty: "（暂无日志输出）",
		logTruncated: "日志过长，仅显示末尾 {kb} KB",
		openBuildPage: "打开构建页面",
		pickerNoMatch: "无匹配选项",
		pickerSearchPlaceholder: "搜索…",
		jobRequired: "请先选择要发布的 Job",
		selectJobFirst: "请先在 Job 列表中选择要发布的 Job",
		projectConfigBtn: "项目配置",
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
		addServer: "新增服务器",
		serverEmpty: "暂无服务器，请点击右上角「新增服务器」",
		addTitle: "添加 Jenkins 服务器",
		editTitle: "编辑 Jenkins 服务器",
		nameLabel: "名称（选填）",
		namePlaceholder: "选填，留空用服务器地址",
		urlLabel: "服务器地址",
		urlPlaceholder: "https://jenkins.example.com",
		usernameLabel: "用户名",
		usernamePlaceholder: "必填，如 admin",
		tokenLabel: "Token",
		tokenPlaceholder: "API Token 或密码",
		tokenSaved: "已保存：",
		keepToken: "（留空则不修改）",
		createToken: "去创建",
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
			"username-required": "请填写用户名",
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
			"log-failed": "获取构建日志失败",
			"unknown-op": "未知操作",
			"params-invalid": "参数需为 JSON"
		}
	},
	en: {
		settingsNav: "Jenkins Config",
		settingsTitle: "Jenkins Server Config",
		configBtn: "Jenkins Config",
		tabPublish: "Publish",
		tabConfig: "Config",
		tabHistory: "History",
		projectField: "Project",
		projectPlaceholder: "Search and select a project…",
		noWorkspacesHint: "No workspaces found; open a workspace first",
		serverField: "Server",
		serverPlaceholder: "Search and select server…",
		noServersHint: "No servers configured; add one in settings",
		goAdd: "Add",
		configMark: " (config)",
		jobField: "Job List",
		jobCount: "{n} jobs total",
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
		historyLogHint: "Click to view the full build log",
		logTitle: "Build Log",
		logLoading: "Loading build log…",
		logFailed: "Failed to load build log",
		logEmpty: "(no log output yet)",
		logTruncated: "Log is too long; showing the last {kb} KB",
		openBuildPage: "Open build page",
		pickerNoMatch: "No matching options",
		pickerSearchPlaceholder: "Search…",
		jobRequired: "Please select a job to publish",
		selectJobFirst: "Select a job from the list first",
		projectConfigBtn: "Project Config",
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
		serverEmpty: "No servers yet — click \"Add Server\" (top right)",
		addTitle: "Add Jenkins Server",
		editTitle: "Edit Jenkins Server",
		nameLabel: "Name (optional)",
		namePlaceholder: "Optional; defaults to server URL",
		urlLabel: "Server URL",
		urlPlaceholder: "https://jenkins.example.com",
		usernameLabel: "Username",
		usernamePlaceholder: "Required, e.g. admin",
		tokenLabel: "Token",
		tokenPlaceholder: "API Token or password",
		tokenSaved: "Saved: ",
		keepToken: " (leave blank to keep)",
		createToken: "Create token",
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
			"username-required": "Username is required",
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
			"log-failed": "Failed to fetch build log",
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
* dsh-jenkins —— 浏览器半边：与宿主通信。
*
* 默认走宿主 webServer 注册的带信任围栏的 HTTP 路由 /dsh-jenkins/api
* （fetch POST JSON → { ok, value } 信封），请求不进入对话命令通道，因此不会在
* 页面产生 command 节点（空状态行 / {"ok":true,...} 调试卡片），后台轮询也不会
* 每 3 秒给会话追加一条记录。
*
* 老宿主（未注册该路由，如 headless 组合）自动回退到 commands.execute 命令通道，
* 仅作兼容，不影响新宿主上的行为。
*/
/**
* 尝试经 HTTP 路由执行一次 op。
* @returns 路由可用并返回有效载荷时返回 RunResult；否则返回 null（调用方回退命令通道）。
*/
async function runHttp(sessionId, op) {
	try {
		const response = await fetch("/dsh-jenkins/api", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(Object.assign({ sessionId: sessionId || "" }, op))
		});
		if (!response.ok) return null;
		const parsed = await response.json().catch(() => null);
		if (parsed === null || parsed.ok !== true || parsed.value === void 0) return null;
		const value = parsed.value;
		return value !== null && typeof value === "object" ? value : {
			ok: false,
			error: String(value)
		};
	} catch {
		return null;
	}
}
function makeRun(ctx) {
	return async function run(sessionId, op) {
		const viaHttp = await runHttp(sessionId, op);
		if (viaHttp !== null) return viaHttp;
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
//#region src/client/storage.ts
const HISTORY_LIMIT = 50;
function createStorage(run) {
	let mirror = {
		lastParams: {},
		history: {}
	};
	const readAll = async (sessionId) => {
		try {
			const res = await run(sessionId, { op: "cacheGet" });
			if (res && res.ok && res.cache && typeof res.cache === "object") {
				const c = res.cache;
				mirror = {
					lastParams: c.lastParams && typeof c.lastParams === "object" ? c.lastParams : {},
					history: c.history && typeof c.history === "object" ? c.history : {}
				};
			}
		} catch {}
		return mirror;
	};
	const persist = async (sessionId, key) => {
		try {
			await run(sessionId, {
				op: "cacheSet",
				key,
				value: mirror[key]
			});
		} catch {}
	};
	let migrated = false;
	const migrateLegacy = async (sessionId) => {
		if (migrated || typeof window === "undefined") return;
		migrated = true;
		try {
			const rawLast = window.localStorage.getItem("dsh-jenkins.lastParams.v1");
			const rawHistory = window.localStorage.getItem("dsh-jenkins.history.v1");
			if (!rawLast && !rawHistory) return;
			const lastParams = rawLast ? JSON.parse(rawLast) : {};
			const history = rawHistory ? JSON.parse(rawHistory) : {};
			if (typeof lastParams !== "object" || lastParams === null) return;
			if (typeof history !== "object" || history === null) return;
			const all = await readAll(sessionId);
			if (Object.keys(all.lastParams).length === 0 && Object.keys(all.history).length === 0) {
				mirror = {
					lastParams,
					history
				};
				await persist(sessionId, "lastParams");
				await persist(sessionId, "history");
			}
			window.localStorage.removeItem("dsh-jenkins.lastParams.v1");
			window.localStorage.removeItem("dsh-jenkins.history.v1");
		} catch {}
	};
	const historyOf = (all, cwd) => {
		const list = all.history[cwd];
		return Array.isArray(list) ? list : [];
	};
	return {
		readCache: async (sessionId, cwd) => {
			await migrateLegacy(sessionId);
			return (await readAll(sessionId)).lastParams[cwd] || null;
		},
		writeCache: async (sessionId, cwd, entry) => {
			await migrateLegacy(sessionId);
			await readAll(sessionId);
			mirror.lastParams[cwd] = entry;
			await persist(sessionId, "lastParams");
		},
		pushHistory: async (sessionId, cwd, entry) => {
			await migrateLegacy(sessionId);
			const all = await readAll(sessionId);
			const list = historyOf(all, cwd);
			list.unshift(entry);
			if (list.length > HISTORY_LIMIT) list.length = HISTORY_LIMIT;
			mirror.history[cwd] = list;
			await persist(sessionId, "history");
			return entry.id;
		},
		updateHistoryResult: async (sessionId, cwd, id, result) => {
			const all = await readAll(sessionId);
			const hit = historyOf(all, cwd).find((e) => e.id === id);
			if (!hit) return;
			hit.result = result;
			mirror.history[cwd] = historyOf(all, cwd);
			await persist(sessionId, "history");
		},
		updateHistoryPoll: async (sessionId, cwd, id, patch) => {
			const all = await readAll(sessionId);
			const hit = historyOf(all, cwd).find((e) => e.id === id);
			if (!hit) return;
			if (patch.buildNumber !== void 0) hit.buildNumber = patch.buildNumber;
			if (patch.queueId !== void 0) hit.queueId = patch.queueId;
			if (patch.url !== void 0) hit.url = patch.url;
			mirror.history[cwd] = historyOf(all, cwd);
			await persist(sessionId, "history");
		},
		readAllHistory: async (sessionId) => {
			await migrateLegacy(sessionId);
			const all = await readAll(sessionId);
			const out = [];
			for (const cwd of Object.keys(all.history)) for (const e of historyOf(all, cwd)) out.push(Object.assign({}, e, { cwd }));
			return out;
		},
		clearHistory: async (sessionId, cwd) => {
			await readAll(sessionId);
			if (cwd === null) mirror.history = {};
			else delete mirror.history[cwd];
			await persist(sessionId, "history");
		}
	};
}
/** 服务器匹配：配置里的 server（名称 / id / 地址）与已配置服务器比对（地址去尾部斜杠）。 */
const normServerUrl = (u) => String(u || "").trim().replace(/\/+$/, "");
function matchServer(s, ref) {
	const r = String(ref || "").trim();
	return s.name === r || s.id === r || normServerUrl(s.baseUrl) === normServerUrl(r);
}
//#endregion
//#region src/client/poller.ts
const POLL_TIMEOUT_MS = 6e5;
function createPoller(run, storage, getSession) {
	const listeners = /* @__PURE__ */ new Set();
	const live = /* @__PURE__ */ new Map();
	const inflight = /* @__PURE__ */ new Set();
	let scanning = false;
	/** 是否还有「进行中」任务：false 时 tick() 直接短路，不发任何请求。 */
	let hasInFlight = false;
	const emit = () => {
		for (const fn of Array.from(listeners)) try {
			fn();
		} catch {}
	};
	const segmentsOf = (e) => {
		if (Array.isArray(e.segments) && e.segments.length) return e.segments;
		return e.job ? e.job.split("/").filter(Boolean) : [];
	};
	const pollEntry = async (e) => {
		const key = e.id;
		if (inflight.has(key)) return;
		inflight.add(key);
		try {
			const cwd = e.cwd || "";
			const serverId = e.serverId;
			const segments = segmentsOf(e);
			if (!serverId || segments.length === 0) return;
			const sessionId = e.sessionId || getSession() || "";
			const since = e.since || e.time;
			if (Date.now() - since > POLL_TIMEOUT_MS) {
				await storage.updateHistoryResult(sessionId, cwd, key, "TIMEOUT");
				live.set(key, {
					entryId: key,
					cwd,
					phase: "error",
					status: "timeout",
					buildNumber: e.buildNumber ?? null,
					since
				});
				emit();
				return;
			}
			if (e.queueId != null && e.buildNumber == null) {
				const res = await run(sessionId, {
					op: "queueStatus",
					serverId,
					queueId: e.queueId
				}).catch(() => null);
				if (res && res.ok) {
					if (res.state === "started") {
						await storage.updateHistoryPoll(sessionId, cwd, key, { buildNumber: res.buildNumber });
						live.set(key, {
							entryId: key,
							cwd,
							phase: "running",
							status: "started",
							buildNumber: res.buildNumber,
							since
						});
					} else if (res.state === "cancelled") {
						await storage.updateHistoryResult(sessionId, cwd, key, "CANCELLED");
						live.set(key, {
							entryId: key,
							cwd,
							phase: "cancelled",
							status: "cancelled",
							buildNumber: null,
							since
						});
					} else live.set(key, {
						entryId: key,
						cwd,
						phase: "queued",
						status: "queued",
						buildNumber: null,
						since
					});
				}
			} else if (e.buildNumber != null) {
				const res = await run(sessionId, {
					op: "buildStatus",
					serverId,
					segments,
					buildNumber: e.buildNumber
				}).catch(() => null);
				if (res && res.ok) {
					if (res.building) live.set(key, {
						entryId: key,
						cwd,
						phase: "running",
						status: "building",
						buildNumber: e.buildNumber ?? null,
						since
					});
					else {
						await storage.updateHistoryResult(sessionId, cwd, key, res.result || "UNKNOWN");
						if (res.url) await storage.updateHistoryPoll(sessionId, cwd, key, { url: res.url });
						live.set(key, {
							entryId: key,
							cwd,
							phase: "done",
							status: "done",
							buildNumber: e.buildNumber ?? null,
							since,
							result: res.result || "UNKNOWN",
							duration: res.duration || 0,
							url: res.url || ""
						});
					}
				} else if (res && res.notFound) {} else live.set(key, {
					entryId: key,
					cwd,
					phase: "running",
					status: "building",
					buildNumber: e.buildNumber ?? null,
					since
				});
			}
		} finally {
			inflight.delete(key);
			emit();
		}
	};
	const scan = async () => {
		const sessionId = getSession() || "";
		let entries = [];
		try {
			entries = await storage.readAllHistory(sessionId);
		} catch {}
		let found = false;
		for (const e of entries) {
			if (e.result !== null && e.result !== void 0) continue;
			if (e.queueId == null && e.buildNumber == null) continue;
			found = true;
			pollEntry(e);
		}
		hasInFlight = found;
	};
	return {
		tick() {
			if (!hasInFlight) return;
			if (scanning) return;
			scanning = true;
			scan().finally(() => {
				scanning = false;
			});
		},
		refresh() {
			if (scanning) return;
			scanning = true;
			scan().finally(() => {
				scanning = false;
			});
		},
		subscribe(fn) {
			listeners.add(fn);
			return () => {
				listeners.delete(fn);
			};
		},
		getLive(entryId) {
			return live.get(entryId);
		}
	};
}
//#endregion
//#region src/client/store.ts
/**
* dsh-jenkins —— 浏览器半边：统一「Jenkins 配置」弹框开关（footer 入口 ↔ overlay 弹框共享）。
*
* 入口与弹框合并为单一弹框（tab：发布 / 配置 / 历史）后，不再需要独立的
* 发布（LaunchInfo）与历史（cwd）store —— 弹框内自行按当前工作区推导数据。
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
/** 统一「Jenkins 配置」弹框的打开状态（footer 入口 open，overlay 弹框消费）。 */
function makeConfigModalStore() {
	const store = createStore();
	const useOpen = () => {
		const [v, setV] = (0, react.useState)(!!store.value);
		(0, react.useEffect)(() => store.subscribe(() => setV(!!store.value)), []);
		return v;
	};
	return {
		store,
		useOpen
	};
}
//#endregion
//#region src/client/logo.ts
/**
* dsh-jenkins —— Jenkins 官方 logo（assets/logo.svg 压缩后内联为 data URI，由脚本注入，勿手改）。
*/
const JENKINS_LOGO = "data:image/svg+xml;base64," + [
	"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8",
	"IS0tIENyZWF0ZWQgd2l0aCBJbmtzY2FwZSAoaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvKSAtLT4N",
	"Cg0KPHN2Zw0KICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIg0K",
	"ICAgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyINCiAgIHhtbG5zOnJk",
	"Zj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyINCiAgIHhtbG5z",
	"OnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciDQogICB4bWxucz0iaHR0cDovL3d3dy53",
	"My5vcmcvMjAwMC9zdmciDQogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJj",
	"ZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiDQogICB4bWxuczppbmtzY2FwZT0iaHR0cDov",
	"L3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSINCiAgIGlkPSJzdmcyIg0KICAg",
	"dmVyc2lvbj0iMS4xIg0KICAgaW5rc2NhcGU6dmVyc2lvbj0iMC40OC4wIHI5NjU0Ig0KICAgd2lk",
	"dGg9IjIyNiINCiAgIGhlaWdodD0iMzEyIg0KICAgeG1sOnNwYWNlPSJwcmVzZXJ2ZSINCiAgIHNv",
	"ZGlwb2RpOmRvY25hbWU9ImplbmtpbnNMb2dvMS5zdmciPjxtZXRhZGF0YQ0KICAgICBpZD0ibWV0",
	"YWRhdGE4Ij48cmRmOlJERj48Y2M6V29yaw0KICAgICAgICAgcmRmOmFib3V0PSIiPjxkYzpmb3Jt",
	"YXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PjxkYzp0eXBlDQogICAgICAgICAgIHJkZjpyZXNv",
	"dXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+PGRjOnRpdGxl",
	"PjwvZGM6dGl0bGU+PC9jYzpXb3JrPjwvcmRmOlJERj48L21ldGFkYXRhPjxkZWZzDQogICAgIGlk",
	"PSJkZWZzNiI+PGNsaXBQYXRoDQogICAgICAgY2xpcFBhdGhVbml0cz0idXNlclNwYWNlT25Vc2Ui",
	"DQogICAgICAgaWQ9ImNsaXBQYXRoMTgiPjxwYXRoDQogICAgICAgICBkPSJNIDAsMjQ5NC44NCAw",
	"LDAgbCAxODA0LjM0LDAgMCwyNDk0Ljg0IC0xODA0LjM0LDAgeiINCiAgICAgICAgIGlkPSJwYXRo",
	"MjAiDQogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPjwvY2xpcFBh",
	"dGg+PC9kZWZzPjxzb2RpcG9kaTpuYW1lZHZpZXcNCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIg0K",
	"ICAgICBib3JkZXJjb2xvcj0iIzY2NjY2NiINCiAgICAgYm9yZGVyb3BhY2l0eT0iMSINCiAgICAg",
	"b2JqZWN0dG9sZXJhbmNlPSIxMCINCiAgICAgZ3JpZHRvbGVyYW5jZT0iMTAiDQogICAgIGd1aWRl",
	"dG9sZXJhbmNlPSIxMCINCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiDQogICAgIGlua3Nj",
	"YXBlOnBhZ2VzaGFkb3c9IjIiDQogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTUwMCINCiAg",
	"ICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iODQ0Ig0KICAgICBpZD0ibmFtZWR2aWV3NCINCiAg",
	"ICAgc2hvd2dyaWQ9ImZhbHNlIg0KICAgICBpbmtzY2FwZTp6b29tPSIxIg0KICAgICBpbmtzY2Fw",
	"ZTpjeD0iNjEuMTQwODg0Ig0KICAgICBpbmtzY2FwZTpjeT0iMTcyLjUzMDc2Ig0KICAgICBpbmtz",
	"Y2FwZTp3aW5kb3cteD0iMjYxMyINCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjU4NSINCiAgICAg",
	"aW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMCINCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXll",
	"cj0iZzEwIiAvPjxnDQogICAgIGlkPSJnMTAiDQogICAgIGlua3NjYXBlOmdyb3VwbW9kZT0ibGF5",
	"ZXIiDQogICAgIGlua3NjYXBlOmxhYmVsPSJpbmtfZXh0X1hYWFhYWCINCiAgICAgdHJhbnNmb3Jt",
	"PSJtYXRyaXgoMS4yNSwwLDAsLTEuMjUsMCwzMTIpIj48Zw0KICAgICAgIGlkPSJnMzM5MyI+PHBh",
	"dGgNCiAgICAgICAgIGQ9Im0gMTc3LjcxOCwxMjkuMjY0IGMgMCwtNDkuNDI4OCAtMzkuMTc1LC04",
	"OS40OTkyIC04Ny41LC04OS40OTkyIC00OC4zMjQyLDAgLTg3LjQ5OTI1LDQwLjA3MDQgLTg3LjQ5",
	"OTI1LDg5LjQ5OTIgMCw0OS40MyAzOS4xNzUwNSw4OS41MDEgODcuNDk5MjUsODkuNTAxIDQ4LjMy",
	"NSwwIDg3LjUsLTQwLjA3MSA4Ny41LC04OS41MDEiDQogICAgICAgICBzdHlsZT0iZmlsbDojZDMz",
	"ODMzO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIg0KICAgICAg",
	"ICAgaWQ9InBhdGgyMiINCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAi",
	"IC8+PHBhdGgNCiAgICAgICAgIGQ9Im0gNi4yODQzOCwxMDcuMDk4IGMgMCwwIC02LjMzNDM4LDkz",
	"LjMzMyA3OS42NjYwMiw5NiBsIC01Ljk5OTYsMTAgLTQ2LjY2NjQsLTE1LjY2NyAtMTMuMzMzNiwt",
	"MTUuMzMzIC0xMS42NjY0MiwtMjIuMzM0IC02LjY2NzE5LC0yNiAyLC0xNy4zMzMiDQogICAgICAg",
	"ICBzdHlsZT0iZmlsbDojZWYzZDNhO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0",
	"cm9rZTpub25lIg0KICAgICAgICAgaWQ9InBhdGgyNCINCiAgICAgICAgIGlua3NjYXBlOmNvbm5l",
	"Y3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgNCiAgICAgICAgIGQ9Ik0gMzAuMjg4MywxOTAuMzE5",
	"IEMgMTQuOTM2MywxNzQuNjExIDUuNDM2MzMsMTUyLjkyMyA1LjQzNjMzLDEyOC45MyBsIDAsMCBj",
	"IDAsLTIzLjk4OCA5LjQ5OTk3LC00NS42Nzg4IDI0Ljg1MTk3LC02MS4zODM5IGwgMCwwIEMgNDUu",
	"NjQ3Nyw1MS44NDEgNjYuODE1Miw0Mi4xNSA5MC4yMTY4LDQyLjE1IGwgMCwwIGMgMjMuNDAyMiww",
	"IDQ0LjU3MTIsOS42OTEgNTkuOTI5MiwyNS4zOTYxIGwgMCwwIGMgMTUuMzUxLDE1LjcwNTEgMjQu",
	"ODUzLDM3LjM5NTkgMjQuODUzLDYxLjM4MzkgbCAwLDAgYyAwLDIzLjk5MyAtOS41MDIsNDUuNjgx",
	"IC0yNC44NTMsNjEuMzg5IGwgMCwwIGMgLTE1LjM1OCwxNS43MDIgLTM2LjUyNywyNS4zOTMgLTU5",
	"LjkyOTIsMjUuMzk1IGwgMCwwIEMgNjYuODE1MiwyMTUuNzEyIDQ1LjY0NzcsMjA2LjAyMSAzMC4y",
	"ODgzLDE5MC4zMTkgbCAwLDAgeiBNIDI2LjQwMjMsNjMuNzQ2OSBDIDEwLjA4NjcsODAuNDMyOCAw",
	"LDEwMy40OTMgMCwxMjguOTMgbCAwLDAgYyAwLDI1LjQ0MSAxMC4wODY3LDQ4LjQ5OSAyNi40MDIz",
	"LDY1LjE4NiBsIDAsMCBjIDE2LjMxMTgsMTYuNjkgMzguODkxNSwyNy4wMzUgNjMuODE0NSwyNy4w",
	"MzIgbCAwLDAgYyAyNC45MjMyLDAuMDAzIDQ3LjUwNTIsLTEwLjM0MiA2My44MTQyLC0yNy4wMzIg",
	"bCAwLDAgYyAxNi4zMTcsLTE2LjY4NyAyNi40MDUsLTM5Ljc0NyAyNi40MDMsLTY1LjE4NiBsIDAs",
	"MCBjIDAuMDAyLC0yNS40MzcgLTEwLjA4NiwtNDguNDk3MiAtMjYuNDAzLC02NS4xODMxIGwgMCww",
	"IEMgMTM3LjcyMiw0Ny4wNTc4IDExNS4xNCwzNi43MTQxIDkwLjIxNjgsMzYuNzE0MSBsIDAsMCBj",
	"IC0yNC45MjMsMCAtNDcuNTAyNywxMC4zNDM3IC02My44MTQ1LDI3LjAzMjggbCAwLDAiDQogICAg",
	"ICAgICBzdHlsZT0iZmlsbDojMjMxZjIwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJv",
	"O3N0cm9rZTpub25lIg0KICAgICAgICAgaWQ9InBhdGgyNiINCiAgICAgICAgIGlua3NjYXBlOmNv",
	"bm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgNCiAgICAgICAgIGQ9Im0gMTI3LjA1MSwxMjgu",
	"NzY4IC0xMy4zMzQsLTIgLTE4LjAwMDIsLTIgLTExLjY2NzIsLTAuMzMzIC0xMS4zMzI4LDAuMzMz",
	"IC04LjY2NzIsMi42NjcgLTcuNjY2OCw4LjMzMyAtNiwxNyAtMS4zMzMyLDMuNjY3IC04LDIuNjY2",
	"IC00LjY2NjgsNy42NjcgLTMuMzMzMiwxMSAzLjY2NzIsOS42NjcgOC42NjYsMyA3LC0zLjMzNCAz",
	"LjMzNCwtNy4zMzMgNCwwLjY2NyAxLjMzMjgsMS42NjYgLTEuMzMyOCw3LjY2NyAtMC4zMzQsOS42",
	"NjcgMiwxMy4zMzMgLTAuMDc4MSw3LjYxNiA2LjA3ODEsOS43MTcgMTAuNjY2OCw3LjY2NyAxOC42",
	"NjcyLDggMjAuNjY2MiwtMyAxOCwtMTMgOC4zMzQsLTEzLjMzMyA1LjMzMywtOS42NjcgMS4zMzMs",
	"LTI0IC00LC0yMC42NjcgLTcuMzMzLC0xOC4zMzMgLTcsLTkuNjY3Ig0KICAgICAgICAgc3R5bGU9",
	"ImZpbGw6I2YwZDZiNztmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9u",
	"ZSINCiAgICAgICAgIGlkPSJwYXRoMjgiDQogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3Vy",
	"dmF0dXJlPSIwIiAvPjxwYXRoDQogICAgICAgICBkPSJtIDExNS43MTcsNzEuMTAyIC00Ny42Njc0",
	"LC0yIDAsLTggNCwtMjggLTIsLTIuMzM0IC0zMy4zMzI4LDExLjMzNCAtMi4zMzQsNCAtMy4zMzMy",
	"LDM3LjY2NiAtNy42NjU2LDIyLjY2NyAtMS42NjcyLDUuMzMzIDI2LjY2NiwxOC4zMzMgOC4zMzQs",
	"My4zMzQgNy4zMzI4LC05IDYuMzMzMiwtNS42NjcgNy4zMzQsLTIuMzMzIDMuMzMyOCwtMSA0LC0x",
	"Ny4zMzMgMywtMy42NjY4IDcuNjY3MiwyLjY2NjggLTUuMzM0LC0xMC4zMzQgMjkuMDAwMiwtMTMu",
	"NjY2IC0zLjY2NiwtMiINCiAgICAgICAgIHN0eWxlPSJmaWxsOiMzMzUwNjE7ZmlsbC1vcGFjaXR5",
	"OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDMwIg0K",
	"ICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48cGF0aA0KICAgICAg",
	"ICAgZD0ibSAzNi43MTY4LDE4Ny40MzUgOC42NjYsMyA3LC0zLjMzNCAzLjMzNCwtNy4zMzMgNCww",
	"LjY2NyAxLDQgLTIsNy42NjYgMiwxOC4zMzQgLTEuNjY3MiwxMCA2LDcgMTMsMTAuMzMzIC0zLjY2",
	"NjgsNSAtMTguMzMzMiwtOSAtNy42NjY4LC02IC00LjMzMzIsLTkuMzMzIC02LjY2NjgsLTkgLTIs",
	"LTEwLjY2NyAxLjMzNCwtMTEuMzMzIg0KICAgICAgICAgc3R5bGU9ImZpbGw6IzZkNmI2ZDtmaWxs",
	"LW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSINCiAgICAgICAgIGlkPSJw",
	"YXRoMzIiDQogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPjxwYXRo",
	"DQogICAgICAgICBkPSJtIDUwLjM4MjgsMjE4Ljc2OCBjIDAsMCA1LDEyLjMzMyAyNSwxOC4zMzMg",
	"MjAsNiAxLDQuMzM0IDEsNC4zMzQgbCAtMjEuNjY2LC04LjMzNCAtOC4zMzQsLTguMzMzIC0zLjY2",
	"NiwtNi42NjcgNy42NjYsMC42NjciDQogICAgICAgICBzdHlsZT0iZmlsbDojZGNkOWQ4O2ZpbGwt",
	"b3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIg0KICAgICAgICAgaWQ9InBh",
	"dGgzNCINCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgN",
	"CiAgICAgICAgIGQ9Im0gNDAuMzgyOCwxODkuNzY4IGMgMCwwIC03LDIzLjMzNCAxOS42NjY4LDI2",
	"LjY2NyBsIC0xLDQgLTE4LjMzMjgsLTQuMzM0IC01LjMzNCwtMTcuMzMzIDEuMzM0LC0xMS4zMzMg",
	"My42NjYsMi4zMzMiDQogICAgICAgICBzdHlsZT0iZmlsbDojZGNkOWQ4O2ZpbGwtb3BhY2l0eTox",
	"O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIg0KICAgICAgICAgaWQ9InBhdGgzNiINCiAg",
	"ICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgNCiAgICAgICAg",
	"IGQ9Im0gNTEuMDQ5NiwxNTguNzY4IDQuMzY0NSw0LjIyOSBjIDAsMCAxLjk2OTksLTAuMjI5IDIu",
	"MzAyNywtMi41NjIgMC4zMzI4LC0yLjMzNCAxLjMzMjgsLTIzLjMzNCAxNS42NjYsLTM0LjY2OCAx",
	"LjMwNzQsLTEuMDM0IC0xMC42NjYsMS42NjggLTEwLjY2NiwxLjY2OCBsIC0xMC42NjcyLDE2LjY2",
	"NiINCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmN2U0Y2Q7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxl",
	"OmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDM4Ig0KICAgICAgICAgaW5r",
	"c2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48cGF0aA0KICAgICAgICAgZD0ibSAxMTIu",
	"Mzg1LDE2NS4xMDEgYyAwLDAgMC43NzcsMTAuMTA0IDMuNDk4LDkuMzI3IDIuNzIxLC0wLjc3NyAy",
	"LjcyMSwtMy40OTggMi43MjEsLTMuNDk4IDAsMCAtNi42MDgsLTQuMjc1IC02LjIxOSwtNS44Mjki",
	"DQogICAgICAgICBzdHlsZT0iZmlsbDojZjdlNGNkO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpl",
	"dmVub2RkO3N0cm9rZTpub25lIg0KICAgICAgICAgaWQ9InBhdGg0MCINCiAgICAgICAgIGlua3Nj",
	"YXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgNCiAgICAgICAgIGQ9Im0gMTQwLjA1",
	"LDIwMi4xMDEgYyAwLDAgLTUuNDk0LC0xLjE2IC02LC02IC0wLjUwNiwtNC44NDEgNiwtMSA3LC0w",
	"LjY2NyINCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmN2U0Y2Q7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1y",
	"dWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDQyIg0KICAgICAgICAg",
	"aW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48cGF0aA0KICAgICAgICAgZD0ibSA5",
	"OS43MTY4LDIwMS43NjcgYyAwLDAgLTcuMzM0LC0xIC03LjMzNCwtNS42NjYgMCwtNC42NjcgOC4z",
	"MzQyLC00LjMzNCAxMC42NjcyLC0yLjMzNCINCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmN2U0Y2Q7",
	"ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiDQogICAgICAgICBp",
	"ZD0icGF0aDQ0Ig0KICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48",
	"cGF0aA0KICAgICAgICAgZD0ibSA1NC4zODI4LDE4MC4xMDEgYyAwLDAgLTEyLjY2NzIsNy42Njcg",
	"LTE0LDAuMzMzIC0xLjMzMzIsLTcuMzMzIC00LjMzNCwtMTIuNjY3IDIsLTIwLjMzMyBsIC00LjMz",
	"MzIsMS4zMzMgLTQsMTAuMzMzIC0xLjMzMjgsMTAgNy42NjYsOC4wMDEgOC42NjY4LC0wLjY2NyA1",
	"LC00IDAuMzMzMiwtNSINCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmN2U0Y2Q7ZmlsbC1vcGFjaXR5",
	"OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDQ2Ig0K",
	"ICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48cGF0aA0KICAgICAg",
	"ICAgZD0ibSA2MC4zODI4LDIwMS4xMDEgYyAwLDAgNS42NjY4LDI5LjMzMyAzNC4zMzQsMzUgMjMu",
	"NjAxMiw0LjY2NSAzNS45OTkyLC0xIDQwLjY2NjIsLTYuMzMzIDAsMCAtMjEsMjQuOTk5IC00MS4w",
	"MDAyLDE3LjMzMyAtMjAsLTcuNjY3IC0zNC42NjYsLTIxLjY2NyAtMzQuMzMzMiwtMzAuNjY2IDAu",
	"NTY3NiwtMTUuMzI4IDAuMzMzMiwtMTUuMzM0IDAuMzMzMiwtMTUuMzM0Ig0KICAgICAgICAgc3R5",
	"bGU9ImZpbGw6I2Y3ZTRjZDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6",
	"bm9uZSINCiAgICAgICAgIGlkPSJwYXRoNDgiDQogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3It",
	"Y3VydmF0dXJlPSIwIiAvPjxwYXRoDQogICAgICAgICBkPSJtIDEzNy43MTcsMjI2LjQzNSBjIDAs",
	"MCAtOS42NjYsMC4zMzMgLTEwLC04LjMzNCAwLDAgLTAuMDAxLC0xLjMzMyAwLjY2NiwtMi42NjYg",
	"MCwwIDcuNjY4LDguNjY3IDEyLjMzNCw0Ig0KICAgICAgICAgc3R5bGU9ImZpbGw6I2Y3ZTRjZDtm",
	"aWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSINCiAgICAgICAgIGlk",
	"PSJwYXRoNTAiDQogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPjxw",
	"YXRoDQogICAgICAgICBkPSJtIDk1LjM4ODcsMjE0LjUzMiBjIDAsMCAtMS42NjQxLDEzLjMwMyAt",
	"MTMuMDA1OSw1LjU2OSAtNy4zMzMyLC01IC02LjY2NiwtMTIgLTUuMzMzMiwtMTMuMzMzIDEuMzMz",
	"MiwtMS4zMzQgMC45NzA3LC00LjAxOSAxLjk4NTYsLTIuMTc2IDEuMDE0NCwxLjg0MyAwLjY4MDQs",
	"Ny44NDMgNC4zNDc2LDkuNTA5IDMuNjY2OCwxLjY2NyA5LjY3NzcsMy41MjkgMTIuMDA1OSwwLjQz",
	"MSINCiAgICAgICAgIHN0eWxlPSJmaWxsOiNmN2U0Y2Q7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxl",
	"OmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDUyIg0KICAgICAgICAgaW5r",
	"c2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48cGF0aA0KICAgICAgICAgZD0ibSA2NC4w",
	"NDk2LDEyNC40MzUgLTMxLjMzMjgsLTE0IGMgMCwwIDEzLC01MS42NjcgNi4zMzI4LC02Ny42Njcg",
	"bCAtNC42NjY4LDEuNjY2IC0wLjMzMzIsMTkuNjY3MiAtOC42NjU2LDM3LjMzMjggLTMuNjY3Miwx",
	"MC4zMzQgMzIuNjY2LDIxLjk5OSA5LjY2NjgsLTkuMzMyIg0KICAgICAgICAgc3R5bGU9ImZpbGw6",
	"IzQ5NzI4YjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSINCiAg",
	"ICAgICAgIGlkPSJwYXRoNTQiDQogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJl",
	"PSIwIiAvPjxwYXRoDQogICAgICAgICBkPSJtIDY3LjI3MTUsOTUuODU3OCA0LjQ0NTMsLTUuNDIz",
	"OCAwLC0yMCAtNS4zMzQsMCBjIDAsMCAtMC42NjYsMTQgLTAuNjY2LDE1LjY2NzIgMCwxLjY2Njgg",
	"MC42NjYsNy42NjY4IDAuNjY2LDcuNjY2OCINCiAgICAgICAgIHN0eWxlPSJmaWxsOiM0OTcyOGI7",
	"ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBp",
	"ZD0icGF0aDU2Ig0KICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48",
	"cGF0aA0KICAgICAgICAgZD0ibSA2Ny4zODI4LDY3LjQzNCAtMTUsLTAuNjY2IDQuMzM0LC0zIDEw",
	"LjY2NiwtMS42NjY4Ig0KICAgICAgICAgc3R5bGU9ImZpbGw6IzQ5NzI4YjtmaWxsLW9wYWNpdHk6",
	"MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSINCiAgICAgICAgIGlkPSJwYXRoNTgiDQog",
	"ICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPjxwYXRoDQogICAgICAg",
	"ICBkPSJtIDExOC43MTcsNzAuNzY4IDEyLjMzMywwLjMzMzIgMywtMzAuNjY3MiAtMTIuNjY3LC0x",
	"LjY2NiAtMi42NjYsMzIiDQogICAgICAgICBzdHlsZT0iZmlsbDojMzM1MDYxO2ZpbGwtb3BhY2l0",
	"eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIg0KICAgICAgICAgaWQ9InBhdGg2MCIN",
	"CiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgNCiAgICAg",
	"ICAgIGQ9Im0gMTIyLjA1LDcwLjc2OCAxOC42NjcsMSBjIDAsMCA3LjY2NiwxOS4zMzMyIDcuNjY2",
	"LDIwLjMzMzIgMCwxIDYuNjY3LDI3Ljk5OTggNi42NjcsMjcuOTk5OCBsIC0xNSwxNS42NjYgLTMs",
	"Mi42NjcgLTgsLTggMCwtMzEgLTcsLTI4LjY2NiINCiAgICAgICAgIHN0eWxlPSJmaWxsOiMzMzUw",
	"NjE7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAg",
	"ICBpZD0icGF0aDYyIg0KICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIg",
	"Lz48cGF0aA0KICAgICAgICAgZD0ibSAxMzAuMzgzLDczLjEwMTIgLTExLjY2NiwtMi4zMzMyIDEu",
	"NjY2LC05LjMzNCBjIDQuMzMzLC0yIDExLjY2NywzLjMzNCAxMS42NjcsMy4zMzQiDQogICAgICAg",
	"ICBzdHlsZT0iZmlsbDojNDk3MjhiO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0",
	"cm9rZTpub25lIg0KICAgICAgICAgaWQ9InBhdGg2NCINCiAgICAgICAgIGlua3NjYXBlOmNvbm5l",
	"Y3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgNCiAgICAgICAgIGQ9Im0gMTMwLjcxNywxMzEuNDM0",
	"IDIzLjMzMywtMTcuMzMzIDAuNjY3LDggLTE3LjY2NywxNi4zMzMgLTYuMzMzLC03Ig0KICAgICAg",
	"ICAgc3R5bGU9ImZpbGw6IzQ5NzI4YjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtz",
	"dHJva2U6bm9uZSINCiAgICAgICAgIGlkPSJwYXRoNjYiDQogICAgICAgICBpbmtzY2FwZTpjb25u",
	"ZWN0b3ItY3VydmF0dXJlPSIwIiAvPjxwYXRoDQogICAgICAgICBkPSJNIDc4Ljk1MDgsNS4wOTgw",
	"NSA3Mi4wNDk2LDMzLjEwMiA2OC42MTcyLDUzLjc2NDggNjguMDQ5Niw2OS4xMDIgbCAzMS4yMzQ4",
	"LDEuNjYyOCAxOS40MzI2LDAuMDAzMiAtMS43NjcsLTM1LjAwMzIgMywtMjYuOTk5OTYgLTAuMzMz",
	"LC01IC0yNS4zMzI2LC0yIC0xNS4zMzM2LDMuMzMzMjEiDQogICAgICAgICBzdHlsZT0iZmlsbDoj",
	"ZmZmZmZmO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIg0KICAg",
	"ICAgICAgaWQ9InBhdGg2OCINCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9",
	"IjAiIC8+PHBhdGgNCiAgICAgICAgIGQ9Im0gMTE0LjM4Myw3MS4xMDEyIGMgMCwwIC0xLjY2Niwt",
	"MzQuNjY3MiAzLjMzNCwtNTkuMzMzMiAwLDAgLTEwLC02LjMzNDAyIC0yNC42Njc0LC04LjAwMDAz",
	"IGwgMjguMDAwNCwxIDMuMzMzLDIgLTQsNTQuNjY2MDMgLTEsMTEuNjY4Ig0KICAgICAgICAgc3R5",
	"bGU9ImZpbGw6I2RjZDlkODtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6",
	"bm9uZSINCiAgICAgICAgIGlkPSJwYXRoNzAiDQogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3It",
	"Y3VydmF0dXJlPSIwIiAvPjxwYXRoDQogICAgICAgICBkPSJtIDEzNC42MTgsNDMuMDk4IDEzLDMu",
	"NjY2OCAyNC42NjYsMS4zMzMyIDMuNjY3LDExLjMzMjkgLTYuNjY3LDE5LjY2NzEgLTcuNjY2LDEg",
	"LTEwLjY2NywtMy4zMzMyIC0xMC4yMzQsLTQuOTk2OCAtNS40MzMsMC45OTY4IC00LjIzNCwtMS42",
	"NjM2Ig0KICAgICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1",
	"bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSINCiAgICAgICAgIGlkPSJwYXRoNzIiDQogICAgICAgICBp",
	"bmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPjxwYXRoDQogICAgICAgICBkPSJtIDEz",
	"NC4zODMsNDkuNzY4IGMgMCwwIDguNjY2LDMuOTk5MiAxMCwzLjY2NiBsIC0zLjY2NiwxOC4zMzQg",
	"NC4zMzMsMS42NjYgYyAwLDAgMywtMTcuMzMyOCAzLC0xOS4zMzI4IDAsMCAxOC42NjYsLTEgMjAu",
	"MzMzLC0xIDAsMCA0LDcuNjY2OCAzLDE1LjY2NjggbCAzLjY2NywtMTAuNjY2OCAwLjMzMywtNiAt",
	"NS4zMzMsLTggLTYsLTEuMzMzMiAtMTAsMC4zMzMyIC0zLjMzMyw0LjMzMjggLTExLjY2NywtMS42",
	"NjYgLTMuNjY3LC0xLjMzNCINCiAgICAgICAgIHN0eWxlPSJmaWxsOiNkY2Q5ZDg7ZmlsbC1vcGFj",
	"aXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDc0",
	"Ig0KICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48cGF0aA0KICAg",
	"ICAgICAgZD0ibSAxMjEuMjg0LDczLjQzMDkgLTcuMzMzLDE4LjY2NzEgLTcuNjY3LDExIGMgMCww",
	"IDEuNjY2LDQuNjY3IDQsNC42NjcgMi4zMzQsMCA3LjY2NywwIDcuNjY3LDAgbCA3LjMzMywtMi42",
	"NjcgLTAuNjY2LC0xMi4zMzMyIC0zLjMzNCwtMTkuMzMzOSINCiAgICAgICAgIHN0eWxlPSJmaWxs",
	"OiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiDQog",
	"ICAgICAgICBpZD0icGF0aDc2Ig0KICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVy",
	"ZT0iMCIgLz48cGF0aA0KICAgICAgICAgZD0ibSAxMjIuNzE3LDc5Ljc2OCBjIDAsMCAtOS4zMzQs",
	"MTcuOTk5MiAtOS4zMzQsMjAuNjY2IDAsMCAxLjY2Niw0IDQsMyAyLjMzNCwtMSA3LjMzNCwtMy42",
	"NjYgNy4zMzQsLTMuNjY2IGwgMCw2LjMzMyAtMTEuMzM0LDIuMzM0IC03LjY2NiwtMSAxMywtMzAu",
	"NjY3IDIuNjY2LC0wLjMzNCINCiAgICAgICAgIHN0eWxlPSJmaWxsOiNkY2Q5ZDg7ZmlsbC1vcGFj",
	"aXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDc4",
	"Ig0KICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48cGF0aA0KICAg",
	"ICAgICAgZD0ibSA4MS45NTEyLDEyMy43NjQgLTkuMjM0NCwxLjAwNCAtOC42NjcyLDIuNjY3IDAs",
	"LTMgNC4yMzQ4LC00LjY3IDEzLjMzMzIsLTYiDQogICAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZm",
	"O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIg0KICAgICAgICAg",
	"aWQ9InBhdGg4MCINCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+",
	"PHBhdGgNCiAgICAgICAgIGQ9Im0gNjcuMDUwOCwxMjIuNzY1IGMgMCwwIDEwLjMzNCwtNC4zMzQg",
	"MTMuNjY3MiwtMy4zMzQgbCAwLjMzMTYsLTMuOTk2IC05LjMzMTYsMS45OTYgLTUuNjY3Miw0IDEs",
	"MS4zMzQiDQogICAgICAgICBzdHlsZT0iZmlsbDojZGNkOWQ4O2ZpbGwtb3BhY2l0eToxO2ZpbGwt",
	"cnVsZTpldmVub2RkO3N0cm9rZTpub25lIg0KICAgICAgICAgaWQ9InBhdGg4MiINCiAgICAgICAg",
	"IGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgNCiAgICAgICAgIGQ9Im0g",
	"MTM0LjU4MiwxMDYuNjMgYyAtNS42NTYsMC4xNjYgLTEwLjc2NiwwLjgzOCAtMTUuMjQsMi4xIDAu",
	"MzA0LDEuODM0IC0wLjI2NSwzLjYzNCAwLjE5Miw0Ljk1NSAxLjI0NywwLjg5OCAzLjMzNywwLjg4",
	"NCA1LjIyMiwxLjA5NSAtMS42MywwLjgwMSAtMy45MiwxLjExOCAtNS44MDEsMC42NTUgLTAuMDQ0",
	"LDEuMjczIC0wLjYxNSwyLjA2MiAtMC45NjEsMy4wNTggMy4xOCwxLjEzNSAxMC42ODcsOC41NzYg",
	"MTQuOTEsNi4xMTIgMi4wMTIsLTEuMTcyIDIuODY3LC03Ljg2NiAzLjAyMywtMTEuMTIxIDAuMTMs",
	"LTIuNyAtMC4yNDUsLTUuNDI0IC0xLjM0NSwtNi44NTQiDQogICAgICAgICBzdHlsZT0iZmlsbDoj",
	"ZDMzODMzO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIg0KICAg",
	"ICAgICAgaWQ9InBhdGg4NCINCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9",
	"IjAiIC8+PHBhdGgNCiAgICAgICAgIGQ9Im0gMTM0LjU4MiwxMDYuNjMgYyAtNS42NTYsMC4xNjYg",
	"LTEwLjc2NiwwLjgzOCAtMTUuMjQsMi4xIDAuMzA0LDEuODM0IC0wLjI2NSwzLjYzNCAwLjE5Miw0",
	"Ljk1NSAxLjI0NywwLjg5OCAzLjMzNywwLjg4NCA1LjIyMiwxLjA5NSAtMS42MywwLjgwMSAtMy45",
	"MiwxLjExOCAtNS44MDEsMC42NTUgLTAuMDQ0LDEuMjczIC0wLjYxNSwyLjA2MiAtMC45NjEsMy4w",
	"NTggMy4xOCwxLjEzNSAxMC42ODcsOC41NzYgMTQuOTEsNi4xMTIgMi4wMTIsLTEuMTcyIDIuODY3",
	"LC03Ljg2NiAzLjAyMywtMTEuMTIxIDAuMTMsLTIuNyAtMC4yNDUsLTUuNDI0IC0xLjM0NSwtNi44",
	"NTQgeiINCiAgICAgICAgIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNkMzM4MzM7c3Ryb2tlLXdp",
	"ZHRoOjI7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1p",
	"dGVybGltaXQ6NDtzdHJva2Utb3BhY2l0eToxO3N0cm9rZS1kYXNoYXJyYXk6bm9uZSINCiAgICAg",
	"ICAgIGlkPSJwYXRoODYiDQogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIw",
	"IiAvPjxwYXRoDQogICAgICAgICBkPSJtIDEwNy41MzUsMTE1Ljg3NiBjIC0wLjAxNSwtMC40Mjgg",
	"LTAuMDMzLC0wLjg1OSAtMC4wNSwtMS4yOTEgLTEuNzY2LC0xLjE2IC00LjYxNywtMS4xNDYgLTYu",
	"NTU1LC0yLjEyMSAyLjg1NywtMC4xMjUgNS4xMDYsLTAuODEzIDcuMDUyLC0xLjc4MyAtMC4wNDMs",
	"LTEuMDc4IC0wLjA4NCwtMi4xNTUgLTAuMTI2LC0zLjIzMyAtMy4yMzcsLTIuMjE2IC02LjE5NCwt",
	"NS41MTYgLTEwLjAwNTIsLTcuNTk0MSAtMS44MDIsLTAuOTgyOCAtOC4xMjYyLC0zLjUxMTcgLTEw",
	"LjA0MzQsLTMuMDY0OCAtMS4wODQ3LDAuMjUxOSAtMS4xODI0LDEuNTk4IC0xLjYxNiwyLjg2Njgg",
	"LTAuOTIzOCwyLjcxNzEgLTMuMDUwOCw3LjA0MjEgLTMuMjM2MywxMS4xMzIxIC0wLjIzNjMsNS4x",
	"NjYgLTAuNzU3OCwxMy44MjQgNC44MDk0LDEyLjc2IDQuNDkxNCwtMC44NTcgOS43MTUyLC0yLjky",
	"NiAxMy4xOTI1LC00LjgyNiAyLjEyNSwtMS4xNjIgMy4zNTQsLTIuNTk4IDYuNTc4LC0yLjg0NiIN",
	"CiAgICAgICAgIHN0eWxlPSJmaWxsOiNkMzM4MzM7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2",
	"ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDg4Ig0KICAgICAgICAgaW5rc2Nh",
	"cGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48cGF0aA0KICAgICAgICAgZD0ibSAxMDcuNTM1",
	"LDExNS44NzYgYyAtMC4wMTUsLTAuNDI4IC0wLjAzMywtMC44NTkgLTAuMDUsLTEuMjkxIC0xLjc2",
	"NiwtMS4xNiAtNC42MTcsLTEuMTQ2IC02LjU1NSwtMi4xMjEgMi44NTcsLTAuMTI1IDUuMTA2LC0w",
	"LjgxMyA3LjA1MiwtMS43ODMgLTAuMDQzLC0xLjA3OCAtMC4wODQsLTIuMTU1IC0wLjEyNiwtMy4y",
	"MzMgLTMuMjM3LC0yLjIxNiAtNi4xOTQsLTUuNTE2IC0xMC4wMDUyLC03LjU5NDEgLTEuODAyLC0w",
	"Ljk4MjggLTguMTI2MiwtMy41MTE3IC0xMC4wNDM0LC0zLjA2NDggLTEuMDg0NywwLjI1MTkgLTEu",
	"MTgyNCwxLjU5OCAtMS42MTYsMi44NjY4IC0wLjkyMzgsMi43MTcxIC0zLjA1MDgsNy4wNDIxIC0z",
	"LjIzNjMsMTEuMTMyMSAtMC4yMzYzLDUuMTY2IC0wLjc1NzgsMTMuODI0IDQuODA5NCwxMi43NiA0",
	"LjQ5MTQsLTAuODU3IDkuNzE1MiwtMi45MjYgMTMuMTkyNSwtNC44MjYgMi4xMjUsLTEuMTYyIDMu",
	"MzU0LC0yLjU5OCA2LjU3OCwtMi44NDYgeiINCiAgICAgICAgIHN0eWxlPSJmaWxsOm5vbmU7c3Ry",
	"b2tlOiNkMzM4MzM7c3Ryb2tlLXdpZHRoOjI7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGlu",
	"ZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2Utb3BhY2l0eToxO3N0cm9rZS1k",
	"YXNoYXJyYXk6bm9uZSINCiAgICAgICAgIGlkPSJwYXRoOTAiDQogICAgICAgICBpbmtzY2FwZTpj",
	"b25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPjxwYXRoDQogICAgICAgICBkPSJtIDExMC43NSwxMDku",
	"NzEyIGMgLTAuNDk0LDIuODE0IC0xLjA2NSwzLjYxNyAtMC44NDQsNi4wNzIgNy41MDUsNS4wMDQg",
	"OC45MTQsLTguNTk1IDAuODQ0LC02LjA3MiINCiAgICAgICAgIHN0eWxlPSJmaWxsOiNkMzM4MzM7",
	"ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBp",
	"ZD0icGF0aDkyIg0KICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48",
	"cGF0aA0KICAgICAgICAgZD0ibSAxMTAuNzUsMTA5LjcxMiBjIC0wLjQ5NCwyLjgxNCAtMS4wNjUs",
	"My42MTcgLTAuODQ0LDYuMDcyIDcuNTA1LDUuMDA0IDguOTE0LC04LjU5NSAwLjg0NCwtNi4wNzIg",
	"eiINCiAgICAgICAgIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNkMzM4MzM7c3Ryb2tlLXdpZHRo",
	"OjI7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVy",
	"bGltaXQ6NDtzdHJva2Utb3BhY2l0eToxO3N0cm9rZS1kYXNoYXJyYXk6bm9uZSINCiAgICAgICAg",
	"IGlkPSJwYXRoOTQiDQogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAv",
	"PjxwYXRoDQogICAgICAgICBkPSJtIDEyMS42MTcsMTA3LjQzMSBjIDAsMCAtMi4zMzQsMy4zMzQg",
	"LTAuNjY3LDQuMzM0IDEuNjY3LDEgMy4zMzQsLTAuMDAxIDQuMzM0LDEuNjY2IDEsMS42NjcgMCwy",
	"LjY2NyAwLjMzMyw0LjY2NyAwLjMzMywyIDIuMDAxLDIuMzM0IDMuNjY3LDIuNjY3IDEuNjY2LDAu",
	"MzMzIDYuMzM0LDEgNywtMC42NjcgbCAtMiw2IC00LDEuMzMzIC0xMi42NjcsLTcuMzMzIC0wLjY2",
	"NywtMy42NjcgMCwtNy4zMzMiDQogICAgICAgICBzdHlsZT0iZmlsbDojZWYzZDNhO2ZpbGwtb3Bh",
	"Y2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIg0KICAgICAgICAgaWQ9InBhdGg5",
	"NiINCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgNCiAg",
	"ICAgICAgIGQ9Im0gODYuNjE3Miw5Ni40MzA5IGMgLTAuNDAwNCw1LjIwMjEgLTAuODI0MiwxMC4z",
	"OTcxIC0xLjI5NTcsMTUuNTk0MSAtMC43MDU1LDcuNzYgMS44NjQsNi40MDYgOC41OTA2LDYuNDA2",
	"IDEuMDI3NCwwIDYuMzI1OSwtMS4yMjUgNi43MDQ5LC0yIDEuODE4LC0zLjcxMyAtMy4wNCwtMi44",
	"ODggMi4wOTQsLTUuNjg4IDQuMzM0LC0yLjM2MyAxMS45OSwxLjQzNSAxMC4yMzksNi42ODggLTAu",
	"OTgsMS4xNjggLTUuMTA2LDAuMzY0IC02LjU4NSwxLjEzMSAtMi42MDQsMS4zNSAtNS4yMDgsMi43",
	"IC03LjgxMjMsNC4wNSAtMy4zMTMyLDEuNzE5IC0xMC45NzA3LDQuMjI1IC0xNC41MDMxLDEuODIz",
	"IC04Ljk1MDQsLTYuMDg3IDAuNTY0OSwtMjEuMjk2IDMuNzU3OCwtMjcuNjQ1OSINCiAgICAgICAg",
	"IHN0eWxlPSJmaWxsOiNlZjNkM2E7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ry",
	"b2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDk4Ig0KICAgICAgICAgaW5rc2NhcGU6Y29ubmVj",
	"dG9yLWN1cnZhdHVyZT0iMCIgLz48cGF0aA0KICAgICAgICAgZD0ibSA5NS4zODg3LDIxNC41MzIg",
	"YyAtOS4wODUyLDIuMTE2IC0xMy41OTk2LC0zLjgwMiAtMTYuMzUzNSwtOS45NCAtMi40NTksMC41",
	"OTYgLTEuNDgwNSwzLjk0IC0wLjg1OTQsNS42NDQgMS42MjYyLDQuNDcyIDguMTc5NywxMC40MjUg",
	"MTMuNTM0NCw5LjYxOCAyLjMwNDMsLTAuMzQ3IDUuNDIyNiwtMi40NTQgMy42Nzg1LC01LjMyMiIN",
	"CiAgICAgICAgIHN0eWxlPSJmaWxsOiMyMzFmMjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2",
	"ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDEwMCINCiAgICAgICAgIGlua3Nj",
	"YXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgNCiAgICAgICAgIGQ9Im0gMTM5LjY1",
	"NSwyMDQuMTg2IGMgMC4xNDMsLTAuMDA2IDAuMjg4LC0wLjAxMSAwLjQzMSwtMC4wMTcgMi4wNTMs",
	"LTQuMjY1IDMuODMsLTguNzgzIDYuNDIsLTEyLjU0OCAtMS43MzUsLTQuMDQxIC0xMy4xMzgsLTcu",
	"NjE3IC0xMi45NjIsLTAuMzYxIDIuNDY2LDEuMDc4IDYuNzIzLDAuMjIgOC45MDksMS41OTcgLTEu",
	"MjY0LDMuNDY5IC0zLjA4OCw2LjQyMiAtMi43OTgsMTEuMzI5Ig0KICAgICAgICAgc3R5bGU9ImZp",
	"bGw6IzIzMWYyMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSIN",
	"CiAgICAgICAgIGlkPSJwYXRoMTAyIg0KICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZh",
	"dHVyZT0iMCIgLz48cGF0aA0KICAgICAgICAgZD0ibSAxMDAuMDQsMjA0LjA3NSBjIDEuOTQ4LC0z",
	"LjU3MSAyLjU4MiwtNy4zMjMgNS4zNTEsLTEwLjAyMiAxLjI0NywtMS4yMTUgMy42NzIsLTIuNjk2",
	"IDIuNDcsLTYuMDc1IC0wLjI4MSwtMC43OTcgLTIuMzM0LC0yLjU3NCAtMy41MTksLTIuOTIzIC00",
	"LjMyOSwtMS4yNzggLTE0LjQxNjIsLTAuMjY0IC0xMS4wMDAyLDUuMTMzIDMuNTgwMSwtMC4xNjcg",
	"OC4zOTIyLC0yLjMyNSAxMS4wNjgyLDAuMjc0IC0yLjA1NSwzLjI4NSAtNS43MTg2LDkuNzg0IC00",
	"LjM3LDEzLjYxMyINCiAgICAgICAgIHN0eWxlPSJmaWxsOiMyMzFmMjA7ZmlsbC1vcGFjaXR5OjE7",
	"ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDEwNCINCiAg",
	"ICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgNCiAgICAgICAg",
	"IGQ9Im0gMTM4LjAzLDE2Ny43ODEgYyAtNi41MTgsLTQuMTg3IC0xMy43ODYsLTguNzQgLTI0LjQ2",
	"NiwtNy42ODQgLTIuMjgyLDEuOTg0IC0zLjE1Miw2LjM5OSAtMC45MzUsOS4zMTUgMS4xNTQsLTEu",
	"OTg0IDAuNDI5LC01LjYzMyAzLjY0NSwtNi4xODIgNi4wNiwtMS4wMzcgMTMuMTEzLDMuNzA3IDE3",
	"LjQ3Miw1LjM2NSAyLjcwMyw0LjU1NyAtMC4yMzMsNi4yMzMgLTIuNjY4LDkuMTY2IC00Ljk4NSw2",
	"LjAwOSAtMTEuNjcyLDEzLjQ1NyAtMTEuNDI5LDIyLjQ1MyAyLjAxNSwxLjQ2MSAyLjE4OSwtMi4y",
	"MyAyLjQ3OCwtMi45MDIgMi42MDMsLTYuMDkyIDkuMTU0LC0xMy44ODMgMTMuOTM1LC0xOS4wOTcg",
	"MS4xNzQsLTEuMjg0IDMuMTA3LC0yLjUxNiAzLjMyMiwtMy4zNjUgMC42MiwtMi40NjkgLTEuNjEz",
	"LC01LjQyNyAtMS4zNTQsLTcuMDY5Ig0KICAgICAgICAgc3R5bGU9ImZpbGw6IzIzMWYyMDtmaWxs",
	"LW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSINCiAgICAgICAgIGlkPSJw",
	"YXRoMTA2Ig0KICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48cGF0",
	"aA0KICAgICAgICAgZD0ibSA1Mi4xMDE2LDE3Mi4xODkgYyAtMi4wNDMsMS4xNjYgLTIuNTI5Myw2",
	"LjMwMiAtNC45Mjc4LDYuNDQ4IC0zLjQyNzcsMC4yMDggLTIuODAyNywtNi42NjMgLTIuNzg5LC0x",
	"MC42ODEgLTIuMzU5NCwyLjE0MiAtMi43NzQzLDguNzM3IC0xLjA0MSwxMi4xMjQgLTEuOTc1NCww",
	"Ljk3IC0yLjg1NzUsLTEuMDcgLTMuOTUzMiwtMS43ODkgMS40MDgyLDEwLjIzIDE0Ljk2NDksNC43",
	"NDUgMTIuNzExLC02LjEwMiINCiAgICAgICAgIHN0eWxlPSJmaWxsOiMyMzFmMjA7ZmlsbC1vcGFj",
	"aXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDEw",
	"OCINCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgNCiAg",
	"ICAgICAgIGQ9Im0gMTQyLjE4LDE2My41MjEgYyAtMy4wMzQsLTUuNzc1IC03LjMyNiwtMTIuMTM1",
	"IC0xNi4yMjksLTEyLjMyIC0wLjE4MSwxLjg2NSAtMC4zMiw0LjcwMyAwLjAxLDUuODI2IDYuODA2",
	"LDAuNjU0IDExLjAwOCw0LjExOCAxNi4yMTksNi40OTQiDQogICAgICAgICBzdHlsZT0iZmlsbDoj",
	"MjMxZjIwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIg0KICAg",
	"ICAgICAgaWQ9InBhdGgxMTAiDQogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJl",
	"PSIwIiAvPjxwYXRoDQogICAgICAgICBkPSJtIDk5LjUyNjYsMTU5Ljc3NyBjIDUuNjc4NCwtMi45",
	"ODYgMTYuMTE0NCwtMy4zMDcgMjMuODMyNCwtMy4wODEgMC40MTQsLTEuNjkxIDAuNDA0LC0zLjc4",
	"IDAuNDIsLTUuODQyIC05LjkyMSwtMC40OTUgLTIxLjY1MSwxLjk2IC0yNC4yNTI0LDguOTIzIg0K",
	"ICAgICAgICAgc3R5bGU9ImZpbGw6IzIzMWYyMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZl",
	"bm9kZDtzdHJva2U6bm9uZSINCiAgICAgICAgIGlkPSJwYXRoMTEyIg0KICAgICAgICAgaW5rc2Nh",
	"cGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48cGF0aA0KICAgICAgICAgZD0ibSA5OC40NDcz",
	"LDE1NC4yMDkgYyAzLjkyNjcsLTkuODU5IDE3LjQyMjcsLTguNzI0IDI4LjgwMzcsLTguNDUyIC0w",
	"LjUwMSwtMS4yOCAtMS41ODcsLTIuNzkyIC0yLjkzNywtMy4zMzkgLTMuNjQ3LC0xLjQ4NCAtMTMu",
	"NzA2LC0yLjYxIC0xOC43NjksMC4wNzkgLTMuMjExLDEuNzA3IC01LjI3NCw1LjU2NCAtNy4wMzMz",
	"LDcuODI1IC0wLjg0OTYsMS4wOTIgLTUuMDgwMSwzLjg4MSAtMC4wNjQ0LDMuODg3Ig0KICAgICAg",
	"ICAgc3R5bGU9ImZpbGw6IzIzMWYyMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtz",
	"dHJva2U6bm9uZSINCiAgICAgICAgIGlkPSJwYXRoMTE0Ig0KICAgICAgICAgaW5rc2NhcGU6Y29u",
	"bmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48cGF0aA0KICAgICAgICAgZD0ibSAxMzcuNTU2LDk5Ljgy",
	"NjIgYyAtNC42MDgsLTcuODkyMiAtOS4wMTcsLTE1Ljk5ODEgLTE0LjQ4NCwtMjIuOTU5NCAyLjI5",
	"Miw2LjczOTEgMy4yNzMsMTguMDE4NCAzLjYxOSwyNi42MTcyIDQuNzk1LDIuMjQ0IDguOTAxLC0w",
	"LjUwNSAxMC44NjUsLTMuNjU3OCINCiAgICAgICAgIHN0eWxlPSJmaWxsOiM4MWIwYzQ7ZmlsbC1v",
	"cGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0",
	"aDExNiINCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgN",
	"CiAgICAgICAgIGQ9Im0gMTYyLjM1Miw3MS40NjA5IGMgLTUuMTU5LC0xLjAzMjggLTguNzg0LC02",
	"LjA0NjggLTEzLjgxNywtNS43MjUgMi43NjYsMy44OTkzIDcuNjEzLDUuNTQzIDEzLjgxNyw1Ljcy",
	"NSINCiAgICAgICAgIHN0eWxlPSJmaWxsOiMyMzFmMjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxl",
	"OmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDExOCINCiAgICAgICAgIGlu",
	"a3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+PHBhdGgNCiAgICAgICAgIGQ9Im0gMTY0",
	"LjYyOCw2My4zODcxIGMgLTQuMjA1LC0wLjQ0NDEgLTkuMTQ0LC0xLjEyNSAtMTMuNDA5LC0wLjc3",
	"NDIgMi4wMTksMy4wODQgOS43OTgsMi4wMTk5IDEzLjQwOSwwLjc3NDIiDQogICAgICAgICBzdHls",
	"ZT0iZmlsbDojMjMxZjIwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpu",
	"b25lIg0KICAgICAgICAgaWQ9InBhdGgxMjAiDQogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3It",
	"Y3VydmF0dXJlPSIwIiAvPjxwYXRoDQogICAgICAgICBkPSJtIDE2Ni4wODUsNTYuNDI2MiBjIC00",
	"LjcyNiwtMC4xMDI0IC0xMC42LC0wLjAwODIgLTE1LjA5MiwwLjM2ODcgMi42NTcsMi44NTM5IDEy",
	"LjAyNywxLjA1OSAxNS4wOTIsLTAuMzY4NyINCiAgICAgICAgIHN0eWxlPSJmaWxsOiMyMzFmMjA7",
	"ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBp",
	"ZD0icGF0aDEyMiINCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+",
	"PHBhdGgNCiAgICAgICAgIGQ9Im0gMTI4LjY2NCwzNy4zNzcgYyAwLjY3OCwtNS45MzUyIDMuMDMx",
	"LC0xMS45NDg5IDIuNzM2LC0xOC40NDg5IC0yLjYxMywtMC44ODEyIC00LjExNCwtMS42NTE5IC03",
	"LjYxNSwtMS42NDcyIC0wLjI0Nyw1LjUyNDIgLTAuOTg2LDEzLjk2OTEgLTAuNzY1LDE5LjIzNTEg",
	"MS43MjIsLTAuMTE0IDQuMjYxLDEuMjMwMSA1LjY0NCwwLjg2MSINCiAgICAgICAgIHN0eWxlPSJm",
	"aWxsOiNkY2Q5ZDg7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUi",
	"DQogICAgICAgICBpZD0icGF0aDEyNCINCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2",
	"YXR1cmU9IjAiIC8+PHBhdGgNCiAgICAgICAgIGQ9Im0gMTIxLjA0NSwxMjQuODQ5IGMgLTIuMzcz",
	"LC0xLjU0OSAtNC4zOTQsLTMuNDgzIC02LjY3MywtNS4xMzcgLTUuMDU0LC0wLjI1IC03LjgxMiww",
	"LjM1IC0xMS41MjUsMy4yNTIgMC4wNjEsMC4yMzMgMC40MzQsMC4xMjkgMC40NDgsMC40MTUgNS40",
	"MSwtMi40MTEgMTIuMjg3LDAuOTgyIDE3Ljc1LDEuNDciDQogICAgICAgICBzdHlsZT0iZmlsbDoj",
	"ZjBkNmI3O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTpub25lIg0KICAg",
	"ICAgICAgaWQ9InBhdGgxMjYiDQogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJl",
	"PSIwIiAvPjxwYXRoDQogICAgICAgICBkPSJtIDkyLjY0NDUsODcuOTcxMSBjIDEuNDg2NCw2LjQ0",
	"MSA3LjMxMDYsOS43NzY5IDEyLjU5OTUsMTMuMzIzOSA1LjQ1OSwtNi45MjgyIDguNzc5LC0xNS44",
	"MzggMTIuNDM1LC0yNC40MzYgLTguNjM4LDIuNjAzOSAtMTcuNDY0LDYuODI4OSAtMjUuMDM0NSwx",
	"MS4xMTIxIg0KICAgICAgICAgc3R5bGU9ImZpbGw6IzgxYjBjNDtmaWxsLW9wYWNpdHk6MTtmaWxs",
	"LXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSINCiAgICAgICAgIGlkPSJwYXRoMTI4Ig0KICAgICAg",
	"ICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz48cGF0aA0KICAgICAgICAgZD0i",
	"bSAxMjMuMDIsMzYuNTE2IGMgLTAuMjIxLC01LjI2NiAwLjUxOCwtMTMuNzEwOSAwLjc2NSwtMTku",
	"MjM1MSAzLjUwMSwtMC4wMDQ3IDUuMDAyLDAuNzY2IDcuNjE1LDEuNjQ3MiAwLjI5NSw2LjUgLTIu",
	"MDU4LDEyLjUxMzcgLTIuNzM2LDE4LjQ0ODkgLTEuMzgzLDAuMzY5MSAtMy45MjIsLTAuOTc1IC01",
	"LjY0NCwtMC44NjEgeiBNIDY4LjUwNTksNjYuNDY0OCBDIDcwLjgxNDUsNDUuMjQxOCA3NC4xNTgy",
	"LDI3LjQwMTIgODAuMjkxLDguNjA3ODEgOTMuOTAyMyw0LjQ3NSAxMTAuMzExLDQuMTE0ODQgMTIy",
	"LjM0Miw3Ljg0NDE0IDEyMC4xMzMsMTguNDUxMiAxMjEuMDk4LDMxLjM2NDggMTE5LjgwNyw0Mi42",
	"ODQgYyAtMC45NzMsOC41MDc4IC0wLjQ3NywxNy4wNjggLTEuODExLDI1Ljc0OCAtMTQuNTc4LDMu",
	"MDMyOCAtMzUuMTgzNSwwLjcwOSAtNDkuNDkwMSwtMS45NjcyIHogbSA1Mi45MzcxLDEuODM0IGMg",
	"LTAuMTIzLC05LjExNDggMC40MDgsLTE4LjEwNTggMS4xMDQsLTI3LjIzMiAzLjUsMC41MjU0IDUu",
	"ODc1LDAuODc2MiA5LjEyNywxLjU4OTEgLTEuMDU2LDguNzg1OSAtMC45MjYsMTguNjcyMiAtMy4w",
	"NzcsMjYuNDQ0MSAtMi40ODYsLTAuMDIzOCAtNC42NzUsMC4wMjg5IC03LjE1NCwtMC44MDEyIHog",
	"bSAxNy43NTUsMS40NjkyIGMgLTEuNjYxLDAuMzgwOCAtMy41OTUsMC4wMTQ4IC01LjE4MiwtMC4w",
	"MTYgMC43NDYsLTcuNDMwMSAyLjU1NiwtMTUuNjI5IDMuMTkzLC0yMy40MjgyIDIuNDk3LC0wLjA3",
	"NzcgMy44MzEsMS4xIDUuODg1LDEuNDk2MSAwLjExLDYuODQ2MSAtMC41OTgsMTYuMjc4MSAtMy44",
	"OTYsMjEuOTQ4MSB6IG0gMjYuODg0LC0yNC41NjI5IGMgNS4yMDUsMS4yNjQgOC40NzgsNy42Mzkg",
	"Ny4wMjIsMTQuMTg1OSAtMC45NzcsNC40IC0yLjcxNywxMi42ODUyIC00LjU3OSwxNS41IC0xLjM3",
	"NiwyLjA4MiAtNS4xMDcsNC44MDc4IC04LjA4NiwyLjkgLTQuODQ2LC0zLjEwMzEgLTEzLjM4Mywt",
	"NC4wMDM5IC0xNi45MTcsLTcuNzYwMSAxLjc3MiwtNS45IDIuMzIyLC0xNC4wMDM5IDMuMDUzLC0y",
	"MS40Nzk3IDYuMDU0LC0wLjM3NzQgMTMuNTAzLDEuNjY2IDE4LjUzOCwtMC41MDI0IC0zLjUxNSwt",
	"MS4xMzg2IC04LjA3NiwtMS4xNDc2IC0xMS4xMTMsLTIuODA3IDIuNDgyLC0xLjE5ODggOC4yOTMs",
	"LTAuOTU2NiAxMi4wODIsLTAuMDM2NyB6IE0gMTE3LjY3OSw3Ni44NTkgYyAtMy42NTYsOC41OTgg",
	"LTYuOTc2LDE3LjUwNzggLTEyLjQzNSwyNC40MzYgQyA5OS45NTUxLDk3Ljc0OCA5NC4xMzA5LDk0",
	"LjQxMjEgOTIuNjQ0NSw4Ny45NzExIDEwMC4yMTUsODMuNjg3OSAxMDkuMDQxLDc5LjQ2MjkgMTE3",
	"LjY3OSw3Ni44NTkgeiBtIDkuMDEyLDI2LjYyNSBjIC0wLjM0NiwtOC41OTg4IC0xLjMyNywtMTku",
	"ODc4MSAtMy42MTksLTI2LjYxNzIgNS40NjcsNi45NjEzIDkuODc2LDE1LjA2NzIgMTQuNDg0LDIy",
	"Ljk1OTQgLTEuOTY0LDMuMTUyOCAtNi4wNyw1LjkwMTggLTEwLjg2NSwzLjY1NzggeiBtIC0xMC4y",
	"MTYsMy42MyBjIC0yLjA3MSwwLjIyMyAtMy44MjksLTIuMzgxIC02LjUyMiwtMS4yNTUgLTAuNjE3",
	"LC0wLjY4MiAtMS4xNzgsLTEuNDIxIC0xLjgwNywtMi4wODcgNS45NDgsLTcuMTY4MSA4LjY1MSwt",
	"MTcuMzM4IDEzLjI0NSwtMjUuNzYxOCAyLjQ2NSw4LjA5MTggMi4xODEsMTYuOTU3IDIuNzI0LDI1",
	"Ljc4ODggLTMuMzg3LC0wLjIxNSAtNS4yNjYsMy4wNjMgLTcuNjQsMy4zMTUgeiBtIC02LjU2OSw4",
	"LjY3IGMgLTAuMjIxLC0yLjQ1NSAwLjM1LC0zLjI1OCAwLjg0NCwtNi4wNzIgOC4wNywtMi41MjMg",
	"Ni42NjEsMTEuMDc2IC0wLjg0NCw2LjA3MiB6IG0gLTguOTQ5LDIuOTM4IGMgLTMuNDc3MywxLjkg",
	"LTguNzAxMSwzLjk2OSAtMTMuMTkyNSw0LjgyNiAtNS41NjcyLDEuMDY1IC01LjA0NTcsLTcuNTk0",
	"IC00LjgwOTQsLTEyLjc2IDAuMTg1NSwtNC4wOSAyLjMxMjUsLTguNDE1IDMuMjM2MywtMTEuMTMy",
	"MSAwLjQzMzYsLTEuMjY4OCAwLjUzMTMsLTIuNjE0OSAxLjYxNiwtMi44NjY4IDEuOTE3MiwtMC40",
	"NDY5IDguMjQxNCwyLjA4MiAxMC4wNDM0LDMuMDY0OCAzLjgxMTIsMi4wNzgxIDYuNzY4Miw1LjM3",
	"ODEgMTAuMDA1Miw3LjU5NDEgMC4wNDIsMS4wNzggMC4wODMsMi4xNTUgMC4xMjYsMy4yMzMgLTEu",
	"OTQ2LDAuOTcgLTQuMTk1LDEuNjU4IC03LjA1MiwxLjc4MyAxLjkzOCwwLjk3NSA0Ljc4OSwwLjk2",
	"MSA2LjU1NSwyLjEyMSAwLjAxNywwLjQzMiAwLjAzNSwwLjg2MyAwLjA1LDEuMjkxIC0zLjIyNCww",
	"LjI0OCAtNC40NTMsMS42ODQgLTYuNTc4LDIuODQ2IHogbSAtMzMuMjEzNiw2LjAzMyBjIC0yLjg4",
	"NiwtMi45MyA4LjA5NDUsLTYuOTI0IDExLjU5MDYsLTcuMTM5IC0wLjAxOTUsMS44NTQgMS4wNTY2",
	"LDMuNjAyIDAuODM5OCw0LjkzMiAtNC4xNTIzLDAuNzI5IC05LjYwOTMsMC4yNDggLTEyLjQzMDQs",
	"Mi4yMDcgeiBtIDM1LjU1MTYsLTEuMzc2IGMgLTAuMDE0LC0wLjI4NiAtMC4zODcsLTAuMTgyIC0w",
	"LjQ0OCwtMC40MTUgMy43MTMsLTIuOTAyIDYuNDcxLC0zLjUwMiAxMS41MjUsLTMuMjUyIDIuMjc5",
	"LDEuNjU0IDQuMywzLjU4OCA2LjY3Myw1LjEzNyAtNS40NjMsLTAuNDg4IC0xMi4zNCwtMy44ODEg",
	"LTE3Ljc1LC0xLjQ3IHogbSAzMi42MzIsLTkuODk1IGMgLTAuMTU2LDMuMjU1IC0xLjAxMSw5Ljk0",
	"OSAtMy4wMjMsMTEuMTIxIC00LjIyMywyLjQ2NSAtMTEuNzMsLTQuOTc3IC0xNC45MSwtNi4xMTIg",
	"MC4zNDYsLTAuOTk2IDAuOTE3LC0xLjc4NSAwLjk2MSwtMy4wNTggMS44ODEsMC40NjMgNC4xNzEs",
	"MC4xNDYgNS44MDEsLTAuNjU1IC0xLjg4NSwtMC4yMTEgLTMuOTc1LC0wLjE5NyAtNS4yMjIsLTEu",
	"MDk1IC0wLjQ1NywtMS4zMjEgMC4xMTIsLTMuMTIxIC0wLjE5MiwtNC45NTUgNC40NzQsLTEuMjYy",
	"IDkuNTg0LC0xLjkzNCAxNS4yNCwtMi4xIDEuMSwxLjQzIDEuNDc1LDQuMTU0IDEuMzQ1LDYuODU0",
	"IHogbSAtNzMuMDQyMiw4LjQzNyBjIC0wLjkwNjMsMC42NDYgLTcuMDM3MSw4LjYyMyAtNy44Nzcs",
	"OC4yOTIgQyA0My45MTQxLDEyNS44MzggMzMuNTQxLDExOC4yNzMgMjQuMjcxNSwxMTEuMTE4IDMz",
	"LjEwOTQsOTIuMTUzOSAzNi42NzcsNjguOTE5OSAzNy4zMDc0LDQ2LjUyNjIgNDcuNDMxNiw0MS43",
	"OTEgNTYuMzI0MiwzNC45NjQ4IDcwLjA2MjUsMzQuMjUyIDY4LjQ3MjcsNDUuNSA2Ny4wMjE1LDU1",
	"LjUzNTIgNjYuMTE5MSw2Ni4xMjUgYyAtMy40NTE5LDEuNDU1MSAtOC40MDQzLC0wLjA2NiAtMTEu",
	"NjM0NywwLjQ1MTIgLTAuMDI3NCwzLjg5MjkgNC45MzM2LDEuNzA0NyA1LjM0NjgsNC4zMjI2IDAu",
	"MzExNCwxLjk4MDEgLTIuNzI5NiwyLjEzMDEgLTEuNzM5NCw1LjI0ODEgMi41MjU0LC0wLjkxOCAz",
	"Ljg1MTYsLTIuOTQ1NyA2LjU0NDksLTMuNzA3MSAyLjQ2MSw1LjM4NCAtMC4wMzQ0LDE0LjkxMDIg",
	"MC4zMjAzLDE5LjQxMDIgMC4wNjcyLDAuODQ0OSAwLjQyMTksNC42ODA5IDIuMzE0NSw0LjAwNzgg",
	"MS42NzUsLTAuNTk1NyAtMC4wOTU3LC0xMC4yMDE5IDAuMDg3OSwtMTQuNDYwOSAwLjE2NzIsLTMu",
	"OTIzOSAtMC40NzM5LC03LjcyMDcgMS4xMTUyLC0xMC4xODQgMTMuMjc1NCwxLjgwNyAyNi43NjU2",
	"LDIuOTc1IDQxLjEyOTQsMy4zNjkxIC0zLjE2LDEuMzU1OSAtNi45MTQsMi42MzkxIC0xMS4wMjk4",
	"LDQuOTU5IC0yLjIzMTIsMS4yNTc4IC05LjI2NDQsMy44NzUgLTkuOTA4Miw1Ljk5NDIgLTEuMDI3",
	"MywzLjM3NjkgMi42OTUzLDUuMTc1NyAzLjMzMiw4LjA3MDcgLTYuNzAxMSwtMy42NTQ3IC04LjAw",
	"ODUsMy41MDMxIC05LjU5MzcsOC41NzQxIC0xLjQzNjMsNC41OTMgLTIuMjUzOSw4LjAyNCAtMi42",
	"MDYzLDEwLjY3MyAtNS43NzI2LDIuNzUyIC0xMS45NDQ1LDUuNTM5IC0xNi45MTMyLDkuMDY4IHog",
	"bSA2Ny4xNzkyLDcuMzI3IGMgOS4yNDMsNC40ODIgMTAuOTA5LC0xNi43NTEgNy4yODYsLTIzLjU5",
	"MSAwLjU2LC0yLjA0IDIuNDg2LC0yLjgyMSAzLjI3MiwtNC42NTUgLTUuMTU4LC05LjIzOTkgLTEw",
	"Ljg4NywtMTcuODY0OSAtMTYuMTUsLTI2Ljk5NjEgMy45MTUsMi40MzcxIDkuNTA3LDAuNDM1OSAx",
	"NC4xMTQsMi4yNjAxIDEuNjg0LDAuNjY2IDIuOTAzLDQuNTIxMSA0LjE3OCw3LjYwNTEgMy41MDcs",
	"OC40ODQ4IDcuMTg5LDE5LjE4MTkgOC44MjcsMjcuMjc4OSAwLjM3LDEuODQ1IDEuMzc4LDUuODY1",
	"IDEuMTUyLDcuNTA3IC0wLjQwMywyLjk0IC00LjM5Miw1LjEyIC02LjQyMSw2LjkzOCAtMy43Mzgs",
	"My4zNTggLTYuMDkyLDYuMzEzIC05Ljk5MSw5LjQ1MyAtMS41ODEsLTIuMzM0IC00Ljk3NCwtMy45",
	"MDIgLTYuMjY3LC01LjggeiBtIC04OC4zMTc5LDgxLjk2OCBjIC00LjQwNDMsLTQuODQ2IC0zLjQ4",
	"MjQsLTEzLjkyNiAtMi45NDkyLC0yMC4zODYgNy45NjA5LDUuMDA4IDE4LjUyNzMsLTAuMzk2IDE4",
	"LjQyNzcsLTguOTE0IDMuODAwOCwwLjEwMSAxLjQxOTksNC43NDcgMC43MzI0LDcuNzQgLTIuMjQ2",
	"OCw5Ljc3NiAzLjc4NTIsMjAuMzk3IDAuMjczNSwyOS4zMzcgLTYuODE4NCwtMC41MTcgLTEyLjQy",
	"LC0zLjMwMiAtMTYuNDg0NCwtNy43NzcgeiBtIDMxLjUxMzcsMjguMTI2IGMgLTkuOTcwNywtMi44",
	"MjYgLTIyLjc0OTMsLTEwLjA3MSAtMjYuODQ2NSwtMTkuMDI4IDMuMTcyNiwwLjQ2MSA1LjM3NSwy",
	"LjA2MSA4LjUwNDcsMi4yNTkgMS4xODI4LDAuMDc3IDIuNzMyNCwtMC40OTYgNC4wOTE4LC0wLjE1",
	"OCAyLjcwOSwwLjY3MiA0Ljk5NTMsNi43NDYgNy4wMzksOS4wMDYgMS45OTIyLDIuMjA3IDQuMzg2",
	"NywzLjE1IDYuMDI1NCw1LjE2MiAxLjA1MjgsMC41MDggMi42MDk0LDAuNDczIDIuNjY5MiwyLjA1",
	"NCAtMC40NTYzLDAuNDg4IC0wLjkzNjgsMC44NiAtMS40ODM2LDAuNzA1IHogbSA1MS45MDMyLC0y",
	"LjY1OCBjIC0xMC4zNDksNS44MzkgLTI3Ljg2NjEsMTAuMjMxIC0zOC44NzQ3LDQuNzQzIC04Ljg4",
	"MjgsLTQuNDI5IC0yMC44ODk5LC0xMS43NTcgLTI0Ljk4MzYsLTIxLjA0MyAzLjgyNDIsLTguOTYx",
	"IC0xLjEzMjgsLTE3LjE3MiAtMS40NDkyLC0yNi4yNyAtMC4xNjgsLTQuODQxIDIuMjc5MywtOS4w",
	"NjcgMi40NjY4LC0xNC4zMzcgLTEuMzA4NiwtMi4xNTkgLTUuMzA2NywtMi40MjUgLTguMDc0Mywt",
	"Mi4yNzcgLTAuOTMxNiw0LjY2MiAtMi41NjI1LDkuOTAyIC03LjM2MzIsMTAuNDI4IC02Ljc5Myww",
	"Ljc0MyAtMTEuNzU5OCwtNC44NzkgLTEyLjA2ODQsLTEwLjc1NCAtMC4zNjUyLC02LjkwOSA1LjMw",
	"NjYsLTE4LjM2IDEzLjM0NTcsLTE3LjU2NSAzLjEwNTUsMC4zMDcgMy44Njg0LDMuNDIgNy4yNTIs",
	"My4zODggMS44MzM5LC0zLjY1OSAtMi44Mjg5LC00LjgwOCAtMy4zMDg2LC03LjQyNSAtMC4xMjUs",
	"LTAuNjc2IDAuMzg2NywtMy4zMTggMC42ODQzLC00LjU1NyAxLjQ2MDIsLTYuMDMzIDQuNzE1Mywt",
	"MTMuODQxIDcuOTE5MiwtMTguNDM0IDQuMDY2NCwtNS44MjYgMTIuMDU1NSwtNi43MDQgMjAuNjUw",
	"NCwtNy4yNzUgMS41MzUxLDMuMzA3IDcuMTkwMiwzLjAzNSAxMC44NzUsMi4xNyAtNC40MTYsMS43",
	"NDkgLTguNTIxNSw1Ljk4OSAtMTEuOTIzOSw5Ljc0MiAtMy45MDgyLDQuMzA2IC03Ljg2NzEsOC45",
	"MjUgLTguMDY3MSwxNC41NTMgNy4zODU1LC0xMC4yNDYgMTMuNDg3MSwtMTkuMTk0IDI2LjkxNjgs",
	"LTIzLjcwMSAxMC4xNjE4LC0zLjQwOCAyMi4wMjk4LDEuNTYyIDI5LjgzNzgsNy4wNDUgMy4yNCwy",
	"LjI3OSA1LjE3NCw1Ljg5NSA3LjQ3Nyw5LjIwNSA4LjYxNywxMi4zOTUgMTIuNjM4LDMwLjA4NyAx",
	"MS43NTQsNDcuMjM1IC0wLjM2NCw3LjA3MiAtMC4zNDgsMTQuMTIgLTIuNzIxLDE4Ljg3OCAtMi40",
	"OCw0Ljk3NSAtMTAuODY4LDkuNDI2IC0xNS43NzgsNC45MjYgLTAuOTEsNC44MzggNC4wODMsNy44",
	"MyA5Ljk0OCw2LjA4OSAtNC4xODIsNS4zOTcgLTguNTcxLDExLjg4MiAtMTQuNTE1LDE1LjIzNiB6",
	"IE0gMTQ0LjQ0NCw3Ny4xMTY4IGMgOC4wODcsNC4wMjAzIDIzLjE5NywxMC44MjExIDI4LjI2Nywt",
	"MC4wMTQ4IDEuODcxLC0zLjk5NDIgNC4wNjYsLTEwLjc0NjEgNS4wMzUsLTE0Ljg2OTIgMS4zNjks",
	"LTUuODE2OCAtMS40ODQsLTE4LjA0MyAtNy40NjMsLTE5Ljk5NDkgLTUuMjgxLC0xLjcyMzggLTEx",
	"LjQ0MywtMS42MTg4IC0xNy44MDQsLTAuMzQxIC0wLjc0OSwwLjYyMyAtMS41ODMsMS43MDkgLTIu",
	"MTY2LDIuODQxIC00LjU0MiwwLjE3NjIgLTguNzk1LC0wLjI0MzggLTEyLjM4MywtMi4xMTA5IDAu",
	"MzQsLTMuMzU5IC0xLjkzMiwtMy44OTgxIC00LjA2MiwtNC41ODk5IC0xLjU3OSwtNi4yNjA5IDMu",
	"MTU5LC0xNC40MzcxIDIuMDI1LC0yMC4xNDYxIC0wLjgwOSwtNC4wNjcyIC01LjgxMywtNC42OTYx",
	"IC05LjQ5MSwtNS40NTcgLTAuMTIsLTIuMjYwMiAwLjE2MSwtNC4xNDY4OSAwLjQxMiwtNi4wNTkg",
	"LTAuODQxLC0zLjA5ODgzIC00LjYxMywtNC44NjI4OSAtOC4xODcsLTUuMjk0OTIgLTExLjc1OSwt",
	"MS40MTQwNjQgLTI5LjYxMzMsLTIuMDQ5MjIxIC00MC45MjM5LDIuMDE3OTcgLTMuMTU2Miw3Ljc0",
	"MTc1IC01LjY0MjYsMTcuMTU3ODUgLTguMjcxNSwyNS45OTgwNSAtMTEuMDMxMiwtMS4xNzgxIC0x",
	"OS45NTMxLDQuNzU5OCAtMjguMzY0LDguNjUgLTIuOTEyMSwxLjM1IC02Ljk0MDYsMi4wOTM3IC04",
	"LjAyODUsNC40MTE3IC0xLjA1NDcsMi4yNDQyIC0wLjYyMzEsNi41NDUzIC0wLjg4NDgsMTAuNjA4",
	"MiAtMC42NjYsMTAuMzc3IC0xLjIzNjMsMjAuMzg2IC0zLjk3NjYsMzEuMDExIC0xLjIzMDQsNC43",
	"Njc5IC0zLjM3NSw4Ljk3NSAtNC44NzExLDEzLjU2OTEgLTEuMzgyOCw0LjI1NzkgLTMuNzk4OCw5",
	"LjUxOTkgLTQuNDI4OSwxMy43NjU5IC0wLjkzNDMsNi4yOTMgNC45OTE0LDYuNjQzIDguNzgwNSw5",
	"LjM3IDUuODU3NCw0LjIxNyAxMC40NTUxLDYuNTQ5IDE2Ljc5ODgsMTAuMzU1IDEuODc4OSwxLjEy",
	"NyA3LjU0NSwzLjk4IDguMTg5NSw1LjI5NCAxLjI4MTIsMi42MDUgLTIuMTk5Miw2LjI3OCAtMy4x",
	"Mjk3LDguMzIgLTEuNDcxOSwzLjIyOSAtMi4yMzk1LDUuOTcyIC0yLjQ1MDQsOS4xNTggLTUuMzIx",
	"NSwwLjg0MSAtOS4zNTU1LDQuMDA4IC0xMS43OTIyLDcuNTc5IC00LjAzMDgsNS45MSAtNi44MjYy",
	"LDE2Ljg0NCAtMy4zMzg3LDI1LjE2MSAwLjI3MzUsMC42NTUgMS42Mzc1LDEuOTQzIDEuODM4Nywy",
	"Ljk0OSAwLjM5NjksMS45ODEgLTAuNzQ2OSw0LjYxNSAtMC44MTgsNi43MjIgLTAuMzY2NCwxMC44",
	"MSAxLjgyOSwyMC4xMjQgOS4xMDYzLDIzLjM4NCAyLjk1NDMsMTEuNzY5IDEzLjUyODEsMTUuNjgy",
	"IDIzLjQ5MDIsMjEuNTMxIDMuNzIzOSwyLjE4NiA3LjgyODksMy41ODMgMTIuMDY4NCw1LjE0MyAx",
	"NS4yMDgyLDUuNTk3IDM4LjU0MTksNC41NDMgNTEuMTYzOSwtNS4wMDMgNS4zNTIsLTQuMDQ4IDEz",
	"LjkwNywtMTIuNTk1IDE2Ljk2NywtMTguNzgzIDguMDgyLC0xNi4zMzcgNy41MDgsLTQzLjY0IDEu",
	"ODU1LC02My41MTMgLTAuNzYsLTIuNjY4IC0xLjg2MiwtNi41OSAtMy40MDEsLTkuNzk1IC0xLjA3",
	"MywtMi4yMzggLTQuNDA4LC02LjcxNiAtNC4wMDMsLTguNjkyIDAuNDE3LC0yLjA0MyA3LjYwNCwt",
	"Ny41IDkuMTQ1LC04Ljk4NiAyLjc3NSwtMi42NzcgOC4wNDcsLTYuMjMgOC40NzQsLTkuNjA4IDAu",
	"NDU5LC0zLjU5NSAtMS41ODQsLTguNTEzIC0yLjYxOSwtMTEuOTgyIC0zLjQ2LC0xMS41NzY5IC02",
	"LjgzNiwtMjIuMjc4MSAtMTAuNzU5LC0zMi41OTkyIg0KICAgICAgICAgc3R5bGU9ImZpbGw6IzIz",
	"MWYyMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6bm9uZSINCiAgICAg",
	"ICAgIGlkPSJwYXRoMTMwIg0KICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0i",
	"MCIgLz48cGF0aA0KICAgICAgICAgZD0ibSA5MC40OTEsMTU3LjI1NSBjIDAuNDM4NywwLjU4NCAy",
	"Ljg1MDgsMS40NzEgNi4yMjU4LC0wLjE1NCAwLDAgLTQsLTAuNjY3IC0zLjY2NzIsLTcuMzM2IGwg",
	"LTEuNjY2OCwwLjMzNCBjIDAsMCAtMS43MjI2LDYuMDQ3IC0wLjg5MTgsNy4xNTYiDQogICAgICAg",
	"ICBzdHlsZT0iZmlsbDojZjdlNGNkO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpldmVub2RkO3N0",
	"cm9rZTpub25lIg0KICAgICAgICAgaWQ9InBhdGgxMzIiDQogICAgICAgICBpbmtzY2FwZTpjb25u",
	"ZWN0b3ItY3VydmF0dXJlPSIwIiAvPjxwYXRoDQogICAgICAgICBkPSJtIDExOS43MTcsOTkuOTM0",
	"IGMgMCwtMS4wMTIxIC0wLjgyMSwtMS44MzI4IC0xLjgzNCwtMS44MzI4IC0xLjAxMiwwIC0xLjgz",
	"MywwLjgyMDcgLTEuODMzLDEuODMyOCAwLDEuMDEyIDAuODIxLDEuODM0IDEuODMzLDEuODM0IDEu",
	"MDEzLDAgMS44MzQsLTAuODIyIDEuODM0LC0xLjgzNCINCiAgICAgICAgIHN0eWxlPSJmaWxsOiMx",
	"ZDE5MTk7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAg",
	"ICAgICBpZD0icGF0aDEzNCINCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9",
	"IjAiIC8+PHBhdGgNCiAgICAgICAgIGQ9Im0gMTIxLjU1LDkxLjQzNCBjIDAsLTEuMDEyMSAtMC44",
	"MjEsLTEuODMyOCAtMS44MzQsLTEuODMyOCAtMS4wMTIsMCAtMS44MzMsMC44MjA3IC0xLjgzMywx",
	"LjgzMjggMCwxLjAxMjEgMC44MjEsMS44MzQgMS44MzMsMS44MzQgMS4wMTMsMCAxLjgzNCwtMC44",
	"MjE5IDEuODM0LC0xLjgzNCINCiAgICAgICAgIHN0eWxlPSJmaWxsOiMxZDE5MTk7ZmlsbC1vcGFj",
	"aXR5OjE7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmUiDQogICAgICAgICBpZD0icGF0aDEz",
	"NiINCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+PC9nPjwvZz48",
	"L3N2Zz4="
].join("");
//#endregion
//#region src/client/components/FooterButton.tsx
/**
* dsh-jenkins —— 侧边栏底部入口（sidebar.footer.action）：
* 常驻的「Jenkins 配置」按钮（位于 dsh 配置按钮上方的 footer.action 区），
* 点击打开统一弹框（发布 / 配置 / 历史 三个 tab）。不再按工作区配置门控 ——
* 服务器配置入口本就应随时可达。
*/
function FooterButton({ onOpen, reportSession, wide = false, useSessions }) {
	const currentSessionId = useSessions ? useSessions((s) => s && s.current) : null;
	if (reportSession && currentSessionId) reportSession(currentSessionId);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "dshj-footer-group" + (wide ? "" : " dshj-footer-rail-group"),
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "dshj-footer-btn" + (wide ? "" : " dshj-footer-btn-rail"),
			title: t("configBtn"),
			"aria-label": t("configBtn"),
			onClick: onOpen,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				src: JENKINS_LOGO,
				alt: "",
				className: "dshj-footer-logo"
			}), wide ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "dshj-footer-label",
				children: t("configBtn")
			}) : null]
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
//#region src/client/components/ServerEditorModal.tsx
/**
* dsh-jenkins —— 「编辑 Jenkins 服务器」弹框：新增 / 编辑服务器共用同一表单，
* 在独立弹框中完成填写、测试连接与保存（点击蒙版不关闭，避免误触丢失输入）。
*/
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
function ServerEditorModal({ run, sessionId, server, onSaved, onClose }) {
	const isNew = !server;
	const [draft, setDraft] = (0, react.useState)(() => server ? {
		isNew: false,
		id: server.id,
		name: server.name,
		baseUrl: server.baseUrl,
		username: server.username,
		token: "",
		masked: server.tokenMasked || "",
		insecure: !!server.insecure
	} : { ...EMPTY_DRAFT });
	const [busy, setBusy] = (0, react.useState)(false);
	const [formError, setFormError] = (0, react.useState)("");
	const [testResult, setTestResult] = (0, react.useState)(null);
	const [testedOk, setTestedOk] = (0, react.useState)(false);
	const setField = (k) => (e) => {
		setTestedOk(false);
		setDraft((prev) => ({
			...prev,
			[k]: e.target.value
		}));
	};
	const setInsecure = (e) => {
		setTestedOk(false);
		setDraft((prev) => ({
			...prev,
			insecure: e.target.checked
		}));
	};
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
		}).then((r) => {
			const ok = !!(r && r.ok);
			setTestedOk(ok);
			setTestResult(ok ? {
				ok: true,
				text: t("connected") + (r.version ? "（Jenkins " + r.version + "）" : "")
			} : {
				ok: false,
				text: tErr(r, t("testFailed"))
			});
		}).catch((e) => {
			setTestedOk(false);
			setTestResult({
				ok: false,
				text: e instanceof Error ? e.message : String(e)
			});
		}).finally(() => setBusy(false));
	};
	const doSave = () => {
		if (!draft.username.trim()) {
			setFormError(tErr({ code: "username-required" }, t("saveFailed")));
			return;
		}
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
				if (onSaved) onSaved(draft.id);
				onClose();
			} else setFormError(tErr(r, t("saveFailed")));
		}).catch((e) => setFormError(e instanceof Error ? e.message : String(e))).finally(() => setBusy(false));
	};
	const tokenBase = draft.baseUrl.trim().replace(/\/+$/, "");
	const canCreateToken = /^https?:\/\//i.test(tokenBase);
	const tokenUrl = canCreateToken ? tokenBase + "/user/" + encodeURIComponent((draft.username || "").trim() || "admin") + "/security/" : "";
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "dshj-backdrop dshj-json-backdrop",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-modal dshj-server-modal",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-modal-title",
						children: isNew ? t("addTitle") : t("editTitle")
					}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-close",
						"aria-label": t("close"),
						title: t("close"),
						onClick: onClose,
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-body",
					children: [
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
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("usernameLabel"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshj-req",
								children: "*"
							})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "dshj-input",
								value: draft.username,
								onChange: setField("username"),
								placeholder: t("usernamePlaceholder")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshj-field",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "dshj-label-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
									t("tokenLabel"),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshj-req",
										children: "*"
									}),
									draft.isNew ? "" : t("keepToken")
								] }), canCreateToken ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
									className: "dshj-link-btn",
									href: tokenUrl,
									target: "_blank",
									rel: "noopener noreferrer",
									title: tokenUrl,
									children: [t("createToken"), " ↗"]
								}) : null]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
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
						testResult ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-result " + (testResult.ok ? "dshj-ok" : "dshj-err"),
							children: testResult.text
						}) : null
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-footer",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshj-btn" + (testedOk ? " dshj-btn-success" : ""),
							disabled: busy,
							onClick: doTest,
							children: busy ? t("testing") : t("testBtn")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshj-btn",
							disabled: busy,
							onClick: onClose,
							children: t("cancelBtn")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshj-btn dshj-btn-primary",
							disabled: busy,
							onClick: doSave,
							children: t("saveBtn")
						})
					]
				})
			]
		})
	});
}
//#endregion
//#region src/client/components/InlineSelect.tsx
/**
* dsh-jenkins —— antd Select 风格的内联下拉选择器：
* 点击触发器展开面板，面板顶部为搜索框（输入即过滤），选项列表内部滚动，
* 支持点击外部 / Esc 关闭与上下键 + Enter 键盘选择。
*
* 面板通过 portal 渲染到 document.body 并以 position:fixed 定位，
* 避免被父弹框（overflow:hidden）裁剪；滚动 / 窗口尺寸变化时跟随触发器更新位置，
* 下方空间不足时自动向上展开。
*/
function InlineSelect({ value, placeholder, options, disabled, onChange, searchPlaceholder, emptyText, panelMaxHeight = 260 }) {
	const [open, setOpen] = (0, react.useState)(false);
	const [search, setSearch] = (0, react.useState)("");
	const [active, setActive] = (0, react.useState)(0);
	const [pos, setPos] = (0, react.useState)(null);
	const rootRef = (0, react.useRef)(null);
	const triggerRef = (0, react.useRef)(null);
	const panelRef = (0, react.useRef)(null);
	const searchRef = (0, react.useRef)(null);
	const filtered = (0, react.useMemo)(() => {
		const q = search.trim().toLowerCase();
		return q ? options.filter((o) => o.label.toLowerCase().indexOf(q) !== -1) : options;
	}, [options, search]);
	const selected = options.find((o) => o.id === value) || null;
	const updatePos = () => {
		const el = triggerRef.current;
		if (!el) return;
		const r = el.getBoundingClientRect();
		const gap = 4;
		const spaceBelow = window.innerHeight - r.bottom - gap;
		const spaceAbove = r.top - gap;
		const height = Math.min(panelMaxHeight, Math.max(spaceBelow, spaceAbove, 120));
		setPos({
			top: spaceBelow < height && spaceAbove >= spaceBelow ? Math.max(gap, r.top - height - gap) : r.bottom + gap,
			left: r.left,
			width: r.width,
			height
		});
	};
	(0, react.useEffect)(() => {
		if (!open) return;
		const onDoc = (e) => {
			const target = e.target;
			if (rootRef.current && rootRef.current.contains(target)) return;
			if (panelRef.current && panelRef.current.contains(target)) return;
			setOpen(false);
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, [open]);
	(0, react.useEffect)(() => {
		if (!open) return;
		updatePos();
		setSearch("");
		setActive(0);
		const raf = requestAnimationFrame(() => {
			if (searchRef.current) searchRef.current.focus();
		});
		return () => cancelAnimationFrame(raf);
	}, [open]);
	(0, react.useEffect)(() => {
		if (!open) return;
		const onScroll = () => updatePos();
		const onResize = () => updatePos();
		window.addEventListener("scroll", onScroll, true);
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("scroll", onScroll, true);
			window.removeEventListener("resize", onResize);
		};
	}, [open, panelMaxHeight]);
	(0, react.useEffect)(() => {
		setActive(0);
	}, [search]);
	const onKeyDown = (e) => {
		if (e.key === "Escape") {
			e.stopPropagation();
			setOpen(false);
			return;
		}
		if (!open) {
			if (e.key === "ArrowDown" || e.key === "Enter") {
				e.preventDefault();
				setOpen(true);
			}
			return;
		}
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActive((a) => filtered.length ? Math.min(a + 1, filtered.length - 1) : 0);
			return;
		}
		if (e.key === "ArrowUp") {
			e.preventDefault();
			setActive((a) => Math.max(a - 1, 0));
			return;
		}
		if (e.key === "Enter") {
			e.preventDefault();
			const opt = filtered[active];
			if (opt) {
				onChange(opt.id);
				setOpen(false);
			}
			return;
		}
	};
	const panel = open && pos ? (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		ref: panelRef,
		className: "dshj-combo-panel",
		style: {
			top: pos.top,
			left: pos.left,
			width: pos.width,
			height: pos.height
		},
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-combo-search",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
				ref: searchRef,
				className: "dshj-input",
				value: search,
				placeholder: searchPlaceholder || "",
				onChange: (e) => setSearch(e.target.value),
				onKeyDown
			})
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-combo-list",
			children: filtered.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-combo-empty",
				children: emptyText || t("pickerNoMatch")
			}) : filtered.map((o, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "dshj-combo-item" + (i === active ? " dshj-combo-item-active" : "") + (o.id === value ? " dshj-combo-item-selected" : ""),
				onMouseEnter: () => setActive(i),
				onClick: () => {
					onChange(o.id);
					setOpen(false);
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-combo-item-label",
					children: o.label
				}), o.id === value ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-combo-check",
					children: "✓"
				}) : null]
			}, o.id))
		})]
	}), document.body) : null;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "dshj-combo",
		ref: rootRef,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			ref: triggerRef,
			type: "button",
			className: "dshj-picker" + (selected ? "" : " dshj-picker-empty"),
			disabled,
			onClick: () => setOpen((v) => !v),
			onKeyDown,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "dshj-picker-value",
				children: selected ? selected.label : placeholder || ""
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "dshj-picker-caret",
				children: open ? "▴" : "▾"
			})]
		}), panel]
	});
}
//#endregion
//#region src/client/components/PublishTab.tsx
/**
* dsh-jenkins —— 统一弹框「发布」tab：项目 → 服务器 / Job 选择 → 参数表单回显 →
* 触发构建 → 轮询状态（排队 → 构建中 → 结果）。
*
* 不做配置门控：始终显示表单。顶部「项目」下拉列出 DSH 工作区，用户自选目标项目；
* 若所选项目存在 dsh-jenkins 配置（dsh-jenkins.json/js/ts），自动启用配置增强
* （服务器下拉取配置交集、参数默认值、提交走 workspaceTrigger）；无配置时直接
* 走 trigger 通道（用户手动选服务器 / Job / 参数）。
*/
function PublishTab({ initialCwd, sessionId, run, poller, storage, workspaceItems, onCountChange, onFooter }) {
	const paths = [...new Set((Array.isArray(workspaceItems) ? workspaceItems : []).map((w) => w && typeof w.path === "string" ? w.path : "").filter((p) => p !== ""))];
	const [project, setProject] = (0, react.useState)(() => {
		if (initialCwd && paths.indexOf(initialCwd) !== -1) return initialCwd;
		return paths.length ? paths[0] : "";
	});
	const [config, setConfig] = (0, react.useState)(null);
	(0, react.useEffect)(() => {
		let alive = true;
		setConfig(null);
		if (!project) return;
		run(sessionId, {
			op: "workspaceConfig",
			cwd: project
		}).then((r) => {
			if (!alive) return;
			const cfg = r && r.config;
			if (r && r.ok && r.found && cfg && Array.isArray(cfg.entries) && cfg.entries.length > 0) setConfig(cfg);
		}).catch(() => {});
		return () => {
			alive = false;
		};
	}, [
		project,
		sessionId,
		run
	]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "dshj-server-field",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
			className: "dshj-server-label",
			children: t("projectField")
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineSelect, {
			value: project,
			placeholder: paths.length === 0 ? t("noWorkspacesHint") : t("projectPlaceholder"),
			searchPlaceholder: t("pickerSearchPlaceholder"),
			options: paths.map((p) => ({
				id: p,
				label: p
			})),
			disabled: paths.length === 0,
			onChange: (id) => setProject(id)
		})]
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LauncherContent, {
		cwd: project,
		sessionId,
		config,
		run,
		poller,
		storage,
		onCountChange,
		onFooter
	})] });
}
function LauncherContent({ cwd, sessionId, config, run, poller, storage, onCountChange, onFooter }) {
	const entries = config && Array.isArray(config.entries) ? config.entries : [];
	const configServerRefs = entries.map((e) => e.server).filter(Boolean);
	const [cached, setCached] = (0, react.useState)(null);
	(0, react.useEffect)(() => {
		let alive = true;
		storage.readCache(sessionId, cwd).then((c) => {
			if (alive) setCached(c);
		});
		return () => {
			alive = false;
		};
	}, [
		storage,
		sessionId,
		cwd
	]);
	const [formValues, setFormValues] = (0, react.useState)({});
	const [submitting, setSubmitting] = (0, react.useState)(false);
	const [actionError, setActionError] = (0, react.useState)("");
	const [runState, setRunState] = (0, react.useState)(null);
	const [servers, setServers] = (0, react.useState)([]);
	const [serverPool, setServerPool] = (0, react.useState)([]);
	const [serverMismatch, setServerMismatch] = (0, react.useState)([]);
	const [selectedServerId, setSelectedServerId] = (0, react.useState)("");
	const [addServerOpen, setAddServerOpen] = (0, react.useState)(false);
	const [serverReloadKey, setServerReloadKey] = (0, react.useState)(0);
	const [detail, setDetail] = (0, react.useState)(null);
	const [detailLoading, setDetailLoading] = (0, react.useState)(false);
	const [detailError, setDetailError] = (0, react.useState)("");
	const [jobs, setJobs] = (0, react.useState)([]);
	const [jobsLoading, setJobsLoading] = (0, react.useState)(false);
	const [jobsError, setJobsError] = (0, react.useState)("");
	const [selectedJobPath, setSelectedJobPath] = (0, react.useState)("");
	const [jobSearch, setJobSearch] = (0, react.useState)("");
	const [paramsOpen, setParamsOpen] = (0, react.useState)(false);
	const selectedServer = servers.find((s) => s.id === selectedServerId) || null;
	const IS_DASH_LABEL = /^[-—–]{3,}$/;
	(0, react.useEffect)(() => {
		let alive = true;
		run(sessionId, { op: "list" }).then((r) => {
			if (!alive) return;
			const list = r && r.ok ? r.servers || [] : [];
			setServers(list);
			if (onCountChange) onCountChange(list.length);
			const matched = configServerRefs.length ? list.filter((s) => configServerRefs.some((ref) => matchServer(s, ref))) : [];
			const unmatched = configServerRefs.filter((ref) => !list.some((s) => matchServer(s, ref)));
			const pool = matched.length ? matched : list;
			setServerPool(pool);
			setServerMismatch(configServerRefs.length > 0 && matched.length === 0 ? unmatched : []);
			const preferred = cached && pool.find((s) => s.id === cached.serverId) || (pool.length ? pool[0] : null);
			setSelectedServerId(preferred ? preferred.id : "");
		}).catch(() => {
			if (alive) setServers([]);
		});
		return () => {
			alive = false;
		};
	}, [
		cached,
		config,
		serverReloadKey
	]);
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
	}, [
		selectedServerId,
		cached,
		config
	]);
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
		if (cached && cached.jobPath === selectedJobPath && cached.parameters) {
			for (const k of Object.keys(init)) if (Object.prototype.hasOwnProperty.call(cached.parameters, k)) {
				const v = cached.parameters[k];
				init[k] = typeof v === "boolean" ? v : v === null || v === void 0 ? "" : String(v);
			}
		}
		setFormValues(init);
		setRunState(null);
		setActionError("");
	}, [
		selectedJobPath,
		cwd,
		cached,
		config,
		detail ? detail.params : null
	]);
	const runRef = (0, react.useRef)(runState);
	runRef.current = runState;
	(0, react.useEffect)(() => {
		return poller.subscribe(() => {
			const cur = runRef.current;
			if (!cur) return;
			const live = poller.getLive(cur.historyId);
			if (!live) return;
			setRunState((prev) => {
				if (!prev || prev.historyId !== live.entryId) return prev;
				const base = {
					...prev,
					phase: live.phase === "queued" ? "queued" : live.phase === "running" ? "running" : live.phase === "done" ? "done" : live.phase === "cancelled" ? "error" : "error",
					buildNumber: live.buildNumber ?? prev.buildNumber,
					result: live.result,
					duration: live.duration,
					url: live.url
				};
				let message;
				if (live.status === "timeout") message = t("pollTimeout");
				else if (live.phase === "queued") message = t("queuedMsg", { n: prev.queueId });
				else if (live.phase === "cancelled") message = t("cancelled");
				else if (live.phase === "running" && live.status === "started") message = t("buildStarted", { n: live.buildNumber });
				else if (live.phase === "running") message = t("buildingRun", { d: fmtDur(Date.now() - (live.since || Date.now())) });
				else if (live.phase === "done") message = t("buildEnded");
				else message = t("buildPollFailed");
				return {
					...base,
					message
				};
			});
		});
	}, [poller]);
	const onSubmit = async () => {
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
		const segments = selectedJobPath.split("/").filter(Boolean);
		try {
			const res = config ? await run(sessionId, {
				op: "workspaceTrigger",
				cwd,
				serverId: selectedServerId,
				job: selectedJobPath,
				parameters: submitValues
			}) : await run(sessionId, {
				op: "trigger",
				serverId: selectedServerId,
				segments,
				parameters: submitValues
			});
			if (res && res.ok) {
				await storage.writeCache(sessionId, cwd, {
					serverId: selectedServerId,
					jobPath: selectedJobPath,
					parameters: submitValues
				});
				const resServerId = res.serverId || selectedServerId;
				const resSegments = Array.isArray(res.segments) && res.segments.length ? res.segments : segments;
				const historyId = await storage.pushHistory(sessionId, cwd, {
					id: "h" + Date.now() + "-" + Math.floor(Math.random() * 1e6),
					time: Date.now(),
					job: selectedJobPath,
					server: selectedServer ? selectedServer.name : "",
					serverId: resServerId,
					segments: resSegments,
					params: submitValues,
					result: null,
					queueId: res.queueId ?? null,
					buildNumber: res.nextBuildNumber ?? null,
					since: Date.now(),
					sessionId
				});
				if (res.queueId) setRunState({
					phase: "queued",
					queueId: res.queueId,
					serverId: resServerId,
					segments: resSegments,
					buildNumber: null,
					historyId,
					message: t("queuedMsg", { n: res.queueId }),
					since: Date.now()
				});
				else setRunState({
					phase: "running",
					queueId: null,
					serverId: resServerId,
					segments: resSegments,
					buildNumber: res.nextBuildNumber || null,
					historyId,
					message: t("triggeredMsg"),
					since: Date.now()
				});
				poller.refresh();
			} else setActionError(tErr(res, t("triggerFailed")));
		} catch (e) {
			setActionError(e instanceof Error ? e.message : String(e));
		} finally {
			setSubmitting(false);
		}
	};
	const onSubmitRef = (0, react.useRef)(onSubmit);
	onSubmitRef.current = onSubmit;
	const stableSubmit = (0, react.useCallback)(() => {
		onSubmitRef.current();
	}, []);
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
	const footerNode = (0, react.useMemo)(() => {
		if (runState) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: "dshj-btn",
			onClick: () => setRunState(null),
			children: t("backParams")
		}), runState.phase === "done" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: "dshj-btn dshj-btn-primary",
			onClick: stableSubmit,
			children: t("rebuild")
		}) : null] });
		if (!selectedJobPath) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: "dshj-link-btn",
			disabled: submitting,
			onClick: () => setParamsOpen(true),
			children: t("viewParams")
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: "dshj-btn dshj-btn-primary",
			disabled: submitting,
			onClick: stableSubmit,
			children: submitting ? t("submitting") : t("submit")
		})] });
	}, [
		runState,
		selectedJobPath,
		submitting,
		stableSubmit
	]);
	(0, react.useEffect)(() => {
		onFooter?.(footerNode);
		return () => onFooter?.(null);
	}, [footerNode, onFooter]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-server-field",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
				className: "dshj-server-label",
				children: t("serverField")
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-server-ctrl",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineSelect, {
					value: selectedServerId,
					placeholder: t("noServersHint"),
					searchPlaceholder: t("pickerSearchPlaceholder"),
					options: serverPool.map((s) => ({
						id: s.id,
						label: s.name + (configServerRefs.some((ref) => matchServer(s, ref)) ? t("configMark") : "")
					})),
					disabled: !!runState || submitting || serverPool.length === 0,
					onChange: (id) => setSelectedServerId(id)
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dshj-btn dshj-btn-small",
					title: t("goAdd"),
					disabled: !!runState || submitting,
					onClick: () => setAddServerOpen(true),
					children: t("goAdd")
				})]
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
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
				className: "dshj-server-label",
				children: t("jobField")
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-server-ctrl",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineSelect, {
					value: selectedJobPath,
					placeholder: !selectedServer ? t("jobPlaceholder") : jobsLoading ? t("jobsLoading") : jobsError ? t("jobsFailed") : jobs.length === 0 ? t("jobsEmpty") : t("jobPlaceholder"),
					searchPlaceholder: t("jobPlaceholder"),
					emptyText: jobsError ? t("jobsFailed") : t("jobsEmpty"),
					options: jobs.filter((j) => !j.folder).map((j) => ({
						id: j.path,
						label: j.path
					})),
					disabled: !!runState || submitting || jobsLoading || !selectedServer,
					onChange: (id) => {
						setSelectedJobPath(id);
						setJobSearch(id);
					}
				}), selectedServer && !jobsLoading && !jobsError ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-job-count",
					children: t("jobCount", { n: jobs.length })
				}) : null]
			})]
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "dshj-divider" }),
		runState ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
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
			] }) : null
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
					else if (p && p.type === "choice") control = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineSelect, {
						value: String(v),
						searchPlaceholder: t("pickerSearchPlaceholder"),
						options: (p.choices || []).map((c) => ({
							id: String(c),
							label: String(c)
						})),
						onChange: (id) => set(id)
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
			}) : null
		] }),
		paramsOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
		}) : null,
		addServerOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ServerEditorModal, {
			run,
			sessionId,
			server: null,
			onSaved: () => setServerReloadKey((k) => k + 1),
			onClose: () => setAddServerOpen(false)
		}) : null
	] });
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
* dsh-jenkins —— 配置模板内容区（json / js / ts Tab），供「项目配置」弹框展示。
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
//#region src/client/components/TemplateModal.tsx
/**
* dsh-jenkins —— 「项目配置」弹框：以弹框形式查看 dsh-Jenkins 配置模板（json / js / ts Tab）。
* 遮罩盖在主弹框之上（z-index 1100），点击遮罩不关闭弹框，只能通过 ✕ 关闭。
*/
function TemplateModal({ onClose }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "dshj-backdrop dshj-json-backdrop",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-modal dshj-template-modal",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-modal-header",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-modal-title",
					children: t("templateTitle")
				}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dshj-close",
					"aria-label": t("close"),
					title: t("close"),
					onClick: onClose,
					children: "✕"
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-modal-body",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TemplateSection, {})
			})]
		})
	});
}
//#endregion
//#region src/client/components/SettingsPage.tsx
/**
* dsh-jenkins —— 设置 → Jenkins 配置页：服务器管理（settings.section）。
* 新增 / 编辑服务器在独立弹框（ServerEditorModal）中操作，本页只负责列表与增删入口。
*/
function SettingsPage({ run, sessionId, onCountChange }) {
	const [servers, setServers] = (0, react.useState)([]);
	const [loading, setLoading] = (0, react.useState)(true);
	const [editor, setEditor] = (0, react.useState)({
		open: false,
		server: null
	});
	const [testResults, setTestResults] = (0, react.useState)({});
	const [confirmDeleteId, setConfirmDeleteId] = (0, react.useState)(null);
	const [templateOpen, setTemplateOpen] = (0, react.useState)(false);
	const load = () => {
		setLoading(true);
		run(sessionId, { op: "list" }).then((r) => {
			if (r && r.ok) {
				const list = r.servers || [];
				setServers(list);
				if (onCountChange) onCountChange(list.length);
			}
		}).catch(() => {}).finally(() => setLoading(false));
	};
	(0, react.useEffect)(() => {
		load();
	}, []);
	const openAdd = () => {
		setEditor({
			open: true,
			server: null
		});
	};
	const openEdit = (s) => {
		setEditor({
			open: true,
			server: s
		});
	};
	const closeEditor = () => setEditor({
		open: false,
		server: null
	});
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
		const applyVerified = (ok) => {
			setServers((prev) => prev.map((x) => x.id === s.id ? {
				...x,
				verified: ok
			} : x));
		};
		run(sessionId, {
			op: "test",
			server: { id: s.id }
		}).then((r) => {
			const ok = !!(r && r.ok);
			applyVerified(ok);
			setTestResults((prev) => ({
				...prev,
				[s.id]: ok ? {
					ok: true,
					text: t("connected") + (r.version ? "（Jenkins " + r.version + "）" : "")
				} : {
					ok: false,
					text: t("connectionFailed") + tErr(r, t("testFailed"))
				}
			}));
		}).catch((e) => {
			applyVerified(false);
			setTestResults((prev) => ({
				...prev,
				[s.id]: {
					ok: false,
					text: t("connectionFailed") + (e instanceof Error ? e.message : String(e))
				}
			}));
		});
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "dshj-settings",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-head",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-title",
					children: t("settingsTitle")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-head-ops",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn dshj-btn-small",
						title: t("addServer"),
						onClick: openAdd,
						children: t("addServer")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn dshj-btn-small",
						title: t("projectConfigBtn"),
						onClick: () => setTemplateOpen(true),
						children: t("projectConfigBtn")
					})]
				})]
			}),
			templateOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TemplateModal, { onClose: () => setTemplateOpen(false) }) : null,
			editor.open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ServerEditorModal, {
				run,
				sessionId,
				server: editor.server,
				onSaved: () => load(),
				onClose: closeEditor
			}) : null,
			loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-empty",
				children: t("loading")
			}) : servers.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-empty",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: t("serverEmpty") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dshj-btn dshj-btn-small",
					onClick: openAdd,
					style: { marginTop: 10 },
					children: t("addServer")
				})]
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-list",
				children: servers.map((s) => {
					const tr = testResults[s.id];
					const statusText = tr ? tr.text : s.verified ? t("connected") : "";
					const statusOk = tr ? tr.ok : s.verified;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-card",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshj-card-main",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshj-card-name-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshj-card-name",
									children: s.name
								}), statusText ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshj-card-test " + (statusOk ? "dshj-ok" : "dshj-err"),
									children: statusText
								}) : null]
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
									onClick: () => openEdit(s),
									children: t("editBtn")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshj-btn dshj-btn-small dshj-btn-danger" + (confirmDeleteId === s.id ? " dshj-btn-solid" : ""),
									onClick: () => doDelete(s.id),
									children: confirmDeleteId === s.id ? t("confirmDelete") : t("deleteBtn")
								})
							]
						})]
					}, s.id);
				})
			})
		]
	});
}
//#endregion
//#region src/client/ansi.ts
/**
* dsh-jenkins —— Jenkins 日志 ANSI 控制序列 → 带样式的 HTML。
* 参考 chrome-plugin-hook-request 的 ansiToHtml 方案：
* 仅处理 SGR 序列（\x1b[...m，颜色 / 加粗），其余 CSI 控制序列（清屏/光标移动等）剔除，
* 避免日志中残留乱码字符。
*/
/** SGR（Select Graphic Rendition）序列：\x1b[...m */
const ANSI_SGR_RE = /\x1b\[([0-9;]*)m/g;
/** 非 SGR 的 CSI 控制序列（如 \x1b[K 清行、\x1b[?25l 隐藏光标等），渲染时剔除 */
const ANSI_OTHER_RE = /\x1b\[[0-9;?]*[A-Za-z]/g;
/** 亮色主题下调色板（与 Jenkins 终端默认一致，30-37 / 90-97 前景色）。 */
const FG_COLORS = {
	30: "#abb2bf",
	31: "#e06c75",
	32: "#98c379",
	33: "#e5c07b",
	34: "#61afef",
	35: "#c678dd",
	36: "#56b6c2",
	37: "#d7dae0",
	90: "#5c6370",
	91: "#ff7b86",
	92: "#b5e890",
	93: "#ffd68a",
	94: "#79c0ff",
	95: "#d2a8ff",
	96: "#7ce8ff",
	97: "#ffffff"
};
function escapeHtml(text) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function applySgrCodes(codes, state) {
	for (const code of codes) if (code === 0) {
		state.bold = false;
		state.color = "";
	} else if (code === 1) state.bold = true;
	else if (code === 22) state.bold = false;
	else if (code === 39) state.color = "";
	else if (FG_COLORS[code]) state.color = FG_COLORS[code];
}
/**
* 将 ANSI 文本转为带样式的 HTML 片段（不含外层容器）。
* 先处理 \r 覆盖行（进度条/动态刷新日志），再按 SGR 序列切分渲染；
* 无序列时结果等价于转义后的纯文本，可安全用于 dangerouslySetInnerHTML。
*/
function ansiToHtml(text) {
	const normalized = text.replace(/[^\n]*\r/g, "");
	const state = {
		bold: false,
		color: ""
	};
	const parts = [];
	let lastIndex = 0;
	ANSI_SGR_RE.lastIndex = 0;
	const pushStyled = (chunk) => {
		const clean = chunk.replace(ANSI_OTHER_RE, "");
		if (!clean) return;
		const escaped = escapeHtml(clean);
		const styles = [];
		if (state.bold) styles.push("font-weight:700");
		if (state.color) styles.push("color:" + state.color);
		parts.push(styles.length ? `<span style="${styles.join(";")}">${escaped}</span>` : escaped);
	};
	let match;
	while ((match = ANSI_SGR_RE.exec(normalized)) !== null) {
		pushStyled(normalized.slice(lastIndex, match.index));
		lastIndex = match.index + match[0].length;
		const codes = match[1].split(";").filter(Boolean).map((c) => Number(c));
		applySgrCodes(codes.length === 0 ? [0] : codes, state);
	}
	pushStyled(normalized.slice(lastIndex));
	return parts.join("");
}
//#endregion
//#region src/client/components/BuildLogModal.tsx
/**
* dsh-jenkins —— 构建完整日志弹框：从历史条目点击打开，拉取 Jenkins consoleText 展示。
*/
const MAX_LOG_KB = 500;
function BuildLogModal({ entry, run, sessionId, onClose }) {
	const [loading, setLoading] = (0, react.useState)(true);
	const [log, setLog] = (0, react.useState)("");
	const [error, setError] = (0, react.useState)("");
	const [truncated, setTruncated] = (0, react.useState)(false);
	const [copied, setCopied] = (0, react.useState)(false);
	(0, react.useEffect)(() => {
		let alive = true;
		const segments = Array.isArray(entry.segments) && entry.segments.length ? entry.segments : (entry.job || "").split("/").filter(Boolean);
		run(sessionId, {
			op: "buildLog",
			serverId: entry.serverId,
			segments,
			buildNumber: entry.buildNumber
		}).then((res) => {
			if (!alive) return;
			if (res && res.ok) {
				setLog(String(res.log || ""));
				setTruncated(!!res.truncated);
				setError("");
			} else setError(tErr(res, t("logFailed")));
			setLoading(false);
		}).catch((e) => {
			if (!alive) return;
			setError(e instanceof Error ? e.message : String(e));
			setLoading(false);
		});
		return () => {
			alive = false;
		};
	}, [entry.id]);
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(log);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "dshj-backdrop dshj-json-backdrop",
		onClick: onClose,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-modal dshj-log-modal",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-modal-title",
						children: t("logTitle")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-modal-sub",
						children: [
							entry.job,
							entry.buildNumber ? " #" + entry.buildNumber : "",
							entry.server ? " · " + entry.server : ""
						]
					})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-close",
						"aria-label": t("close"),
						title: t("close"),
						onClick: onClose,
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-body dshj-log-body",
					children: [loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-empty",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dshj-spinner" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: t("logLoading") })]
					}) : error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-empty",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-err",
							children: error
						})
					}) : log ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
						className: "dshj-code dshj-log-code",
						dangerouslySetInnerHTML: { __html: ansiToHtml(log) }
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
						className: "dshj-code dshj-log-code",
						children: t("logEmpty")
					}), truncated && !loading && !error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-log-truncated",
						children: t("logTruncated", { kb: MAX_LOG_KB })
					}) : null]
				}),
				!loading && !error ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-footer",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn dshj-btn-small",
						onClick: () => void copy(),
						children: copied ? t("copied") : t("copy")
					}), entry.url ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
						className: "dshj-btn dshj-btn-small dshj-link",
						href: entry.url,
						target: "_blank",
						rel: "noopener noreferrer",
						children: [t("openBuildPage"), " ↗"]
					}) : null]
				}) : null
			]
		})
	});
}
//#endregion
//#region src/client/components/HistoryTab.tsx
/**
* dsh-jenkins —— 统一弹框「历史」tab：聚合所有工作区最近 50 次发布，可按工作区筛选
* （默认全部）。进行中条目由全局轮询器实时回填结果；点击已完成条目可查看完整构建日志。
* 内容来自原「发布历史」弹框，去掉弹框外框，由 JenkinsConfigModal 提供容器。
*/
function HistoryTab({ cwd, sessionId, run, poller, storage, onCountChange, onFooter }) {
	const [filter, setFilter] = (0, react.useState)("all");
	const [list, setList] = (0, react.useState)([]);
	const [logTarget, setLogTarget] = (0, react.useState)(null);
	const reload = (0, react.useCallback)(() => {
		storage.readAllHistory(sessionId).then((h) => {
			setList(h);
			if (onCountChange) onCountChange((h || []).length);
		}).catch(() => void 0);
	}, [
		storage,
		sessionId,
		onCountChange
	]);
	(0, react.useEffect)(() => poller.subscribe(reload), [poller, reload]);
	(0, react.useEffect)(() => {
		reload();
		poller.refresh();
	}, [reload, poller]);
	const wsPaths = [...new Set(list.map((e) => e.cwd).filter((p) => !!p))].sort();
	const wsOptions = [{
		id: "all",
		label: t("historyAll")
	}].concat(wsPaths.map((p) => ({
		id: p,
		label: p
	})));
	const filtered = filter === "all" ? list : list.filter((e) => e.cwd === filter);
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
	const canOpenLog = (e) => !!e.buildNumber && !!e.serverId;
	const footerNode = (0, react.useMemo)(() => {
		if (filtered.length === 0) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: "dshj-btn dshj-btn-small dshj-btn-danger",
			onClick: () => {
				storage.clearHistory(sessionId, filter === "all" ? null : filter).then(reload);
			},
			children: t("historyClear")
		});
	}, [
		filtered.length,
		filter,
		storage,
		sessionId,
		reload
	]);
	(0, react.useEffect)(() => {
		onFooter?.(footerNode);
		return () => onFooter?.(null);
	}, [footerNode, onFooter]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-server-field dshj-history-ws-field",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
				className: "dshj-server-label",
				children: t("historyWsField")
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineSelect, {
				value: filter,
				placeholder: t("historyWsPlaceholder"),
				searchPlaceholder: t("historyWsPlaceholder"),
				options: wsOptions.map((o) => ({
					id: o.id,
					label: o.label
				})),
				onChange: (id) => setFilter(id)
			})]
		}),
		filtered.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-empty",
			children: t("historyEmpty")
		}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-history-list",
			children: filtered.map((e) => {
				const paramsText = Object.keys(e.params || {}).map((k) => k + "=" + String(e.params[k])).join(", ");
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-history-item" + (canOpenLog(e) ? " dshj-history-item-clickable" : ""),
					title: canOpenLog(e) ? t("historyLogHint") : void 0,
					onClick: () => {
						if (canOpenLog(e)) setLogTarget(e);
					},
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
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-history-main",
							children: e.job + (e.env ? " · " + e.env : "")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshj-history-meta",
							children: [
								e.server ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshj-chip",
									children: e.server
								}) : null,
								e.buildNumber ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dshj-chip",
									children: ["#", e.buildNumber]
								}) : null,
								filter === "all" && e.cwd ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshj-chip dshj-chip-ws",
									children: e.cwd
								}) : null
							]
						}),
						paramsText ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-history-params",
							children: t("historyParams") + paramsText
						}) : null
					]
				}, e.id);
			})
		}),
		logTarget ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BuildLogModal, {
			entry: logTarget,
			run,
			sessionId,
			onClose: () => setLogTarget(null)
		}) : null
	] });
}
//#endregion
//#region src/client/components/JenkinsConfigModal.tsx
/**
* dsh-jenkins —— 统一「Jenkins 配置」弹框（shell.overlay）：
* 侧边栏底部「Jenkins 配置」入口打开的单一弹框，三个 tab：
* - 发布：原「执行 Jenkins Job」弹框内容（服务器 / Job / 参数 / 触发 / 轮询状态）；
* - 配置：原设置页内容（服务器管理：增删改查 / 测试连接 / 项目配置弹框）；
* - 历史：原「发布历史」弹框内容（按工作区筛选 / 查看构建日志 / 清空）。
*
* 当前工作区（cwd）与会话 id 由宿主 overlay 的 useWorkspaces / useSessions 推导，
* 三个 tab 共享同一份上下文。
*/
const TABS = [
	{
		id: "publish",
		label: t("tabPublish")
	},
	{
		id: "config",
		label: t("tabConfig")
	},
	{
		id: "history",
		label: t("tabHistory")
	}
];
function JenkinsConfigModal({ run, poller, storage, useOpen, close, useWorkspaces, useSessions }) {
	const open = useOpen();
	const [tab, setTab] = (0, react.useState)("publish");
	const [configCount, setConfigCount] = (0, react.useState)(0);
	const [historyCount, setHistoryCount] = (0, react.useState)(0);
	const [footerNode, setFooterNode] = (0, react.useState)(null);
	const reportFooter = (0, react.useCallback)((node) => {
		setFooterNode(node);
	}, []);
	const workspaceItems = useWorkspaces ? useWorkspaces((s) => s && s.items || []) : [];
	const currentSessionId = useSessions ? useSessions((s) => s && s.current) : void 0;
	const sessionId = currentSessionId || "";
	const cwd = (0, react.useMemo)(() => {
		const list = Array.isArray(workspaceItems) ? workspaceItems : [];
		const current = list.find((w) => Array.isArray(w.sessionIds) && w.sessionIds.indexOf(currentSessionId) !== -1);
		return current && current.path || (list.length ? list[0].path : null) || "";
	}, [workspaceItems, currentSessionId]);
	(0, react.useEffect)(() => {
		run(sessionId, { op: "list" }).then((r) => {
			if (r && r.ok) setConfigCount((r.servers || []).length);
		}).catch(() => {});
		storage.readAllHistory(sessionId).then((h) => setHistoryCount((h || []).length)).catch(() => {});
	}, [open]);
	if (!open) return null;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "dshj-backdrop",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-modal dshj-config-modal",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-modal-title",
						children: t("settingsNav")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-modal-sub",
						children: cwd || ""
					})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-close",
						"aria-label": t("close"),
						title: t("close"),
						onClick: close,
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-tabs",
					role: "tablist",
					children: TABS.map((item) => {
						const count = item.id === "config" ? configCount : item.id === "history" ? historyCount : 0;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "tab",
							"aria-selected": tab === item.id,
							className: "dshj-tab" + (tab === item.id ? " dshj-tab-active" : ""),
							onClick: () => setTab(item.id),
							children: [item.label, count > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshj-badge",
								children: count
							}) : null]
						}, item.id);
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-modal-body dshj-config-body",
					children: tab === "publish" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorBoundary, {
						label: "PublishTab",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PublishTab, {
							initialCwd: cwd,
							sessionId,
							run,
							poller,
							storage,
							workspaceItems,
							onCountChange: setConfigCount,
							onFooter: reportFooter
						})
					}) : tab === "config" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorBoundary, {
						label: "SettingsPage",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingsPage, {
							run,
							sessionId,
							onCountChange: setConfigCount
						})
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorBoundary, {
						label: "HistoryTab",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryTab, {
							cwd,
							sessionId,
							run,
							poller,
							storage,
							onCountChange: setHistoryCount,
							onFooter: reportFooter
						})
					})
				}),
				footerNode ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-modal-footer",
					children: footerNode
				}) : null
			]
		})
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
			const { store: configStore, useOpen: useConfigOpen } = makeConfigModalStore();
			const slots = ctx.get("slots");
			if (slots === void 0) return;
			injectStyles();
			const storage = createStorage(run);
			const sessionRef = { current: "" };
			const getSession = () => sessionRef.current;
			const poller = createPoller(run, storage, getSession);
			ctx.interval(() => poller.tick(), 3e3);
			poller.refresh();
			try {
				slots.inject("conversation.chat.commandview", () => slots.register({
					name: "conversation.chat.commandview",
					key: "dsh-jenkins",
					priority: 0
				}, () => null));
			} catch {}
			slots.inject("sidebar.footer.action", () => slots.register({
				name: "sidebar.footer.action",
				id: "dsh-jenkins",
				order: 10
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FooterButton, {
				onOpen: () => configStore.open(true),
				reportSession: (s) => {
					if (s) sessionRef.current = s;
				},
				wide: props.wide,
				useSessions: props.useSessions
			})));
			slots.inject("shell.overlay", () => slots.register({
				name: "shell.overlay",
				id: "dsh-jenkins-config",
				order: 100
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(JenkinsConfigModal, {
				run,
				poller,
				storage,
				useOpen: useConfigOpen,
				close: () => configStore.close(),
				useWorkspaces: props.useWorkspaces,
				useSessions: props.useSessions
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