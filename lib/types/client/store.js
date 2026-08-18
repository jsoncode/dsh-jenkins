/**
 * dsh-jenkins —— 浏览器半边：弹框开关（footer 按钮 ↔ overlay 弹框共享）。
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
export function makeLaunchStore() {
    const store = createStore();
    const useLaunch = () => {
        const [v, setV] = useState(store.value);
        useEffect(() => store.subscribe(() => setV(store.value)), []);
        return v;
    };
    return { store, useLaunch };
}
export function makeHistoryStore() {
    const store = createStore();
    const useLaunch = () => {
        const [v, setV] = useState(store.value);
        useEffect(() => store.subscribe(() => setV(store.value)), []);
        return v;
    };
    return { store, useLaunch };
}
