/**
 * dsh-jenkins —— 宿主「设置 → Jenkins 配置」分区页（settings.section）。
 *
 * 页面只做两件事：承载「在菜单中显示」开关，以及提供打开插件主弹框的入口。
 * 侧栏 footerAction 入口被关闭后，这里是唯一可达入口 —— 发布 / 配置 / 本机
 * 记录 / 历史记录四个 tab 仍在插件弹框里（本页不复制弹框内容）。
 *
 * owner props 由宿主提供：`close` 关闭设置对话框（点「打开」时先关设置再开
 * 弹框，避免两层遮罩叠在一起）。
 */

import { t } from '../i18n.ts'
import { ShowInMenuToggle } from './ShowInMenuToggle.tsx'

export interface PluginSettingsPageProps {
  /** 打开插件主弹框（发布 / 配置 / 本机记录 / 历史记录）。 */
  onOpen(): void
  /** 关闭宿主设置对话框（settings.section owner props）。 */
  close(): void
}

export function PluginSettingsPage({ onOpen, close }: PluginSettingsPageProps) {
  return (
    <div className="dshj-settings">
      <ShowInMenuToggle />
      <div className="dshj-pref-open">
        <button
          type="button"
          className="dshj-btn dshj-btn-primary"
          onClick={() => { close(); onOpen() }}
        >
          {t('openPlugin')}
        </button>
      </div>
    </div>
  )
}
