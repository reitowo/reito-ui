import { useState } from 'react';
import { X } from 'lucide-react';
import { Heading, Stack, Text } from '../basic/composition.js';
import { Button } from '../primitives/button.js';
import { cn } from '../lib/utils.js';
import { type AffectAppearance } from './shared.js';

export type NoticePattern = 'orbit' | 'grid' | 'rays';
export type Notice = {
  id: string;
  badge?: string;
  title: string;
  text: string;
  action?: { label: string; href?: string; onClick?: () => void; external?: boolean };
  pattern?: NoticePattern;
};
export type NotificationStackProps = {
  notices: Notice[];
  onDismiss?: (notice: Notice) => void;
  appearance?: AffectAppearance;
  className?: string;
};

/** Stacked notices. Dismissing the front card reveals the next. */
export function NotificationStack({
  notices,
  onDismiss,
  appearance = 'default',
  className,
}: NotificationStackProps) {
  const [hidden, setHidden] = useState<string[]>([]);
  const visible = notices.filter((notice) => !hidden.includes(notice.id)).slice(0, 3);
  const front = visible[0];

  function dismiss(notice: Notice) {
    setHidden((current) => [...current, notice.id]);
    onDismiss?.(notice);
  }

  if (!front) {
    return (
      <p className={cn('text-[length:var(--rui-font-caption)] text-muted-foreground', className)}>
        没有通知。
      </p>
    );
  }

  return (
    <div className={cn('relative min-w-0', className)} aria-live="polite">
      {visible
        .slice()
        .reverse()
        .map((notice, index, all) => {
          const depth = all.length - 1 - index;
          const isFront = notice.id === front.id;
          return (
            <article
              key={notice.id}
              aria-hidden={!isFront}
              className={cn(
                'rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
                'motion-reduce:transform-none',
                !isFront && 'pointer-events-none absolute inset-x-0 top-0',
                isFront && 'relative',
                appearance === 'clean' && 'shadow-none',
              )}
              style={
                isFront
                  ? undefined
                  : {
                      transform: `translateY(calc(${depth} * var(--rui-space-2))) scale(${1 - depth * 0.03})`,
                    }
              }
            >
              <Stack gap="small">
                {notice.badge ? (
                  <Text as="span" variant="caption" tone="muted">
                    {notice.badge}
                  </Text>
                ) : null}
                <Heading size="item">{notice.title}</Heading>
                <Text variant="caption" tone="muted">
                  {notice.text}
                </Text>
                {isFront ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {notice.action ? (
                      notice.action.href ? (
                        <a
                          href={notice.action.href}
                          target={notice.action.external ? '_blank' : undefined}
                          rel={notice.action.external ? 'noreferrer' : undefined}
                          className="text-[length:var(--rui-font-interface)] text-accent underline-offset-4 hover:underline"
                          onClick={notice.action.onClick}
                        >
                          {notice.action.label}
                        </a>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={notice.action.onClick}
                        >
                          {notice.action.label}
                        </Button>
                      )
                    ) : (
                      <span />
                    )}
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`关闭 ${notice.title}`}
                      onClick={() => dismiss(notice)}
                    >
                      <X />
                    </Button>
                  </div>
                ) : null}
              </Stack>
            </article>
          );
        })}
    </div>
  );
}
