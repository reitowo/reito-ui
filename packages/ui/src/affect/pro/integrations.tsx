import { useMemo, useState } from 'react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { AppShell, type AppShellProps } from './app-shell.js';

export type IntegrationsScreenProps = Pick<
  AppShellProps,
  'onNavigate' | 'workspace' | 'user' | 'className'
>;

const catalog = [
  { id: 'calendar', name: '日历', category: '效率', connected: true },
  { id: 'docs', name: '文档', category: '效率', connected: true },
  { id: 'issues', name: '议题', category: '工程', connected: false },
  { id: 'mail', name: '邮箱', category: '沟通', connected: false },
  { id: 'billing', name: '账单', category: '财务', connected: false },
  { id: 'analytics', name: '分析', category: '数据', connected: true },
];

/** Recreated from public Integrations docs. Not Pro source. */
export function IntegrationsScreen({
  onNavigate,
  workspace = 'Acme',
  user = { name: 'Alex Morgan' },
  className,
}: IntegrationsScreenProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');
  const [items, setItems] = useState(catalog);
  const categories = ['全部', ...new Set(catalog.map((item) => item.category))];
  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          (category === '全部' || item.category === category) && item.name.includes(query.trim()),
      ),
    [category, items, query],
  );

  return (
    <AppShell
      active="Integrations"
      workspace={workspace}
      user={user}
      onNavigate={onNavigate}
      header={{ title: '集成' }}
      className={className}
    >
      <div className="grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
        <div className="sticky top-0 grid gap-[var(--rui-content-gap-sm)] bg-card py-1">
          <Inline className="justify-between">
            <Heading size="item">应用目录</Heading>
            <Input
              value={query}
              placeholder="搜索应用"
              onChange={(event) => setQuery(event.target.value)}
            />
          </Inline>
          <Inline>
            {categories.map((item) => (
              <Button
                key={item}
                type="button"
                size="xs"
                variant={category === item ? 'secondary' : 'ghost'}
                onClick={() => setCategory(item)}
              >
                {item}
              </Button>
            ))}
          </Inline>
        </div>
        <ul className="grid gap-[var(--rui-content-gap)] @md:grid-cols-2">
          {visible.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-[var(--rui-radius)] border border-border p-[var(--rui-content-padding)]"
            >
              <div className="grid gap-1">
                <Text variant="interface">{item.name}</Text>
                <Badge variant="outline">{item.category}</Badge>
              </div>
              <Button
                type="button"
                size="xs"
                variant={item.connected ? 'secondary' : 'default'}
                onClick={() =>
                  setItems((current) =>
                    current.map((row) =>
                      row.id === item.id ? { ...row, connected: !row.connected } : row,
                    ),
                  )
                }
              >
                {item.connected ? '已连接' : '连接'}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
