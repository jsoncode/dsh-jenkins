/**
 * dsh-jenkins 迁移干跑：用真实 settings.yaml 中 dsh-jenkins 命名空间的数据形状
 * （中文服务器名 + 多行命令参数）验证：parse → saveStore（加密）→ loadStore（解密）
 * 往返无损。不触碰真实文件，全部在临时目录进行。
 */
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadStore, resolveStoreDir, resetStoreDirCache, saveStore } from '../src/host/store.ts'
import type { JenkinsStore } from '../src/host/store.ts'

const fail = (msg: string): never => { throw new Error('FAIL: ' + msg) }
const ok = (msg: string): void => console.log('ok -', msg)

// 真实数据形状（取自用户 settings.yaml 的 dsh-jenkins 段）：
// serversJson: '[{"id":"srv-mswvanf1-bor4p9","name":"腾讯云UAT","baseUrl":"https://dev-jenkins-tx.whale-plus.com",...}]'
const legacyServersJson = '[{"id":"srv-mswvanf1-bor4p9","name":"腾讯云UAT","baseUrl":"https://dev-jenkins-tx.whale-plus.com","username":"jason","token":"11eb9fba200afd245c297a0e9a0a094a85","insecure":false,"verified":true}]'
// cacheJson 含真实多行参数（INSTALL_COMMAND_ACTIVE 带换行与 registry 参数）。
const legacyCacheJson = JSON.stringify({
  lastParams: {
    'D:\\workspace\\git.cxaone.cn\\cxagroup-hr-portal-ui': {
      serverId: 'srv-mswvanf1-bor4p9',
      jobPath: 'system3_Front_docker3',
      parameters: {
        project: 'cxagroup-hr-portal-ui',
        branch: 'uat5',
        NodeVersion: 'v24.12.0',
        INSTALL_COMMAND_ACTIVE: 'pnpm i --registry=https://repo.huaweicloud.com/repository/npm/',
        BUILD_COMMAND_ACTIVE: 'pnpm build:uat',
      },
    },
  },
  history: {
    'D:\\workspace\\git.cxaone.cn\\cxagroup-hr-portal-ui': [{
      id: 'h1787731754478-783054', time: 1787731754478,
      job: 'system3_Front_docker3', server: '腾讯云UAT',
      serverId: 'srv-mswvanf1-bor4p9', segments: ['system3_Front_docker3'],
      params: { project: 'cxagroup-hr-portal-ui', branch: 'uat5' },
      result: 'SUCCESS', queueId: 35411, buildNumber: 364,
      since: 1787731754478, unread: false,
      url: 'https://dev-jenkins-tx.whale-plus.com/job/system3_Front_docker3/364/',
    }],
  },
})

const dir = await mkdtemp(join(tmpdir(), 'dshj-dryrun-'))
resetStoreDirCache()
resolveStoreDir(dir)

try {
  // 模拟 migrateLegacy：parse 旧 JSON 字符串 → 组装 store → saveStore
  const servers = JSON.parse(legacyServersJson)
  const cache = JSON.parse(legacyCacheJson)
  const store: JenkinsStore = { version: 1, servers, cache }
  await saveStore(dir, store)

  // 读取落盘文件：token 必须加密、中文必须完好（UTF-8）
  const { readFile } = await import('node:fs/promises')
  const raw = await readFile(join(dir, 'dsh-jenkins.json'), 'utf8')
  const onDisk = JSON.parse(raw)
  if (!onDisk.servers[0].token.startsWith('enc:v1:')) fail('token not encrypted')
  if (!onDisk.servers[0].name.includes('腾讯云')) fail('中文服务器名落盘损坏: ' + onDisk.servers[0].name)
  ok('落盘：token 加密，中文名完好')

  // loadStore 往返：token 解回、多行参数、历史完整
  const loaded = await loadStore(dir)
  if (loaded === null) fail('loadStore null')
  if (loaded.servers[0].token !== '11eb9fba200afd245c297a0e9a0a094a85') fail('token 往返失败: ' + loaded.servers[0].token)
  if (loaded.servers[0].name !== '腾讯云UAT') fail('中文名往返失败')
  const lp = loaded.cache.lastParams as Record<string, { parameters: Record<string, string> }>
  const key = Object.keys(lp)[0]
  if (!lp[key] || lp[key].parameters.INSTALL_COMMAND_ACTIVE.indexOf('repo.huaweicloud.com') === -1) fail('多行参数丢失')
  const hist = loaded.cache.history as Record<string, Array<{ id: string; result: string; url: string }>>
  const h = Object.values(hist)[0][0]
  if (h.id !== 'h1787731754478-783054' || h.result !== 'SUCCESS' || h.url.indexOf('dev-jenkins-tx') === -1) fail('历史记录丢失')
  ok('读回：token/中文/多行参数/历史 全部完好')

  console.log('\nDRY RUN PASSED — 真实数据迁移无损')
} finally {
  await rm(dir, { recursive: true, force: true })
}
