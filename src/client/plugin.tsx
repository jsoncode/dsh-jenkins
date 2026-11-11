/**
 * dsh-jenkins —— 浏览器半边插件主体（slots 注册）。
 *
 * 本文件不包含 __ModuleLoader__ 包装：产物由 tsdown banner/footer 生成
 * window.__ModuleLoader__.load({ id, factory }) 工厂。外部依赖（react 等）在打包时
 * external，运行时经 factory 的 require 解析到宿主模块表（seed）。
 *
 * 入口结构（DSH 0.2.2-rc.1 改版，入口不再放侧边栏左下角）：
 * - settings.section（id 'dsh-jenkins'，order 100）：设置弹框左侧菜单新增一格，
 *   页面内嵌原「Jenkins 配置」统一弹框的全部内容（发布 / 配置 / 本机记录 /
 *   历史记录 四个 tab；不套 ModalPortal 外壳）；标题行右侧保留任务状态胶囊
 *   （构建中 / 成功未读 / 「有更新」新版本提示，点击进入更新确认 → 更新日志弹框）；
 * - settings.section.icon（同 id）：左侧菜单导航图标（Jenkins logo）；
 * - shell.overlay（dsh-jenkins-update）：插件更新流程弹框（确认更新 / 更新日志）；
 * - 原 sidebar.footer.action 注册与 shell.overlay（dsh-jenkins-config）统一弹框
 *   注册已移除（内容迁入设置页内嵌渲染）；构建日志 / 服务器编辑 / 项目模板等
 *   二级弹框仍是 body 顶层蒙版（ModalPortal），不受设置面板裁切。
 *
 * settings.section 注册包在 ctx.slots.inject('settings.section', ...) 里：
 * 该 slot 由宿主 sidebar.settings 项挂载后才存在，seat 存在才注册。
 */

import type { ReactNode } from 'react'
import { injectStyles } from './styles.ts'
import { makeRun, type RunFn } from './rpc.ts'
import { createStorage } from './storage.ts'
import { createPoller } from './poller.ts'
import { makeUpdateModalStore, type UpdateInfo } from './store.ts'
import { SettingsSection } from './components/SettingsSection.tsx'
import { PluginUpdateModal } from './components/PluginUpdateModal.tsx'
import { JENKINS_LOGO } from './logo.ts'
import { setLang, t } from './i18n.ts'

/** 宿主 slots 服务最小视图。 */
interface SlotsService {
  inject(name: string, fn: () => unknown): unknown
  register(def: Record<string, unknown>, component: unknown): () => void
}

/** 设置弹框左侧菜单入口 slot 与本插件入口 id。 */
const SECTION_SLOT = 'settings.section'
const SECTION_ICON_SLOT = 'settings.section.icon'
const SECTION_ENTRY_ID = 'dsh-jenkins'

/** 浏览器侧插件上下文（宿主注入）。 */
export interface ClientCtx {
  get<T = unknown>(name: string): T | undefined
  /** cordis 事件订阅（可选：宿主 locale 服务缺失时的 'locale/change' 兜底通道）。 */
  on?(event: string, listener: (payload: unknown) => void): unknown
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
      // ─── 语言跟随宿主：订阅宿主 locale 服务（软依赖）─────────────────
      // 插件文案经 t()/getLang() 取词；设置页导航 label 是注册时传入的 thunk，
      // 宿主每次投影都重读，语言切换即换词，无需重注册。宿主在 locale 插件
      // 激活时才同步 <html lang>（早于用户持久化偏好的采纳），静态解析只作
      // locale 服务缺失时的兜底。
      interface LocaleFace {
        getSnapshot(): { active: string }
        subscribe(fn: () => void): () => void
      }
      const toLang = (active: string): 'zh' | 'en' => (/^zh/i.test(active) ? 'zh' : 'en')
      const locale = ctx.get<LocaleFace>('locale')
      if (locale !== undefined) {
        const syncLang = (): void => { setLang(toLang(locale.getSnapshot().active)) }
        syncLang()
        locale.subscribe(syncLang)
      } else if (typeof ctx.on === 'function') {
        ctx.on('locale/change', (snapshot: unknown) => {
          const active = (snapshot as { active?: string } | undefined)?.active
          if (typeof active === 'string') setLang(toLang(active))
        })
      }

      const run: RunFn = makeRun(ctx)
      // 插件更新 store：版本信息（「有更新」胶囊显隐）+ 交互 UI 状态（确认弹框 → 日志大弹框）。
      const updateModalStore = makeUpdateModalStore()
      const slots = ctx.get<SlotsService>('slots')
      if (slots === undefined) return
      injectStyles()

      // 宿主数据文件（$DSH_HOME/dsh-jenkins.json）：发布参数回显 + 发布历史，不落浏览器 localStorage。
      const storage = createStorage(run)
      // 当前会话 id 追踪：设置页入口挂载时上报，供全局轮询/历史读取复用宿主命令。
      const sessionRef: { current: string } = { current: '' }
      const getSession = (): string => sessionRef.current

      // 全局构建状态轮询：与入口页面生命周期解耦，关闭设置弹框后仍持续回填历史结果。
      // 空闲不轮询：无进行中任务时 tick 直接短路（零请求）；新任务触发 / 历史 tab
      // 打开会显式 refresh() 唤醒。启动时扫描一次，发现持久化的进行中任务即恢复轮询。
      const poller = createPoller(run, storage, getSession)
      ctx.interval(() => poller.tick(), 3000)
      poller.refresh()

      // ─── 插件新版本检查 ──────────────────────────────────────────
      // npm registry（keywords:dsh-jenkins）最新版 vs 被安装根目录 package.json，
      // hasUpdate=true 时设置页标题行右侧显示【有更新】胶囊。宿主侧实时查询、
      // 失败静默（不显示胶囊）。recheckUpdate 在更新进程成功结束后再次调用，
      // 用于让「更新」胶囊立即消失。
      const recheckUpdate = (): void => {
        void run(getSession() || '', { op: 'updateCheck' }).then((res) => {
          const raw = res.update as Partial<UpdateInfo> | undefined
          if (raw !== null && typeof raw === 'object' && typeof raw.hasUpdate === 'boolean') {
            updateModalStore.setUpdate({
              current: String(raw.current ?? ''),
              latest: String(raw.latest ?? ''),
              hasUpdate: raw.hasUpdate === true,
            })
          }
        }).catch(() => { /* 检查失败不打扰用户 */ })
      }
      recheckUpdate()
      ctx.interval(() => recheckUpdate(), 5 * 60 * 1000)

      // ─── 对话中的 dsh-jenkins 命令行：兜底不渲染内部 JSON 结果 ──────────
      // 浏览器半边的请求已改走 /dsh-jenkins/api HTTP 路由（rpc.ts），不进入对话命令
      // 通道，因此轮询/设置/发布页不再产生 command 节点。此 commandview 注册仅
      // 兜底「用户/模型在对话中显式执行 /dsh-jenkins 命令」的场景，隐藏 {"ok":true,...}
      // 内部 JSON 调试卡片（key 即命令名 command/run.name；未注册时回退通用命令卡片）。
      try {
        slots.inject('conversation.chat.commandview', () => slots.register(
          { name: 'conversation.chat.commandview', key: 'dsh-jenkins', priority: 0 },
          () => null,
        ))
      } catch { /* 插槽未声明时静默降级（通用命令卡片渲染） */ }

      // ─── 设置弹框左侧菜单入口（0.2.2-rc.1 改版：入口移入设置弹框）──────
      //     id = 包名（绝不复用内置 id：account/general/models/plugins/agent-presets）；
      //     order: 100 —— 升序排在内置项之后；label 用 i18n thunk，宿主每次投影
      //     重读，语言切换自动换词。注册包在 slots.inject 里：settings.section 由
      //     宿主 sidebar.settings 项挂载后才存在，seat 存在才注册。
      //     组件收到宿主标准插槽 hooks（useWorkspaces / useSessions，与原
      //     shell.overlay 同款注入），工作区 / 会话推导逻辑从旧入口原样迁移。
      slots.inject(SECTION_SLOT, () => slots.register(
        {
          name: SECTION_SLOT,
          id: SECTION_ENTRY_ID,
          order: 100,
          label: (): string => t('settingsNav'),
        },
        (props: Record<string, unknown>) => (
          <SettingsSection
            run={run}
            poller={poller}
            storage={storage}
            useUpdate={updateModalStore.useUpdate}
            onUpdateRequest={() => updateModalStore.openUpdateConfirm()}
            reportSession={(s) => { if (s) sessionRef.current = s }}
            useWorkspaces={props.useWorkspaces as SectionWorkspaceHooks['useWorkspaces']}
            useSessions={props.useSessions as SectionWorkspaceHooks['useSessions']}
          />
        ),
      ))
      // 导航图标：注册 id 必须等于 section id；组件收到 { size, active }。
      slots.inject(SECTION_ICON_SLOT, () => slots.register(
        { name: SECTION_ICON_SLOT, id: SECTION_ENTRY_ID, order: 100 },
        (props: Record<string, unknown>) => (
          <img
            src={JENKINS_LOGO}
            alt=""
            aria-hidden="true"
            className="dshj-section-icon"
            width={props.size as number | undefined}
            height={props.size as number | undefined}
          />
        ),
      ))

      // ─── 插件更新流程弹框（确认更新 / 更新日志大弹框）────────────
      // 设置页「有更新」胶囊 → 确认弹框 → 确认后打开更新日志大弹框（后台执行
      // dsh plugin --profile web update dsh-jenkins 并每 600ms 轮询日志；
      // 成功结束后 recheckUpdate 重查版本，让「更新」胶囊消失）。
      // 二级大弹框继续走 shell.overlay，不随入口内嵌进设置页。
      slots.inject('shell.overlay', () => slots.register(
        { name: 'shell.overlay', id: 'dsh-jenkins-update', order: 200 },
        () => (
          <PluginUpdateModal
            run={run}
            useUpdate={updateModalStore.useUpdate}
            useUi={updateModalStore.useUpdateUi}
            closeUi={updateModalStore.closeUpdateUi}
            onConfirm={() => { updateModalStore.closeUpdateUi(); updateModalStore.openUpdateLog() }}
            recheck={recheckUpdate}
          />
        ),
      ))
    },
  }
}

/** settings.section slot 宿主注入的 hooks 形状。 */
interface SectionWorkspaceHooks {
  useWorkspaces?: (selector: (s: { items?: Array<{ path?: string; sessionIds?: string[] }> }) => unknown) => unknown
  useSessions?: (selector: (s: { current?: string }) => unknown) => unknown
}

export type { ReactNode }
