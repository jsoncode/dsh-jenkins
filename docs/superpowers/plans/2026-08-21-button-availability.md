# 弹框按钮可用性优化 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 三项可用性优化：发布 tab footer 提交按钮常驻禁用（未选 Job 前禁用而非隐藏）；服务器编辑弹框表单校验不满足时禁用【测试连接】【保存】；测试连接成功后按钮临时显示「连接成功」3 秒恢复。顺带修复宿主 save 编辑态 token 校验（留空保留原 token）。

**架构：** PublishTab 的 footerNode 去掉 null 分支并加 disabled；ServerEditorModal 增加 urlValid / tokenOk 计算与 justTested 反馈状态；宿主 ops.ts 的 save 仅新增时强制 token。

**技术栈：** React 18（hooks）、TS、内联 CSS 注入。无单测框架，验证 = `npm run check` + `npm run build` + `npm run verify`，视觉部分手动清单。

**前置说明：** 设计文档已批准（`docs/superpowers/specs/2026-08-21-button-availability-design.md`）。仓库惯例：src 改动与其 lib 编译产物（含 tsdown bundle）一起提交。

---

### 任务 1：宿主 save 编辑态 token 校验修复

**文件：**
- 修改：`src/host/ops.ts`（save 分支，第 162 行）

- [ ] **步骤 1：修改校验条件**

将：

```ts
    if (!token) return { ok: false, code: 'token-required', error: 'Token is required' }
```

改为：

```ts
    // 新增必填 token；编辑时留空 = 保留原 token（与 UI「留空则不修改」一致）
    if (!a.id && !token) return { ok: false, code: 'token-required', error: 'Token is required' }
```

要求：`a` 为 `req.server`（第 157 行定义），`a.id` 编辑态为服务器 id、新增态为 null/undefined；其余 save 逻辑（`if (token) s.token = token`）不动。

- [ ] **步骤 2：构建 + 提交（src + lib 一起）**

```powershell
npm run build
git add src lib
git commit -m "fix: 编辑服务器时 token 留空保留原值（新增仍必填）"
```

预期：build 无错误；提交后 `git status --short` 为空。

---

### 任务 2：ServerEditorModal —— 校验禁用 + 测试成功反馈

**文件：**
- 修改：`src/client/components/ServerEditorModal.tsx`

- [ ] **步骤 1：import 增加 hooks**

第 6 行 `import { useState } from 'react'` 改为：

```tsx
import { useEffect, useRef, useState } from 'react'
```

- [ ] **步骤 2：ServerDraft 增加 hasToken**

接口 `ServerDraft`（约第 22-31 行）内 `masked: string` 之后新增：

```tsx
  hasToken: boolean
```

`EMPTY_DRAFT`（第 48 行）新增 `hasToken: false`：

```tsx
const EMPTY_DRAFT: ServerDraft = { isNew: true, id: null, name: '', baseUrl: '', username: '', token: '', masked: '', hasToken: false, insecure: false }
```

编辑态初始化（第 53 行）`insecure: !!server.insecure` 之后新增 `hasToken: !!server.hasToken`：

```tsx
    ? { isNew: false, id: server.id, name: server.name, baseUrl: server.baseUrl, username: server.username, token: '', masked: server.tokenMasked || '', hasToken: !!server.hasToken, insecure: !!server.insecure }
```

- [ ] **步骤 3：新增 justTested 状态与定时器**

在 `const [testedOk, setTestedOk] = useState(false)` 之后新增：

```tsx
  const [justTested, setJustTested] = useState(false) // 测试成功后按钮临时显示「连接成功」
  const justTestedTimer = useRef<number | null>(null)
  // 卸载时清理定时器（弹框关闭即恢复默认文案）
  useEffect(() => () => { if (justTestedTimer.current !== null) window.clearTimeout(justTestedTimer.current) }, [])
```

- [ ] **步骤 4：字段变更重置 justTested**

`setField`（第 60-63 行）内 `setTestedOk(false)` 之后加一行 `setJustTested(false)`，并将 Omit 排除列表加入 `'hasToken'`（避免 setField 类型误开放该键）：

```tsx
  const setField = (k: keyof Omit<ServerDraft, 'isNew' | 'id' | 'masked' | 'hasToken' | 'insecure'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestedOk(false)
    setJustTested(false)
    setDraft((prev) => ({ ...prev, [k]: e.target.value }))
  }
```

`setInsecure`（第 64-67 行）同理：

```tsx
  const setInsecure = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestedOk(false)
    setJustTested(false)
    setDraft((prev) => ({ ...prev, insecure: e.target.checked }))
  }
```

- [ ] **步骤 5：doTest 成功反馈**

`doTest` 的 `.then`（第 73-79 行）改为：

```tsx
      .then((r) => {
        const ok = !!(r && r.ok)
        setTestedOk(ok)
        setJustTested(ok)
        if (ok) {
          // 再次连接成功：按钮临时显示「连接成功」，3 秒后恢复
          if (justTestedTimer.current !== null) window.clearTimeout(justTestedTimer.current)
          justTestedTimer.current = window.setTimeout(() => { setJustTested(false); justTestedTimer.current = null }, 3000)
        }
        setTestResult(ok
          ? { ok: true, text: t('connected') + ((r.version as string) ? '（Jenkins ' + r.version + '）' : '') }
          : { ok: false, text: tErr(r, t('testFailed')) })
      })
```

`.catch`（第 80-83 行）内 `setTestedOk(false)` 之后加 `setJustTested(false)`：

```tsx
      .catch((e) => {
        setTestedOk(false)
        setJustTested(false)
        setTestResult({ ok: false, text: e instanceof Error ? e.message : String(e) })
      })
```

- [ ] **步骤 6：校验计算 + 按钮禁用**

在 `return (` 之前（`tokenUrl` 计算之后）新增：

```tsx
  // 表单校验（与宿主一致）：地址需 http(s) 开头；token 新增必填、编辑可保留原值；用户名必填。
  const urlValid = /^https?:\/\//i.test(draft.baseUrl.trim())
  const tokenOk = draft.isNew ? !!draft.token.trim() : (!!draft.token.trim() || !!draft.hasToken)
  const formValid = urlValid && !!draft.username.trim() && tokenOk
```

footer 内测试按钮改为（注意文案三态与禁用）：

```tsx
            <button
              type="button"
              className={'dshj-btn' + (testedOk ? ' dshj-btn-success' : '')}
              disabled={busy || !urlValid || !tokenOk}
              onClick={doTest}
            >
              {busy ? t('testing') : (justTested ? t('connected') : t('testBtn'))}
            </button>
```

保存按钮改为：

```tsx
            <button type="button" className="dshj-btn dshj-btn-primary" disabled={busy || !formValid} onClick={doSave}>{t('saveBtn')}</button>
```

（取消按钮保持 `disabled={busy}` 不变；按钮顺序仍为 测试连接 → 取消 → 保存。）

- [ ] **步骤 7：构建 + 提交（src + lib 一起）**

```powershell
npm run build
git add src lib
git commit -m "feat: 服务器弹框表单校验禁用按钮，测试成功临时提示"
```

预期：build 无错误；`git status --short` 为空。

---

### 任务 3：PublishTab —— footer 提交按钮常驻禁用

**文件：**
- 修改：`src/client/components/PublishTab.tsx`（footerNode，约第 412-430 行）

- [ ] **步骤 1：去掉 null 分支并加禁用**

`footerNode` useMemo（约第 412-430 行）中，删除：

```tsx
    if (!selectedJobPath) return null
```

并将表单态返回块改为：

```tsx
    return (
      <>
        <button type="button" className="dshj-link-btn" disabled={!selectedJobPath || submitting} onClick={() => setParamsOpen(true)}>{t('viewParams')}</button>
        <button type="button" className="dshj-btn dshj-btn-primary" disabled={!selectedJobPath || submitting} onClick={stableSubmit}>{submitting ? t('submitting') : t('submit')}</button>
      </>
    )
```

（useMemo 依赖数组 `[runState, selectedJobPath, submitting, stableSubmit]` 不变；运行态分支不动。）

- [ ] **步骤 2：构建 + 提交（src + lib 一起）**

```powershell
npm run build
git add src lib
git commit -m "feat: 发布 tab 未选 Job 时提交按钮禁用而非隐藏"
```

预期：build 无错误；`git status --short` 为空。

---

### 任务 4：全量验证

**文件：**
- 生成：`lib/**`

- [ ] **步骤 1：三连验证**

```powershell
npm run build
npm run verify
npm run check
```

预期：build 无错误；verify 输出 `verify-client OK: dsh-jenkins · inject=[...] · external=...`；check 无错误。

- [ ] **步骤 2：提交残留产物（如有）**

```powershell
git status --short
git add lib
git commit -m "build: 重建按钮可用性优化产物"
```

若 status 为空则跳过提交。

- [ ] **步骤 3：手动视觉验证清单（宿主环境）**

- 新增服务器弹框：URL / Token 为空时【测试连接】【保存】均禁用；填入 http(s) 地址 + Token 后可点击。
- 编辑服务器弹框：token 留空（有已保存 token）时两按钮可用；点【测试连接】成功 → 按钮显示「连接成功」3 秒后恢复；改任一字段后恢复为「测试连接」。
- 编辑服务器弹框：不填 token 直接保存成功（保留原 token）。
- 发布 tab：未选 Job 时 footer 显示禁用的【触发构建】；选中 Job 后可点击；运行态按钮正常。

---

## 自检记录

- **规格覆盖度**：改动 1 → 任务 3；改动 2 → 任务 2（步骤 6）；改动 3 → 任务 2（步骤 3-5）；改动 4 → 任务 1；验证 → 任务 4。无遗漏。
- **占位符扫描**：无 TODO / 待定；每步含完整代码或精确命令。
- **类型一致性**：`hasToken` 在 ServerDraft / EMPTY_DRAFT / 编辑初始化三处一致；`justTested` / `justTestedTimer` / `urlValid` / `tokenOk` / `formValid` 命名定义与引用一致；`t('connected')` 复用现有 i18n key。
- **风险点**：任务 2 步骤 5 的定时器在 `window.setTimeout` 类型（number）与 NodeJS.Timeout 差异——浏览器环境用 `window.setTimeout` 保证 number 类型；卸载清理已覆盖。
