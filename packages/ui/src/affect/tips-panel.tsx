import { useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../basic/composition.js';
import { Button } from '../primitives/button.js';
import { cn } from '../lib/utils.js';
import { cardClass, surfaceClass, type AffectAppearance } from './shared.js';

export type Tip = {
  id: string;
  title: string;
  description: ReactNode;
  action: string;
  doneLabel?: string;
  primary?: boolean;
  onAction?: () => void;
};

export type TipsPanelProps = {
  title?: string;
  tips: Tip[];
  onClose?: () => void;
  closeLabel?: string;
  appearance?: AffectAppearance;
  className?: string;
};

/** Short tips with one action each. Taken tips settle into a done state. */
export function TipsPanel({
  title = '提示',
  tips,
  onClose,
  closeLabel = '关闭',
  appearance = 'default',
  className,
}: TipsPanelProps) {
  const [done, setDone] = useState<string[]>([]);
  return (
    <section aria-label={title} className={cn(surfaceClass(appearance), className)}>
      <Stack className={cn(cardClass(appearance), 'p-[var(--rui-content-padding)]')}>
        <Heading size="item">{title}</Heading>
        <ul className="grid gap-[var(--rui-content-gap)]">
          {tips.map((tip) => {
            const complete = done.includes(tip.id);
            return (
              <li key={tip.id} className="grid gap-[var(--rui-content-gap-sm)]">
                <div className="min-w-0">
                  <Text variant="interface">{tip.title}</Text>
                  <Text variant="caption" tone="muted">
                    {tip.description}
                  </Text>
                </div>
                <Inline>
                  <Button
                    type="button"
                    size="sm"
                    variant={complete ? 'secondary' : tip.primary ? 'default' : 'outline'}
                    disabled={complete}
                    onClick={() => {
                      if (complete) return;
                      tip.onAction?.();
                      setDone((current) => [...current, tip.id]);
                    }}
                  >
                    {complete ? (
                      <>
                        <Check aria-hidden="true" />
                        {tip.doneLabel ?? '已完成'}
                      </>
                    ) : (
                      tip.action
                    )}
                  </Button>
                </Inline>
              </li>
            );
          })}
        </ul>
        {onClose ? (
          <Inline>
            <Button type="button" size="sm" variant="ghost" onClick={onClose}>
              {closeLabel}
            </Button>
          </Inline>
        ) : null}
      </Stack>
    </section>
  );
}
