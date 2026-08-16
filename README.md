# dsh-jenkins-cli

DeepSeek Harness 插件（**双面**：宿主 + 浏览器）：设置页管理多台 Jenkins 服务器与 Token，
模型工具触发构建 / 查询状态；工作区级「执行 Jenkins Job」入口。无硬编码路径、纯 ESM、
可发布到 npm / GitHub。

- **宿主半边**（`index.js`）：`name` / `Config`(Schemastery) / `inject` / `apply`；settings
  namespace 持久化服务器配置；`dsh-jenkins-cli` 命令（设置页 / 工作区入口调用）；
  `dsh_jenkins_build` / `dsh_jenkins_status` 工具；`workspaceConfig` / `workspaceTrigger` op
  （读取并执行工作区根目录的 `dsh-jenkins-cli.{json,js,ts}` 配置）。
- **浏览器半边**（`client.js`，`__ModuleLoader__` bundle）：
  - 设置 → **Jenkins** 页（多服务器增删改查 + 测试连接）；
  - 侧边栏底部按钮：**当前工作区根目录存在 `dsh-jenkins-cli.{json,js,ts}` 配置时**显示，
    点击打开「执行 Jenkins Job」弹框——**环境 Tab（dev/uat/prod…）切换 → 参数表单回显 →
    提交构建 → 轮询状态**。
- **参考实现**：[@lemcae/dsh-balance](https://github.com/LemCAE/dsh-balance)（同样的双面结构，
  在设置界面添加「DeepSeek 余额」菜单）。
- **不改官方项目**：所有能力均通过现有 slot（`sidebar.footer.action` / `settings.section` /
  `shell.overlay`）与 `ctx.remote.commands.execute` 实现，未修改 deepseek-harness 任何源码。

## 文件结构

```
├── index.js            # 宿主半边：配置 + settings namespace + 命令 + 模型工具 + 工作区配置 op
├── client.js           # 浏览器半边：设置页「Jenkins」+ 侧边栏入口 + 环境 Tab 弹框
├── index.d.ts          # 宿主类型声明
├── cordis.patch.yml    # 组合包分发层：按包名 dsh-jenkins-cli 引用插件行（无路径）
├── package.json        # dsh.bundle + dsh.client(web) manifest + peerDependencies
└── README.md
```

## 工作区配置文件（dsh-jenkins-cli.json / .js / .ts）

放在**工作区根目录**，定义 job、目标服务器与多环境参数（支持 JSON；`.js`/`.ts` 用
`export default` 或 `module.exports` 导出同一结构，经 node 求值）：

```json
{
  "job": "build-app",
  "server": "生产环境",
  "environments": {
    "dev":  { "BRANCH": "main",        "DEPLOY": false },
    "uat":  { "BRANCH": "develop",     "DEPLOY": false },
    "prod": { "BRANCH": "release-1.0", "DEPLOY": true  }
  }
}
```

- `job`：Jenkins 任务路径（必填），如 `build-app` 或 `folder/build-app`；
- `server`：服务器名称（对应 设置 → Jenkins 里的服务器 name；缺省用唯一一台服务器）；
- `environments`：环境名 → 参数键值（布尔值渲染为勾选框，其余为文本框）。

有该文件时，侧边栏底部出现「Jenkins」按钮 → 弹框内按环境 Tab 切换、回显参数、提交构建、
轮询状态（排队 → 构建中 → 结果，10 分钟超时）。

## 配置

- 运行期：在界面 **设置 → Jenkins** 添加服务器（名称/地址/用户名/Token），
  持久化到 `$DSH_HOME/settings.yaml`（settings namespace，base 层来自 cordis.yml）。
- 静态默认值（可选）：在 profile 的 `cordis.patch.yml` 中写 `config.servers`：

```yaml
- insert:
    - id: dsh-jenkins-cli
      name: dsh-jenkins-cli
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

## 安装到 profile

```sh
dsh plugin --profile web add ./dsh-jenkins-cli   # 本地开发
dsh plugin --profile web add dsh-jenkins-cli        # npm
dsh plugin --profile web add ./dsh-jenkins-cli-0.1.3.tgz
dsh plugin --profile web add github:you/dsh-jenkins-cli#<sha>
dsh --profile web --dump-config
dsh --profile web
```

> 手动注册（跳过 pnpm）时：在 profile 的 `package.json` 加依赖
> `"dsh-jenkins-cli": "link:<仓库路径>/dsh-jenkins-cli"` + `dsh.profile.bundles` 追加
> `"dsh-jenkins-cli"`，并在 `node_modules/dsh-jenkins-cli` 建到插件目录的 junction。
> 任何改动后需**重启 web 服务**生效。

## 模型工具

- `dsh_jenkins_build(server, job, parameters?)` → 触发构建
- `dsh_jenkins_status(server, job, buildNumber?)` → 构建状态与结果

## 实现说明

- Jenkins REST：`curl.exe`（宿主 shell 服务），Basic 认证 + CSRF crumb + `--data-binary @-`
  （表单体经 stdin，UTF-8 无 BOM），`-D -` 解析状态码与 `Location`。
- 浏览器↔宿主：`ctx.remote.commands.execute(sessionId, '/dsh-jenkins-cli <json>')`，
  宿主命令返回 JSON 文本（同 dsh-balance 模式）。
- 依赖（peerDependencies）由宿主解析：`@deepseek-ai/cordis`、`dsh-tools`、`schemastery`、
  `dsh-settings`、`dsh-commands`、`dsh-session`、`dsh-api-remotes`、client-runtime / ui-slots /
  ui-settings / cordis-client-runner、`react`。


