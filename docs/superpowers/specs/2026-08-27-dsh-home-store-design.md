# dsh-jenkins 数据迁移到 $DSH_HOME 自定义文件 —— 设计规格

日期：2026-08-27
状态：已批准（用户确认设计）

## 背景与动机

当前插件把两类运行数据都持久化到 DSH 宿主默认设置（`$DSH_HOME/settings.yaml` 的
`dsh-jenkins` 命名空间，经 `@deepseek-ai/dsh-settings`）：

- `serversJson` —— 多服务器配置（名称 / 地址 / 用户名 / Token 凭据）
- `cacheJson` —— 浏览器缓存（发布参数回显 `lastParams` + 发布历史 `history`）

用户希望插件数据不再写入宿主默认设置，改为 $DSH_HOME 下的自定义文件，并满足：

1. 缓存明文存储；服务器 Token 加密存储（防止文件被直接打开 / 误提交时泄露凭据）。
2. 首次运行时若发现旧 settings 数据，**一次性自动迁移**到新文件；迁移后新文件为
   唯一数据源，不再读写 settings.yaml 中的 `dsh-jenkins` 命名空间。
3. 不做常驻的旧版兼容/回退逻辑（无双写、无持续读取旧存储），因此没有"后续删除
   兼容代码"的负担。

## 决策记录

| 主题 | 决策 |
| --- | --- |
| 迁移范围 | 缓存 + 服务器配置（含凭据）都迁出 settings.yaml |
| 文件位置 | `$DSH_HOME` 下（跟随 DSH 安装，所有工作区共用一份） |
| 凭据加密 | 机器绑定 AES-256-GCM 密钥文件（首次运行自动生成，用户零配置） |
| 兼容策略 | 一次性迁移；迁移完成后不再读写旧存储（不做持续兼容） |
| 旧数据清理 | 迁移成功后清空旧 settings 命名空间，settings.yaml 不再残留插件数据 |
| 文件名 | `$DSH_HOME/dsh-jenkins.json`（数据文件）+ `$DSH_HOME/dsh-jenkins.key`（密钥） |

> 说明：工作区根目录已存在 `dsh-jenkins.json`（部署目标配置，数组格式，用户手工
> 维护）。$DSH_HOME 下的同名文件是插件数据文件，目录不同互不冲突；README 注明两者
> 语义区别。

## 新文件格式

### `$DSH_HOME/dsh-jenkins.json`

```json
{
  "version": 1,
  "servers": [
    {
      "id": "srv-…",
      "name": "…",
      "baseUrl": "https://…",
      "username": "…",
      "token": "enc:v1:<ivBase64>:<tagBase64>:<cipherBase64>",
      "insecure": false,
      "verified": false
    }
  ],
  "cache": {
    "lastParams": { "<cwd>": { "serverId": "…", "jobPath": "…", "parameters": { … } } },
    "history": { "<cwd>": [ { "id": "…", "time": 123, "job": "…", … } ] }
  }
}
```

- `version` 固定为 `1`，为将来格式演进预留。
- `servers` 与 `cache` 与现有 `ServerConfig[]` / `CacheShape` 结构一一对应，
  仅 `token` 字段加密。
- 未配置任何服务器 / 无缓存时，对应字段为 `[]` / `{}`。

### `$DSH_HOME/dsh-jenkins.key`

- 32 字节随机（`crypto.randomBytes(32)`），存 base64 文本。
- 首次需要写凭据时自动生成；已存在则复用。
- 写入后尝试收紧权限：POSIX `chmod 0600`；Windows 尽力而为（icacls 不强制，
  文档提示用户注意文件安全）。

### 加密格式（token 字段）

- 密文表示：`enc:v1:<ivBase64>:<tagBase64>:<cipherBase64>`
- 算法：`aes-256-gcm`；每次加密随机 12 字节 IV；认证标签随密文存储。
- 空 token 不加密（存空字符串），解密失败（密钥缺失/损坏/被篡改）时该 token
  视为空并告警，不崩溃。

## 路径解析

不硬编码任何绝对路径。优先级：

1. **settings 服务 `documentPath` 的目录**（`@deepseek-ai/dsh-settings` 提供，
   指向宿主实际使用的设置文件；dirname 即 $DSH_HOME 的真实位置，最准确）。
2. `process.env.DSH_HOME`（非空时）。
3. `~/.dsh`（`os.homedir()` 拼接）。

新增 `src/host/store.ts` 中的 `resolveStoreDir()` 实现上述逻辑；不新增
peerDependency（复用宿主已有的 `node:fs` / `node:crypto` / `node:os`）。

## 模块划分

### 新增 `src/host/store.ts`

文件存储层，职责单一：

- `resolveStoreDir(settingsDocPath: string | undefined): string` —— 按上述优先级
  解析目录（内部缓存）；调用方传入 settings 服务的 `documentPath`。
- `loadStore(): Promise<Store>` —— 读 `dsh-jenkins.json`；文件不存在返回空 store；
  损坏时备份为 `dsh-jenkins.json.bak` 后返回空 store 并告警。
- `saveStore(store): Promise<void>` —— 进程内串行队列 + 临时文件 rename 原子写
  （`dsh-jenkins.json.tmp` → rename），对应 settings 的写串行化语义。
- `encryptToken(plain): string` / `decryptToken(cipher): string` —— 加解密，
  密钥文件自动生成 / 复用。
- `migrateOnce(legacyRead, store): Promise<boolean>` —— 一次性迁移：读旧 settings
  （`serversJson` / `cacheJson`），加密 token 后写入新文件，成功后返回 true。

接口约束：不依赖 ops 层；`servers` 复用 `types.ts` 的 `ServerConfig`；`cache` 按
现有契约保持 `Record<string, unknown>`（`OpsDeps.readCacheJson` 的返回类型），
宿主侧不引入 client 的 CacheShape 类型。

### 修改 `src/host/index.ts`

- `apply()` 中：
  - 仍注册 settings namespace（`settingsNamespace('dsh-jenkins')`）仅用于**读取旧
    数据**；注册后立即触发一次 `migrateOnce`（同步读 scope.get()，异步写文件）。
  - 迁移成功后：清空旧 namespace（`scope.update({ serversJson: '[]', cacheJson: '{}' })`
    ）并记录日志。
  - 迁移失败（写文件失败）：保留旧 namespace 数据（下次启动重试），告警。
- `readServers` / `writeServers` / `readCacheJson` / `writeCacheJson` 改为基于
  store：内存 store 镜像 + `loadStore` / `saveStore`。settings namespace 不再被
  这两个函数读写。
- 移除 `JenkinsSettingsSchema` 的常驻使用（保留在迁移读取处）。
- `findServer`、deps 组装、HTTP 路由、命令、模型工具均不变。

### 修改 `src/host/ops.ts`

- `OpsDeps` 接口不变（`readServers/writeServers/readCacheJson/writeCacheJson`
  签名相同），所有分支无需改动。
- 仅注释更新（$DSH_HOME/dsh-jenkins.json 替代 settings.yaml 说明）。

### 客户端

- **零改动**：`cacheGet` / `cacheSet` 语义不变，客户端不感知存储后端变化。

## 一次性迁移流程（apply 时）

```
apply()
 ├─ resolveStoreDir()
 ├─ loadStore()
 ├─ 新文件存在且有效？
 │   ├─ 是 → 使用新文件，完全不碰 settings（唯一数据源）
 │   └─ 否 → 读旧 settings namespace（serversJson / cacheJson）
 │        ├─ 有旧数据 → 加密 token → saveStore → 成功后清空旧 namespace + 日志
 │        ├─ 无旧数据但 config.servers 非空 → 作为种子写入新文件（加密）
 │        └─ 无任何数据 → 全新安装，不建文件（首次保存时创建）
 └─ 后续所有读写只走 store
```

- 迁移是幂等的：新文件一旦写入成功，下次启动直接走新文件分支。
- 迁移失败不阻塞启动：保留旧数据，内存态继续，下次重试。

## 并发与容错

| 场景 | 行为 |
| --- | --- |
| 并发写（轮询 + 用户操作同时 cacheSet） | 进程内 promise 串行队列，逐个落盘 |
| 写中途崩溃 | 临时文件残留，rename 前主文件不受影响；下次启动忽略 .tmp |
| 密钥缺失/损坏 | 告警；受影响 token 视为空，UI 提示重新填写 |
| 数据文件 JSON 损坏 | 备份 `.bak`，从空 store 开始，告警 |
| 写失败（权限等） | 内存镜像继续，告警（与现有 cacheSet 容错一致） |

## 文档更新

- README.md / README.zh.md：
  - 「配置持久化」段落改为：插件数据存 `$DSH_HOME/dsh-jenkins.json`（服务器 Token
    加密）与 `dsh-jenkins.key`（密钥）；首次运行自动从旧版 settings.yaml 迁移。
  - 注明工作区 `dsh-jenkins.json`（部署目标）与 `$DSH_HOME/dsh-jenkins.json`
    （插件数据）的区别。
- `src/host/index.ts`、`src/host/ops.ts`、`src/client/storage.ts` 顶部注释同步更新。

## 测试计划

- `npm run check`（tsc -b）通过。
- `npm run build` + `npm run verify`（client bundle 校验）通过。
- 手动验证（在安装插件的 DSH 宿主中）：
  1. 全新环境：不产生 `dsh-jenkins.json`，首次保存服务器后生成且 token 为 `enc:v1:…`。
  2. 旧环境（settings.yaml 有数据）：启动后自动迁移，新文件出现、旧 namespace 被
     清空、UI 服务器列表与历史记录完整保留。
  3. 删除密钥文件：启动告警，服务器 token 视为空，其余功能正常。
  4. 手工破坏 dsh-jenkins.json：启动告警并生成 `.bak`，从空开始。

## 范围外（明确不做）

- 不做用户口令派生密钥 / 跨机器移植解密（机器绑定密钥设计使然）。
- 不修改工作区部署配置（`dsh-jenkins.json` 数组格式）的语义。
- 不做常驻旧版兼容读取（一次性迁移后旧存储不再被使用）。
