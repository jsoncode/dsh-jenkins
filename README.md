# dsh-jenkins-cli

A DeepSeek Harness plugin (dual-face: host + browser) for managing multiple Jenkins
servers and triggering jobs — from a Settings page, from model tools, and from a
per-workspace "Run Jenkins Job" entry. No hardcoded paths, plain ESM, publishable to
npm / GitHub. UI copy is bilingual (Chinese / English, following the host UI language).

[中文文档](README.zh.md)

## Features

- **Settings → Jenkins Cli Config** page (`settings.section`): add / edit / delete
  multiple servers (URL, username, Token), test connections, skip TLS verification.
  Only **Server URL** and **Token** are required (username defaults to `admin`).
- **Workspace entry** (`sidebar.footer.action`): a footer group with the **Jenkins
  logo button** (opens the Run Jenkins Job modal) and a **History button** (clock
  icon, publish history of the last 50 runs across all workspaces, filterable by
  workspace — defaults to All) appears when the current workspace root contains a
  `dsh-jenkins-cli.{json,js,ts}` config file.
  The modal has **searchable dropdowns** for server / job / environment
  (dev / uat / prod …), a parameter form pre-filled from the config, build
  triggering, and status polling (queued → building → result, with a 10-minute
  timeout). The last submitted **server / job / environment / parameters** are
  remembered per workspace and auto-echoed the next time the modal opens
  (browser `localStorage`).
- **Model tools** (docs/develop/basic/tool): `dsh_jenkins_build`, `dsh_jenkins_status`.
- **Config** (docs/develop/basic/config): Schemastery `Config` + a settings namespace
  that persists UI edits to `$DSH_HOME/settings.yaml` (server list stored as JSON text
  to avoid frozen-array pitfalls).
- **Packaging** (docs/develop/basic/publish): `dsh.bundle` + `dsh.client`(web) manifests.

## Structure

```
├── index.js            # Host half: Config, settings namespace, dsh-jenkins-cli command, model tools, workspace-config ops
├── client.js           # Browser half (__ModuleLoader__ bundle): Settings page, footer entry, run-job modal (searchable combos, last-params echo)
├── index.d.ts          # Host type declarations
├── cordis.patch.yml    # Bundle patch: plugin row referenced by package name (no paths)
├── package.json        # dsh.bundle + dsh.client(web) manifests + peerDependencies
├── README.md           # This file (English)
└── README.zh.md        # 中文文档
```

## Workspace config file (`dsh-jenkins-cli.json` / `.js` / `.ts`)

Place it in the **workspace root**. It defines the job, the target server, and
per-environment parameters. `.json` is parsed directly; `.js` / `.ts` are evaluated
with node (CJS `module.exports` or ESM `export default`):

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

- `job` (required): Jenkins job path, e.g. `build-app` or `folder/build-app`.
- `server` (optional): server name as configured in the Settings page (defaults to the
  only configured server).
- `environments`: environment name → parameter map (booleans render as checkboxes).

When the file exists, the footer **Jenkins** button appears; the modal lets you switch
environment tabs, review/echo the parameters, submit the build, and watch the status.

## Installation

```sh
# Local development
dsh plugin --profile web add ./dsh-jenkins-cli

# Published: npm / tarball / GitHub
dsh plugin --profile web add dsh-jenkins-cli
dsh plugin --profile web add ./dsh-jenkins-cli-0.1.4.tgz
dsh plugin --profile web add github:you/dsh-jenkins-cli#<sha>

dsh --profile web --dump-config   # verify the layer
dsh --profile web                 # start (restart required for the host half to reload)
```

Static server defaults can also be set in the profile's `cordis.patch.yml`:

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
            token: <API Token or password>
            insecure: false
```

## Publish

```sh
npm publish      # plain JS, no build step
npm pack         # or tarball
git push origin main   # GitHub (no build script needed for git installs)
```

## Implementation notes

- Jenkins REST via `curl.exe` through the host `shell` service: Basic auth + CSRF crumb
  + `--data-binary @-` (form body over stdin, UTF-8 without BOM); `-D -` parses status
  and the `Location` header.
- Browser ↔ host transport: `ctx.remote.commands.execute(sessionId, '/dsh-jenkins-cli <json>')`,
  host errors carry a `code` that the client localizes (fallback to the raw message).
- Peer dependencies (`@deepseek-ai/cordis`, `dsh-tools`, `schemastery`, `dsh-settings`,
  `dsh-commands`, `dsh-session`, `dsh-api-remotes`, client runtime/ui-slots/ui-settings/
  cordis-client-runner, `react`) are resolved by the host at install time.
- The official `deepseek-harness` project is **not modified**; all features use existing
  slots (`sidebar.footer.action`, `settings.section`, `shell.overlay`) and the command
  transport.

