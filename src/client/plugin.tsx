/**
 * dsh-jenkins —— 浏览器半边插件主体（slots 注册）。
 *
 * 本文件不包含 __ModuleLoader__ 包装：构建为单文件 CJS 后由
 * scripts/wrap-client.mjs 包装成宿主工厂格式。外部依赖（react 等）在打包时
 * external，运行时经 factory 的 require 解析到宿主模块表（seed）。
 *
 * 入口结构（统一弹框）：
 * - sidebar.footer.action：常驻「Jenkins 配置」按钮（位于 dsh 配置按钮上方），
 *   打开统一弹框；
 * - shell.overlay（dsh-jenkins-config）：统一弹框，三个 tab —— 发布 / 配置 / 历史，
 *   分别承载原执行 Job 弹框、设置页、历史弹框的内容；
 * - 原 launcher / history 两个独立 overlay 与 settings.section 注册已移除。
 */

import type { ReactNode } from 'react'
import { injectStyles } from './styles.ts'
import { makeRun, type RunFn } from './rpc.ts'
import { createStorage } from './storage.ts'
import { createPoller } from './poller.ts'
import { makeConfigModalStore } from './store.ts'
import { FooterButton } from './components/FooterButton.tsx'
import { JenkinsConfigModal } from './components/JenkinsConfigModal.tsx'
import { t } from './i18n.ts'

/** 宿主 slots 服务最小视图。 */
interface SlotsService {
  inject(name: string, fn: () => unknown): unknown
  register(def: Record<string, unknown>, component: unknown): () => void
}

/** 侧边栏 footer 插槽 key 与本插件入口 id。 */
const FOOTER_SLOT = 'sidebar.footer.action'
const FOOTER_ENTRY_ID = 'dsh-jenkins'

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
      const { store: configStore, useOpen: useConfigOpen } = makeConfigModalStore()
      const slots = ctx.get<SlotsService>('slots')
      if (slots === undefined) return
      injectStyles()

      // 宿主存储（$DSH_HOME/settings.yaml）：发布参数回显 + 发布历史，不落浏览器 localStorage。
      const storage = createStorage(run)
      // 当前会话 id 追踪：footer 入口挂载时上报，供全局轮询/历史读取复用宿主命令。
      const sessionRef: { current: string } = { current: '' }
      const getSession = (): string => sessionRef.current

      // 全局构建状态轮询：与弹框生命周期解耦，关闭弹框后仍持续回填历史结果。
      // 空闲不轮询：无进行中任务时 tick 直接短路（零请求）；新任务触发 / 历史 tab
      // 打开会显式 refresh() 唤醒。启动时扫描一次，发现持久化的进行中任务即恢复轮询。
      const poller = createPoller(run, storage, getSession)
      ctx.interval(() => poller.tick(), 3000)
      poller.refresh()

      // ─── 对话中的 dsh-jenkins 命令行：兜底不渲染内部 JSON 结果 ──────────
      // 浏览器半边的请求已改走 /dsh-jenkins/api HTTP 路由（rpc.ts），不进入对话命令
      // 通道，因此轮询/设置/执行弹框不再产生 command 节点。此 commandview 注册仅
      // 兜底「用户/模型在对话中显式执行 /dsh-jenkins 命令」的场景，隐藏 {"ok":true,...}
      // 内部 JSON 调试卡片（key 即命令名 command/run.name；未注册时回退通用命令卡片）。
      try {
        slots.inject('conversation.chat.commandview', () => slots.register(
          { name: 'conversation.chat.commandview', key: 'dsh-jenkins', priority: 0 },
          () => null,
        ))
      } catch { /* 插槽未声明时静默降级（通用命令卡片渲染） */ }

      // ─── 侧边栏底部入口：常驻「Jenkins 配置」按钮（footer.action 区，
      //     渲染在 sidebar.settings（dsh 配置按钮）上方），打开统一弹框 ──
      //     不传 order，使用宿主默认排序逻辑（此前基于插槽订阅的动态重算
      //     存在自触发风险，已整体移除）。styles.ts 已把该列表容器改为纵向
      //     堆叠，多个按钮各占一行、不挤在一行。
      slots.inject(FOOTER_SLOT, () => slots.register(
        { name: FOOTER_SLOT, id: FOOTER_ENTRY_ID },
        (props: Record<string, unknown>) => (
          <FooterButton
            onOpen={() => configStore.open(true)}
            reportSession={(s) => { if (s) sessionRef.current = s }}
            wide={props.wide as boolean | undefined}
            useSessions={props.useSessions as FooterWorkspaceHooks['useSessions']}
          />
        ),
      ))

      // ─── 统一「Jenkins 配置」弹框（发布 / 配置 / 历史 三 tab）──────────
      slots.inject('shell.overlay', () => slots.register(
        { name: 'shell.overlay', id: 'dsh-jenkins-config', order: 100 },
        (props: Record<string, unknown>) => (
          <JenkinsConfigModal
            run={run}
            poller={poller}
            storage={storage}
            useOpen={useConfigOpen}
            close={() => configStore.close()}
            useWorkspaces={props.useWorkspaces as ModalWorkspaceHooks['useWorkspaces']}
            useSessions={props.useSessions as ModalWorkspaceHooks['useSessions']}
          />
        ),
      ))
    },
  }
}

/** footer slot 宿主注入的 hooks 形状。 */
interface FooterWorkspaceHooks {
  useSessions(selector: (s: { current?: string }) => unknown): unknown
}

/** overlay slot 宿主注入的 hooks 形状。 */
interface ModalWorkspaceHooks {
  useWorkspaces(selector: (s: { items?: Array<{ path?: string; sessionIds?: string[] }> }) => unknown): unknown
  useSessions(selector: (s: { current?: string }) => unknown): unknown
}

export type { ReactNode }
