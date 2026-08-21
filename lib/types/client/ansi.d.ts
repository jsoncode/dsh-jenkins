/**
 * dsh-jenkins —— Jenkins 日志 ANSI 控制序列 → 带样式的 HTML。
 * 参考 chrome-plugin-hook-request 的 ansiToHtml 方案：
 * 仅处理 SGR 序列（\x1b[...m，颜色 / 加粗），其余 CSI 控制序列（清屏/光标移动等）剔除，
 * 避免日志中残留乱码字符。
 */
/** 是否含终端 ANSI 控制序列（用于判断是否需要样式化渲染）。 */
export declare function containsAnsi(text: string): boolean;
/**
 * 将 ANSI 文本转为带样式的 HTML 片段（不含外层容器）。
 * 先处理 \r 覆盖行（进度条/动态刷新日志），再按 SGR 序列切分渲染；
 * 无序列时结果等价于转义后的纯文本，可安全用于 dangerouslySetInnerHTML。
 */
export declare function ansiToHtml(text: string): string;
//# sourceMappingURL=ansi.d.ts.map