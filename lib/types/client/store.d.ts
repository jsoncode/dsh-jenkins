/**
 * dsh-jenkins —— 浏览器半边：共享 store（设置页入口 ↔ shell.overlay 更新弹框共享）。
 *
 * 入口迁移到设置弹框左侧菜单（settings.section 内嵌渲染）后不再需要弹框开关
 * store；保留插件更新 store —— 「有更新」胶囊在设置页渲染，确认 / 日志弹框
 * 挂在 shell.overlay，两侧共享同一份版本与 UI 状态。
 */
export interface StoreState<T> {
    value: T | null;
    listeners: Array<() => void>;
    emit(): void;
    subscribe(l: () => void): () => void;
}
/** 插件更新检查结果（宿主 updateCheck op 载荷）。 */
export interface UpdateInfo {
    /** 被安装根目录 package.json 的当前版本。 */
    current: string;
    /** npm registry 上的最新版本（未取到为空串）。 */
    latest: string;
    /** latest 是否比 current 更新。 */
    hasUpdate: boolean;
}
/** 插件更新进程状态（宿主 pluginUpdateStatus op 载荷）。 */
export interface UpdateStatusView {
    running: boolean;
    done: boolean;
    /** 累计输出（宿主环形缓冲尾部）。 */
    output: string;
    exitCode: number | null;
    error: string;
}
/** 更新交互 UI 状态：none=未打开 confirm=确认弹框 log=日志大弹框。 */
export type UpdateUi = 'none' | 'confirm' | 'log';
/** 插件更新 store：版本信息（胶囊显隐）+ 交互 UI 状态（确认弹框 → 日志大弹框）。 */
export interface UpdateModalStore {
    setUpdate(info: UpdateInfo): void;
    useUpdate(): UpdateInfo | null;
    openUpdateConfirm(): void;
    openUpdateLog(): void;
    closeUpdateUi(): void;
    useUpdateUi(): UpdateUi;
}
export declare function makeUpdateModalStore(): UpdateModalStore;
//# sourceMappingURL=store.d.ts.map