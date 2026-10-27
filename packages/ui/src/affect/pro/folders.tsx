import { useMemo, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { cn } from '../../lib/utils.js';
import { AppShell, type AppShellProps } from './app-shell.js';

export type FilesScreenProps = Pick<
  AppShellProps,
  'onNavigate' | 'workspace' | 'user' | 'className'
>;

const tabs = ['全部', '最近', '共享'];
const templates = ['空白文档', '简报', '清单'];
const folders = [
  { id: 'q3', name: 'Q3 Campaign', tab: '全部', updated: '昨天' },
  { id: 'onboard', name: 'Onboarding', tab: '最近', updated: '今天' },
  { id: 'shared', name: 'Shared specs', tab: '共享', updated: '上周' },
];

/** Recreated from public Folders / Files docs. Not Pro source. */
export function FilesScreen({
  onNavigate,
  workspace = 'Acme',
  user = { name: 'Alex Morgan' },
  className,
}: FilesScreenProps) {
  const [tab, setTab] = useState('全部');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'name' | 'updated'>('updated');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const rows = useMemo(() => {
    return folders
      .filter((item) => (tab === '全部' ? true : item.tab === tab))
      .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
      .sort((left, right) =>
        sort === 'name'
          ? left.name.localeCompare(right.name, 'zh')
          : left.updated.localeCompare(right.updated, 'zh'),
      );
  }, [query, sort, tab]);

  return (
    <AppShell
      active="Folders"
      workspace={workspace}
      user={user}
      onNavigate={onNavigate}
      header={{ title: '文件夹' }}
      className={className}
    >
      <div className="grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
        <Inline className="justify-between">
          <Heading size="item">文件夹</Heading>
          <Inline>
            <Input
              value={query}
              placeholder="搜索"
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => setSort(sort === 'name' ? 'updated' : 'name')}
            >
              排序 · {sort === 'name' ? '名称' : '更新'}
            </Button>
            <Button
              type="button"
              size="icon-xs"
              variant={layout === 'grid' ? 'secondary' : 'ghost'}
              aria-label="网格"
              aria-pressed={layout === 'grid'}
              onClick={() => setLayout('grid')}
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-xs"
              variant={layout === 'list' ? 'secondary' : 'ghost'}
              aria-label="列表"
              aria-pressed={layout === 'list'}
              onClick={() => setLayout('list')}
            >
              <List className="size-3.5" />
            </Button>
          </Inline>
        </Inline>
        <div role="tablist" aria-label="范围" className="flex gap-1">
          {tabs.map((item) => (
            <Button
              key={item}
              type="button"
              size="xs"
              role="tab"
              aria-selected={tab === item}
              variant={tab === item ? 'secondary' : 'ghost'}
              onClick={() => setTab(item)}
            >
              {item}
            </Button>
          ))}
        </div>
        <Inline>
          {templates.map((item) => (
            <Badge key={item} variant="outline">
              模板 · {item}
            </Badge>
          ))}
        </Inline>
        <ul
          className={cn(
            'grid gap-[var(--rui-content-gap)]',
            layout === 'grid' ? '@md:grid-cols-3' : 'grid-cols-1',
          )}
        >
          {rows.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="grid w-full gap-1 rounded-[var(--rui-radius)] border border-border p-[var(--rui-content-padding)] text-left"
                onClick={() => onNavigate?.(item.name)}
              >
                <Text variant="interface">{item.name}</Text>
                <Text variant="caption" tone="muted">
                  {item.updated}
                </Text>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}

export { FilesScreen as FoldersScreen };
