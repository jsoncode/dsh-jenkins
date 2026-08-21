/**
 * dsh-jenkins —— 浏览器半边：统一「Jenkins 配置」弹框开关（footer 入口 ↔ overlay 弹框共享）。
 *
 * 入口与弹框合并为单一弹框（tab：发布 / 配置 / 历史）后，不再需要独立的
 * 发布（LaunchInfo）与历史（cwd）store —— 弹框内自行按当前工作区推导数据。
 * footer 按钮排序功能已移除：入口注册不传 order，使用宿主默认排序。
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
        open(value) { this.value = value; this.emit(); },
        close() { this.value = null; this.emit(); },
    };
    return store;
}
/** 统一「Jenkins 配置」弹框的打开状态（footer 入口 open，overlay 弹框消费）。 */
export function makeConfigModalStore() {
    const store = createStore();
    const useOpen = () => {
        const [v, setV] = useState(!!store.value);
        useEffect(() => store.subscribe(() => setV(!!store.value)), []);
        return v;
    };
    return { store, useOpen };
}
