/**
 * dsh-jenkins —— 「编辑 Jenkins 服务器」弹框：新增 / 编辑服务器共用同一表单，
 * 在独立弹框中完成填写、测试连接与保存（点击蒙版不关闭，避免误触丢失输入）。
 */
import type { RunFn } from '../rpc.ts';
export interface PublicServer {
    id: string;
    name: string;
    baseUrl: string;
    username: string;
    tokenMasked: string;
    hasToken: boolean;
    insecure: boolean;
    /** 最近一次测试连接是否通过（持久化；编辑保存后清除）。 */
    verified: boolean;
}
export interface ServerEditorModalProps {
    run: RunFn;
    sessionId: string;
    /** 传入服务器为编辑模式；null 为新增模式。 */
    server: PublicServer | null;
    /** 保存成功回调，参数为保存的服务器 id（新增为 null），供父组件做后续处理（如失效已验证状态）。 */
    onSaved?(id: string | null): void;
    onClose(): void;
}
export declare function ServerEditorModal({ run, sessionId, server, onSaved, onClose }: ServerEditorModalProps): import("react").JSX.Element;
//# sourceMappingURL=ServerEditorModal.d.ts.map