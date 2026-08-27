/**
 * dsh-jenkins —— 宿主半边：执行插件更新命令（后台进程 + 输出缓冲）。
 *
 * 浏览器半边点击「更新」胶囊 → 确认弹框 → 大日志弹框：本模块以子进程后台
 * 执行 `dsh plugin --profile web update dsh-jenkins`，stdout/stderr 实时
 * 追加进环形缓冲；客户端轮询 pluginUpdateStatus op 拉取累计输出与运行状态
 * （done / exitCode）。同一时刻只允许一个更新进程；进程内缓冲有上限防膨胀。
 * 更新进程结束（done）后客户端会再查一次 updateCheck；update.ts 为实时读取
 * （无缓存），因此新版本号立即生效（客户端据此隐藏「更新」胶囊）。
 */
export interface PluginUpdateStatus {
    running: boolean;
    done: boolean;
    output: string;
    exitCode: number | null;
    error: string;
}
/**
 * 启动更新进程。已在运行则返回 alreadyRunning=true（不重复启动）；
 * 上次已结束则丢弃旧记录重新开始。
 */
export declare function startPluginUpdate(): {
    ok: boolean;
    alreadyRunning?: boolean;
    error?: string;
};
/** 轮询用：当前更新进程（或最近一次已结束进程）的状态与累计输出。 */
export declare function getPluginUpdateStatus(): PluginUpdateStatus;
//# sourceMappingURL=plugin-update.d.ts.map