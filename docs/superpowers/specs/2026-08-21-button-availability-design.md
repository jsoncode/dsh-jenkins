# 弹框按钮可用性优化 设计文档

日期：2026-08-21
状态：已批准（用户在「编辑态 Token 校验」问题上选择：修宿主，编辑态允许留空保留原 token）

## 背景

上一轮 footer 改造后，用户提出三项可用性优化：

1. 发布 tab：未选足够参数时 footer 里的发布按钮不应隐藏，应禁用，满足条件后再允许点击。
2. 服务器编辑弹框：未满足表单校验时【测试连接】【保存】应禁用。
3. 已测试联通的服务器再次点击【测试连接】时，需要给出再次连接成功的反馈（按钮文案临时改为「连接成功」，3 秒后恢复）。

另发现既有矛盾：UI 提示编辑态 token「留空则不修改」，但宿主 `save` 无条件要求 token，导致编辑服务器不改 token 直接保存会报「请填写 Token」。本次顺带修复。

## 改动 1 · 发布 tab footer 常驻禁用（PublishTab.tsx）

- footerNode 表单态：去掉 `if (!selectedJobPath) return null` 分支，footer 始终渲染 **[查看参数] [触发构建]**。
- **触发构建**：`disabled={!selectedJobPath || submitting}`。
- **查看参数**：`disabled={!selectedJobPath}`（无 Job 时无参数可看）。
- 运行态（返回参数 / 重新构建）逻辑与依赖数组不变（`[runState, selectedJobPath, submitting, stableSubmit]`）。

## 改动 2 · 服务器编辑弹框校验禁用（ServerEditorModal.tsx）

- 计算 `urlValid = /^https?:\/\//i.test(draft.baseUrl.trim())`（与宿主 `url-invalid` 规则一致）。
- ServerDraft 增加 `hasToken` 字段（编辑态从 `server.hasToken` 初始化；EMPTY_DRAFT 为 false）。
- `tokenOk = draft.isNew ? !!draft.token.trim() : (!!draft.token.trim() || !!draft.hasToken)`（编辑态保留原 token 视为已填）。
- **保存** 禁用：`busy || !urlValid || !draft.username.trim() || !tokenOk`。
- **测试连接** 禁用：`busy || !urlValid || !tokenOk`（username 留空宿主按 admin 处理，不禁用）。
- 原有 doSave 的 username 前置校验与 formError 提示保留作兜底。

## 改动 3 · 测试成功反馈（ServerEditorModal.tsx）

- 新增 `justTested` state；`doTest` 成功时置位并启动 3 秒定时器恢复；失败 / 字段变更（setField / setInsecure）时重置。
- 定时器 id 存 ref，组件卸载时清理（useEffect cleanup）。
- 按钮文案：`busy ? t('testing') : (justTested ? t('connected') : t('testBtn'))`，复用现有 `connected`（连接成功 / Connected）文案，无新增 i18n key。
- 成功期间保持绿色样式（沿用 `testedOk`，与 `justTested` 同时置位）。

## 改动 4 · 宿主 save 的 token 校验（ops.ts）

- `if (!token) return { ok: false, code: 'token-required', ... }` 改为 `if (!a.id && !token) return { ok: false, code: 'token-required', ... }`：
  - 新增服务器：token 必填（原行为不变）。
  - 编辑服务器：留空 = 保留原 token（走既有 `if (token) s.token = token` 分支），与 UI 提示「留空则不修改」一致。

## 影响范围

- `src/host/ops.ts`（1 行）
- `src/client/components/ServerEditorModal.tsx`（校验 + 反馈）
- `src/client/components/PublishTab.tsx`（footerNode 禁用）
- 构建产物 `lib/**`（`npm run build` 重建，随提交）

## 不在范围

- 测试连接的既有成功/失败提示块（body 内 testResult）行为不变。
- 其它弹框的按钮可用性。
- 新 i18n 文案（全部复用现有 key）。

## 验证

- `npm run check` / `npm run build` / `npm run verify` 全绿。
- 手动：新增弹框 URL/Token 为空时两按钮禁用；编辑弹框 token 留空（hasToken）时两按钮可用且保存保留原 token；发布 tab 未选 Job 时提交按钮禁用、选中后可用；测试成功后按钮显示「连接成功」3 秒恢复。
