/**
 * dsh-jenkins —— 配置模板内容区（json / js / ts Tab），供「项目配置」弹框展示。
 * 「保存到工作区」：把当前格式模板写入当前工作区根目录（host op saveTemplate）；
 * 目标文件已存在时先弹确认，确认后才覆盖。
 */
import type { RunFn } from '../rpc.ts';
export interface TemplateSectionProps {
    run: RunFn;
    sessionId: string;
    /** 目标工作区根目录（保存模板的位置；为空时禁用保存按钮）。 */
    cwd: string;
}
export declare function TemplateSection({ run, sessionId, cwd }: TemplateSectionProps): import("react").JSX.Element;
//# sourceMappingURL=TemplateSection.d.ts.map