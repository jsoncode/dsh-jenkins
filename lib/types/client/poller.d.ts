/**
 * dsh-jenkins —— 全局构建状态轮询器。
 *
 * 与组件生命周期解耦：只要有「进行中」的发布历史（result 为空且带轮询数据），
 * 无论执行弹框 / 历史弹框是否打开、是否被关闭，都会在后台持续轮询并回填结果，
 * 避免关闭弹框或打开历史弹框后状态永远停在「进行中」。
 * 历史读写走宿主存储（$DSH_HOME），不依赖浏览器 localStorage。
 *
 * 空闲不轮询：当没有进行中的任务时（hasInFlight 为 false），tick() 直接返回，
 * 连宿主存储的 cacheGet 扫描请求都不发 —— 页面静止时零网络开销。新任务触发
 * （发布 tab 提交后）或历史 tab 打开时会显式 refresh() 唤醒扫描，
 * 发现进行中任务后自动恢复定时轮询。
 */
import type { StorageApi } from './storage.ts';
import type { RunFn } from './rpc.ts';
export type LivePhase = 'queued' | 'running' | 'done' | 'error' | 'cancelled';
export interface LiveBuild {
    entryId: string;
    cwd: string;
    phase: LivePhase;
    /** 当前展示文案（已本地化处理前的语义，客户端按阶段渲染） */
    status: string;
    buildNumber: number | null;
    result?: string;
    duration?: number;
    url?: string;
    since: number;
}
/** 任务数量汇总（footer 胶囊消费）：构建中（含排队）数量 + 已成功但未读的数量。 */
export interface TaskSummary {
    /** 进行中的任务数（result 为空且带轮询数据：排队 / 构建中）。 */
    building: number;
    /** 构建成功但尚未在「历史」tab 查看过的条数（打开历史后清零）。 */
    successUnread: number;
}
export interface Poller {
    /** 触发一轮扫描（异步，可重复调用，内部防重入；空闲时直接返回，不发请求）。 */
    tick(): void;
    /** 立即扫描一次（发布提交后 / 历史弹框打开时调用，加速首轮反馈并唤醒空闲轮询）。 */
    refresh(): void;
    subscribe(fn: () => void): () => void;
    getLive(entryId: string): LiveBuild | undefined;
    /** 当前任务数量汇总（由最近一次扫描计算；footer 胶囊直接读取）。 */
    getSummary(): TaskSummary;
}
export declare function createPoller(run: RunFn, storage: StorageApi, getSession: () => string): Poller;
//# sourceMappingURL=poller.d.ts.map