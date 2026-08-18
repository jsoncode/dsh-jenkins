/**
 * dsh-jenkins —— 渲染错误边界：组件崩溃时显示错误而非白屏。
 */
import { Component, type ReactNode } from 'react';
interface ErrorBoundaryProps {
    label?: string;
    children?: ReactNode;
}
interface ErrorBoundaryState {
    error: Error | null;
}
export declare class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): ErrorBoundaryState;
    render(): ReactNode;
}
export {};
//# sourceMappingURL=ErrorBoundary.d.ts.map