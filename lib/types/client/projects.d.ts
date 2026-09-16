/**
 * dsh-jenkins —— 浏览器半边：集中式项目配置的共享类型与工具。
 *
 * 与宿主概念对齐：
 * - 数据 = 项目名 → 发布目标数组（`{ name?, job, server, environments }`，与工作区配置文件同构），
 *   存放在独立文件 `$DSH_HOME/dsh-jenkins-map.json`；
 * - 数组顺序 = 环境顺序、**数量不限**（第 1 项为默认环境，通常写 UAT）；
 *   每项的 `name` 是环境显示名（如 uat环境 / prod灰度），缺省按下标回退 UAT / 生产 / 环境 N；
 * - 发布 / 历史记录用 `@project/<项目名>` 作为「缓存 + 历史分桶」键，
 *   与工作区路径互不冲突（历史 tab 会显示成「项目配置：xxx」）。
 */
/** 集中式项目在缓存 / 历史里的分桶键前缀。 */
export declare const PROJECT_CWD_PREFIX = "@project/";
/** 一个发布目标（与宿主 ProjectTarget 同构）。 */
export interface ProjectTarget {
    /** 该环境的显示名（选填，如 uat环境 / prod灰度 / prod环境）；空则按下标回退。 */
    name?: string;
    job: string;
    server: string;
    environments: Record<string, string | number | boolean>;
}
/** 集中式多项目配置。 */
export type ProjectConfigMap = Record<string, ProjectTarget[]>;
/** 发布表单使用的配置元素（`environments` → `parameters`）。 */
export interface ConfigEntry {
    /** 该环境的显示名（选填；见 ProjectTarget.name）。 */
    name?: string;
    job: string;
    server: string;
    parameters?: Record<string, string | number | boolean>;
}
/** 项目名 → 缓存 / 历史分桶键。 */
export declare const projectCwd: (name: string) => string;
/** 是否为集中式项目的分桶键。 */
export declare const isProjectCwd: (key: string) => boolean;
/** 从分桶键取项目名。 */
export declare const projectNameOfCwd: (key: string) => string;
/** 从路径取「项目名」（工作区文件夹名，与宿主发现式配置的命名规则一致）。 */
export declare const folderNameOf: (p: string | undefined | null) => string;
/** 未命名环境的回退显示名（按下标：0=UAT、1=生产，其余「环境 N」）。 */
export declare const envLabel: (index: number) => string;
/** 发布目标的显示名：优先 `name`，缺省按下标回退为 UAT / 生产 / 环境 N。 */
export declare const targetLabel: (target: {
    name?: string;
} | undefined | null, index: number) => string;
/** 发布目标数组 → 发布表单配置元素。 */
export declare const targetsToEntries: (targets: ProjectTarget[] | undefined | null) => ConfigEntry[];
/** 宽松解析发布目标数组；结构非法或没有有效项时返回 null。 */
export declare function parseTargets(raw: unknown): ProjectTarget[] | null;
/** 把宿主返回的 map 收敛成结构正确的对象（字段缺失 / 脏数据时跳过）。 */
export declare function sanitizeProjects(raw: unknown): ProjectConfigMap;
/**
 * 项目配置 op 的错误文案：宿主回 `unknown-op` 说明宿主半边还是旧版本
 * （map 相关 op 尚未加载），给出可执行提示而非「未知操作」。
 */
export declare const projectOpError: (res: {
    code?: string;
    error?: string;
} | null | undefined, fallback?: string) => string;
//# sourceMappingURL=projects.d.ts.map