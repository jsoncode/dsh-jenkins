/**
 * dsh-jenkins —— 插件数据文件存储（$DSH_HOME/dsh-jenkins.json + dsh-jenkins.key）。
 *
 * 取代 settings.yaml 中的 dsh-jenkins 命名空间，作为插件数据的唯一持久化源：
 * - 服务器列表（Token 以 AES-256-GCM 加密，密钥文件 dsh-jenkins.key 机器绑定）；
 * - 浏览器缓存（发布参数回显 lastParams + 发布历史 history，明文 JSON）。
 *
 * 路径解析优先级：settings 服务 documentPath 所在目录 → $DSH_HOME 环境变量 →
 * ~/.dsh。不新增 peerDependency（复用 node:fs / node:crypto / node:os）。
 *
 * 写路径为进程内串行队列 + 临时文件 rename 原子写；损坏文件备份为 .bak。
 */
import type { ServerConfig } from './types.ts';
/** 数据文件格式版本（预留演进）。 */
export declare const STORE_VERSION = 1;
export declare const STORE_FILE = "dsh-jenkins.json";
export declare const KEY_FILE = "dsh-jenkins.key";
/** 插件数据文件内存形态：token 始终为明文，仅落盘时加密。 */
export interface JenkinsStore {
    version: number;
    servers: ServerConfig[];
    cache: Record<string, unknown>;
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
 * @returns 有效 store；文件不存在返回 null；损坏时备份为 .bak 并返回 null。
 */
export declare function loadStore(dir: string): Promise<JenkinsStore | null>;
/** 保存数据文件（整体替换）。写操作串行化，避免并发写坏文件。 */
export declare function saveStore(dir: string, store: JenkinsStore): Promise<void>;
//# sourceMappingURL=store.d.ts.map