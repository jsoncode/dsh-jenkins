/**
 * dsh-jenkins map op 端到端隔离测试（不依赖宿主 / 不联网）：
 *   mapLoad（读 + 自动发现只补缺失）→ mapSave（整体替换 / 校验）
 *   → mapDiscover（重新发现：默认只补缺失，overwrite 时覆盖同名）
 *
 * 用最小 fs / shell 桩替换宿主服务（这两个 op 分支仅有的外部依赖），
 * 项目配置文件走临时目录，验证「界面 → op → dsh-jenkins-map.json」的完整链路。
 */
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runOp } from '../src/host/ops.ts'
import type { OpsDeps } from '../src/host/ops.ts'
import type { HostCtxLike } from '../src/host/jenkins.ts'
import { mapFilePath, loadProjectMap, saveProjectMap } from '../src/host/project-map.ts'
import { EMPTY_STORE } from '../src/host/store.ts'
import type { JenkinsStore } from '../src/host/store.ts'
import type { ProjectConfigMap, ServerConfig } from '../src/host/types.ts'

const fail = (msg: string): never => { throw new Error('FAIL: ' + msg) }
const ok = (msg: string): void => console.log('ok -', msg)

const guard = setTimeout(() => { console.error('FAIL: timeout'); process.exit(1) }, 30000)
guard.unref?.()

/** 最小 fs 桩：resolve 拼路径，stat 按真实磁盘判定存在性，readText 走真实文件。 */
function makeFsStub() {
  return {
    resolve: async (name: string, opts?: { cwd: string }): Promise<string> => join(opts?.cwd || '', name),
    stat: async (target: string): Promise<unknown> => {
      const { stat } = await import('node:fs/promises')
      return stat(target).then(() => ({ size: 1 })).catch(() => undefined)
    },
    readText: async (target: string): Promise<string> => readFile(target, 'utf8'),
    processPath: (target: string): string => target,
    writeText: async (): Promise<unknown> => undefined,
  }
}

const dir = await mkdtemp(join(tmpdir(), 'dshj-map-ops-'))
try {
  const store: JenkinsStore = EMPTY_STORE()
  const servers: ServerConfig[] = [{
    id: 'srv-dev', name: '腾讯云UAT', baseUrl: 'https://dev-jenkins-tx.whale-plus.com',
    username: 'jason', token: 'token', insecure: false,
  }]
  store.servers = servers

  const fsStub = makeFsStub()
  const shellStub = { resolve: (spec: unknown) => spec, run: async () => ({ exitCode: 0, stdout: { text: '[]' }, stderr: { text: '' } }) }
  const ctx = { get: (name: string): unknown => (name === 'fs' ? fsStub : name === 'shell' ? shellStub : undefined) } as HostCtxLike

  let map: ProjectConfigMap = {}
  const deps: OpsDeps = {
    ctx,
    readServers: () => store.servers,
    writeServers: async (next) => { store.servers = next },
    findServer: (ref) => store.servers.find((s) => s.name === ref || s.id === ref || s.baseUrl.replace(/\/+$/, '') === ref.replace(/\/+$/, '')),
    readMap: () => loadProjectMap(dir),
    writeMap: async (next) => { map = next; await saveProjectMap(dir, next) },
    mapPath: () => mapFilePath(dir),
    readCacheJson: () => store.cache,
    writeCacheJson: async (cache) => { store.cache = cache },
  }

  // 0) 准备两个工作区：一个带 dsh-jenkins.json（数组格式，含 name 显示名 + 3 个环境），一个没有配置
  const wsRoot = join(dir, 'health-check-ui')
  await mkdir(wsRoot, { recursive: true })
  await writeFile(join(wsRoot, 'dsh-jenkins.json'), JSON.stringify([
    { name: 'uat环境', job: 'system3_Front_docker3', server: 'https://dev-jenkins-tx.whale-plus.com', environments: { branch: 'uat5', NodeVersion: 'v24.12.0' } },
    { name: 'prod灰度', job: 'pro_system3_Front_docker3_gray', server: 'https://jenkins-tx.whale-plus.com', environments: { branch: 'release/gray' } },
    { job: 'pro_system3_Front_docker3', server: 'https://jenkins-tx.whale-plus.com', environments: { branch: 'master5' } },
  ]), 'utf8')
  const emptyRoot = join(dir, 'no-config-app')
  await mkdir(emptyRoot, { recursive: true })

  // 1) 空 map + 无工作区
  const list0 = await runOp(deps, { op: 'mapLoad', cwds: [] })
  if (!list0.ok || Object.keys(list0.map as ProjectConfigMap).length !== 0) fail('mapLoad should start empty')
  if (list0.path !== mapFilePath(dir)) fail('mapLoad should report the map file path')
  ok('mapLoad: 初始为空 map，并返回文件路径')

  // 2) mapLoad 带工作区：自动发现（数组格式 → 文件夹名为项目名；name 显示名一起带过来）
  const loaded = await runOp(deps, { op: 'mapLoad', cwds: [wsRoot, emptyRoot] })
  if (!loaded.ok) fail('mapLoad failed: ' + String(loaded.error))
  const discovered = loaded.map as ProjectConfigMap
  if (!discovered['health-check-ui']) fail('discovery did not add the workspace config')
  if (discovered['health-check-ui'][0].environments.branch !== 'uat5') fail('discovery lost params')
  if (discovered['health-check-ui'].length !== 3) fail('discovery lost targets (unlimited envs): ' + discovered['health-check-ui'].length)
  if (discovered['health-check-ui'][0].name !== 'uat环境' || discovered['health-check-ui'][1].name !== 'prod灰度') {
    fail('discovery lost env names: ' + JSON.stringify(discovered['health-check-ui'].map((t) => t.name)))
  }
  if ('name' in discovered['health-check-ui'][2]) fail('unnamed env should stay unnamed after discovery')
  if ((loaded.added as string[]).join(',') !== 'health-check-ui') fail('added list wrong: ' + JSON.stringify(loaded.added))
  const results = loaded.results as Array<Record<string, unknown>>
  if (results.length !== 2 || results[0].ok !== true || results[1].reason !== 'not-found') fail('discovery results wrong: ' + JSON.stringify(results))
  const onDisk = JSON.parse(await readFile(mapFilePath(dir), 'utf8'))
  if (!onDisk['health-check-ui']) fail('discovered project was not written to dsh-jenkins-map.json')
  ok('mapLoad: 自动发现工作区配置并写入 map（文件夹名为项目名，未配置工作区报 not-found）')

  // 3) 再次 mapLoad：已存在 → 不重复写、不覆盖（added 为空）
  const again = await runOp(deps, { op: 'mapLoad', cwds: [wsRoot] })
  if ((again.added as string[]).length !== 0) fail('second mapLoad should add nothing')
  ok('mapLoad: 幂等（同名项目已存在时不重复写入）')

  // 4) mapSave：整体替换（含手改项目名/环境数/环境名）、允许清空为 {}
  const saveRes = await runOp(deps, {
    op: 'mapSave',
    map: {
      ...discovered,
      'boss_backend': [{ name: 'uat环境', job: 'j2', server: '腾讯云UAT', environments: { RETRY: 2, DEPLOY: false } }],
    },
  })
  if (!saveRes.ok) fail('mapSave failed: ' + String(saveRes.error))
  const savedMap = saveRes.map as ProjectConfigMap
  if (!savedMap['boss_backend'] || savedMap['boss_backend'][0].environments.RETRY !== 2) fail('mapSave lost the new project')
  if (savedMap['boss_backend'][0].environments.DEPLOY !== false) fail('mapSave lost boolean type')
  if (savedMap['boss_backend'][0].name !== 'uat环境') fail('mapSave lost the env name')
  const reread = await loadProjectMap(dir)
  if (!reread['boss_backend']) fail('mapSave did not persist to file')
  if (reread['boss_backend'][0].name !== 'uat环境') fail('env name not persisted to the map file')
  ok('mapSave: 整体替换 map 并落盘（标量类型 / 环境名保真）')

  const badSave = await runOp(deps, { op: 'mapSave', map: { broken: [{ job: '', server: 's' }] } })
  if (badSave.ok || badSave.code !== 'project-invalid') fail('mapSave accepted a target without job: ' + String(badSave.code))
  if (!(await loadProjectMap(dir))['broken']) { /* 期望：非法保存没有落盘 */ } else fail('invalid mapSave leaked into the file')
  const badShape = await runOp(deps, { op: 'mapSave', map: [1, 2] })
  if (badShape.ok || badShape.code !== 'project-invalid') fail('mapSave accepted an array root')
  const cleared = await runOp(deps, { op: 'mapSave', map: {} })
  if (!cleared.ok || Object.keys(cleared.map as ProjectConfigMap).length !== 0) fail('mapSave should accept clearing to {}')
  ok('mapSave: 非法载荷被拒绝且不落盘；允许清空为 {}')

  // 5) mapDiscover：默认只补缺失（恢复被清空的 map）
  await runOp(deps, { op: 'mapSave', map: { 'health-check-ui': [{ job: '手改job', server: 's', environments: {} }] } })
  const discoverKeep = await runOp(deps, { op: 'mapDiscover', cwds: [wsRoot] })
  if (!discoverKeep.ok) fail('mapDiscover failed: ' + String(discoverKeep.error))
  const kept = discoverKeep.map as ProjectConfigMap
  if (kept['health-check-ui'][0].job !== '手改job') fail('mapDiscover overwrote an existing project without overwrite=true')
  if ((discoverKeep.added as string[]).length !== 0) fail('mapDiscover reported a bogus addition')
  if ((discoverKeep.updated as string[]).length !== 0) fail('mapDiscover reported a bogus update')
  ok('mapDiscover: 默认只补缺失（已有项目保持手改内容）')

  // 6) mapDiscover overwrite=true：用工作区配置覆盖同名项目（含环境名与环境数量）
  const discoverOver = await runOp(deps, { op: 'mapDiscover', cwds: [wsRoot], overwrite: true })
  if (!discoverOver.ok) fail('mapDiscover(overwrite) failed')
  const overridden = discoverOver.map as ProjectConfigMap
  if (overridden['health-check-ui'][0].job !== 'system3_Front_docker3') fail('mapDiscover did not overwrite with overwrite=true')
  if (overridden['health-check-ui'].length !== 3) fail('mapDiscover(overwrite) lost envs')
  if (overridden['health-check-ui'][1].name !== 'prod灰度') fail('mapDiscover(overwrite) lost env name')
  if ((discoverOver.updated as string[]).join(',') !== 'health-check-ui') fail('updated list wrong: ' + JSON.stringify(discoverOver.updated))
  ok('mapDiscover: overwrite=true 用工作区配置覆盖同名项目（环境名 / 数量一起更新）')

  // 7) 边界：没有工作区 → cwd-missing；fs/shell 缺失 → mapLoad 仍可用、mapDiscover 报错
  const noCwds = await runOp(deps, { op: 'mapDiscover', cwds: [] })
  if (noCwds.ok || noCwds.code !== 'cwd-missing') fail('mapDiscover accepted empty cwds: ' + String(noCwds.code))
  const noFsCtx = { get: (): unknown => undefined } as HostCtxLike
  const noFsLoad = await runOp({ ...deps, ctx: noFsCtx }, { op: 'mapLoad', cwds: [wsRoot] })
  if (!noFsLoad.ok || noFsLoad.discoverError !== 'fs-missing') fail('mapLoad without fs should still return the map with discoverError')
  const noFsDiscover = await runOp({ ...deps, ctx: noFsCtx }, { op: 'mapDiscover', cwds: [wsRoot] })
  if (noFsDiscover.ok || noFsDiscover.code !== 'fs-missing') fail('mapDiscover without fs should fail loudly')
  ok('边界: 无工作区报 cwd-missing；fs 缺失时 mapLoad 降级可用、mapDiscover 明确报错')

  console.log('\nALL MAP OP TESTS PASSED')
} finally {
  clearTimeout(guard)
  await rm(dir, { recursive: true, force: true })
}
