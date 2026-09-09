/**
 * dsh-jenkins —— 「在菜单中显示」滑动开关行（偏好源 showInMenuStore）。
 *
 * 两处渲染同一组件、同一偏好源：宿主「设置 → Jenkins 配置」分区页顶部，
 * 以及插件弹框「配置」tab 顶部。关闭后宿主侧栏 footerAction 的入口按钮
 * 渲染 null（FooterButton 订阅同一个 store，无需刷新页面）。
 */

import { useSyncExternalStore } from 'react'
import { t } from '../i18n.ts'
import { showInMenuStore } from '../prefs.ts'

export function ShowInMenuToggle() {
  // 第三个参数（getServerSnapshot）供 SSR / 静态渲染测试使用；浏览器行为不变。
  const on = useSyncExternalStore(
    showInMenuStore.subscribe,
    showInMenuStore.getSnapshot,
    showInMenuStore.getSnapshot,
  )
  return (
    <div className="dshj-pref">
      <div className="dshj-pref-text">
        <div className="dshj-pref-label">{t('showInMenu')}</div>
        <div className="dshj-pref-desc">{t('showInMenuDesc')}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={t('showInMenu')}
        className={'dshj-switch' + (on ? ' dshj-switch-on' : '')}
        onClick={() => { showInMenuStore.set(!on) }}
      >
        <span className="dshj-switch-knob" />
      </button>
    </div>
  )
}
