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
	".dshj-btn-primary{--dshj-glass-fill:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3));background:color-mix(in srgb,var(--dshj-glass-fill) 58%,transparent);border-color:transparent;color:var(--dsw-alias-label-primary-foreground,#fff);-webkit-backdrop-filter:blur(10px) saturate(1.4);backdrop-filter:blur(10px) saturate(1.4)}",
	".dshj-btn-primary:hover:not(:disabled){background:color-mix(in srgb,var(--dshj-glass-fill) 64%,transparent)}",
	".dshj-head-ops{display:flex;align-items:center;gap:8px;flex:none}",
	".dshj-btn-icon{border:none;background:transparent;color:var(--dsw-alias-label-secondary,#888);width:24px;height:24px;padding:0;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}",
	".dshj-btn-icon:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));color:var(--dsw-alias-label-primary,#222)}",
	".dshj-btn-danger{color:var(--dsw-alias-state-error-primary);border-color:currentColor}",
	".dshj-btn-success{color:var(--dsw-alias-state-success-primary,#2a7d3c);border-color:currentColor;background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 10%,transparent)}",
	".dshj-btn-success:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 16%,transparent)}",
	".dshj-btn-solid{--dshj-glass-fill:var(--dsw-alias-state-error-primary,#d33);background:color-mix(in srgb,var(--dshj-glass-fill) 58%,transparent);border-color:transparent;color:#fff;-webkit-backdrop-filter:blur(10px) saturate(1.4);backdrop-filter:blur(10px) saturate(1.4)}",
	".dshj-btn-solid:hover:not(:disabled){background:color-mix(in srgb,var(--dshj-glass-fill) 64%,transparent)}",
	".dshj-btn-small{padding:3px 10px;font-size:12px}",
	".dshj-btn-active{border-color:var(--dsw-alias-brand-primary,#1668e3);color:var(--dsw-alias-brand-primary,#1668e3)}",
	".dshj-err{color:var(--dsw-alias-state-error-primary,#d33);font-size:13px;margin:8px 0}",
	".dshj-ok{color:var(--dsw-alias-state-success-primary,#2a7d3c);font-size:13px;margin:8px 0}",
	".dshj-warn{color:var(--dsw-alias-state-warn-primary,#b8860b)}",
	".dshj-empty{padding:28px 16px;text-align:center;color:var(--dsw-alias-label-secondary,#888);font-size:13px}",
	".dshj-input,.dshj-select,.dshj-textarea{width:100%;box-sizing:border-box;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 86%,transparent);color:var(--dsw-alias-label-primary,#222);border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:8px;padding:8px 12px;font-size:13px;font-family:inherit;transition:border-color .15s,box-shadow .15s,background .15s;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}",
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
	".dshj-link-btn{border:none;background:transparent;color:var(--dsw-alias-brand-primary,#1668e3);font-size:13px;cursor:pointer;padding:6px 10px;border-radius:6px;text-decoration:none}",
	".dshj-link-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));text-decoration:underline}",
	".dshj-link-btn:disabled{opacity:.5;cursor:not-allowed}",
	".dshj-link-btn-disabled{opacity:.5;cursor:not-allowed;text-decoration:none}",
	".dshj-form-divider{display:flex;align-items:center;gap:10px;margin:16px 0 6px}",
	".dshj-form-divider::before,.dshj-form-divider::after{content:\"\";flex:1;height:0;border-top:1px dashed var(--dsw-alias-border-l3,#bbb)}",
	".dshj-form-divider-text{font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70%}",
	".dshj-footer-btn{box-sizing:border-box;cursor:pointer;width:calc(100% + 4px);height:42px;color:var(--dsw-alias-label-primary);background:transparent;border:none;border-radius:12px;flex:none;align-items:center;gap:8px;margin:4px -2px;padding:0 10px 0 8px;font-family:inherit;font-size:14px;line-height:22px;display:flex;overflow:hidden}",
	".dshj-footer-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}",
	".dshj-footer-btn-rail{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;margin:8px 0 10px;padding:0}",
	".dshj-footer-btn-has-update{padding-right:60px}",
	".dshj-footer-group{width:100%;min-width:0;position:relative}",
	".dshj-footer-rail-group{width:auto;display:flex;flex-direction:column;align-items:center}",
	".dshj-footer-logo{height:28px;width:28px;flex:none;display:block;object-fit:contain;background:color-mix(in srgb,#D33833 74%,transparent);border-radius:50%;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);pointer-events:none}",
	".dshj-footer-label{white-space:nowrap;overflow:hidden}",
	".dshj-footer-caps{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:4px;z-index:2;pointer-events:none}",
	".dshj-footer-rail-group .dshj-footer-caps{position:static;transform:none;justify-content:center;margin-top:-4px}",
	".dshj-capsule{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;border-radius:999px;font-size:10px;line-height:1;font-weight:700;font-variant-numeric:tabular-nums;box-sizing:border-box;white-space:nowrap}",
	".dshj-capsule-building{color:#4a3500;background:#f0b429;border:1px solid color-mix(in srgb,#f0b429 60%,#fff)}",
	".dshj-capsule-done{color:#fff;background:var(--dsw-alias-state-success-primary,#2a7d3c);border:1px solid color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 75%,#fff)}",
	".dshj-capsule-update{color:#fff;background:var(--dsw-alias-state-info-primary,#2563eb);border:1px solid color-mix(in srgb,var(--dsw-alias-state-info-primary,#2563eb) 75%,#fff);font-weight:600}",
	".dshj-capsule-wrap{display:inline-flex;align-items:center;justify-content:center;width:auto;height:42px;padding:0;margin:0;border:none;background:transparent;color:inherit;font:inherit;cursor:pointer;pointer-events:auto;flex:none;box-sizing:border-box;border-radius:999px}",
	".dshj-footer-rail-group .dshj-capsule-wrap{height:24px}",
	"div:has(> [data-slot=\"sidebar.footer.action\"]){flex-direction:column}",
	".dshj-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.32);z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;pointer-events:auto;-webkit-backdrop-filter:blur(12px) saturate(1.2);backdrop-filter:blur(12px) saturate(1.2)}",
	".dshj-modal{background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 78%,transparent);border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.28);width:720px;max-width:100%;min-height:400px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;color:var(--dsw-alias-label-primary,#222);font-size:14px;-webkit-backdrop-filter:blur(24px) saturate(1.5);backdrop-filter:blur(24px) saturate(1.5)}",
	".dshj-modal-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);flex:none}",
	".dshj-modal-title{font-size:15px;font-weight:600}",
	".dshj-modal-sub{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:2px;word-break:break-all}",
	".dshj-close{border:none;background:transparent;color:var(--dsw-alias-label-secondary,#888);font-size:16px;cursor:pointer;padding:4px 8px;border-radius:6px}",
	".dshj-close:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));color:var(--dsw-alias-label-primary,#222)}",
	".dshj-tabs{display:flex;gap:6px;padding:10px 18px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);overflow-x:auto;flex:none}",
	".dshj-tab{padding:5px 12px;border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 40%,transparent);color:var(--dsw-alias-label-secondary,#666);font-size:13px;cursor:pointer;white-space:nowrap}",
	".dshj-tab:not(.dshj-tab-active):hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));border-color:var(--dsw-alias-border-l3,#b8b8b8)}",
	".dshj-tab-active{--dshj-glass-fill:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3));background:color-mix(in srgb,var(--dshj-glass-fill) 58%,transparent);color:var(--dsw-alias-label-primary-foreground,#fff);border-color:transparent;font-weight:500;-webkit-backdrop-filter:blur(10px) saturate(1.4);backdrop-filter:blur(10px) saturate(1.4)}",
	".dshj-tab-active:hover{background:color-mix(in srgb,var(--dshj-glass-fill) 64%,transparent)}",
	".dshj-badge{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;margin-left:6px;border-radius:999px;font-size:11px;line-height:1;font-weight:600;background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));color:var(--dsw-alias-label-secondary,#666)}",
	".dshj-tab-active .dshj-badge{background:color-mix(in srgb,var(--dsw-alias-label-primary-foreground,#fff) 68%,transparent);color:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3))}",
	".dshj-tab-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-brand-primary,#1668e3);margin-left:6px;vertical-align:1px;flex:none}",
	".dshj-tab-active .dshj-tab-dot{background:var(--dsw-alias-label-primary-foreground,#fff)}",
	".dshj-server-field{display:grid;grid-template-columns:168px minmax(0,1fr);align-items:center;gap:10px;padding:10px 18px 0;flex:none}",
	".dshj-server-label{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666);text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
	".dshj-server-ctrl{display:flex;align-items:center;gap:8px;min-width:0}",
	".dshj-server-ctrl .dshj-combo{flex:1;min-width:0}",
	".dshj-server-side{flex:none;width:120px;box-sizing:border-box;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
	".dshj-server-side.dshj-btn{padding-left:4px;padding-right:4px}",
	".dshj-server-side.dshj-job-count{display:inline-flex;align-items:center;justify-content:center;margin:0;font-size:12px;color:var(--dsw-alias-label-secondary,#888)}",
	".dshj-server-side-empty{color:var(--dsw-alias-label-tertiary,#aaa)}",
	".dshj-divider{border-top:1px dashed var(--dsw-alias-border-l3,#bbb);margin:14px 18px 2px;flex:none}",
	".dshj-picker{display:flex;align-items:center;gap:8px;width:100%;height:34px;padding:0 12px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 74%,transparent);color:var(--dsw-alias-label-primary,#222);font-size:13px;font-family:inherit;cursor:pointer;transition:border-color .15s,box-shadow .15s;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}",
	".dshj-picker:hover:not(:disabled){border-color:var(--dsw-alias-border-l3,#b8b8b8)}",
	".dshj-picker:focus{outline:none;border-color:var(--dsw-alias-brand-primary,#1668e3);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 18%,transparent)}",
	".dshj-picker:disabled{opacity:.5;cursor:not-allowed}",
	".dshj-picker-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}",
	".dshj-picker-empty .dshj-picker-value{color:var(--dsw-alias-label-tertiary,#aaa)}",
	".dshj-picker-caret{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary,#888)}",
	".dshj-combo{position:relative;min-width:0}",
	".dshj-combo .dshj-picker{width:100%}",
	".dshj-combo-panel{position:fixed;z-index:2000;display:flex;flex-direction:column;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 82%,transparent);border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);overflow:hidden;-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5)}",
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
	".dshj-json-modal .dshj-modal-body{display:flex;flex-direction:column;overflow:hidden;padding:14px 16px}",
	".dshj-json-modal .dshj-code{flex:1;min-height:0;max-height:none;margin:0}",
	".dshj-confirm-backdrop{z-index:1150}",
	".dshj-confirm-modal{width:min(420px,100%);min-height:auto;height:auto}",
	".dshj-confirm-modal .dshj-modal-body{padding:8px 18px 12px}",
	".dshj-confirm-modal .dshj-empty{padding:8px 4px;text-align:left;font-size:13px;line-height:1.6;color:var(--dsw-alias-label-primary,#222)}",
	".dshj-confirm-modal .dshj-modal-footer{padding:10px 18px}",
	".dshj-server-modal{width:min(480px,100%);max-height:80vh}",
	".dshj-modal-body{flex:1;overflow-y:auto;padding:16px 18px;min-width:0;min-height:0}",
	".dshj-modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--dsw-alias-border-l1,#eee);flex:none;flex-wrap:wrap}",
	".dshj-config-modal{width:min(880px,100%);height:640px;max-height:80vh;min-height:480px}",
	".dshj-config-body{padding:14px 18px 18px}",
	".dshj-config-body .dshj-server-field{padding:4px 0 0}",
	".dshj-config-body .dshj-divider{margin:14px 0 2px}",
	".dshj-config-body .dshj-history-ws-field{display:block;padding:4px 0 0}",
	".dshj-config-body .dshj-history-ws-field .dshj-combo{width:100%}",
	".dshj-config-header{gap:12px}",
	".dshj-config-title{min-width:0;flex:0 1 auto}",
	".dshj-config-title .dshj-modal-sub{max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
	".dshj-config-tabs{display:flex;align-items:center;gap:4px;margin-left:auto;padding:0;border-bottom:none;overflow:visible;flex:none}",
	".dshj-config-tabs .dshj-tab{padding:4px 10px;font-size:12px}",
	".dshj-server-history-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:14px 2px 0;flex:none}",
	".dshj-server-history-title{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary,#666);flex:none}",
	".dshj-server-history-search{position:relative;flex:1;max-width:300px;min-width:0}",
	".dshj-server-history-search .dshj-input{height:26px;padding:3px 26px 3px 10px;font-size:12px;border-radius:6px}",
	".dshj-server-history-search .dshj-input:disabled{opacity:.5;cursor:not-allowed}",
	".dshj-server-history-clear{position:absolute;right:4px;top:50%;transform:translateY(-50%);border:none;background:transparent;color:var(--dsw-alias-label-secondary,#888);font-size:12px;line-height:1;padding:4px;border-radius:4px;cursor:pointer}",
	".dshj-server-history-clear:hover{color:var(--dsw-alias-label-primary,#222);background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}",
	".dshj-server-history-item{display:block;width:100%;text-align:left;font-family:inherit;color:inherit;cursor:pointer}",
	".dshj-server-history-left{display:flex;align-items:center;gap:8px;flex:1;min-width:0}",
	".dshj-server-history-name{font-size:13px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
	".dshj-server-history-desc{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:7px;line-height:1.5;word-break:break-all;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
	".dshj-history-modal{min-height:420px;max-height:82vh;width:640px}",
	".dshj-history-list{display:flex;flex-direction:column;gap:10px;padding:14px 2px 4px}",
	".dshj-history-item{border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:10px;padding:10px 14px;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 64%,transparent);transition:border-color .15s,background .15s;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}",
	".dshj-history-item:hover{border-color:var(--dsw-alias-border-l2,#ddd)}",
	".dshj-history-actions{display:flex;align-items:center;gap:8px;margin-top:9px;flex-wrap:wrap}",
	".dshj-pagination{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 2px 4px;flex:none;flex-wrap:wrap}",
	".dshj-pagination-info{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-right:auto}",
	".dshj-pagination-size-label{font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap}",
	".dshj-pagination-size{width:72px;padding:4px 22px 4px 10px;font-size:12px;border-radius:6px}",
	".dshj-pagination-page{font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap}",
	".dshj-history-head{display:flex;align-items:center;justify-content:space-between;gap:8px}",
	".dshj-history-time{font-size:12px;color:var(--dsw-alias-label-tertiary,#999)}",
	".dshj-unread-tag{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:var(--dsw-alias-brand-primary,#1668e3);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 10%,transparent);border-radius:999px;padding:1px 8px;flex:none;margin-right:auto}",
	".dshj-unread-tag::before{content:\"\";width:5px;height:5px;border-radius:50%;background:currentColor}",
	".dshj-history-result{font-size:11px;font-weight:600;padding:2px 10px;border-radius:999px;white-space:nowrap;flex:none;margin:0}",
	".dshj-history-result.dshj-ok{color:var(--dsw-alias-state-success-primary,#2a7d3c);background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 14%,transparent)}",
	".dshj-history-result.dshj-err{color:var(--dsw-alias-state-error-primary,#d33);background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d33) 14%,transparent)}",
	".dshj-history-result.dshj-warn{color:var(--dsw-alias-state-warn-primary,#b8860b);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b8860b) 14%,transparent)}",
	".dshj-history-pending{color:var(--dsw-alias-state-warn-primary,#b8860b);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b8860b) 12%,transparent)}",
	".dshj-history-main{font-size:13px;font-weight:600;margin-top:6px;word-break:break-all;transition:color .15s}",
	".dshj-history-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}",
	".dshj-chip{font-size:11px;color:var(--dsw-alias-label-secondary,#888);background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#f5f6f8) 60%,transparent);border:1px solid var(--dsw-alias-border-l1,#eee);padding:1px 9px;border-radius:999px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}",
	".dshj-chip-ws{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}",
	".dshj-history-params-row{display:flex;align-items:center;gap:4px;margin-top:7px;min-width:0}",
	".dshj-history-params{flex:1;min-width:0;font-size:12px;color:var(--dsw-alias-label-tertiary,#999);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;word-break:keep-all;margin:0}",
	".dshj-history-params-copy{flex:none;width:20px;height:20px;color:var(--dsw-alias-label-secondary,#888)}",
	".dshj-history-params-copy:hover{color:var(--dsw-alias-brand-primary,#1668e3)}",
	".dshj-history-params-copy.dshj-btn-icon{width:20px;height:20px;border-radius:5px}",
	".dshj-log-modal{width:min(720px,100%);height:min(78vh,640px);min-height:420px}",
	".dshj-modal-sm{width:min(420px,100%);min-height:0;max-height:60vh}",
	".dshj-modal-log{width:min(720px,100%);min-height:380px}",
	".dshj-modal-log .dshj-modal-body{display:flex;flex-direction:column}",
	".dshj-update-log{flex:1;min-height:0;overflow:auto;background:#0f1419;color:#d5d8dc;border:1px solid var(--dsw-alias-border-l2,#333);border-radius:8px;padding:10px 12px;margin:0 0 10px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-word}",
	".dshj-update-status{display:flex;align-items:center;gap:8px;font-size:12px;margin:0 0 10px;color:var(--dsw-alias-label-secondary,#888)}",
	".dshj-update-status-ok{color:#16a34a}",
	".dshj-update-status-err{color:var(--dsw-alias-state-error-primary,#d33)}",
	".dshj-spinner-inline{width:12px;height:12px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2,#ccc);border-top-color:var(--dsw-alias-brand-primary,#1668e3);animation:dshj-spin .8s linear infinite;flex:none}",
	".dshj-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin:0 0 10px;line-height:1.5}",
	".dshj-update-cmd.dshj-code{margin:14px 0 0;padding:8px 12px;max-height:none;white-space:pre-wrap;word-break:break-all}",
	".dshj-update-cmd-sub{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;word-break:break-all}",
	".dshj-update-hint{margin-right:auto;font-size:12px;color:var(--dsw-alias-label-secondary,#888);display:inline-flex;align-items:center;gap:6px;flex:none}",
	".dshj-log-fullscreen{position:fixed;inset:0;width:auto;height:auto;max-width:none;max-height:none;min-height:0;border-radius:0;border:none;box-shadow:none}",
	".dshj-log-fullscreen .dshj-modal-body{padding:14px 18px}",
	".dshj-log-body{display:flex;flex-direction:column;overflow:hidden;padding:14px 16px}",
	".dshj-log-body .dshj-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}",
	".dshj-log-code{flex:1;min-height:0;max-height:none;margin:0;overflow:auto}",
	".dshj-log-truncated{font-size:12px;color:var(--dsw-alias-state-warn-primary,#b8860b);margin-top:8px;flex:none}",
	".dshj-log-live{margin-right:auto;font-size:12px;color:var(--dsw-alias-state-success-primary,#2a7d3c);display:inline-flex;align-items:center;gap:6px;flex:none}",
	".dshj-log-live::before{content:\"\";width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-state-success-primary,#2a7d3c);animation:dshj-live-pulse 1.2s ease-in-out infinite}",
	"@keyframes dshj-live-pulse{0%,100%{opacity:1}50%{opacity:.35}}",
	".dshj-log-live-tag{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:var(--dsw-alias-state-success-primary,#2a7d3c);background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 12%,transparent);border-radius:999px;padding:1px 8px;margin-left:8px;vertical-align:1px}",
	".dshj-log-cancel-msg{font-size:12px;margin-right:auto;flex:none;word-break:break-all}",
	".dshj-log-cancel-msg-ok{color:var(--dsw-alias-state-success-primary,#2a7d3c)}",
	".dshj-log-cancel-msg-err{color:var(--dsw-alias-state-error-primary,#d33)}",
	".dshj-inflight{padding:16px 2px 4px}",
	".dshj-select-hint{font-size:13px;color:var(--dsw-alias-label-secondary,#888);margin-bottom:6px}",
	".dshj-inflight-title{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary,#666);margin:6px 0 8px}",
	".dshj-inflight-list{display:flex;flex-direction:column;gap:8px}",
	".dshj-inflight-item{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;padding:8px 12px;border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 64%,transparent);color:var(--dsw-alias-label-primary,#222);font-size:13px;font-family:inherit;cursor:pointer;transition:border-color .15s,background .15s;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}",
	".dshj-inflight-item:hover{border-color:var(--dsw-alias-brand-primary,#1668e3);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 5%,color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 64%,transparent))}",
	".dshj-inflight-main{font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
	".dshj-inflight-meta{display:flex;align-items:center;gap:6px;flex:none;max-width:45%;overflow:hidden}",
	".dshj-inflight-meta .dshj-history-result{margin:0;flex:none}",
	".dshj-inflight-meta .dshj-chip{flex:none}",
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
	".dshj-card{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#fafafa) 64%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}",
	".dshj-card-main{min-width:0}",
	".dshj-card-name-row{display:flex;align-items:center;gap:8px;min-width:0}",
	".dshj-card-name{font-size:13px;font-weight:600;flex:none}",
	".dshj-card-test{margin:0;font-size:12px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}",
	".dshj-card-meta{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:2px;word-break:break-all}",
	".dshj-card-ops{display:flex;gap:6px;flex:none;flex-wrap:wrap}",
	".dshj-result{font-size:12px;padding:8px 10px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#fafafa) 64%,transparent);margin-top:8px;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}",
	".dshj-template{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:12px 14px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#fafafa) 64%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}",
	".dshj-template-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px}",
	".dshj-template-title{font-size:13px;font-weight:600}",
	".dshj-template-tabs{display:flex;gap:6px}",
	".dshj-code-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}",
	".dshj-code-ops{display:flex;align-items:center;gap:8px;flex:none}",
	".dshj-code-file{font-size:12px;color:var(--dsw-alias-label-secondary,#888);font-family:ui-monospace,SFMono-Regular,Consolas,monospace}",
	".dshj-code{margin:0;padding:12px 14px;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 84%,transparent);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;overflow:auto;max-height:52vh;font-size:12px;line-height:1.55;color:var(--dsw-alias-label-primary,#222);white-space:pre;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}",
	".dshj-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-bottom:10px}",
	".dshj-template-modal{width:min(680px,100%);height:min(76vh,620px);min-height:420px}",
	".dshj-template-modal .dshj-modal-body{display:flex;flex-direction:column;overflow:hidden}",
	".dshj-template-modal .dshj-template{flex:1;min-height:0;display:flex;flex-direction:column;border:none;padding:0;background:transparent}",
	".dshj-template-modal .dshj-template-head{flex:none}",
	".dshj-template-modal .dshj-hint{flex:none}",
	".dshj-template-modal .dshj-code-head{flex:none}",
	".dshj-template-modal .dshj-code{flex:1;min-height:0;max-height:none}",
	".dshj-template-project{display:flex;align-items:center;gap:10px;margin-bottom:8px;flex:none}",
	".dshj-template-project > label{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666);flex:none;white-space:nowrap}",
	".dshj-template-project .dshj-combo{flex:1;min-width:0}",
	"@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))){.dshj-modal,.dshj-combo-panel{background:var(--dsw-alias-bg-layer-1,#fff)}.dshj-history-item,.dshj-inflight-item,.dshj-picker,.dshj-code,.dshj-input,.dshj-select,.dshj-textarea{background:var(--dsw-alias-bg-base,#fff)}.dshj-card,.dshj-template,.dshj-result{background:var(--dsw-alias-bg-layer-2,#fafafa)}.dshj-chip{background:var(--dsw-alias-bg-layer-2,#f5f6f8)}.dshj-btn-primary,.dshj-btn-solid,.dshj-tab-active{background:var(--dshj-glass-fill)}.dshj-footer-logo{background:#D33833}}"
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
		tabHistory: "本机记录",
		tabServerHistory: "历史记录",
		serverHistoryList: "日志记录",
		serverHistorySelectJob: "请先选择服务器和 Job，查看该 Job 在服务器上的真实构建记录",
		serverHistoryEmpty: "该 Job 在服务器上暂无构建记录",
		serverHistoryLoading: "加载构建记录…",
		serverHistoryFailed: "加载构建记录失败",
		serverHistorySearchPlaceholder: "搜索：#编号 / 发布人 / 项目 / 描述",
		serverHistoryNoMatch: "无匹配的日志记录",
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
		confirmClearTitle: "确认清空",
		confirmClearAll: "将清空全部工作区的发布历史，此操作不可恢复。",
		confirmClearCwd: "将清空工作区「{path}」的发布历史，此操作不可恢复。",
		confirmClear: "确认清空",
		historyParams: "参数：",
		historyPending: "进行中",
		unread: "未读",
		unreadCount: "{n} 条未读",
		footerBuilding: "构建中",
		footerDoneUnread: "已完成（未读）",
		footerUpdate: "有更新",
		footerUpdateTitle: "发现新版本 v{v}（当前 v{c}），点击更新",
		updateConfirmTitle: "确认更新插件",
		updateConfirmMsg: "发现新版本 v{v}（当前 v{c}），确认执行以下命令更新插件？",
		updateBtn: "确认更新",
		updateLogTitle: "插件更新日志",
		updateLogStartFailed: "启动更新失败",
		updateRunning: "正在执行 dsh plugin --profile web update dsh-jenkins …",
		updateSuccess: "更新完成（退出码 0），请刷新页面使新版本生效",
		updateFailed: "更新失败（退出码 {code}）",
		updateNoOutput: "（暂无输出）",
		updateBgHint: "关闭弹框后更新仍在后台继续，可随时重新打开日志查看进度",
		updateRestartHint: "更新完成后请重启 dsh 服务使新版本生效",
		historyAll: "全部",
		historyWsPlaceholder: "搜索并选择工作区…",
		historyLogHint: "点击查看完整构建日志",
		openOriginalJob: "打开原始任务",
		paginationSize: "每页",
		paginationPage: "第 {cur} / {total} 页",
		paginationTotal: "共 {n} 条",
		prevPage: "上一页",
		nextPage: "下一页",
		logTitle: "构建日志",
		logLoading: "加载构建日志…",
		logFailed: "加载构建日志失败",
		logEmpty: "（暂无日志输出）",
		logWaiting: "构建尚未开始，等待首个日志输出…",
		logTruncated: "日志过长，仅显示末尾 {kb} KB",
		enterFullscreen: "进入全屏",
		exitFullscreen: "退出全屏",
		liveStatus: "实时刷新中",
		viewFullLog: "查看完整日志",
		inFlightTitle: "进行中的发布",
		inFlightHint: "点击进入「历史」查看该条构建日志",
		cancelBuild: "终止",
		confirmCancelBuild: "确认终止？",
		cancelling: "正在终止…",
		cancelRequested: "已请求终止，等待 Jenkins 停止…",
		cancelFailed: "终止构建失败",
		openBuildPage: "打开构建页面",
		pickerNoMatch: "无匹配选项",
		pickerSearchPlaceholder: "搜索…",
		jobRequired: "请先选择要发布的 Job",
		selectJobFirst: "请先在 Job 列表中选择要发布的 Job",
		projectConfigBtn: "项目配置",
		templateTitle: "配置模板",
		templateHint: "可以将此配置放到工作区根目录，可以快速自动补齐发布任务的参数，提高效率和团队统一规范",
		copy: "复制",
		copied: "已复制",
		saveToWorkspace: "保存到工作区",
		savingToWorkspace: "保存中…",
		savedToWorkspace: "已保存",
		noWorkspaceHint: "未选择工作区",
		overwriteConfirmTitle: "确认覆盖",
		overwriteConfirm: "工作区已存在文件「{name}」，是否覆盖？",
		overwriteBtn: "覆盖",
		copyParams: "复制参数（JSON）",
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
		submittedMsg: "已提交构建，正在获取状态…",
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
		noParams: "该任务没有参数，可直接构建。",
		submit: "提交构建",
		submitting: "提交中…",
		viewParams: "查看表单配置",
		formParamsJson: "表单参数（JSON）",
		openOnlinePublish: "打开在线发布",
		openOnlinePublishDisabled: "请先选择服务器",
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
			"cancel-failed": "终止构建失败",
			"template-save-failed": "保存配置模板失败",
			"template-name-invalid": "模板文件名无效",
			"spawn-failed": "启动更新命令失败",
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
		tabHistory: "Local Records",
		tabServerHistory: "History Records",
		serverHistoryList: "Log Records",
		serverHistorySelectJob: "Select a server and job to view its real build records on the server",
		serverHistoryEmpty: "No build records for this job on the server yet",
		serverHistoryLoading: "Loading build records…",
		serverHistoryFailed: "Failed to load build records",
		serverHistorySearchPlaceholder: "Search: #id / user / project / description",
		serverHistoryNoMatch: "No matching log records",
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
		confirmClearTitle: "Confirm Clear",
		confirmClearAll: "This will clear the publish history of ALL workspaces. This cannot be undone.",
		confirmClearCwd: "This will clear the publish history of workspace \"{path}\". This cannot be undone.",
		confirmClear: "Clear All",
		historyParams: "Params: ",
		historyPending: "Running",
		unread: "New",
		unreadCount: "{n} unread",
		footerBuilding: "Building",
		footerDoneUnread: "Done (unread)",
		footerUpdate: "Update",
		footerUpdateTitle: "New version v{v} available (current v{c}). Click to update",
		updateConfirmTitle: "Confirm Plugin Update",
		updateConfirmMsg: "New version v{v} available (current v{c}). Confirm running the following command to update the plugin?",
		updateBtn: "Update Now",
		updateLogTitle: "Plugin Update Log",
		updateLogStartFailed: "Failed to start the update",
		updateRunning: "Running dsh plugin --profile web update dsh-jenkins …",
		updateSuccess: "Update finished (exit 0). Refresh the page to apply.",
		updateFailed: "Update failed (exit code {code})",
		updateNoOutput: "(no output yet)",
		updateBgHint: "Closing this dialog keeps the update running in the background; reopen the log anytime to watch progress",
		updateRestartHint: "Restart the dsh service after the update finishes to apply the new version",
		historyAll: "All",
		historyWsPlaceholder: "Search and select workspace…",
		historyLogHint: "Click to view the full build log",
		openOriginalJob: "Open Job",
		paginationSize: "Per page",
		paginationPage: "Page {cur} / {total}",
		paginationTotal: "{n} total",
		prevPage: "Previous",
		nextPage: "Next",
		logTitle: "Build Log",
		logLoading: "Loading build log…",
		logFailed: "Failed to load build log",
		logEmpty: "(no log output yet)",
		logWaiting: "Build not started yet; waiting for the first log output…",
		logTruncated: "Log is too long; showing the last {kb} KB",
		enterFullscreen: "Enter fullscreen",
		exitFullscreen: "Exit fullscreen",
		liveStatus: "Live",
		viewFullLog: "View full log",
		inFlightTitle: "In-flight publishes",
		inFlightHint: "Open this build log in History",
		cancelBuild: "Stop",
		confirmCancelBuild: "Confirm stop?",
		cancelling: "Stopping…",
		cancelRequested: "Stop requested; waiting for Jenkins…",
		cancelFailed: "Failed to stop build",
		openBuildPage: "Open build page",
		pickerNoMatch: "No matching options",
		pickerSearchPlaceholder: "Search…",
		jobRequired: "Please select a job to publish",
		selectJobFirst: "Select a job from the list first",
		projectConfigBtn: "Project Config",
		templateTitle: "Config Template",
		templateHint: "Place this config in the workspace root to auto-fill publish task parameters quickly, improving efficiency and team-wide consistency",
		copy: "Copy",
		copied: "Copied",
		saveToWorkspace: "Save to Workspace",
		savingToWorkspace: "Saving…",
		savedToWorkspace: "Saved",
		noWorkspaceHint: "No workspace selected",
		overwriteConfirmTitle: "Confirm Overwrite",
		overwriteConfirm: "File \"{name}\" already exists in the workspace. Overwrite?",
		overwriteBtn: "Overwrite",
		copyParams: "Copy params (JSON)",
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
		submittedMsg: "Build submitted; fetching status…",
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
		noParams: "No parameters for this job; build directly.",
		submit: "Submit build",
		submitting: "Submitting…",
		viewParams: "View form config",
		formParamsJson: "Form Params (JSON)",
		openOnlinePublish: "Open Publish Page",
		openOnlinePublishDisabled: "Select a server first",
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
			"cancel-failed": "Failed to stop build",
			"template-save-failed": "Failed to save config template",
			"template-name-invalid": "Invalid template filename",
			"spawn-failed": "Failed to start the update command",
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
			if (res.code === "template-save-failed") {
				const detail = res.error ? String(res.error).trim() : "";
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
			list.unshift(Object.assign({}, entry, { unread: true }));
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
		markAllHistoryRead: async (sessionId) => {
			const all = await readAll(sessionId);
			let dirty = false;
			for (const cwd of Object.keys(all.history)) {
				const list = historyOf(all, cwd);
				for (const e of list) if (e.unread) {
					e.unread = false;
					dirty = true;
				}
				if (dirty) mirror.history[cwd] = list;
			}
			if (dirty) await persist(sessionId, "history");
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
	/** 扫描期间又有 refresh() 请求时置位，当前扫描结束后补跑一次（避免清除未读后汇总不刷新）。 */
	let pendingRefresh = false;
	/** 是否还有「进行中」任务：false 时 tick() 直接短路，不发任何请求。 */
	let hasInFlight = false;
	/** 任务数量汇总快照：每次扫描后按历史快照重算（footer 胶囊数据源）。 */
	let summarySnapshot = {
		building: 0,
		successUnread: 0
	};
	const emit = () => {
		for (const fn of Array.from(listeners)) try {
			fn();
		} catch {}
	};
	/** 按历史快照重算汇总：构建中（result 为空且带轮询数据）+ 成功未读（SUCCESS 且 unread）。 */
	const computeSummary = (entries) => {
		let building = 0;
		let successUnread = 0;
		for (const e of entries) if (e.result === null || e.result === void 0) {
			if (e.queueId != null || e.buildNumber != null) building++;
		} else if (e.result === "SUCCESS" && e.unread === true) successUnread++;
		if (building !== summarySnapshot.building || successUnread !== summarySnapshot.successUnread) summarySnapshot = {
			building,
			successUnread
		};
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
		computeSummary(entries);
		let found = false;
		for (const e of entries) {
			if (e.result !== null && e.result !== void 0) continue;
			if (e.queueId == null && e.buildNumber == null) continue;
			found = true;
			pollEntry(e);
		}
		hasInFlight = found;
		emit();
	};
	const refreshImpl = () => {
		if (scanning) {
			pendingRefresh = true;
			return;
		}
		scanning = true;
		scan().finally(() => {
			scanning = false;
			if (pendingRefresh) {
				pendingRefresh = false;
				refreshImpl();
			}
		});
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
		refresh: refreshImpl,
		subscribe(fn) {
			listeners.add(fn);
			return () => {
				listeners.delete(fn);
			};
		},
		getLive(entryId) {
			return live.get(entryId);
		},
		getSummary() {
			return summarySnapshot;
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
* footer 按钮排序功能已移除：入口注册不传 order，使用宿主默认排序。
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
function useStoreValue(target) {
	const [v, setV] = (0, react.useState)(target.value);
	(0, react.useEffect)(() => target.subscribe(() => setV(target.value)), []);
	return v;
}
function makeUpdateModalStore() {
	const updateStore = createStore();
	const uiStore = createStore();
	uiStore.value = "none";
	return {
		setUpdate: (info) => {
			updateStore.value = info;
			updateStore.emit();
		},
		useUpdate: () => useStoreValue(updateStore),
		openUpdateConfirm: () => {
			uiStore.value = "confirm";
			uiStore.emit();
		},
		openUpdateLog: () => {
			uiStore.value = "log";
			uiStore.emit();
		},
		closeUpdateUi: () => {
			uiStore.value = "none";
			uiStore.emit();
		},
		useUpdateUi: () => {
			return useStoreValue(uiStore) ?? "none";
		}
	};
}
//#endregion
//#region src/client/logo.ts
/**
* dsh-jenkins —— 插件 logo。
*
* footer 入口按钮图标（Jenkins 官方 SVG logo，assets/logo.svg）由宿主 node 半边
* 经 HTTP 路由 /plugins/dsh-jenkins/assets/logo.svg 提供：宿主不会把插件包内的
* assets 文件直接暴露给浏览器，因此 node 半边注册 exact 路由按包内原文件喂给
* 浏览器（见 src/host/index.ts）。
*/
/** footer 入口按钮图标：Jenkins 官方 SVG（同源绝对路径，由宿主路由提供）。 */
const JENKINS_LOGO = "/plugins/dsh-jenkins/assets/logo.svg";
//#endregion
//#region src/client/components/FooterButton.tsx
/**
* dsh-jenkins —— 侧边栏底部入口（sidebar.footer.action）：
* 常驻的「Jenkins 配置」按钮（位于 dsh 配置按钮上方的 footer.action 区），
* 点击打开统一弹框（发布 / 配置 / 历史 三个 tab）。不再按工作区配置门控 ——
* 服务器配置入口本就应随时可达。
*
* 按钮右侧任务状态小胶囊（数据来自全局轮询器每次扫描的汇总）+ 更新提示胶囊：
* - 橙色：构建中（含排队）任务数，无进行中任务时不显示；
* - 绿色：构建成功但尚未在「历史」tab 查看过的条数，打开历史后自动消失；
* - 蓝色【有更新】：npm registry 上出现比本地安装版本更新的 dsh-jenkins
*   版本时显示，位于胶囊组最右侧（数据来自全局更新检查）；可点击 ——
*   等宽、撑满按钮高度的透明点击热区（视觉仍是小胶囊），点击打开更新确认弹框。
*/
const EMPTY_SUMMARY = {
	building: 0,
	successUnread: 0
};
function FooterButton({ onOpen, reportSession, wide = false, useSessions, poller, useUpdate, onUpdateRequest }) {
	const currentSessionId = useSessions ? useSessions((s) => s && s.current) : null;
	if (reportSession && currentSessionId) reportSession(currentSessionId);
	const [summary, setSummary] = (0, react.useState)(EMPTY_SUMMARY);
	(0, react.useEffect)(() => {
		if (!poller) return;
		const update = () => {
			setSummary(poller.getSummary());
		};
		update();
		return poller.subscribe(update);
	}, [poller]);
	(0, react.useEffect)(() => {
		if (poller && currentSessionId) poller.refresh();
	}, [poller, currentSessionId]);
	const update = useUpdate ? useUpdate() : null;
	const showBuilding = summary.building > 0;
	const showDone = summary.successUnread > 0;
	const showUpdate = !!(update && update.hasUpdate && update.latest !== "");
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "dshj-footer-group" + (wide ? "" : " dshj-footer-rail-group"),
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "dshj-footer-btn" + (wide ? "" : " dshj-footer-btn-rail") + (showUpdate && wide ? " dshj-footer-btn-has-update" : ""),
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
		}), showBuilding || showDone || showUpdate ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
			className: "dshj-footer-caps",
			children: [
				showBuilding ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-capsule dshj-capsule-building",
					title: t("footerBuilding") + ": " + summary.building,
					children: summary.building
				}) : null,
				showDone ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-capsule dshj-capsule-done",
					title: t("footerDoneUnread") + ": " + summary.successUnread,
					children: summary.successUnread
				}) : null,
				showUpdate ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dshj-capsule-wrap",
					title: t("footerUpdateTitle", {
						v: update.latest,
						c: update.current
					}),
					"aria-label": t("footerUpdate"),
					onClick: onUpdateRequest,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshj-capsule dshj-capsule-update",
						children: t("footerUpdate")
					})
				}) : null
			]
		}) : null]
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
//#region src/client/components/ModalPortal.tsx
function ModalPortal({ backdropClass, modalClass, onBackdropClose, children }) {
	return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "dshj-backdrop" + (backdropClass ? " " + backdropClass : ""),
		onClick: onBackdropClose ? (e) => {
			e.stopPropagation();
			onBackdropClose();
		} : void 0,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-modal" + (modalClass ? " " + modalClass : ""),
			onClick: (e) => e.stopPropagation(),
			children
		})
	}), document.body);
}
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
	const tokenRequired = draft.isNew || !draft.masked;
	const tokenBase = draft.baseUrl.trim().replace(/\/+$/, "");
	const canCreateToken = /^https?:\/\//i.test(tokenBase);
	const tokenUrl = canCreateToken ? tokenBase + "/user/" + encodeURIComponent((draft.username || "").trim() || "admin") + "/security/" : "";
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ModalPortal, {
		backdropClass: "dshj-json-backdrop",
		modalClass: "dshj-server-modal",
		onBackdropClose: onClose,
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
								tokenRequired ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshj-req",
									children: "*"
								}) : null,
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
							placeholder: draft.masked ? t("tokenSaved") + draft.masked : t("tokenPlaceholder"),
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
function PublishTab({ initialCwd, sessionId, run, poller, storage, workspaceItems, onCountChange, onFooter, onOpenLog }) {
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
		onFooter,
		onOpenLog
	})] });
}
function LauncherContent({ cwd, sessionId, config, run, poller, storage, onCountChange, onFooter, onOpenLog }) {
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
	const [inFlightList, setInFlightList] = (0, react.useState)([]);
	const loadInFlight = (0, react.useCallback)(() => {
		storage.readAllHistory(sessionId).then((h) => {
			setInFlightList((h || []).filter((e) => e.result == null && (e.queueId != null || e.buildNumber != null)));
		}).catch(() => void 0);
	}, [storage, sessionId]);
	(0, react.useEffect)(() => {
		loadInFlight();
	}, [loadInFlight]);
	(0, react.useEffect)(() => poller.subscribe(loadInFlight), [poller, loadInFlight]);
	const [servers, setServers] = (0, react.useState)([]);
	const [serverPool, setServerPool] = (0, react.useState)([]);
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
			const pool = matched.length ? matched : list;
			setServerPool(pool);
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
				const entryObj = {
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
				};
				const historyId = await storage.pushHistory(sessionId, cwd, entryObj);
				loadInFlight();
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
	const onlineConfigUrl = (0, react.useMemo)(() => {
		if (!selectedServer) return "";
		const base = (selectedServer.baseUrl || "").replace(/\/+$/, "");
		if (!selectedJobPath) return base;
		const segs = selectedJobPath.split("/").filter(Boolean).map((s) => encodeURIComponent(s));
		if (segs.length === 0) return base;
		return base + "/job/" + segs.join("/job/") + "/build";
	}, [selectedServer, selectedJobPath]);
	const footerNode = (0, react.useMemo)(() => {
		const publishLink = onlineConfigUrl ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
			className: "dshj-link-btn",
			href: onlineConfigUrl,
			target: "_blank",
			rel: "noopener noreferrer",
			children: [t("openOnlinePublish"), " ↗"]
		}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
			className: "dshj-link-btn dshj-link-btn-disabled",
			title: t("openOnlinePublishDisabled"),
			children: [t("openOnlinePublish"), " ↗"]
		});
		if (runState) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "dshj-btn",
				onClick: () => setRunState(null),
				children: t("backParams")
			}),
			publishLink,
			runState.phase === "done" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "dshj-btn dshj-btn-primary",
				onClick: stableSubmit,
				children: t("rebuild")
			}) : null
		] });
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
			selectedJobPath ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "dshj-link-btn",
				disabled: submitting,
				onClick: () => setParamsOpen(true),
				children: t("viewParams")
			}) : null,
			publishLink,
			selectedJobPath ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "dshj-btn dshj-btn-primary",
				disabled: submitting,
				onClick: stableSubmit,
				children: submitting ? t("submitting") : t("submit")
			}) : null
		] });
	}, [
		runState,
		selectedJobPath,
		submitting,
		stableSubmit,
		onlineConfigUrl
	]);
	(0, react.useEffect)(() => {
		onFooter?.(footerNode);
		return () => onFooter?.(null);
	}, [footerNode, onFooter]);
	const renderInFlight = (showHint) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "dshj-inflight",
		children: [
			showHint ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-select-hint",
				children: t("selectJobFirst")
			}) : null,
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-inflight-title",
				children: t("inFlightTitle")
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-inflight-list",
				children: inFlightList.map((e) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "dshj-inflight-item",
					title: t("inFlightHint"),
					onClick: () => {
						if (onOpenLog) onOpenLog(e);
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshj-inflight-main",
						children: e.job + (e.env ? " · " + e.env : "")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dshj-inflight-meta",
						children: [
							e.server ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshj-chip",
								children: e.server
							}) : null,
							e.buildNumber ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dshj-chip",
								children: ["#", e.buildNumber]
							}) : e.queueId ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dshj-chip",
								children: ["Q#", e.queueId]
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshj-history-result dshj-history-pending",
								children: t("historyPending")
							})
						]
					})]
				}, e.id))
			})
		]
	});
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
					className: "dshj-btn dshj-btn-small dshj-server-side",
					title: t("goAdd"),
					disabled: !!runState || submitting,
					onClick: () => setAddServerOpen(true),
					children: t("goAdd")
				})]
			})]
		}),
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
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-job-count dshj-server-side" + (selectedServer && !jobsLoading && !jobsError ? "" : " dshj-server-side-empty"),
					children: selectedServer && !jobsLoading && !jobsError ? t("jobCount", { n: jobs.length }) : ""
				})]
			})]
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "dshj-divider" }),
		runState ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
			runState.phase === "error" && runState.message ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-run-message dshj-err",
				children: runState.message
			}) : null,
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
			inFlightList.length > 0 ? renderInFlight(false) : runState.phase !== "done" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-empty",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dshj-spinner" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: t("submittedMsg") })]
			}) : null
		] }) : !selectedJobPath ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: inFlightList.length > 0 ? renderInFlight(true) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-empty",
			children: t("selectJobFirst")
		}) }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
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
					const descInControl = !p || p.type === "string" || p.type === "password" || p.type === "credentials" || p.type === "file" || p.type === "text" || p.type === "choice";
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
						searchPlaceholder: p && p.description ? p.description : t("pickerSearchPlaceholder"),
						options: (p.choices || []).map((c) => ({
							id: String(c),
							label: String(c)
						})),
						onChange: (id) => set(id)
					});
					else if (p && p.type === "text") control = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
						className: "dshj-textarea",
						rows: 3,
						placeholder: p && p.description ? p.description : void 0,
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
						placeholder: p && p.description ? p.description : void 0,
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
							p && p.description && !descInControl ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
		paramsOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ModalPortal, {
			backdropClass: "dshj-json-backdrop",
			modalClass: "dshj-json-modal",
			onBackdropClose: () => setParamsOpen(false),
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
* 「保存到工作区」：把当前格式模板写入「项目下拉框选中」的工作区根目录
* （host op saveTemplate）；默认选中当前工作区，可切换到任意已打开的项目，
* 避免在多项目场景下存错位置。目标文件已存在时先弹确认，确认后才覆盖。
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
function TemplateSection({ run, sessionId, cwd, workspaces }) {
	const [active, setActive] = (0, react.useState)("json");
	const [copied, setCopied] = (0, react.useState)(false);
	const [saving, setSaving] = (0, react.useState)(false);
	const [saved, setSaved] = (0, react.useState)(false);
	const [saveError, setSaveError] = (0, react.useState)("");
	const [confirmOverwrite, setConfirmOverwrite] = (0, react.useState)(false);
	const projects = (() => {
		const base = [...new Set((Array.isArray(workspaces) ? workspaces : []).filter((p) => typeof p === "string" && p !== ""))];
		if (cwd && base.indexOf(cwd) === -1) return [cwd].concat(base);
		return base.length ? base : cwd ? [cwd] : [];
	})();
	const [target, setTarget] = (0, react.useState)(() => {
		if (cwd && projects.indexOf(cwd) !== -1) return cwd;
		return projects.length ? projects[0] : "";
	});
	const tabs = [
		"json",
		"js",
		"ts"
	];
	const code = TEMPLATES[active] || "";
	const filename = "dsh-jenkins." + active;
	const doCopy = () => {
		const done = () => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		};
		if (navigator && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done).catch(() => fallbackCopy(code, done));
		else fallbackCopy(code, done);
	};
	const doSave = async (overwrite) => {
		if (!target || saving) return;
		setSaving(true);
		setSaveError("");
		setSaved(false);
		try {
			const res = await run(sessionId, {
				op: "saveTemplate",
				cwd: target,
				filename,
				content: code,
				overwrite
			});
			if (res && res.ok) {
				if (res.existed === true && !overwrite) setConfirmOverwrite(true);
				else {
					setSaved(true);
					setTimeout(() => setSaved(false), 1800);
				}
			} else setSaveError(tErr(res, t("saveFailed")));
		} catch (e) {
			setSaveError(e instanceof Error ? e.message : String(e));
		} finally {
			setSaving(false);
		}
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
							setSaved(false);
							setSaveError("");
						},
						children: tab
					}, tab))
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-template-project",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", { children: t("projectField") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineSelect, {
					value: target,
					placeholder: projects.length === 0 ? t("noWorkspacesHint") : t("projectPlaceholder"),
					searchPlaceholder: t("pickerSearchPlaceholder"),
					options: projects.map((p) => ({
						id: p,
						label: p
					})),
					disabled: projects.length === 0,
					onChange: (id) => setTarget(id)
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-hint",
				children: t("templateHint")
			}),
			saveError ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-err",
				style: { margin: "0 0 8px" },
				children: saveError
			}) : null,
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-code-head",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-code-file",
					children: filename
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-code-ops",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn dshj-btn-small",
						onClick: doCopy,
						children: copied ? t("copied") : t("copy")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn dshj-btn-small" + (saved ? " dshj-btn-success" : " dshj-btn-primary"),
						disabled: !target || saving,
						title: target ? t("saveToWorkspace") + " → " + target : t("noWorkspaceHint"),
						onClick: () => void doSave(false),
						children: saving ? t("savingToWorkspace") : saved ? t("savedToWorkspace") : t("saveToWorkspace")
					})]
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
				className: "dshj-code",
				children: code
			}),
			confirmOverwrite ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ModalPortal, {
				backdropClass: "dshj-json-backdrop dshj-confirm-backdrop",
				modalClass: "dshj-confirm-modal",
				onBackdropClose: () => setConfirmOverwrite(false),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-modal-header",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-modal-title",
							children: t("overwriteConfirmTitle")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshj-modal-sub",
							children: [filename, target ? " → " + target : ""]
						})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshj-close",
							"aria-label": t("close"),
							title: t("close"),
							onClick: () => setConfirmOverwrite(false),
							children: "✕"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-modal-body",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-empty",
							children: t("overwriteConfirm", { name: filename })
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-modal-footer",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshj-btn",
							onClick: () => setConfirmOverwrite(false),
							children: t("cancelBtn")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshj-btn dshj-btn-solid",
							disabled: saving,
							onClick: () => {
								setConfirmOverwrite(false);
								doSave(true);
							},
							children: t("overwriteBtn")
						})]
					})
				]
			}) : null
		]
	});
}
//#endregion
//#region src/client/components/TemplateModal.tsx
/**
* dsh-jenkins —— 「项目配置」弹框：以弹框形式查看 dsh-Jenkins 配置模板（json / js / ts Tab）。
* 遮罩盖在主弹框之上（z-index 1100），点击遮罩或 ✕ 均可关闭弹框。
* 「保存到工作区」：把当前格式的模板写入「项目下拉框选中」的工作区根目录
* （默认当前工作区；文件已存在时先确认覆盖）。
*/
function TemplateModal({ run, sessionId, cwd, workspaces, onClose }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ModalPortal, {
		backdropClass: "dshj-json-backdrop",
		modalClass: "dshj-template-modal",
		onBackdropClose: onClose,
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
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TemplateSection, {
				run,
				sessionId,
				cwd,
				workspaces
			})
		})]
	});
}
//#endregion
//#region src/client/components/SettingsPage.tsx
/**
* dsh-jenkins —— 设置 → Jenkins 配置页：服务器管理（settings.section）。
* 新增 / 编辑服务器在独立弹框（ServerEditorModal）中操作，本页只负责列表与增删入口。
*/
function SettingsPage({ run, sessionId, cwd, workspaceItems, onCountChange }) {
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
			templateOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TemplateModal, {
				run,
				sessionId,
				cwd: cwd || "",
				workspaces: [...new Set((Array.isArray(workspaceItems) ? workspaceItems : []).map((w) => w && typeof w.path === "string" ? w.path : "").filter((p) => p !== ""))],
				onClose: () => setTemplateOpen(false)
			}) : null,
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
function escapeHtml$1(text) {
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
		const escaped = escapeHtml$1(clean);
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
//#region src/client/components/SvgIcons.tsx
/** 复制图标（两个重叠矩形）。 */
function SvgCopy({ size }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 16 16",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.4,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
			x: "5.5",
			y: "5.5",
			width: "8",
			height: "8",
			rx: "1.5"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10.5 5.5v-1A1.5 1.5 0 0 0 9 3h-4.5A1.5 1.5 0 0 0 3 4.5V9a1.5 1.5 0 0 0 1.5 1.5h1" })]
	});
}
/** 对勾图标（复制成功反馈）。 */
function SvgCheck({ size }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 16 16",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.8,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 8.5 6.5 12 13 4.5" })
	});
}
/** 进入全屏图标（四角向外）。 */
function SvgExpand({ size }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 16 16",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.5,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" })
	});
}
/** 退出全屏图标（四角向内）。 */
function SvgCompress({ size }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 16 16",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.5,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" })
	});
}
//#endregion
//#region src/client/components/BuildLogModal.tsx
/**
* dsh-jenkins —— 构建完整日志弹框：从历史条目点击打开，拉取 Jenkins consoleText 展示。
*
* 实时性：进行中（排队 / 构建中）的条目每 1 秒轮询一次日志自动刷新，构建结束后
* 自动停止轮询并做最后一次刷新（宿主当前无 socket 通道，1s 轮询是轻量替代；
* 轮询器订阅保证「排队 → 构建中 → 完成」状态切换能驱动日志刷新与按钮显隐）。
* footer 提供「终止」按钮（红色，两次点击确认，与设置页删除服务器同款交互），
* 排队阶段取消队列项、已开始则停止构建。
*/
const MAX_LOG_KB = 500;
const LOG_POLL_MS$1 = 1e3;
function BuildLogModal({ entry, run, sessionId, onClose, poller }) {
	const [loading, setLoading] = (0, react.useState)(true);
	const [log, setLog] = (0, react.useState)("");
	const [error, setError] = (0, react.useState)("");
	const [truncated, setTruncated] = (0, react.useState)(false);
	const [copied, setCopied] = (0, react.useState)(false);
	const [armCancel, setArmCancel] = (0, react.useState)(false);
	const [cancelling, setCancelling] = (0, react.useState)(false);
	const [cancelMsg, setCancelMsg] = (0, react.useState)("");
	const [cancelOk, setCancelOk] = (0, react.useState)(false);
	const [fullscreen, setFullscreen] = (0, react.useState)(false);
	const segments = (0, react.useMemo)(() => {
		if (Array.isArray(entry.segments) && entry.segments.length) return entry.segments;
		return (entry.job || "").split("/").filter(Boolean);
	}, [entry]);
	const [, setTick] = (0, react.useState)(0);
	(0, react.useEffect)(() => poller ? poller.subscribe(() => setTick((x) => x + 1)) : void 0, [poller]);
	const live = poller ? poller.getLive(entry.id) : void 0;
	const buildNumber = entry.buildNumber ?? live?.buildNumber ?? null;
	const buildNumberRef = (0, react.useRef)(buildNumber);
	buildNumberRef.current = buildNumber;
	const inFlight = live ? live.phase === "queued" || live.phase === "running" : entry.result == null && !!(buildNumber || entry.queueId);
	const inFlightRef = (0, react.useRef)(inFlight);
	inFlightRef.current = inFlight;
	const canCancel = inFlight && (!!buildNumber || !!entry.queueId);
	const aliveRef = (0, react.useRef)(true);
	const fetchingRef = (0, react.useRef)(false);
	const fetchLog = (0, react.useCallback)(async () => {
		const num = buildNumberRef.current;
		if (!num) {
			setLoading(false);
			return;
		}
		if (fetchingRef.current) return;
		fetchingRef.current = true;
		try {
			const res = await run(sessionId, {
				op: "buildLog",
				serverId: entry.serverId,
				segments,
				buildNumber: num
			});
			if (!aliveRef.current) return;
			if (res && res.ok) {
				setLog(String(res.log || ""));
				setTruncated(!!res.truncated);
				setError("");
			} else if (res && (res.notFound || res.code === "build-not-found")) {
				if (!inFlightRef.current) setError(tErr(res, t("logFailed")));
				else setError("");
			} else setError(tErr(res, t("logFailed")));
		} catch (e) {
			if (aliveRef.current) setError(e instanceof Error ? e.message : String(e));
		} finally {
			setLoading(false);
			fetchingRef.current = false;
		}
	}, [
		run,
		sessionId,
		entry.serverId,
		segments
	]);
	(0, react.useEffect)(() => {
		aliveRef.current = true;
		let timer;
		fetchLog();
		const tick = () => {
			if (inFlightRef.current) fetchLog();
			else {
				if (timer !== void 0) {
					clearInterval(timer);
					timer = void 0;
				}
				fetchLog();
			}
		};
		if (inFlightRef.current) timer = window.setInterval(tick, LOG_POLL_MS$1);
		return () => {
			aliveRef.current = false;
			if (timer !== void 0) clearInterval(timer);
		};
	}, [entry.id]);
	const codeRef = (0, react.useRef)(null);
	const stickRef = (0, react.useRef)(true);
	const onScroll = () => {
		const el = codeRef.current;
		if (!el) return;
		stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
	};
	(0, react.useEffect)(() => {
		const el = codeRef.current;
		if (el && stickRef.current) el.scrollTop = el.scrollHeight;
	}, [log]);
	const html = (0, react.useMemo)(() => ansiToHtml(log), [log]);
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(log);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {}
	};
	const doCancel = async () => {
		if (cancelling) return;
		setCancelling(true);
		setCancelMsg("");
		try {
			const res = await run(sessionId, {
				op: "cancel",
				serverId: entry.serverId,
				segments,
				buildNumber: buildNumberRef.current ?? void 0,
				queueId: entry.queueId ?? void 0
			});
			const ok = !!(res && res.ok);
			setCancelOk(ok);
			setCancelMsg(ok ? t("cancelRequested") : tErr(res, t("cancelFailed")));
			setArmCancel(false);
		} catch (e) {
			setCancelOk(false);
			setCancelMsg(e instanceof Error ? e.message : String(e));
		} finally {
			setCancelling(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ModalPortal, {
		backdropClass: "dshj-json-backdrop",
		modalClass: "dshj-log-modal" + (fullscreen ? " dshj-log-fullscreen" : ""),
		onBackdropClose: onClose,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-modal-header",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-title",
					children: [t("logTitle"), inFlight ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshj-log-live-tag",
						children: t("liveStatus")
					}) : null]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-sub",
					children: [
						entry.job,
						entry.buildNumber ? " #" + entry.buildNumber : "",
						entry.server ? " · " + entry.server : ""
					]
				})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-head-ops",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn-icon",
						"aria-label": fullscreen ? t("exitFullscreen") : t("enterFullscreen"),
						title: fullscreen ? t("exitFullscreen") : t("enterFullscreen"),
						onClick: () => setFullscreen((f) => !f),
						children: fullscreen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SvgCompress, { size: 15 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SvgExpand, { size: 15 })
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-close",
						"aria-label": t("close"),
						title: t("close"),
						onClick: onClose,
						children: "✕"
					})]
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
					ref: codeRef,
					className: "dshj-code dshj-log-code",
					onScroll,
					dangerouslySetInnerHTML: { __html: html }
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
					className: "dshj-code dshj-log-code",
					children: inFlight ? t("logWaiting") : t("logEmpty")
				}), truncated && !loading && !error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-log-truncated",
					children: t("logTruncated", { kb: MAX_LOG_KB })
				}) : null]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-modal-footer",
				children: [
					inFlight ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshj-log-live",
						children: t("liveStatus")
					}) : null,
					cancelMsg ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshj-log-cancel-msg " + (cancelOk ? "dshj-log-cancel-msg-ok" : "dshj-log-cancel-msg-err"),
						children: cancelMsg
					}) : null,
					canCancel ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn dshj-btn-small" + (armCancel || cancelling ? " dshj-btn-solid" : " dshj-btn-danger"),
						disabled: cancelling,
						onClick: () => {
							if (armCancel) doCancel();
							else setArmCancel(true);
						},
						children: cancelling ? t("cancelling") : armCancel ? t("confirmCancelBuild") : t("cancelBuild")
					}) : null,
					log ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn dshj-btn-small",
						onClick: () => void copy(),
						children: copied ? t("copied") : t("copy")
					}) : null,
					entry.url ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
						className: "dshj-btn dshj-btn-small dshj-link",
						href: entry.url,
						target: "_blank",
						rel: "noopener noreferrer",
						children: [t("openBuildPage"), " ↗"]
					}) : null
				]
			})
		]
	});
}
//#endregion
//#region src/client/components/HistoryTab.tsx
/**
* dsh-jenkins —— 统一弹框「历史」tab：聚合所有工作区最近 50 次发布，可按工作区筛选
* （默认全部）。进行中条目由全局轮询器实时回填结果。每条记录提供两个独立操作：
* 「查看详情」打开构建日志弹框、「打开原始任务」在浏览器中跳转 Jenkins 页面。
* 内容来自原「发布历史」弹框，去掉弹框外框，由 JenkinsConfigModal 提供容器。
*/
function HistoryTab({ cwd, sessionId, run, poller, storage, onCountChange, onFooter, logTarget: logTargetProp, onLogTargetChange }) {
	const [filter, setFilter] = (0, react.useState)("all");
	const [list, setList] = (0, react.useState)([]);
	const [localTarget, setLocalTarget] = (0, react.useState)(null);
	const logTarget = logTargetProp !== void 0 ? logTargetProp : localTarget;
	const setLogTarget = (e) => {
		if (logTargetProp !== void 0) {
			if (onLogTargetChange) onLogTargetChange(e);
		} else setLocalTarget(e);
	};
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
		let alive = true;
		storage.markAllHistoryRead(sessionId).catch(() => void 0).then(() => {
			if (!alive) return;
			reload();
			poller.refresh();
		});
		return () => {
			alive = false;
		};
	}, [
		reload,
		poller,
		storage,
		sessionId
	]);
	const wsPaths = [...new Set(list.map((e) => e.cwd).filter((p) => !!p))].sort();
	const wsOptions = [{
		id: "all",
		label: t("historyAll")
	}].concat(wsPaths.map((p) => ({
		id: p,
		label: p
	})));
	const filtered = filter === "all" ? list : list.filter((e) => e.cwd === filter);
	const PAGE_SIZE_OPTIONS = [
		10,
		20,
		50,
		100
	];
	const [page, setPage] = (0, react.useState)(1);
	const [pageSize, setPageSize] = (0, react.useState)(20);
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	(0, react.useEffect)(() => {
		setPage((p) => Math.min(p, totalPages));
	}, [totalPages, filter]);
	const changePageSize = (v) => {
		const n = Number(v);
		setPageSize(n > 0 ? n : 20);
		setPage(1);
	};
	const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
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
	const canOpenLog = (e) => !!e.serverId && !!(e.buildNumber || e.queueId);
	const [servers, setServers] = (0, react.useState)([]);
	(0, react.useEffect)(() => {
		let alive = true;
		run(sessionId, { op: "list" }).then((r) => {
			if (alive && r && r.ok) setServers(r.servers || []);
		}).catch(() => void 0);
		return () => {
			alive = false;
		};
	}, [run, sessionId]);
	const jobUrlOf = (e) => {
		if (e.url) return e.url;
		const s = servers.find((x) => x.id === e.serverId || e.server && x.name === e.server);
		if (!s) return "";
		const base = (s.baseUrl || "").replace(/\/+$/, "");
		const segs = Array.isArray(e.segments) && e.segments.length ? e.segments : (e.job || "").split("/").filter(Boolean);
		if (segs.length === 0) return "";
		const jobPart = segs.map((seg) => "/job/" + encodeURIComponent(seg)).join("");
		return e.buildNumber ? base + jobPart + "/" + e.buildNumber + "/" : base + jobPart;
	};
	const [copiedId, setCopiedId] = (0, react.useState)(null);
	const copyParams = async (e) => {
		if (!e.params) return;
		try {
			await navigator.clipboard.writeText(JSON.stringify(e.params, null, 2));
			setCopiedId(e.id);
			setTimeout(() => setCopiedId((cur) => cur === e.id ? null : cur), 1500);
		} catch {}
	};
	const [confirmClear, setConfirmClear] = (0, react.useState)(false);
	const doClear = () => {
		setConfirmClear(false);
		storage.clearHistory(sessionId, filter === "all" ? null : filter).then(reload);
	};
	const footerNode = (0, react.useMemo)(() => {
		if (filtered.length === 0) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: "dshj-btn dshj-btn-small dshj-btn-danger",
			onClick: () => setConfirmClear(true),
			children: t("historyClear")
		});
	}, [
		filtered.length,
		storage,
		sessionId,
		reload
	]);
	(0, react.useEffect)(() => {
		onFooter?.(footerNode);
		return () => onFooter?.(null);
	}, [footerNode, onFooter]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-server-field dshj-history-ws-field",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineSelect, {
				value: filter,
				placeholder: t("historyWsPlaceholder"),
				searchPlaceholder: t("historyWsPlaceholder"),
				options: wsOptions.map((o) => ({
					id: o.id,
					label: o.label
				})),
				onChange: (id) => setFilter(id)
			})
		}),
		filtered.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-empty",
			children: t("historyEmpty")
		}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-history-list",
			children: paged.map((e) => {
				const hasParams = !!e.params && Object.keys(e.params).length > 0;
				const paramsText = hasParams ? Object.keys(e.params).map((k) => k + "=" + String(e.params[k])).join(", ") : "";
				const jobUrl = jobUrlOf(e);
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-history-item",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshj-history-head",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshj-history-time",
									children: fmtTime(e.time)
								}),
								e.unread ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshj-unread-tag",
									children: t("unread")
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshj-history-result " + resultClass(e.result),
									children: e.result || t("historyPending")
								})
							]
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
								}) : e.queueId ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dshj-chip",
									children: ["Q#", e.queueId]
								}) : null,
								filter === "all" && e.cwd ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshj-chip dshj-chip-ws",
									children: e.cwd
								}) : null
							]
						}),
						hasParams ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshj-history-params-row",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dshj-history-params",
								title: paramsText,
								children: t("historyParams") + paramsText
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshj-btn-icon dshj-history-params-copy",
								title: copiedId === e.id ? t("copied") : t("copyParams"),
								onClick: () => void copyParams(e),
								children: copiedId === e.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SvgCheck, { size: 14 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SvgCopy, { size: 14 })
							})]
						}) : null,
						canOpenLog(e) || jobUrl ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshj-history-actions",
							children: [canOpenLog(e) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshj-btn dshj-btn-small",
								title: t("historyLogHint"),
								onClick: () => setLogTarget(e),
								children: t("viewFullLog")
							}) : null, jobUrl ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
								className: "dshj-btn dshj-btn-small dshj-link",
								href: jobUrl,
								target: "_blank",
								rel: "noopener noreferrer",
								children: [t("openOriginalJob"), " ↗"]
							}) : null]
						}) : null
					]
				}, e.id);
			})
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-pagination",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-pagination-info",
					children: t("paginationTotal", { n: filtered.length })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-pagination-size-label",
					children: t("paginationSize")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
					className: "dshj-select dshj-pagination-size",
					value: pageSize,
					title: t("paginationSize"),
					onChange: (ev) => changePageSize(ev.target.value),
					children: PAGE_SIZE_OPTIONS.map((n) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
						value: n,
						children: n
					}, n))
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dshj-btn dshj-btn-small",
					title: t("prevPage"),
					disabled: page <= 1,
					onClick: () => setPage((p) => Math.max(1, p - 1)),
					children: "‹"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-pagination-page",
					children: t("paginationPage", {
						cur: page,
						total: totalPages
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dshj-btn dshj-btn-small",
					title: t("nextPage"),
					disabled: page >= totalPages,
					onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
					children: "›"
				})
			]
		})] }),
		logTarget ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BuildLogModal, {
			entry: logTarget,
			run,
			sessionId,
			poller,
			onClose: () => setLogTarget(null)
		}) : null,
		confirmClear ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ModalPortal, {
			backdropClass: "dshj-json-backdrop dshj-confirm-backdrop",
			modalClass: "dshj-confirm-modal",
			onBackdropClose: () => setConfirmClear(false),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-modal-title",
						children: t("confirmClearTitle")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-modal-sub",
						children: t("historyTitle")
					})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-close",
						"aria-label": t("close"),
						title: t("close"),
						onClick: () => setConfirmClear(false),
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-modal-body",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-empty",
						children: filter === "all" ? t("confirmClearAll") : t("confirmClearCwd", { path: filter })
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-footer",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn",
						onClick: () => setConfirmClear(false),
						children: t("cancelBtn")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn dshj-btn-solid",
						onClick: doClear,
						children: t("confirmClear")
					})]
				})
			]
		}) : null
	] });
}
//#endregion
//#region src/client/components/ServerHistoryTab.tsx
/**
* dsh-jenkins —— 统一弹框「历史记录」tab：查看指定 Job 在 Jenkins 服务器上的真实构建记录
* （区别于「本机记录」tab 的本地发布历史）。
*
* 页面结构：服务器下拉 → Job 下拉 → 分割线 → 「日志记录」列表。每条记录展示
* 状态 / `#构建号 - 发布人 - 项目名称` / 时间 / 描述，点击任意记录打开「构建日志」弹框
* （复用 BuildLogModal）查看该次构建的完整日志（进行中的构建自动实时刷新、可终止）。
* 数据来自宿主 op jobHistory（Jenkins remote API：job/<path>/api/json?tree=builds[...]）。
*/
/** 去掉描述里的 HTML 标签（Jenkins build description 常含 <br> 等）。 */
const stripHtml = (s) => String(s || "").replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
/** displayName（如 "#359 - jason - app"）去掉前导 "#<number> - "，只留发布人/项目部分。 */
const displaySuffix = (name, number) => {
	const s = String(name || "").trim();
	if (number == null) return s;
	const m = s.match(new RegExp("^#" + number + "\\s*-\\s*(.*)$"));
	return m ? m[1] : s;
};
/** 记录名称：`#<id> - <发布人> - <项目名称>`（取自 Jenkins displayName，如 "#359 - jason - cxagroup-hr-portal-ui"）。 */
const nameText = (b) => {
	const num = b.number != null ? "#" + b.number : "#?";
	const suffix = displaySuffix(b.displayName, b.number);
	return suffix ? num + " - " + suffix : num;
};
function ServerHistoryTab({ run, sessionId, poller }) {
	const [servers, setServers] = (0, react.useState)([]);
	const [serverId, setServerId] = (0, react.useState)("");
	const [jobs, setJobs] = (0, react.useState)([]);
	const [jobsLoading, setJobsLoading] = (0, react.useState)(false);
	const [jobsError, setJobsError] = (0, react.useState)("");
	const [jobPath, setJobPath] = (0, react.useState)("");
	const [records, setRecords] = (0, react.useState)(null);
	const [loading, setLoading] = (0, react.useState)(false);
	const [error, setError] = (0, react.useState)("");
	const [logTarget, setLogTarget] = (0, react.useState)(null);
	const PAGE_SIZE_OPTIONS = [
		10,
		20,
		50,
		100
	];
	const [page, setPage] = (0, react.useState)(1);
	const [pageSize, setPageSize] = (0, react.useState)(20);
	const [search, setSearch] = (0, react.useState)("");
	const selectedServer = servers.find((s) => s.id === serverId) || null;
	(0, react.useEffect)(() => {
		let alive = true;
		run(sessionId, { op: "list" }).then((r) => {
			if (!alive) return;
			const list = r && r.ok ? r.servers || [] : [];
			setServers(list);
			if (list.length > 0) setServerId((cur) => cur || list[0].id);
		}).catch(() => void 0);
		return () => {
			alive = false;
		};
	}, [run, sessionId]);
	(0, react.useEffect)(() => {
		let alive = true;
		setJobs([]);
		setJobsError("");
		setJobPath("");
		setRecords(null);
		setError("");
		if (!servers.find((s) => s.id === serverId)) {
			setJobsLoading(false);
			return;
		}
		setJobsLoading(true);
		run(sessionId, {
			op: "jobs",
			serverId
		}).then((r) => {
			if (!alive) return;
			setJobsLoading(false);
			if (r && r.ok) setJobs((r.jobs || []).filter((j) => !j.folder));
			else setJobsError(r && r.error || t("jobsFailed"));
		}).catch(() => {
			if (alive) {
				setJobsLoading(false);
				setJobsError(t("jobsFailed"));
			}
		});
		return () => {
			alive = false;
		};
	}, [
		serverId,
		servers,
		run,
		sessionId
	]);
	(0, react.useEffect)(() => {
		let alive = true;
		setRecords(null);
		setError("");
		setPage(1);
		setSearch("");
		if (!servers.find((s) => s.id === serverId) || !jobPath) {
			setLoading(false);
			return;
		}
		setLoading(true);
		const segments = jobPath.split("/").filter(Boolean);
		run(sessionId, {
			op: "jobHistory",
			serverId,
			segments
		}).then((r) => {
			if (!alive) return;
			setLoading(false);
			if (r && r.ok) setRecords(r.builds || []);
			else {
				setRecords([]);
				setError(tErr(r, t("serverHistoryFailed")));
			}
		}).catch((e) => {
			if (alive) {
				setLoading(false);
				setRecords([]);
				setError(e instanceof Error ? e.message : String(e));
			}
		});
		return () => {
			alive = false;
		};
	}, [
		jobPath,
		serverId,
		servers,
		run,
		sessionId
	]);
	const statusText = (b) => b.building ? t("historyPending") : b.result || "—";
	const list = records || [];
	const filtered = (0, react.useMemo)(() => {
		const q = search.trim().toLowerCase();
		if (!q) return list;
		return list.filter((b) => {
			return [
				nameText(b),
				b.number != null ? "#" + b.number : "",
				statusText(b),
				b.result || "",
				stripHtml(b.description),
				b.displayName
			].join(" ").toLowerCase().indexOf(q) !== -1;
		});
	}, [list, search]);
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	(0, react.useEffect)(() => {
		setPage((p) => Math.min(p, totalPages));
	}, [totalPages, jobPath]);
	const changePageSize = (v) => {
		const n = Number(v);
		setPageSize(n > 0 ? n : 20);
		setPage(1);
	};
	const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
	const fmtTime = (ts) => {
		if (!ts) return "—";
		try {
			return new Date(ts).toLocaleString();
		} catch (e) {
			return String(ts);
		}
	};
	const resultClass = (b) => {
		if (b.building || b.result == null) return "dshj-history-pending";
		if (b.result === "SUCCESS") return "dshj-ok";
		if (b.result === "FAILURE" || b.result === "ABORTED") return "dshj-err";
		return "dshj-warn";
	};
	const descText = (b) => {
		const d = stripHtml(b.description);
		if (d) return d;
		return displaySuffix(b.displayName, b.number) || "—";
	};
	const openLog = (b) => {
		if (!selectedServer || !jobPath) return;
		setLogTarget({
			id: "srv-" + serverId + "-" + jobPath.replace(/[\\/]/g, "_") + "-" + b.number,
			time: b.timestamp || Date.now(),
			job: jobPath,
			server: selectedServer.name,
			serverId,
			segments: jobPath.split("/").filter(Boolean),
			buildNumber: b.number ?? void 0,
			result: b.building ? null : b.result,
			url: b.url || "",
			queueId: null,
			since: b.timestamp || Date.now()
		});
	};
	const serverOptions = (0, react.useMemo)(() => servers.map((s) => ({
		id: s.id,
		label: s.name
	})), [servers]);
	const jobOptions = (0, react.useMemo)(() => jobs.map((j) => ({
		id: j.path,
		label: j.path
	})), [jobs]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-server-field",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
				className: "dshj-server-label",
				children: t("serverField")
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-server-ctrl",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineSelect, {
					value: serverId,
					placeholder: t("noServersHint"),
					searchPlaceholder: t("pickerSearchPlaceholder"),
					options: serverOptions,
					disabled: servers.length === 0,
					onChange: (id) => setServerId(id)
				})
			})]
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-server-field",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
				className: "dshj-server-label",
				children: t("jobField")
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-server-ctrl",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineSelect, {
					value: jobPath,
					placeholder: !serverId ? t("jobPlaceholder") : jobsLoading ? t("jobsLoading") : jobsError ? t("jobsFailed") : jobs.length === 0 ? t("jobsEmpty") : t("jobPlaceholder"),
					searchPlaceholder: t("jobPlaceholder"),
					emptyText: jobsError ? t("jobsFailed") : t("jobsEmpty"),
					options: jobOptions,
					disabled: jobsLoading || !serverId,
					onChange: (id) => setJobPath(id)
				})
			})]
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "dshj-divider" }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-server-history-head",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-server-history-title",
				children: t("serverHistoryList")
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-server-history-search",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					className: "dshj-input",
					type: "text",
					value: search,
					placeholder: t("serverHistorySearchPlaceholder"),
					disabled: !serverId || !jobPath || loading || list.length === 0,
					onChange: (e) => setSearch(e.target.value)
				}), search ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dshj-server-history-clear",
					"aria-label": t("close"),
					title: t("close"),
					onClick: () => setSearch(""),
					children: "✕"
				}) : null]
			})]
		}),
		!serverId || !jobPath ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-empty",
			children: t("serverHistorySelectJob")
		}) : loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-empty",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dshj-spinner" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: t("serverHistoryLoading") })]
		}) : error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-empty",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-err",
				children: error
			})
		}) : list.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-empty",
			children: t("serverHistoryEmpty")
		}) : filtered.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-empty",
			children: t("serverHistoryNoMatch")
		}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshj-history-list",
			children: paged.map((b) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "dshj-history-item dshj-server-history-item",
				title: t("historyLogHint"),
				onClick: () => openLog(b),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-history-head",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-server-history-left",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshj-history-result " + resultClass(b),
							children: statusText(b)
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshj-server-history-name",
							children: nameText(b)
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshj-history-time",
						children: fmtTime(b.timestamp)
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-server-history-desc",
					children: descText(b)
				})]
			}, b.number))
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshj-pagination",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-pagination-info",
					children: t("paginationTotal", { n: filtered.length })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-pagination-size-label",
					children: t("paginationSize")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
					className: "dshj-select dshj-pagination-size",
					value: pageSize,
					title: t("paginationSize"),
					onChange: (ev) => changePageSize(ev.target.value),
					children: PAGE_SIZE_OPTIONS.map((n) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
						value: n,
						children: n
					}, n))
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dshj-btn dshj-btn-small",
					title: t("prevPage"),
					disabled: page <= 1,
					onClick: () => setPage((p) => Math.max(1, p - 1)),
					children: "‹"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshj-pagination-page",
					children: t("paginationPage", {
						cur: page,
						total: totalPages
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dshj-btn dshj-btn-small",
					title: t("nextPage"),
					disabled: page >= totalPages,
					onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
					children: "›"
				})
			]
		})] }),
		logTarget ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BuildLogModal, {
			entry: logTarget,
			run,
			sessionId,
			poller,
			onClose: () => setLogTarget(null)
		}) : null
	] });
}
//#endregion
//#region src/client/components/JenkinsConfigModal.tsx
/**
* dsh-jenkins —— 统一「Jenkins 配置」弹框（shell.overlay）：
* 侧边栏底部「Jenkins 配置」入口打开的单一弹框，四个 tab：
* - 发布：原「执行 Jenkins Job」弹框内容（服务器 / Job / 参数 / 触发 / 轮询状态）；
* - 配置：原设置页内容（服务器管理：增删改查 / 测试连接 / 项目配置弹框）；
* - 本机记录：原「发布历史」弹框内容（按工作区筛选 / 查看构建日志 / 清空）；
* - 历史记录：指定 Job 在 Jenkins 服务器上的真实构建记录（服务器 / Job 下拉 + 构建日志）。
*
* tab 按钮放在弹框标题右侧（标题栏内），压缩弹框高度。
* 当前工作区（cwd）与会话 id 由宿主 overlay 的 useWorkspaces / useSessions 推导，
* 四个 tab 共享同一份上下文。
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
	},
	{
		id: "serverHistory",
		label: t("tabServerHistory")
	}
];
function JenkinsConfigModal({ run, poller, storage, useOpen, close, useWorkspaces, useSessions }) {
	const open = useOpen();
	const [tab, setTab] = (0, react.useState)("publish");
	const [configCount, setConfigCount] = (0, react.useState)(0);
	const [historyCount, setHistoryCount] = (0, react.useState)(0);
	const [unreadCount, setUnreadCount] = (0, react.useState)(0);
	const [footerNode, setFooterNode] = (0, react.useState)(null);
	const [logTarget, setLogTarget] = (0, react.useState)(null);
	const openLog = (0, react.useCallback)((entry) => {
		setLogTarget(entry);
		setTab("history");
	}, []);
	(0, react.useEffect)(() => {
		if (tab !== "history") setLogTarget(null);
	}, [tab]);
	const prevOpenRef = (0, react.useRef)(open);
	(0, react.useEffect)(() => {
		if (open && !prevOpenRef.current) {
			setTab("publish");
			setLogTarget(null);
		}
		prevOpenRef.current = open;
	}, [open]);
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
		storage.readAllHistory(sessionId).then((h) => {
			const list = h || [];
			setHistoryCount(list.length);
			setUnreadCount(list.filter((e) => e.unread).length);
		}).catch(() => {});
	}, [open]);
	(0, react.useEffect)(() => {
		if (!open) return;
		return poller.subscribe(() => {
			storage.readAllHistory(sessionId).then((h) => {
				const list = h || [];
				setHistoryCount(list.length);
				setUnreadCount(list.filter((e) => e.unread).length);
			}).catch(() => {});
		});
	}, [open, poller]);
	if (!open) return null;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ModalPortal, {
		modalClass: "dshj-config-modal",
		onBackdropClose: close,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-modal-header dshj-config-header",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-config-title",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-modal-title",
							children: t("settingsNav")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshj-modal-sub",
							children: cwd || ""
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-tabs dshj-config-tabs",
						role: "tablist",
						children: TABS.map((item) => {
							const count = item.id === "config" ? configCount : item.id === "history" ? historyCount : 0;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "tab",
								"aria-selected": tab === item.id,
								className: "dshj-tab" + (tab === item.id ? " dshj-tab-active" : ""),
								onClick: () => setTab(item.id),
								children: [
									item.label,
									item.id === "history" && unreadCount > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshj-tab-dot",
										title: t("unreadCount", { n: unreadCount })
									}) : null,
									count > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshj-badge",
										children: count
									}) : null
								]
							}, item.id);
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-close",
						"aria-label": t("close"),
						title: t("close"),
						onClick: close,
						children: "✕"
					})
				]
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
						onFooter: reportFooter,
						onOpenLog: openLog
					})
				}) : tab === "config" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorBoundary, {
					label: "SettingsPage",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingsPage, {
						run,
						sessionId,
						cwd,
						workspaceItems,
						onCountChange: setConfigCount
					})
				}) : tab === "history" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorBoundary, {
					label: "HistoryTab",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryTab, {
						cwd,
						sessionId,
						run,
						poller,
						storage,
						onCountChange: setHistoryCount,
						onFooter: reportFooter,
						logTarget,
						onLogTargetChange: setLogTarget
					})
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorBoundary, {
					label: "ServerHistoryTab",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ServerHistoryTab, {
						run,
						sessionId,
						poller
					})
				})
			}),
			footerNode ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-modal-footer",
				children: footerNode
			}) : null
		]
	});
}
//#endregion
//#region src/client/components/PluginUpdateModal.tsx
/**
* dsh-jenkins —— 浏览器半边：插件「更新」交互（确认弹框 → 日志大弹框）。
*
* 点击 footer 按钮最右侧的「更新」胶囊（.dshj-capsule-wrap 热区）→ 确认弹框
* （展示新版本 / 当前版本与将要执行的 dsh CLI 更新命令）→ 点击「确认更新」→
* 打开**大日志弹框**：宿主后台执行 `dsh plugin --profile web update dsh-jenkins`，
* 本组件每 600ms 轮询 pluginUpdateStatus op 拉取累计输出与运行状态
* （running / done / exitCode），以深色终端面板实时展示详细日志（ANSI 渲染、
* 自动跟随底部）；结束后成功/失败着色提示，成功后触发一次 updateCheck 重查
* （宿主已使版本缓存失效），让「更新」胶囊消失。
*
* 弹框信息完整版：确认弹框带命令块；日志弹框标题下展示执行命令，状态行 + 终端
* 日志 + 复制按钮 + 完成提示（重启生效）+ 后台继续提示。
*/
const LOG_POLL_MS = 600;
/** 展示给用户的更新命令（与宿主 plugin-update.ts 的 spawn 参数一致）。 */
const UPDATE_COMMAND = "dsh plugin --profile web update dsh-jenkins";
/** 状态行文案与着色：running=转圈，成功=绿，失败=红。 */
function statusView(status) {
	if (status === null || status.running) return {
		text: t("updateRunning"),
		cls: ""
	};
	if (status.done && status.exitCode === 0) return {
		text: t("updateSuccess"),
		cls: "dshj-update-status-ok"
	};
	const code = status.exitCode === null ? "?" : String(status.exitCode);
	return {
		text: t("updateFailed", { code }) + (status.error ? `：${status.error}` : ""),
		cls: "dshj-update-status-err"
	};
}
/** 极简 HTML 转义（占位文案经转义后插入 pre）。 */
function escapeHtml(text) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
/** 更新交互弹框：按 store 的 UI 状态渲染确认弹框或日志大弹框（none 时不渲染）。 */
function PluginUpdateModal({ run, useUpdate, useUi, closeUi, onConfirm, recheck }) {
	const ui = useUi();
	const update = useUpdate();
	if (ui === "confirm") {
		const tip = update !== null ? t("updateConfirmMsg", {
			v: update.latest,
			c: update.current
		}) : "";
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ModalPortal, {
			backdropClass: "dshj-json-backdrop dshj-confirm-backdrop",
			modalClass: "dshj-modal-sm",
			onBackdropClose: closeUi,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshj-modal-title",
						children: t("updateConfirmTitle")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-close",
						"aria-label": t("close"),
						onClick: closeUi,
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-body",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: tip }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
						className: "dshj-code dshj-update-cmd",
						children: UPDATE_COMMAND
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-footer",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn",
						onClick: closeUi,
						children: t("cancelBtn")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn dshj-btn-primary",
						onClick: onConfirm,
						children: t("updateBtn")
					})]
				})
			]
		});
	}
	if (ui === "log") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UpdateLogDialog, {
		run,
		onClose: closeUi,
		recheck
	});
	return null;
}
/** 日志大弹框：标题（+运行标记）+ 执行命令副标题 + 状态行 / 终端日志 / 完成提示 + 复制 / 关闭。 */
function UpdateLogDialog({ run, onClose, recheck }) {
	const [status, setStatus] = (0, react.useState)(null);
	const [startError, setStartError] = (0, react.useState)("");
	const [copied, setCopied] = (0, react.useState)(false);
	const logRef = (0, react.useRef)(null);
	const recheckedRef = (0, react.useRef)(false);
	const lastLenRef = (0, react.useRef)(-1);
	const output = status?.output ?? "";
	const running = status === null || status.running;
	(0, react.useEffect)(() => {
		let cancelled = false;
		let stopped = false;
		run("", { op: "pluginUpdateStart" }).then((res) => {
			if (cancelled) return;
			if (!res || !res.ok) {
				setStartError(tErr(res, t("updateLogStartFailed")));
				stopped = true;
			}
		}).catch(() => {});
		const poll = async () => {
			if (stopped) return;
			try {
				const res = await run("", { op: "pluginUpdateStatus" });
				if (cancelled) return;
				const st = res.status;
				if (st === void 0 || typeof st !== "object") return;
				setStatus(st);
				if (st.done && st.exitCode === 0 && !recheckedRef.current) {
					recheckedRef.current = true;
					recheck();
				}
			} catch {}
		};
		poll();
		const id = setInterval(() => {
			poll();
		}, LOG_POLL_MS);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, [run, recheck]);
	(0, react.useEffect)(() => {
		const el = logRef.current;
		if (el === null) return;
		if (running) el.scrollTop = el.scrollHeight;
		else if (output.length !== lastLenRef.current) {
			el.scrollTop = el.scrollHeight;
			lastLenRef.current = output.length;
		}
	}, [output, running]);
	const st = statusView(status);
	const html = (0, react.useMemo)(() => {
		if (output.length === 0) return escapeHtml(t("updateNoOutput"));
		return ansiToHtml(output);
	}, [output]);
	const copy = (0, react.useCallback)(async () => {
		try {
			await navigator.clipboard.writeText(output);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {}
	}, [output]);
	const doneOk = !!(status && status.done && status.exitCode === 0);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ModalPortal, {
		backdropClass: "dshj-json-backdrop dshj-confirm-backdrop",
		modalClass: "dshj-modal-log",
		onBackdropClose: onClose,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-modal-header",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshj-modal-title",
					children: [t("updateLogTitle"), running && !startError ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshj-log-live-tag",
						children: t("liveStatus")
					}) : null]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-modal-sub dshj-update-cmd-sub",
					children: UPDATE_COMMAND
				})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dshj-close",
					"aria-label": t("close"),
					onClick: onClose,
					children: "✕"
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshj-modal-body",
				children: startError ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshj-empty",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-err",
						children: startError
					})
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshj-update-status" + (st.cls !== "" ? " " + st.cls : ""),
						children: [running ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshj-spinner-inline",
							"aria-hidden": "true"
						}) : null, st.text]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
						ref: logRef,
						className: "dshj-update-log",
						"aria-label": t("updateLogTitle"),
						dangerouslySetInnerHTML: { __html: html }
					}),
					running ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshj-hint",
						children: t("updateBgHint")
					}) : null
				] })
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshj-modal-footer",
				children: [
					doneOk ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshj-update-hint",
						children: t("updateRestartHint")
					}) : null,
					output.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn dshj-btn-small",
						onClick: () => void copy(),
						children: copied ? t("copied") : t("copy")
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshj-btn dshj-btn-small",
						onClick: onClose,
						children: t("close")
					})
				]
			})
		]
	});
}
//#endregion
//#region src/client/plugin.tsx
/** 侧边栏 footer 插槽 key 与本插件入口 id。 */
const FOOTER_SLOT = "sidebar.footer.action";
const FOOTER_ENTRY_ID = "dsh-jenkins";
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
			const updateModalStore = makeUpdateModalStore();
			const slots = ctx.get("slots");
			if (slots === void 0) return;
			injectStyles();
			const storage = createStorage(run);
			const sessionRef = { current: "" };
			const getSession = () => sessionRef.current;
			const poller = createPoller(run, storage, getSession);
			ctx.interval(() => poller.tick(), 3e3);
			poller.refresh();
			const recheckUpdate = () => {
				run(getSession() || "", { op: "updateCheck" }).then((res) => {
					const raw = res.update;
					if (raw !== null && typeof raw === "object" && typeof raw.hasUpdate === "boolean") updateModalStore.setUpdate({
						current: String(raw.current ?? ""),
						latest: String(raw.latest ?? ""),
						hasUpdate: raw.hasUpdate === true
					});
				}).catch(() => {});
			};
			recheckUpdate();
			ctx.interval(() => recheckUpdate(), 3e5);
			try {
				slots.inject("conversation.chat.commandview", () => slots.register({
					name: "conversation.chat.commandview",
					key: "dsh-jenkins",
					priority: 0
				}, () => null));
			} catch {}
			slots.inject(FOOTER_SLOT, () => slots.register({
				name: FOOTER_SLOT,
				id: FOOTER_ENTRY_ID,
				order: 20
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FooterButton, {
				onOpen: () => configStore.open(true),
				reportSession: (s) => {
					if (s) sessionRef.current = s;
				},
				wide: props.wide,
				useSessions: props.useSessions,
				poller,
				useUpdate: updateModalStore.useUpdate,
				onUpdateRequest: () => updateModalStore.openUpdateConfirm()
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
			slots.inject("shell.overlay", () => slots.register({
				name: "shell.overlay",
				id: "dsh-jenkins-update",
				order: 200
			}, () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PluginUpdateModal, {
				run,
				useUpdate: updateModalStore.useUpdate,
				useUi: updateModalStore.useUpdateUi,
				closeUi: updateModalStore.closeUpdateUi,
				onConfirm: () => {
					updateModalStore.closeUpdateUi();
					updateModalStore.openUpdateLog();
				},
				recheck: recheckUpdate
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