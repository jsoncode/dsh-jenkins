/**
 * dsh-jenkins —— 侧边栏底部入口（sidebar.footer.action）：
 * 常驻的「Jenkins 配置」按钮（位于 dsh 配置按钮上方的 footer.action 区），
 * 点击打开统一弹框（发布 / 配置 / 历史 三个 tab）。不再按工作区配置门控 ——
 * 服务器配置入口本就应随时可达。
 *
 * 按钮右侧两个任务状态小胶囊（数据来自全局轮询器每次扫描的汇总）：
 * - 橙色：构建中（含排队）任务数，无进行中任务时不显示；
 * - 绿色：构建成功但尚未在「历史」tab 查看过的条数，打开历史后自动消失。
 */

import { useEffect, useState } from 'react'
import { t } from '../i18n.ts'
import type { Poller, TaskSummary } from '../poller.ts'
import { JENKINS_LOGO } from '../logo.ts'

export interface FooterButtonProps {
  /** 打开统一「Jenkins 配置」弹框。 */
  onOpen(): void
  /** 上报当前会话 id（供全局轮询 / 历史读取复用宿主命令）。 */
  reportSession?: (sessionId: string) => void
  wide?: boolean
  useSessions?: (selector: (s: { current?: string }) => unknown) => unknown
  /** 全局轮询器：提供构建中 / 成功未读的任务数量汇总（footer 胶囊数据源）。 */
  poller?: Poller
}

const EMPTY_SUMMARY: TaskSummary = { building: 0, successUnread: 0 }

export function FooterButton({ onOpen, reportSession, wide = false, useSessions, poller }: FooterButtonProps) {
  const currentSessionId = useSessions
    ? (useSessions((s) => s && s.current) as string | undefined)
    : null
  if (reportSession && currentSessionId) reportSession(currentSessionId)
  // 任务数量汇总：订阅轮询器，每次扫描后刷新（发布提交 / 构建完成 / 打开历史清除未读均会触发）
  const [summary, setSummary] = useState<TaskSummary>(EMPTY_SUMMARY)
  useEffect(() => {
    if (!poller) return
    const update = (): void => { setSummary(poller.getSummary()) }
    update()
    return poller.subscribe(update)
  }, [poller])
  // 会话切换（或首次挂载）时唤醒一次扫描，保证汇总跟随当前会话的数据
  useEffect(() => {
    if (poller && currentSessionId) poller.refresh()
  }, [poller, currentSessionId])
  const showBuilding = summary.building > 0
  const showDone = summary.successUnread > 0
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
      {showBuilding || showDone ? (
        <span className="dshj-footer-caps">
          {showBuilding ? (
            <span className="dshj-capsule dshj-capsule-building" title={t('footerBuilding') + ': ' + summary.building}>
              {summary.building}
            </span>
          ) : null}
          {showDone ? (
            <span className="dshj-capsule dshj-capsule-done" title={t('footerDoneUnread') + ': ' + summary.successUnread}>
              {summary.successUnread}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}
