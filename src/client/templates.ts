/**
 * dsh-jenkins —— dsh-Jenkins 配置模板（json / js / ts，按界面语言选择）。
 *
 * 数组格式：每个元素 = 一个发布目标（job + server + environments 参数表），
 * server 支持服务器名称 / id / 地址，弹框自动取交集并预选。
 */

import { getLang } from './i18n.ts'

/** 按当前语言取配置模板（函数形式 —— 语言切换后重渲染即取新文案）。 */
export const getTemplates = (): Record<'json' | 'js' | 'ts', string> => getLang() === 'zh' ? {
      json: '[\n'
        + '  {\n'
        + '    "job": "build-app",\n'
        + '    "server": "http://uat.example.com",\n'
        + '    "environments": { "BRANCH": "main", "DEPLOY": false }\n'
        + '  },\n'
        + '  {\n'
        + '    "job": "build-app",\n'
        + '    "server": "http://prod.example.com",\n'
        + '    "environments": { "BRANCH": "release-1.0", "DEPLOY": true }\n'
        + '  }\n'
        + ']',
      js: '// dsh-jenkins.js — CommonJS 导出（工作区无 "type":"module" 时使用）\n'
        + 'module.exports = [\n'
        + '  {\n'
        + '    job: \'build-app\',\n'
        + '    server: \'http://uat.example.com\',\n'
        + '    environments: { BRANCH: \'main\', DEPLOY: false },\n'
        + '  },\n'
        + '  {\n'
        + '    job: \'build-app\',\n'
        + '    server: \'http://prod.example.com\',\n'
        + '    environments: { BRANCH: \'release-1.0\', DEPLOY: true },\n'
        + '  },\n'
        + ']',
      ts: '// dsh-jenkins.ts — ESM 导出（经 tsx 求值）\n'
        + 'export default [\n'
        + '  {\n'
        + '    job: \'build-app\',\n'
        + '    server: \'http://uat.example.com\',\n'
        + '    environments: { BRANCH: \'main\', DEPLOY: false },\n'
        + '  },\n'
        + '  {\n'
        + '    job: \'build-app\',\n'
        + '    server: \'http://prod.example.com\',\n'
        + '    environments: { BRANCH: \'release-1.0\', DEPLOY: true },\n'
        + '  },\n'
        + '] satisfies Array<Record<string, unknown>>',
    } : {
      json: '[\n'
        + '  {\n'
        + '    "job": "build-app",\n'
        + '    "server": "http://uat.example.com",\n'
        + '    "environments": { "BRANCH": "main", "DEPLOY": false }\n'
        + '  },\n'
        + '  {\n'
        + '    "job": "build-app",\n'
        + '    "server": "http://prod.example.com",\n'
        + '    "environments": { "BRANCH": "release-1.0", "DEPLOY": true }\n'
        + '  }\n'
        + ']',
      js: '// dsh-jenkins.js — CommonJS export (use when the workspace has no "type":"module")\n'
        + 'module.exports = [\n'
        + '  {\n'
        + '    job: \'build-app\',\n'
        + '    server: \'http://uat.example.com\',\n'
        + '    environments: { BRANCH: \'main\', DEPLOY: false },\n'
        + '  },\n'
        + '  {\n'
        + '    job: \'build-app\',\n'
        + '    server: \'http://prod.example.com\',\n'
        + '    environments: { BRANCH: \'release-1.0\', DEPLOY: true },\n'
        + '  },\n'
        + ']',
      ts: '// dsh-jenkins.ts — ESM export (evaluated via tsx)\n'
        + 'export default [\n'
        + '  {\n'
        + '    job: \'build-app\',\n'
        + '    server: \'http://uat.example.com\',\n'
        + '    environments: { BRANCH: \'main\', DEPLOY: false },\n'
        + '  },\n'
        + '  {\n'
        + '    job: \'build-app\',\n'
        + '    server: \'http://prod.example.com\',\n'
        + '    environments: { BRANCH: \'release-1.0\', DEPLOY: true },\n'
        + '  },\n'
        + '] satisfies Array<Record<string, unknown>>',
    };

