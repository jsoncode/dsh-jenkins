/**
 * dsh-jenkins —— 操作分发（命令与模型工具共用）：runOp 全部分支。
 *
 * 分支：workspaceConfig / workspaceTrigger / saveTemplate / list / save / delete / test /
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
    /** 读取浏览器缓存（$DSH_HOME/settings.yaml 中的 dsh-jenkins.cacheJson）。 */
    readCacheJson(): Record<string, unknown>;
    /** 写入浏览器缓存（整体替换）。 */
    writeCacheJson(cache: Record<string, unknown>): Promise<void>;
}
export declare function runOp(deps: OpsDeps, req: OpRequest): Promise<OpResult>;
//# sourceMappingURL=ops.d.ts.map