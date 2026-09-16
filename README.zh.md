# dsh-jenkins

<p align="center">
  <img src="assets/preview/1.png" alt="dsh-jenkins 界面预览" width="800" />
</p>

**dsh-jenkins** 是基于 DeepSeek Harness（DSH）宿主的 Jenkins 服务器管理插件，
集中管理多台服务器与 Job，快速完成构建发布。

- **多服务器 / 多 Job 管理**：集中配置、统一管理多台 Jenkins 服务器及其 Job
- **一键发布**：参数化构建触发，实时跟踪「排队 → 构建中 → 结果」状态
- **日志与运维**：随时查看构建日志，支持停止 / 取消构建
- **中英双语**：界面跟随主界面语言切换

支持设置页、工作区入口与模型工具三种操作方式。

[English](README.md)

## 预览

设置页、工作区入口与执行/历史弹框的截图：见 [preview.md](preview.md)。

## 功能

- **设置 → Jenkins 配置** 页（`settings.section`）：多服务器增删改查、测试连接、
  跳过 TLS 校验。仅 **服务器地址** 与 **Token** 必填（用户名为选填，缺省 `admin`）。
- **项目配置**（`$DSH_HOME/dsh-jenkins-map.json`）：所有项目的发布目标集中在一个文件里
  —— 项目名 → 发布目标数组，元素结构与工作区配置文件完全一致
  （`{ name?, job, server, environments }`）。每个环境可用 **`name` 起显示名**
  （如 `uat环境` / `prod灰度` / `prod环境`），**环境数量不限**（留空按下标回退
  UAT / 生产 / 环境 N）。**各项目根目录的 `dsh-jenkins.json/js/ts` 会被自动发现**
  （以文件夹名为项目名，只补缺失、不覆盖已有项目），因此通常无需手工维护；
  需要手改时，「配置」tab 的**项目配置**一行点「编辑 map」即可（表单 / JSON 双模式）。
  详见下文「[项目配置（dsh-jenkins-map.json）](#项目配置dsh-jenkins-mapjson)」。
- **工作区入口**（`sidebar.footer.action`）：侧边栏底部的一组按钮 —— **Jenkins logo 按钮**
  （打开统一弹框）+ **历史按钮**（时钟图标，查看所有工作区最近 50 次发布记录，
  可按工作区筛选，默认全部）。
  执行弹框的「发布」tab 只有三行：**项目 → 服务器 → Job**，随后是参数表单回显 →
  提交构建 → 轮询状态（排队 → 构建中 → 结果，10 分钟超时）。
  **环境不单独占一行**：项目配置里每个环境本来就对应一台服务器，所以环境选择就落在
  【服务器】字段上 —— **下拉标签只显示插件里的服务器名**（不混入配置里的环境名，
  避免两套命名交叉显示），选中服务器即切到该环境对应的 Job / 参数。
  服务器按 **名称 / id / 完整地址 / 域名** 依次匹配配置里的 `server`（域名一级忽略协议、
  端口与上下文路径）；下拉取「项目配置引用过的服务器 ∩ 插件已配置服务器」的交集。
  上次发布的参数按项目记住，下次打开自动回显。
- **入口显隐**：侧栏入口跟随「在菜单中显示」偏好（默认开启），可在 **设置 → Jenkins 配置**
  分区页或执行弹框「配置」tab 顶部切换。关闭后入口渲染 null（不占位），宿主设置分区页
  仍保留 **打开 Jenkins 配置** 按钮，弹框始终可达（两处同一个偏好源，改一处即时同步）。
- **模型工具**（docs/develop/basic/tool）：`dsh_jenkins_build`、`dsh_jenkins_status`。
- **配置**（docs/develop/basic/config）：Schemastery `Config` + 插件数据文件
  `$DSH_HOME/dsh-jenkins.json`（服务器 Token 以 `$DSH_HOME/dsh-jenkins.key`
  机器绑定密钥加密，缓存明文）；项目配置是独立文件
  `$DSH_HOME/dsh-jenkins-map.json`（明文，可直接编辑）。首次运行时自动从旧版
  `settings.yaml` 的 `dsh-jenkins` 命名空间一次性迁移并清空旧数据；旧版写在
  `dsh-jenkins.json` 的 `projects` 字段也会自动迁到新文件（只补缺失）。
- **打包**（docs/develop/basic/publish）：`dsh.bundle` + `dsh.client`(web) manifest。

## 文件结构

```
├── src/host/*.ts       # 宿主半边源码：index.ts（入口）、jenkins.ts（curl 核心）、ops.ts（op 分发）、project-map.ts（项目配置文件）、projects.ts（归一化/合并）、workspace-config.ts、types.ts
├── src/client/*.tsx    # 浏览器半边源码（React TSX 组件）：设置页、底部入口、发布弹框、项目配置弹框、历史弹框
├── lib/index.js        # 宿主半边构建产物（tsdown，ESM），提交 git 以支持 git 安装
├── lib/client.js       # 浏览器半边构建产物（tsdown → __ModuleLoader__ 工厂），提交 git
├── lib/types/          # 类型声明（tsc -b 生成）
├── scripts/            # verify-client.mjs（模拟宿主 seed 表校验产物）+ 隔离测试
├── examples/           # 示例配置：dsh-jenkins.json（工作区数组格式）、dsh-jenkins-map.json（集中 map）
├── tsdown.config.ts    # tsdown 构建配置（node half + client bundle banner 包装）
├── tsconfig.json       # solution：引用 tsconfig.host.json / tsconfig.client.json
├── cordis.patch.yml    # 组合包 patch：按包名引用插件行（无路径）
├── package.json        # dsh.bundle + dsh.client(web) manifest + peerDependencies
├── README.md           # 英文文档（默认）
├── README.zh.md        # 本文档
└── preview.md          # 截图预览（引用 assets/preview/*.png）
```

## 工作区配置文件（dsh-jenkins.json / .js / .ts）

放在**工作区根目录**，**数组形式**，每个元素 = 一个发布目标（job + server +
environments 参数）。`.json` 直接解析；`.js` / `.ts` 经 node 求值
（`module.exports` 或 `export default`）：

```json
[
  {
    "job": "build-app",
    "server": "http://uat.example.com",
    "environments": { "BRANCH": "main", "DEPLOY": false }
  },
  {
    "job": "build-app",
    "server": "http://prod.example.com",
    "environments": { "BRANCH": "release-1.0", "DEPLOY": true }
  }
]
```

- 每个元素必填 `job`（Jenkins 任务路径，如 `build-app` 或 `folder/build-app`）与
  `server`（对应 设置 → Jenkins 里的服务器 name / id / 地址）。
- `environments`（选填）：该发布目标的参数键值（布尔值渲染为勾选框，其余为文本框）。
- 这类文件现在是**发现式配置**：插件会把它读进 [项目配置](#项目配置dsh-jenkins-mapjson)，
  以**工作区文件夹名**作为项目名（只补缺失，不覆盖已有项目）。「发布」tab 直接选该项目即可，
  服务器 / Job / 参数都会按当前环境自动带出。

## 项目配置（dsh-jenkins-map.json）

一份配置集中管理所有项目：**项目名 → 发布目标数组**。每个环境可选带一个
**`name` 显示名**（如 `uat环境` / `prod灰度` / `prod环境`），**环境数量不限**
（第 1 项为默认环境，通常写 UAT）；留空时界面按下标回退显示 `UAT` / `生产` / `环境 N`。
元素结构与工作区配置文件同构，可直接互相搬运：

```json
{
  "health-check-ui": [
    {
      "name": "uat环境",
      "job": "system3_Front_docker3",
      "server": "https://dev-jenkins-tx.whale-plus.com",
      "environments": {
        "project": "health-check-ui",
        "branch": "uat5",
        "NodeVersion": "v24.12.0",
        "INSTALL_COMMAND_ACTIVE": "pnpm i --registry=https://repo.huaweicloud.com/repository/npm/",
        "BUILD_COMMAND_ACTIVE": "pnpm build:uat"
      }
    },
    {
      "name": "prod灰度",
      "job": "pro_system3_Front_docker3_gray",
      "server": "https://jenkins-tx.whale-plus.com",
      "environments": {
        "project": "health-check-ui",
        "branch": "release/gray",
        "NodeVersion": "v24.12.0",
        "BUILD_COMMAND_ACTIVE": "pnpm build:gray"
      }
    },
    {
      "name": "prod环境",
      "job": "pro_system3_Front_docker3",
      "server": "https://jenkins-tx.whale-plus.com",
      "environments": {
        "project": "health-check-ui",
        "branch": "master5",
        "NodeVersion": "v24.12.0",
        "BUILD_COMMAND_ACTIVE": "pnpm build:prod"
      }
    }
  ]
}
```

- **存储位置**：独立文件 **`$DSH_HOME/dsh-jenkins-map.json`**（裸 map，无包装层，
  明文；缺失时按空 map 处理，损坏时备份 `.bak` 后按空处理）。旧版把项目配置写在
  `dsh-jenkins.json` 的 `projects` 字段，首次启动会自动迁到新文件（只补缺失）。
- **name（环境显示名）**：选填；写空串等于不写（不会落 `"name": ""`）。
  发布时它出现在【服务器】下拉标签与「本机记录」里，一眼看出这次发的是哪个环境。
- **环境数量不限**：一个项目可以有任意多个发布目标（UAT / 灰度 / 生产 / 海外…），
  数组顺序即显示顺序，第 1 项为默认环境。
- **发现式配置**：打开「配置」/「发布」tab 时会扫描**所有已打开工作区**根目录的
  `dsh-jenkins.json/js/ts`，以**文件夹名**作为项目名合并进 map ——
  **默认只补缺失、不覆盖已有项目**；手改过的同名项目不会被冲掉。
  需要按工作区里的最新配置更新时，在弹框底部勾选「覆盖同名项目」再点「重新发现」。
- **编辑**：「配置」tab 一行的**项目配置**（`dsh-jenkins-map.json · N 个项目`）点
  「编辑 map」打开弹框：
  - **表单**：项目列表，每个环境一行 = 环境名（选填，placeholder 显示回退名）+ Job +
    服务器 + 「N 项参数」（点开编辑参数键值对，值可指定文本·数字·布尔）+ 逐行删除；
    「添加环境」不设上限，可增删项目 / 环境 / 参数；
  - **JSON**：整个 map 的 JSON 直接编辑（可整段粘贴你自己的配置），「应用 JSON」写回表单。
- **server 写法与匹配**：可写服务器**名称 / id / 完整地址 / 纯域名**；与 设置 → Jenkins
  里配置的服务器按 **名称 → id → 完整地址（去尾部斜杠）→ 域名** 依次匹配 ——
  域名一级忽略协议、端口与上下文路径（`http://jenkins-tx.example.com:8080/jenkins`
  与配置里的 `https://jenkins-tx.example.com` 视为同一台）。一台都没匹配上时，发布 tab
  在服务器行下方给出提示，下拉退化为全部服务器。
- **一键发布**：「发布」tab 的**项目下拉**列出 map 里的项目；选中后**环境由【服务器】下拉
  直接切换**（下拉标签就是插件里的服务器名，不显示配置里的环境名），Job 与参数随该环境的
  发布目标自动带出，直接「提交构建」。发布记录按「项目配置：项目名」归组在「本机记录」tab
  （可按该项目筛选 / 清空），每条记录还会标出发布的环境名。
- **手工编辑**：文件本身就是 map，可直接用编辑器打开改；保存后回到界面即生效
  （每次读取都重新解析文件）。

## 安装

```sh
# 本地开发
dsh plugin --profile web add ./dsh-jenkins

# 发布后：npm / tarball / GitHub
dsh plugin --profile web add dsh-jenkins
dsh plugin --profile web add ./dsh-jenkins-0.1.4.tgz
dsh plugin --profile web add github:you/dsh-jenkins#<sha>

dsh --profile web --dump-config   # 验证配置层
dsh --profile web                 # 启动（宿主半边需重启才生效）
```

> **本地开发依赖**：宿主加载 `index.js` 时按 Node 原生 ESM 解析 `@deepseek-ai/schemastery`、
> `@deepseek-ai/dsh-tools`、`@deepseek-ai/dsh-settings`，因此插件目录内必须有可解析的
> `node_modules`（已被 `.gitignore` 忽略）。两种做法任选其一：
> 1. 在插件目录执行 `pnpm install`（这三个包已声明为 devDependencies）；
> 2. 或把宿主扁平回退目录对应包链接进来，如：
>    ```powershell
>    New-Item -ItemType Directory "$PWD\node_modules\@deepseek-ai" -Force
>    foreach ($p in 'schemastery','dsh-tools','dsh-settings') {
>      New-Item -ItemType Junction "$PWD\node_modules\@deepseek-ai\$p" -Target "$env:DSH_HOME\profiles\node_modules\@deepseek-ai\$p"
>    }
>    ```

静态默认服务器也可写在 profile 的 `cordis.patch.yml`：

```yaml
- insert:
    - id: dsh-jenkins
      name: dsh-jenkins
      config:
        servers:
          - id: prod
            name: 生产环境
            baseUrl: https://jenkins.example.com
            username: admin
            token: <API Token 或密码>
            insecure: false
```

## 发布

构建工具为 **tsc + tsdown**（与 `@lemcae/dsh-balance` 等同类插件一致，不使用
vite）：`tsc -b` 做类型检查并生成声明文件，`tsdown`（rolldown 内核）分别打包
宿主半边（`lib/index.js`，ESM）与浏览器半边（`lib/client.js`，CJS 单文件
`__ModuleLoader__` 工厂，banner 自动包装）。依赖管理使用 **pnpm 10**（Node
26，lock 提交 `pnpm-lock.yaml`，CI 以 `--frozen-lockfile` 严格安装）：

```sh
pnpm install     # 安装依赖（按 pnpm-lock.yaml）
pnpm run build   # 清理 lib → tsc -b（类型 + 声明）→ tsdown（两半产物）
pnpm run verify  # 模拟宿主模块表校验 lib/client.js 可加载（可选）
pnpm publish     # 或 pnpm pack / git push origin main（lib/ 已提交，git 安装无需构建）
```

### 自动发布（GitHub Actions）

推送 `v*` tag（`pnpm run release` 会升级 patch 版本、重建产物并自动打标签）触发
[`.github/workflows/publish.yml`](.github/workflows/publish.yml)：

- **release job**：Setup Node 26 → `pnpm install --frozen-lockfile` →
  `pnpm run check`（tsc -b）→ `pnpm run build`（tsc -b && tsdown）→
  `pnpm pack` → 创建 GitHub Release（自动生成 changelog，附 tarball）；
- **publish-npm job**：发布到 npm，需要仓库配置 Secret `NPM_TOKEN`
  （Settings → Secrets and variables → Actions），缺失时快速失败并给出提示。

## 开发

环境要求：**Node ≥ 26 + pnpm 10**（`package.json` 的 `packageManager` 字段固定
pnpm 版本）。

```sh
pnpm install           # 安装 devDependencies（typescript、tsdown、@types/react、@deepseek-ai/* 类型包等）
pnpm run check         # 全仓 TypeScript 类型检查（tsc -b）
pnpm run build         # 修改源码后重建两半产物（tsc -b && tsdown）
pnpm run watch         # tsdown 监听模式（改 src/client 自动重建）
pnpm run verify        # 模拟宿主 seed 表校验 lib/client.js 可加载
pnpm run test          # 隔离测试：curl -D 输出解析（含代理 CONNECT 隧道块）+ 失败日志 + 参数解析 + 项目配置
pnpm run test:params   # 参数解析：内置类型 / uno-choice / Extended Choice / 构建页选项兜底
pnpm run test:store    # 数据文件往返：token 加密 / 迁移 / 保留 Token 语义
```

- 宿主半边源码在 `src/host/`，浏览器半边在 `src/client/`（构建入口
  `src/client/index.ts`，直接导出 `{ name, inject, apply }`）；
- 浏览器半边产物 `lib/client.js` 由 tsdown 的 banner/intro/footer 生成
  `window.__ModuleLoader__.load` 工厂包装（无需手写 wrap 脚本）；
- 构建产物外部依赖（`react`、`@deepseek-ai/dsh-client-ui-primitives` 等）保持
  external，运行时解析自宿主模块表（seed）。

## 任务参数识别

「发布」tab 的参数表单按 Jenkins 服务端的参数定义渲染：

| 服务端类型 | 界面 |
| --- | --- |
| `StringParameterDefinition` / uno-choice 动态引用 | 单行文本 |
| `TextParameterDefinition` | 多行文本 |
| `BooleanParameterDefinition` | 勾选框 |
| `PasswordParameterDefinition` / `CredentialsParameterDefinition` / `FileParameterDefinition` | 密码框 / 文本框 |
| `ChoiceParameterDefinition`（classic）、uno-choice `ChoiceParameter` / `CascadeChoiceParameter`、Extended Choice 单选 | 可搜索下拉 |
| Extended Choice 多选 / uno-choice `MultiSelectParameter` | 勾选列表（按分隔符拼接提交） |

- **脚本生成的选项**（Active Choices / uno-choice 的 `ChoiceParameter`、`CascadeChoiceParameter`）在
  REST `/api/json` 里只有 `_class` + 默认值，选项要渲染时才由 Groovy 算出来。这类参数会**自动回落到
  构建页 HTML**（`job/<path>/build`）解析 `<select>` 的选项 —— 因此 `project` 这种下拉能正确列出
  全部项目；解析不到时降级为文本框并在表单里给出提示，不会出现「空下拉框」。
- **默认值**同时兼容 `defaultValue`（内置类型）与 `defaultParameterValue.value`（插件类型，
  如 uno-choice），因此像 `project=boss_backend` 这样的默认值会正确回填。
- **分隔行**：uno-choice 的 `DynamicReferenceParameter`（`name` 为空）不会变成空字段 ——
  纯横线的一律丢弃；带文字的渲染成虚线条备注。
- 同名参数只保留第一个；未识别的类型按文本处理。

## 失败排查（日志）

任何一次失败的请求（Job 列表 / 任务详情 / 构建历史 / 触发 / 状态查询 / 构建日志 / 连接测试…）
都会写入 **`$DSH_HOME/dsh-jenkins.log`**（与 `dsh-jenkins.json` 同目录，Windows 默认
`C:\Users\<用户>\.dsh\dsh-jenkins.log`），格式为 JSONL —— 一行一条失败记录：

```json
{"time":"2026-09-14T07:02:19.949Z","level":"error","op":"jobs","code":"http-401",
 "message":"认证失败（HTTP 401）：用户名或 Token 不正确","server":"腾讯云UAT <https://jenkins.example.com>",
 "user":"jason","request":"GET /api/json?tree=jobs[...]","httpStatus":401,"httpStatuses":[200,401],
 "curlExit":0,"curlStderr":"","bodySnippet":"<html>...Error 401 Unauthorized...</html>"}
```

- 记录内容：op、错误码、消息、服务器（名称 + 地址）、请求行、HTTP 状态码、**全部响应块状态码**、
  curl 退出码与 stderr、响应体片段、会话 id；
- `httpStatuses` 形如 `[200, 401]` = 走了 HTTP 代理时先打印代理 CONNECT 隧道块的 200，
  再是真实响应块的状态 —— 真实状态以最后一个为准；
- 脱敏：不记录 Token / Basic 凭据 / URL 内嵌凭据 / Jenkins crumb；正文片段截断到 600 字符；
- 单文件超过 2MB 自动轮转为 `dsh-jenkins.log.1`（只保留一份历史）；写日志失败不影响主流程。

### 「加载 Job 列表失败」的常见原因

| 现象（日志 field / 客户端文案） | 原因 |
| --- | --- |
| `code=parse-failed`，`bodySnippet` 以 `HTTP/1.1` 开头 | **HTTPS 经 HTTP 代理**（`https_proxy`）时 curl 的 `-D -` 会先输出代理 `200 Connection Established` 隧道块；旧实现按第一个空行切分，把真实响应头当成正文。已在 `parseCurlDump` 中按块解析修复 |
| `code=auth-failed`（HTTP 401） | 用户名 / Token 不正确或已失效（重新在设置里测试连接） |
| `code=forbidden`（HTTP 403） | Token 权限不足 / CSRF 缺失 / 反代拦截 |
| `code=network-failed`，`curlExit=7/28/35/60` | DNS、连接被拒（7）、超时（28，请求上限 40s）、TLS 握手（35）、自签名证书（60，勾选「忽略证书」或改用 `-k`） |
| `code=redirect` | 地址不是最终地址（如 `http://` 需要跳 `https://`、少了上下文路径）；未跟随重定向，日志里有 `Location` |
| `code=response-too-large` | 响应超过宿主 8MB 收集上限（只保留尾部），大实例请缩小请求范围 |
| `code=empty-response` | 未取到 HTTP 响应头：代理吞响应 / 连接被中断 / 响应被截断 |
| `code=server-missing` | 客户端缓存的服务器 id 在配置中已不存在（重新选择服务器） |
| `code=curl-unavailable` | 宿主 subprocess 服务不可用 / curl 无法启动 |
| `stage=route-guard` | 请求未通过 `/dsh-jenkins/api` 信任围栏（非回环 Host、跨站标记）——此时请求根本没到插件逻辑 |
| Job 列表为空但不是失败 | 三层 tree 之外的深层文件夹会以 `folder` 占位返回并被前端过滤；该实例的 Job 层级过深 |

## 实现说明

- Jenkins REST：`curl.exe`（经宿主 `subprocess` 服务直接 spawn），Basic 认证 + CSRF crumb +
  `--data-binary @-`（表单体经 stdin，UTF-8 无 BOM）；`-D -` 输出按**响应块**解析
  （`parseCurlDump`：跳过代理 CONNECT / 1xx 中间块，取最后一个真实块的状态码与
  `Location`），真实状态码不会再被隧道块的 200 掩盖。
- 失败请求统一落 `$DSH_HOME/dsh-jenkins.log`（见上节）：`jenkins.ts` 记录 HTTP / curl 层证据，
  `index.ts` 在路由（route）、命令（command）、模型工具（tool）三个入口记录 op 级失败。
- 浏览器↔宿主：默认走 `webServer` 注册的 `/dsh-jenkins/api`（fetch POST JSON → `{ ok, value }`
  信封，带信任围栏）；老宿主自动回退命令通道 `ctx.remote.commands.execute(sessionId, '/dsh-jenkins <json>')`。
  宿主错误带 `code`，客户端按语言本地化（未覆盖的兜底显示原文）。
- 项目配置的 op 只有三个：`mapLoad`（读 + 自动发现只补缺失）、`mapSave`（整体替换，允许清空）、
  `mapDiscover`（显式重新发现，可选覆盖同名）；`workspaceConfig` / `configParseContent` /
  `workspaceTrigger` 仍在宿主保留（命令通道可用），但界面已不再暴露文件选择器路径。
- peerDependencies（`@deepseek-ai/cordis`、`dsh-tools`、`schemastery`、`dsh-settings`、
  `dsh-commands`、`dsh-session`、`dsh-api-remotes`、client-runtime/ui-slots/ui-settings/
  cordis-client-runner、`react`）由宿主安装时解析。
- **未修改官方 deepseek-harness 项目**：全部能力走现有 slot（`sidebar.footer.action`、
  `settings.section`、`shell.overlay`）与命令传输。
- **样式隔离**：注入的样式表除一条刻意保留的例外，全部限定在 `.dshj-*` 作用域内 ——
  `:where(div:has(> [data-slot="sidebar.footer.action"] > .dshj-footer-group)){flex-direction:column}`
  用于把宿主 footer 容器从默认 flex 横排改为纵向堆叠（否则多个插件入口会被挤在一行）。
  它只可能命中「容器内已存在本插件入口」的那一层，且外层 `:where()` 把优先级压到 0，
  宿主随时可覆盖。动画名统一 `dshj-` 前缀，style 标签带 `data-plugin-css="dsh-jenkins/settings.css"`
  标记；没有其它全局选择器，不写 `:root`/`body`/`*`，也不修改 body 行内样式。
- **弹框配色**：与 dsh-get-balance 同一套 —— `rgba(0,0,0,.32)` 蒙版 + `blur(12px) saturate(1.2)`、
  `color-mix(bg-layer-1 78%)` 玻璃面板 + `border-l2` 细描边 + 14px 圆角、`border-l1` 头/脚分隔线、
  主按钮与选中 tab 用实心 `button-primary-fill`（半透明填充会把宿主单色主色 #0f1115 / #f9fafb
  冲淡成灰）、输入框与下拉面板 `bg-base`、卡片 `bg-layer-2`、状态文字走 `state-*` 令牌。

