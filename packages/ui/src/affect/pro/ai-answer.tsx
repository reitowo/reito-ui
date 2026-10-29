import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../primitives/hover-card.js';
import { cn } from '../../lib/utils.js';
import { MessageActions } from '../message-actions.js';
import { usePrefersReducedMotion } from '../shared.js';

export type AnswerSource = {
  title: string;
  name: string;
  href?: string;
  icon?: ReactNode;
  snippet?: string;
};
export type AIAnswerProps = {
  question: string;
  sources?: AnswerSource[];
  answer: string;
  streaming?: boolean;
  animate?: boolean;
  speed?: number;
  followUps?: string[];
  onFollowUp?: (question: string) => void;
  onRegenerate?: () => void;
  onStop?: () => void;
  onFeedback?: (value: 'up' | 'down', reason?: string) => void;
  feedbackReasons?: string[];
  onCopy?: (text: string) => void;
  className?: string;
};

type AnswerPart =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'cite'; indexes: number[] }
  | { type: 'break' }
  | { type: 'li'; text: string };

function parseInline(text: string): AnswerPart[] {
  const parts: AnswerPart[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[\d+(?:\s*,\s*\d+)*\])/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) parts.push({ type: 'text', text: text.slice(last, start) });
    const token = match[0];
    if (token.startsWith('**')) parts.push({ type: 'bold', text: token.slice(2, -2) });
    else {
      const indexes = token
        .slice(1, -1)
        .split(',')
        .map((value) => Number.parseInt(value.trim(), 10))
        .filter((value) => Number.isFinite(value) && value > 0);
      if (indexes.length) parts.push({ type: 'cite', indexes });
    }
    last = start + token.length;
  }
  if (last < text.length) parts.push({ type: 'text', text: text.slice(last) });
  return parts;
}

function parseAnswer(answer: string): AnswerPart[][] {
  return answer
    .split(/\n{2,}/)
    .map((block) =>
      block.split('\n').flatMap((line, index, lines) => {
        const trimmed = line.trim();
        const prefix = trimmed.startsWith('- ')
          ? ([{ type: 'li', text: trimmed.slice(2) }] as AnswerPart[])
          : parseInline(line);
        return index < lines.length - 1 ? [...prefix, { type: 'break' as const }] : prefix;
      }),
    )
    .filter((block) => block.length);
}

function plainAnswer(answer: string, sources: AnswerSource[]) {
  const body = answer
    .replaceAll(/\*\*([^*]+)\*\*/g, '$1')
    .replaceAll(/\[\d+(?:\s*,\s*\d+)*\]/g, '')
    .trim();
  if (!sources.length) return body;
  return `${body}\n\n${sources.map((source, index) => `${index + 1}. ${source.title}`).join('\n')}`;
}

/** Recreated from public AI Answer docs. Not Pro source. */
export function AIAnswer({
  question,
  sources = [],
  answer,
  streaming = false,
  animate = true,
  speed = 38,
  followUps,
  onFollowUp,
  onRegenerate,
  onStop,
  onFeedback,
  feedbackReasons = ['不准确', '来源错误', '过长', '过时'],
  onCopy,
  className,
}: AIAnswerProps) {
  const reduced = usePrefersReducedMotion();
  const instant = reduced || !animate;
  const [shown, setShown] = useState(instant ? answer : '');
  const [active, setActive] = useState<number | null>(null);
  const blocks = useMemo(() => parseAnswer(shown), [shown]);
  const catchingUp = shown.length < answer.length;
  const busy = catchingUp || streaming;

  useEffect(() => {
    if (instant) {
      setShown(answer);
      return;
    }
    if (!answer.startsWith(shown) && shown && !answer.startsWith(shown.slice(0, 12))) {
      setShown('');
    }
    if (shown.length >= answer.length) return;
    const words = Math.max(1, speed);
    const timer = window.setTimeout(
      () => setShown(answer.slice(0, Math.min(answer.length, shown.length + Math.ceil(words / 4)))),
      80,
    );
    return () => window.clearTimeout(timer);
  }, [answer, shown, instant, speed]);

  return (
    <article
      aria-label={question}
      aria-busy={busy}
      className={cn(
        'grid max-w-xl gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Heading size="item">{question}</Heading>
      {sources.length ? (
        <Stack gap="small">
          <Text variant="caption" tone="muted">
            {busy && catchingUp ? `正在阅读 ${sources.length} 个来源` : `来源 · ${sources.length}`}
          </Text>
          <div className="flex gap-2 overflow-x-auto">
            {sources.map((source, index) => (
              <a
                key={`${source.name}-${index}`}
                href={source.href ?? '#'}
                onClick={(event) => {
                  if (!source.href) event.preventDefault();
                }}
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                className={cn(
                  'min-w-[var(--rui-container-3xs)] rounded-[var(--rui-radius)] border border-border p-2',
                  active === index && 'border-ring bg-muted',
                )}
              >
                <Text variant="interface">{source.title}</Text>
                <Text variant="caption" tone="muted">
                  {source.name}
                </Text>
              </a>
            ))}
          </div>
        </Stack>
      ) : null}
      <div className="grid gap-[var(--rui-content-gap-sm)] text-[length:var(--rui-font-reading)] leading-[var(--rui-line-reading)]">
        {blocks.map((block, blockIndex) => (
          <p key={blockIndex}>
            {block.map((part, partIndex) => {
              if (part.type === 'break') return <br key={partIndex} />;
              if (part.type === 'li') return <span key={partIndex}>• {part.text} </span>;
              if (part.type === 'bold') return <strong key={partIndex}>{part.text}</strong>;
              if (part.type === 'cite') {
                return part.indexes.map((cite) => {
                  const source = sources[cite - 1];
                  if (!source) return null;
                  return (
                    <HoverCard key={`${partIndex}-${cite}`}>
                      <HoverCardTrigger
                        render={
                          <button
                            type="button"
                            className={cn(
                              'mx-0.5 rounded-full border border-border px-1.5 text-[length:var(--rui-font-caption)]',
                              active === cite - 1 && 'border-ring bg-muted',
                            )}
                            onMouseEnter={() => setActive(cite - 1)}
                            onMouseLeave={() => setActive(null)}
                            aria-label={source.name}
                          />
                        }
                      >
                        {source.name}
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <Text variant="interface">{source.title}</Text>
                        {source.snippet ? (
                          <Text variant="caption" tone="muted">
                            {source.snippet}
                          </Text>
                        ) : null}
                      </HoverCardContent>
                    </HoverCard>
                  );
                });
              }
              return <span key={partIndex}>{part.text}</span>;
            })}
            {busy && blockIndex === blocks.length - 1 ? (
              <span className="ml-1 inline-block size-1.5 animate-pulse rounded-full bg-foreground" />
            ) : null}
          </p>
        ))}
      </div>
      <Inline className="justify-between">
        <MessageActions
          text={plainAnswer(answer, sources)}
          onCopy={(text) => onCopy?.(text ?? plainAnswer(answer, sources))}
          onRegenerate={onRegenerate}
          regenerating={busy}
          onFeedback={(kind, reason) => {
            if (kind) onFeedback?.(kind, reason);
          }}
          reasons={feedbackReasons}
          actions={['copy', 'regenerate', 'feedback']}
        />
        {busy && onStop ? (
          <Button type="button" size="xs" variant="ghost" onClick={onStop}>
            停止
          </Button>
        ) : null}
      </Inline>
      {!busy && followUps?.length ? (
        <Inline>
          {followUps.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onFollowUp?.(item)}
            >
              {item}
            </Button>
          ))}
        </Inline>
      ) : null}
    </article>
  );
}
