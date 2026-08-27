# 设计：updateCheck 版本检查改为完全实时（去除宿主进程内缓存）

日期：2026-08-27
状态：已获用户批准的设计，待实现

## 问题

插件版本更新提示（footer「有更新」胶囊）依赖宿主 `updateCheck` op。当前 `src/host/update.ts`
存在两层进程内缓存：

1. **本地已安装版本号永久缓存**（`installedVersionCache`）：模块加载后只读一次安装根目录的
   `package.json`；仅当内置更新流程结束（`pluginUpdateStatus` 返回 `done`）时通过
   `resetInstalledVersionCache()` 重置。
2. **npm registry 查询结果 10 分钟缓存**。

后果：服务运行期间若从外部更新了包（pnpm/npm 重装、git 拉取后重建等），或任何未走内置
更新流程的场景，本地版本号被冻结为旧值——用户必须**重启 dsh 服务**才能看到「已是最新」。
这正是本次要修复的用户痛点。

客户端半边（`src/client/plugin.tsx`）已经在页面加载时调用一次 `updateCheck`、之后每 5 分钟
复查一次、内置更新成功后再查一次。触发节奏天然满足「每次刷新页面就读取一次」，问题完全在
宿主侧缓存。

## 目标

- 每次调用 `updateCheck` 都返回实时结果：本地版本号实时读盘 + registry 实时请求。
- 更新包之后无需重启服务，刷新页面即可看到正确的当前版本号 / 「有更新」胶囊消失。

## 非目标

- 不改变 op 协议（请求/响应结构不变）、不改变 UI 与 i18n 文案。
- 不改变 semver 比较逻辑、8 秒请求超时与网络失败静默降级行为。
- 不引入新的配置项或缓存策略开关（YAGNI）。

## 方案选型（已确认）

| 方案 | 说明 | 结论 |
| --- | --- | --- |
| A. 完全实时 | 去掉两层缓存，每次调用实时读盘 + 实时请求 registry | **采用**（用户明确选择） |
| B. 本地实时 + registry 短缓存 | registry 结果保留约 60s 缓存 | 备选，未采用 |
| C. 仅本地实时 | 只去掉本地版本缓存，保留 10 分钟 registry 缓存 | 未采用 |

请求量评估：触发频率 = 页面加载次数 + 每 5 分钟每标签页 1 次 + 内置更新成功后 1 次，
对 npm search 接口无压力；网络失败静默降级不变，不影响页面功能。

## 变更内容

### 1. `src/host/update.ts`（核心）

- 删除模块级 `installedVersionCache` 变量与 `resetInstalledVersionCache()` 导出。
- `readInstalledVersion()`：删除缓存短路，**每次调用都执行现有的候选路径解析 + 读盘 + 校验**
  （同步读取几 KB 的 JSON 文件，开销可忽略；同步语义保持，避免改动调用方式）。
- `checkPluginUpdate()`：删除 `cache` / `CACHE_MS` 及缓存命中分支；每次调用 = 实时读盘 +
  `fetchLatest()` 实时请求 + `isNewerVersion(latest, current)` 计算。
- 更新文件头注释与新函数 JSDoc：说明无进程内缓存的新语义及降级行为。

### 2. `src/host/ops.ts`

- 移除 `resetInstalledVersionCache` 导入；`pluginUpdateStatus` 的 `done` 分支不再调用它
  （版本号本身实时，无需失效动作），仅返回 status，并更新分支注释。
- `updateCheck` 分支注释由「宿主进程内缓存 10 分钟」改为「实时查询，网络失败静默降级」。

### 3. 过时注释清理（纯措辞）

提及「宿主缓存 10 分钟」「使版本缓存失效」的注释同步改为实时描述：

- `src/host/plugin-update.ts` 文件头注释；
- `src/client/plugin.tsx` 新版本检查段落注释；
- `src/client/components/FooterButton.tsx` 订阅 store 处注释。

## 数据流（改后）

```
页面加载 / 每 5 分钟 → updateCheck op → checkPluginUpdate()
  → readFileSync(被安装根目录 package.json)     [实时，校验 name === 'dsh-jenkins']
  → fetch(registry.npmjs.org/-/v1/search …)    [实时，8s 超时]
  → isNewerVersion(latest, current)
  → { current, latest, hasUpdate }             [任一来源失败静默降级，不打扰用户]
```

## 错误处理

维持现状：registry 非 200、超时、JSON 解析失败均返回空 `latest` 并计算
`hasUpdate:false`；package.json 读不到时回退 cwd 兜底，最终为空串。全部保持不变。

## 验证计划

- `pnpm check`（tsc 全量类型检查）通过；
- `pnpm verify`（scripts/verify-client.mjs）通过；
- `pnpm build` 成功产出 lib/；
- 手工验证：修改本地 package.json 的 version 后刷新页面，footer 当前版本随之变化
  （无需重启 dsh 服务）。

本项目无单元测试框架，以上为既有验证手段，不新增测试设施。
