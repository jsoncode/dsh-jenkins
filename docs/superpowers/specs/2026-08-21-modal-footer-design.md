# 弹框 Footer 统一改造设计

日期：2026-08-21
状态：已批准（用户确认按钮顺序「主操作靠右」与 `onFooter` 回调模式）

## 背景

当前各弹框的操作按钮位置不统一：

- ServerEditorModal：测试 / 保存 / 取消在可滚动 body 内（`.dshj-editor-ops`），内容多时按钮会滚出视口。
- BuildLogModal：底部操作行（复制 / 打开构建页）在 body 外，但复用 `.dshj-history-ops` 样式，不是真正的 footer。
- JenkinsConfigModal：本身无底部按钮，但发布 tab 的提交区、历史 tab 的清空按钮位于 tab 内容（可滚动 body）底部。
- TemplateModal：无操作按钮，不需要 footer。

目标：统一为「header（固定）/ body（flex:1 内部滚动）/ footer（操作按钮固定不滚动）」的结构。

## 目标结构

```
┌─ dshj-modal ───────────────┐
│  header（标题 + ✕，固定）     │
│  body（flex:1 + overflow-y 滚动）│  ← 内容过多时内部滚动
│  footer（操作按钮，固定不滚动）  │  ← 右对齐、顶部细分隔线
└────────────────────────────┘
```

## 1. CSS（styles.ts）

新增通用规则：

```css
.dshj-modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--dsw-alias-border-l1,#eee);flex:none;flex-wrap:wrap}
```

按钮统一右对齐，`flex:none` 保证 body 滚动时 footer 固定可见。

删除被替代的旧规则（改造后无引用）：

- `.dshj-editor-ops`（ServerEditorModal）
- `.dshj-form-ops`、`.dshj-submit-row`（PublishTab）
- `.dshj-history-ops`（HistoryTab + BuildLogModal）
- `.dshj-log-ops`（BuildLogModal）

## 2. ServerEditorModal

把 body 里的 `.dshj-editor-ops`（测试/保存/取消）整体移出 body，放到新 `<div className="dshj-modal-footer">`。

- 表单错误 / 测试结果提示保留在 body 内（属于表单反馈）。
- 按钮顺序按惯例改为主操作靠右：**[测试连接] [取消] [保存]**。

## 3. BuildLogModal

底部操作行 `<div className="dshj-history-ops dshj-log-ops">` 改为 `<div className="dshj-modal-footer">`（[复制] [打开构建页]，保持原按钮样式），body 内部滚动逻辑不变。

## 4. JenkinsConfigModal（tab 内按钮提升）

弹框新增 footer 区，内容由当前 tab 上报：

```tsx
const [footerNode, setFooterNode] = useState<ReactNode>(null)
...
{footerNode ? <div className="dshj-modal-footer">{footerNode}</div> : null}
```

- **发布 tab（PublishTab）**：提交按钮区移出 body 进 footer —— 表单态 **[查看参数] [触发构建]**；运行态 **[返回参数]（+[重新构建] 完成后）**。用 `useRef` 包装 `onSubmit` + `useMemo` 生成稳定的 footer 节点，避免 setState 循环。
- **历史 tab（HistoryTab）**：**[清空]** 按钮移入 footer（有历史时才显示）。
- **配置 tab（SettingsPage）**：无底部按钮，不渲染 footer。

上报机制（`onFooter` 回调）：

- 各 tab 在 `useEffect` 中上报 footer 节点，卸载（cleanup）时上报 `null`。
- footer 节点用 `useMemo` 保持引用稳定（依赖为实际状态值），父组件 setState 只在实际变化时触发，避免渲染循环。
- `onSubmit` 等每次渲染重建的函数用 `useRef` 提供稳定包装，参与 `useMemo` 依赖。

## 5. body 滚动

`.dshj-modal-body` 已具备 `flex:1; overflow-y:auto; min-height:0`，按钮移出后 body 滚动行为不变；构建日志 / 模板弹框保持内部滚动（`overflow:hidden` + 代码区滚动）不变。

## 6. 验证

- `npm run check`（tsc -b）无类型错误。
- `npm run build` 重建 lib 产物（lib/ 为提交产物，与上次会话一致）。
- 浏览器验证各弹框：footer 固定可见、body 内容过多时可滚动、tab 切换 footer 正确切换。

## 影响范围

- `src/client/styles.ts`
- `src/client/components/ServerEditorModal.tsx`
- `src/client/components/BuildLogModal.tsx`
- `src/client/components/JenkinsConfigModal.tsx`
- `src/client/components/PublishTab.tsx`
- `src/client/components/HistoryTab.tsx`
- `src/client/components/SettingsPage.tsx`（无改动：无底部按钮，tab 切换时前一个 tab 卸载自行清理 footer）
- 构建产物 `lib/**`（由 `npm run build` 生成）

## 不在范围

- TemplateModal：无操作按钮，不加 footer。
- 构建日志 / 模板弹框的内部滚动结构。
- 按钮文案（全部复用现有 i18n key）。
