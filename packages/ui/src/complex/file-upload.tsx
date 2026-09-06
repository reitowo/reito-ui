import { useId, useRef, useState } from 'react';
import { File as FileIcon, Upload, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { cx, formatBytes } from './shared.js';

export interface QueuedFile { id: string; file: File; }
export interface FileUploadProps {
  value?: QueuedFile[];
  onValueChange?: (files: QueuedFile[]) => void;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}

function accepted(file: File, accept?: string) {
  if (!accept?.trim()) return true;
  return accept.split(',').map(value => value.trim().toLowerCase()).filter(Boolean).some(rule => rule.startsWith('.') ? file.name.toLowerCase().endsWith(rule) : rule.endsWith('/*') ? file.type.toLowerCase().startsWith(rule.slice(0, -1)) : file.type.toLowerCase() === rule);
}

/** A validated local queue. It deliberately does not upload or read file contents. */
export function FileUpload({ value, onValueChange, accept, maxSize = 10 * 1024 * 1024, maxFiles = 5, disabled = false, label = '添加文件', className }: FileUploadProps) {
  const [internalFiles, setInternalFiles] = useState<QueuedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  const id = useId();
  const files = value ?? internalFiles;
  function change(next: QueuedFile[]) { if (value === undefined) setInternalFiles(next); onValueChange?.(next); }
  function add(incoming: File[]) {
    if (disabled) return;
    const next = [...files]; const problems: string[] = [];
    for (const file of incoming) {
      if (!accepted(file, accept)) { problems.push(`${file.name}：文件类型不支持`); continue; }
      if (file.size > maxSize) { problems.push(`${file.name}：超过 ${formatBytes(maxSize)} 上限`); continue; }
      if (next.some(item => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified)) { problems.push(`${file.name}：已在队列中`); continue; }
      if (next.length >= maxFiles) { problems.push(`${file.name}：最多添加 ${maxFiles} 个文件`); continue; }
      next.push({ id: `${id}-${nextId.current++}`, file });
    }
    change(next); setErrors(problems);
  }
  return <section aria-label={label} className={cx('space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <div onDragOver={event => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); add(Array.from(event.dataTransfer.files)); }} className={cx('flex flex-col items-center justify-center gap-[var(--rui-content-gap)] rounded-xl border border-dashed border-border bg-muted/20 p-[var(--rui-empty-padding)] text-center', dragging && 'border-ring bg-muted', disabled && 'cursor-not-allowed')}>
      <Upload className="size-6 text-muted-foreground" aria-hidden="true" /><div><h3 className="font-medium">{disabled ? '暂时无法添加文件' : '拖放文件到此处'}</h3><p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">每个文件不超过 {formatBytes(maxSize)}，最多 {maxFiles} 个。{accept && `支持 ${accept}。`}文件只加入本地队列。</p></div>
      <input id={id} ref={inputRef} type="file" multiple accept={accept} disabled={disabled} aria-label={label} aria-describedby={`${id}-hint`} className="sr-only" tabIndex={-1} onChange={event => { add(Array.from(event.target.files ?? [])); event.target.value = ''; }} />
      <Button variant="outline" disabled={disabled} onClick={() => inputRef.current?.click()}>{label}</Button>
    </div>
    {errors.length > 0 && <div role="alert" className="rounded-lg bg-destructive/5 p-[var(--rui-content-padding)] text-xs text-destructive"><ul className="space-y-1">{errors.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}</ul></div>}
    <ul className="divide-y divide-border">{files.map(item => <li key={item.id} className="flex items-center gap-[var(--rui-content-gap-sm)] py-[var(--rui-cell-padding-y)]"><FileIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block truncate" title={item.file.name}>{item.file.name}</span><span className="text-xs text-muted-foreground">{formatBytes(item.file.size)} · 已加入本地队列</span></span><Button variant="ghost" size="icon-sm" aria-label={`移除 ${item.file.name}`} disabled={disabled} onClick={() => change(files.filter(file => file.id !== item.id))}><X aria-hidden="true" /></Button></li>)}</ul>
    <p role="status" className="text-xs text-muted-foreground">{files.length ? `已选择 ${files.length} 个文件` : '尚未选择文件'}</p>
  </section>;
}
