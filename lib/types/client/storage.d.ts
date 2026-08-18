/**
 * dsh-jenkins —— 浏览器半边：localStorage 存储（发布参数回显缓存 + 发布历史）。
 */
export interface CachedLaunch {
    serverId?: string;
    jobPath?: string;
    parameters?: Record<string, string | number | boolean>;
}
export interface HistoryEntry {
    id: string;
    time: number;
    job: string;
    server: string;
    env?: string;
    params?: Record<string, string | number | boolean>;
    result?: string | null;
    cwd?: string;
}
export declare const storage: {
    readCache: () => Record<string, CachedLaunch>;
    writeCache: (cwd: string, entry: CachedLaunch) => void;
    readHistory: (cwd: string) => HistoryEntry[];
    pushHistory: (cwd: string, entry: HistoryEntry) => string;
    updateHistoryResult: (cwd: string, id: string, result: string) => void;
    readAllHistory: () => HistoryEntry[];
    clearHistory: (cwd: string | null) => void;
};
/** 服务器匹配：配置里的 server（名称 / id / 地址）与已配置服务器比对（地址去尾部斜杠）。 */
export declare const normServerUrl: (u: string) => string;
export declare function matchServer(s: {
    name: string;
    id: string;
    baseUrl: string;
}, ref: string): boolean;
//# sourceMappingURL=storage.d.ts.map