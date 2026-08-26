/**
 * dsh-jenkins —— 浏览器半边：统一「Jenkins 配置」弹框开关（footer 入口 ↔ overlay 弹框共享）。
 *
 * 入口与弹框合并为单一弹框（tab：发布 / 配置 / 历史）后，不再需要独立的
 * 发布（LaunchInfo）与历史（cwd）store —— 弹框内自行按当前工作区推导数据。
 * footer 按钮排序功能已移除：入口注册不传 order，使用宿主默认排序。
 */

import { useEffect, useState } from 'react'

export interface LaunchInfo {
  cwd: string
  config: {
    entries: Array<{ job: string; server: string; parameters?: Record<string, string | number | boolean> }>
  } | null
  sessionId: string
}

export interface StoreState<T> {
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

/** 插件更新检查结果（宿主 updateCheck op 载荷）。 */
export interface UpdateInfo {
  /** 被安装根目录 package.json 的当前版本。 */
  current: string
  /** npm registry 上的最新版本（未取到为空串）。 */
  latest: string
  /** latest 是否比 current 更新。 */
  hasUpdate: boolean
}

/** 插件更新进程状态（宿主 pluginUpdateStatus op 载荷）。 */
export interface UpdateStatusView {
  running: boolean
  done: boolean
  /** 累计输出（宿主环形缓冲尾部）。 */
  output: string
  exitCode: number | null
  error: string
}

/** 更新交互 UI 状态：none=未打开 confirm=确认弹框 log=日志大弹框。 */
export type UpdateUi = 'none' | 'confirm' | 'log'

/** 插件更新 store：版本信息（胶囊显隐）+ 交互 UI 状态（确认弹框 → 日志大弹框）。 */
export interface UpdateModalStore {
  setUpdate(info: UpdateInfo): void
  useUpdate(): UpdateInfo | null
  openUpdateConfirm(): void
  openUpdateLog(): void
  closeUpdateUi(): void
  useUpdateUi(): UpdateUi
}

function useStoreValue<T>(target: StoreState<T>): T | null {
  const [v, setV] = useState<T | null>(target.value)
  useEffect(() => target.subscribe(() => setV(target.value)), [])
  return v
}

export function makeUpdateModalStore(): UpdateModalStore {
  const updateStore = createStore<UpdateInfo>()
  const uiStore = createStore<UpdateUi>()
  uiStore.value = 'none'
  return {
    setUpdate: (info) => { updateStore.value = info; updateStore.emit() },
    useUpdate: () => useStoreValue<UpdateInfo>(updateStore),
    openUpdateConfirm: () => { uiStore.value = 'confirm'; uiStore.emit() },
    openUpdateLog: () => { uiStore.value = 'log'; uiStore.emit() },
    closeUpdateUi: () => { uiStore.value = 'none'; uiStore.emit() },
    useUpdateUi: () => {
      const v = useStoreValue<UpdateUi>(uiStore)
      return v ?? 'none'
    },
  }
}
