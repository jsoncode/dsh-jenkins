import { jsx as _jsx } from "react/jsx-runtime";
import { injectStyles } from "./styles.js";
import { makeRun } from "./rpc.js";
import { createStorage } from "./storage.js";
import { createPoller } from "./poller.js";
import { makeConfigModalStore, makeUpdateModalStore } from "./store.js";
import { FooterButton } from "./components/FooterButton.js";
import { JenkinsConfigModal } from "./components/JenkinsConfigModal.js";
import { PluginUpdateModal } from "./components/PluginUpdateModal.js";
/** 侧边栏 footer 插槽 key 与本插件入口 id。 */
const FOOTER_SLOT = 'sidebar.footer.action';
const FOOTER_ENTRY_ID = 'dsh-jenkins';
export function createPlugin() {
    return {
        name: 'dsh-jenkins',
        inject: ['slots', 'remote', 'remote.commands', 'timer'],
        apply(ctx) {
            const run = makeRun(ctx);
            const { store: configStore, useOpen: useConfigOpen } = makeConfigModalStore();
            // 插件更新 store：版本信息（「有更新」胶囊显隐）+ 交互 UI 状态（确认弹框 → 日志大弹框）。
            const updateModalStore = makeUpdateModalStore();
            const slots = ctx.get('slots');
            if (slots === undefined)
                return;
            injectStyles();
            // 宿主存储（$DSH_HOME/settings.yaml）：发布参数回显 + 发布历史，不落浏览器 localStorage。
            const storage = createStorage(run);
            // 当前会话 id 追踪：footer 入口挂载时上报，供全局轮询/历史读取复用宿主命令。
            const sessionRef = { current: '' };
            const getSession = () => sessionRef.current;
            // 全局构建状态轮询：与弹框生命周期解耦，关闭弹框后仍持续回填历史结果。
            // 空闲不轮询：无进行中任务时 tick 直接短路（零请求）；新任务触发 / 历史 tab
            // 打开会显式 refresh() 唤醒。启动时扫描一次，发现持久化的进行中任务即恢复轮询。
            const poller = createPoller(run, storage, getSession);
            ctx.interval(() => poller.tick(), 3000);
            poller.refresh();
            // ─── 插件新版本检查 ──────────────────────────────────────────
            // npm registry（keywords:dsh-jenkins）最新版 vs 被安装根目录 package.json，
            // hasUpdate=true 时 footer 按钮最右侧显示【有更新】胶囊。宿主侧缓存 10 分钟，
            // 失败静默（不显示胶囊）。recheckUpdate 在更新进程成功结束后再次调用
            // （宿主已使版本缓存失效），用于让「更新」胶囊消失。
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
            // 通道，因此轮询/设置/执行弹框不再产生 command 节点。此 commandview 注册仅
            // 兜底「用户/模型在对话中显式执行 /dsh-jenkins 命令」的场景，隐藏 {"ok":true,...}
            // 内部 JSON 调试卡片（key 即命令名 command/run.name；未注册时回退通用命令卡片）。
            try {
                slots.inject('conversation.chat.commandview', () => slots.register({ name: 'conversation.chat.commandview', key: 'dsh-jenkins', priority: 0 }, () => null));
            }
            catch { /* 插槽未声明时静默降级（通用命令卡片渲染） */ }
            // ─── 侧边栏底部入口：常驻「Jenkins 配置」按钮（footer.action 区，
            //     渲染在 sidebar.settings（dsh 配置按钮）上方），打开统一弹框 ──
            //     order: 20 —— 宿主对 list 型插槽按声明 order 升序渲染
            //     （dsh-client-ui-renderer：order ?? 0），显式固定本入口在
            //     FooterActions 中的排位；styles.ts 已把该列表容器改为纵向
            //     堆叠，多个按钮各占一行、不挤在一行。
            slots.inject(FOOTER_SLOT, () => slots.register({ name: FOOTER_SLOT, id: FOOTER_ENTRY_ID, order: 20 }, (props) => (_jsx(FooterButton, { onOpen: () => configStore.open(true), reportSession: (s) => { if (s)
                    sessionRef.current = s; }, wide: props.wide, useSessions: props.useSessions, poller: poller, useUpdate: updateModalStore.useUpdate, onUpdateRequest: () => updateModalStore.openUpdateConfirm() }))));
            // ─── 统一「Jenkins 配置」弹框（发布 / 配置 / 历史 三 tab）──────────
            slots.inject('shell.overlay', () => slots.register({ name: 'shell.overlay', id: 'dsh-jenkins-config', order: 100 }, (props) => (_jsx(JenkinsConfigModal, { run: run, poller: poller, storage: storage, useOpen: useConfigOpen, close: () => configStore.close(), useWorkspaces: props.useWorkspaces, useSessions: props.useSessions }))));
            // ─── 插件更新流程弹框（确认更新 / 更新日志大弹框）────────────
            // footer「有更新」胶囊 → 确认弹框 → 确认后打开更新日志大弹框（后台执行
            // dsh plugin --profile web update dsh-jenkins 并每 600ms 轮询日志；
            // 成功结束后 recheckUpdate 重查版本，让「更新」胶囊消失）。
            slots.inject('shell.overlay', () => slots.register({ name: 'shell.overlay', id: 'dsh-jenkins-update', order: 200 }, () => (_jsx(PluginUpdateModal, { run: run, useUpdate: updateModalStore.useUpdate, useUi: updateModalStore.useUpdateUi, closeUi: updateModalStore.closeUpdateUi, onConfirm: () => { updateModalStore.closeUpdateUi(); updateModalStore.openUpdateLog(); }, recheck: recheckUpdate }))));
        },
    };
}
