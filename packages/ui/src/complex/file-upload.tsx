import { useEffect, useId, useRef, useState } from 'react';
import { Check, File as FileIcon, RotateCcw, Upload, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Progress } from '../primitives/progress.js';
import { cx, formatBytes } from './shared.js';

export type FileUploadStatus = 'queued' | 'uploading' | 'success' | 'error' | 'canceled';
export interface QueuedFile { id: string; file: File; status?: FileUploadStatus; progress?: number; error?: string; }
export interface FileUploadTransportContext { signal: AbortSignal; onProgress: (progress: number) => void; }
export type FileUploadTransport = (item: QueuedFile, context: FileUploadTransportContext) => void | Promise<void>;
export interface FileUploadProps {
  value?: QueuedFile[];
  onValueChange?: (files: QueuedFile[]) => void;
  transport?: FileUploadTransport;
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

function progressValue(value?: number) { return Math.min(100, Math.max(0, Number.isFinite(value) ? Number(value) : 0)); }
function statusOf(item: QueuedFile): FileUploadStatus { return item.status ?? 'queued'; }
const statusLabel: Record<FileUploadStatus, string> = { queued: '等待上传', uploading: '上传中', success: '上传完成', error: '上传失败', canceled: '已取消' };

/** A validated queue whose optional transport callback is implemented by the host. */
export function FileUpload({ value, onValueChange, transport, accept, maxSize = 10 * 1024 * 1024, maxFiles = 5, disabled = false, label = '添加文件', className }: FileUploadProps) {
  const [internalFiles, setInternalFiles] = useState<QueuedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  const controllers = useRef(new Map<string, AbortController>());
  const id = useId();
  const files = value ?? internalFiles;
  const filesRef = useRef(files); filesRef.current = files;

  useEffect(() => () => { for (const controller of controllers.current.values()) controller.abort(); controllers.current.clear(); }, []);

  function change(next: QueuedFile[]) {
    filesRef.current = next;
    if (value === undefined) setInternalFiles(next);
    onValueChange?.(next);
  }

  function updateItem(fileId: string, update: (item: QueuedFile) => QueuedFile) {
    change(filesRef.current.map(item => item.id === fileId ? update(item) : item));
  }

  function add(incoming: File[]) {
    if (disabled) return;
    const next = [...filesRef.current]; const problems: string[] = [];
    for (const file of incoming) {
      if (!accepted(file, accept)) { problems.push(`${file.name}：文件类型不支持`); continue; }
      if (file.size > maxSize) { problems.push(`${file.name}：超过 ${formatBytes(maxSize)} 上限`); continue; }
      if (next.some(item => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified)) { problems.push(`${file.name}：已在队列中`); continue; }
      if (next.length >= maxFiles) { problems.push(`${file.name}：最多添加 ${maxFiles} 个文件`); continue; }
      next.push({ id: `${id}-${nextId.current++}`, file, status: 'queued' });
    }
    change(next); setErrors(problems);
  }

  async function start(item: QueuedFile) {
    if (!transport || disabled || statusOf(item) === 'uploading') return;
    controllers.current.get(item.id)?.abort();
    const controller = new AbortController();
    controllers.current.set(item.id, controller);
    updateItem(item.id, current => ({ ...current, status: 'uploading', progress: 0, error: undefined }));
    try {
      await transport({ ...item, status: 'uploading', progress: 0, error: undefined }, {
        signal: controller.signal,
        onProgress: progress => {
          if (controllers.current.get(item.id) !== controller || controller.signal.aborted) return;
          updateItem(item.id, current => ({ ...current, status: 'uploading', progress: progressValue(progress), error: undefined }));
        },
      });
      if (controllers.current.get(item.id) === controller && !controller.signal.aborted) updateItem(item.id, current => ({ ...current, status: 'success', progress: 100, error: undefined }));
    } catch (reason) {
      if (controllers.current.get(item.id) === controller && !controller.signal.aborted) updateItem(item.id, current => ({ ...current, status: 'error', error: reason instanceof Error ? reason.message : '上传失败，请重试' }));
    } finally {
      if (controllers.current.get(item.id) === controller) controllers.current.delete(item.id);
    }
  }

  function cancel(item: QueuedFile) {
    controllers.current.get(item.id)?.abort();
    controllers.current.delete(item.id);
    updateItem(item.id, current => ({ ...current, status: 'canceled', progress: undefined, error: undefined }));
  }

  function remove(item: QueuedFile) {
    controllers.current.get(item.id)?.abort();
    controllers.current.delete(item.id);
    change(filesRef.current.filter(file => file.id !== item.id));
  }

  const uploading = files.filter(item => statusOf(item) === 'uploading').length;
  const completed = files.filter(item => statusOf(item) === 'success').length;

  return <section aria-label={label} aria-busy={uploading > 0} data-slot="file-upload" className={cx('space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <div onDragOver={event => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); add(Array.from(event.dataTransfer.files)); }} className={cx('flex flex-col items-center justify-center gap-[var(--rui-content-gap)] rounded-xl border border-dashed border-border bg-muted/20 p-[var(--rui-empty-padding)] text-center', dragging && 'border-ring bg-muted', disabled && 'cursor-not-allowed')}>
      <Upload className="size-6 text-muted-foreground" aria-hidden="true" /><div><h3 className="font-medium">{disabled ? '暂时无法添加文件' : '拖放文件到此处'}</h3><p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">每个文件不超过 {formatBytes(maxSize)}，最多 {maxFiles} 个。{accept && `支持 ${accept}。`}{transport ? '上传由宿主 transport 处理。' : '文件只加入本地队列。'}</p></div>
      <input id={id} ref={inputRef} type="file" multiple accept={accept} disabled={disabled} aria-label={label} aria-describedby={`${id}-hint`} className="sr-only" tabIndex={-1} onChange={event => { add(Array.from(event.target.files ?? [])); event.target.value = ''; }} />
      <Button variant="outline" disabled={disabled} onClick={() => inputRef.current?.click()}>{label}</Button>
    </div>
    {errors.length > 0 && <div role="alert" className="rounded-lg bg-destructive/5 p-[var(--rui-content-padding)] text-xs text-destructive"><ul className="space-y-1">{errors.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}</ul></div>}
    <ul className="divide-y divide-border rounded-md border border-border">{files.map(item => {
      const status = statusOf(item); const progress = progressValue(item.progress);
      return <li key={item.id} data-file-id={item.id} data-status={status} className="flex min-w-0 items-center gap-[var(--rui-content-gap-sm)] px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]">
        <FileIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="min-w-0 flex-1"><span className="block truncate" title={item.file.name}>{item.file.name}</span><span className={cx('text-xs', status === 'error' ? 'text-destructive' : 'text-muted-foreground')}>{formatBytes(item.file.size)} · {item.error || statusLabel[status]}{status === 'uploading' && ` ${Math.round(progress)}%`}</span>
          {status === 'uploading' && <Progress aria-label={`${item.file.name}上传进度`} value={progress} className="mt-1" />}
        </span>
        {transport && (status === 'queued' || status === 'canceled') && <Button variant="ghost" size="sm" disabled={disabled} onClick={() => void start(item)}><Upload aria-hidden="true" />{status === 'canceled' ? '重新开始' : '开始'}</Button>}
        {transport && status === 'uploading' && <Button variant="ghost" size="sm" disabled={disabled} onClick={() => cancel(item)}><X aria-hidden="true" />取消</Button>}
        {transport && status === 'error' && <Button variant="ghost" size="sm" disabled={disabled} onClick={() => void start(item)}><RotateCcw aria-hidden="true" />重试</Button>}
        {status === 'success' && <Check aria-label="上传完成" className="size-4 shrink-0 text-success" />}
        {status !== 'uploading' && <Button variant="ghost" size="icon-sm" aria-label={`移除 ${item.file.name}`} disabled={disabled} onClick={() => remove(item)}><X aria-hidden="true" /></Button>}
      </li>;
    })}</ul>
    <p role="status" className="text-xs text-muted-foreground">{files.length ? `共 ${files.length} 个文件 · 上传中 ${uploading} · 已完成 ${completed}` : '尚未选择文件'}</p>
  </section>;
}
