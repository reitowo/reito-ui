import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './shared.js';

export interface SettingsSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Plain groups keep row separators without nesting another bordered panel. */
  variant?: 'outlined' | 'plain';
}

export function SettingsSection({ title, description, actions, variant = 'outlined', children, className, ...props }: SettingsSectionProps) {
  const titleId = useId();
  return <section {...props} aria-labelledby={titleId} data-slot="settings-section" data-variant={variant} className={cx('min-w-0 space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><h2 id={titleId} className="font-medium">{title}</h2>{description && <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">{description}</p>}</div>
      {actions}
    </header>
    <div data-slot="settings-section-content" className={cx('divide-y divide-border', variant === 'outlined' ? 'rounded-lg border border-border' : '[&>[data-slot=settings-row]]:px-0')}>{children}</div>
  </section>;
}

export interface SettingsRowProps {
  label: string;
  description?: string;
  /** Associate the visible label with one labelable control. Omit for groups. */
  htmlFor?: string;
  /** For a group's aria-labelledby. */
  labelId?: string;
  /** For the control or group's aria-describedby. */
  descriptionId?: string;
  /** Vertical places expanded choices or long controls below the label. */
  orientation?: 'horizontal' | 'vertical';
  children: ReactNode;
  className?: string;
}
export function SettingsRow({ label, description, htmlFor, labelId, descriptionId, orientation = 'horizontal', children, className }: SettingsRowProps) {
  return <div data-slot="settings-row" data-orientation={orientation} className={cx('flex gap-[var(--rui-content-gap)] px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]', orientation === 'vertical' ? 'flex-col items-stretch' : 'flex-wrap items-center justify-between', className)}>
    <div className="min-w-0 flex-1">{htmlFor ? <label id={labelId} htmlFor={htmlFor} className="text-sm font-medium">{label}</label> : <h3 id={labelId} className="text-sm font-medium">{label}</h3>}{description && <p id={descriptionId} className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>}</div>
    <div data-slot="settings-row-control" className={cx('flex min-w-0 max-w-full items-center gap-2 [&>span>svg]:inline-block [&>span>svg]:align-middle', orientation === 'vertical' ? 'w-full' : 'shrink-0')}>{children}</div>
  </div>;
}
