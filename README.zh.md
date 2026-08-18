# dsh-jenkins

DeepSeek Harness 插件（**双面**：宿主 + 浏览器）：管理多台 Jenkins 服务器与 Token，
支持设置页配置、模型工具触发构建、工作区级「执行 Jenkins Job」入口。无硬编码路径、
纯 ESM、可发布到 npm / GitHub。界面文案中英双语（跟随主界面语言）。

[English](README.md)

## 功能

- **设置 → Jenkins 配置** 页（`settings.section`）：多服务器增删改查、测试连接、
  跳过 TLS 校验。仅 **服务器地址** 与 **Token** 必填（用户名为选填，缺省 `admin`）。
- **工作区入口**（`sidebar.footer.action`）：当当前工作区根目录存在
  `dsh-jenkins.{json,js,ts}` 配置时，侧边栏底部出现一组按钮——**Jenkins logo 按钮**
  （打开执行弹框）+ **历史按钮**（时钟图标，查看所有工作区最近 50 次发布记录，
  可按工作区筛选，默认全部）。
  执行弹框内**服务器 / Job 可搜索下拉选择 → 参数表单回显 → 提交构建 → 轮询状态**
  （排队 → 构建中 → 结果，10 分钟超时）。服务器下拉取「配置引用过的服务器 ∩
  插件已配置服务器」的交集，选中服务器后自动预选配置里对应的 Job 并回填参数；
  同一工作区上次发布时提交的 **服务器 / Job / 参数**会被记住，下次打开弹框自动回显
  （浏览器 `localStorage`）。配置文件缺失或解析/校验失败时视为未配置，不显示入口。
- **模型工具**（docs/develop/basic/tool）：`dsh_jenkins_build`、`dsh_jenkins_status`。
- **配置**（docs/develop/basic/config）：Schemastery `Config` + settings namespace
  将界面编辑持久化到 `$DSH_HOME/settings.yaml`（服务器列表以 JSON 字符串存储，
  规避 settings 冻结数组陷阱）。
- **打包**（docs/develop/basic/publish）：`dsh.bundle` + `dsh.client`(web) manifest。

## 文件结构

```
├── index.js            # 宿主半边：Config、settings namespace、dsh-jenkins 命令、模型工具、工作区配置 op
├── client.js           # 浏览器半边（__ModuleLoader__ bundle）：设置页、底部入口、执行弹框（可搜索下拉 + 上次参数回显）
├── index.d.ts          # 宿主类型声明
├── cordis.patch.yml    # 组合包 patch：按包名引用插件行（无路径）
├── package.json        # dsh.bundle + dsh.client(web) manifest + peerDependencies
├── README.md           # 英文文档（默认）
└── README.zh.md        # 本文档
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
- 弹框服务器下拉取**配置引用过的服务器 ∩ 插件已配置服务器**的交集，选中后自动
  预选该服务器对应的 `job`（不在 Jenkins 任务列表里则留空由用户选择）并回填参数；
  交集为空时降级为显示全部服务器并提示。配置缺失或无效时视为未配置，不显示入口。

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

```sh
npm publish            # 纯 JS，无需构建
npm pack               # 或 tarball
git push origin main   # 或 GitHub（纯 JS 包 git 安装无需 prepare 授权）
```

## 实现说明

- Jenkins REST：`curl.exe`（经宿主 `shell` 服务），Basic 认证 + CSRF crumb +
  `--data-binary @-`（表单体经 stdin，UTF-8 无 BOM）；`-D -` 解析状态码与 `Location`。
- 浏览器↔宿主：`ctx.remote.commands.execute(sessionId, '/dsh-jenkins <json>')`，
  宿主错误带 `code`，客户端按语言本地化（未覆盖的兜底显示原文）。
- peerDependencies（`@deepseek-ai/cordis`、`dsh-tools`、`schemastery`、`dsh-settings`、
  `dsh-commands`、`dsh-session`、`dsh-api-remotes`、client-runtime/ui-slots/ui-settings/
  cordis-client-runner、`react`）由宿主安装时解析。
- **未修改官方 deepseek-harness 项目**：全部能力走现有 slot（`sidebar.footer.action`、
  `settings.section`、`shell.overlay`）与命令传输。

