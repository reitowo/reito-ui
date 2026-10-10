import { Component, Suspense, lazy, useEffect, useRef, type ReactNode, type ComponentType } from 'react';
import { TooltipProvider } from '@reito/ui/basic';
import manifest from './catalog-manifest.json';
import './overview.css';

const params = new URLSearchParams(location.search);
const id = params.get('preview');
const entry = manifest.entries.find(item => item.layer + '/' + item.id === id);
const Demo = lazy(async () => {
  let component: ComponentType | undefined;
  if (entry?.layer === 'basic') component = (await import('../../../packages/ui/src/basic/catalog')).basicCatalog.find(item => item.id === entry.id)?.component;
  if (entry?.layer === 'complex') component = (await import('../../../packages/ui/src/complex/catalog')).complexCatalog.find(item => item.id === entry.id)?.component;
  if (entry?.layer === 'ai') component = (await import('../../../packages/ui/src/ai/catalog')).aiCatalog.find(item => item.id === entry.id)?.component;
  return { default: component || (() => <p role="alert">未找到组件。</p>) };
});

class PreviewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p role="alert">预览未能载入，请在组件详情中重新打开。</p> : this.props.children; }
}

function PreviewContent() {
  useEffect(() => {
    if (parent !== window) parent.postMessage({ type: 'reito-preview-ready', id }, location.origin);
  }, []);
  return <Demo />;
}

export function OverviewPreview() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const apply = (theme: string | null, density: string | null) => {
      document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
      document.documentElement.dataset.density = density === 'comfortable' ? 'comfortable' : 'compact';
      document.documentElement.style.colorScheme = document.documentElement.dataset.theme;
    };
    apply(params.get('theme'), params.get('density'));
    document.title = (entry?.name || '未找到组件') + ' · 独立预览';
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== parent || event.data?.type !== 'reito-preview-settings' || event.data.id !== id) return;
      apply(event.data.theme, event.data.density);
    };
    window.addEventListener('message', receive);
    const report = () => {
      if (root.current && parent !== window) parent.postMessage({ type: 'reito-preview-size', id, height: root.current.scrollHeight }, location.origin);
    };
    const observer = new ResizeObserver(report);
    if (root.current) observer.observe(root.current);
    report();
    return () => { observer.disconnect(); window.removeEventListener('message', receive); };
  }, []);
  return <TooltipProvider><div ref={root} className="reito-root atlas-preview-root"><PreviewBoundary><Suspense fallback={<p role="status">正在载入组件…</p>}><PreviewContent /></Suspense></PreviewBoundary></div></TooltipProvider>;
}
