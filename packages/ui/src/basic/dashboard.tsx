import { useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, XIcon } from 'lucide-react';
import { tokenMetrics } from '@reito/tokens/metrics';
import { cn } from '../lib/utils.js';
import { Button } from '../primitives/button.js';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from '../primitives/sidebar.js';

export interface DashboardGroupProps
  extends Omit<ComponentProps<typeof SidebarProvider>, 'mobile' | 'position' | 'ref'> {
  /** Viewport by default; parent fills a host with a defined height. */
  height?: 'viewport' | 'parent';
}

/** Owns bounded height and available-width navigation state; consumers supply only dashboard content. */
export function DashboardGroup({
  height = 'viewport',
  className,
  children,
  ...props
}: DashboardGroupProps) {
  const root = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const update = () => {
      const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const size = getComputedStyle(element).getPropertyValue('--rui-container-2xl').trim();
      const breakpoint = size.endsWith('rem') ? parseFloat(size) * rootFont : parseFloat(size);
      setNarrow(element.clientWidth < (breakpoint || tokenMetrics['container-2xl']));
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    update();
    return () => observer.disconnect();
  }, []);
  return (
    <SidebarProvider
      {...props}
      ref={root}
      mobile={narrow}
      position="absolute"
      data-slot="dashboard-group"
      data-layout={narrow ? 'narrow' : 'wide'}
      className={cn(
        'relative min-h-0 min-w-0 overflow-hidden',
        height === 'viewport' ? 'h-dvh' : 'h-full',
        className,
      )}
    >
      {children}
    </SidebarProvider>
  );
}

/** Complete sidebar: desktop width and collapse, narrow overlay and focus use one group context. */
export function DashboardSidebar(props: ComponentProps<typeof Sidebar>) {
  return <Sidebar {...props} />;
}

export function DashboardSidebarHeader({
  className,
  ...props
}: ComponentProps<typeof SidebarHeader>) {
  return (
    <SidebarHeader
      {...props}
      className={cn('min-h-[var(--rui-titlebar-height)] justify-center', className)}
    />
  );
}

export function DashboardSidebarContent(props: ComponentProps<typeof SidebarContent>) {
  return <SidebarContent {...props} />;
}

export function DashboardSidebarFooter(props: ComponentProps<typeof SidebarFooter>) {
  return <SidebarFooter {...props} />;
}

export interface DashboardPanelProps extends ComponentProps<'main'> {
  header?: ReactNode;
  footer?: ReactNode;
}

/** A panel fixes header/footer and owns one scrolling body without adding page padding. */
export function DashboardPanel({
  header,
  footer,
  children,
  className,
  ...props
}: DashboardPanelProps) {
  return (
    <SidebarInset
      {...props}
      data-slot="dashboard-panel"
      className={cn('min-h-0 min-w-0 overflow-hidden', className)}
    >
      {header}
      <DashboardBody>{children}</DashboardBody>
      {footer && <DashboardFooter>{footer}</DashboardFooter>}
    </SidebarInset>
  );
}

export function DashboardBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="region"
      aria-label="主内容"
      tabIndex={0}
      {...props}
      data-slot="dashboard-body"
      className={cn(
        'rui-scroll-focus flex min-h-0 min-w-0 flex-1 flex-col overflow-auto overscroll-contain',
        className,
      )}
    />
  );
}

export function DashboardFooter({ className, ...props }: ComponentProps<'footer'>) {
  return (
    <footer
      {...props}
      data-slot="dashboard-footer"
      className={cn(
        'shrink-0 border-t border-border px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]',
        className,
      )}
    />
  );
}

export interface DashboardNavbarProps extends Omit<ComponentProps<'header'>, 'title'> {
  title?: ReactNode;
  actions?: ReactNode;
  toggle?: boolean;
}

/** Navigation controls read the group's state; applications do not implement breakpoints or hidden regions. */
export function DashboardNavbar({
  title,
  actions,
  toggle = true,
  children,
  className,
  ...props
}: DashboardNavbarProps) {
  return (
    <header
      {...props}
      data-slot="dashboard-navbar"
      className={cn(
        'flex min-w-0 shrink-0 flex-wrap items-center gap-[var(--rui-content-gap-sm)] border-b border-border',
        'min-h-[var(--rui-titlebar-height)] px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]',
        className,
      )}
    >
      {toggle && (
        <>
          <DashboardSidebarToggle />
          <DashboardSidebarCollapse />
        </>
      )}
      {title && <span className="min-w-0 text-sm font-medium">{title}</span>}
      {children}
      {actions && (
        <div className="ml-auto flex min-w-0 flex-wrap items-center gap-[var(--rui-content-gap-sm)]">
          {actions}
        </div>
      )}
    </header>
  );
}

/** Mobile open/close is separate from the preserved desktop collapse state. */
export function DashboardSidebarToggle(props: ComponentProps<typeof Button>) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  if (!isMobile) return null;
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={openMobile ? '关闭导航' : '打开导航'}
      aria-expanded={openMobile}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) setOpenMobile(!openMobile);
      }}
    >
      {openMobile ? <XIcon /> : <MenuIcon />}
    </Button>
  );
}

export function DashboardSidebarCollapse(props: ComponentProps<typeof Button>) {
  const { isMobile, open, setOpen } = useSidebar();
  if (isMobile) return null;
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={open ? '收起导航' : '展开导航'}
      aria-expanded={open}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      }}
    >
      {open ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
    </Button>
  );
}

export interface DashboardNavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
}
export interface DashboardNavigationGroup {
  label: string;
  items: DashboardNavigationItem[];
}
export interface DashboardNavigationMenuProps extends ComponentProps<'nav'> {
  groups: DashboardNavigationGroup[];
  /** Optional local navigation; prevent the link's default only when the host handles it. */
  onNavigate?: (item: DashboardNavigationItem, event: React.MouseEvent<HTMLElement>) => void;
}

/** Typed navigation supplies full-width rows and the same active/disabled behavior in both presentations. */
export function DashboardNavigationMenu({
  groups,
  onNavigate,
  ...props
}: DashboardNavigationMenuProps) {
  const { setOpenMobile } = useSidebar();
  return (
    <nav aria-label="应用导航" {...props}>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={item.active}
                  aria-disabled={item.disabled || undefined}
                  render={
                    <a
                      href={item.disabled ? undefined : item.href}
                      aria-current={item.active ? 'page' : undefined}
                    />
                  }
                  onClick={(event) => {
                    if (item.disabled) {
                      event.preventDefault();
                      return;
                    }
                    onNavigate?.(item, event);
                    setOpenMobile(false);
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </nav>
  );
}
