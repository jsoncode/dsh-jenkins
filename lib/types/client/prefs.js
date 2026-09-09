/**
 * dsh-jenkins —— 浏览器半边：本地偏好（localStorage 持久化的视图状态）。
 *
 * 目前只有「在菜单中显示」一个开关：关闭后宿主侧栏 footerAction 的
 * 【Jenkins 配置】入口按钮渲染 null（不占位）。纯客户端视图偏好，走
 * localStorage 即可（服务器配置 / 发布历史等数据仍由宿主半边持有）。
 *
 * 默认**开启**：侧栏入口是本插件既有的入口，升级后不应凭空消失；用户可在
 * 宿主「设置 → Jenkins 配置」分区页，或插件弹框「配置」tab 顶部把它关掉。
 * 两处渲染同一个 showInMenuStore，改一处另一处即时同步。
 */
/** localStorage 键。 */
const STORAGE_KEY = 'dsh-jenkins.show-in-menu';
/** 读取持久化开关（默认开启：只有显式写入 '0' 才算关闭）。 */
function readStored() {
    if (typeof localStorage === 'undefined')
        return true;
    try {
        return localStorage.getItem(STORAGE_KEY) !== '0';
    }
    catch {
        return true;
    }
}
let value = readStored();
const listeners = new Set();
function emit() {
    for (const listener of [...listeners])
        listener();
}
/** useSyncExternalStore 兼容的快照源（引用稳定，直到值变化）。 */
export const showInMenuStore = {
    getSnapshot() {
        return value;
    },
    subscribe(listener) {
        listeners.add(listener);
        return () => { listeners.delete(listener); };
    },
    /** 写开关并持久化；值不变时是 no-op。 */
    set(next) {
        if (next === value)
            return;
        value = next;
        try {
            if (typeof localStorage !== 'undefined')
                localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
        }
        catch {
            /* localStorage 不可用（隐私模式等）时仅保留会话内状态 */
        }
        emit();
    },
};
