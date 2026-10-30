import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../lib/utils.js';
import { useThemeDefaults } from '../theme.js';

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
const textTones = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  danger: 'text-destructive',
};
export type TextTone = keyof typeof textTones;

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
  tone?: TextTone;
}) {
  return (
    <Tag
      data-slot="text"
      className={cn(
        'm-0 min-w-0 break-words font-normal',
        textRoles[variant],
        textTones[tone],
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
      <Stack gap="none" className="gap-[var(--rui-compact-surface-gap)]">
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

const PageGapContext = createContext<ContentGap>('normal');

function PageContent({ gap, ...props }: ComponentProps<typeof Stack>) {
  const inheritedGap = useContext(PageGapContext);
  return <Stack data-slot="page-content" gap={gap ?? inheritedGap} {...props} />;
}

export type PageProps = Omit<ComponentProps<'section'>, 'title'> &
  Partial<HeaderContent> & { gap?: ContentGap; inset?: boolean };

/** Page owns the outer edge and header-to-content gap; explicit slots never add another content wrapper. */
function PageRoot({
  title,
  description,
  actions,
  gap = 'normal',
  inset = false,
  children,
  className,
  ...props
}: PageProps) {
  return (
    <PageGapContext.Provider value={gap}>
      <section
        data-slot="page"
        className={cn(
          'flex min-w-0 flex-col gap-[var(--rui-section-gap)]',
          inset &&
            'px-[calc(var(--rui-content-padding)+var(--rui-space-1)/2)] py-[var(--rui-content-padding)]',
          className,
        )}
        {...props}
      >
        {title !== undefined ? (
          <>
            <PageHeader title={title} description={description} actions={actions} />
            <PageContent>{children}</PageContent>
          </>
        ) : (
          children
        )}
      </section>
    </PageGapContext.Provider>
  );
}

/** Grouped names expose each page region; the title shortcut retains the same implementation. */
export const Page = Object.assign(PageRoot, { Header: PageHeader, Content: PageContent });

interface PanelLayout {
  titleId: string;
  flush: boolean;
}
const PanelContext = createContext<PanelLayout | null>(null);
function usePanelLayout(): PanelLayout {
  const context = useContext(PanelContext);
  if (!context) throw new Error('Panel regions must be rendered inside Panel.');
  return context;
}

function PanelHeader({
  title,
  description,
  actions,
  className,
  ...props
}: Omit<ComponentProps<'header'>, 'title'> & HeaderContent) {
  const { titleId } = usePanelLayout();
  return (
    <header
      data-slot="panel-header"
      className={cn(
        'flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)]',
        'border-b border-border p-[var(--rui-content-padding)]',
        className,
      )}
      {...props}
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
  );
}

function PanelContent({
  flush: override,
  className,
  ...props
}: ComponentProps<'div'> & { flush?: boolean }) {
  const { flush: inherited } = usePanelLayout();
  const flush = override ?? inherited;
  return (
    <div
      data-slot="panel-body"
      data-flush={flush || undefined}
      className={cn('min-w-0', !flush && 'p-[var(--rui-content-padding)]', className)}
      {...props}
    />
  );
}

function PanelFooter({ children, className, ...props }: ComponentProps<'div'>) {
  usePanelLayout();
  return (
    <div
      data-slot="panel-footer"
      className={cn('border-t border-border p-[var(--rui-content-padding)]', className)}
      {...props}
    >
      <Inline>{children}</Inline>
    </div>
  );
}

export type PanelProps = Omit<ComponentProps<'section'>, 'title'> &
  Partial<HeaderContent> & {
    footer?: ReactNode;
    flush?: boolean;
  };

/** Panel owns its accessible title and one content inset; lists, tables and Empty use flush. */
function PanelRoot({
  title,
  description,
  actions,
  footer,
  flush: override,
  children,
  className,
  ...props
}: PanelProps) {
  const titleId = useId();
  const themed = useThemeDefaults('Panel');
  const flush = override ?? themed.flush ?? false;
  return (
    <PanelContext.Provider value={{ titleId, flush }}>
      <section
        data-slot="panel"
        aria-labelledby={props['aria-label'] ? undefined : titleId}
        className={cn(
          'min-w-0 overflow-hidden rounded-[var(--rui-radius-surface)]',
          'border border-border bg-card text-card-foreground',
          className,
        )}
        {...props}
      >
        {title !== undefined ? (
          <>
            <PanelHeader title={title} description={description} actions={actions} />
            <PanelContent>{children}</PanelContent>
          </>
        ) : (
          children
        )}
        {footer && <PanelFooter>{footer}</PanelFooter>}
      </section>
    </PanelContext.Provider>
  );
}

export const Panel = Object.assign(PanelRoot, {
  Header: PanelHeader,
  Content: PanelContent,
  Footer: PanelFooter,
});
