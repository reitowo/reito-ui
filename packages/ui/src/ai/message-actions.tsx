import { useEffect, useRef, useState } from 'react';
import { Check, Copy, LoaderCircle, Pencil, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { classes } from './shared.js';

export type MessageFeedback = 'up' | 'down' | null;
export interface MessageActionsProps {
  text: string;
  onCopy?: (text: string) => void | Promise<void>;
  onRetry?: () => void | Promise<void>;
  onEdit?: () => void | Promise<void>;
  feedback?: MessageFeedback;
  onFeedbackChange?: (feedback: MessageFeedback) => void | Promise<void>;
  copyable?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/** Copy receives the caller's text, never rendered DOM or sibling controls. */
export function MessageActions({ text, onCopy, onRetry, onEdit, feedback, onFeedbackChange, copyable = true, disabled = false, label = '消息操作', className }: MessageActionsProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [internalFeedback, setInternalFeedback] = useState<MessageFeedback>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const latestText = useRef(text);
  latestText.current = text;
  const selected = feedback === undefined ? internalFeedback : feedback;
  useEffect(() => { setMessage(''); setError(''); setInternalFeedback(null); }, [text]);
  async function act(action: string, callback: () => void | Promise<void>, success: string) {
    if (disabled || inFlight.current) return;
    const actionText = text;
    inFlight.current = true;
    setBusy(action); setMessage(''); setError('');
    try {
      await callback();
      if (latestText.current === actionText) setMessage(success);
    } catch (reason) {
      if (latestText.current === actionText) setError(reason instanceof Error && reason.message ? reason.message : '操作失败，请重试。');
    } finally { inFlight.current = false; setBusy(null); }
  }
  function rate(next: Exclude<MessageFeedback, null>) {
    const nextFeedback = selected === next ? null : next;
    const ratedText = text;
    void act(next, async () => { await onFeedbackChange?.(nextFeedback); if (feedback === undefined && latestText.current === ratedText) setInternalFeedback(nextFeedback); }, nextFeedback ? '反馈已记录' : '反馈已撤回');
  }
  const isDisabled = disabled || busy !== null;
  return <div className={classes('grid min-w-0 gap-1.5', className)}>
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1">
      {copyable && <Button type="button" variant="ghost" size="icon-sm" disabled={isDisabled || !text} aria-label="复制消息" title="复制消息" onClick={() => { void act('copy', () => onCopy ? onCopy(text) : navigator.clipboard.writeText(text), '消息已复制'); }}>{busy === 'copy' ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : message === '消息已复制' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}</Button>}
      {onRetry && <Button type="button" variant="ghost" size="icon-sm" disabled={isDisabled} aria-label="重试消息" title="重试消息" onClick={() => { void act('retry', onRetry, '重试请求已提交'); }}>{busy === 'retry' ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <RotateCcw aria-hidden="true" />}</Button>}
      {onEdit && <Button type="button" variant="ghost" size="icon-sm" disabled={isDisabled} aria-label="编辑消息" title="编辑消息" onClick={() => { void act('edit', onEdit, '编辑请求已提交'); }}><Pencil aria-hidden="true" /></Button>}
      {onFeedbackChange && <><Button type="button" variant="ghost" size="icon-sm" disabled={isDisabled} aria-label="有帮助" title="有帮助" aria-pressed={selected === 'up'} className={selected === 'up' ? 'bg-muted' : undefined} onClick={() => rate('up')}><ThumbsUp aria-hidden="true" /></Button><Button type="button" variant="ghost" size="icon-sm" disabled={isDisabled} aria-label="没有帮助" title="没有帮助" aria-pressed={selected === 'down'} className={selected === 'down' ? 'bg-muted' : undefined} onClick={() => rate('down')}><ThumbsDown aria-hidden="true" /></Button></>}
    </div>
    {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : <p role="status" className="text-xs text-muted-foreground">{busy ? '正在处理操作…' : message}</p>}
  </div>;
}
