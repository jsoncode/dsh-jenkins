/**
 * dsh-jenkins —— 浏览器半边：统一「Jenkins 配置」弹框开关（footer 入口 ↔ overlay 弹框共享）。
 *
 * 入口与弹框合并为单一弹框（tab：发布 / 配置 / 历史）后，不再需要独立的
 * 发布（LaunchInfo）与历史（cwd）store —— 弹框内自行按当前工作区推导数据。
 * footer 按钮排序功能已移除：入口注册不传 order，使用宿主默认排序。
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
export interface ConfigModalStore {
    store: StoreState<boolean>;
    useOpen(): boolean;
}
/** 统一「Jenkins 配置」弹框的打开状态（footer 入口 open，overlay 弹框消费）。 */
export declare function makeConfigModalStore(): ConfigModalStore;
export {};
//# sourceMappingURL=store.d.ts.map