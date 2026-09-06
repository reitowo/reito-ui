import { useState, type ReactNode } from 'react';
import { FileCode2, X } from 'lucide-react';
import { Badge } from '../primitives/badge.js';
import { Button } from '../primitives/button.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../primitives/select.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../primitives/tabs.js';
import { CodeBlock } from './code-block.js';
import { classes } from './shared.js';

export interface ArtifactVersion {
  id: string;
  label: string;
  status?: 'draft' | 'ready' | 'error';
  preview?: ReactNode;
  code?: string;
  language?: string;
  error?: string;
}
export interface ArtifactPanelProps {
  title: string;
  versions: ArtifactVersion[];
  version?: string;
  onVersionChange?: (version: string) => void;
  view?: 'preview' | 'code';
  onViewChange?: (view: 'preview' | 'code') => void;
  onClose?: () => void;
  className?: string;
}

export function ArtifactPanel({ title, versions, version, onVersionChange, view, onViewChange, onClose, className }: ArtifactPanelProps) {
  const [internalVersion, setInternalVersion] = useState(versions.at(-1)?.id ?? '');
  const [internalView, setInternalView] = useState<'preview' | 'code'>('preview');
  const active = versions.find(item => item.id === (version ?? internalVersion)) ?? versions.at(-1);
  const activeView = view ?? internalView;
  return <section aria-label={`产物：${title}`} className={classes('flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border bg-card', className)}>
    <header className="flex min-w-0 flex-wrap items-center gap-2 border-b px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]"><FileCode2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><h3 className="min-w-0 flex-1 truncate text-sm font-medium" title={title}>{title}</h3>{active?.status && <Badge variant={active.status === 'error' ? 'destructive' : 'outline'}>{active.status === 'draft' ? '草稿' : active.status === 'ready' ? '已就绪' : '错误'}</Badge>}{onClose && <Button type="button" variant="ghost" size="icon-xs" aria-label={`关闭产物${title}`} onClick={onClose}><X className="size-3.5" aria-hidden="true" /></Button>}</header>
    {active ? <Tabs value={activeView} onValueChange={next => { if (next === 'preview' || next === 'code') { if (view === undefined) setInternalView(next); onViewChange?.(next); } }} className="min-h-0 min-w-0 flex-1 gap-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]"><TabsList aria-label="产物视图" variant="line"><TabsTrigger value="preview">预览</TabsTrigger><TabsTrigger value="code">代码</TabsTrigger></TabsList><Select items={versions.map(item => ({ value: item.id, label: item.label }))} value={active.id} onValueChange={next => { if (next !== null) { if (version === undefined) setInternalVersion(next); onVersionChange?.(next); } }}><SelectTrigger size="sm" aria-label="产物版本"><SelectValue /></SelectTrigger><SelectContent align="end" alignItemWithTrigger={false}>{versions.map(item => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></div>
      <TabsContent value="preview" className="min-h-0 min-w-0 overflow-auto p-[var(--rui-content-padding)]">{active.status === 'error' ? <p role="alert" className="text-sm text-destructive">{active.error || '预览不可用，请检查产物内容。'}</p> : active.preview ?? <p className="text-sm text-muted-foreground">此版本没有预览内容</p>}</TabsContent>
      <TabsContent value="code" className="min-h-0 min-w-0 overflow-auto p-0"><CodeBlock variant="embedded" filename={title} language={active.language} code={active.code ?? ''} /></TabsContent>
    </Tabs> : <p className="p-[var(--rui-content-padding)] text-sm text-muted-foreground">还没有产物版本</p>}
  </section>;
}
