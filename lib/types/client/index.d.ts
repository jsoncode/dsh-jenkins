/**
 * dsh-jenkins —— 浏览器半边入口（tsdown 打包，对齐 @lemcae/dsh-balance）。
 *
 * 本文件为纯 ESM 模块，直接导出插件形状 { name, inject, apply }；
 * window.__ModuleLoader__.load 工厂包装由 tsdown 的 banner/intro/footer
 * 在构建时生成（见 tsdown.config.ts）。外部依赖（react /
 * react/jsx-runtime / @deepseek-ai/dsh-client-ui-primitives）构建时保持
 * external，运行时经 factory 的 require 解析宿主模块表（seed）。
 */
export declare const name: string;
export declare const inject: string[];
export declare const apply: (ctx: import("./plugin.tsx").ClientCtx) => void;
export type { ClientPluginModule, ClientCtx } from './plugin.tsx';
//# sourceMappingURL=index.d.ts.map