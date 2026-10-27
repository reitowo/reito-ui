import { useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { Label } from '../../primitives/label.js';
import { cn } from '../../lib/utils.js';
import { Mark } from '../illustrations/frame.js';
import { usePrefersReducedMotion } from '../shared.js';

export type DirectoryApp = {
  id: string;
  name: string;
  vendor?: string;
  description?: string;
  categories?: string[];
  logo?: ReactNode;
  color?: string;
  essential?: boolean;
  connected?: boolean;
};
export type AppCategory = { id: string; label: string; icon?: ReactNode };
export type AppDirectoryProps = {
  apps: DirectoryApp[];
  categories?: AppCategory[];
  title?: string;
  subtitle?: string;
  onToggle?: (app: DirectoryApp, connected: boolean) => void;
  className?: string;
};

/** Recreated from public App Directory docs. Hex tile colors are ignored. Not Pro source. */
export function AppDirectory({
  apps,
  categories,
  title = 'Integrations',
  subtitle,
  onToggle,
  className,
}: AppDirectoryProps) {
  const reduced = usePrefersReducedMotion();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [filter, setFilter] = useState<'all' | 'connected' | 'available'>('all');
  const [openFilter, setOpenFilter] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [items, setItems] = useState(apps);
  const groups = [
    { id: 'essentials', label: '常用' },
    { id: 'all', label: '全部' },
    ...(categories ??
      [...new Set(apps.flatMap((app) => app.categories ?? []))].map((id) => ({ id, label: id }))),
  ];
  const visible = useMemo(
    () =>
      items.filter((app) => {
        const matchQuery = `${app.name} ${app.vendor ?? ''} ${app.description ?? ''}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        const matchCategory =
          category === 'all' ||
          (category === 'essentials' ? app.essential : app.categories?.includes(category));
        const matchFilter =
          filter === 'all' || (filter === 'connected' ? app.connected : !app.connected);
        return matchQuery && matchCategory && matchFilter;
      }),
    [category, filter, items, query],
  );

  function toggle(app: DirectoryApp) {
    const next = !app.connected;
    setBusy(app.id);
    window.setTimeout(
      () => {
        setItems((prev) =>
          prev.map((item) => (item.id === app.id ? { ...item, connected: next } : item)),
        );
        onToggle?.({ ...app, connected: next }, next);
        setBusy(null);
      },
      reduced ? 0 : 240,
    );
  }

  return (
    <section className={cn('grid min-w-0 gap-[var(--rui-content-gap)]', className)}>
      <Stack gap="small">
        <Heading size="section">{title}</Heading>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </Stack>
      <div className="grid gap-[var(--rui-content-gap)] @lg:grid-cols-[minmax(0,var(--rui-sidebar-width-narrow))_minmax(0,1fr)]">
        <div className="flex flex-wrap gap-1">
          {groups.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="xs"
              variant={category === item.id ? 'secondary' : 'ghost'}
              aria-current={category === item.id ? 'true' : undefined}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className="grid gap-[var(--rui-content-gap)]">
          <Inline className="justify-between">
            <div className="min-w-0 flex-1">
              <Label htmlFor="affect-app-search" className="sr-only">
                搜索应用
              </Label>
              <Input
                id="affect-app-search"
                value={query}
                placeholder="搜索应用"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="relative">
              <Button
                type="button"
                size="sm"
                variant="outline"
                aria-expanded={openFilter}
                aria-haspopup="listbox"
                onClick={() => setOpenFilter((value) => !value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setOpenFilter(false);
                }}
              >
                {filter === 'connected' ? '已连接' : filter === 'available' ? '未连接' : '全部状态'}
              </Button>
              {openFilter ? (
                <ul
                  role="listbox"
                  aria-label="连接状态"
                  className="absolute right-0 z-[var(--rui-z-popover)] mt-1 min-w-32 rounded-[var(--rui-radius)] border border-border bg-card p-1"
                >
                  {(
                    [
                      ['all', '全部状态'],
                      ['connected', '已连接'],
                      ['available', '未连接'],
                    ] as const
                  ).map(([id, label]) => (
                    <li key={id}>
                      <Button
                        type="button"
                        size="xs"
                        variant={filter === id ? 'secondary' : 'ghost'}
                        role="option"
                        aria-selected={filter === id}
                        className="w-full justify-start"
                        onClick={() => {
                          setFilter(id);
                          setOpenFilter(false);
                        }}
                      >
                        {label}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Inline>
          <p className="sr-only" aria-live="polite">
            {visible.length} 个应用
          </p>
          <ul className="grid gap-[var(--rui-content-gap)] @md:grid-cols-2 @lg:grid-cols-3">
            {visible.map((app) => (
              <li
                key={app.id}
                className={cn(
                  'grid gap-2 rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
                  !reduced && 'motion-safe:animate-in motion-safe:fade-in',
                )}
              >
                <Inline>
                  {app.logo ?? <Mark name={app.name} />}
                  <Stack gap="none" className="min-w-0 flex-1">
                    <Heading size="item">{app.name}</Heading>
                    <Text variant="caption" tone="muted">
                      {app.vendor}
                    </Text>
                  </Stack>
                  {app.essential ? <Badge variant="secondary">常用</Badge> : null}
                </Inline>
                <Text variant="caption">{app.description}</Text>
                <Button
                  type="button"
                  size="sm"
                  variant={app.connected ? 'outline' : 'default'}
                  aria-label={app.connected ? `断开 ${app.name}` : `连接 ${app.name}`}
                  disabled={busy === app.id}
                  onClick={() => toggle(app)}
                >
                  {busy === app.id ? '处理中…' : app.connected ? '已连接' : '连接'}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
