/**
 * dsh-jenkins 集中式项目配置（src/host/projects.ts + project-map.ts + store 兼容）隔离测试：
 *  - map 归一化（用户给出的 health-check-ui 形态）、environments / parameters 别名、标量类型
 *  - 严格校验（缺 job/server、坏 environments、数组根）与宽松读取（sanitize）
 *  - 发现式合并：只补缺失（mergeMissingProjects）vs 覆盖（mergeProjectMaps）
 *  - 项目配置文件 dsh-jenkins-map.json：裸 map 落盘 / 读回、文件缺失为空、损坏备份 .bak
 *  - 数据文件不再写 projects，但能读出旧版 legacyProjects 供一次性迁移
 */
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  mergeMissingProjects,
  mergeProjectMaps,
  normalizeProjectMap,
  projectNameFromFilename,
  sanitizeProjectMap,
} from '../src/host/projects.ts'
import { loadProjectMap, mapFilePath, saveProjectMap, serializeProjectMap } from '../src/host/project-map.ts'
import { loadStore, resolveStoreDir, resetStoreDirCache, saveStore } from '../src/host/store.ts'
import type { JenkinsStore } from '../src/host/store.ts'

const fail = (msg: string): never => { throw new Error('FAIL: ' + msg) }
const ok = (msg: string): void => console.log('ok -', msg)

/** 超时保护：任何分支卡住都直接失败，避免测试进程挂死。 */
const guard = setTimeout(() => { console.error('FAIL: timeout'); process.exit(1) }, 30000)
guard.unref?.()

const CENTRAL = {
  'health-check-ui': [
    {
      name: 'uat环境',
      job: 'system3_Front_docker3',
      server: 'https://dev-jenkins-tx.whale-plus.com',
      environments: {
        project: 'health-check-ui',
        branch: 'uat5',
        NodeVersion: 'v24.12.0',
        INSTALL_COMMAND_ACTIVE: 'pnpm i --registry=https://repo.huaweicloud.com/repository/npm/',
        BUILD_COMMAND_ACTIVE: 'pnpm build:uat',
      },
    },
    {
      name: 'prod环境',
      job: 'pro_system3_Front_docker3',
      server: 'https://jenkins-tx.whale-plus.com',
      environments: { project: 'health-check-ui', branch: 'master5' },
    },
  ],
}

try {
  // 1) map 归一化：结构、顺序、标量类型（name 为选填的环境显示名）
  const map = normalizeProjectMap(CENTRAL)
  const targets = map['health-check-ui']
  if (targets.length !== 2) fail('expected 2 targets, got ' + targets.length)
  if (targets[0].job !== 'system3_Front_docker3' || targets[1].job !== 'pro_system3_Front_docker3') fail('target order/job lost')
  if (targets[0].server !== 'https://dev-jenkins-tx.whale-plus.com') fail('server lost')
  if (targets[0].environments.NodeVersion !== 'v24.12.0') fail('string env lost')
  if (targets[0].name !== 'uat环境' || targets[1].name !== 'prod环境') fail('env name lost: ' + JSON.stringify(targets.map((t) => t.name)))
  ok('normalizeProjectMap: map 格式（含 name 显示名）归一化正确')

  // 2) 别名 + 类型 + allowEmpty
  const alias = normalizeProjectMap({
    demo: [{ job: 'j', server: 's', parameters: { RETRY: 3, DEPLOY: false, NOTE: 'x', EMPTY: null } }],
  })
  const env = alias.demo[0].environments
  if (env.RETRY !== 3 || typeof env.RETRY !== 'number') fail('number env not preserved: ' + JSON.stringify(env))
  if (env.DEPLOY !== false || typeof env.DEPLOY !== 'boolean') fail('boolean env not preserved')
  if (env.NOTE !== 'x' || env.EMPTY !== '') fail('string / null env mishandled: ' + JSON.stringify(env))
  if (Object.keys(normalizeProjectMap({}, { allowEmpty: true })).length !== 0) fail('allowEmpty did not accept {}')
  let threwEmpty = false
  try { normalizeProjectMap({}) } catch { threwEmpty = true }
  if (!threwEmpty) fail('strict normalizeProjectMap accepted an empty map')
  ok('normalizeProjectMap: parameters 别名 + 标量类型 + allowEmpty 行为正确')

  // 2b) name + 环境数量不限：三/四个环境都要保住顺序与名字；空 name 不落字段
  const multi = normalizeProjectMap({
    'multi-env': [
      { name: 'uat环境', job: 'j-uat', server: 's-uat', environments: { branch: 'uat5' } },
      { name: 'prod灰度', job: 'j-gray', server: 's-gray', environments: { branch: 'master5', GRAY: true } },
      { name: 'prod环境', job: 'j-prod', server: 's-prod', environments: { branch: 'master5' } },
      { job: 'j-extra', server: 's-extra', environments: {} },
    ],
  })
  const multiTargets = multi['multi-env']
  if (multiTargets.length !== 4) fail('target count not preserved (unlimited envs): ' + multiTargets.length)
  if (multiTargets.map((t) => t.name || '').join(',') !== 'uat环境,prod灰度,prod环境,') fail('env names lost: ' + JSON.stringify(multiTargets.map((t) => t.name)))
  if (multiTargets[1].job !== 'j-gray' || multiTargets[2].server !== 's-prod') fail('env order lost')
  if (multiTargets[1].environments.GRAY !== true) fail('per-env params lost on 2nd env')
  if ('name' in multiTargets[3]) fail('empty name should be omitted from the normalized target')
  if (normalizeProjectMap({ x: [{ name: '   ', job: 'j', server: 's' }] }).x[0].name !== undefined) fail('blank name should be trimmed away')
  ok('normalizeProjectMap: name 保真（空名省略）、环境数量不限且顺序稳定')

  // 3) 发现式合并：只补缺失 vs 覆盖
  const base = normalizeProjectMap({ keep: [{ job: 'mine', server: 's1' }], shared: [{ job: 'old', server: 's2' }] })
  const incoming = normalizeProjectMap({ shared: [{ job: 'from-workspace', server: 's2' }], fresh: [{ job: 'new', server: 's3' }] })
  const missing = mergeMissingProjects(base, incoming)
  if (missing.added.join(',') !== 'fresh') fail('mergeMissingProjects added wrong: ' + JSON.stringify(missing.added))
  if (missing.map.shared[0].job !== 'old') fail('mergeMissingProjects overwrote an existing project')
  if (!missing.map.keep || !missing.map.fresh) fail('mergeMissingProjects lost projects')
  const overwritten = mergeProjectMaps(base, incoming)
  if (overwritten.shared[0].job !== 'from-workspace') fail('mergeProjectMaps did not overwrite')
  ok('合并策略: 默认只补缺失，显式覆盖时才替换同名项目')

  // 4) 严格校验：非法载荷全部报错
  const bad: Array<[unknown, string]> = [
    [{ job: '', server: 's' }, 'job 为空'],
    [{ job: 'j', server: '' }, 'server 为空'],
    [{ job: 'j', server: 's', environments: [] }, 'environments 非对象'],
    [[], '数组元素不是对象'],
  ]
  for (const [payload, label] of bad) {
    let threw = false
    try { normalizeProjectMap({ demo: payload }) } catch { threw = true }
    if (!threw) fail('invalid payload accepted: ' + label)
  }
  let threwNonObject = false
  try { normalizeProjectMap([1, 2, 3]) } catch { threwNonObject = true }
  if (!threwNonObject) fail('array root accepted as map')
  ok('normalizeProjectMap: 非法载荷（缺 job/server、坏 environments、数组根）全部报错')

  // 5) 宽松读取：脏数据跳过，合法项保留
  const sanitized = sanitizeProjectMap({
    good: [{ job: 'j', server: 's', environments: { a: 1 } }],
    emptyList: [],
    notArray: { job: 'j' },
    mixed: [{ job: 'ok', server: 's' }, { job: '', server: '' }],
    '  ': [{ job: 'j', server: 's' }],
  })
  if (Object.keys(sanitized).sort().join(',') !== 'good,mixed') fail('sanitize kept wrong keys: ' + Object.keys(sanitized))
  if (sanitized.mixed.length !== 1) fail('sanitize did not drop the invalid item')
  ok('sanitizeProjectMap: 脏数据跳过、合法项保留')

  // 6) 文件名 → 项目名（工作区根目录配置退回文件夹名）
  if (projectNameFromFilename('/ws/my-app/dsh-jenkins.ts') !== 'my-app') fail('folder-name fallback wrong')
  if (projectNameFromFilename('/ws/my-app/jenkins-uat.json') !== 'jenkins-uat') fail('stem naming wrong')
  ok('projectNameFromFilename: 文件名 / 文件夹名推导正确')

  /* ── 文件层 ───────────────────────────────────────────────── */
  const dir = await mkdtemp(join(tmpdir(), 'dshj-project-map-'))
  resetStoreDirCache()
  resolveStoreDir(dir)
  try {
    // 7) 文件不存在 → {}；写 → 读回（含标量类型）；文件内容就是裸 map
    if (Object.keys(await loadProjectMap(dir)).length !== 0) fail('missing map file should load as {}')
    await saveProjectMap(dir, map)
    const onDisk = JSON.parse(await readFile(mapFilePath(dir), 'utf8'))
    if (!onDisk['health-check-ui'] || onDisk['health-check-ui'][1].environments.branch !== 'master5') fail('map file has wrong shape/keys')
    if (onDisk.version !== undefined) fail('map file should be a bare map (no version wrapper)')
    if (serializeProjectMap(map).indexOf('\n  "health-check-ui"') === -1) fail('serializeProjectMap is not pretty-printed')
    const loadedMap = await loadProjectMap(dir)
    if (loadedMap['health-check-ui'][0].environments.BUILD_COMMAND_ACTIVE !== 'pnpm build:uat') fail('map round-trip lost params')
    ok('project-map: 文件缺失为空 / 落盘为裸 map / 读回保真')

    // 8) 文件损坏 → 备份 .bak 并按空 map 处理，不崩溃
    await writeFile(mapFilePath(dir), '{ broken json', 'utf8')
    if (Object.keys(await loadProjectMap(dir)).length !== 0) fail('corrupt map should load as {}')
    const bakExists = await readFile(mapFilePath(dir) + '.bak', 'utf8').then(() => true).catch(() => false)
    if (!bakExists) fail('corrupt map not backed up to .bak')
    ok('project-map: 损坏文件备份 .bak 并按空 map 处理')

    // 9) 数据文件：不再写 projects；旧版 projects 字段可读出用于迁移
    const store: JenkinsStore = { version: 2, servers: [], cache: { history: {} } }
    await saveStore(dir, store)
    const storeRaw = JSON.parse(await readFile(join(dir, 'dsh-jenkins.json'), 'utf8'))
    if ('projects' in storeRaw) fail('store file should no longer contain projects')
    ok('dsh-jenkins.json: 不再写入 projects 字段（配置已迁到独立文件）')

    await writeFile(join(dir, 'dsh-jenkins.json'), JSON.stringify({ version: 2, servers: [], projects: CENTRAL, cache: {} }), 'utf8')
    const legacyLoaded = await loadStore(dir)
    if (legacyLoaded === null) fail('legacy store not loadable')
    if ('projects' in legacyLoaded) fail('JenkinsStore should not expose projects anymore')
    if (!legacyLoaded.legacyProjects['health-check-ui']) fail('legacy projects field not harvested for migration')
    if (legacyLoaded.legacyProjects['health-check-ui'].length !== 2) fail('legacy projects shape lost')
    ok('loadStore: 旧版 projects 字段作为 legacyProjects 读出（供一次性迁移）')

    // 10) 迁移等价：legacyProjects 只补缺失地并进 map 文件
    const migrated = mergeMissingProjects(await loadProjectMap(dir), legacyLoaded.legacyProjects)
    await saveProjectMap(dir, migrated.map)
    const afterMigration = await loadProjectMap(dir)
    if (!afterMigration['health-check-ui'] || afterMigration['health-check-ui'].length !== 2) fail('migration lost projects')
    if (migrated.added.join(',') !== 'health-check-ui') fail('migration should add exactly the legacy project')
    ok('迁移路径: legacyProjects → dsh-jenkins-map.json（只补缺失）')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }

  console.log('\nALL PROJECT MAP TESTS PASSED')
} finally {
  clearTimeout(guard)
}
