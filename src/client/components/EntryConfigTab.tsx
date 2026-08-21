/**
 * dsh-jenkins —— 统一弹框「入口配置」tab：侧边栏底部入口（footer 按钮）的设置。
 */

import { useEffect } from 'react'
import { t } from '../i18n.ts'
import type { RunFn } from '../rpc.ts'
import type { FooterOrderPolicy, FooterOrderStoreApi } from '../store.ts'

export interface EntryConfigTabProps {
  run: RunFn
  sessionId: string
  /** footer 排序策略共享 store（开关 ↔ footer 注册处实时联动）。 */
  footerOrderStore: FooterOrderStoreApi
}

export function EntryConfigTab({ run, sessionId, footerOrderStore }: EntryConfigTabProps) {
  const footerOrder = footerOrderStore.useValue()

  // 打开 tab 时同步宿主持久化值；切换即时生效并写回宿主。
  useEffect(() => {
    run(sessionId, { op: 'footerOrderGet' }).then((r) => {
      const v = r && r.ok ? r.footerOrder : undefined
      if (v === 'front' || v === 'back') footerOrderStore.store.set(v)
    }).catch(() => { })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const changeFooterOrder = (v: FooterOrderPolicy) => {
    footerOrderStore.store.set(v)
    run(sessionId, { op: 'footerOrderSet', footerOrder: v }).catch(() => { })
  }

  return (
    <div className="dshj-settings">
      {/* Footer 排序：与其他插件共存时「Jenkins 配置」按钮的位置 */}
      <div className="dshj-card">
        <div className="dshj-card-main">
          <div className="dshj-card-name">{t('footerOrder')}</div>
          <div className="dshj-card-meta">{t('footerOrderHint')}</div>
        </div>
        <div className="dshj-card-ops">
          <button
            type="button"
            className={'dshj-btn dshj-btn-small' + (footerOrder === 'front' ? ' dshj-btn-active' : '')}
            onClick={() => changeFooterOrder('front')}
          >
            {t('footerOrderFront')}
          </button>
          <button
            type="button"
            className={'dshj-btn dshj-btn-small' + (footerOrder === 'back' ? ' dshj-btn-active' : '')}
            onClick={() => changeFooterOrder('back')}
          >
            {t('footerOrderBack')}
          </button>
        </div>
      </div>
    </div>
  )
}
