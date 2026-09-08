import { useEffect, useId, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Check, File as FileIcon, ImageOff, RotateCcw, Upload, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Progress } from '../primitives/progress.js';
import { cx, formatBytes } from './shared.js';

export type FileUploadStatus = 'queued' | 'uploading' | 'success' | 'error' | 'canceled';
export interface QueuedFile { id: string; file: File; status?: FileUploadStatus; progress?: number; error?: string; }
export interface FileUploadTransportContext { signal: AbortSignal; onProgress: (progress: number) => void; }
export type FileUploadTransport = (item: QueuedFile, context: FileUploadTransportContext) => void | Promise<void>;
export interface FileUploadHandle { addFiles: (files: File[]) => void; }
export interface FileUploadProps {
  ref?: Ref<FileUploadHandle>;
  variant?: 'default' | 'compact';
  value?: QueuedFile[];
  onValueChange?: (files: QueuedFile[]) => void;
  transport?: FileUploadTransport;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  preview?: boolean;
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

function FileThumbnail({ file, enabled }: { file: File; enabled: boolean }) {
  const image = file.type.toLowerCase().startsWith('image/');
  const [source, setSource] = useState<string>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setSource(undefined);
    if (!enabled || !image || typeof URL.createObjectURL !== 'function') return;
    const objectUrl = URL.createObjectURL(file);
    setSource(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [enabled, file, image]);

  const state = !enabled || !image ? 'file' : failed ? 'fallback' : source ? 'image' : 'loading';
  return <span data-slot="file-upload-preview" data-preview-state={state} className="flex size-[var(--rui-control-height-sm)] shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted/40 text-muted-foreground">
    {state === 'image' && <img src={source} alt={`${file.name} 缩略图`} className="size-full object-cover" onError={() => setFailed(true)} />}
    {state === 'fallback' && <ImageOff role="img" aria-label={`${file.name} 无法生成缩略图`} className="size-4" />}
    {(state === 'file' || state === 'loading') && <FileIcon role="img" aria-label={`${file.name} 文件`} className="size-4" />}
  </span>;
}

/** A validated queue whose optional transport callback is implemented by the host. */
export function FileUpload({ ref, variant = 'default', value, onValueChange, transport, accept, maxSize = 10 * 1024 * 1024, maxFiles = 5, preview = true, disabled = false, label = '添加文件', className }: FileUploadProps) {
  const [internalFiles, setInternalFiles] = useState<QueuedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  const controllers = useRef(new Map<string, AbortController>());
  const uploadFiles = useRef(new WeakMap<AbortController, File>());
  const id = useId();
  const files = value ?? internalFiles;
  const filesRef = useRef(files); filesRef.current = files;

  useEffect(() => () => { for (const controller of controllers.current.values()) controller.abort(); controllers.current.clear(); }, []);
  useEffect(() => {
    for (const [fileId, controller] of controllers.current) {
      const item = files.find(candidate => candidate.id === fileId);
      if (!item || item.file !== uploadFiles.current.get(controller) || statusOf(item) !== 'uploading') {
        controller.abort();
        controllers.current.delete(fileId);
      }
    }
  }, [files]);

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

  useImperativeHandle(ref, () => ({ addFiles: add }));

  async function start(item: QueuedFile) {
    if (!transport || disabled || statusOf(item) === 'uploading') return;
    controllers.current.get(item.id)?.abort();
    const controller = new AbortController();
    uploadFiles.current.set(controller, item.file);
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
    <div onDragOver={event => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={event => { event.preventDefault(); event.stopPropagation(); setDragging(false); add(Array.from(event.dataTransfer.files)); }} className={cx(variant === 'compact' ? 'flex min-w-0 flex-wrap items-center gap-[var(--rui-content-gap-sm)]' : 'flex flex-col items-center justify-center gap-[var(--rui-content-gap)] rounded-xl border border-dashed border-border bg-muted/20 p-[var(--rui-empty-padding)] text-center', dragging && 'border-ring bg-muted', disabled && 'cursor-not-allowed')}>
      {variant === 'default' && <Upload className="size-6 text-muted-foreground" aria-hidden="true" />}<div className="min-w-0 flex-1">{variant === 'default' && <h3 className="font-medium">{disabled ? '暂时无法添加文件' : '拖放文件到此处'}</h3>}<p id={`${id}-hint`} className="text-xs text-muted-foreground">每个文件不超过 {formatBytes(maxSize)}，最多 {maxFiles} 个。{accept && `支持 ${accept}。`}{variant === 'default' && (transport ? '上传由宿主 transport 处理。' : '文件只加入本地队列。')}</p></div>
      <input id={id} ref={inputRef} type="file" multiple accept={accept} disabled={disabled} aria-label={label} aria-describedby={`${id}-hint`} className="sr-only" tabIndex={-1} onChange={event => { add(Array.from(event.target.files ?? [])); event.target.value = ''; }} />
      <Button type="button" variant="outline" size={variant === 'compact' ? 'sm' : 'default'} disabled={disabled} onClick={() => inputRef.current?.click()}>{label}</Button>
    </div>
    {errors.length > 0 && <div role="alert" className="rounded-lg bg-destructive/5 p-[var(--rui-content-padding)] text-xs text-destructive"><ul className="space-y-1">{errors.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}</ul></div>}
    <ul className="divide-y divide-border rounded-md border border-border">{files.map(item => {
      const status = statusOf(item); const progress = progressValue(item.progress);
      return <li key={item.id} data-file-id={item.id} data-status={status} className="flex min-w-0 items-center gap-[var(--rui-content-gap-sm)] px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]">
        <FileThumbnail file={item.file} enabled={preview} />
        <span className="min-w-0 flex-1"><span className="block truncate" title={item.file.name}>{item.file.name}</span><span className={cx('text-xs', status === 'error' ? 'text-destructive' : 'text-muted-foreground')}>{formatBytes(item.file.size)} · {item.error || (variant === 'compact' && !transport && status === 'queued' ? '本地文件' : statusLabel[status])}{status === 'uploading' && ` ${Math.round(progress)}%`}</span>
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
