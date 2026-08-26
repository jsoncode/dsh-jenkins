/**
 * dsh-jenkins —— 浏览器半边：样式注入（与 dsh-balance 相同的 bundle CSS 注入模式）。
 */

const CSS_ID = 'dsh-jenkins/settings.css'

export const css = [
  // 通用
  '.dshj-btn{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 14px;font-size:13px;cursor:pointer}',
  '.dshj-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}',
  '.dshj-btn:disabled{opacity:.5;cursor:not-allowed}',
  // 磨砂玻璃按钮：主色改为半透明填充 + 背后内容高斯模糊（backdrop-filter），避免完全遮盖底层内容
  // 填充按钮：更低的基础不透明度（58%），hover 仅 +6 个百分点，避免背景过深压过文字
  '.dshj-btn-primary{--dshj-glass-fill:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3));background:color-mix(in srgb,var(--dshj-glass-fill) 58%,transparent);border-color:transparent;color:var(--dsw-alias-label-primary-foreground,#fff);-webkit-backdrop-filter:blur(10px) saturate(1.4);backdrop-filter:blur(10px) saturate(1.4)}',
  '.dshj-btn-primary:hover:not(:disabled){background:color-mix(in srgb,var(--dshj-glass-fill) 64%,transparent)}',
  '.dshj-head-ops{display:flex;align-items:center;gap:8px;flex:none}',
  '.dshj-btn-icon{border:none;background:transparent;color:var(--dsw-alias-label-secondary,#888);width:24px;height:24px;padding:0;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}',
  '.dshj-btn-icon:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));color:var(--dsw-alias-label-primary,#222)}',
  '.dshj-btn-danger{color:var(--dsw-alias-state-error-primary);border-color:currentColor}',
  '.dshj-btn-success{color:var(--dsw-alias-state-success-primary,#2a7d3c);border-color:currentColor;background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 10%,transparent)}',
  '.dshj-btn-success:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 16%,transparent)}',
  // 磨砂玻璃按钮：危险实心按钮同样半透明化 + 高斯模糊
  '.dshj-btn-solid{--dshj-glass-fill:var(--dsw-alias-state-error-primary,#d33);background:color-mix(in srgb,var(--dshj-glass-fill) 58%,transparent);border-color:transparent;color:#fff;-webkit-backdrop-filter:blur(10px) saturate(1.4);backdrop-filter:blur(10px) saturate(1.4)}',
  '.dshj-btn-solid:hover:not(:disabled){background:color-mix(in srgb,var(--dshj-glass-fill) 64%,transparent)}',
  '.dshj-btn-small{padding:3px 10px;font-size:12px}',
  '.dshj-btn-active{border-color:var(--dsw-alias-brand-primary,#1668e3);color:var(--dsw-alias-brand-primary,#1668e3)}',
  '.dshj-err{color:var(--dsw-alias-state-error-primary,#d33);font-size:13px;margin:8px 0}',
  '.dshj-ok{color:var(--dsw-alias-state-success-primary,#2a7d3c);font-size:13px;margin:8px 0}',
  '.dshj-warn{color:var(--dsw-alias-state-warn-primary,#b8860b)}',
  '.dshj-empty{padding:28px 16px;text-align:center;color:var(--dsw-alias-label-secondary,#888);font-size:13px}',
  '.dshj-input,.dshj-select,.dshj-textarea{width:100%;box-sizing:border-box;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 86%,transparent);color:var(--dsw-alias-label-primary,#222);border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:8px;padding:8px 12px;font-size:13px;font-family:inherit;transition:border-color .15s,box-shadow .15s,background .15s;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}',
  '.dshj-input:hover,.dshj-select:hover,.dshj-textarea:hover{border-color:var(--dsw-alias-border-l3,#b8b8b8)}',
  '.dshj-input:focus,.dshj-select:focus,.dshj-textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary,#1668e3);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 18%,transparent)}',
  '.dshj-input::placeholder,.dshj-textarea::placeholder{color:var(--dsw-alias-label-tertiary,#aaa)}',
  '.dshj-textarea{min-height:72px;resize:vertical;line-height:1.5}',
  '.dshj-select{cursor:pointer;appearance:none;-webkit-appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--dsw-alias-label-secondary,#888) 50%),linear-gradient(135deg,var(--dsw-alias-label-secondary,#888) 50%,transparent 50%);background-position:calc(100% - 16px) 50%,calc(100% - 11px) 50%;background-size:5px 5px;background-repeat:no-repeat;padding-right:28px}',
  '.dshj-field{margin-bottom:12px}',
  '.dshj-field>label{display:block;font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666);margin-bottom:4px}',
  '.dshj-field>.dshj-label-row{display:flex;align-items:center;justify-content:space-between;gap:8px}',
  '.dshj-form-grid{display:grid;grid-template-columns:1fr;gap:14px 0;margin-top:10px}',
  // 表单行：左 label 定宽右对齐，右控件 minmax(0,1fr) 铺满（等价 flex:1 + width:0，防内容撑破）
  '.dshj-form-field{display:grid;grid-template-columns:168px minmax(0,1fr);align-items:center;gap:4px 10px}',
  '.dshj-form-field>.dshj-input,.dshj-form-field>.dshj-select,.dshj-form-field>.dshj-textarea{width:100%;min-width:0}',
  '.dshj-form-label{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666);text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:default}',
  '.dshj-form-desc{grid-column:2;font-size:12px;color:var(--dsw-alias-label-secondary,#888);line-height:1.5;word-break:break-word}',
  '.dshj-req{color:var(--dsw-alias-state-error-primary,#d33);margin-left:2px}',
  '.dshj-check{display:inline-flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;user-select:none}',
  '.dshj-check input[type=checkbox]{width:15px;height:15px;margin:0;accent-color:var(--dsw-alias-brand-primary,#1668e3);cursor:pointer}',
  '.dshj-link-btn{border:none;background:transparent;color:var(--dsw-alias-brand-primary,#1668e3);font-size:13px;cursor:pointer;padding:6px 10px;border-radius:6px;text-decoration:none}',
  '.dshj-link-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));text-decoration:underline}',
  '.dshj-link-btn:disabled{opacity:.5;cursor:not-allowed}',
  '.dshj-link-btn-disabled{opacity:.5;cursor:not-allowed;text-decoration:none}',
  // 长横线 label（如 "---"）渲染的虚线分割线：与「Job 列表」下方分割线同风格，备注文本居中
  '.dshj-form-divider{display:flex;align-items:center;gap:10px;margin:16px 0 6px}',
  '.dshj-form-divider::before,.dshj-form-divider::after{content:"";flex:1;height:0;border-top:1px dashed var(--dsw-alias-border-l3,#bbb)}',
  '.dshj-form-divider-text{font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70%}',
  // 侧边栏底部入口：样式对齐 DSH 设置按钮（sidebar.settings 的 trigger）——
  // 高 42px（窄栏 36px）、字号 14px/行高 22px、宽模式左对齐、图标 + 文字（仅宽模式显示文字）
  '.dshj-footer-btn{box-sizing:border-box;cursor:pointer;width:calc(100% + 4px);height:42px;color:var(--dsw-alias-label-primary);background:transparent;border:none;border-radius:12px;flex:none;align-items:center;gap:8px;margin:4px -2px;padding:0 10px 0 8px;font-family:inherit;font-size:14px;line-height:22px;display:flex;overflow:hidden}',
  '.dshj-footer-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}',
  '.dshj-footer-btn-rail{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;margin:8px 0 10px;padding:0}',
  // 显示【有更新】胶囊时（宽模式）：给按钮右侧补内边距，文字不再延伸到胶囊下方被覆盖
  // （胶囊绝对定位于按钮右侧 right:10px，宽约 40px；60px 足够让出并留出呼吸间距）
  '.dshj-footer-btn-has-update{padding-right:60px}',
  '.dshj-footer-group{width:100%;min-width:0;position:relative}',
  '.dshj-footer-rail-group{width:auto;display:flex;flex-direction:column;align-items:center}',
  // 图标：28px 圆形 Jenkins 红底徽标（object-fit:contain 保持 SVG 比例居中，透明区透出红底）；
  // pointer-events:none 使右键穿透到父按钮，图片不响应指针事件 —— 浏览器不再出现「保存图片」菜单
  '.dshj-footer-logo{height:28px;width:28px;flex:none;display:block;object-fit:contain;background:color-mix(in srgb,#D33833 74%,transparent);border-radius:50%;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);pointer-events:none}',
  '.dshj-footer-label{white-space:nowrap;overflow:hidden}',
  // 按钮右侧任务状态小胶囊：宽模式绝对定位在按钮右侧垂直居中（按钮右侧空白区，不遮挡文字）；
  // 窄栏（rail）无横向空间，改为堆叠在圆形图标下方居中
  '.dshj-footer-caps{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:4px;z-index:2;pointer-events:none}',
  '.dshj-footer-rail-group .dshj-footer-caps{position:static;transform:none;justify-content:center;margin-top:-4px}',
  '.dshj-capsule{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;border-radius:999px;font-size:10px;line-height:1;font-weight:700;font-variant-numeric:tabular-nums;box-sizing:border-box;white-space:nowrap}',
  // 构建中：GitHub Action 构建中的琥珀橙（深色文字保证对比度）
  '.dshj-capsule-building{color:#4a3500;background:#f0b429;border:1px solid color-mix(in srgb,#f0b429 60%,#fff)}',
  // 构建成功（未读）：绿色实心胶囊，打开「历史」tab 后随未读清除而消失
  '.dshj-capsule-done{color:#fff;background:var(--dsw-alias-state-success-primary,#2a7d3c);border:1px solid color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 75%,#fff)}',
  // 有更新：蓝色实心文字胶囊，位于状态胶囊组最右侧（registry 出现比本地更新的 dsh-jenkins 时显示）
  '.dshj-capsule-update{color:#fff;background:var(--dsw-alias-state-info-primary,#2563eb);border:1px solid color-mix(in srgb,var(--dsw-alias-state-info-primary,#2563eb) 75%,#fff);font-weight:600}',
  // 更新胶囊点击热区：与胶囊等宽（视觉不变）、纵向撑满 footer 按钮高度，放大点击区域；
  // 外层胶囊容器 pointer-events:none（点击穿透给下方配置按钮），热区自身恢复 auto ——
  // 点击热区任意位置触发更新确认，不再穿透到配置按钮
  '.dshj-capsule-wrap{display:inline-flex;align-items:center;justify-content:center;width:auto;height:42px;padding:0;margin:0;border:none;background:transparent;color:inherit;font:inherit;cursor:pointer;pointer-events:auto;flex:none;box-sizing:border-box;border-radius:999px}',
  '.dshj-footer-rail-group .dshj-capsule-wrap{height:24px}',
  // 宿主 sidebar.footer.action 列表容器：slots 渲染器为每个插槽输出稳定的
  // [data-slot] 锚点（display:contents，不参与布局），其父容器即宿主的
  // footer 行容器。宿主默认 flex 行布局会把多个插件注册的按钮挤在一行，
  // 这里改为纵向堆叠：每个按钮独占一行、按注册 order 升序排列。
  'div:has(> [data-slot="sidebar.footer.action"]){flex-direction:column}',
  // 弹框
  // 弹框遮罩与弹框本体：半透明 + 高斯模糊（毛玻璃），背景内容隐约可见而非被完全覆盖
  '.dshj-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.32);z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;pointer-events:auto;-webkit-backdrop-filter:blur(12px) saturate(1.2);backdrop-filter:blur(12px) saturate(1.2)}',
  '.dshj-modal{background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 78%,transparent);border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.28);width:720px;max-width:100%;min-height:400px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;color:var(--dsw-alias-label-primary,#222);font-size:14px;-webkit-backdrop-filter:blur(24px) saturate(1.5);backdrop-filter:blur(24px) saturate(1.5)}',
  '.dshj-modal-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);flex:none}',
  '.dshj-modal-title{font-size:15px;font-weight:600}',
  '.dshj-modal-sub{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:2px;word-break:break-all}',
  '.dshj-close{border:none;background:transparent;color:var(--dsw-alias-label-secondary,#888);font-size:16px;cursor:pointer;padding:4px 8px;border-radius:6px}',
  '.dshj-close:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));color:var(--dsw-alias-label-primary,#222)}',
  '.dshj-tabs{display:flex;gap:6px;padding:10px 18px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);overflow-x:auto;flex:none}',
  // 未选中 tab：淡淡的半透明填充 + 描边，突出按钮轮廓；选中 tab 为蓝色玻璃底（无描边）
  '.dshj-tab{padding:5px 12px;border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 40%,transparent);color:var(--dsw-alias-label-secondary,#666);font-size:13px;cursor:pointer;white-space:nowrap}',
  // 非选中 tab 才用灰色 hover（加深填充 + 描边）；选中 tab 有专属的轻微 hover（否则 :hover 特异性更高会盖掉蓝色玻璃底）
  '.dshj-tab:not(.dshj-tab-active):hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));border-color:var(--dsw-alias-border-l3,#b8b8b8)}',
  '.dshj-tab-active{--dshj-glass-fill:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3));background:color-mix(in srgb,var(--dshj-glass-fill) 58%,transparent);color:var(--dsw-alias-label-primary-foreground,#fff);border-color:transparent;font-weight:500;-webkit-backdrop-filter:blur(10px) saturate(1.4);backdrop-filter:blur(10px) saturate(1.4)}',
  '.dshj-tab-active:hover{background:color-mix(in srgb,var(--dshj-glass-fill) 64%,transparent)}',
  '.dshj-badge{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;margin-left:6px;border-radius:999px;font-size:11px;line-height:1;font-weight:600;background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));color:var(--dsw-alias-label-secondary,#666)}',
  '.dshj-tab-active .dshj-badge{background:color-mix(in srgb,var(--dsw-alias-label-primary-foreground,#fff) 68%,transparent);color:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3))}',
  // 「历史」tab 未读指示点：存在发布后未查看的条目时显示在 tab 文字旁
  '.dshj-tab-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-brand-primary,#1668e3);margin-left:6px;vertical-align:1px;flex:none}',
  '.dshj-tab-active .dshj-tab-dot{background:var(--dsw-alias-label-primary-foreground,#fff)}',
  '.dshj-server-field{display:grid;grid-template-columns:168px minmax(0,1fr);align-items:center;gap:10px;padding:10px 18px 0;flex:none}',
  '.dshj-server-label{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666);text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.dshj-server-ctrl{display:flex;align-items:center;gap:8px;min-width:0}',
  '.dshj-server-ctrl .dshj-combo{flex:1;min-width:0}',
  // 「发布」tab 服务器 / Job 行：右侧按钮与文案区固定 120px 等宽，两行下拉框因此完全等宽
  '.dshj-server-side{flex:none;width:120px;box-sizing:border-box;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.dshj-server-side.dshj-btn{padding-left:4px;padding-right:4px}',
  '.dshj-server-side.dshj-job-count{display:inline-flex;align-items:center;justify-content:center;margin:0;font-size:12px;color:var(--dsw-alias-label-secondary,#888)}',
  '.dshj-server-side-empty{color:var(--dsw-alias-label-tertiary,#aaa)}',
  '.dshj-divider{border-top:1px dashed var(--dsw-alias-border-l3,#bbb);margin:14px 18px 2px;flex:none}',
  '.dshj-picker{display:flex;align-items:center;gap:8px;width:100%;height:34px;padding:0 12px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 74%,transparent);color:var(--dsw-alias-label-primary,#222);font-size:13px;font-family:inherit;cursor:pointer;transition:border-color .15s,box-shadow .15s;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}',
  '.dshj-picker:hover:not(:disabled){border-color:var(--dsw-alias-border-l3,#b8b8b8)}',
  '.dshj-picker:focus{outline:none;border-color:var(--dsw-alias-brand-primary,#1668e3);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 18%,transparent)}',
  '.dshj-picker:disabled{opacity:.5;cursor:not-allowed}',
  '.dshj-picker-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}',
  '.dshj-picker-empty .dshj-picker-value{color:var(--dsw-alias-label-tertiary,#aaa)}',
  '.dshj-picker-caret{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary,#888)}',
  // antd Select 风格的内联下拉（InlineSelect）：触发器复用 .dshj-picker，面板贴触发器下方展开
  '.dshj-combo{position:relative;min-width:0}',
  '.dshj-combo .dshj-picker{width:100%}',
  // 下拉面板：毛玻璃化，展开时不完全遮住下方内容
  '.dshj-combo-panel{position:fixed;z-index:2000;display:flex;flex-direction:column;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#fff) 82%,transparent);border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);overflow:hidden;-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5)}',
  '.dshj-combo-search{padding:8px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);flex:none}',
  '.dshj-combo-search .dshj-input{padding:6px 10px;font-size:13px}',
  '.dshj-combo-list{flex:1;min-height:0;overflow-y:auto;padding:4px}',
  '.dshj-combo-item{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;text-align:left;padding:7px 10px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#222);font-size:13px;cursor:pointer;font-family:inherit}',
  '.dshj-combo-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}',
  '.dshj-combo-item-active{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}',
  '.dshj-combo-item-selected{color:var(--dsw-alias-brand-primary,#1668e3);font-weight:500}',
  '.dshj-combo-check{flex:none;font-size:12px}',
  '.dshj-combo-empty{padding:14px;text-align:center;color:var(--dsw-alias-label-tertiary,#999);font-size:13px}',
  // JSON 弹框：就地渲染（不 portal），遮罩盖在主弹框之上，点击只关 JSON 弹框、不影响主弹框。
  // body 改 flex 列 + 隐藏溢出、代码区 flex:1 独占滚动：避免 body 与 pre 出现双滚动条
  '.dshj-json-backdrop{z-index:1100}',
  '.dshj-json-modal{width:min(620px,100%);height:min(72vh,520px);min-height:360px}',
  '.dshj-json-modal .dshj-modal-body{display:flex;flex-direction:column;overflow:hidden;padding:14px 16px}',
  '.dshj-json-modal .dshj-code{flex:1;min-height:0;max-height:none;margin:0}',
  // 清空历史确认弹框：小号宽度，层级高于日志/JSON 弹框，避免叠放时被遮挡；
  // 覆盖基础弹框的 min-height:400px 与空态大内边距，高度随内容自适应、更紧凑
  '.dshj-confirm-backdrop{z-index:1150}',
  '.dshj-confirm-modal{width:min(420px,100%);min-height:auto;height:auto}',
  '.dshj-confirm-modal .dshj-modal-body{padding:8px 18px 12px}',
  '.dshj-confirm-modal .dshj-empty{padding:8px 4px;text-align:left;font-size:13px;line-height:1.6;color:var(--dsw-alias-label-primary,#222)}',
  '.dshj-confirm-modal .dshj-modal-footer{padding:10px 18px}',
  // 「编辑 Jenkins 服务器」弹框：新增 / 编辑共用，宽度较窄，高度随内容自适应
  '.dshj-server-modal{width:min(480px,100%);max-height:80vh}',
  '.dshj-modal-body{flex:1;overflow-y:auto;padding:16px 18px;min-width:0;min-height:0}',
  // 弹框 footer：操作按钮区，右对齐、顶部细分隔线；flex:none 固定不随 body 滚动
  '.dshj-modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--dsw-alias-border-l1,#eee);flex:none;flex-wrap:wrap}',
  // 统一「Jenkins 配置」弹框（发布 / 配置 / 本机记录 / 历史记录 四 tab）：
  // 固定高度 640px（高屏不再随内容自适应），保留最大 80vh（矮屏回落）与最小 480px，body 内部滚动
  '.dshj-config-modal{width:min(880px,100%);height:640px;max-height:80vh;min-height:480px}',
  '.dshj-config-body{padding:14px 18px 18px}',
  // 原弹框内的 server-field / divider 自带左右内边距，嵌入统一弹框 body 后在此抵消，避免双重缩进
  '.dshj-config-body .dshj-server-field{padding:4px 0 0}',
  '.dshj-config-body .dshj-divider{margin:14px 0 2px}',
  // 历史 tab「工作区」筛选行：无 label，下拉占满整行（覆盖 .dshj-server-field 的两列 grid）
  '.dshj-config-body .dshj-history-ws-field{display:block;padding:4px 0 0}',
  '.dshj-config-body .dshj-history-ws-field .dshj-combo{width:100%}',
  // 「Jenkins 配置」弹框：tab 按钮移入标题栏右侧（标题与关闭按钮之间），压缩弹框高度。
  // 覆盖 .dshj-modal-header 的 space-between：标题块可收缩省略，tab 区 margin-left:auto 靠右。
  '.dshj-config-header{gap:12px}',
  '.dshj-config-title{min-width:0;flex:0 1 auto}',
  '.dshj-config-title .dshj-modal-sub{max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  // 覆盖 .dshj-tabs 的整行容器样式（padding / 下边框 / 内边距），改为标题栏内的紧凑胶囊行
  '.dshj-config-tabs{display:flex;align-items:center;gap:4px;margin-left:auto;padding:0;border-bottom:none;overflow:visible;flex:none}',
  '.dshj-config-tabs .dshj-tab{padding:4px 10px;font-size:12px}',
  // 「历史记录」tab：日志记录区标题行（标题 + 右侧模糊搜索框）+ 整卡可点击的记录卡片（复用 .dshj-history-item 卡片样式）
  '.dshj-server-history-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:14px 2px 0;flex:none}',
  '.dshj-server-history-title{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary,#666);flex:none}',
  '.dshj-server-history-search{position:relative;flex:1;max-width:300px;min-width:0}',
  '.dshj-server-history-search .dshj-input{height:26px;padding:3px 26px 3px 10px;font-size:12px;border-radius:6px}',
  '.dshj-server-history-search .dshj-input:disabled{opacity:.5;cursor:not-allowed}',
  '.dshj-server-history-clear{position:absolute;right:4px;top:50%;transform:translateY(-50%);border:none;background:transparent;color:var(--dsw-alias-label-secondary,#888);font-size:12px;line-height:1;padding:4px;border-radius:4px;cursor:pointer}',
  '.dshj-server-history-clear:hover{color:var(--dsw-alias-label-primary,#222);background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}',
  '.dshj-server-history-item{display:block;width:100%;text-align:left;font-family:inherit;color:inherit;cursor:pointer}',
  '.dshj-server-history-left{display:flex;align-items:center;gap:8px;flex:1;min-width:0}',
  '.dshj-server-history-name{font-size:13px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.dshj-server-history-desc{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:7px;line-height:1.5;word-break:break-all;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
  '.dshj-history-modal{min-height:420px;max-height:82vh;width:640px}',
  '.dshj-history-list{display:flex;flex-direction:column;gap:10px;padding:14px 2px 4px}',
  '.dshj-history-item{border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:10px;padding:10px 14px;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 64%,transparent);transition:border-color .15s,background .15s;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}',
  '.dshj-history-item:hover{border-color:var(--dsw-alias-border-l2,#ddd)}',
  // 历史条目操作按钮行：查看详情（打开日志弹框）/ 打开原始任务（浏览器跳转 Jenkins）
  '.dshj-history-actions{display:flex;align-items:center;gap:8px;margin-top:9px;flex-wrap:wrap}',
  // 历史列表分页条：共 N 条 · 每页条数切换 · 上一页/下一页
  '.dshj-pagination{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 2px 4px;flex:none;flex-wrap:wrap}',
  '.dshj-pagination-info{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-right:auto}',
  '.dshj-pagination-size-label{font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap}',
  '.dshj-pagination-size{width:72px;padding:4px 22px 4px 10px;font-size:12px;border-radius:6px}',
  '.dshj-pagination-page{font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap}',
  '.dshj-history-head{display:flex;align-items:center;justify-content:space-between;gap:8px}',
  '.dshj-history-time{font-size:12px;color:var(--dsw-alias-label-tertiary,#999)}',
  // 历史条目未读标记：蓝色小胶囊（带圆点），发布后未打开过「历史」tab 的条目显示
  '.dshj-unread-tag{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:var(--dsw-alias-brand-primary,#1668e3);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 10%,transparent);border-radius:999px;padding:1px 8px;flex:none;margin-right:auto}',
  '.dshj-unread-tag::before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor}',
  '.dshj-history-result{font-size:11px;font-weight:600;padding:2px 10px;border-radius:999px;white-space:nowrap;flex:none;margin:0}',
  '.dshj-history-result.dshj-ok{color:var(--dsw-alias-state-success-primary,#2a7d3c);background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 14%,transparent)}',
  '.dshj-history-result.dshj-err{color:var(--dsw-alias-state-error-primary,#d33);background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d33) 14%,transparent)}',
  '.dshj-history-result.dshj-warn{color:var(--dsw-alias-state-warn-primary,#b8860b);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b8860b) 14%,transparent)}',
  '.dshj-history-pending{color:var(--dsw-alias-state-warn-primary,#b8860b);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b8860b) 12%,transparent)}',
  '.dshj-history-main{font-size:13px;font-weight:600;margin-top:6px;word-break:break-all;transition:color .15s}',
  '.dshj-history-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}',
  '.dshj-chip{font-size:11px;color:var(--dsw-alias-label-secondary,#888);background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#f5f6f8) 60%,transparent);border:1px solid var(--dsw-alias-border-l1,#eee);padding:1px 9px;border-radius:999px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}',
  '.dshj-chip-ws{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}',
  // 参数行：文本省略 + 右侧「复制参数(JSON)」图标按钮
  '.dshj-history-params-row{display:flex;align-items:center;gap:4px;margin-top:7px;min-width:0}',
  '.dshj-history-params{flex:1;min-width:0;font-size:12px;color:var(--dsw-alias-label-tertiary,#999);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;word-break:keep-all;margin:0}',
  '.dshj-history-params-copy{flex:none;width:20px;height:20px;color:var(--dsw-alias-label-secondary,#888)}',
  '.dshj-history-params-copy:hover{color:var(--dsw-alias-brand-primary,#1668e3)}',
  '.dshj-history-params-copy.dshj-btn-icon{width:20px;height:20px;border-radius:5px}',
  // 构建日志弹框（宽度比 880px 的「Jenkins 配置」弹框小，居中时露出配置弹框边缘，避免完全重叠）
  '.dshj-log-modal{width:min(720px,100%);height:min(78vh,640px);min-height:420px}',
  // 插件更新弹框（对齐 dsh-get-balance「更新插件」弹框）：
  // 确认弹框 = 小尺寸（420px，自适应高度）；日志弹框 = 大尺寸（720px，最小 380px）
  '.dshj-modal-sm{width:min(420px,100%);min-height:0;max-height:60vh}',
  '.dshj-modal-log{width:min(720px,100%);min-height:380px}',
  '.dshj-modal-log .dshj-modal-body{display:flex;flex-direction:column}',
  // 更新日志：深色终端面板（等宽字体、可滚动、自动换行），与终端观感一致
  '.dshj-update-log{flex:1;min-height:0;overflow:auto;background:#0f1419;color:#d5d8dc;border:1px solid var(--dsw-alias-border-l2,#333);border-radius:8px;padding:10px 12px;margin:0 0 10px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-word}',
  // 更新状态行：运行中带转圈（默认灰），成功绿 / 失败红
  '.dshj-update-status{display:flex;align-items:center;gap:8px;font-size:12px;margin:0 0 10px;color:var(--dsw-alias-label-secondary,#888)}',
  '.dshj-update-status-ok{color:#16a34a}',
  '.dshj-update-status-err{color:var(--dsw-alias-state-error-primary,#d33)}',
  '.dshj-spinner-inline{width:12px;height:12px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2,#ccc);border-top-color:var(--dsw-alias-brand-primary,#1668e3);animation:dshj-spin .8s linear infinite;flex:none}',
  // 更新运行中提示（关闭弹框仍后台继续）
  '.dshj-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin:0 0 10px;line-height:1.5}',
  // 更新确认弹框中的待执行命令（等宽字体、深色底，与代码块一致；body 已有水平内边距，
  // 顶部 14px 与描述文案拉开间距）。双类选择器提升特异性：`.dshj-code` 定义在本文件
  // 更靠后，同优先级下会覆盖 margin，必须用更高特异性让间距生效。
  '.dshj-update-cmd.dshj-code{margin:14px 0 0;padding:8px 12px;max-height:none;white-space:pre-wrap;word-break:break-all}',
  '.dshj-update-cmd-sub{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;word-break:break-all}',
  // 更新完成提示（footer 左区，margin-right:auto 把按钮推到右侧）：重启 dsh 服务生效
  '.dshj-update-hint{margin-right:auto;font-size:12px;color:var(--dsw-alias-label-secondary,#888);display:inline-flex;align-items:center;gap:6px;flex:none}',
  // 网页全屏：fixed 铺满视口（相对 viewport 定位，不受遮罩 padding 影响），非系统全屏
  '.dshj-log-fullscreen{position:fixed;inset:0;width:auto;height:auto;max-width:none;max-height:none;min-height:0;border-radius:0;border:none;box-shadow:none}',
  '.dshj-log-fullscreen .dshj-modal-body{padding:14px 18px}',
  '.dshj-log-body{display:flex;flex-direction:column;overflow:hidden;padding:14px 16px}',
  '.dshj-log-body .dshj-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}',
  '.dshj-log-code{flex:1;min-height:0;max-height:none;margin:0;overflow:auto}',
  '.dshj-log-truncated{font-size:12px;color:var(--dsw-alias-state-warn-primary,#b8860b);margin-top:8px;flex:none}',
  // 实时刷新指示：footer 左侧（margin-right:auto 把操作按钮推到右侧）+ 标题内小胶囊
  '.dshj-log-live{margin-right:auto;font-size:12px;color:var(--dsw-alias-state-success-primary,#2a7d3c);display:inline-flex;align-items:center;gap:6px;flex:none}',
  '.dshj-log-live::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-state-success-primary,#2a7d3c);animation:dshj-live-pulse 1.2s ease-in-out infinite}',
  '@keyframes dshj-live-pulse{0%,100%{opacity:1}50%{opacity:.35}}',
  '.dshj-log-live-tag{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:var(--dsw-alias-state-success-primary,#2a7d3c);background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 12%,transparent);border-radius:999px;padding:1px 8px;margin-left:8px;vertical-align:1px}',
  '.dshj-log-cancel-msg{font-size:12px;margin-right:auto;flex:none;word-break:break-all}',
  '.dshj-log-cancel-msg-ok{color:var(--dsw-alias-state-success-primary,#2a7d3c)}',
  '.dshj-log-cancel-msg-err{color:var(--dsw-alias-state-error-primary,#d33)}',
  // 发布 tab「请先选择 Job」引导区：进行中任务简洁列表
  '.dshj-inflight{padding:16px 2px 4px}',
  '.dshj-select-hint{font-size:13px;color:var(--dsw-alias-label-secondary,#888);margin-bottom:6px}',
  '.dshj-inflight-title{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary,#666);margin:6px 0 8px}',
  '.dshj-inflight-list{display:flex;flex-direction:column;gap:8px}',
  '.dshj-inflight-item{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;padding:8px 12px;border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 64%,transparent);color:var(--dsw-alias-label-primary,#222);font-size:13px;font-family:inherit;cursor:pointer;transition:border-color .15s,background .15s;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}',
  '.dshj-inflight-item:hover{border-color:var(--dsw-alias-brand-primary,#1668e3);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 5%,color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 64%,transparent))}',
  '.dshj-inflight-main{font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.dshj-inflight-meta{display:flex;align-items:center;gap:6px;flex:none;max-width:45%;overflow:hidden}',
  '.dshj-inflight-meta .dshj-history-result{margin:0;flex:none}',
  '.dshj-inflight-meta .dshj-chip{flex:none}',
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
  '.dshj-card{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#fafafa) 64%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}',
  '.dshj-card-main{min-width:0}',
  '.dshj-card-name-row{display:flex;align-items:center;gap:8px;min-width:0}',
  '.dshj-card-name{font-size:13px;font-weight:600;flex:none}',
  '.dshj-card-test{margin:0;font-size:12px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}',
  '.dshj-card-meta{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:2px;word-break:break-all}',
  '.dshj-card-ops{display:flex;gap:6px;flex:none;flex-wrap:wrap}',
  '.dshj-result{font-size:12px;padding:8px 10px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#fafafa) 64%,transparent);margin-top:8px;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}',
  // 配置模板内联区
  '.dshj-template{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:12px 14px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#fafafa) 64%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}',
  '.dshj-template-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px}',
  '.dshj-template-title{font-size:13px;font-weight:600}',
  '.dshj-template-tabs{display:flex;gap:6px}',
  '.dshj-code-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}',
  '.dshj-code-ops{display:flex;align-items:center;gap:8px;flex:none}',
  '.dshj-code-file{font-size:12px;color:var(--dsw-alias-label-secondary,#888);font-family:ui-monospace,SFMono-Regular,Consolas,monospace}',
  '.dshj-code{margin:0;padding:12px 14px;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 84%,transparent);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;overflow:auto;max-height:52vh;font-size:12px;line-height:1.55;color:var(--dsw-alias-label-primary,#222);white-space:pre;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}',
  '.dshj-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-bottom:10px}',
  // 「项目配置」模板弹框：复用 JSON 弹框的覆盖层级，代码区占满并内部滚动
  '.dshj-template-modal{width:min(680px,100%);height:min(76vh,620px);min-height:420px}',
  '.dshj-template-modal .dshj-modal-body{display:flex;flex-direction:column;overflow:hidden}',
  '.dshj-template-modal .dshj-template{flex:1;min-height:0;display:flex;flex-direction:column;border:none;padding:0;background:transparent}',
  '.dshj-template-modal .dshj-template-head{flex:none}',
  '.dshj-template-modal .dshj-hint{flex:none}',
  '.dshj-template-modal .dshj-code-head{flex:none}',
  '.dshj-template-modal .dshj-code{flex:1;min-height:0;max-height:none}',
  // 降级兜底：引擎不支持 backdrop-filter 时恢复不透明填充，保证可读性
  '@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))){.dshj-modal,.dshj-combo-panel{background:var(--dsw-alias-bg-layer-1,#fff)}.dshj-history-item,.dshj-inflight-item,.dshj-picker,.dshj-code,.dshj-input,.dshj-select,.dshj-textarea{background:var(--dsw-alias-bg-base,#fff)}.dshj-card,.dshj-template,.dshj-result{background:var(--dsw-alias-bg-layer-2,#fafafa)}.dshj-chip{background:var(--dsw-alias-bg-layer-2,#f5f6f8)}.dshj-btn-primary,.dshj-btn-solid,.dshj-tab-active{background:var(--dshj-glass-fill)}.dshj-footer-logo{background:#D33833}}',
].join('\n')

/** 注入 <style>（幂等：已存在则不重复注入）。 */
export function injectStyles(): void {
  if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + CSS_ID + '"]') === null) {
    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-jenkins'
    tag.dataset.pluginCss = CSS_ID
    tag.textContent = css
    document.head.appendChild(tag)
  }
}
