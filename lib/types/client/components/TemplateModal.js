import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 「项目配置」弹框：以弹框形式查看 dsh-Jenkins 配置模板（json / js / ts Tab）。
 * 遮罩盖在主弹框之上（z-index 1100），点击遮罩或 ✕ 均可关闭弹框。
 * 「保存到工作区」：把当前格式的模板写入当前工作区根目录（文件已存在时先确认覆盖）。
 */
import { t } from "../i18n.js";
import { TemplateSection } from "./TemplateSection.js";
import { ModalPortal } from "./ModalPortal.js";
export function TemplateModal({ run, sessionId, cwd, onClose }) {
    return (_jsxs(ModalPortal, { backdropClass: "dshj-json-backdrop", modalClass: "dshj-template-modal", onBackdropClose: onClose, children: [_jsxs("div", { className: "dshj-modal-header", children: [_jsx("div", { children: _jsx("div", { className: "dshj-modal-title", children: t('templateTitle') }) }), _jsx("button", { type: "button", className: "dshj-close", "aria-label": t('close'), title: t('close'), onClick: onClose, children: "\u2715" })] }), _jsx("div", { className: "dshj-modal-body", children: _jsx(TemplateSection, { run: run, sessionId: sessionId, cwd: cwd }) })] }));
}
