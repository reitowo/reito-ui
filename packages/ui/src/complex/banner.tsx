import { useState, type ReactNode } from 'react';
import { CircleCheck, CircleX, Info, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../primitives/alert.js';
import { Button } from '../primitives/button.js';
import { cx } from './shared.js';

export type BannerTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type BannerLive = 'off' | 'polite' | 'assertive';

export interface BannerAction {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface BannerProps {
  title: ReactNode;
  description?: ReactNode;
  tone?: BannerTone;
  icon?: ReactNode | false;
  action?: BannerAction;
  onDismiss?: () => void;
  dismissLabel?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  live?: BannerLive;
  label?: string;
  className?: string;
}

const toneClass: Record<BannerTone, string> = {
  neutral: 'border-border bg-card',
  info: 'border-accent/30 bg-accent-soft',
  success: 'border-success/30 bg-success-soft',
  warning: 'border-warning/30 bg-warning-soft',
  danger: 'border-destructive/30 bg-destructive-soft',
};

const iconClass: Record<BannerTone, string> = {
  neutral: 'text-muted-foreground',
  info: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
};

const defaultIcon: Record<BannerTone, ReactNode> = {
  neutral: <Info aria-hidden="true" />,
  info: <Info aria-hidden="true" />,
  success: <CircleCheck aria-hidden="true" />,
  warning: <TriangleAlert aria-hidden="true" />,
  danger: <CircleX aria-hidden="true" />,
};

/** A compact, dismissible application notice composed from the shared Alert surface. */
export function Banner({
  title,
  description,
  tone = 'neutral',
  icon,
  action,
  onDismiss,
  dismissLabel = '关闭通知',
  open,
  defaultOpen = true,
  onOpenChange,
  live = 'off',
  label = '通知',
  className,
}: BannerProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const currentOpen = open ?? internalOpen;
  if (!currentOpen) return null;
  const visibleIcon = icon === false ? null : icon ?? defaultIcon[tone];
  const role = live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : 'region';

  function dismiss() {
    if (open === undefined) setInternalOpen(false);
    onDismiss?.();
    onOpenChange?.(false);
  }

  return <Alert
    role={role}
    aria-label={role === 'region' ? label : undefined}
    data-slot="banner"
    data-tone={tone}
    className={cx(
      'grid items-start gap-[var(--rui-content-gap-sm)] px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]',
      visibleIcon ? 'grid-cols-[auto_minmax(0,1fr)_auto]' : 'grid-cols-[minmax(0,1fr)_auto]',
      toneClass[tone],
      className,
    )}
  >
    {visibleIcon && <span className={cx('mt-[var(--rui-space-1)] [&_svg]:size-4', iconClass[tone])}>{visibleIcon}</span>}
    <div className="min-w-0">
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription className="text-pretty">{description}</AlertDescription>}
    </div>
    {(action || onDismiss) && <div className="flex min-w-0 flex-wrap items-center justify-end gap-[var(--rui-space-1)]">
      {action && <Button type="button" size="xs" variant="ghost" disabled={action.disabled || action.loading} aria-busy={action.loading || undefined} onClick={action.onSelect}>
        {action.loading && <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />}
        {action.label}
      </Button>}
      {onDismiss && <Button type="button" size="icon-xs" variant="ghost" aria-label={dismissLabel} title={dismissLabel} onClick={dismiss}><X aria-hidden="true" /></Button>}
    </div>}
  </Alert>;
}
