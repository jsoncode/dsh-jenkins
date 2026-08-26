/**
 * 一次性复现/回归脚本：footerAction 胶囊数字未及时更新。
 *
 * 复现 FooterButton 的订阅语义：poller.emit() → setSummary(poller.getSummary())。
 * React useState 以 Object.is 比较新旧 state，引用相同即 bail out 不重渲染。
 * 若 getSummary() 返回稳定可变单例，则数值再怎么变 UI 都不会刷新。
 *
 * 运行：pnpm exec tsx scripts/repro-footer-summary.ts
 * 期望（修复后）输出：ALL CHECKS PASSED
 */
import { createPoller, type TaskSummary } from '../src/client/poller.ts'
import { createStorage } from '../src/client/storage.ts'

interface Cmd { op?: string; key?: string; value?: unknown }

function fail(msg: string): never {
  console.error('FAIL: ' + msg)
  process.exit(1)
}

async function main(): Promise<void> {
  // 内存版宿主缓存：模拟 cacheGet / cacheSet
  const cache: Record<string, unknown> = {}
  const run = async (_sid: string, cmd: Cmd): Promise<Record<string, unknown>> => {
    if (cmd.op === 'cacheGet') return { ok: true, cache }
    if (cmd.op === 'cacheSet') { cache[String(cmd.key)] = cmd.value; return { ok: true } }
    return { ok: true }
  }
  const storage = createStorage(run as never)
  const poller = createPoller(run as never, storage, () => 'sess-1')

  // ── 模拟 FooterButton：useState + Object.is bailout 语义 ──
  let rendered: TaskSummary = { building: -1, successUnread: -1 } // UI 当前展示值（提交时快照）
  let committedRef: TaskSummary | null = null // 上一次成功写入 state 的引用
  let commitCount = 0
  const setSummary = (next: TaskSummary): void => {
    if (committedRef !== null && Object.is(committedRef, next)) return // React bailout
    committedRef = next
    rendered = { ...next } // React 只在提交时读取 state 渲染，此处固化当时值
    commitCount++
  }

  // 挂载：首次 update() + 订阅（与 FooterButton 的 effect 一致）
  const update = (): void => { setSummary(poller.getSummary()) }
  update()
  const unsubscribe = poller.subscribe(update)

  // 用户发布一个任务：pushHistory（进行中：queueId=42）+ poller.refresh()
  await storage.pushHistory('sess-1', 'C:/proj', {
    id: 'h1', time: Date.now(), job: 'app/build', server: 'S1', serverId: 's1',
    segments: ['app', 'build'], result: null, queueId: 42, buildNumber: null,
    since: Date.now(), sessionId: 'sess-1',
  })
  poller.refresh()
  await new Promise((r) => setTimeout(r, 50))

  // 数据层必须正确
  if (poller.getSummary().building !== 1) fail(`poller 汇总错误：building=${poller.getSummary().building}，应为 1`)
  // UI 层（经 React bailout 语义后）必须同步看到 building=1
  if (rendered.building !== 1) fail(`BUG 复现：发布后 footer 胶囊仍显示 building=${rendered.building}（应为 1）—— setSummary 未收到新引用`)

  // 构建成功落库 → 下一轮扫描后绿色胶囊应出现
  await storage.updateHistoryResult('sess-1', 'C:/proj', 'h1', 'SUCCESS')
  poller.refresh()
  await new Promise((r) => setTimeout(r, 50))
  if (poller.getSummary().successUnread !== 1) fail(`poller 汇总错误：successUnread=${poller.getSummary().successUnread}，应为 1`)
  if (rendered.successUnread !== 1 || rendered.building !== 0) {
    fail(`BUG 复现：构建成功后 footer 胶囊未更新（displayed building=${rendered.building}, successUnread=${rendered.successUnread}）`)
  }

  // 快照稳定性：无变化的重复扫描不得制造新引用（避免无谓重渲染）
  const stableBefore = poller.getSummary()
  poller.refresh()
  await new Promise((r) => setTimeout(r, 50))
  if (!Object.is(stableBefore, poller.getSummary())) fail('快照不稳定：数值未变却返回了新引用')

  if (commitCount < 3) fail(`提交次数异常：commitCount=${commitCount}`)
  console.log(`ALL CHECKS PASSED (commits=${commitCount})`)
}

void main()
