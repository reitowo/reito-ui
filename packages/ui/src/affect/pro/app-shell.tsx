import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import { tokenMetrics } from '@reito/tokens/metrics';
import { Folder, LayoutGrid, MessageSquare, PanelRight, Search } from 'lucide-react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { cn } from '../../lib/utils.js';
import { initials } from '../shared.js';

export type ShellNavItem = { label: string; icon?: ReactNode };
export type ShellGroup = { title: string; items: string[] };
export type ShellUser = { name: string; avatar?: string };
export type ShellWidth = { default?: number; min?: number; max?: number };
export type WorkspaceTool = { id: string; label: string; icon?: ReactNode; shortcut?: string };
export type WorkspaceSource = { id: string; title: string; source: string; mark?: string };
export type AppShellProps = {
  children?: ReactNode;
  active?: string;
  onNavigate?: (label: string) => void;
  workspace?: string;
  user?: ShellUser;
  nav?: ShellNavItem[];
  projects?: string[];
  groups?: ShellGroup[];
  sidebarWidth?: ShellWidth;
  header?: { title: ReactNode; actions?: ReactNode } | false;
  panel?: ReactNode;
  panelTitle?: string;
  panelWidth?: ShellWidth;
  className?: string;
};
export type AppShellWorkspaceProps = AppShellProps & {
  tools?: WorkspaceTool[];
  sources?: WorkspaceSource[];
  onOpen?: (id: string) => void;
};

const defaultNav: ShellNavItem[] = [
  { label: 'New chat', icon: <MessageSquare className="size-3.5" /> },
  { label: 'Folders', icon: <Folder className="size-3.5" /> },
  { label: 'Integrations', icon: <LayoutGrid className="size-3.5" /> },
];
const defaultTools: WorkspaceTool[] = [
  { id: 'terminal', label: 'Terminal', shortcut: '⌘J' },
  { id: 'browser', label: 'Browser' },
  { id: 'notes', label: 'Notes' },
];

function usePane(spec: ShellWidth | undefined, fallback: Required<ShellWidth>) {
  const min = spec?.min ?? fallback.min;
  const max = spec?.max ?? fallback.max;
  const initial = spec?.default ?? fallback.default;
  const [width, setWidth] = useState(initial);
  return {
    width,
    min,
    max,
    set: (value: number) => setWidth(Math.min(max, Math.max(min, value))),
    reset: () => setWidth(initial),
  };
}

function Edge({
  label,
  width,
  min,
  max,
  onMove,
  onReset,
}: {
  label: string;
  width: number;
  min: number;
  max: number;
  onMove: (next: number) => void;
  onReset: () => void;
}) {
  const step = tokenMetrics['space-2'];
  const leap = tokenMetrics['space-8'];
  function onKey(event: KeyboardEvent<HTMLButtonElement>) {
    const delta = event.shiftKey ? leap : step;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onMove(width - delta);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onMove(width + delta);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      onMove(min);
    }
    if (event.key === 'End') {
      event.preventDefault();
      onMove(max);
    }
  }
  return (
    <button
      type="button"
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={width}
      className="w-[var(--rui-border-width)] shrink-0 cursor-col-resize bg-border outline-none focus-visible:bg-ring"
      onKeyDown={onKey}
      onDoubleClick={onReset}
    />
  );
}

function Sidebar({
  workspace,
  user,
  nav,
  projects,
  groups,
  active,
  onNavigate,
  collapsed,
  onToggle,
}: {
  workspace: string;
  user: ShellUser;
  nav: ShellNavItem[];
  projects?: string[];
  groups?: ShellGroup[];
  active?: string;
  onNavigate?: (label: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={cn(
        'flex h-full min-h-0 flex-col gap-[var(--rui-content-gap)] border-r border-border bg-muted/50 p-[var(--rui-content-padding)]',
        collapsed && '@md:flex hidden',
      )}
    >
      <Inline className="justify-between">
        <Inline>
          <span
            aria-hidden="true"
            className="grid size-[var(--rui-control-height-sm)] place-items-center rounded-[var(--rui-radius-md)] bg-primary text-primary-foreground"
          >
            {workspace.slice(0, 1)}
          </span>
          <Text variant="interface">{workspace}</Text>
        </Inline>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          aria-label="折叠侧栏"
          onClick={onToggle}
        >
          <PanelRight className="size-3.5 rotate-180" />
        </Button>
      </Inline>
      <nav className="grid min-h-0 flex-1 gap-[var(--rui-space-1)] overflow-auto">
        {nav.map((item) => (
          <Button
            key={item.label}
            type="button"
            size="sm"
            variant={active === item.label ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            aria-current={active === item.label ? 'page' : undefined}
            onClick={() => onNavigate?.(item.label)}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Button>
        ))}
        {groups?.map((group) => (
          <div
            key={group.title}
            className="grid gap-[var(--rui-space-1)] pt-[var(--rui-content-gap)]"
          >
            <Text variant="caption" tone="muted">
              {group.title}
            </Text>
            {group.items.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={active === item ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onNavigate?.(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        ))}
        {projects?.length ? (
          <div className="grid gap-[var(--rui-space-1)] pt-[var(--rui-content-gap)]">
            <Text variant="caption" tone="muted">
              项目
            </Text>
            {projects.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={active === item ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onNavigate?.(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        ) : null}
      </nav>
      <Inline>
        <span
          aria-hidden="true"
          className="grid size-6 place-items-center rounded-full bg-muted text-[length:var(--rui-font-caption)]"
        >
          {user.avatar ? (
            <img src={user.avatar} alt="" className="size-6 rounded-full" />
          ) : (
            initials(user.name)
          )}
        </span>
        <Text variant="caption">{user.name}</Text>
      </Inline>
    </aside>
  );
}

function WorkspacePanel({
  title,
  tools,
  sources,
  panel,
  onOpen,
}: {
  title: string;
  tools: WorkspaceTool[];
  sources?: WorkspaceSource[];
  panel?: ReactNode;
  onOpen?: (id: string) => void;
}) {
  if (panel) return <>{panel}</>;
  return (
    <div className="grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
      <Heading size="item">{title}</Heading>
      <div className="grid gap-1">
        <Text variant="caption" tone="muted">
          工具
        </Text>
        {tools.map((tool) => (
          <Button
            key={tool.id}
            type="button"
            size="xs"
            variant="ghost"
            className="w-full justify-between"
            onClick={() => onOpen?.(tool.id)}
          >
            <span>
              <span aria-hidden="true">{tool.icon}</span> {tool.label}
            </span>
            {tool.shortcut ? (
              <Text as="span" variant="caption" tone="muted">
                {tool.shortcut}
              </Text>
            ) : null}
          </Button>
        ))}
      </div>
      {sources?.length ? (
        <div className="grid gap-1">
          <Text variant="caption" tone="muted">
            建议
          </Text>
          {sources.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="xs"
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onOpen?.(item.id)}
            >
              {item.title}
              <Text as="span" variant="caption" tone="muted">
                {' '}
                · {item.source}
              </Text>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ShellFrame({
  variant,
  children,
  active,
  onNavigate,
  workspace = 'Acme',
  user = { name: 'Alex Morgan' },
  nav = defaultNav,
  projects,
  groups,
  sidebarWidth,
  header,
  panel,
  panelTitle = 'Workspace',
  panelWidth,
  tools,
  sources,
  onOpen,
  className,
}: AppShellWorkspaceProps & { variant: 'inset' | 'flat' }) {
  const side = usePane(sidebarWidth, {
    default: tokenMetrics['sidebar-width'],
    min: tokenMetrics['sidebar-width-narrow'],
    max: tokenMetrics['inspector-width'],
  });
  const extra = usePane(panelWidth, {
    default: tokenMetrics['inspector-width'],
    min: tokenMetrics['sidebar-width-narrow'],
    max: tokenMetrics['support-width'],
  });
  const [sideOpen, setSideOpen] = useState(true);
  const [panelOpen, setPanelOpen] = useState(Boolean(panel || tools));
  const title = header === false ? null : (header?.title ?? active ?? nav[0]?.label ?? workspace);

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setSideOpen(true);
        setPanelOpen(Boolean(panel || tools));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel, tools]);

  return (
    <div
      className={cn(
        '@container flex h-full min-h-[var(--rui-preview-min-height)] overflow-hidden text-foreground',
        variant === 'inset'
          ? 'rounded-[var(--rui-radius-lg)] bg-muted p-[var(--rui-space-2)]'
          : 'bg-background',
        className,
      )}
    >
      {sideOpen ? (
        <div className="flex min-h-0" style={{ width: side.width }}>
          <Sidebar
            workspace={workspace}
            user={user}
            nav={nav}
            projects={projects}
            groups={groups}
            active={active}
            onNavigate={onNavigate}
            collapsed={!sideOpen}
            onToggle={() => setSideOpen(false)}
          />
        </div>
      ) : (
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          aria-label="打开侧栏"
          className="m-[var(--rui-compact-surface-padding-y)]"
          onClick={() => setSideOpen(true)}
        >
          <PanelRight className="size-3.5 rotate-180" />
        </Button>
      )}
      {sideOpen ? (
        <Edge
          label="侧栏宽度"
          width={side.width}
          min={side.min}
          max={side.max}
          onMove={side.set}
          onReset={side.reset}
        />
      ) : null}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col overflow-hidden',
          variant === 'inset' &&
            'rounded-[var(--rui-radius-md)] border border-border bg-card shadow-sm',
        )}
      >
        {header !== false ? (
          <header className="flex h-[var(--rui-control-height-lg)] items-center justify-between gap-[var(--rui-content-gap-sm)] border-b border-border px-[var(--rui-content-padding)]">
            <Inline>
              <label className="sr-only" htmlFor="affect-shell-search">
                搜索
              </label>
              <Search className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <Input
                id="affect-shell-search"
                placeholder="搜索"
                className="h-[var(--rui-control-height-sm)] border-0"
              />
              <Heading size="item">{title}</Heading>
            </Inline>
            <Inline>
              {header && typeof header === 'object' && header.actions ? (
                header.actions
              ) : (
                <Button type="button" size="xs" variant="ghost">
                  分享
                </Button>
              )}
              {panel || tools ? (
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={panelOpen ? '收起工作区' : '打开工作区'}
                  aria-expanded={panelOpen}
                  onClick={() => setPanelOpen((value) => !value)}
                >
                  <PanelRight className="size-3.5" />
                </Button>
              ) : null}
            </Inline>
          </header>
        ) : null}
        <div className="flex min-h-0 flex-1">
          <main
            className={cn(
              'min-h-0 min-w-0 flex-1 overflow-auto',
              variant === 'inset' && 'bg-card p-[var(--rui-content-padding)]',
            )}
          >
            <div className={cn(variant === 'inset' && 'min-h-full')}>{children}</div>
          </main>
          {panelOpen && (panel || tools) ? (
            <>
              <Edge
                label="工作区宽度"
                width={extra.width}
                min={extra.min}
                max={extra.max}
                onMove={extra.set}
                onReset={extra.reset}
              />
              <aside
                aria-label={panelTitle}
                className="min-h-0 overflow-auto bg-card"
                style={{ width: extra.width }}
              >
                <WorkspacePanel
                  title={panelTitle}
                  tools={tools ?? defaultTools}
                  sources={sources}
                  panel={panel}
                  onOpen={onOpen}
                />
              </aside>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Recreated from public App Shell Inset docs. Sibling of complex AppShell. */
export function AppShell(props: AppShellProps) {
  return <ShellFrame {...props} variant="inset" />;
}

/** Recreated from public App Shell Flat docs. */
export function AppShellFlat(props: AppShellProps) {
  return <ShellFrame {...props} variant="flat" />;
}

/** Recreated from public App Shell Workspace Inset docs. */
export function AppShellWorkspace(props: AppShellWorkspaceProps) {
  return <ShellFrame {...props} variant="inset" tools={props.tools ?? defaultTools} />;
}

/** Recreated from public App Shell Workspace Flat docs. */
export function AppShellWorkspaceFlat(props: AppShellWorkspaceProps) {
  return <ShellFrame {...props} variant="flat" tools={props.tools ?? defaultTools} />;
}
