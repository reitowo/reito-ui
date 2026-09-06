import { useRef, useState } from 'react';
import { Check, History, LoaderCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../primitives/alert-dialog.js';
import { Button } from '../primitives/button.js';
import { classes } from './shared.js';

export type CheckpointStatus = 'pending' | 'restoring' | 'success' | 'error';
export interface CheckpointFile { path: string; status: 'added' | 'modified' | 'deleted' }
export interface CheckpointProps {
  title: string;
  description?: string;
  files: CheckpointFile[];
  onRestore: () => void | Promise<void>;
  status?: CheckpointStatus;
  error?: string;
  disabled?: boolean;
  createdLabel?: string;
  confirmDescription?: string;
  className?: string;
}
const fileLabels = { added: '新增', modified: '修改', deleted: '删除' };

/** Restoring is entirely delegated to the caller. This component never writes files. */
export function Checkpoint({ title, description, files, onRestore, status, error, disabled = false, createdLabel, confirmDescription = '确认恢复到此检查点？恢复范围和执行行为由当前应用提供。', className }: CheckpointProps) {
  const [open, setOpen] = useState(false);
  const [internalStatus, setInternalStatus] = useState<CheckpointStatus>('pending');
  const [internalError, setInternalError] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const currentStatus = busy ? 'restoring' : status ?? internalStatus;
  const restoring = currentStatus === 'restoring';
  const errorMessage = error ?? internalError;
  async function restore() {
    if (disabled || restoring || inFlight.current) return;
    inFlight.current = true; setBusy(true); setInternalError(''); setInternalStatus('restoring');
    try { await onRestore(); setInternalStatus('success'); setOpen(false); }
    catch (reason) { setInternalStatus('error'); setInternalError(reason instanceof Error && reason.message ? reason.message : '恢复失败，检查点内容已保留，请重试。'); }
    finally { inFlight.current = false; setBusy(false); }
  }
  return <section aria-label={`检查点：${title}`} className={classes('grid min-w-0 gap-[var(--rui-content-gap)] rounded-lg border p-[var(--rui-content-padding)]', className)}>
    <div className="flex min-w-0 gap-2"><History aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div className="min-w-0 flex-1"><h3 className="break-words text-sm font-medium">{title}</h3>{description && <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">{description}</p>}{createdLabel && <p className="mt-1 text-xs text-muted-foreground">{createdLabel}</p>}</div><span className="shrink-0 text-xs text-muted-foreground">{files.length} 个文件</span></div>
    {files.length ? <ul aria-label="检查点文件变更" className="grid gap-1.5">{files.map(file => <li key={file.path} className="flex min-w-0 items-start gap-2 text-xs"><span className="shrink-0 text-muted-foreground">{fileLabels[file.status]}</span><code className="min-w-0 break-all font-mono">{file.path}</code></li>)}</ul> : <p className="text-xs text-muted-foreground">此检查点没有文件变更</p>}
    {currentStatus === 'error' && !open && <p role="alert" className="break-words text-xs text-destructive">{errorMessage || '恢复失败，检查点内容已保留。'}</p>}
    <div className="flex flex-wrap items-center justify-between gap-2"><p role="status" className="flex items-center gap-1.5 text-xs text-muted-foreground">{restoring ? <><LoaderCircle aria-hidden="true" className="size-3 motion-safe:animate-spin" />正在恢复…</> : currentStatus === 'success' ? <><Check aria-hidden="true" className="size-3" />恢复回调已完成</> : '可恢复检查点'}</p><AlertDialog open={open} onOpenChange={next => { if (!restoring) setOpen(next); }}><AlertDialogTrigger render={<Button type="button" variant="outline" size="sm" disabled={disabled || restoring} />}>恢复检查点</AlertDialogTrigger><AlertDialogContent className="gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]"><AlertDialogHeader><AlertDialogTitle>恢复到“{title}”？</AlertDialogTitle><AlertDialogDescription>{confirmDescription}</AlertDialogDescription></AlertDialogHeader><p className="text-sm text-muted-foreground">检查点包含 {files.length} 个文件变更。{createdLabel ? ` ${createdLabel}` : ''}</p>{currentStatus === 'error' && <p role="alert" className="text-sm text-destructive">{errorMessage || '恢复失败，检查点内容已保留，请重试。'}</p>}{restoring && <p role="status" className="text-sm text-muted-foreground">正在等待恢复回调完成…</p>}<AlertDialogFooter className="-mx-[var(--rui-content-padding)] -mb-[var(--rui-content-padding)] gap-[var(--rui-content-gap-sm)] p-[var(--rui-content-padding)]"><AlertDialogCancel disabled={restoring}>保留当前状态</AlertDialogCancel><AlertDialogAction disabled={disabled || restoring} onClick={() => { void restore(); }}>{restoring ? '正在恢复…' : '确认恢复'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>
  </section>;
}

