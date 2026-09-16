/**
 * dsh-jenkins —— 项目配置弹框：集中式 map（`$DSH_HOME/dsh-jenkins-map.json`）的唯一编辑入口。
 *
 * 两个 tab：
 * - **表单**：项目紧凑列表（项目名 + 每个环境一行：环境名 / Job / 服务器 / 参数），
 *   - 环境**数量不限**（不再假定只有 UAT / 生产两项），每行可单独删除；
 *   - 环境名（`name`）选填，留空按下标回退 UAT / 生产 / 环境 N，发布时用于服务器下拉标签；
 *   - 环境参数收在「N 项参数」里点开才展开 —— 默认视图保持轻量。
 * - **JSON**：整个 map 的 JSON 直接编辑（与文件格式一致，可整段粘贴/导出）。
 *
 * 底部固定操作：`[ ] 覆盖同名项目` + `重新发现`（扫描已打开工作区的
 * dsh-jenkins.json/js/ts，以文件夹名为项目名合并进 map）；取消 / 保存。
 */
import type { RunFn } from '../rpc.ts';
import { type ProjectConfigMap } from '../projects.ts';
export interface ProjectMapModalProps {
    run: RunFn;
    sessionId: string;
    /** 已打开的服务器（服务器字段「选择服务器」候选）。 */
    servers: Array<{
        id: string;
        name: string;
        baseUrl: string;
    }>;
    /** 已打开的工作区路径（重新发现的扫描范围）。 */
    workspaces: string[];
    /** 宿主返回的项目配置文件绝对路径（展示用）。 */
    mapPath?: string;
    /** 初始 map（弹框打开时已由调用方加载，避免二次请求）。 */
    initial: ProjectConfigMap;
    onSaved(map: ProjectConfigMap): void;
    onClose(): void;
}
export declare function ProjectMapModal({ run, sessionId, servers, workspaces, mapPath, initial, onSaved, onClose }: ProjectMapModalProps): import("react").JSX.Element;
//# sourceMappingURL=ProjectMapModal.d.ts.map