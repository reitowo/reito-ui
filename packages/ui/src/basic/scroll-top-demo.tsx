import { useEffect, useState } from 'react';
import { ScrollTop } from './scroll-top.js';
import { Button } from '../primitives/button.js';

export function ScrollTopDemo({ threshold, behavior = 'smooth', disabled = false, short = false }: {
  threshold?: number; behavior?: ScrollBehavior; disabled?: boolean; short?: boolean;
}) {
  const [surface, setSurface] = useState<HTMLDivElement | null>(null);
  const [heading, setHeading] = useState<HTMLHeadingElement | null>(null);
  return <div className="grid min-w-0 gap-2">
    <Button size="sm" variant="outline" onClick={() => surface?.scrollTo({ top: surface.scrollHeight, behavior: 'instant' })}>滚到示例末尾</Button>
    <div ref={setSurface} role="region" aria-label="文档滚动面板" tabIndex={0} className="h-64 overflow-auto rounded-md border border-border p-[var(--rui-content-padding)] outline-none focus-visible:ring-ring focus-visible:ring-[length:var(--rui-outline-width)]">
      <h3 ref={setHeading} tabIndex={-1} className="text-sm font-medium">本地文档示例</h3>
      {Array.from({ length: short ? 1 : 24 }, (_, index) => <p key={index} className="py-2 text-sm">第 {index + 1} 节：共享组件使用统一主题、控件尺寸和焦点规则。</p>)}
    </div>
    <div className="min-h-8"><ScrollTop target={surface} focusTarget={heading} threshold={threshold} behavior={behavior} disabled={disabled} /></div>
  </div>;
}

export function WindowScrollTopDemo() {
  const [target, setTarget] = useState<Window | null>(null);
  const [heading, setHeading] = useState<HTMLHeadingElement | null>(null);
  useEffect(() => setTarget(window), []);
  return <div className="grid gap-4 text-sm">
    <h3 ref={setHeading} tabIndex={-1}>页面顶部示例</h3>
    <Button onClick={() => target?.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })}>滚到页面末尾</Button>
    {Array.from({ length: 60 }, (_, index) => <p key={index}>第 {index + 1} 段：窗口滚动示例，不关联任何外部文档。</p>)}
    <ScrollTop target={target} focusTarget={heading} />
  </div>;
}
