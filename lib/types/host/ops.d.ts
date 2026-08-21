/**
 * dsh-jenkins —— 操作分发（命令与模型工具共用）：runOp 全部分支。
 *
 * 分支：workspaceConfig / workspaceTrigger / list / save / delete / test /
 * jobs / jobDetail / trigger / queueStatus / buildStatus / buildLog / cancel。
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
    /** 读取 footer 排序策略（front/back）。 */
    readFooterOrder(): 'front' | 'back';
    /** 写入 footer 排序策略（front/back）。 */
    writeFooterOrder(v: 'front' | 'back'): Promise<void>;
}
export declare function runOp(deps: OpsDeps, req: OpRequest): Promise<OpResult>;
//# sourceMappingURL=ops.d.ts.map