/**
 * verify-client —— 模拟宿主加载 lib/client.js，验证 __ModuleLoader__ 工厂可用。
 *
 * 模拟内容（对齐宿主 ClientModuleSystem 行为）：
 * - window.__ModuleLoader__.load 收集工厂；
 * - seed 表：react / react/jsx-runtime 用真实包，@deepseek-ai/dsh-client-ui-primitives
 *   用 stub（Node 环境无法真实渲染，仅验证模块形状与 require 解析）；
 * - 执行 bundle 后物化工厂，断言返回 { name, inject, apply }。
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const bundlePath = resolve(root, 'lib/client.js')
const code = readFileSync(bundlePath, 'utf8')

const factories = new Map()
const window = {
  __ModuleLoader__: {
    load(handoff) {
      if (factories.has(handoff.id)) throw new Error(`duplicate factory registration for "${handoff.id}"`)
      factories.set(handoff.id, handoff.factory)
    },
  },
}

// 宿主 seed 表（frozen module table）：外部依赖只能解析这里
const seed = {
  'react': require('react'),
  'react/jsx-runtime': require('react/jsx-runtime'),
  'react-dom': require('react-dom'),
  'react-dom/client': require('react-dom/client'),
  '@deepseek-ai/dsh-client-ui-primitives': { Modal: () => null },
}

const sandbox = {
  window,
  console,
  setTimeout,
  clearTimeout,
}
vm.createContext(sandbox)
vm.runInContext(code, sandbox, { filename: 'lib/client.js' })

if (!factories.has('dsh-jenkins')) {
  console.error('verify-client FAIL: bundle 未注册 "dsh-jenkins" 工厂')
  process.exit(1)
}

const makeRequire = (edges) => (spec) => {
  edges.add(spec)
  if (!(spec in seed)) {
    throw new Error(`require("${spec}") 不在模拟 seed 表（构建时 external 漂移？）`)
  }
  return seed[spec]
}

// 物化（对齐 materialize：同步、memoized）
const edges = new Set()
const exports = factories.get('dsh-jenkins')(makeRequire(edges))
const mod = exports || {}

const shapeOk = mod.name === 'dsh-jenkins' && typeof mod.apply === 'function' && Array.isArray(mod.inject)
if (!shapeOk) {
  console.error('verify-client FAIL: 模块形状错误', JSON.stringify({ name: mod.name, apply: typeof mod.apply, inject: mod.inject }))
  process.exit(1)
}

console.log(`verify-client OK: ${mod.name} · inject=${JSON.stringify(mod.inject)} · external=${[...edges].join(', ')}`)
