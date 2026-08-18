/**
 * 宿主 Context 的服务类型增强（声明合并）。
 *
 * 说明：@deepseek-ai/dsh-tools 自带 `declare module '@deepseek-ai/cordis'` 的
 * Context.tools 增强，但经 cordis 的 `export *` 间接导出后，TS 5.9 下该增强
 * 未生效（实测不合并）。这里在插件侧显式增强，保持类型安全且不依赖
 * dsh-tools 的类型链完整解析。
 */
declare module '@deepseek-ai/cordis' {
  interface Context {
    tools: {
      register(def: unknown): unknown
    }
    /** 反射层提供的服务读取（context proxy 运行时委托给 reflect）。 */
    get<T = unknown>(name: string): T | undefined
  }
}

export {}
