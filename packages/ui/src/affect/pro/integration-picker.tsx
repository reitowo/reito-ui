import { useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { Switch } from '../../primitives/switch.js';
import { Label } from '../../primitives/label.js';
import { cn } from '../../lib/utils.js';
import { initials } from '../shared.js';

export type Integration = {
  id: string;
  name: string;
  domain: string;
  category: string;
  description: string;
  features: string[];
  path?: string;
  color?: string;
  icon?: ReactNode;
  connected: boolean;
};
export type IntegrationPickerProps = {
  integrations?: Integration[];
  appName?: string;
  appIcon?: ReactNode;
  defaultSelected?: string;
  onToggle?: (id: string, connected: boolean) => void;
  onExplore?: (id: string) => void;
  onBack?: () => void;
  onClose?: () => void;
  className?: string;
};

const sample: Integration[] = [
  {
    id: 'issues',
    name: '议题',
    domain: 'issues.local',
    category: '工程',
    description: '把仓库议题同步到本地工作面。',
    features: ['双向评论', '状态映射', '指派代理'],
    connected: true,
  },
  {
    id: 'mail',
    name: '邮件',
    domain: 'mail.local',
    category: '沟通',
    description: '起草与归档邮件草稿。',
    features: ['草稿', '附件', '标签'],
    connected: false,
  },
  {
    id: 'calendar',
    name: '日历',
    domain: 'cal.local',
    category: '日程',
    description: '读取空闲时段并写入会议。',
    features: ['空闲查询', '邀请', '提醒'],
    connected: false,
  },
  {
    id: 'docs',
    name: '文档',
    domain: 'docs.local',
    category: '知识',
    description: '检索团队文档作为上下文。',
    features: ['检索', '引用', '权限继承'],
    connected: true,
  },
];

/** Recreated from public Integration Picker docs. Not Pro source. */
export function IntegrationPicker({
  integrations = sample,
  appName = 'Reito',
  appIcon,
  defaultSelected,
  onToggle,
  onExplore,
  onBack,
  onClose,
  className,
}: IntegrationPickerProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(defaultSelected ?? integrations[0]?.id);
  const [local, setLocal] = useState(integrations);
  const items = onToggle ? integrations : local;
  const filtered = items.filter((item) => {
    const hay = `${item.name} ${item.domain} ${item.category} ${item.description}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });
  const connected = filtered.filter((item) => item.connected);
  const available = filtered.filter((item) => !item.connected);
  const current = items.find((item) => item.id === selected) ?? filtered[0];

  const groups = useMemo(
    () => [
      { id: 'connected', label: '已连接', items: connected },
      { id: 'available', label: '可连接', items: available },
    ],
    [connected, available],
  );

  function toggle(id: string, connectedNext: boolean) {
    if (!onToggle) {
      setLocal((currentItems) =>
        currentItems.map((item) => (item.id === id ? { ...item, connected: connectedNext } : item)),
      );
    }
    onToggle?.(id, connectedNext);
  }

  function move(delta: number) {
    if (!filtered.length) return;
    const index = Math.max(
      0,
      filtered.findIndex((item) => item.id === current?.id),
    );
    const next = filtered[(index + delta + filtered.length) % filtered.length];
    setSelected(next.id);
  }

  return (
    <section
      className={cn(
        '@container grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)] @min-[560px]:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]',
        className,
      )}
    >
      <Stack gap="small">
        <Inline>
          {onBack ? (
            <Button type="button" size="xs" variant="ghost" onClick={onBack}>
              返回
            </Button>
          ) : null}
          <Heading size="item">集成</Heading>
        </Inline>
        <Input
          role="combobox"
          aria-expanded="true"
          aria-controls="affect-integration-list"
          aria-activedescendant={current ? `affect-integration-${current.id}` : undefined}
          placeholder="搜索服务"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              move(1);
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              move(-1);
            }
            if (event.key === 'Enter' && current) {
              event.preventDefault();
              toggle(current.id, !current.connected);
            }
            if (event.key === 'Escape') {
              if (query) setQuery('');
              else onClose?.();
            }
            if (event.key === 'ArrowLeft' && !query) onBack?.();
          }}
        />
        <div id="affect-integration-list" role="listbox" aria-label="集成">
          {groups.map((group) =>
            group.items.length ? (
              <Stack key={group.id} gap="small" className="mt-2">
                <Text variant="caption" tone="muted">
                  {group.label}
                </Text>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    id={`affect-integration-${item.id}`}
                    type="button"
                    role="option"
                    aria-selected={current?.id === item.id}
                    className={cn(
                      'flex w-full items-center justify-between rounded-[var(--rui-radius)] px-2 py-1 text-left',
                      current?.id === item.id && 'bg-muted',
                    )}
                    onClick={() => setSelected(item.id)}
                  >
                    <Inline>
                      <span className="grid size-6 place-items-center rounded-[var(--rui-radius)] bg-card text-[length:var(--rui-font-micro)]">
                        {item.icon ?? initials(item.name)}
                      </span>
                      <span>{item.name}</span>
                    </Inline>
                    {item.connected ? <Badge variant="secondary">已连接</Badge> : null}
                  </button>
                ))}
              </Stack>
            ) : null,
          )}
        </div>
      </Stack>
      {current ? (
        <aside aria-live="polite" className="grid gap-[var(--rui-content-gap-sm)]">
          <Inline className="justify-between">
            <Heading size="item">
              {appIcon} {appName} + {current.name}
            </Heading>
            <Badge variant="secondary">{current.category}</Badge>
          </Inline>
          <Text variant="caption" tone="muted">
            {current.domain} · {current.description}
          </Text>
          <div className="grid gap-2 @min-[560px]:grid-cols-2">
            <div className="grid place-items-center rounded-[var(--rui-radius)] border border-border bg-muted p-[var(--rui-content-padding)]">
              {appIcon ?? appName}
            </div>
            <div className="grid place-items-center rounded-[var(--rui-radius)] border border-border bg-muted p-[var(--rui-content-padding)]">
              {current.icon ?? current.name}
            </div>
          </div>
          <ul className="@min-[560px]:grid hidden gap-1">
            {current.features.map((feature) => (
              <li key={feature}>
                <Text variant="caption">{feature}</Text>
              </li>
            ))}
          </ul>
          <Inline>
            <Label htmlFor={`affect-integration-switch-${current.id}`}>
              {current.connected ? `断开 ${current.name}` : `连接 ${current.name}`}
            </Label>
            <Switch
              id={`affect-integration-switch-${current.id}`}
              checked={current.connected}
              onCheckedChange={(value) => toggle(current.id, value === true)}
            />
            {onExplore ? (
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => onExplore(current.id)}
              >
                了解集成
              </Button>
            ) : null}
          </Inline>
        </aside>
      ) : (
        <Text variant="caption" tone="muted">
          没有匹配的集成。
        </Text>
      )}
    </section>
  );
}
