# 弹框 Footer 统一改造 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将全部弹框统一为 header / 可滚动 body / 固定 footer 结构：操作按钮移入 footer（`flex:none` 固定、不随 body 滚动，顶部细分隔线），body 内容过多时内部滚动。

**架构：** 新增通用 CSS 规则 `.dshj-modal-footer`；ServerEditorModal / BuildLogModal 直接改用该规则；JenkinsConfigModal 通过 `onFooter` 回调接收当前 tab 上报的 footer 内容（useEffect 上报 + 卸载清空 + useMemo 稳定节点引用，避免 setState 循环），发布 / 历史 tab 的底部按钮提升到弹框 footer。

**技术栈：** React 18（函数组件 + hooks）、TS、内联 CSS 注入（styles.ts）。仓库无单测框架，自动化验证 = `npm run check`（tsc -b）+ `npm run build` + `npm run verify`，视觉验证 = 手动清单。

**前置说明：** 工作区有上一会话遗留的未提交 WIP（构建日志 ANSI 渲染：`src/client/ansi.ts` 等），`npm run check` 已确认可编译通过。Task 0 先将其单独提交，保证后续 commit 干净。

---

### 任务 0：提交工作区 WIP（ANSI 日志渲染，与本改造无关的前置清理）

**文件：**
- 提交（已有内容）：`src/client/ansi.ts`、`src/client/components/BuildLogModal.tsx`、`lib/client.js`、`lib/client.js.map`、`lib/types/client/components/BuildLogModal.d.ts.map`、`lib/types/client/components/BuildLogModal.js`、`lib/types/client/ansi.d.ts`、`lib/types/client/ansi.d.ts.map`、`lib/types/client/ansi.js`

- [ ] **步骤 1：确认 WIP 全部文件清单**

运行：`git status --short`
预期：列出 modified 的 `lib/client.js`、`lib/client.js.map`、`lib/types/client/components/BuildLogModal.d.ts.map`、`lib/types/client/components/BuildLogModal.js`、`src/client/components/BuildLogModal.tsx` 与 untracked 的 `src/client/ansi.ts`、`lib/types/client/ansi.d.ts`、`lib/types/client/ansi.d.ts.map`、`lib/types/client/ansi.js`。

- [ ] **步骤 2：提交 WIP**

```bash
git add src/client/ansi.ts src/client/components/BuildLogModal.tsx lib/client.js lib/client.js.map lib/types/client/components/BuildLogModal.d.ts.map lib/types/client/components/BuildLogModal.js lib/types/client/ansi.d.ts lib/types/client/ansi.d.ts.map lib/types/client/ansi.js
git commit -m "feat: 构建日志 ANSI 控制序列渲染"
```

预期：提交成功，`git status --short` 为空。

---

### 任务 1：styles.ts —— 新增 `.dshj-modal-footer` 规则

**文件：**
- 修改：`src/client/styles.ts`（在 `.dshj-modal-body` 规则之后插入，约第 110 行后）

- [ ] **步骤 1：插入 footer 规则**

在 `'.dshj-modal-body{flex:1;overflow-y:auto;padding:16px 18px;min-width:0;min-height:0}',` 之后插入：

```ts
  // 弹框 footer：操作按钮区，右对齐、顶部细分隔线；flex:none 固定不随 body 滚动
  '.dshj-modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--dsw-alias-border-l1,#eee);flex:none;flex-wrap:wrap}',
```

- [ ] **步骤 2：类型检查**

运行：`npm run check`
预期：无错误输出。

- [ ] **步骤 3：Commit**

```bash
git add src/client/styles.ts
git commit -m "feat: 新增弹框 footer 样式（固定 + 分割线）"
```

---

### 任务 2：ServerEditorModal —— 操作按钮移入 footer

**文件：**
- 修改：`src/client/components/ServerEditorModal.tsx`（第 150-156 行的 `.dshj-editor-ops` 块）

- [ ] **步骤 1：按钮移出 body**

删除 body 内的操作按钮块：

```tsx
          <div className="dshj-editor-ops">
            <button type="button" className={'dshj-btn' + (testedOk ? ' dshj-btn-success' : '')} disabled={busy} onClick={doTest}>{busy ? t('testing') : t('testBtn')}</button>
            <button type="button" className="dshj-btn dshj-btn-primary" disabled={busy} onClick={doSave}>{t('saveBtn')}</button>
            <button type="button" className="dshj-btn" disabled={busy} onClick={onClose}>{t('cancelBtn')}</button>
          </div>
```

（`formError` / `testResult` 提示行保留在 body 内不动。）

在 `</div>`（body 结束标签）之后、`</div>`（modal）之前，新增 footer（顺序：测试连接 → 取消 → 保存，主操作靠右）：

```tsx
        <div className="dshj-modal-footer">
          <button type="button" className={'dshj-btn' + (testedOk ? ' dshj-btn-success' : '')} disabled={busy} onClick={doTest}>{busy ? t('testing') : t('testBtn')}</button>
          <button type="button" className="dshj-btn" disabled={busy} onClick={onClose}>{t('cancelBtn')}</button>
          <button type="button" className="dshj-btn dshj-btn-primary" disabled={busy} onClick={doSave}>{t('saveBtn')}</button>
        </div>
```

- [ ] **步骤 2：类型检查**

运行：`npm run check`
预期：无错误输出。

- [ ] **步骤 3：Commit**

```bash
git add src/client/components/ServerEditorModal.tsx
git commit -m "feat: 服务器编辑弹框操作按钮移入 footer"
```

---

### 任务 3：BuildLogModal —— 底部操作行改为 footer

**文件：**
- 修改：`src/client/components/BuildLogModal.tsx`（第 99 行）

- [ ] **步骤 1：替换类名**

将：

```tsx
          <div className="dshj-history-ops dshj-log-ops">
```

替换为：

```tsx
          <div className="dshj-modal-footer">
```

（内部 [复制] / [打开构建页] 按钮与条件渲染逻辑不变。）

- [ ] **步骤 2：类型检查**

运行：`npm run check`
预期：无错误输出。

- [ ] **步骤 3：Commit**

```bash
git add src/client/components/BuildLogModal.tsx
git commit -m "feat: 构建日志弹框底部操作行改为 footer"
```

---

### 任务 4：JenkinsConfigModal —— footer 区 + onFooter 上报机制

**文件：**
- 修改：`src/client/components/JenkinsConfigModal.tsx`

- [ ] **步骤 1：引入类型与 hooks**

第 12 行 `import { useEffect, useMemo, useState } from 'react'` 改为：

```tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
```

在组件内（`useState` 声明区）新增：

```tsx
import type { ReactNode } from 'react'
```

（若 `ReactNode` 已有其他导入路径则合并到该 import。）

- [ ] **步骤 2：footer 状态 + 稳定上报回调**

在 `const [historyCount, setHistoryCount] = useState(0)` 之后新增：

```tsx
  const [footerNode, setFooterNode] = useState<ReactNode>(null) // 当前 tab 上报的 footer 内容（无内容时不渲染 footer 栏）
  // 稳定引用：子组件 effect 依赖它，避免父组件每次渲染重建导致子组件 effect 反复触发
  const reportFooter = useCallback((node: ReactNode) => { setFooterNode(node) }, [])
```

- [ ] **步骤 3：渲染 footer 区**

在 `<div className="dshj-modal-body dshj-config-body">...</div>`（第 97-111 行）之后、`</div>`（modal）之前新增：

```tsx
        {footerNode ? <div className="dshj-modal-footer">{footerNode}</div> : null}
```

- [ ] **步骤 4：向 tab 透传 onFooter**

PublishTab 调用处（第 100 行）新增 `onFooter={reportFooter}`：

```tsx
              <PublishTab initialCwd={cwd} sessionId={sessionId} run={run} poller={poller} storage={storage} workspaceItems={workspaceItems} onCountChange={setConfigCount} onFooter={reportFooter} />
```

HistoryTab 调用处（第 108 行）新增 `onFooter={reportFooter}`：

```tsx
              <HistoryTab cwd={cwd} sessionId={sessionId} run={run} poller={poller} storage={storage} onCountChange={setHistoryCount} onFooter={reportFooter} />
```

SettingsPage 调用处**不改**（无底部按钮；tab 切换时前一个 tab 卸载会自动清理 footer）。

- [ ] **步骤 5：类型检查**

运行：`npm run check`
预期：报错 "Property 'onFooter' does not exist on type 'PublishTabProps'" 与 "…HistoryTabProps" —— 属预期，下一任务补上 prop 定义。

- [ ] **步骤 6：Commit（prop 未定义会导致 tsc 失败，与任务 5/6 合并提交）**

```bash
git add src/client/components/JenkinsConfigModal.tsx
git commit -m "feat: 统一配置弹框新增 footer 区（onFooter 上报）"
```

> 注：若此任务单独提交时 tsc 失败，可先跳过步骤 5-6，完成任务 5/6 后一并提交。

---

### 任务 5：PublishTab —— 提交按钮提升到 footer

**文件：**
- 修改：`src/client/components/PublishTab.tsx`

- [ ] **步骤 1：引入 hooks 与类型**

第 11 行 `import { useEffect, useRef, useState } from 'react'` 改为：

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
```

新增类型导入：

```tsx
import type { ReactNode } from 'react'
```

- [ ] **步骤 2：PublishTabProps 增加 onFooter**

接口内 `onCountChange?: (count: number) => void` 之后新增：

```tsx
  /** 上报本 tab 的 footer 操作按钮（由弹框渲染在固定 footer 区；null/undefined 表示无）。 */
  onFooter?: (node: ReactNode) => void
```

函数签名 `export function PublishTab({ initialCwd, sessionId, run, poller, storage, workspaceItems, onCountChange }: PublishTabProps)` 改为解构 `onFooter`：

```tsx
export function PublishTab({ initialCwd, sessionId, run, poller, storage, workspaceItems, onCountChange, onFooter }: PublishTabProps) {
```

`<LauncherContent ... onCountChange={onCountChange} />` 调用处（第 121 行）新增 `onFooter={onFooter}`。

`LauncherContent` 的 props 类型（第 126-134 行）新增：

```tsx
  onFooter?: (node: ReactNode) => void
```

并在函数解构中新增 `onFooter`。

- [ ] **步骤 3：稳定包装 onSubmit**

在 `const onSubmit = async () => { ... }` 定义结束（第 377 行 `}`）之后新增：

```tsx
  // 稳定包装：footer 按钮经它触发「最新一次渲染」的 onSubmit；onSubmit 本身每次渲染重建，
  // 直接进 useMemo 依赖会导致 footer 节点引用不稳定、父组件 setState 循环。
  const onSubmitRef = useRef(onSubmit)
  onSubmitRef.current = onSubmit
  const stableSubmit = useCallback(() => { void onSubmitRef.current() }, [])
```

- [ ] **步骤 4：移除 body 内的两组按钮**

删除运行态视图内的（第 475-478 行）：

```tsx
          <div className="dshj-form-ops">
            <button type="button" className="dshj-btn" onClick={() => setRunState(null)}>{t('backParams')}</button>
            {runState.phase === 'done' ? <button type="button" className="dshj-btn dshj-btn-primary" onClick={onSubmit}>{t('rebuild')}</button> : null}
          </div>
```

删除表单视图内的（第 551-554 行）：

```tsx
              <div className="dshj-form-ops dshj-submit-row">
                <button type="button" className="dshj-btn dshj-btn-primary" disabled={submitting} onClick={onSubmit}>{submitting ? t('submitting') : t('submit')}</button>
                <button type="button" className="dshj-link-btn" disabled={submitting} onClick={() => setParamsOpen(true)}>{t('viewParams')}</button>
              </div>
```

- [ ] **步骤 5：计算 footer 节点并上报**

在 `return (` 之前（`formParamsJson` 计算之后）新增：

```tsx
  // footer 操作按钮：运行态 = 返回参数（+ 完成后重新构建）；表单态 = 查看参数 + 触发构建。
  // useMemo 保证节点引用只在状态实际变化时更新，配合父组件 setState 引用比较避免渲染循环。
  const footerNode = useMemo<ReactNode>(() => {
    if (runState) {
      return (
        <>
          <button type="button" className="dshj-btn" onClick={() => setRunState(null)}>{t('backParams')}</button>
          {runState.phase === 'done' ? (
            <button type="button" className="dshj-btn dshj-btn-primary" onClick={stableSubmit}>{t('rebuild')}</button>
          ) : null}
        </>
      )
    }
    if (!selectedJobPath) return null
    return (
      <>
        <button type="button" className="dshj-link-btn" disabled={submitting} onClick={() => setParamsOpen(true)}>{t('viewParams')}</button>
        <button type="button" className="dshj-btn dshj-btn-primary" disabled={submitting} onClick={stableSubmit}>{submitting ? t('submitting') : t('submit')}</button>
      </>
    )
  }, [runState, selectedJobPath, submitting, stableSubmit])

  // 上报 footer；卸载时清空。onFooter 由父组件 useCallback 稳定，effect 只随 footerNode 变化触发。
  useEffect(() => {
    onFooter?.(footerNode)
    return () => onFooter?.(null)
  }, [footerNode, onFooter])
```

- [ ] **步骤 6：类型检查**

运行：`npm run check`
预期：无错误输出。

- [ ] **步骤 7：Commit（含任务 4 的 JenkinsConfigModal 变更）**

```bash
git add src/client/components/PublishTab.tsx src/client/components/JenkinsConfigModal.tsx
git commit -m "feat: 发布 tab 提交按钮提升到弹框 footer"
```

---

### 任务 6：HistoryTab —— 清空按钮提升到 footer

**文件：**
- 修改：`src/client/components/HistoryTab.tsx`

- [ ] **步骤 1：引入 hooks 与类型**

第 7 行 `import { useEffect, useState } from 'react'` 改为：

```tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
```

新增类型导入：

```tsx
import type { ReactNode } from 'react'
```

- [ ] **步骤 2：HistoryTabProps 增加 onFooter**

接口内 `onCountChange?: (count: number) => void` 之后新增：

```tsx
  /** 上报本 tab 的 footer 操作按钮（由弹框渲染在固定 footer 区；null/undefined 表示无）。 */
  onFooter?: (node: ReactNode) => void
```

函数签名解构新增 `onFooter`。

- [ ] **步骤 3：reload 用 useCallback 稳定**

将：

```tsx
  const reload = (): void => {
    void storage.readAllHistory(sessionId).then((h) => {
      setList(h)
      if (onCountChange) onCountChange((h || []).length)
    }).catch(() => undefined)
  }
```

改为：

```tsx
  const reload = useCallback((): void => {
    void storage.readAllHistory(sessionId).then((h) => {
      setList(h)
      if (onCountChange) onCountChange((h || []).length)
    }).catch(() => undefined)
  }, [storage, sessionId, onCountChange])
```

- [ ] **步骤 4：移除 body 内的清空按钮**

删除（第 99-113 行）：

```tsx
      {filtered.length > 0
        ? (
          <div className="dshj-history-ops">
            <button
              type="button"
              className="dshj-btn dshj-btn-small dshj-btn-danger"
              onClick={() => {
                void storage.clearHistory(sessionId, filter === 'all' ? null : filter).then(reload)
              }}
            >
              {t('historyClear')}
            </button>
          </div>
        )
        : null}
```

- [ ] **步骤 5：计算 footer 节点并上报**

在 `return (` 之前新增：

```tsx
  // footer 操作按钮：有历史记录时显示「清空」；useMemo 保持引用稳定避免父组件渲染循环。
  const footerNode = useMemo<ReactNode>(() => {
    if (filtered.length === 0) return null
    return (
      <button
        type="button"
        className="dshj-btn dshj-btn-small dshj-btn-danger"
        onClick={() => { void storage.clearHistory(sessionId, filter === 'all' ? null : filter).then(reload) }}
      >
        {t('historyClear')}
      </button>
    )
  }, [filtered.length, filter, storage, sessionId, reload])

  // 上报 footer；卸载时清空（与 PublishTab 同一模式）。
  useEffect(() => {
    onFooter?.(footerNode)
    return () => onFooter?.(null)
  }, [footerNode, onFooter])
```

- [ ] **步骤 6：类型检查**

运行：`npm run check`
预期：无错误输出。

- [ ] **步骤 7：Commit**

```bash
git add src/client/components/HistoryTab.tsx
git commit -m "feat: 历史 tab 清空按钮提升到弹框 footer"
```

---

### 任务 7：styles.ts —— 删除被替代的旧规则

**文件：**
- 修改：`src/client/styles.ts`

- [ ] **步骤 1：确认旧类名已无引用**

运行：`grep -rn "dshj-editor-ops\|dshj-form-ops\|dshj-submit-row\|dshj-history-ops\|dshj-log-ops" src/`
预期：仅命中 `src/client/styles.ts`（规则定义处）。

- [ ] **步骤 2：删除 5 条规则**

删除：

```ts
'.dshj-form-ops{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}',
'.dshj-submit-row{margin-top:22px;margin-left:178px}',
```

```ts
'.dshj-history-ops{margin-top:12px;display:flex;justify-content:flex-end;gap:8px}',
```

```ts
'.dshj-log-ops{flex:none}',
```

```ts
'.dshj-editor-ops{display:flex;gap:8px;margin-top:4px;flex-wrap:wrap}',
```

- [ ] **步骤 3：类型检查**

运行：`npm run check`
预期：无错误输出。

- [ ] **步骤 4：Commit**

```bash
git add src/client/styles.ts
git commit -m "chore: 移除被 footer 替代的弹框操作区旧样式"
```

---

### 任务 8：全量构建 + 冒烟验证 + 手动清单

**文件：**
- 生成：`lib/**`（构建产物）

- [ ] **步骤 1：全量构建**

运行：`npm run build`
预期：tsc -b 无错误；tsdown 生成 `lib/client.js`。

- [ ] **步骤 2：bundle 冒烟验证**

运行：`npm run verify`
预期：`verify-client OK: dsh-jenkins · inject=[...] · external=...`

- [ ] **步骤 3：再次确认类型检查**

运行：`npm run check`
预期：无错误输出。

- [ ] **步骤 4：提交构建产物**

```bash
git add lib
git commit -m "build: 重建弹框 footer 改造后的产物"
```

- [ ] **步骤 5：手动视觉验证清单（宿主环境打开插件）**

- 新增 / 编辑服务器弹框：底部固定 footer，含 [测试连接] [取消] [保存]，顶部有细分隔线；表单字段多时 body 滚动、footer 不动。
- 统一配置弹框 → 发布 tab：选中 Job 后 footer 显示 [查看参数] [触发构建]；参数很多时 body 内部滚动、footer 固定。
- 发布 tab 运行态：footer 显示 [返回参数]（完成后多 [重新构建]）。
- 历史 tab：有记录时 footer 显示 [清空]；无记录时不显示 footer 栏。
- 配置 tab：不显示 footer 栏。
- 构建日志弹框：footer 显示 [复制] [打开构建页]，分割线可见。
- tab 切换时 footer 内容正确切换；浅色 / 深色主题下分割线均可见。

---

## 自检记录

- **规格覆盖度**：CSS 规则（任务 1）、ServerEditorModal（任务 2）、BuildLogModal（任务 3）、JenkinsConfigModal footer 区（任务 4）、PublishTab / HistoryTab 按钮提升（任务 5/6）、旧样式清理（任务 7）、构建与验证（任务 8）；SettingsPage 无改动（任务 4 步骤 4 已注明原因）；TemplateModal 不在范围。
- **占位符扫描**：无 TODO / 待定项；所有步骤含完整代码或精确命令。
- **类型一致性**：`onFooter?: (node: ReactNode) => void` 在 JenkinsConfigModal / PublishTab / HistoryTab 三处签名一致；`footerNode` / `stableSubmit` / `onSubmitRef` / `reportFooter` 命名在定义与引用处一致；`ReactNode` 统一从 `'react'` 类型导入。
- **风险点**：任务 4 单独提交时 tsc 会因 prop 未定义报错 —— 已在任务 4 步骤 6 注明与任务 5 合并提交（或跳过该步）。
