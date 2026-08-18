/**
 * dsh-jenkins —— 浏览器半边：弹框开关（footer 按钮 ↔ overlay 弹框共享）。
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

export interface LaunchStore {
  store: StoreState<LaunchInfo>
  useLaunch(): LaunchInfo | null
}

export interface HistoryStore {
  store: StoreState<string>
  useLaunch(): string | null
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

export function makeLaunchStore(): LaunchStore {
  const store = createStore<LaunchInfo>()
  const useLaunch = (): LaunchInfo | null => {
    const [v, setV] = useState<LaunchInfo | null>(store.value)
    useEffect(() => store.subscribe(() => setV(store.value)), [])
    return v
  }
  return { store, useLaunch }
}

export function makeHistoryStore(): HistoryStore {
  const store = createStore<string>()
  const useLaunch = (): string | null => {
    const [v, setV] = useState<string | null>(store.value)
    useEffect(() => store.subscribe(() => setV(store.value)), [])
    return v
  }
  return { store, useLaunch }
}
