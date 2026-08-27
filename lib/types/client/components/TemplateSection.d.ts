/**
 * dsh-jenkins —— 配置模板内容区（json / js / ts Tab），供「项目配置」弹框展示。
 * 「保存到工作区」：把当前格式模板写入「项目下拉框选中」的工作区根目录
 * （host op saveTemplate）；默认选中当前工作区，可切换到任意已打开的项目，
 * 避免在多项目场景下存错位置。目标文件已存在时先弹确认，确认后才覆盖。
 */
import type { RunFn } from '../rpc.ts';
export interface TemplateSectionProps {
    run: RunFn;
    sessionId: string;
    /** 默认目标工作区根目录（当前会话所属工作区；为空时取项目列表首项）。 */
    cwd: string;
    /** 可选目标项目（工作区路径去重列表）；提供时展示「项目」下拉，保存位置一目了然。 */
    workspaces?: string[];
}
export declare function TemplateSection({ run, sessionId, cwd, workspaces }: TemplateSectionProps): import("react").JSX.Element;
//# sourceMappingURL=TemplateSection.d.ts.map