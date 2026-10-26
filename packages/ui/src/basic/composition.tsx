import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../lib/utils.js';

export type ContentGap = 'none' | 'small' | 'normal' | 'section';
const gaps: Record<ContentGap, string> = {
  none: 'gap-0',
  small: 'gap-[var(--rui-content-gap-sm)]',
  normal: 'gap-[var(--rui-content-gap)]',
  section: 'gap-[var(--rui-section-gap)]',
};

/** Content flow owns spacing between children; children own their internal spacing. */
export function Stack({
  gap = 'normal',
  inset = false,
  className,
  ...props
}: ComponentProps<'div'> & { gap?: ContentGap; inset?: boolean }) {
  return (
    <div
      data-slot="stack"
      className={cn(
        'flex min-w-0 flex-col',
        gaps[gap],
        inset && 'p-[var(--rui-content-padding)]',
        className,
      )}
      {...props}
    />
  );
}

/** Actions and metadata wrap as a group instead of stretching individual controls. */
export function Inline({
  gap = 'small',
  align = 'center',
  className,
  ...props
}: ComponentProps<'div'> & { gap?: ContentGap; align?: 'center' | 'baseline' | 'end' }) {
  const alignment = { center: 'items-center', baseline: 'items-baseline', end: 'items-end' };
  return (
    <div
      data-slot="inline"
      className={cn(
        'flex min-w-0 flex-wrap',
        gaps[gap],
        alignment[align],
        '*:data-[slot=field]:flex-1 *:data-[slot=field]:min-w-[min(100%,var(--rui-container-3xs))]',
        className,
      )}
      {...props}
    />
  );
}

/** Columns collapse according to their available width, including inside a narrow pane. */
export function Grid({
  minColumnWidth = 'sm',
  gap = 'normal',
  className,
  style,
  ...props
}: ComponentProps<'div'> & { minColumnWidth?: 'xs' | 'sm' | 'md'; gap?: ContentGap }) {
  const widths = {
    xs: 'var(--rui-container-xs)',
    sm: 'var(--rui-container-sm)',
    md: 'var(--rui-container-md)',
  };
  return (
    <div
      data-slot="layout-grid"
      className={cn('grid min-w-0 items-start', gaps[gap], className)}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${widths[minColumnWidth]}), 1fr))`,
        ...style,
      }}
      {...props}
    />
  );
}

const textRoles = {
  body: 'text-[length:var(--rui-text-md)] leading-[var(--rui-line-height)]',
  interface: 'text-[length:var(--rui-font-interface)] leading-[var(--rui-line-interface)]',
  caption: 'text-[length:var(--rui-font-caption)] leading-[var(--rui-line-caption)]',
  reading: 'text-[length:var(--rui-font-reading)] leading-[var(--rui-line-reading)]',
};

/** Text roles are independent of HTML semantics and retain full content by default. */
export function Text({
  as: Tag = 'p',
  variant = 'body',
  tone = 'default',
  className,
  ...props
}: ComponentProps<'p'> & {
  as?: 'p' | 'span';
  variant?: keyof typeof textRoles;
  tone?: 'default' | 'muted';
}) {
  return (
    <Tag
      data-slot="text"
      className={cn(
        'm-0 min-w-0 break-words font-normal',
        textRoles[variant],
        tone === 'muted' ? 'text-muted-foreground' : 'text-foreground',
        className,
      )}
      {...props}
    />
  );
}

/** Heading level describes the document; size describes the visual hierarchy. */
export function Heading({
  level = 2,
  size = 'section',
  className,
  ...props
}: ComponentProps<'h2'> & { level?: 1 | 2 | 3 | 4; size?: 'page' | 'section' | 'item' }) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
  const sizes = {
    page: 'text-[length:var(--rui-text-xl)] leading-[var(--rui-line-heading)] font-semibold',
    section: 'text-[length:var(--rui-text-md)] leading-[var(--rui-line-interface)] font-medium',
    item: 'text-[length:var(--rui-font-interface)] leading-[var(--rui-line-interface)] font-medium',
  };
  return (
    <Tag
      data-slot="heading"
      className={cn('m-0 min-w-0 break-words', sizes[size], className)}
      {...props}
    />
  );
}

type HeaderContent = { title: ReactNode; description?: ReactNode; actions?: ReactNode };

/** A page heading keeps actions adjacent and wraps them when space is limited. */
export function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: Omit<ComponentProps<'header'>, 'title'> & HeaderContent) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        'flex min-w-0 flex-wrap items-center justify-between gap-[var(--rui-content-gap)]',
        className,
      )}
      {...props}
    >
      <Stack gap="small">
        <Heading level={1} size="page">
          {title}
        </Heading>
        {description && (
          <Text variant="interface" tone="muted">
            {description}
          </Text>
        )}
      </Stack>
      {actions && <Inline>{actions}</Inline>}
    </header>
  );
}

/** A section has one inset owner. Flush bodies accept lists, tables and Empty directly. */
export function Panel({
  title,
  description,
  actions,
  footer,
  flush = false,
  children,
  className,
  ...props
}: Omit<ComponentProps<'section'>, 'title'> &
  HeaderContent & { footer?: ReactNode; flush?: boolean }) {
  const titleId = useId();
  return (
    <section
      data-slot="panel"
      aria-labelledby={titleId}
      className={cn(
        'min-w-0 overflow-hidden rounded-[var(--rui-radius-surface)] border border-border bg-card text-card-foreground',
        className,
      )}
      {...props}
    >
      <header
        data-slot="panel-header"
        className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)] border-b border-border p-[var(--rui-content-padding)]"
      >
        <Stack gap="small">
          <Heading id={titleId}>{title}</Heading>
          {description && (
            <Text variant="interface" tone="muted">
              {description}
            </Text>
          )}
        </Stack>
        {actions && <Inline>{actions}</Inline>}
      </header>
      <div
        data-slot="panel-body"
        data-flush={flush || undefined}
        className={flush ? 'min-w-0' : 'min-w-0 p-[var(--rui-content-padding)]'}
      >
        {children}
      </div>
      {footer && (
        <div
          data-slot="panel-footer"
          className="border-t border-border p-[var(--rui-content-padding)]"
        >
          <Inline>{footer}</Inline>
        </div>
      )}
    </section>
  );
}
