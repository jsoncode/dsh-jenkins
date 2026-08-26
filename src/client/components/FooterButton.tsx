/**
 * dsh-jenkins —— 侧边栏底部入口（sidebar.footer.action）：
 * 常驻的「Jenkins 配置」按钮（位于 dsh 配置按钮上方的 footer.action 区），
 * 点击打开统一弹框（发布 / 配置 / 历史 三个 tab）。不再按工作区配置门控 ——
 * 服务器配置入口本就应随时可达。
 *
 * 按钮右侧任务状态小胶囊（数据来自全局轮询器每次扫描的汇总）+ 更新提示胶囊：
 * - 橙色：构建中（含排队）任务数，无进行中任务时不显示；
 * - 绿色：构建成功但尚未在「历史」tab 查看过的条数，打开历史后自动消失；
 * - 蓝色【有更新】：npm registry 上出现比本地安装版本更新的 dsh-jenkins
 *   版本时显示，位于胶囊组最右侧（数据来自全局更新检查）；可点击 ——
 *   等宽、撑满按钮高度的透明点击热区（视觉仍是小胶囊），点击打开更新确认弹框。
 */

import { useEffect, useState } from 'react'
import { t } from '../i18n.ts'
import type { Poller, TaskSummary } from '../poller.ts'
import type { UpdateInfo } from '../store.ts'
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
  /** 插件更新信息（store）：hasUpdate 时显示「有更新」胶囊。 */
  useUpdate?: () => UpdateInfo | null
  /** 点击「有更新」胶囊：打开更新确认弹框。 */
  onUpdateRequest?: () => void
}

const EMPTY_SUMMARY: TaskSummary = { building: 0, successUnread: 0 }

export function FooterButton({ onOpen, reportSession, wide = false, useSessions, poller, useUpdate, onUpdateRequest }: FooterButtonProps) {
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
  // 新版本检查结果：订阅更新 store（宿主 updateCheck op，缓存 10 分钟）
  const update = useUpdate ? useUpdate() : null
  const showBuilding = summary.building > 0
  const showDone = summary.successUnread > 0
  const showUpdate = !!(update && update.hasUpdate && update.latest !== '')
  return (
    <div className={'dshj-footer-group' + (wide ? '' : ' dshj-footer-rail-group')}>
      <button
        type="button"
        className={'dshj-footer-btn' + (wide ? '' : ' dshj-footer-btn-rail') + (showUpdate && wide ? ' dshj-footer-btn-has-update' : '')}
        title={t('configBtn')}
        aria-label={t('configBtn')}
        onClick={onOpen}
      >
        <img src={JENKINS_LOGO} alt="" className="dshj-footer-logo" />
        {wide ? <span className="dshj-footer-label">{t('configBtn')}</span> : null}
      </button>
      {showBuilding || showDone || showUpdate ? (
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
          {/* 有更新：始终位于胶囊组最右侧；可点击（等宽、撑满高度的热区），
              点击打开更新确认弹框而非穿透给下方配置按钮 */}
          {showUpdate ? (
            <button
              type="button"
              className="dshj-capsule-wrap"
              title={t('footerUpdateTitle', { v: update.latest, c: update.current })}
              aria-label={t('footerUpdate')}
              onClick={onUpdateRequest}
            >
              <span className="dshj-capsule dshj-capsule-update">{t('footerUpdate')}</span>
            </button>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}
