/**
 * dsh-jenkins —— 操作分发（命令与模型工具共用）：runOp 全部分支。
 *
 * 分支：workspaceConfig / workspaceTrigger / list / save / delete / test /
 * jobs / jobDetail / trigger / queueStatus / buildStatus。
 */
import type { HostCtxLike } from './jenkins.ts';
import type { OpRequest, OpResult, ServerConfig } from './types.ts';
export interface OpsDeps {
    ctx: HostCtxLike;
    readServers(): ServerConfig[];
    writeServers(servers: ServerConfig[]): Promise<void>;
    findServer(nameOrIdOrUrl: string): ServerConfig | undefined;
}
export declare function runOp(deps: OpsDeps, req: OpRequest): Promise<OpResult>;
//# sourceMappingURL=ops.d.ts.map