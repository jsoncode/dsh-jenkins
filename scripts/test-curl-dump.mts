/**
 * dsh-jenkins jenkins.ts 解析与错误码隔离测试（不依赖宿主 / 不联网）：
 *  - parseCurlDump：直连单块、HTTPS 经 HTTP 代理的 CONNECT 隧道块、1xx、
 *    302 重定向、\n 行尾、正文以 HTTP/ 开头的文本、被截断只剩尾部、空输出、残缺头块；
 *  - lastStatus / splitHeaders 与解析结果一致（回归：真实状态码不能被隧道块的 200 掩盖）；
 *  - errorCodeOf：HTTP 状态 / err.code / 消息关键词 → 客户端本地化错误码。
 */
import { errorCodeOf, lastStatus, parseCurlDump, splitHeaders } from '../src/host/jenkins.ts'

const fail = (msg: string): never => { throw new Error('FAIL: ' + msg) }
const ok = (msg: string): void => console.log('ok -', msg)

const BODY = '{"_class":"hudson.model.Hudson","jobs":[{"name":"a"}]}'

interface Case {
  name: string
  dump: string
  status: number
  statuses: number[]
  body: string
}

const cases: Case[] = [
  {
    name: '直连：单响应块',
    dump: 'HTTP/1.1 200 OK\r\nServer: nginx\r\nContent-Length: 51\r\n\r\n' + BODY,
    status: 200, statuses: [200], body: BODY,
  },
  {
    name: 'HTTPS 经 HTTP 代理：CONNECT 隧道块 + 真实块（旧实现在第一个空行切分 → 正文含响应头）',
    dump: 'HTTP/1.1 200 Connection Established\r\n\r\nHTTP/1.1 200 OK\r\nServer: nginx\r\n\r\n' + BODY,
    status: 200, statuses: [200, 200], body: BODY,
  },
  {
    name: '经代理的真实 401：状态码取真实块（不能被隧道块 200 掩盖）',
    dump: 'HTTP/1.1 200 Connection Established\r\n\r\nHTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic\r\n\r\n{"message":"bad token"}',
    status: 401, statuses: [200, 401], body: '{"message":"bad token"}',
  },
  {
    name: '经代理的 302 重定向（未跟随）：Location 可取到',
    dump: 'HTTP/1.1 200 Connection Established\r\n\r\nHTTP/1.1 302 Found\r\nLocation: https://jenkins.example.com/api/json\r\n\r\n',
    status: 302, statuses: [200, 302], body: '',
  },
  {
    name: '1xx 中间响应 + 隧道块 + 真实块',
    dump: 'HTTP/1.1 100 Continue\r\n\r\nHTTP/1.1 200 Connection Established\r\n\r\nHTTP/1.1 200 OK\r\nX-Jenkins: 2.492.1\r\n\r\n' + BODY,
    status: 200, statuses: [100, 200, 200], body: BODY,
  },
  {
    name: '\\n 行尾（兼容）',
    dump: 'HTTP/1.1 200 Connection Established\n\nHTTP/1.1 200 OK\nServer: nginx\n\n' + BODY,
    status: 200, statuses: [200, 200], body: BODY,
  },
  {
    name: '正文以 HTTP/ 开头的纯文本（不得误判为头块）',
    dump: 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nHTTP/1.1 500 Oops\r\nthis is the console log body\r\n',
    status: 200, statuses: [200], body: 'HTTP/1.1 500 Oops\r\nthis is the console log body\r\n',
  },
  {
    name: '输出被收集上限截断（只剩尾部）：无头块 → status 0',
    dump: BODY.slice(10),
    status: 0, statuses: [], body: BODY.slice(10),
  },
  {
    name: '空输出',
    dump: '',
    status: 0, statuses: [], body: '',
  },
  {
    name: '只有头、无结束空行（残缺 dump 兜底）',
    dump: 'HTTP/1.1 200 OK\r\nServer: nginx',
    status: 200, statuses: [200], body: '',
  },
]

for (const c of cases) {
  const dump = parseCurlDump(c.dump)
  if (JSON.stringify(dump.statuses) !== JSON.stringify(c.statuses)) {
    fail(`${c.name}: statuses=${JSON.stringify(dump.statuses)} 期望 ${JSON.stringify(c.statuses)}`)
  }
  if (dump.body !== c.body) fail(`${c.name}: body=${JSON.stringify(dump.body.slice(0, 60))} 期望 ${JSON.stringify(c.body.slice(0, 60))}`)
  const status = lastStatus(dump.headers)
  if (status !== c.status) fail(`${c.name}: status=${status} 期望 ${c.status}`)
  const split = splitHeaders(c.dump)
  if (split.headers !== dump.headers || split.body !== dump.body) fail(`${c.name}: splitHeaders 与 parseCurlDump 不一致`)
  ok(c.name)
}

const codeCases: Array<{ input: unknown; expect: string | undefined }> = [
  { input: { code: 'http-401' }, expect: 'auth-failed' },
  { input: { code: 'http-403' }, expect: 'forbidden' },
  { input: { code: 'http-404' }, expect: 'not-found' },
  { input: { code: 'http-500' }, expect: 'connect-failed' },
  { input: { code: 'parse-failed' }, expect: 'parse-failed' },
  { input: { code: 'empty-response' }, expect: 'empty-response' },
  { input: { code: 'response-too-large' }, expect: 'response-too-large' },
  { input: { status: 401 }, expect: 'auth-failed' },
  { input: { status: 403 }, expect: 'forbidden' },
  { input: new Error('网络请求失败：curl: (28) Operation timed out'), expect: 'network-failed' },
  { input: new Error('响应解析失败：Unexpected token H'), expect: 'parse-failed' },
  { input: new Error('响应过大：超过 8MB 收集上限'), expect: 'response-too-large' },
  { input: new Error('未取得 HTTP 响应（curl 无响应头输出）'), expect: 'empty-response' },
  { input: new Error('服务器返回重定向（HTTP 302）'), expect: 'redirect' },
  { input: new Error('subprocess 服务不可用，无法调用 Jenkins API'), expect: 'curl-unavailable' },
  { input: new Error('无法解析任务路径'), expect: 'job-path-invalid' },
  { input: new Error('something else'), expect: undefined },
]

for (const c of codeCases) {
  const got = errorCodeOf(c.input)
  if (got !== c.expect) {
    fail(`errorCodeOf(${JSON.stringify(c.input instanceof Error ? c.input.message : c.input)}) = ${String(got)} 期望 ${String(c.expect)}`)
  }
}
ok('errorCodeOf: HTTP 状态 / err.code / 消息关键词映射')

console.log('\ncur-dump-parse ALL PASS')
