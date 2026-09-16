/**
 * dsh-jenkins —— 插件数据文件存储（$DSH_HOME/dsh-jenkins.json + dsh-jenkins.key）。
 *
 * 取代 settings.yaml 中的 dsh-jenkins 命名空间，作为插件数据的唯一持久化源：
 * - 服务器列表（Token 以 AES-256-GCM 加密，密钥文件 dsh-jenkins.key 机器绑定）；
 * - 浏览器缓存（发布参数回显 lastParams + 发布历史 history，明文 JSON）。
 *
 * 集中式项目配置**不在本文件**：它是独立的 `dsh-jenkins-map.json`（见 project-map.ts），
 * 本文件只保留对旧版 `projects` 字段的读取兼容（LoadedStore.legacyProjects，首次启动迁移）。
 *
 * 路径解析优先级：settings 服务 documentPath 所在目录 → $DSH_HOME 环境变量 →
 * ~/.dsh。不新增 peerDependency（复用 node:fs / node:crypto / node:os）。
 *
 * 写路径为进程内串行队列 + 临时文件 rename 原子写；损坏文件备份为 .bak。
 */
import type { ProjectConfigMap, ServerConfig } from './types.ts';
/**
 * 数据文件格式版本：
 * - v1 = 服务器 + 缓存；
 * - v2 = 曾把集中式项目配置写在 `projects` 字段（已迁出到独立文件
 *   `dsh-jenkins-map.json`，本文件仅保留读取兼容）。
 */
export declare const STORE_VERSION = 2;
export declare const STORE_FILE = "dsh-jenkins.json";
export declare const KEY_FILE = "dsh-jenkins.key";
/** 插件数据文件内存形态：token 始终为明文，仅落盘时加密。 */
export interface JenkinsStore {
    version: number;
    servers: ServerConfig[];
    cache: Record<string, unknown>;
}
/** loadStore 结果：store 本体 + 旧版遗留的项目配置（迁移用，不再写回本文件）。 */
export interface LoadedStore extends JenkinsStore {
    legacyProjects: ProjectConfigMap;
}
export declare const EMPTY_STORE: () => JenkinsStore;
/**
 * 解析插件数据目录。优先级：settings documentPath 目录 → $DSH_HOME → ~/.dsh。
 * 结果进程内缓存（宿主运行期目录不会变化）。
 */
export declare function resolveStoreDir(settingsDocPath?: string): string;
/** 测试用：重置路径缓存。 */
export declare function resetStoreDirCache(): void;
/**
 * 读取数据文件。
 * @returns 有效 store（含 legacyProjects 迁移字段）；文件不存在返回 null；损坏时备份为 .bak 并返回 null。
 */
export declare function loadStore(dir: string): Promise<LoadedStore | null>;
/** 保存数据文件（整体替换）。写操作串行化，避免并发写坏文件。 */
export declare function saveStore(dir: string, store: JenkinsStore): Promise<void>;
//# sourceMappingURL=store.d.ts.map