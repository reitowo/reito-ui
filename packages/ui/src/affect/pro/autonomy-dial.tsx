import { useId, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { RadioGroup, RadioGroupItem } from '../../primitives/radio-group.js';
import { Label } from '../../primitives/label.js';
import { cn } from '../../lib/utils.js';

export type AutonomyLevel = 0 | 1 | 2;
export type AgentAction = {
  id: string;
  label: string;
  detail?: string;
  risk: 'safe' | 'risky' | 'destructive';
  icon?: React.ReactNode;
};
export type AutonomyDialProps = {
  actions: AgentAction[];
  level?: AutonomyLevel;
  defaultLevel?: AutonomyLevel;
  onLevelChange?: (level: AutonomyLevel) => void;
  pinned?: string[];
  defaultPinned?: string[];
  onPinnedChange?: (pinned: string[]) => void;
  title?: string;
  subtitle?: string;
  className?: string;
};

const levels: { value: AutonomyLevel; label: string; hint: string }[] = [
  { value: 0, label: '始终询问', hint: '每一步都先问你' },
  { value: 1, label: '有风险再问', hint: '安全动作可自行完成' },
  { value: 2, label: '全自动', hint: '未锁定的动作都可自行完成' },
];

/** Same rule the public Autonomy Dial docs describe. */
export function asksFirst(
  action: Pick<AgentAction, 'id' | 'risk'>,
  level: AutonomyLevel,
  pinned: string[] = [],
) {
  if (pinned.includes(action.id)) return true;
  if (level === 0) return true;
  if (level === 1) return action.risk !== 'safe';
  return false;
}

/** Recreated from public Autonomy Dial docs. Not Pro source. */
export function AutonomyDial({
  actions,
  level,
  defaultLevel = 1,
  onLevelChange,
  pinned,
  defaultPinned = [],
  onPinnedChange,
  title = '代理权限',
  subtitle = '它可以在不问你的情况下做什么',
  className,
}: AutonomyDialProps) {
  const labelId = useId();
  const [internalLevel, setInternalLevel] = useState<AutonomyLevel>(defaultLevel);
  const [internalPinned, setInternalPinned] = useState(defaultPinned);
  const current = level ?? internalLevel;
  const locks = pinned ?? internalPinned;
  const own = actions.filter((action) => !asksFirst(action, current, locks));
  const ask = actions.filter((action) => asksFirst(action, current, locks));

  function setLevel(next: AutonomyLevel) {
    if (level === undefined) setInternalLevel(next);
    onLevelChange?.(next);
  }

  function togglePin(id: string) {
    const next = locks.includes(id) ? locks.filter((item) => item !== id) : [...locks, id];
    if (pinned === undefined) setInternalPinned(next);
    onPinnedChange?.(next);
  }

  function row(action: AgentAction) {
    const locked = locks.includes(action.id);
    return (
      <li key={action.id} className="flex items-start justify-between gap-2">
        <Stack gap="none" className="min-w-0">
          <Inline>
            {action.icon}
            <Text as="span" variant="interface">
              {action.label}
            </Text>
            {action.risk !== 'safe' ? (
              <Badge variant={action.risk === 'destructive' ? 'destructive' : 'secondary'}>
                {action.risk === 'destructive' ? '破坏性' : '有风险'}
              </Badge>
            ) : null}
          </Inline>
          {action.detail ? (
            <Text variant="caption" tone="muted">
              {action.detail}
            </Text>
          ) : null}
        </Stack>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          aria-pressed={locked}
          aria-label={`${locked ? '解锁' : '始终先问'}：${action.label}`}
          onClick={() => togglePin(action.id)}
        >
          {locked ? <Lock /> : <Unlock />}
        </Button>
      </li>
    );
  }

  return (
    <section
      aria-labelledby={labelId}
      className={cn(
        'grid max-w-sm gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Stack gap="none">
        <Heading id={labelId} size="item">
          {title}
        </Heading>
        <Text variant="caption" tone="muted">
          {subtitle}
        </Text>
      </Stack>
      <RadioGroup
        aria-label="自主程度"
        aria-describedby={`${labelId}-hint`}
        value={String(current)}
        onValueChange={(value) => setLevel(Number(value) as AutonomyLevel)}
        className="grid gap-2"
      >
        {levels.map((item) => (
          <Inline key={item.value}>
            <RadioGroupItem value={String(item.value)} id={`${labelId}-${item.value}`} />
            <Label htmlFor={`${labelId}-${item.value}`}>{item.label}</Label>
          </Inline>
        ))}
      </RadioGroup>
      <Text id={`${labelId}-hint`} variant="caption" tone="muted" aria-live="polite">
        {levels[current]?.hint} · {own.length} 自行完成，{ask.length} 先问你
      </Text>
      <Stack gap="small">
        <Text variant="interface">自行完成 {own.length}</Text>
        <ul className="grid gap-2">{own.map(row)}</ul>
      </Stack>
      <Stack gap="small">
        <Text variant="interface">先问你 {ask.length}</Text>
        <ul className="grid gap-2">{ask.map(row)}</ul>
      </Stack>
    </section>
  );
}
