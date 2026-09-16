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
import type { ProjectConfigMap } from './types.ts';
export declare const MAP_FILE = "dsh-jenkins-map.json";
/** 项目配置文件绝对路径。 */
export declare function mapFilePath(dir: string): string;
/** 序列化为文件内容（2 空格缩进 + 末尾换行，便于人工编辑与 diff）。 */
export declare function serializeProjectMap(map: ProjectConfigMap): string;
/** 读取项目配置文件。不存在 → {}；损坏 → 备份 .bak 并返回 {}。 */
export declare function loadProjectMap(dir: string): Promise<ProjectConfigMap>;
/** 写入项目配置文件（整体替换）。写操作串行化，避免并发写坏文件。 */
export declare function saveProjectMap(dir: string, map: ProjectConfigMap): Promise<void>;
//# sourceMappingURL=project-map.d.ts.map