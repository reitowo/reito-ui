import { useState, type ReactNode } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../basic/composition.js';
import { Button } from '../primitives/button.js';
import { cn } from '../lib/utils.js';
import { cardClass, surfaceClass, type AffectAppearance } from './shared.js';

export type Recommendation = {
  id: string;
  label: string;
  reason: ReactNode;
  signal: 0 | 1 | 2 | 3;
};

export type SmartRecommendationProps = {
  title?: string;
  options: Recommendation[];
  onAccept?: (option: Recommendation) => void;
  onUndo?: (option: Recommendation) => void;
  defaultOpen?: boolean;
  appearance?: AffectAppearance;
  className?: string;
};

const signalText = ['无信号', '弱信号', '良好信号', '强信号'];
const level = (value: unknown): 0 | 1 | 2 | 3 => {
  const n = Math.round(Number(value));
  return (Number.isFinite(n) ? Math.min(3, Math.max(0, n)) : 0) as 0 | 1 | 2 | 3;
};

/** Suggestion card with a confidence signal, alternatives, accept and undo. */
export function SmartRecommendation({
  title = '建议',
  options,
  onAccept,
  onUndo,
  defaultOpen = true,
  appearance = 'default',
  className,
}: SmartRecommendationProps) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(defaultOpen);
  const [accepted, setAccepted] = useState<Recommendation | null>(null);
  const current = options[index] ?? options[0];
  if (!current) return null;
  const signal = level(current.signal);

  if (accepted) {
    return (
      <section aria-label={title} className={cn(surfaceClass(appearance), className)}>
        <Inline
          className={cn(cardClass(appearance), 'justify-between p-[var(--rui-content-padding)]')}
        >
          <Inline>
            <Check className="size-4 text-success" aria-hidden="true" />
            <Text as="span" variant="interface">
              已采用 {accepted.label}
            </Text>
          </Inline>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              onUndo?.(accepted);
              setAccepted(null);
            }}
          >
            <RotateCcw aria-hidden="true" />
            撤销
          </Button>
        </Inline>
      </section>
    );
  }

  return (
    <section aria-label={title} className={cn(surfaceClass(appearance), className)}>
      <Stack className={cn(cardClass(appearance), 'p-[var(--rui-content-padding)]')}>
        <Inline className="justify-between">
          <Heading size="item">{title}</Heading>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? '收起' : '展开'}
          </Button>
        </Inline>
        {open ? (
          <>
            <Text variant="interface">{current.label}</Text>
            <Text variant="caption" tone="muted">
              {current.reason}
            </Text>
            <Inline>
              {Array.from({ length: 3 }, (_, mark) => (
                <span
                  key={mark}
                  className={cn('h-1.5 w-6 rounded-full', mark < signal ? 'bg-accent' : 'bg-muted')}
                  aria-hidden="true"
                />
              ))}
              <Text as="span" variant="caption" tone="muted">
                {signalText[signal]}
              </Text>
            </Inline>
            {options.length > 1 ? (
              <Inline>
                {options.map((option, optionIndex) => (
                  <Button
                    key={option.id}
                    type="button"
                    size="xs"
                    variant={optionIndex === index ? 'secondary' : 'ghost'}
                    onClick={() => setIndex(optionIndex)}
                  >
                    {option.label}
                  </Button>
                ))}
              </Inline>
            ) : null}
            <Inline>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onAccept?.(current);
                  setAccepted(current);
                }}
              >
                采用 {current.label}
              </Button>
            </Inline>
          </>
        ) : null}
      </Stack>
    </section>
  );
}
