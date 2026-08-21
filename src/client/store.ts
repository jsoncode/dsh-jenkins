/**
 * dsh-jenkins —— 浏览器半边：统一「Jenkins 配置」弹框开关（footer 入口 ↔ overlay 弹框共享）。
 *
 * 入口与弹框合并为单一弹框（tab：发布 / 配置 / 历史）后，不再需要独立的
 * 发布（LaunchInfo）与历史（cwd）store —— 弹框内自行按当前工作区推导数据。
 */

import { useEffect, useState } from 'react'

export interface LaunchInfo {
  cwd: string
  config: {
    entries: Array<{ job: string; server: string; parameters?: Record<string, string | number | boolean> }>
  } | null
  sessionId: string
}

interface StoreState<T> {
  value: T | null
  listeners: Array<() => void>
  emit(): void
  subscribe(l: () => void): () => void
  open(value: T): void
  close(): void
}

function createStore<T>() {
  const store: StoreState<T> = {
    value: null,
    listeners: [],
    emit() { for (let i = 0; i < this.listeners.length; i++) this.listeners[i]() },
    subscribe(l) { this.listeners.push(l); return () => { const i = this.listeners.indexOf(l); if (i >= 0) this.listeners.splice(i, 1) } },
    open(value) { this.value = value; this.emit() },
    close() { this.value = null; this.emit() },
  }
  return store
}

export interface ConfigModalStore {
  store: StoreState<boolean>
  useOpen(): boolean
}

/** 统一「Jenkins 配置」弹框的打开状态（footer 入口 open，overlay 弹框消费）。 */
export function makeConfigModalStore(): ConfigModalStore {
  const store = createStore<boolean>()
  const useOpen = (): boolean => {
    const [v, setV] = useState<boolean>(!!store.value)
    useEffect(() => store.subscribe(() => setV(!!store.value)), [])
    return v
  }
  return { store, useOpen }
}

/** 侧边栏 footer「Jenkins 配置」按钮的排序策略：front = 排其它插件之前，back = 之后。 */
export type FooterOrderPolicy = 'front' | 'back'

export interface FooterOrderStoreApi {
  store: {
    value: FooterOrderPolicy | null
    subscribe(l: () => void): () => void
    set(v: FooterOrderPolicy): void
  }
  useValue(): FooterOrderPolicy
}

/**
 * footer 排序策略共享 store：设置页（配置 tab）切换后立即生效，
 * footer 入口注册处订阅它来按新策略重算 order（无需刷新页面）。
 */
export function makeFooterOrderStore(): FooterOrderStoreApi {
  const store = {
    value: null as FooterOrderPolicy | null,
    listeners: [] as Array<() => void>,
    emit() { for (let i = 0; i < this.listeners.length; i++) this.listeners[i]() },
    subscribe(l: () => void) { this.listeners.push(l); return () => { const i = this.listeners.indexOf(l); if (i >= 0) this.listeners.splice(i, 1) } },
    set(v: FooterOrderPolicy) { this.value = v; this.emit() },
  }
  const useValue = (): FooterOrderPolicy => {
    const [v, setV] = useState<FooterOrderPolicy>(store.value ?? 'back')
    useEffect(() => store.subscribe(() => setV(store.value ?? 'back')), [])
    return v
  }
  return { store, useValue }
}
