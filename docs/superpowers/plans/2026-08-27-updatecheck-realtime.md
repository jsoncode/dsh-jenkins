# updateCheck 版本检查完全实时化 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 去除宿主侧两层进程内缓存，使 `updateCheck` op 每次调用都实时读取本地已装版本号并实时查询 npm registry——服务运行期间外部更新包后，刷新页面即可看到新版本号，无需重启 dsh 服务。

**架构：** 只改宿主半边 `src/host/update.ts` 与 `src/host/ops.ts`（删除缓存状态与失效调用），另同步三处客户端/宿主的过时注释。op 协议、UI、i18n、semver 比较、超时与静默降级行为全部不变。

**技术栈：** TypeScript (Node ESM, `.ts` 直接以 node/tsx 运行)，验证用 `pnpm check`（tsc）、`pnpm verify`、`pnpm build`。

**规格：** `docs/superpowers/specs/2026-08-27-updatecheck-realtime-design.md`（本项目无单元测试框架，规格确定的验证手段即下方任务 3，不新增测试设施）。

---

## 文件结构

| 文件 | 操作 | 职责变化 |
| --- | --- | --- |
| `src/host/update.ts` | 修改 | 删除 `installedVersionCache`/`resetInstalledVersionCache` 与 registry 10 分钟缓存；`readInstalledVersion()` 与 `checkPluginUpdate()` 改为每次实时执行 |
| `src/host/ops.ts` | 修改 | 移除 `resetInstalledVersionCache` 导入与 `pluginUpdateStatus` done 分支的失效调用，更新两处分支注释 |
| `src/host/plugin-update.ts` | 修改（仅注释） | 文件头不再提及「ops 层重置缓存」 |
| `src/client/plugin.tsx` | 修改（仅注释） | 「宿主侧缓存 10 分钟」改为「实时查询」 |
| `src/client/components/FooterButton.tsx` | 修改（仅注释） | 同上 |

---

### 任务 1：宿主 updateCheck 实时化（update.ts + ops.ts 原子变更）

两个文件必须同一 commit 内完成：任务删掉了 ops.ts 正在导入的导出，拆开提交会出现编译不过的中间态。

**文件：**
- 修改：`src/host/update.ts`（头注释、第 23-24 行、第 98-139 行、第 141-190 行区域）
- 修改：`src/host/ops.ts`（第 21 行导入、第 483-488 行、第 499-505 行）

- [ ] **步骤 1.1：修改 `src/host/update.ts` 文件头注释**

将第 9-12 行：

```ts
 * 结果在宿主进程内缓存 10 分钟，避免每次页面加载都请求 registry；
 * 网络失败静默降级为 { current, latest:'', hasUpdate:false }，不打扰用户。
 * 更新进程结束（pluginUpdateStatus 返回 done）后调用 resetInstalledVersionCache()，
 * 下一次 updateCheck 重读新版本号 —— 客户端据此隐藏「更新」胶囊。
```

替换为：

```ts
 * 完全实时：每次调用都重读安装根目录 package.json 并重新请求 registry，
 * 无进程内缓存——服务运行期间在外部更新包后，刷新页面即可读到新版本号，
 * 无需重启 dsh 服务；调用频率由客户端决定（页面加载时一次 + 每 5 分钟一次）。
 * 网络失败静默降级为 { current, latest:'', hasUpdate:false }，不打扰用户。
```

- [ ] **步骤 1.2：删除 `CACHE_MS` 常量**

删除以下 6 行（原第 23-24 行及其空行分隔）：

```ts
/** registry 结果缓存时长（毫秒）。 */
const CACHE_MS = 10 * 60_000

```

保留紧随其后的 `FETCH_TIMEOUT_MS`。

- [ ] **步骤 1.3：`readInstalledVersion()` 改为实时读盘**

将原第 98-139 行整段（从 `/* ── 安装位置 package.json 读取 …` 注释行到该函数结尾 `}`）替换为：

```ts
/* ── 安装位置 package.json 读取 ─────────────────────────────────── */

/**
 * 读取被安装根目录 package.json 的 version（并校验 name），每次调用实时读盘。
 * 编译产物 lib/index.js 相对 `../package.json`；源码直跑（tsx src/…）相对
 * `../../package.json`。两候选都失败或 name 不符时回退 process.cwd()。
 */
export function readInstalledVersion(): string {
  const candidates = [
    new URL('../package.json', import.meta.url),
    new URL('../../package.json', import.meta.url),
  ]
  let fallback = ''
  for (const url of candidates) {
    try {
      const text = readFileSync(url, 'utf8')
      const pkg = JSON.parse(text) as { name?: unknown; version?: unknown }
      if (pkg.name === PLUGIN_NAME && typeof pkg.version === 'string') {
        return pkg.version
      }
      if (fallback === '' && typeof pkg.version === 'string') fallback = pkg.version
    } catch { /* 候选不存在（如源码直跑的第一候选），试下一个 */ }
  }
  if (fallback === '') {
    try {
      const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { name?: unknown; version?: unknown }
      if (pkg.name === PLUGIN_NAME && typeof pkg.version === 'string') fallback = pkg.version
    } catch { /* cwd 也无包清单：保持空串 */ }
  }
  return fallback
}
```

要点：候选路径解析、name 校验、cwd 兜底逻辑不变；只是不再写入/短路 `installedVersionCache`。

- [ ] **步骤 1.4：`checkPluginUpdate()` 去除 registry 缓存**

删除缓存声明行（原第 143 行）：

```ts
let cache: { at: number; info: PluginUpdateInfo } | null = null
```

将小节标题注释改为：

```ts
/* ── registry 查询 ──────────────────────────────────────────────── */
```

将 `checkPluginUpdate` 整个函数（原第 174-190 行）替换为：

```ts
/**
 * 检查插件更新：registry 最新版 vs 被安装根目录 package.json 版本。
 * 每次调用实时读盘并实时请求 registry（无缓存）；
 * 网络失败降级为 { current, latest:'', hasUpdate:false }。
 */
export async function checkPluginUpdate(): Promise<PluginUpdateInfo> {
  const current = readInstalledVersion()
  const latest = await fetchLatest()
  return { current, latest, hasUpdate: isNewerVersion(latest, current) }
}
```

- [ ] **步骤 1.5：修改 `src/host/ops.ts` 导入**

将第 21 行：

```ts
import { checkPluginUpdate, resetInstalledVersionCache } from './update.ts'
```

替换为：

```ts
import { checkPluginUpdate } from './update.ts'
```

- [ ] **步骤 1.6：修改 `src/host/ops.ts` 的 `updateCheck` 分支注释**

将第 483-488 行中的注释：

```ts
  if (op === 'updateCheck') {
    // 插件新版本检查：npm registry（keywords:dsh-jenkins）最新版 vs 被安装根目录
    // package.json 版本；宿主进程内缓存 10 分钟，网络失败静默降级。
    const update = await checkPluginUpdate()
    return { ok: true, update }
  }
```

替换为：

```ts
  if (op === 'updateCheck') {
    // 插件新版本检查：npm registry（keywords:dsh-jenkins）最新版 vs 被安装根目录
    // package.json 版本；完全实时（无缓存），网络失败静默降级。
    const update = await checkPluginUpdate()
    return { ok: true, update }
  }
```

- [ ] **步骤 1.7：修改 `src/host/ops.ts` 的 `pluginUpdateStatus` 分支**

将第 499-505 行：

```ts
  if (op === 'pluginUpdateStatus') {
    const status = getPluginUpdateStatus()
    // 更新进程结束后使版本缓存失效：下一次 updateCheck 重读新版本号，
    // 客户端据此隐藏「更新」胶囊。
    if (status.done) resetInstalledVersionCache()
    return { ok: true, status }
  }
```

替换为：

```ts
  if (op === 'pluginUpdateStatus') {
    // 客户端轮询拉取更新进程的累计输出与运行状态。
    // 版本号本身由 update.ts 实时读取（无缓存），更新结束后无需失效动作。
    const status = getPluginUpdateStatus()
    return { ok: true, status }
  }
```

- [ ] **步骤 1.8：类型检查确认编译通过**

运行：`pnpm check`（即 `tsc -b --pretty false`）
预期：退出码 0，无输出；若报 `resetInstalledVersionCache` 未导出/未使用等错误，说明有遗漏引用未清理。

- [ ] **步骤 1.9：Commit**

```bash
git add src/host/update.ts src/host/ops.ts
git commit -m "feat(update): updateCheck 改为完全实时，去除本地版本与 registry 进程内缓存"
```

---

### 任务 2：清理提及旧缓存的过时注释（纯措辞）

**文件：**
- 修改：`src/host/plugin-update.ts:8-9`
- 修改：`src/client/plugin.tsx:83-87`
- 修改：`src/client/components/FooterButton.tsx:55`

- [ ] **步骤 2.1：`src/host/plugin-update.ts` 文件头注释**

将第 8-9 行：

```ts
 * 更新进程结束（done）后，ops 层会调用 update.ts 的 resetInstalledVersionCache()，
 * 使下次 updateCheck 重读新版本号（客户端据此隐藏「更新」胶囊）。
```

替换为：

```ts
 * 更新进程结束（done）后客户端会再查一次 updateCheck；update.ts 为实时读取
 * （无缓存），因此新版本号立即生效（客户端据此隐藏「更新」胶囊）。
```

- [ ] **步骤 2.2：`src/client/plugin.tsx` 新版本检查段落注释**

将第 83-87 行：

```tsx
      // ─── 插件新版本检查 ──────────────────────────────────────────
      // npm registry（keywords:dsh-jenkins）最新版 vs 被安装根目录 package.json，
      // hasUpdate=true 时 footer 按钮最右侧显示【有更新】胶囊。宿主侧缓存 10 分钟，
      // 失败静默（不显示胶囊）。recheckUpdate 在更新进程成功结束后再次调用
      // （宿主已使版本缓存失效），用于让「更新」胶囊消失。
```

替换为：

```tsx
      // ─── 插件新版本检查 ──────────────────────────────────────────
      // npm registry（keywords:dsh-jenkins）最新版 vs 被安装根目录 package.json，
      // hasUpdate=true 时 footer 按钮最右侧显示【有更新】胶囊。宿主侧实时查询、
      // 失败静默（不显示胶囊）。recheckUpdate 在更新进程成功结束后再次调用，
      // 用于让「更新」胶囊立即消失。
```

- [ ] **步骤 2.3：`src/client/components/FooterButton.tsx` 订阅处注释**

将第 55 行：

```tsx
  // 新版本检查结果：订阅更新 store（宿主 updateCheck op，缓存 10 分钟）
```

替换为：

```tsx
  // 新版本检查结果：订阅更新 store（宿主 updateCheck op，实时查询）
```

- [ ] **步骤 2.4：Commit**

```bash
git add src/host/plugin-update.ts src/client/plugin.tsx src/client/components/FooterButton.tsx
git commit -m "docs(comments): 同步 updateCheck 实时化后的注释措辞"
```

---

### 任务 3：全量验证

**文件：** 无代码修改，只运行验证命令。

- [ ] **步骤 3.1：客户端校验**

运行：`pnpm verify`（即 `node scripts/verify-client.mjs`）
预期：退出码 0，脚本自述通过。

- [ ] **步骤 3.2：构建**

运行：`pnpm build`（清空 lib/ 后 `tsc -b && tsdown`）
预期：退出码 0，重新产出 `lib/index.js`、`lib/types/…`，且 `lib/types/host/update.d.ts` 中不再含 `resetInstalledVersionCache` 导出。

- [ ] **步骤 3.3：向用户报告手工验证方式**

告知用户：重启 dsh 服务使新代码生效后，以后再更新插件包只需刷新页面即可看到最新版本号（本轮代码本身的生效仍需要这一次重启）；可随时点 footer 或设置页触发更新检查确认。

