/**
 * dsh-jenkins —— 浏览器半边：共享 store（设置页入口 ↔ shell.overlay 更新弹框共享）。
 *
 * 入口迁移到设置弹框左侧菜单（settings.section 内嵌渲染）后不再需要弹框开关
 * store；保留插件更新 store —— 「有更新」胶囊在设置页渲染，确认 / 日志弹框
 * 挂在 shell.overlay，两侧共享同一份版本与 UI 状态。
 */
import { useEffect, useState } from 'react';
function createStore() {
    const store = {
        value: null,
        listeners: [],
        emit() { for (let i = 0; i < this.listeners.length; i++)
            this.listeners[i](); },
        subscribe(l) { this.listeners.push(l); return () => { const i = this.listeners.indexOf(l); if (i >= 0)
            this.listeners.splice(i, 1); }; },
    };
    return store;
}
function useStoreValue(target) {
    const [v, setV] = useState(target.value);
    useEffect(() => target.subscribe(() => setV(target.value)), []);
    return v;
}
export function makeUpdateModalStore() {
    const updateStore = createStore();
    const uiStore = createStore();
    uiStore.value = 'none';
    return {
        setUpdate: (info) => { updateStore.value = info; updateStore.emit(); },
        useUpdate: () => useStoreValue(updateStore),
        openUpdateConfirm: () => { uiStore.value = 'confirm'; uiStore.emit(); },
        openUpdateLog: () => { uiStore.value = 'log'; uiStore.emit(); },
        closeUpdateUi: () => { uiStore.value = 'none'; uiStore.emit(); },
        useUpdateUi: () => {
            const v = useStoreValue(uiStore);
            return v ?? 'none';
        },
    };
}
