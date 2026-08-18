/**
 * dsh-jenkins —— 侧边栏底部入口（sidebar.footer.action）：
 * 当前工作区根目录存在 dsh-Jenkins 配置时显示，点击打开「执行 Jenkins Job」弹框。
 */

import { useEffect, useMemo, useState } from 'react'
import { t } from '../i18n.ts'
import { JENKINS_LOGO } from '../logo.ts'
import type { RunFn } from '../rpc.ts'
import type { LaunchInfo } from '../store.ts'
import { SvgClock } from './SvgIcons.tsx'

type WorkspaceItem = { path?: string; sessionIds?: string[] }

export interface FooterButtonProps {
  run: RunFn
  launchStore: { open(launch: LaunchInfo): void }
  historyStore: { open(cwd: string): void }
  wide?: boolean
  useWorkspaces?: (selector: (s: { items?: WorkspaceItem[] }) => unknown) => unknown
  useSessions?: (selector: (s: { current?: string }) => unknown) => unknown
}

export function FooterButton({ run, launchStore, historyStore, wide = false, useWorkspaces, useSessions }: FooterButtonProps) {
  const workspaceItems = useWorkspaces
    ? (useWorkspaces((s) => (s && s.items) || []) as WorkspaceItem[])
    : []
  const currentSessionId = useSessions
    ? (useSessions((s) => s && s.current) as string | undefined)
    : null
  if (!useWorkspaces || !useSessions) {
    console.warn('[dsh-jenkins] footer slot missing standard props', { hasWs: !!useWorkspaces, hasSs: !!useSessions })
  }
  const [launch, setLaunch] = useState<LaunchInfo | null>(null)
  // 只有「新数组格式」的配置（entries 非空）才显示入口；旧格式/无效配置一律视为未配置。
  // 防御旧宿主返回旧结构（{job, server, environments}）导致入口误显示。
  const isDeployTargets = (cfg: { entries?: unknown[] } | null | undefined): boolean => !!(cfg && Array.isArray(cfg.entries) && cfg.entries.length > 0)
  const cwd = useMemo(() => {
    const list = Array.isArray(workspaceItems) ? workspaceItems : []
    const current = list.find((w) => Array.isArray(w.sessionIds) && w.sessionIds.indexOf(currentSessionId as string) !== -1)
    return (current && current.path) || (list.length ? list[0].path : null)
  }, [workspaceItems, currentSessionId])
  useEffect(() => {
    let alive = true
    setLaunch(null)
    if (!cwd) return
    console.log('[dsh-jenkins] footer check cwd=', cwd, 'session=', currentSessionId, 'workspaces=', (workspaceItems || []).map((w) => w.path))
    run(currentSessionId || '', { op: 'workspaceConfig', cwd }).then((r) => {
      if (!alive) return
      console.log('[dsh-jenkins] workspaceConfig result', r)
      // 仅配置存在、且为新数组格式才显示入口；配置缺失 / 旧格式 / 无效均视为未配置
      if (r && r.ok && r.found && isDeployTargets(r.config as { entries?: unknown[] })) setLaunch({ cwd, config: r.config as LaunchInfo['config'], sessionId: currentSessionId || '' })
    }).catch((e) => {
      console.error('[dsh-jenkins] workspaceConfig failed', cwd, e)
    })
    return () => { alive = false }
  }, [cwd, currentSessionId])
  if (!launch) return null
  const firstJob = (launch.config && Array.isArray(launch.config.entries) && launch.config.entries[0] && launch.config.entries[0].job) || ''
  return (
    <>
      <div className={'dshj-footer-group' + (wide ? '' : ' dshj-footer-rail-group')}>
        <button
          type="button"
          className={'dshj-footer-btn' + (wide ? '' : ' dshj-footer-btn-rail')}
          title={t('runJob') + '（' + firstJob + ' · ' + launch.cwd + '）'}
          aria-label={t('runJob')}
          onClick={() => launchStore.open(launch)}
        >
          <img src={JENKINS_LOGO} alt="" className="dshj-footer-logo" />
          {wide ? <span className="dshj-footer-label">Jenkins</span> : null}
        </button>
        <button
          type="button"
          className={'dshj-footer-btn' + (wide ? '' : ' dshj-footer-btn-rail')}
          title={t('historyBtn')}
          aria-label={t('historyBtn')}
          onClick={() => historyStore.open(launch.cwd)}
        >
          <SvgClock size={wide ? 16 : 18} />
          {wide ? <span className="dshj-footer-label">{t('historyBtn')}</span> : null}
        </button>
      </div>
    </>
  )
}
