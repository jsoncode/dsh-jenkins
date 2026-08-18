/**
 * dsh-jenkins —— 浏览器半边：与宿主通信（commands.execute → JSON 文本 → 结果载荷）。
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