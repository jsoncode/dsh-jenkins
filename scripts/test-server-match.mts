/**
 * dsh-jenkins 服务器匹配隔离测试（不依赖宿主 / 不联网）：
 *  - 匹配顺序：名称 → id → 完整地址（去尾部斜杠）→ **域名**
 *  - 域名匹配忽略协议 / 端口 / 上下文路径 / URL 内嵌凭据 / 大小写
 *  - 不同域名不匹配；空引用不匹配
 *  - 浏览器半边（client/storage.ts）与宿主半边（host/jenkins.ts）的 serverHost 语义一致
 */
import { serverHost as hostServerHost } from '../src/host/jenkins.ts'
import { matchServer, normServerUrl, serverHost } from '../src/client/storage.ts'

const fail = (msg: string): never => { throw new Error('FAIL: ' + msg) }
const ok = (msg: string): void => console.log('ok -', msg)

const guard = setTimeout(() => { console.error('FAIL: timeout'); process.exit(1) }, 20000)
guard.unref?.()

const uat = { id: 'srv-uat', name: '腾讯云UAT', baseUrl: 'https://dev-jenkins-tx.whale-plus.com' }
const prod = { id: 'srv-prod', name: '腾讯云Prod', baseUrl: 'https://jenkins-tx.whale-plus.com' }
const gray = { id: 'srv-gray', name: '生产 灰度', baseUrl: 'https://jenkins-tx.whale-plus.com' }
const ported = { id: 'srv-ported', name: '内网实例', baseUrl: 'http://jenkins-tx.whale-plus.com:8080/jenkins/' }

try {
  /* ── 1) 名称 / id / 完整地址 ── */
  if (!matchServer(uat, '腾讯云UAT')) fail('name match broken')
  if (!matchServer(uat, 'srv-uat')) fail('id match broken')
  if (!matchServer(uat, 'https://dev-jenkins-tx.whale-plus.com')) fail('exact url match broken')
  if (!matchServer(uat, '  https://dev-jenkins-tx.whale-plus.com/  ')) fail('exact url match should ignore blanks / trailing slash')
  ok('matchServer: 名称 / id / 完整地址（去空白与尾斜杠）匹配正常')

  /* ── 2) 域名匹配：协议 / 端口 / 上下文路径 / 大小写都不影响 ── */
  if (!matchServer(ported, 'https://jenkins-tx.whale-plus.com')) fail('domain match should ignore scheme/port/context path')
  if (!matchServer(prod, 'JENKINS-TX.WHALE-PLUS.COM')) fail('domain match should be case-insensitive')
  if (!matchServer(prod, 'jenkins-tx.whale-plus.com')) fail('bare-domain ref should match')
  if (!matchServer(prod, 'http://user:pass@jenkins-tx.whale-plus.com/')) fail('credentials in ref should be ignored')
  ok('matchServer: 只按域名匹配（忽略协议 / 端口 / 上下文路径 / 凭据 / 大小写）')

  /* ── 3) 不同域名 / 空引用不匹配 ── */
  if (matchServer(prod, 'https://dev-jenkins-tx.whale-plus.com')) fail('different domains must not match')
  if (matchServer(prod, 'jenkins-tx.whale-plus.com.cn')) fail('suffix domain must not match')
  if (matchServer(prod, '')) fail('empty ref must not match')
  if (matchServer(prod, '   ')) fail('blank ref must not match')
  ok('matchServer: 不同域名 / 相似但不是同一台 / 空引用都不匹配')

  /* ── 4) 同域名多台（真实场景：Prod 与「生产 灰度」同域名）都能命中 ── */
  const ref = 'https://jenkins-tx.whale-plus.com'
  const hits = [prod, gray, ported].filter((s) => matchServer(s, ref))
  if (hits.length !== 3) fail('same-domain servers should all match, got ' + hits.length)
  ok('matchServer: 同域名的多台服务器都会命中（由用户在下拉里选具体一台）')

  /* ── 5) serverHost / normServerUrl 语义 ── */
  const cases: Array<[string, string]> = [
    ['https://jenkins-tx.whale-plus.com/', 'jenkins-tx.whale-plus.com'],
    ['http://jenkins-tx.whale-plus.com:8080/jenkins/', 'jenkins-tx.whale-plus.com'],
    ['jenkins-tx.whale-plus.com', 'jenkins-tx.whale-plus.com'],
    ['https://user:pw@jenkins-tx.whale-plus.com/api', 'jenkins-tx.whale-plus.com'],
    ['https://JENKINS-TX.Whale-Plus.com', 'jenkins-tx.whale-plus.com'],
    ['  ', ''],
    ['https://10.0.0.7:9443/', '10.0.0.7'],
    ['https://[::1]:8080/jenkins', '[::1]'],
  ]
  for (const [input, want] of cases) {
    const got = serverHost(input)
    if (got !== want) fail('serverHost(' + JSON.stringify(input) + ') = ' + JSON.stringify(got) + ', want ' + JSON.stringify(want))
    const hostGot = hostServerHost(input)
    if (hostGot !== want) fail('host serverHost(' + JSON.stringify(input) + ') = ' + JSON.stringify(hostGot) + ', want ' + JSON.stringify(want))
  }
  if (normServerUrl('  https://a.example.com/  ') !== 'https://a.example.com') fail('normServerUrl broken')
  ok('serverHost: 浏览器半边与宿主半边语义一致（协议 / 端口 / 路径 / 凭据 / 大小写 / IPv6）')

  console.log('\nALL SERVER MATCH TESTS PASSED')
} finally {
  clearTimeout(guard)
}
