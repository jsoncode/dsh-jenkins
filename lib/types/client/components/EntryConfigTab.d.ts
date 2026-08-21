/**
 * dsh-jenkins —— 统一弹框「入口配置」tab：侧边栏底部入口（footer 按钮）的设置。
 */
import type { RunFn } from '../rpc.ts';
import type { FooterOrderStoreApi } from '../store.ts';
export interface EntryConfigTabProps {
    run: RunFn;
    sessionId: string;
    /** footer 排序策略共享 store（开关 ↔ footer 注册处实时联动）。 */
    footerOrderStore: FooterOrderStoreApi;
}
export declare function EntryConfigTab({ run, sessionId, footerOrderStore }: EntryConfigTabProps): import("react").JSX.Element;
//# sourceMappingURL=EntryConfigTab.d.ts.map