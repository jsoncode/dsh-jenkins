/**
 * dsh-jenkins —— 「在菜单中显示」滑动开关行（偏好源 showInMenuStore）。
 *
 * 两处渲染同一组件、同一偏好源：宿主「设置 → Jenkins 配置」分区页顶部，
 * 以及插件弹框「配置」tab 顶部。关闭后宿主侧栏 footerAction 的入口按钮
 * 渲染 null（FooterButton 订阅同一个 store，无需刷新页面）。
 */
export declare function ShowInMenuToggle(): import("react").JSX.Element;
//# sourceMappingURL=ShowInMenuToggle.d.ts.map