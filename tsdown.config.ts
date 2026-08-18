/**
 * dsh-jenkins —— tsdown 构建配置（对齐 @lemcae/dsh-balance 的 client bundle 方案）。
 *
 * 两个产物：
 * - lib/index.js  宿主半边（Node，ESM）：src/host/index.ts 打包，@deepseek-ai/* 保持 external；
 * - lib/client.js 浏览器半边（CJS）：src/client/index.ts 打包为单文件 CJS 工厂，
 *   通过 banner/intro/footer 生成 window.__ModuleLoader__.load({ id, factory }) 包装；
 *   factory 的 require 解析宿主模块表（seed），因此仅 seed 表内的包保持 external，
 *   其余依赖全部内联。
 *
 * 类型与声明文件由 tsc -b 生成到 lib/types（本配置 dts: false）。
 */
import { defineConfig, type UserConfig } from 'tsdown'

/** 宿主模块表（seed，与 @deepseek-ai/dsh-client-web 的 staticModules 一致）。 */
const SEED_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
]

const nodeConfig: UserConfig = {
  name: 'dsh-jenkins',
  entry: ['src/host/index.ts'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  tsconfig: 'tsconfig.host.json',
  dts: false,
  clean: false,
  // 扩展名跟随 package.json 的 type（module → .js），保证 exports 指向 lib/index.js。
  fixedExtension: false,
}

const clientConfig: UserConfig = {
  name: 'dsh-jenkins/client',
  entry: { client: 'src/client/index.ts' },
  // 浏览器 bundle 与 node half 同目录（lib/）；entry key 固定输出 lib/client.js。
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  target: 'es2024',
  tsconfig: 'tsconfig.client.json',
  dts: false,
  // 插件代码在 Vite 模块图之外被 fetch 加载，产物需自带 sourcemap 供调试。
  sourcemap: true,
  clean: false,
  // type: module 下 cjs 默认输出 .cjs，这里统一为 .js（与 exports 的 ./lib/client.js 一致）。
  fixedExtension: false,
  outExtensions: () => ({ js: '.js' }),
  deps: {
    // 仅宿主模块表（seed）内的包保持 external（require 由 factory 参数提供）；
    // 其余依赖全部内联（如 clsx、zod 等），避免 factory require 表外模块抛错。
    neverBundle: [...SEED_MODULES],
    alwaysBundle: (id) => (SEED_MODULES.includes(id) ? undefined : true),
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
  // __ModuleLoader__ 工厂包装（与 dsh-balance 相同的 banner/intro/footer 方案）：
  // 产物整体位于 factory 函数体内，顶部 require(...) 解析到 factory 参数（seed 表）。
  banner: `window.__ModuleLoader__.load({ id: 'dsh-jenkins', factory: (require) => {
var module = { exports: {} }; var exports = module.exports;`,
  footer: 'return module.exports; } });',
}

export default defineConfig([nodeConfig, clientConfig])
