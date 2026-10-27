import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { Inline, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { Label } from '../../primitives/label.js';
import { cn } from '../../lib/utils.js';
import { initials } from '../shared.js';

export type ComboboxOption = {
  value: string;
  label: string;
  hint?: string;
  avatar?: string | boolean | ReactNode;
  color?: string;
  icon?: ReactNode;
  group?: string;
  keywords?: string[];
};
export type AffectComboboxProps = {
  options: ComboboxOption[];
  multiple?: boolean;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[], options: ComboboxOption[]) => void;
  placeholder?: string;
  creatable?: boolean;
  onCreate?: (text: string) => ComboboxOption | void;
  createLabel?: (text: string) => string;
  maxVisibleTags?: number;
  label?: string;
  defaultOpen?: boolean;
  emptyText?: string;
  className?: string;
};

function matches(option: ComboboxOption, query: string) {
  const hay =
    `${option.label} ${option.hint ?? ''} ${option.keywords?.join(' ') ?? ''}`.toLowerCase();
  return hay.includes(query.toLowerCase());
}

/** Recreated from public Combobox docs. Not Pro source. Sibling of basic Combobox. */
export function Combobox({
  options,
  multiple = true,
  value,
  defaultValue = [],
  onChange,
  placeholder = '搜索…',
  creatable = false,
  onCreate,
  createLabel = (text) => `创建 “${text}”`,
  maxVisibleTags,
  label,
  defaultOpen = false,
  emptyText = '没有结果',
  className,
}: AffectComboboxProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(defaultOpen);
  const [cursor, setCursor] = useState(0);
  const [extra, setExtra] = useState<ComboboxOption[]>([]);
  const selected = value ?? internal;
  const all = [...options, ...extra];
  const picked = all.filter((option) => selected.includes(option.value));
  const visible = all.filter((option) => matches(option, query));
  const canCreate =
    creatable &&
    query.trim() &&
    !all.some((option) => option.label.toLowerCase() === query.trim().toLowerCase());
  const rows = canCreate
    ? [...visible, { value: `__create__${query}`, label: createLabel(query.trim()) }]
    : visible;
  const groups = useMemo(() => {
    const map = new Map<string, ComboboxOption[]>();
    for (const option of rows) {
      const key = option.group ?? '';
      map.set(key, [...(map.get(key) ?? []), option]);
    }
    return [...map.entries()];
  }, [rows]);

  function commit(next: string[], created?: ComboboxOption) {
    const pool = created ? [...all, created] : all;
    if (value === undefined) setInternal(next);
    onChange?.(
      next,
      pool.filter((option) => next.includes(option.value)),
    );
  }

  function toggle(option: ComboboxOption) {
    if (option.value.startsWith('__create__')) {
      const made = onCreate?.(query.trim()) ?? { value: query.trim(), label: query.trim() };
      setExtra((current) => [...current, made]);
      commit(multiple ? [...selected, made.value] : [made.value], made);
      setQuery('');
      if (!multiple) setOpen(false);
      return;
    }
    const next = selected.includes(option.value)
      ? selected.filter((item) => item !== option.value)
      : multiple
        ? [...selected, option.value]
        : [option.value];
    commit(next);
    setQuery('');
    if (!multiple) setOpen(false);
  }

  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setCursor((value) => Math.min(rows.length - 1, value + 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setCursor((value) => Math.max(0, value - 1));
    }
    if (event.key === 'Enter' && rows[cursor]) {
      event.preventDefault();
      toggle(rows[cursor]);
    }
    if (event.key === 'Backspace' && !query && selected.length) {
      commit(selected.slice(0, -1));
    }
    if (event.key === 'Escape') {
      if (open) setOpen(false);
      else setQuery('');
    }
  }

  const chips = maxVisibleTags ? picked.slice(0, maxVisibleTags) : picked;
  const overflow = picked.length - chips.length;

  return (
    <div className={cn('grid max-w-md gap-[var(--rui-content-gap-sm)]', className)}>
      {label ? <Label htmlFor="affect-combobox">{label}</Label> : null}
      <div className="grid gap-1 rounded-[var(--rui-component-input-radius)] border border-border px-[var(--rui-component-input-padding-x)] py-[var(--rui-compact-surface-padding-y)]">
        <Inline>
          {chips.map((option) => (
            <Badge key={option.value} variant="secondary">
              {option.avatar === true ? initials(option.label) : option.icon}
              {option.label}
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label={`移除 ${option.label}`}
                onClick={() => commit(selected.filter((item) => item !== option.value))}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
          {overflow > 0 ? <Badge variant="outline">+{overflow}</Badge> : null}
          <Input
            id="affect-combobox"
            role="combobox"
            aria-expanded={open}
            aria-controls="affect-combobox-list"
            aria-activedescendant={
              rows[cursor] ? `affect-combobox-${rows[cursor].value}` : undefined
            }
            placeholder={picked.length ? '' : placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setCursor(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
            className="min-w-[var(--rui-space-16)] border-0"
          />
        </Inline>
      </div>
      {open ? (
        <ul
          id="affect-combobox-list"
          role="listbox"
          aria-label={label ?? '选项'}
          aria-multiselectable={multiple || undefined}
          className="grid max-h-[var(--rui-container-xs)] overflow-auto rounded-[var(--rui-radius)] border border-border bg-card p-1"
        >
          {groups.map(([group, items]) => (
            <li key={group || 'all'}>
              {group ? (
                <Text variant="caption" tone="muted" className="px-2 py-1">
                  {group}
                </Text>
              ) : null}
              <ul>
                {items.map((option) => {
                  const index = rows.findIndex((item) => item.value === option.value);
                  return (
                    <li key={option.value}>
                      <button
                        id={`affect-combobox-${option.value}`}
                        type="button"
                        role="option"
                        aria-selected={selected.includes(option.value)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-[var(--rui-radius)] px-2 py-1 text-left',
                          index === cursor && 'bg-muted',
                        )}
                        onClick={() => toggle(option)}
                      >
                        <span>
                          {option.icon}
                          {option.label}
                          {option.hint ? (
                            <Text as="span" variant="caption" tone="muted">
                              {' '}
                              {option.hint}
                            </Text>
                          ) : null}
                        </span>
                        {selected.includes(option.value) ? <Check className="size-3" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
          {!rows.length ? (
            <li>
              <Text variant="caption" tone="muted">
                {emptyText}
              </Text>
            </li>
          ) : null}
        </ul>
      ) : null}
      <Text variant="caption" tone="muted" aria-live="polite">
        已选 {picked.length} 项
      </Text>
    </div>
  );
}
