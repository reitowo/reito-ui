import { useState } from 'react';
import { Heading, Inline, Stack, Text } from '../basic/composition.js';
import { Button } from '../primitives/button.js';
import { cn } from '../lib/utils.js';
import { cardClass, surfaceClass, type AffectAppearance } from './shared.js';

export type Decision = {
  id: string;
  title: string;
  detail?: string;
  primary: string;
  secondary: string;
  collapsed?: boolean;
};

export type DecisionInboxProps = {
  decisions: Decision[];
  onDecide?: (decision: Decision, answer: 'primary' | 'secondary') => void;
  appearance?: AffectAppearance;
  className?: string;
};

/** Open decisions with two answers. Answered items confirm, then leave the list. */
export function DecisionInbox({
  decisions,
  onDecide,
  appearance = 'default',
  className,
}: DecisionInboxProps) {
  const [state, setState] = useState<
    Record<string, { open: boolean; answer?: string; gone?: boolean }>
  >(() => Object.fromEntries(decisions.map((item) => [item.id, { open: !item.collapsed }])));
  const visible = decisions.filter((item) => !state[item.id]?.gone);

  function answer(item: Decision, choice: 'primary' | 'secondary') {
    onDecide?.(item, choice);
    setState((current) => ({
      ...current,
      [item.id]: { open: false, answer: choice === 'primary' ? item.primary : item.secondary },
    }));
    window.setTimeout(() => {
      setState((current) => ({ ...current, [item.id]: { ...current[item.id]!, gone: true } }));
    }, 700);
  }

  return (
    <section aria-label="待决定事项" className={cn(surfaceClass(appearance), className)}>
      <Stack className={cn(cardClass(appearance), 'p-[var(--rui-content-padding)]')}>
        <Inline className="justify-between">
          <Heading size="item">待决定</Heading>
          <Text as="span" variant="caption" tone="muted">
            {visible.length} 项
          </Text>
        </Inline>
        <ul className="grid gap-[var(--rui-content-gap)]">
          {visible.map((item) => {
            const row = state[item.id] ?? { open: true };
            return (
              <li key={item.id} className="grid gap-[var(--rui-content-gap-sm)]">
                <button
                  type="button"
                  className="rounded-[var(--rui-radius)] text-left focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring"
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      [item.id]: { ...current[item.id], open: !row.open },
                    }))
                  }
                  aria-expanded={row.open}
                >
                  <Text variant="interface">{item.title}</Text>
                  {row.answer ? (
                    <Text variant="caption" tone="muted">
                      已选择：{row.answer}
                    </Text>
                  ) : item.detail && row.open ? (
                    <Text variant="caption" tone="muted">
                      {item.detail}
                    </Text>
                  ) : null}
                </button>
                {row.open && !row.answer ? (
                  <Inline>
                    <Button type="button" size="sm" onClick={() => answer(item, 'primary')}>
                      {item.primary}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => answer(item, 'secondary')}
                    >
                      {item.secondary}
                    </Button>
                  </Inline>
                ) : null}
              </li>
            );
          })}
          {!visible.length ? (
            <Text variant="caption" tone="muted">
              没有待决定事项。
            </Text>
          ) : null}
        </ul>
      </Stack>
    </section>
  );
}
