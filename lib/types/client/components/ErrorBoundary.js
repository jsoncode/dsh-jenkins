import { jsx as _jsx } from "react/jsx-runtime";
/**
 * dsh-jenkins —— 渲染错误边界：组件崩溃时显示错误而非白屏。
 */
import { Component } from 'react';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    render() {
        if (this.state.error !== null) {
            console.error('[dsh-jenkins] render error in', this.props.label || 'component', this.state.error);
            return (_jsx("div", { className: "dshj-empty dshj-err", children: (this.props.label || 'component') + ' error: ' + String((this.state.error && this.state.error.message) || this.state.error) }));
        }
        return this.props.children;
    }
}
