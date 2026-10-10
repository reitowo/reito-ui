import { Component, type ReactNode } from 'react';

export class PreviewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <p role="alert">预览未能显示，请重置或在组件详情中打开。</p> : this.props.children;
  }
}
