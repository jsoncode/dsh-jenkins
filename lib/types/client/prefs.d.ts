/**
 * dsh-jenkins —— 浏览器半边：本地偏好（localStorage 持久化的视图状态）。
 *
 * 目前只有「在菜单中显示」一个开关：关闭后宿主侧栏 footerAction 的
 * 【Jenkins 配置】入口按钮渲染 null（不占位）。纯客户端视图偏好，走
 * localStorage 即可（服务器配置 / 发布历史等数据仍由宿主半边持有）。
 *
 * 默认**开启**：侧栏入口是本插件既有的入口，升级后不应凭空消失；用户可在
 * 宿主「设置 → Jenkins 配置」分区页，或插件弹框「配置」tab 顶部把它关掉。
 * 两处渲染同一个 showInMenuStore，改一处另一处即时同步。
 */
/** useSyncExternalStore 兼容的快照源（引用稳定，直到值变化）。 */
export declare const showInMenuStore: {
    getSnapshot(): boolean;
    subscribe(listener: () => void): () => void;
    /** 写开关并持久化；值不变时是 no-op。 */
    set(next: boolean): void;
};
//# sourceMappingURL=prefs.d.ts.map