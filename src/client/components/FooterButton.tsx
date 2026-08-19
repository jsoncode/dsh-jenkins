/**
 * dsh-jenkins —— 侧边栏底部入口（sidebar.footer.action）：
 * 常驻的「Jenkins 配置」按钮（位于 dsh 配置按钮上方的 footer.action 区），
 * 点击打开统一弹框（发布 / 配置 / 历史 三个 tab）。不再按工作区配置门控 ——
 * 服务器配置入口本就应随时可达。
 */

import { t } from '../i18n.ts'
import { JENKINS_LOGO } from '../logo.ts'

export interface FooterButtonProps {
  /** 打开统一「Jenkins 配置」弹框。 */
  onOpen(): void
  /** 上报当前会话 id（供全局轮询 / 历史读取复用宿主命令）。 */
  reportSession?: (sessionId: string) => void
  wide?: boolean
  useSessions?: (selector: (s: { current?: string }) => unknown) => unknown
}

export function FooterButton({ onOpen, reportSession, wide = false, useSessions }: FooterButtonProps) {
  const currentSessionId = useSessions
    ? (useSessions((s) => s && s.current) as string | undefined)
    : null
  if (reportSession && currentSessionId) reportSession(currentSessionId)
  return (
    <div className={'dshj-footer-group' + (wide ? '' : ' dshj-footer-rail-group')}>
      <button
        type="button"
        className={'dshj-footer-btn' + (wide ? '' : ' dshj-footer-btn-rail')}
        title={t('configBtn')}
        aria-label={t('configBtn')}
        onClick={onOpen}
      >
        <img src={JENKINS_LOGO} alt="" className="dshj-footer-logo" />
        {wide ? <span className="dshj-footer-label">{t('configBtn')}</span> : null}
      </button>
    </div>
  )
}
