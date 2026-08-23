/**
 * dsh-jenkins —— 弹框统一挂载（React portal → document.body）。
 *
 * 所有弹框（含多层叠加）都经此组件渲染到 body 顶层：
 * - 蒙版 position:fixed 不再受外层弹框 backdrop-filter 产生的包含块影响，
 *   始终铺满整个视口 —— 点击蒙版只关闭最上层弹框，不会一次关掉多层；
 * - 多层弹框在 DOM 中是 body 的兄弟节点（按 z-index 层级类叠放），
 *   点击上层蒙版的事件不会经过下层弹框的 DOM 祖先，下层不会误关。
 *
 * 点击蒙版默认调用 onBackdropClose（并 stopPropagation）；点击弹框本体不冒泡。
 * 传 backdropClass（层级：dshj-json-backdrop / dshj-confirm-backdrop）与
 * modalClass（尺寸 / 布局）与原有样式体系保持一致。
 */

import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ModalPortalProps {
  /** 蒙版附加类（层级类，如 dshj-json-backdrop / dshj-confirm-backdrop）。 */
  backdropClass?: string
  /** 弹框本体附加类（尺寸 / 布局，如 dshj-log-modal / dshj-config-modal）。 */
  modalClass?: string
  /** 点击蒙版回调（缺省则点击蒙版不关闭）。 */
  onBackdropClose?: () => void
  children: ReactNode
}

export function ModalPortal({ backdropClass, modalClass, onBackdropClose, children }: ModalPortalProps) {
  return createPortal(
    <div
      className={'dshj-backdrop' + (backdropClass ? ' ' + backdropClass : '')}
      onClick={onBackdropClose
        ? (e) => { e.stopPropagation(); onBackdropClose() }
        : undefined}
    >
      <div className={'dshj-modal' + (modalClass ? ' ' + modalClass : '')} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  )
}
