import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 内联 SVG 图标组件。
 */
export function SvgPlus({ size }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", "aria-hidden": true, children: _jsx("path", { d: "M8 3.5v9M3.5 8h9" }) }));
}
export function SvgClock({ size }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [_jsx("circle", { cx: 12, cy: 12, r: 10 }), _jsx("polyline", { points: "12 6 12 12 16 14" })] }));
}
/** 复制图标（两个重叠矩形）。 */
export function SvgCopy({ size }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [_jsx("rect", { x: "5.5", y: "5.5", width: "8", height: "8", rx: "1.5" }), _jsx("path", { d: "M10.5 5.5v-1A1.5 1.5 0 0 0 9 3h-4.5A1.5 1.5 0 0 0 3 4.5V9a1.5 1.5 0 0 0 1.5 1.5h1" })] }));
}
/** 对勾图标（复制成功反馈）。 */
export function SvgCheck({ size }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: _jsx("path", { d: "M3 8.5 6.5 12 13 4.5" }) }));
}
/** 进入全屏图标（四角向外）。 */
export function SvgExpand({ size }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: _jsx("path", { d: "M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" }) }));
}
/** 退出全屏图标（四角向内）。 */
export function SvgCompress({ size }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: _jsx("path", { d: "M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" }) }));
}
