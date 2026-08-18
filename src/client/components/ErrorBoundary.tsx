/**
 * dsh-jenkins —— 渲染错误边界：组件崩溃时显示错误而非白屏。
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  label?: string
  children?: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  render(): ReactNode {
    if (this.state.error !== null) {
      console.error('[dsh-jenkins] render error in', this.props.label || 'component', this.state.error)
      return (
        <div className="dshj-empty dshj-err">
          {(this.props.label || 'component') + ' error: ' + String((this.state.error && this.state.error.message) || this.state.error)}
        </div>
      )
    }
    return this.props.children
  }
}
