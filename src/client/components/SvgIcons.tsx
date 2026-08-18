/**
 * dsh-jenkins —— 内联 SVG 图标组件。
 */

export function SvgPlus({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden>
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  )
}

export function SvgClock({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx={12} cy={12} r={10} />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
