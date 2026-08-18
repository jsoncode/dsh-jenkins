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
