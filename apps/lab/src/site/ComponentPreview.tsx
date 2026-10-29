import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@reito/ui/basic';
import { allComponents } from '../catalog';
import { PreviewBoundary } from '../PreviewBoundary';

/** Live catalog demo. Loaded on demand because it pulls in every layer's demos. */
export default function ComponentPreview({ id, label = true }: { id: string; label?: boolean }) {
  const [revision, setRevision] = useState(0);
  const entry = allComponents.find((item) => item.id === id);
  if (!entry) return <p role="alert" className="site-preview-missing">未找到组件示例。</p>;
  const Demo = entry.component;
  return (
    <div className="site-preview" data-testid="site-component-preview" data-preview={`${entry.layer}/${entry.id}`}>
      {label && (
        <div className="site-preview-bar">
          <span>实时预览 · 本地示例状态</span>
          <Button variant="ghost" size="xs" onClick={() => setRevision(revision + 1)}><RotateCcw aria-hidden="true" />重置</Button>
        </div>
      )}
      <div className="site-preview-stage"><PreviewBoundary key={revision}><Demo /></PreviewBoundary></div>
    </div>
  );
}
