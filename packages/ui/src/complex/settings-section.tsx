import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './shared.js';

export interface SettingsSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function SettingsSection({ title, description, actions, children, className, ...props }: SettingsSectionProps) {
  const titleId = useId();
  return <section {...props} aria-labelledby={titleId} data-slot="settings-section" className={cx('space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><h2 id={titleId} className="font-medium">{title}</h2>{description && <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">{description}</p>}</div>
      {actions}
    </header>
    <div className="divide-y divide-border rounded-lg border border-border">{children}</div>
  </section>;
}

export interface SettingsRowProps { label: string; description?: string; children: ReactNode; className?: string; }
export function SettingsRow({ label, description, children, className }: SettingsRowProps) {
  return <div className={cx('flex flex-wrap items-center justify-between gap-[var(--rui-content-gap)] px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]', className)}>
    <div className="min-w-0 flex-1"><h3 className="text-sm font-medium">{label}</h3>{description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>}</div>
    <div className="flex max-w-full shrink-0 items-center gap-2 [&>span>svg]:inline-block [&>span>svg]:align-middle">{children}</div>
  </div>;
}
