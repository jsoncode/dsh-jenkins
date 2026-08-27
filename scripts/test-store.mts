/**
 * dsh-jenkins store.ts 隔离测试（不依赖宿主）：
 *  - 保存带 token 的 store → 文件 token 为 enc:v1 密文，密钥文件生成
 *  - 加载 → token 解回明文
 *  - 文件不存在 → null；损坏 → 备份 .bak 且返回 null
 *  - 迁移核心：旧 settings JSON 字符串 → 加密落盘
 */
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadStore, resolveStoreDir, resetStoreDirCache, saveStore } from '../src/host/store.ts'
import type { JenkinsStore } from '../src/host/store.ts'

const fail = (msg: string): never => { throw new Error('FAIL: ' + msg) }
const ok = (msg: string): void => console.log('ok -', msg)

const dir = await mkdtemp(join(tmpdir(), 'dshj-store-test-'))
resetStoreDirCache()
resolveStoreDir(dir) // 缓存 dir

try {
  // 1) 保存带 token 的 store
  const store: JenkinsStore = {
    version: 1,
    servers: [{
      id: 'srv-1', name: 'UAT', baseUrl: 'https://uat.example.com',
      username: 'jason', token: 'secret-token-123', insecure: false, verified: true,
    }],
    cache: { lastParams: { '/ws': { jobPath: 'build-app', parameters: { BRANCH: 'main' } } }, history: {} },
  }
  await saveStore(dir, store)
  const raw = await readFile(join(dir, 'dsh-jenkins.json'), 'utf8')
  const parsed = JSON.parse(raw)
  if (!parsed.servers[0].token.startsWith('enc:v1:')) fail('token not encrypted on disk')
  if (raw.includes('secret-token-123')) fail('plaintext token leaked to file')
  if (parsed.servers[0].name !== 'UAT' || parsed.cache.lastParams['/ws'].parameters.BRANCH !== 'main') fail('data lost in seal')
  ok('saveStore: token 加密落盘，其余字段/缓存保留')

  const keyFile = await readFile(join(dir, 'dsh-jenkins.key'), 'utf8')
  if (!keyFile.trim()) fail('key file empty')
  ok('saveStore: 密钥文件自动生成')

  // 2) 加载 → token 解回明文
  const loaded = await loadStore(dir)
  if (loaded === null) fail('loadStore returned null for valid file')
  if (loaded.servers[0].token !== 'secret-token-123') fail('token not decrypted: ' + loaded.servers[0].token)
  if (loaded.servers[0].verified !== true) fail('verified flag lost')
  if (!loaded.cache.lastParams || !loaded.cache.history) fail('cache shape lost')
  ok('loadStore: token 解回明文，verified/cache 完整')

  // 3) 文件不存在 → null
  const emptyDir = join(dir, 'none')
  const missing = await loadStore(emptyDir)
  if (missing !== null) fail('loadStore should return null for missing file')
  ok('loadStore: 文件不存在返回 null')

  // 4) 损坏 → 备份 .bak 且返回 null
  await writeFile(join(dir, 'dsh-jenkins.json'), '{ not json !!!', 'utf8')
  const corrupt = await loadStore(dir)
  if (corrupt !== null) fail('loadStore should return null for corrupt file')
  const files = await readdir(dir)
  if (!files.includes('dsh-jenkins.json.bak')) fail('.bak backup missing: ' + files.join(','))
  ok('loadStore: 损坏文件备份 .bak 并返回 null')

  // 5) 迁移核心：旧 settings JSON 字符串 → 加密落盘（模拟 migrateLegacy 内部）
  const legacyServers = JSON.stringify([{
    id: 'srv-legacy', name: '腾讯云UAT', baseUrl: 'https://dev-jenkins-tx.whale-plus.com',
    username: 'jason', token: '11eb9fba200afd245c297a0e9a0a094a85', insecure: false, verified: true,
  }])
  const legacyCache = JSON.stringify({ lastParams: {}, history: { '/ws': [{ id: 'h1', time: 1, job: 'j', server: 's' }] } })
  const migrateStore: JenkinsStore = { version: 1, servers: JSON.parse(legacyServers), cache: JSON.parse(legacyCache) }
  await saveStore(dir, migrateStore)
  const migrated = await loadStore(dir)
  if (migrated === null) fail('migrated store not loadable')
  if (migrated.servers[0].token !== '11eb9fba200afd245c297a0e9a0a094a85') fail('legacy token mismatch after round-trip')
  if (migrated.cache.history['/ws'][0].id !== 'h1') fail('legacy history lost')
  ok('迁移核心：旧 settings 数据加密落盘并可完整读回')

  console.log('\nALL STORE TESTS PASSED')
} finally {
  await rm(dir, { recursive: true, force: true })
}
