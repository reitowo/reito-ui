import { useEffect, useId, useState, type ReactNode } from 'react';
import { Shield } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { RadioGroup, RadioGroupItem } from '../../primitives/radio-group.js';
import { Label } from '../../primitives/label.js';
import { cn } from '../../lib/utils.js';
import { formatClock, initials, useTickingNow } from '../shared.js';

export type PermissionRisk = 'safe' | 'risky' | 'destructive';
export type PermissionScope = 'once' | 'timed' | 'always';
export type PermissionDecision = {
  allow: boolean;
  scope: PermissionScope;
  at: number;
  until?: number;
};
export type PermissionPreview = { id: string; label: string; meta?: string; icon?: ReactNode };
export type PermissionRequestProps = {
  agent: { name: string; model?: string; avatar?: ReactNode };
  action: string;
  target?: string;
  toolIcon?: ReactNode;
  risk?: PermissionRisk;
  reason?: string;
  preview?: PermissionPreview[];
  previewTitle?: string;
  previewLimit?: number;
  scopes?: PermissionScope[];
  scope?: PermissionScope;
  defaultScope?: PermissionScope;
  onScopeChange?: (scope: PermissionScope) => void;
  duration?: number;
  decision?: PermissionDecision | null;
  defaultDecision?: PermissionDecision | null;
  onDecisionChange?: (decision: PermissionDecision | null) => void;
  now?: number;
  className?: string;
};

const scopeLabel: Record<PermissionScope, string> = {
  once: '仅一次',
  timed: '限时',
  always: '始终',
};
const riskLabel: Record<PermissionRisk, string> = {
  safe: '安全',
  risky: '有风险',
  destructive: '破坏性',
};

/** Recreated from public Permission Request docs. Not Pro source. */
export function PermissionRequest({
  agent,
  action,
  target,
  toolIcon,
  risk = 'risky',
  reason,
  preview,
  previewTitle = '将会发生什么',
  previewLimit = 3,
  scopes,
  scope,
  defaultScope = 'once',
  onScopeChange,
  duration,
  decision,
  defaultDecision = null,
  onDecisionChange,
  now,
  className,
}: PermissionRequestProps) {
  const titleId = useId();
  const minutes = duration ?? 60;
  const offered = (scopes ?? ['once', 'timed', 'always']).filter(
    (item) => !(risk === 'destructive' && item === 'always'),
  );
  const [internalScope, setInternalScope] = useState(defaultScope);
  const [internal, setInternal] = useState<PermissionDecision | null>(defaultDecision);
  const [more, setMore] = useState(false);
  const currentScope = scope ?? internalScope;
  const current = decision === undefined ? internal : decision;
  const title = `${agent.name} 想要${action}`;
  const timedActive = Boolean(current?.allow && current.scope === 'timed' && current.until);
  const clock = useTickingNow(timedActive, now);
  const remaining = current?.until ? Math.max(0, Math.round((current.until - clock) / 1000)) : 0;
  const shown = more ? preview : preview?.slice(0, previewLimit);

  useEffect(() => {
    if (timedActive && remaining <= 0) {
      if (decision === undefined) setInternal(null);
      onDecisionChange?.(null);
    }
  }, [timedActive, remaining, decision, onDecisionChange]);

  function setScope(next: PermissionScope) {
    if (scope === undefined) setInternalScope(next);
    onScopeChange?.(next);
  }

  function settle(next: PermissionDecision | null) {
    if (decision === undefined) setInternal(next);
    onDecisionChange?.(next);
  }

  function allow() {
    const at = Date.now();
    settle({
      allow: true,
      scope: currentScope,
      at,
      until: currentScope === 'timed' ? at + minutes * 60 * 1000 : undefined,
    });
  }

  if (current) {
    return (
      <section
        role="status"
        className={cn(
          'flex items-center justify-between gap-2 rounded-[var(--rui-radius-surface)] bg-muted p-[var(--rui-content-padding)]',
          className,
        )}
      >
        <Text as="span" variant="interface">
          {current.allow
            ? current.scope === 'timed'
              ? `已允许 ${formatClock(remaining)}`
              : `已允许 · ${scopeLabel[current.scope]}`
            : '已拒绝'}
          ：{title}
        </Text>
        <Button type="button" size="xs" variant="ghost" onClick={() => settle(null)}>
          {current.allow ? '撤销' : '再问一次'}
        </Button>
      </section>
    );
  }

  return (
    <section
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={reason ? `${titleId}-reason` : undefined}
      className={cn(
        'grid max-w-sm gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          allow();
        }
        if (event.key === 'Escape') settle({ allow: false, scope: currentScope, at: Date.now() });
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          const index = offered.indexOf(currentScope);
          const next = offered[index + (event.key === 'ArrowRight' ? 1 : -1)];
          if (next) setScope(next);
        }
      }}
    >
      <Inline>
        <span className="grid size-8 place-items-center rounded-full bg-muted text-[length:var(--rui-font-caption)]">
          {agent.avatar ?? initials(agent.name)}
        </span>
        <Stack gap="none" className="min-w-0 flex-1">
          <Heading id={titleId} size="item">
            {title}
          </Heading>
          {target ? (
            <Inline>
              {toolIcon}
              <Text as="span" variant="caption" tone="muted">
                {target}
              </Text>
            </Inline>
          ) : null}
        </Stack>
        {risk !== 'safe' ? (
          <Badge variant={risk === 'destructive' ? 'destructive' : 'secondary'}>
            {riskLabel[risk]}
          </Badge>
        ) : (
          <Shield className="size-4 text-muted-foreground" aria-hidden="true" />
        )}
      </Inline>
      {reason ? (
        <Text id={`${titleId}-reason`} variant="caption" tone="muted">
          {reason}
        </Text>
      ) : null}
      {shown?.length ? (
        <Stack gap="small">
          <Text variant="interface">
            {previewTitle} {preview?.length}
          </Text>
          <ul className="grid gap-1">
            {shown.map((item) => (
              <li
                key={item.id}
                className="flex justify-between gap-2 text-[length:var(--rui-font-caption)]"
              >
                <span>
                  {item.icon} {item.label}
                </span>
                {item.meta ? <span className="text-muted-foreground">{item.meta}</span> : null}
              </li>
            ))}
          </ul>
          {preview && preview.length > previewLimit && !more ? (
            <Button type="button" size="xs" variant="ghost" onClick={() => setMore(true)}>
              还有 {preview.length - previewLimit} 项
            </Button>
          ) : null}
        </Stack>
      ) : null}
      {offered.length > 1 ? (
        <RadioGroup
          aria-label="授权时长"
          value={currentScope}
          onValueChange={(value) => setScope(value as PermissionScope)}
          className="flex flex-wrap gap-3"
        >
          {offered.map((item) => (
            <Inline key={item}>
              <RadioGroupItem value={item} id={`${titleId}-${item}`} />
              <Label htmlFor={`${titleId}-${item}`}>
                {item === 'timed' ? `${scopeLabel[item]} ${minutes} 分钟` : scopeLabel[item]}
              </Label>
            </Inline>
          ))}
        </RadioGroup>
      ) : null}
      <Inline className="justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => settle({ allow: false, scope: currentScope, at: Date.now() })}
        >
          拒绝
        </Button>
        <Button
          type="button"
          size="sm"
          variant={risk === 'destructive' ? 'destructive' : 'default'}
          aria-label={
            currentScope === 'timed' ? `允许 ${minutes} 分钟` : `允许 · ${scopeLabel[currentScope]}`
          }
          onClick={allow}
        >
          允许
        </Button>
      </Inline>
    </section>
  );
}
