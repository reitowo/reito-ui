import { useId, useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';

export type CitedSegment = { text: string; cite?: string[]; paragraph?: boolean };
export type CitedSource = {
  id: string;
  title: string;
  site: string;
  url?: string;
  date?: string;
  quote?: string;
  highlight?: string[];
  icon?: ReactNode;
};
export type CitedAnswerProps = {
  segments: CitedSegment[];
  sources: CitedSource[];
  pagesRead?: number;
  defaultOpen?: string;
  onOpenSource?: (source: CitedSource) => void;
  onPreviewChange?: (id: string | null) => void;
  action?: { label: string; onClick: () => void };
  className?: string;
};

function sharedWords(quote: string, sentences: string[]) {
  const hay = sentences.join(' ').toLowerCase();
  return quote.split(/\s+/).filter((word) => {
    const clean = word.replace(/[^\p{L}\p{N}]/gu, '');
    return (clean.length >= 5 || /\d/.test(clean)) && hay.includes(clean.toLowerCase());
  });
}

/** Recreated from public Cited Answer docs. Not Pro source. */
export function CitedAnswer({
  segments,
  sources,
  pagesRead,
  defaultOpen,
  onOpenSource,
  onPreviewChange,
  action,
  className,
}: CitedAnswerProps) {
  const previewId = useId();
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const [hover, setHover] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const active = hover ?? open;
  const known = useMemo(() => new Set(sources.map((source) => source.id)), [sources]);
  const current = sources.find((source) => source.id === open);

  function setPreview(id: string | null) {
    setOpen(id);
    onPreviewChange?.(id);
  }

  const sentences = segments
    .filter((segment) => segment.cite?.some((id) => id === open))
    .map((segment) => segment.text);

  return (
    <article
      className={cn(
        'grid max-w-md gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Text variant="caption" tone="muted">
        {sources.length} 个来源{pagesRead != null ? ` · 已读 ${pagesRead} 页` : ''}
      </Text>
      <div className="text-[length:var(--rui-font-reading)] leading-[var(--rui-line-reading)]">
        {segments.map((segment, index) => {
          const cites = (segment.cite ?? []).filter((id) => known.has(id));
          const lit = Boolean(active && cites.includes(active));
          const dim = Boolean(active && cites.length && !lit);
          const node = (
            <span
              key={index}
              className={cn(
                segment.paragraph && 'mt-[var(--rui-content-gap-sm)] block',
                lit && 'rounded-sm bg-muted',
                dim && 'text-muted-foreground',
              )}
            >
              {segment.text}
              {cites.map((id) => {
                const source = sources.find((item) => item.id === id);
                if (!source) return null;
                const number = sources.findIndex((item) => item.id === id) + 1;
                return (
                  <button
                    key={`${index}-${id}`}
                    type="button"
                    className={cn(
                      'ml-0.5 align-super text-[length:var(--rui-font-caption)] text-muted-foreground',
                      active === id && 'text-foreground',
                    )}
                    aria-expanded={open === id}
                    aria-controls={previewId}
                    aria-label={`来源 ${number}：${source.title}`}
                    onMouseEnter={() => setHover(id)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(id)}
                    onBlur={() => setHover(null)}
                    onClick={() => setPreview(open === id ? null : id)}
                  >
                    {number}
                  </button>
                );
              })}
            </span>
          );
          return node;
        })}
      </div>
      <div className="flex flex-wrap gap-1" role="list">
        {sources.map((source, index) => (
          <button
            key={source.id}
            type="button"
            role="listitem"
            aria-expanded={open === source.id}
            aria-controls={previewId}
            aria-label={`来源 ${index + 1}：${source.title}`}
            className={cn(
              'rounded-full border border-border px-2 py-0.5 text-[length:var(--rui-font-caption)]',
              active === source.id && 'border-ring bg-muted',
            )}
            onMouseEnter={() => setHover(source.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(source.id)}
            onBlur={() => setHover(null)}
            onClick={() => setPreview(open === source.id ? null : source.id)}
          >
            {index + 1} {source.site}
          </button>
        ))}
      </div>
      <section
        id={previewId}
        aria-label="引文预览"
        hidden={!current}
        inert={!current ? true : undefined}
        className="rounded-[var(--rui-radius)] border border-border bg-muted p-[var(--rui-content-padding)]"
      >
        {current ? (
          <Stack gap="small">
            <Heading size="item">
              {sources.findIndex((item) => item.id === current.id) + 1}. {current.title}
            </Heading>
            <Text variant="caption" tone="muted">
              {current.site}
              {current.date ? ` · ${current.date}` : ''}
            </Text>
            {current.quote ? (
              <p className="text-[length:var(--rui-font-reading)]">
                {current.quote.split(/(\s+)/).map((word, index) => {
                  const marks = current.highlight?.length
                    ? current.highlight
                    : sharedWords(current.quote ?? '', sentences);
                  const hit = marks.some((mark) => word.toLowerCase().includes(mark.toLowerCase()));
                  return (
                    <span key={index} className={hit ? 'bg-background' : undefined}>
                      {word}
                    </span>
                  );
                })}
              </p>
            ) : null}
            <Inline>
              {current.quote ? (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    void navigator.clipboard.writeText(current.quote ?? '');
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1200);
                  }}
                >
                  复制引文
                </Button>
              ) : null}
              {current.url || onOpenSource ? (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    if (onOpenSource) onOpenSource(current);
                    else if (current.url) window.open(current.url, '_blank', 'noreferrer');
                  }}
                >
                  打开来源
                </Button>
              ) : null}
            </Inline>
          </Stack>
        ) : null}
      </section>
      <Text variant="caption" tone="muted" aria-live="polite">
        {copied ? '已复制引文' : active ? sources.find((item) => item.id === active)?.title : ''}
      </Text>
      {action ? (
        <Button type="button" size="sm" variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </article>
  );
}
