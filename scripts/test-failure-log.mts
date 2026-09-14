/**
 * dsh-jenkins log.ts 隔离测试（不依赖宿主 / 不联网）：
 *  - logFailure 写入 $DSH_HOME/dsh-jenkins.log（JSONL，一行一条）；
 *  - 证据字段齐全（stage/op/code/message/server/request/httpStatus/curlExit/curlStderr/bodySnippet）；
 *  - 脱敏：token / password / Basic / URL 凭据 / Jenkins crumb-value 不落盘；
 *  - 超过上限时轮转为 .1；
 *  - 写日志失败不影响调用方（不抛异常）。
 */
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { LOG_FILE, LOG_MAX_BYTES, flushFailureLog, logFailure, logFilePath, redactSecrets, resetFailureLogState } from '../src/host/log.ts'
import { resetStoreDirCache, resolveStoreDir } from '../src/host/store.ts'

const fail = (msg: string): never => { throw new Error('FAIL: ' + msg) }
const ok = (msg: string): void => console.log('ok -', msg)

const dir = await mkdtemp(join(tmpdir(), 'dshj-log-test-'))
resetStoreDirCache()
// 注意：resolveStoreDir 取的是「settings 文档所在目录」，这里传 dir 下的文件以缓存 dir 本身。
resolveStoreDir(join(dir, 'settings.yaml'))

if (logFilePath() !== join(dir, LOG_FILE)) fail(`logFilePath=${logFilePath()} 期望 ${join(dir, LOG_FILE)}`)
ok('logFilePath: 与插件数据目录一致')

logFailure({
  stage: 'http',
  op: 'jobs',
  code: 'http-401',
  message: '认证失败（HTTP 401）：用户名或 Token 不正确',
  server: '腾讯云UAT <https://dev-jenkins-tx.whale-plus.com>',
  user: 'jason',
  request: 'GET /api/json?tree=jobs',
  httpStatus: 401,
  httpStatuses: [200, 401],
  curlExit: 0,
  curlStderr: '',
  bodySnippet: 'Error 401 Unauthorized token=abcd1234secret Basic YWRtaW46c2VjcmV0 data-crumb-value="deadbeefdeadbeef"',
  sessionId: 'sess-1',
})

logFailure({ stage: 'route', op: 'jobs', code: 'server-missing', message: 'Server not found' })

await flushFailureLog()
const lines = (await readFile(join(dir, LOG_FILE), 'utf8')).trim().split('\n')
if (lines.length !== 2) fail(`期望 2 行，实际 ${lines.length}`)
const first = JSON.parse(lines[0]) as Record<string, unknown>
for (const key of ['time', 'level', 'stage', 'op', 'code', 'message', 'server', 'user', 'request', 'httpStatus', 'httpStatuses', 'curlExit', 'bodySnippet', 'sessionId']) {
  if (!(key in first)) fail(`缺少字段 ${key}: ${lines[0]}`)
}
if (first.op !== 'jobs' || first.code !== 'http-401' || first.httpStatus !== 401) fail('字段值不正确: ' + lines[0])
if (JSON.stringify(first.httpStatuses) !== '[200,401]') fail('httpStatuses 未保留（代理隧道块 200 + 真实 401）')
ok('logFailure: JSONL 记录 + 证据字段齐全（含 httpStatuses 区分隧道块与真实状态）')

const raw = lines[0] + lines[1]
for (const secret of ['abcd1234secret', 'YWRtaW46c2VjcmV0', 'deadbeefdeadbeef']) {
  if (raw.includes(secret)) fail(`敏感信息落盘: ${secret}`)
}
ok('logFailure: token / Basic / crumb 已脱敏')

// redactSecrets 直接断言（URL 内嵌凭据）
const redacted = redactSecrets('https://jason:sup3rsecret@jenkins.example.com/api/json')
if (redacted.includes('sup3rsecret')) fail('URL 凭据未脱敏: ' + redacted)
ok('redactSecrets: URL 内嵌凭据脱敏 → ' + redacted)

// 多行/超长正文压成单行且截断
logFailure({ op: 'jobs', code: 'parse-failed', message: 'x'.repeat(5000), bodySnippet: 'a\r\nb\nc' })
await flushFailureLog()
const third = JSON.parse((await readFile(join(dir, LOG_FILE), 'utf8')).trim().split('\n')[2]) as Record<string, string>
if (third.message.includes('\n')) fail('message 未压成单行')
if (third.message.length > 700) fail('message 未截断: ' + third.message.length)
if (third.bodySnippet !== 'a b c') fail('bodySnippet 未压成单行: ' + JSON.stringify(third.bodySnippet))
ok('logFailure: 长文本截断、换行压平')

// 轮转：预置一个超过上限的文件 → 下一次写入轮转为 .1
resetFailureLogState()
await writeFile(join(dir, LOG_FILE), 'x'.repeat(LOG_MAX_BYTES + 1), 'utf8')
logFailure({ op: 'jobs', code: 'after-rotate', message: 'rotation case' })
await flushFailureLog()
const rotated = await readFile(join(dir, LOG_FILE), 'utf8')
if (rotated.trim().split('\n').length !== 1) fail('轮转后当前日志文件应只有 1 行')
if (!rotated.includes('after-rotate')) fail('轮转后新记录未写入当前文件')
const backup = await readFile(join(dir, LOG_FILE + '.1'), 'utf8')
if (backup.length !== LOG_MAX_BYTES + 1) fail(`备份文件大小=${backup.length} 期望 ${LOG_MAX_BYTES + 1}`)
ok('logFailure: 超过上限轮转为 dsh-jenkins.log.1，新记录写入新文件')

console.log('\nlog ALL PASS')
