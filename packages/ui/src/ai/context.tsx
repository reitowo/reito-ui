import type { ReactNode } from 'react';
import { ExternalLink, File, Image, Paperclip, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { classes } from './shared.js';

export interface ContextPillProps {
  children: ReactNode;
  label: string;
  icon?: ReactNode;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ContextPill({ children, label, icon, onRemove, disabled = false, className }: ContextPillProps) {
  return <span className={classes('inline-flex min-h-[var(--rui-control-height-sm)] max-w-full items-center gap-1 rounded-md border bg-muted/40 py-0 pl-2 text-xs text-muted-foreground', !onRemove && 'pr-2', className)}>
    {icon && <span aria-hidden="true" className="shrink-0 [&_svg]:size-3">{icon}</span>}<span className="min-w-0 truncate" title={label}>{children}</span>
    {onRemove && <Button type="button" variant="ghost" size="icon-xs" className="shrink-0 p-0" disabled={disabled} aria-label={`移除${label}`} onClick={onRemove}><X className="size-3" aria-hidden="true" /></Button>}
  </span>;
}

export interface AttachmentItem { id: string; name: string; kind?: 'file' | 'image'; sizeLabel?: string; status?: 'ready' | 'uploading' | 'error'; error?: string }
export interface AttachmentListProps { items: AttachmentItem[]; onRemove?: (id: string) => void; onRetry?: (id: string) => void; emptyLabel?: string; className?: string }

export function AttachmentList({ items, onRemove, onRetry, emptyLabel = '没有附件', className }: AttachmentListProps) {
  if (!items.length) return <p className={classes('text-sm text-muted-foreground', className)}>{emptyLabel}</p>;
  return <ul aria-label="附件" className={classes('grid min-w-0 gap-2', className)}>{items.map(item => <li key={item.id} className="flex min-w-0 items-center gap-[var(--rui-content-gap-sm)] rounded-lg border px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]">
    {item.kind === 'image' ? <Image className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : <File className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
    <div className="min-w-0 flex-1"><p className="break-all text-sm">{item.name}</p><p className={classes('text-xs', item.status === 'error' ? 'text-destructive' : 'text-muted-foreground')}>{item.status === 'error' ? item.error || '附件处理失败' : item.status === 'uploading' ? '处理中…' : item.sizeLabel || '已就绪'}</p></div>
    {item.status === 'error' && onRetry && <Button type="button" size="sm" variant="ghost" onClick={() => onRetry(item.id)} aria-label={`重试${item.name}`}>重试</Button>}
    {onRemove && <Button type="button" variant="ghost" size="icon-sm" className="shrink-0" aria-label={`移除附件${item.name}`} onClick={() => onRemove(item.id)}><X className="size-3.5" aria-hidden="true" /></Button>}
  </li>)}</ul>;
}

export interface PromptSuggestion { id: string; label: string; prompt: string; icon?: ReactNode; disabled?: boolean }
export function PromptSuggestions({ items, onSelect, label = '建议请求', className }: { items: PromptSuggestion[]; onSelect: (prompt: string) => void; label?: string; className?: string }) {
  return <div role="group" aria-label={label} className={classes('flex flex-wrap gap-2', className)}>{items.map(item => <Button key={item.id} type="button" variant="outline" size="sm" disabled={item.disabled} onClick={() => onSelect(item.prompt)}>{item.icon}{item.label}</Button>)}</div>;
}

export interface SourceItem { id: string; title: string; href?: string; description?: string }
function safeSourceHref(href?: string) {
  if (!href) return undefined;
  if (/^(https?:\/\/|\/[^/]|#)/i.test(href)) return href;
  return undefined;
}

export function Citation({ source, index }: { source: SourceItem; index: number }) {
  const href = safeSourceHref(source.href);
  const className = 'inline-flex min-w-5 items-center justify-center rounded bg-muted px-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:outline-ring';
  return href ? <a className={className} href={href} title={source.title} aria-label={`来源 ${index}：${source.title}`} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>[{index}]</a> : <span className={className} title={source.title} aria-label={`来源 ${index}：${source.title}`}>[{index}]</span>;
}

export function Sources({ items, className }: { items: SourceItem[]; className?: string }) {
  return <section aria-label="引用来源" className={classes('grid min-w-0 gap-2', className)}><h3 className="text-xs font-medium text-muted-foreground">来源 · {items.length}</h3>{items.length ? <ol className="grid gap-2">{items.map((item, index) => {
    const href = safeSourceHref(item.href);
    return <li key={item.id} className="flex min-w-0 gap-2 text-sm"><span className="text-muted-foreground">{index + 1}.</span><div className="min-w-0">{href ? <a href={href} className="break-words underline decoration-border underline-offset-4 hover:decoration-foreground focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:outline-ring" target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>{item.title}<ExternalLink className="ml-1 inline size-3" aria-hidden="true" /></a> : <span className="break-words">{item.title}</span>}{item.description && <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>}</div></li>;
  })}</ol> : <p className="text-sm text-muted-foreground">没有提供来源</p>}</section>;
}

export function AttachmentIcon() { return <Paperclip className="size-3.5" aria-hidden="true" />; }
