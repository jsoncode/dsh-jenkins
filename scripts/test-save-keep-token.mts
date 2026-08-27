/**
 * dsh-jenkins runOp('save') 编辑保留旧 Token 回归测试（不依赖宿主）：
 *  - 新增未填 Token → token-required
 *  - 新增填写 Token → 成功
 *  - 编辑留空 Token → 成功，沿用上次保存的 Token；连接字段未变不清除 verified
 *  - 编辑换成新 Token → Token 更新；verified 清除
 *  - 仅改名 + 留空 Token → verified 保留
 *  - 存量记录本身没有 Token 时编辑留空 → token-required（仍必须补填）
 */
import { resetStoreDirCache } from '../src/host/store.ts'
import { runOp } from '../src/host/ops.ts'
import type { HostCtxLike } from '../src/host/jenkins.ts'
import type { ServerConfig } from '../src/host/types.ts'

const fail = (msg: string): never => { throw new Error('FAIL: ' + msg) }
const ok = (msg: string): void => console.log('ok -', msg)

// 内存版 store：save 分支只用 readServers / writeServers / findServer，
// 不触网也不需要 fs/shell 服务。
let servers: ServerConfig[] = []
const deps = {
  ctx: {} as HostCtxLike,
  readServers: (): ServerConfig[] => servers,
  writeServers: async (next: ServerConfig[]): Promise<void> => { servers = next },
  findServer: (ref: string): ServerConfig | undefined =>
    servers.find((s) => s.id === ref || s.name === ref),
  readCacheJson: (): Record<string, unknown> => ({}),
  writeCacheJson: async (): Promise<void> => {},
}

resetStoreDirCache()

const save = (server: Record<string, unknown>) => runOp(deps, { op: 'save', server })

// 1) 新增未填 Token → 必须拒绝
{
  const r = await save({ name: 'A', baseUrl: 'https://a.example.com', username: 'u', token: '' })
  if (r.ok || r.code !== 'token-required') fail(`new server without token should be token-required, got ${JSON.stringify(r)}`)
  ok('新增服务器未填 Token → 拒绝（token-required）')
}

// 2) 新增填写 Token → 成功
{
  const r = await save({ name: 'UAT', baseUrl: 'https://uat.example.com/', username: 'jason', token: 'tok-1' })
  if (!r.ok) fail(`new server with token should save, got ${JSON.stringify(r)}`)
  const list = r.servers as Array<{ id: string; tokenMasked?: string }>
  if (!list.length || !list[0].tokenMasked) fail('saved server missing mask')
}
const id = servers[0].id

// 3) 已验证的服务器，编辑时 Token 留空 → 成功且沿用旧 Token，verified 保留
servers[0].verified = true
{
  const r = await save({ id, name: 'UAT', baseUrl: 'https://uat.example.com/', username: 'jason', token: '', insecure: false })
  if (!r.ok) fail(`edit with blank token should succeed, got ${JSON.stringify(r)}`)
  if (servers[0].token !== 'tok-1') fail('blank-token edit should keep old token, got ' + servers[0].token)
  if (servers[0].verified !== true) fail('no-change edit should keep verified flag')
  ok('编辑留空 Token → 沿用旧 Token，verified 不丢失')
}

// 4) 编辑换成新 Token → 更新生效，verified 清除（需重新测试）
{
  const r = await save({ id, name: 'UAT', baseUrl: 'https://uat.example.com/', username: 'jason', token: 'tok-2', insecure: false })
  if (!r.ok) fail(`edit with new token should succeed, got ${JSON.stringify(r)}`)
  if (servers[0].token !== 'tok-2') fail('new token not saved: ' + servers[0].token)
  if (servers[0].verified !== false) fail('token change should clear verified')
  ok('编辑换新 Token → Token 更新，verified 清除')
}

// 5) 仅改名 + 留空 Token → 连接字段未变化，verified 应保留
servers[0].verified = true
{
  const r = await save({ id, name: 'Renamed', baseUrl: 'https://uat.example.com/', username: 'jason', token: '', insecure: false })
  if (!r.ok) fail(`rename-only edit should succeed, got ${JSON.stringify(r)}`)
  if (servers[0].name !== 'Renamed') fail('rename lost')
  if (servers[0].token !== 'tok-2') fail('rename-only edit should keep token')
  if (servers[0].verified !== true) fail('rename-only edit should keep verified')
  ok('仅改名保存 → Token 与 verified 均保留')
}

// 6) 存量记录本身没有 Token（异常数据），编辑留空 → 仍要求填写
servers[0].token = ''
{
  const r = await save({ id, name: 'Broken', baseUrl: 'https://uat.example.com/', username: 'jason', token: '   ', insecure: false })
  if (r.ok || r.code !== 'token-required') fail(`legacy record without token should require one, got ${JSON.stringify(r)}`)
  ok('存量无 Token 记录留空保存 → 仍要求填写（token-required）')
}

console.log('\nALL SAVE KEEP-TOKEN TESTS PASSED')
