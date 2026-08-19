/**
 * dsh-jenkins —— 浏览器半边：与宿主通信。
 *
 * 默认走宿主 webServer 注册的带信任围栏的 HTTP 路由 /dsh-jenkins/api
 * （fetch POST JSON → { ok, value } 信封），请求不进入对话命令通道，因此不会在
 * 页面产生 command 节点（空状态行 / {"ok":true,...} 调试卡片），后台轮询也不会
 * 每 3 秒给会话追加一条记录。
 *
 * 老宿主（未注册该路由，如 headless 组合）自动回退到 commands.execute 命令通道，
 * 仅作兼容，不影响新宿主上的行为。
 */
export interface RunResult {
    ok: boolean;
    error?: string;
    code?: string;
    [key: string]: unknown;
}
export type RunFn = (sessionId: string, op: Record<string, unknown>) => Promise<RunResult>;
export declare function makeRun(ctx: {
    remote: {
        commands: {
            execute(sessionId: string, command: string): Promise<unknown>;
        };
    };
}): RunFn;
//# sourceMappingURL=rpc.d.ts.map