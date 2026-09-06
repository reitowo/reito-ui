import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { classes } from './shared.js';

export interface MessageBranchProps {
  /** Zero-based index, controlled by the caller. */
  index: number;
  count: number;
  onIndexChange: (index: number) => void;
  disabled?: boolean;
  label?: string;
  contentId?: string;
  className?: string;
}

export function MessageBranch({ index, count, onIndexChange, disabled = false, label = '消息分支', contentId, className }: MessageBranchProps) {
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const current = Number.isFinite(index) ? Math.max(0, Math.min(total - 1, Math.floor(index))) : 0;
  function select(next: number) { if (!disabled && total > 0 && next >= 0 && next < total && next !== current) onIndexChange(next); }
  return <div role="group" aria-label={label} tabIndex={disabled || total < 2 ? -1 : 0} className={classes('inline-flex w-fit items-center gap-1 rounded-md text-xs text-muted-foreground focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:outline-ring', className)} onKeyDown={event => {
    if (disabled || event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return;
    const next = event.key === 'ArrowLeft' ? current - 1 : event.key === 'ArrowRight' ? current + 1 : event.key === 'Home' ? 0 : event.key === 'End' ? total - 1 : undefined;
    if (next !== undefined) { event.preventDefault(); select(next); }
  }}>
    <Button type="button" size="icon-sm" variant="ghost" aria-label="上一分支" aria-controls={contentId} disabled={disabled || total < 2 || current === 0} onClick={() => select(current - 1)}><ChevronLeft aria-hidden="true" /></Button>
    <span role="status" aria-label="当前分支" className="min-w-10 text-center tabular-nums">{total ? current + 1 : 0} / {total}</span>
    <Button type="button" size="icon-sm" variant="ghost" aria-label="下一分支" aria-controls={contentId} disabled={disabled || total < 2 || current >= total - 1} onClick={() => select(current + 1)}><ChevronRight aria-hidden="true" /></Button>
  </div>;
}
