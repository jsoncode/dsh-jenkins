import { jsx as _jsx } from "react/jsx-runtime";
import { injectStyles } from "./styles.js";
import { makeRun } from "./rpc.js";
import { createStorage } from "./storage.js";
import { createPoller } from "./poller.js";
import { makeUpdateModalStore } from "./store.js";
import { SettingsSection } from "./components/SettingsSection.js";
import { PluginUpdateModal } from "./components/PluginUpdateModal.js";
import { JENKINS_LOGO } from "./logo.js";
import { setLang, t } from "./i18n.js";
/** 设置弹框左侧菜单入口 slot 与本插件入口 id。 */
const SECTION_SLOT = 'settings.section';
const SECTION_ICON_SLOT = 'settings.section.icon';
const SECTION_ENTRY_ID = 'dsh-jenkins';
export function createPlugin() {
    return {
        name: 'dsh-jenkins',
        inject: ['slots', 'remote', 'remote.commands', 'timer'],
        apply(ctx) {
            const toLang = (active) => (/^zh/i.test(active) ? 'zh' : 'en');
            const locale = ctx.get('locale');
            if (locale !== undefined) {
                const syncLang = () => { setLang(toLang(locale.getSnapshot().active)); };
                syncLang();
                locale.subscribe(syncLang);
            }
            else if (typeof ctx.on === 'function') {
                ctx.on('locale/change', (snapshot) => {
                    const active = snapshot?.active;
                    if (typeof active === 'string')
                        setLang(toLang(active));
                });
            }
            const run = makeRun(ctx);
            // 插件更新 store：版本信息（「有更新」胶囊显隐）+ 交互 UI 状态（确认弹框 → 日志大弹框）。
            const updateModalStore = makeUpdateModalStore();
            const slots = ctx.get('slots');
            if (slots === undefined)
                return;
            injectStyles();
            // 宿主数据文件（$DSH_HOME/dsh-jenkins.json）：发布参数回显 + 发布历史，不落浏览器 localStorage。
            const storage = createStorage(run);
            // 当前会话 id 追踪：设置页入口挂载时上报，供全局轮询/历史读取复用宿主命令。
            const sessionRef = { current: '' };
            const getSession = () => sessionRef.current;
            // 全局构建状态轮询：与入口页面生命周期解耦，关闭设置弹框后仍持续回填历史结果。
            // 空闲不轮询：无进行中任务时 tick 直接短路（零请求）；新任务触发 / 历史 tab
            // 打开会显式 refresh() 唤醒。启动时扫描一次，发现持久化的进行中任务即恢复轮询。
            const poller = createPoller(run, storage, getSession);
            ctx.interval(() => poller.tick(), 3000);
            poller.refresh();
            // ─── 插件新版本检查 ──────────────────────────────────────────
            // npm registry（keywords:dsh-jenkins）最新版 vs 被安装根目录 package.json，
            // hasUpdate=true 时设置页标题行右侧显示【有更新】胶囊。宿主侧实时查询、
            // 失败静默（不显示胶囊）。recheckUpdate 在更新进程成功结束后再次调用，
            // 用于让「更新」胶囊立即消失。
            const recheckUpdate = () => {
                void run(getSession() || '', { op: 'updateCheck' }).then((res) => {
                    const raw = res.update;
                    if (raw !== null && typeof raw === 'object' && typeof raw.hasUpdate === 'boolean') {
                        updateModalStore.setUpdate({
                            current: String(raw.current ?? ''),
                            latest: String(raw.latest ?? ''),
                            hasUpdate: raw.hasUpdate === true,
                        });
                    }
                }).catch(() => { });
            };
            recheckUpdate();
            ctx.interval(() => recheckUpdate(), 5 * 60 * 1000);
            // ─── 对话中的 dsh-jenkins 命令行：兜底不渲染内部 JSON 结果 ──────────
            // 浏览器半边的请求已改走 /dsh-jenkins/api HTTP 路由（rpc.ts），不进入对话命令
            // 通道，因此轮询/设置/发布页不再产生 command 节点。此 commandview 注册仅
            // 兜底「用户/模型在对话中显式执行 /dsh-jenkins 命令」的场景，隐藏 {"ok":true,...}
            // 内部 JSON 调试卡片（key 即命令名 command/run.name；未注册时回退通用命令卡片）。
            try {
                slots.inject('conversation.chat.commandview', () => slots.register({ name: 'conversation.chat.commandview', key: 'dsh-jenkins', priority: 0 }, () => null));
            }
            catch { /* 插槽未声明时静默降级（通用命令卡片渲染） */ }
            // ─── 设置弹框左侧菜单入口（0.2.2-rc.1 改版：入口移入设置弹框）──────
            //     id = 包名（绝不复用内置 id：account/general/models/plugins/agent-presets）；
            //     order: 100 —— 升序排在内置项之后；label 用 i18n thunk，宿主每次投影
            //     重读，语言切换自动换词。注册包在 slots.inject 里：settings.section 由
            //     宿主 sidebar.settings 项挂载后才存在，seat 存在才注册。
            //     组件收到宿主标准插槽 hooks（useWorkspaces / useSessions，与原
            //     shell.overlay 同款注入），工作区 / 会话推导逻辑从旧入口原样迁移。
            slots.inject(SECTION_SLOT, () => slots.register({
                name: SECTION_SLOT,
                id: SECTION_ENTRY_ID,
                order: 100,
                label: () => t('settingsNav'),
            }, (props) => (_jsx(SettingsSection, { run: run, poller: poller, storage: storage, useUpdate: updateModalStore.useUpdate, onUpdateRequest: () => updateModalStore.openUpdateConfirm(), reportSession: (s) => { if (s)
                    sessionRef.current = s; }, useWorkspaces: props.useWorkspaces, useSessions: props.useSessions }))));
            // 导航图标：注册 id 必须等于 section id；组件收到 { size, active }。
            slots.inject(SECTION_ICON_SLOT, () => slots.register({ name: SECTION_ICON_SLOT, id: SECTION_ENTRY_ID, order: 100 }, (props) => (_jsx("img", { src: JENKINS_LOGO, alt: "", "aria-hidden": "true", className: "dshj-section-icon", width: props.size, height: props.size }))));
            // ─── 插件更新流程弹框（确认更新 / 更新日志大弹框）────────────
            // 设置页「有更新」胶囊 → 确认弹框 → 确认后打开更新日志大弹框（后台执行
            // dsh plugin --profile web update dsh-jenkins 并每 600ms 轮询日志；
            // 成功结束后 recheckUpdate 重查版本，让「更新」胶囊消失）。
            // 二级大弹框继续走 shell.overlay，不随入口内嵌进设置页。
            slots.inject('shell.overlay', () => slots.register({ name: 'shell.overlay', id: 'dsh-jenkins-update', order: 200 }, () => (_jsx(PluginUpdateModal, { run: run, useUpdate: updateModalStore.useUpdate, useUi: updateModalStore.useUpdateUi, closeUi: updateModalStore.closeUpdateUi, onConfirm: () => { updateModalStore.closeUpdateUi(); updateModalStore.openUpdateLog(); }, recheck: recheckUpdate }))));
        },
    };
}
