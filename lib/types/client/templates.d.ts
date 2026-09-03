/**
 * dsh-jenkins —— dsh-Jenkins 配置模板（json / js / ts，按界面语言选择）。
 *
 * 数组格式：每个元素 = 一个发布目标（job + server + environments 参数表），
 * server 支持服务器名称 / id / 地址，弹框自动取交集并预选。
 */
/** 按当前语言取配置模板（函数形式 —— 语言切换后重渲染即取新文案）。 */
export declare const getTemplates: () => Record<"json" | "js" | "ts", string>;
//# sourceMappingURL=templates.d.ts.map