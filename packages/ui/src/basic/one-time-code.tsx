import { useEffect, useRef, useState } from 'react';
import { Copy, LockKeyhole } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Spinner } from '../primitives/spinner.js';
import { cn } from '../lib/utils.js';

export interface OneTimeCodeProps {
  label: string;
  code?: string | null;
  /** Supplied by the host; this component does not calculate or refresh codes. */
  remainingSeconds?: number;
  locked?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** The host owns clipboard access. No clipboard write occurs without this callback. */
  onCopy?: (code: string) => void | Promise<void>;
  lockedLabel?: string;
  loadingLabel?: string;
  expiredLabel?: string;
  emptyLabel?: string;
  copyLabel?: string;
  copiedLabel?: string;
  copyErrorLabel?: string;
  className?: string;
}

/** Display a host-owned one-time code without putting locked or expired values in the DOM. */
export function OneTimeCode({ label, code, remainingSeconds, locked = false, loading = false, disabled = false, onCopy,
  lockedLabel = '解锁后可查看', loadingLabel = '正在刷新', expiredLabel = '已过期，等待刷新', emptyLabel = '暂无验证码',
  copyLabel = `复制${label}`, copiedLabel = '已复制', copyErrorLabel = '复制失败，请重试', className }: OneTimeCodeProps) {
  const [copying, setCopying] = useState(false);
  const [feedback, setFeedback] = useState<'copied' | 'error' | null>(null);
  const inFlight = useRef(false);
  const revision = useRef(0);
  const current = useRef({ code, locked, loading, remainingSeconds });
  current.current = { code, locked, loading, remainingSeconds };
  const hasTime = remainingSeconds !== undefined;
  const expired = hasTime && (!Number.isFinite(remainingSeconds) || remainingSeconds <= 0);
  const available = !locked && !loading && !expired && Boolean(code);
  useEffect(() => { revision.current += 1; setFeedback(null); }, [code, locked, loading, expired]);

  async function copy() {
    if (!available || disabled || !onCopy || !code || inFlight.current) return;
    const copiedCode = code;
    const copiedRevision = revision.current;
    inFlight.current = true;
    setCopying(true);
    setFeedback(null);
    const stillCurrent = () => revision.current === copiedRevision && current.current.code === copiedCode && !current.current.locked && !current.current.loading
      && (current.current.remainingSeconds === undefined || Number.isFinite(current.current.remainingSeconds) && current.current.remainingSeconds > 0);
    try {
      await onCopy(copiedCode);
      if (stillCurrent()) setFeedback('copied');
    } catch {
      if (stillCurrent()) setFeedback('error');
    } finally {
      inFlight.current = false;
      setCopying(false);
    }
  }

  return <div role="group" aria-label={label} data-slot="one-time-code" className={cn('grid gap-1 text-sm', className)}>
    <div className="flex min-w-0 items-center gap-2">
      {available ? <>
        <code className="break-all font-mono text-sm tabular-nums">{code}</code>
        {hasTime && <span className="text-xs tabular-nums text-muted-foreground" aria-label={`剩余 ${Math.ceil(remainingSeconds!)} 秒`}>{Math.ceil(remainingSeconds!)}s</span>}
        {onCopy && <Button variant="ghost" size="icon-xs" aria-label={copyLabel} title={copyLabel} disabled={disabled || copying} aria-busy={copying || undefined} onClick={() => void copy()}>{copying ? <Spinner /> : <Copy aria-hidden="true" />}</Button>}
      </> : <span className="inline-flex items-center gap-2 text-muted-foreground">{locked && <LockKeyhole className="size-3.5" aria-hidden="true" />}{locked ? lockedLabel : loading ? loadingLabel : expired ? expiredLabel : emptyLabel}</span>}
    </div>
    {available && feedback && <span role="status" className={cn('text-xs', feedback === 'error' ? 'text-destructive' : 'text-muted-foreground')}>{feedback === 'error' ? copyErrorLabel : copiedLabel}</span>}
  </div>;
}
