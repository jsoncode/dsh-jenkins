/**
 * dsh-jenkins —— Jenkins 日志 ANSI 控制序列 → 带样式的 HTML。
 * 参考 chrome-plugin-hook-request 的 ansiToHtml 方案：
 * 仅处理 SGR 序列（\x1b[...m，颜色 / 加粗），其余 CSI 控制序列（清屏/光标移动等）剔除，
 * 避免日志中残留乱码字符。
 */

/** SGR（Select Graphic Rendition）序列：\x1b[...m */
const ANSI_SGR_RE = /\x1b\[([0-9;]*)m/g
/** 非 SGR 的 CSI 控制序列（如 \x1b[K 清行、\x1b[?25l 隐藏光标等），渲染时剔除 */
const ANSI_OTHER_RE = /\x1b\[[0-9;?]*[A-Za-z]/g

/** 亮色主题下调色板（与 Jenkins 终端默认一致，30-37 / 90-97 前景色）。 */
const FG_COLORS: Record<number, string> = {
  30: '#abb2bf',
  31: '#e06c75',
  32: '#98c379',
  33: '#e5c07b',
  34: '#61afef',
  35: '#c678dd',
  36: '#56b6c2',
  37: '#d7dae0',
  90: '#5c6370',
  91: '#ff7b86',
  92: '#b5e890',
  93: '#ffd68a',
  94: '#79c0ff',
  95: '#d2a8ff',
  96: '#7ce8ff',
  97: '#ffffff',
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function applySgrCodes(codes: number[], state: { bold: boolean; color: string }): void {
  for (const code of codes) {
    if (code === 0) {
      state.bold = false
      state.color = ''
    } else if (code === 1) {
      state.bold = true
    } else if (code === 22) {
      state.bold = false
    } else if (code === 39) {
      state.color = ''
    } else if (FG_COLORS[code]) {
      state.color = FG_COLORS[code]
    }
  }
}

/** 是否含终端 ANSI 控制序列（用于判断是否需要样式化渲染）。 */
export function containsAnsi(text: string): boolean {
  ANSI_SGR_RE.lastIndex = 0
  return ANSI_SGR_RE.test(text)
}

/**
 * 将 ANSI 文本转为带样式的 HTML 片段（不含外层容器）。
 * 先处理 \r 覆盖行（进度条/动态刷新日志），再按 SGR 序列切分渲染；
 * 无序列时结果等价于转义后的纯文本，可安全用于 dangerouslySetInnerHTML。
 */
export function ansiToHtml(text: string): string {
  // 处理 \r 覆盖行（进度条/动态刷新日志）：\r 前到行首的内容被 \r 后的最新内容覆盖
  // （如 "进度1\r进度2\r...\r最终" 只保留 "最终"）；Windows 的 \r\n 顺带规范化为 \n。
  const normalized = text.replace(/[^\n]*\r/g, '')
  const state = { bold: false, color: '' }
  const parts: string[] = []
  let lastIndex = 0
  ANSI_SGR_RE.lastIndex = 0

  const pushStyled = (chunk: string): void => {
    // 剔除非 SGR 的控制序列（清屏/光标等），避免显示乱码
    const clean = chunk.replace(ANSI_OTHER_RE, '')
    if (!clean) return
    const escaped = escapeHtml(clean)
    const styles: string[] = []
    if (state.bold) styles.push('font-weight:700')
    if (state.color) styles.push('color:' + state.color)
    parts.push(styles.length ? `<span style="${styles.join(';')}">${escaped}</span>` : escaped)
  }

  let match: RegExpExecArray | null
  while ((match = ANSI_SGR_RE.exec(normalized)) !== null) {
    pushStyled(normalized.slice(lastIndex, match.index))
    lastIndex = match.index + match[0].length
    const codes = match[1]
      .split(';')
      .filter(Boolean)
      .map((c) => Number(c))
    applySgrCodes(codes.length === 0 ? [0] : codes, state)
  }
  pushStyled(normalized.slice(lastIndex))
  return parts.join('')
}
