import { useEffect, useId, useState, type ReactNode } from 'react';
import { Shield } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Checkbox } from '../../primitives/checkbox.js';
import { Label } from '../../primitives/label.js';
import { cn } from '../../lib/utils.js';
import { formatClock } from '../shared.js';

export type ApprovalStatus = 'pending' | 'approved' | 'denied';
export type ApprovalCardProps = {
  title: string;
  description?: ReactNode;
  risk?: 'low' | 'medium' | 'high';
  icon?: ReactNode;
  details?: { label: string; value: ReactNode }[];
  preview?: ReactNode;
  children?: ReactNode;
  status?: ApprovalStatus;
  defaultStatus?: ApprovalStatus;
  onApprove?: (payload: { always: boolean }) => void | Promise<void>;
  onDeny?: (payload: { reason: 'user' | 'timeout' }) => void;
  onEdit?: () => void;
  expiresIn?: number;
  onExpire?: () => void;
  allowAlways?: boolean;
  alwaysLabel?: string;
  approveLabel?: string;
  denyLabel?: string;
  editLabel?: string;
  shortcuts?: boolean;
  label?: ReactNode;
  actions?: 'card' | 'tray';
  className?: string;
};

const riskLabel = { low: '低风险', medium: '中风险', high: '高风险' };

/** Recreated from public Approval Card docs. */
export function ApprovalCard({
  title,
  description,
  risk,
  icon,
  details,
  preview,
  children,
  status,
  defaultStatus = 'pending',
  onApprove,
  onDeny,
  onEdit,
  expiresIn,
  onExpire,
  allowAlways = true,
  alwaysLabel = '始终允许此操作',
  approveLabel = '批准',
  denyLabel = '拒绝',
  editLabel = '编辑',
  shortcuts = true,
  label,
  actions = 'card',
  className,
}: ApprovalCardProps) {
  const titleId = useId();
  const [internal, setInternal] = useState(defaultStatus);
  const [always, setAlways] = useState(false);
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState(expiresIn);
  const [paused, setPaused] = useState(false);
  const current = status ?? internal;
  const previewNode = preview ?? children;

  useEffect(() => {
    if (current !== 'pending' || remaining == null || paused) return;
    if (remaining <= 0) {
      onExpire?.();
      onDeny?.({ reason: 'timeout' });
      if (status === undefined) setInternal('denied');
      return;
    }
    const timer = window.setTimeout(
      () => setRemaining((value) => (value == null ? value : value - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [current, remaining, paused, onExpire, onDeny, status]);

  async function approve() {
    setBusy(true);
    try {
      await onApprove?.({ always });
      if (status === undefined) setInternal('approved');
    } finally {
      setBusy(false);
    }
  }

  function deny(reason: 'user' | 'timeout') {
    onDeny?.({ reason });
    if (status === undefined) setInternal('denied');
  }

  const buttons = (
    <Inline className="justify-end">
      {onEdit ? (
        <Button type="button" size="sm" variant="ghost" onClick={onEdit} disabled={busy}>
          {editLabel}
        </Button>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-keyshortcuts="Escape"
        disabled={busy}
        onClick={() => deny('user')}
      >
        {denyLabel}
        {shortcuts ? (
          <kbd className="text-[length:var(--rui-font-caption)] text-muted-foreground">Esc</kbd>
        ) : null}
      </Button>
      <Button
        type="button"
        size="sm"
        aria-keyshortcuts="Control+Enter Meta+Enter"
        disabled={busy}
        aria-busy={busy}
        onClick={() => void approve()}
      >
        {approveLabel}
        {shortcuts ? (
          <kbd className="text-[length:var(--rui-font-caption)] text-muted-foreground">⌘↵</kbd>
        ) : null}
      </Button>
    </Inline>
  );

  if (current !== 'pending') {
    return (
      <section
        role="status"
        className={cn(
          'rounded-[var(--rui-radius-surface)] bg-muted p-[var(--rui-content-padding)]',
          className,
        )}
      >
        {current === 'approved' ? `已批准：${title}` : `已拒绝：${title}`}
      </section>
    );
  }

  return (
    <section
      role="group"
      aria-labelledby={titleId}
      aria-busy={busy}
      className={cn(
        'rounded-[var(--rui-radius-surface)] bg-muted p-[var(--rui-content-gap-sm)]',
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault();
          void approve();
        }
        if (event.key === 'Escape') deny('user');
      }}
    >
      {label ? (
        <Text as="p" variant="caption" tone="muted" className="px-1 pb-1">
          {label}
        </Text>
      ) : null}
      <Stack className="rounded-[var(--rui-radius)] border border-border bg-card p-[var(--rui-content-padding)]">
        <Inline>
          <span className="text-muted-foreground" aria-hidden="true">
            {icon ?? <Shield className="size-4" />}
          </span>
          <Stack gap="none" className="min-w-0 flex-1">
            <Heading id={titleId} size="item">
              {title}
            </Heading>
            {description ? (
              <Text variant="caption" tone="muted">
                {description}
              </Text>
            ) : null}
          </Stack>
          {risk ? (
            <Badge variant={risk === 'high' ? 'destructive' : 'secondary'}>{riskLabel[risk]}</Badge>
          ) : null}
        </Inline>
        {previewNode}
        {details?.length ? (
          <dl className="grid gap-1">
            {details.map((item) => (
              <div
                key={item.label}
                className="flex justify-between gap-2 text-[length:var(--rui-font-caption)]"
              >
                <dt className="text-muted-foreground">{item.label}</dt>
                <dd className="min-w-0 truncate">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {allowAlways ? (
          <Inline>
            <Checkbox
              id={`${titleId}-always`}
              checked={always}
              onCheckedChange={(value) => setAlways(value === true)}
            />
            <Label htmlFor={`${titleId}-always`}>{alwaysLabel}</Label>
          </Inline>
        ) : null}
        {remaining != null ? (
          <Text variant="caption" tone="muted" className={cn(remaining <= 10 && 'text-warning')}>
            {paused
              ? `倒计时已暂停 · ${formatClock(remaining)}`
              : `将在 ${formatClock(remaining)} 后过期`}
          </Text>
        ) : null}
        {actions === 'card' ? buttons : null}
      </Stack>
      {actions === 'tray' ? <div className="pt-[var(--rui-content-gap-sm)]">{buttons}</div> : null}
    </section>
  );
}
