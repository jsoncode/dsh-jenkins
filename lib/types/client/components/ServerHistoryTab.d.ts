/**
 * dsh-jenkins —— 统一弹框「历史记录」tab：查看指定 Job 在 Jenkins 服务器上的真实构建记录
 * （区别于「本机记录」tab 的本地发布历史）。
 *
 * 页面结构：服务器下拉 → Job 下拉 → 分割线 → 「日志记录」列表。每条记录展示
 * 状态 / `#构建号 - 发布人 - 项目名称` / 时间 / 描述，点击任意记录打开「构建日志」弹框
 * （复用 BuildLogModal）查看该次构建的完整日志（进行中的构建自动实时刷新、可终止）。
 * 数据来自宿主 op jobHistory（Jenkins remote API：job/<path>/api/json?tree=builds[...]）。
 */
import type { RunFn } from '../rpc.ts';
import type { Poller } from '../poller.ts';
export interface ServerHistoryTabProps {
    run: RunFn;
    sessionId: string;
    /** 全局轮询器：构建日志弹框内进行中状态实时刷新的数据源（与其它 tab 同源）。 */
    poller: Poller;
}
export declare function ServerHistoryTab({ run, sessionId, poller }: ServerHistoryTabProps): import("react").JSX.Element;
//# sourceMappingURL=ServerHistoryTab.d.ts.map