import type { ReactNode } from 'react';
import { LoaderCircle, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../primitives/avatar.js';
import { Button } from '../primitives/button.js';
import { cx } from './shared.js';

export type UserInfoSize = 'sm' | 'default' | 'lg';
export type UserInfoVariant = 'plain' | 'muted' | 'outline';
export type UserInfoStatusTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface UserInfoAction {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'ghost' | 'outline' | 'destructive';
  onSelect: () => void;
}

export interface UserInfoProps {
  name: ReactNode;
  description?: ReactNode;
  avatarSrc?: string;
  avatarAlt?: string;
  fallback?: ReactNode;
  status?: ReactNode;
  statusTone?: UserInfoStatusTone;
  actions?: readonly UserInfoAction[];
  actionsLabel?: string;
  showActionLabels?: boolean;
  size?: UserInfoSize;
  variant?: UserInfoVariant;
  disabled?: boolean;
  className?: string;
}

const statusToneClass: Record<UserInfoStatusTone, string> = {
  neutral: 'bg-muted-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
};

const avatarSize: Record<UserInfoSize, 'sm' | 'default' | 'lg'> = {
  sm: 'sm',
  default: 'default',
  lg: 'lg',
};

function initials(value: ReactNode) {
  if (typeof value !== 'string') return <UserRound aria-hidden="true" className="size-3.5" />;
  const parts = value.trim().split(/\s+/u).filter(Boolean);
  if (!parts.length) return <UserRound aria-hidden="true" className="size-3.5" />;
  return parts.slice(0, 2).map(part => part.at(0) ?? '').join('').toLocaleUpperCase();
}

/** A compact, non-interactive identity row with separately accessible host actions. */
export function UserInfo({
  name,
  description,
  avatarSrc,
  avatarAlt,
  fallback,
  status,
  statusTone = 'neutral',
  actions = [],
  actionsLabel = '用户操作',
  showActionLabels = false,
  size = 'default',
  variant = 'plain',
  disabled = false,
  className,
}: UserInfoProps) {
  const nameText = typeof name === 'string' ? name : undefined;
  const descriptionText = typeof description === 'string' ? description : undefined;
  return (
    <div
      data-slot="user-info"
      data-size={size}
      data-variant={variant}
      aria-disabled={disabled || undefined}
      className={cx(
        'group/user-info flex min-w-0 items-center gap-[var(--rui-content-gap-sm)] rounded-lg px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-sm',
        'data-[variant=muted]:bg-muted/50 data-[variant=outline]:border data-[variant=outline]:border-border',
        'data-[size=sm]:gap-[var(--rui-space-2)] data-[size=lg]:gap-[var(--rui-content-gap)]',
        'aria-disabled:opacity-[var(--rui-opacity-disabled)]',
        className,
      )}
    >
      <Avatar size={avatarSize[size]} role="img" aria-label={avatarAlt ?? nameText ?? '用户头像'}>
        {avatarSrc && <AvatarImage src={avatarSrc} alt="" />}
        <AvatarFallback>{fallback ?? initials(name)}</AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 flex-1 gap-[var(--rui-space-1)] group-data-[size=sm]/user-info:gap-0">
        <div className="min-w-0 truncate font-medium" title={nameText}>{name}</div>
        {(description || status) && <div className="flex min-w-0 items-center gap-[var(--rui-space-2)] text-xs text-muted-foreground">
          {description && <span className="min-w-0 truncate" title={descriptionText}>{description}</span>}
          {status && <span className="inline-flex shrink-0 items-center gap-[var(--rui-space-1)]">
            <span aria-hidden="true" className={cx('size-2 rounded-full', statusToneClass[statusTone])} />
            <span>{status}</span>
          </span>}
        </div>}
      </div>
      {actions.length > 0 && <div role="group" aria-label={actionsLabel} className="flex shrink-0 items-center gap-[var(--rui-space-1)]">
        {actions.map(action => {
          const busy = Boolean(action.loading);
          return <Button
            key={action.id}
            type="button"
            size={showActionLabels || !action.icon ? 'xs' : 'icon-xs'}
            variant={action.variant ?? 'ghost'}
            disabled={disabled || action.disabled || busy}
            aria-label={showActionLabels || !action.icon ? undefined : action.label}
            aria-busy={busy || undefined}
            title={action.label}
            onClick={action.onSelect}
          >
            {busy ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : action.icon}
            {(showActionLabels || !action.icon) && action.label}
          </Button>;
        })}
      </div>}
    </div>
  );
}
