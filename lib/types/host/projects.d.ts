/**
 * dsh-jenkins —— 集中式「项目配置」（项目名 → 发布目标数组）纯逻辑：
 * 归一化 / 校验 / 合并 / 从配置载荷解析。
 *
 * - 数据形状与工作区配置文件同构：每个发布目标 =
 *   `{ name?, job, server, environments }`（`name` 为该环境的显示名，如 uat环境 /
 *   prod灰度），项目名做 key，值为数组；**数组顺序 = 环境顺序、数量不限**
 *   （第 1 项为默认环境，通常写 UAT）；
 * - 落盘 / 读取见 project-map.ts（独立文件 `$DSH_HOME/dsh-jenkins-map.json`）；
 * - 兼容两种来源：map 格式本身，以及旧版**数组**格式（工作区根目录
 *   dsh-jenkins.json/js/ts 的内容 —— 发现式配置即用它合并进 map）。
 *
 * 本模块只做「解析 + 校验 + 合并」，不触碰文件系统；读文件由 project-map.ts 负责。
 */
import type { ProjectConfigMap, ProjectTarget } from './types.ts';
/**
 * 归一化单个发布目标（job / server 必填；name 与 environments 可省略）。
 * `name` 省略 / 空串时**不写该字段**，文件保持干净（显示时由界面按下标回退）。
 */
export declare function normalizeProjectTarget(raw: unknown, label: string): ProjectTarget;
/** 归一化一个项目的发布目标数组（至少 1 项；数量不限）。 */
export declare function normalizeProjectTargets(raw: unknown, projectName: string): ProjectTarget[];
/** 归一化整个 map（严格模式：任一项非法即抛错；allowEmpty 时接受空 map）。 */
export declare function normalizeProjectMap(raw: unknown, opts?: {
    allowEmpty?: boolean;
}): ProjectConfigMap;
/** 宽松归一化（读数据文件用）：跳过非法项，绝不抛错。 */
export declare function sanitizeProjectMap(raw: unknown): ProjectConfigMap;
/**
 * 从文件名推导项目名：去掉扩展名与 `dsh-jenkins` 前缀；
 * 文件本身就叫 `dsh-jenkins.*`（工作区根目录配置）时退回**所属文件夹名**，
 * 都没有则用 `imported`。
 */
export declare function projectNameFromFilename(filename: string): string;
/** 合并两份项目配置（incoming 覆盖同名项目，其余保留）。 */
export declare function mergeProjectMaps(base: ProjectConfigMap, incoming: ProjectConfigMap): ProjectConfigMap;
/**
 * 只补缺失地合并（发现式配置的默认策略）：incoming 中已存在的同名项目保持原样，
 * 不覆盖用户手改过的内容；返回新 map 与被新增的项目名列表。
 */
export declare function mergeMissingProjects(base: ProjectConfigMap, incoming: ProjectConfigMap): {
    map: ProjectConfigMap;
    added: string[];
};
//# sourceMappingURL=projects.d.ts.map