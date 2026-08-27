/**
 * dsh-jenkins —— 浏览器半边：缓存存储（发布参数回显 + 发布历史）。
 *
 * 存储方式：不再使用浏览器 localStorage，统一走宿主数据文件 $DSH_HOME/
 * dsh-jenkins.json（服务器 Token 加密、缓存明文），因此无论从哪里打开 dsh
 * 服务（本机任意入口）都能访问同一份缓存。所有方法为异步，经宿主命令
 * （cacheGet / cacheSet）读写；宿主不可用时退化为内存镜像（不落盘）。
 */
import type { RunFn } from './rpc.ts';
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
    serverId?: string;
    segments?: string[];
    env?: string;
    params?: Record<string, string | number | boolean>;
    result?: string | null;
    cwd?: string;
    /** 轮询所需：队列号（排队阶段） */
    queueId?: number | null;
    /** 轮询所需：构建号（已开始后回填） */
    buildNumber?: number | null;
    /** 构建页面 URL（完成后回填，供日志弹框/链接跳转） */
    url?: string;
    /** 触发时刻（用于轮询超时判定） */
    since?: number;
    /** 触发时的会话 id（后台轮询经 commands.execute 复用） */
    sessionId?: string;
    /** 未读标记：发布后未打开过「历史」tab 查看即为未读；打开历史 tab 时自动清除。 */
    unread?: boolean;
}
export interface StorageApi {
    readCache(sessionId: string, cwd: string): Promise<CachedLaunch | null>;
    writeCache(sessionId: string, cwd: string, entry: CachedLaunch): Promise<void>;
    pushHistory(sessionId: string, cwd: string, entry: HistoryEntry): Promise<string>;
    updateHistoryResult(sessionId: string, cwd: string, id: string, result: string): Promise<void>;
    updateHistoryPoll(sessionId: string, cwd: string, id: string, patch: Partial<Pick<HistoryEntry, 'buildNumber' | 'queueId' | 'url'>>): Promise<void>;
    readAllHistory(sessionId: string): Promise<HistoryEntry[]>;
    /** 清除全部发布历史的未读标记（打开「历史」tab 时调用）。 */
    markAllHistoryRead(sessionId: string): Promise<void>;
    clearHistory(sessionId: string, cwd: string | null): Promise<void>;
}
export declare function createStorage(run: RunFn): StorageApi;
/** 服务器匹配：配置里的 server（名称 / id / 地址）与已配置服务器比对（地址去尾部斜杠）。 */
export declare const normServerUrl: (u: string) => string;
export declare function matchServer(s: {
    name: string;
    id: string;
    baseUrl: string;
}, ref: string): boolean;
//# sourceMappingURL=storage.d.ts.map