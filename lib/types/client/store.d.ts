/**
 * dsh-jenkins —— 浏览器半边：弹框开关（footer 按钮 ↔ overlay 弹框共享）。
 */
export interface LaunchInfo {
    cwd: string;
    config: {
        entries: Array<{
            job: string;
            server: string;
            parameters?: Record<string, string | number | boolean>;
        }>;
    } | null;
    sessionId: string;
}
interface StoreState<T> {
    value: T | null;
    listeners: Array<() => void>;
    emit(): void;
    subscribe(l: () => void): () => void;
    open(value: T): void;
    close(): void;
}
export interface LaunchStore {
    store: StoreState<LaunchInfo>;
    useLaunch(): LaunchInfo | null;
}
export interface HistoryStore {
    store: StoreState<string>;
    useLaunch(): string | null;
}
export declare function makeLaunchStore(): LaunchStore;
export declare function makeHistoryStore(): HistoryStore;
export {};
//# sourceMappingURL=store.d.ts.map