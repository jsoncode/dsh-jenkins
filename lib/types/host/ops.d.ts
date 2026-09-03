/**
 * dsh-jenkins —— 操作分发（命令与模型工具共用）：runOp 全部分支。
 *
 * 分支：workspaceConfig / configParseContent / workspaceTrigger / saveTemplate / list / save / delete / test /
 * jobs / jobDetail / jobHistory / trigger / queueStatus / buildStatus / buildLog / cancel /
 * updateCheck / pluginUpdateStart / pluginUpdateStatus。
 */
import type { HostCtxLike } from './jenkins.ts';
import type { OpRequest, OpResult, ServerConfig } from './types.ts';
export interface OpsDeps {
    ctx: HostCtxLike;
    readServers(): ServerConfig[];
    writeServers(servers: ServerConfig[]): Promise<void>;
    findServer(nameOrIdOrUrl: string): ServerConfig | undefined;
    /** 读取浏览器缓存（$DSH_HOME/dsh-jenkins.json 的 cache 字段）。 */
    readCacheJson(): Record<string, unknown>;
    /** 写入浏览器缓存（整体替换）。 */
    writeCacheJson(cache: Record<string, unknown>): Promise<void>;
    /** 数据文件初始化（加载/迁移）完成信号；runOp 开头等待，避免读到空镜像。 */
    storeReady?: Promise<void>;
}
export declare function runOp(deps: OpsDeps, req: OpRequest): Promise<OpResult>;
//# sourceMappingURL=ops.d.ts.map