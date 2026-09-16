/**
 * dsh-jenkins —— 集中式项目配置文件 `$DSH_HOME/dsh-jenkins-map.json`。
 *
 * 文件内容就是 map 本身（无包装层，与手写/粘贴的格式完全一致，方便直接编辑）：
 * ```json
 * { "health-check-ui": [ { "job": "...", "server": "...", "environments": { ... } } ] }
 * ```
 *
 * - 读：文件不存在 → 空 map；JSON 损坏 → 备份 `.bak` 后按空 map 处理（不崩溃）；
 * - 写：进程内串行队列 + 临时文件 rename 原子写（与 store.ts 同一策略）；
 * - 旧版把项目配置放在插件数据文件 `dsh-jenkins.json` 的 `projects` 字段里，
 *   首次启动时由 index.ts 迁移到这里（见 migrateLegacyProjects）。
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { sanitizeProjectMap } from "./projects.js";
export const MAP_FILE = 'dsh-jenkins-map.json';
/** 项目配置文件绝对路径。 */
export function mapFilePath(dir) {
    return join(dir, MAP_FILE);
}
/** 序列化为文件内容（2 空格缩进 + 末尾换行，便于人工编辑与 diff）。 */
export function serializeProjectMap(map) {
    return JSON.stringify(map ?? {}, null, 2) + '\n';
}
/** 读取项目配置文件。不存在 → {}；损坏 → 备份 .bak 并返回 {}。 */
export async function loadProjectMap(dir) {
    const target = mapFilePath(dir);
    let raw;
    try {
        raw = await readFile(target, 'utf8');
    }
    catch (e) {
        const err = e;
        if (err && err.code === 'ENOENT')
            return {};
        console.warn(`[dsh-jenkins] cannot read project map: ${target}`, e instanceof Error ? e.message : String(e));
        return {};
    }
    try {
        return sanitizeProjectMap(JSON.parse(raw.replace(/^\uFEFF/, '')));
    }
    catch (e) {
        try {
            await rename(target, target + '.bak');
        }
        catch { /* 备份失败忽略 */ }
        console.warn(`[dsh-jenkins] project map corrupt, backed up to .bak and starting empty: ${target}`, e instanceof Error ? e.message : String(e));
        return {};
    }
}
/* ── 原子写（进程内串行队列，与 store.ts 同策略）──────────────── */
let writeChain = Promise.resolve();
function doSave(dir, map) {
    return (async () => {
        await mkdir(dir, { recursive: true });
        const target = mapFilePath(dir);
        const tmp = target + '.tmp';
        await writeFile(tmp, serializeProjectMap(map), { encoding: 'utf8' });
        await rename(tmp, target);
    })();
}
/** 写入项目配置文件（整体替换）。写操作串行化，避免并发写坏文件。 */
export function saveProjectMap(dir, map) {
    const next = writeChain.then(() => doSave(dir, map));
    writeChain = next.catch(() => { });
    return next;
}
