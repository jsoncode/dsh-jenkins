/**
 * dsh-jenkins —— 宿主半边：插件新版本检查（op: updateCheck）。
 *
 * 以 npm registry 搜索接口（keywords:dsh-jenkins）取线上最新版本，
 * 与**被安装根目录的 package.json** 的 version 比对（即本插件安装位置的
 * 包清单，经 import.meta.url 相对定位，不依赖任何绝对路径）：
 * 返回 { current, latest, hasUpdate }。name 不匹配视为未命中（不提示更新）。
 *
 * 完全实时：每次调用都重读安装根目录 package.json 并重新请求 registry，
 * 无进程内缓存——服务运行期间在外部更新包后，刷新页面即可读到新版本号，
 * 无需重启 dsh 服务；调用频率由客户端决定（页面加载时一次 + 每 5 分钟一次）。
 * 网络失败静默降级为 { current, latest:'', hasUpdate:false }，不打扰用户。
 */
export interface PluginUpdateInfo {
    /** 被安装根目录 package.json 里的当前版本；读取失败为空串。 */
    current: string;
    /** registry 上的最新版本；网络失败 / 未命中时为空串。 */
    latest: string;
    /** latest 是否比 current 更新。 */
    hasUpdate: boolean;
}
/**
 * 判断 candidate 是否严格比 base 更新（semver 规则子集）：
 * 主版本三元组数值比较；预发布版劣于正式版，预发布标识逐段比较。
 * 任一侧无法解析时返回 false（宁可漏报也不误报）。
 */
export declare function isNewerVersion(candidate: string, base: string): boolean;
/**
 * 读取被安装根目录 package.json 的 version（并校验 name），每次调用实时读盘。
 * 编译产物 lib/index.js 相对 `../package.json`；源码直跑（tsx src/…）相对
 * `../../package.json`。两候选都失败或 name 不符时回退 process.cwd()。
 */
export declare function readInstalledVersion(): string;
/**
 * 检查插件更新：registry 最新版 vs 被安装根目录 package.json 版本。
 * 每次调用实时读盘并实时请求 registry（无缓存）；
 * 网络失败降级为 { current, latest:'', hasUpdate:false }。
 */
export declare function checkPluginUpdate(): Promise<PluginUpdateInfo>;
//# sourceMappingURL=update.d.ts.map