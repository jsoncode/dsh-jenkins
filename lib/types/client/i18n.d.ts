/**
 * dsh-jenkins —— 浏览器半边：语言与文案（中英双语，跟随主界面语言）。
 */
/** 读当前语言（组件内请调用此函数而非读取静态快照）。 */
export declare const getLang: () => "zh" | "en";
/** 写当前语言（由宿主 locale 订阅驱动；重渲染由 slot 出口的 locale revision 订阅触发）。 */
export declare const setLang: (next: "zh" | "en") => void;
/** 取文案并替换 {var} 占位符。 */
export declare const t: (key: string, vars?: Record<string, string | number>) => string;
/** 宿主错误通过 code 映射为本地化文本，未知错误回退原文。 */
export declare const tErr: (res: {
    code?: string;
    status?: number;
    error?: string;
    detail?: string;
} | null | undefined, fallback?: string) => string;
/** 时长格式化（配合 t('sec'/'min'/'hour')）。 */
export declare const fmtDur: (ms: number | undefined) => string;
//# sourceMappingURL=i18n.d.ts.map