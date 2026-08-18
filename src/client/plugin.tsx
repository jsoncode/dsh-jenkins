/**
 * dsh-jenkins —— 浏览器半边插件主体（slots 注册）。
 *
 * 本文件不包含 __ModuleLoader__ 包装：构建为单文件 CJS 后由
 * scripts/wrap-client.mjs 包装成宿主工厂格式。外部依赖（react 等）在打包时
 * external，运行时经 factory 的 require 解析到宿主模块表（seed）。
 */

import type { ReactNode } from 'react'
import { injectStyles } from './styles.ts'
import { makeRun, type RunFn } from './rpc.ts'
import { makeHistoryStore, makeLaunchStore } from './store.ts'
import { FooterButton } from './components/FooterButton.tsx'
import { HistoryModal } from './components/HistoryModal.tsx'
import { LauncherModal } from './components/LauncherModal.tsx'
import { SettingsPage } from './components/SettingsPage.tsx'
import { t } from './i18n.ts'

/** 宿主 slots 服务最小视图。 */
interface SlotsService {
  inject(name: string, fn: () => unknown): unknown
  register(def: Record<string, unknown>, component: unknown): unknown
}

/** 浏览器侧插件上下文（宿主注入）。 */
export interface ClientCtx {
  get<T = unknown>(name: string): T | undefined
  interval(callback: () => void, ms: number): () => void
  remote: {
    commands: {
      execute(sessionId: string, command: string): Promise<unknown>
    }
  }
}

export interface ClientPluginModule {
  name: string
  inject: string[]
  apply(ctx: ClientCtx): void
}

export function createPlugin(): ClientPluginModule {
  return {
    name: 'dsh-jenkins',
    inject: ['slots', 'remote', 'remote.commands', 'timer'],

    apply(ctx: ClientCtx) {
      const run: RunFn = makeRun(ctx)
      const { store: launchStore, useLaunch } = makeLaunchStore()
      const { store: historyStore, useLaunch: useHistoryLaunch } = makeHistoryStore()
      const slots = ctx.get<SlotsService>('slots')
      if (slots === undefined) return
      injectStyles()

      // ─── 侧边栏底部入口：当前工作区有 dsh-Jenkins 配置才显示 ──────────
      slots.inject('sidebar.footer.action', () => slots.register(
        { name: 'sidebar.footer.action', id: 'dsh-jenkins', order: 10 },
        (props: Record<string, unknown>) => (
          <FooterButton
            run={run}
            launchStore={launchStore}
            historyStore={historyStore}
            wide={props.wide as boolean | undefined}
            useWorkspaces={props.useWorkspaces as FooterWorkspaceHooks['useWorkspaces']}
            useSessions={props.useSessions as FooterWorkspaceHooks['useSessions']}
          />
        ),
      ))

      // ─── 设置 → Jenkins 配置页：服务器管理 ─────────────────────
      slots.inject('settings.section', () => slots.register(
        { name: 'settings.section', id: 'dsh-jenkins', order: 25, label: () => t('settingsNav') },
        (props: Record<string, unknown>) => {
          let sessionId = ''
          const useSessions = props.useSessions as ((selector: (state: { current?: string }) => unknown) => unknown) | undefined
          if (useSessions) {
            const current = useSessions((state) => state && state.current)
            if (typeof current === 'string') sessionId = current
          }
          return <SettingsPage run={run} sessionId={sessionId} />
        },
      ))

      // ─── 执行 Jenkins Job 弹框 ─────────────────────────────────
      slots.inject('shell.overlay', () => slots.register(
        { name: 'shell.overlay', id: 'dsh-jenkins-launcher', order: 100 },
        () => (
          <LauncherModal
            run={run}
            launchStore={launchStore}
            historyStore={historyStore}
            interval={(cb, ms) => ctx.interval(cb, ms)}
            useLaunch={useLaunch}
          />
        ),
      ))

      // ─── 发布历史弹框 ───────────────────────────────────────────
      slots.inject('shell.overlay', () => slots.register(
        { name: 'shell.overlay', id: 'dsh-jenkins-history', order: 110 },
        (props: Record<string, unknown>) => (
          <HistoryModal
            historyStore={historyStore}
            useLaunch={useHistoryLaunch}
            useWorkspaces={props.useWorkspaces as HistoryModalWorkspaceHooks['useWorkspaces']}
          />
        ),
      ))
    },
  }
}

/** footer slot 宿主注入的 hooks 形状。 */
interface FooterWorkspaceHooks {
  useWorkspaces(selector: (s: { items?: Array<{ path?: string; sessionIds?: string[] }> }) => unknown): unknown
  useSessions(selector: (s: { current?: string }) => unknown): unknown
}

/** history overlay slot 宿主注入的 hooks 形状。 */
interface HistoryModalWorkspaceHooks {
  useWorkspaces(selector: (s: { items?: Array<{ path?: string }> }) => unknown): unknown
}

export type { ReactNode }
