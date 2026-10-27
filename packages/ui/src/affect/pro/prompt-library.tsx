import { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { Label } from '../../primitives/label.js';
import { cn } from '../../lib/utils.js';

export type PromptVariable = { description?: string; default?: string };
export type PromptTemplate = {
  id: string;
  title: string;
  category?: string;
  tone?: string;
  body: string;
  variables?: Record<string, PromptVariable>;
};
export type PromptLibraryProps = {
  templates: PromptTemplate[];
  value?: string;
  defaultValue?: string;
  onSelect?: (id: string) => void;
  onUse?: (prompt: string, template: PromptTemplate, values: Record<string, string>) => void;
  onCopy?: (prompt: string) => void;
  title?: string;
  useLabel?: string;
  className?: string;
};

function tokenPattern() {
  return /\{([A-Za-z0-9_-]+)\}/g;
}

function tokensOf(body: string) {
  return [...body.matchAll(tokenPattern())].map((match) => match[1]!);
}

function fill(body: string, values: Record<string, string>) {
  return body.replace(tokenPattern(), (_, name: string) => values[name] || `{${name}}`);
}

/** Recreated from public Prompt Library docs. Not Pro source. */
export function PromptLibrary({
  templates,
  value,
  defaultValue,
  onSelect,
  onUse,
  onCopy,
  title = '提示',
  useLabel = '使用提示',
  className,
}: PromptLibraryProps) {
  const [query, setQuery] = useState('');
  const [internal, setInternal] = useState(defaultValue ?? templates[0]?.id ?? '');
  const [store, setStore] = useState<Record<string, Record<string, string>>>({});
  const [copied, setCopied] = useState(false);
  const [live, setLive] = useState('');
  const selected = value ?? internal;
  const filtered = templates.filter((item) => {
    const hay = `${item.title} ${item.body} ${item.category ?? ''}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });
  const template = templates.find((item) => item.id === selected) ?? filtered[0];
  const names = template ? [...new Set(tokensOf(template.body))] : [];
  const values = useMemo(() => {
    const current = store[template?.id ?? ''] ?? {};
    const next: Record<string, string> = {};
    for (const name of names) {
      next[name] = current[name] ?? template?.variables?.[name]?.default ?? '';
    }
    return next;
  }, [names, store, template]);
  const ready = names.every((name) => values[name]?.trim());
  const prompt = template ? fill(template.body, values) : '';
  const missing = names.filter((name) => !values[name]?.trim()).length;
  const estimate = Math.max(1, Math.round(prompt.length / 4));

  function choose(id: string) {
    if (value === undefined) setInternal(id);
    onSelect?.(id);
  }

  function setValue(name: string, next: string) {
    if (!template) return;
    setStore((current) => ({
      ...current,
      [template.id]: { ...values, [name]: next },
    }));
    if (names.every((item) => (item === name ? next.trim() : values[item]?.trim()))) {
      setLive('变量已填完');
    }
  }

  return (
    <section
      className={cn(
        '@container grid max-w-xl gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)] @md:grid-cols-[minmax(0,var(--rui-container-3xs))_minmax(0,1fr)]',
        className,
      )}
    >
      <Stack>
        <Heading size="item">{title}</Heading>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索模板"
          aria-label="搜索模板"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setQuery('');
            if (event.key === 'ArrowDown' && filtered[0]) choose(filtered[0].id);
          }}
        />
        <ul role="listbox" aria-label={title} className="grid gap-1">
          {filtered.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={item.id === template?.id}
                tabIndex={item.id === template?.id ? 0 : -1}
                className={cn(
                  'flex w-full flex-col items-start rounded-[var(--rui-radius)] px-2 py-1 text-left',
                  item.id === template?.id ? 'bg-muted' : 'hover:bg-muted/60',
                )}
                onClick={() => choose(item.id)}
              >
                <Text as="span" variant="interface">
                  {item.title}
                </Text>
                {item.category ? (
                  <Text as="span" variant="caption" tone="muted">
                    {item.category}
                    {item.tone ? ` · ${item.tone}` : ''}
                  </Text>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </Stack>
      {template ? (
        <Stack>
          <Text variant="caption" tone="muted" aria-live="polite">
            {live || `${names.filter((name) => values[name]?.trim()).length} / ${names.length} 已填写`}
          </Text>
          <p className="text-[length:var(--rui-font-reading)] leading-[var(--rui-line-reading)]">
            {template.body.split(tokenPattern()).map((chunk, index) => {
              if (index % 2 === 1) {
                const name = chunk;
                return (
                  <label key={`${name}-${index}`} className="mx-0.5 inline-flex flex-col align-baseline">
                    <span className="sr-only">
                      {name}
                      {template.variables?.[name]?.description
                        ? ` — ${template.variables[name]?.description}`
                        : ''}
                    </span>
                    <input
                      value={values[name] ?? ''}
                      onChange={(event) => setValue(name, event.target.value)}
                      placeholder={name}
                      aria-label={name}
                      className="inline-block min-w-[var(--rui-space-16)] border-b border-border bg-transparent text-[length:var(--rui-font-reading)] outline-none focus-visible:border-ring"
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter') return;
                        event.preventDefault();
                        const next = names.find((item) => !values[item]?.trim() && item !== name);
                        if (next) {
                          const field = event.currentTarget
                            .closest('section')
                            ?.querySelector<HTMLInputElement>(`input[aria-label="${next}"]`);
                          field?.focus();
                        } else if (ready) onUse?.(prompt, template, values);
                      }}
                    />
                  </label>
                );
              }
              return <span key={index}>{chunk}</span>;
            })}
          </p>
          <Stack gap="small" className="rounded-[var(--rui-radius)] bg-muted p-2">
            <Text variant="caption" tone="muted">
              预览
            </Text>
            <Text>{prompt}</Text>
          </Stack>
          {names.map((name) => (
            <Label key={name} className="sr-only">
              {name}
              {template.variables?.[name]?.description ? ` — ${template.variables[name]?.description}` : ''}
            </Label>
          ))}
          <Inline className="justify-between">
            <Text variant="caption" tone="muted">
              约 {estimate} tokens
              {ready ? '' : ` · 还差 ${missing} 项`}
            </Text>
            <Inline>
              <Button
                type="button"
                size="xs"
                variant="ghost"
                onClick={() => {
                  void navigator.clipboard.writeText(prompt);
                  onCopy?.(prompt);
                  setCopied(true);
                  setLive('已复制提示');
                  window.setTimeout(() => setCopied(false), 1200);
                }}
              >
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                复制
              </Button>
              <Button
                type="button"
                size="sm"
                aria-disabled={!ready}
                disabled={!ready}
                onClick={() => ready && onUse?.(prompt, template, values)}
              >
                {useLabel}
              </Button>
            </Inline>
          </Inline>
        </Stack>
      ) : null}
    </section>
  );
}
