import { useId, useState } from 'react';
import { X } from 'lucide-react';
import { Heading, Inline, Stack } from '../basic/composition.js';
import { Button } from '../primitives/button.js';
import { Checkbox } from '../primitives/checkbox.js';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../primitives/collapsible.js';
import { Label } from '../primitives/label.js';
import { cn } from '../lib/utils.js';
import { cardClass, surfaceClass, type AffectAppearance } from './shared.js';

export type FilterOption = { id: string; label: string };
export type FilterGroup = {
  id: string;
  label: string;
  options: FilterOption[];
  chipPrefix?: string;
};
export type FilterValue = Record<string, string[]>;
export type FilterMenuProps = {
  groups: FilterGroup[];
  value?: FilterValue;
  defaultValue?: FilterValue;
  onChange?: (value: FilterValue) => void;
  defaultOpen?: string[];
  title?: string;
  hints?: boolean;
  appearance?: AffectAppearance;
  className?: string;
};

/** Grouped filters with removable chips. Keyboard uses native checkboxes. */
export function FilterMenu({
  groups,
  value,
  defaultValue = {},
  onChange,
  defaultOpen,
  title = '筛选',
  hints = true,
  appearance = 'default',
  className,
}: FilterMenuProps) {
  const labelId = useId();
  const [internal, setInternal] = useState<FilterValue>(defaultValue);
  const [open, setOpen] = useState<string[]>(defaultOpen ?? (groups[0] ? [groups[0].id] : []));
  const current = value ?? internal;

  function update(next: FilterValue) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  function toggle(groupId: string, optionId: string) {
    const selected = new Set(current[groupId] ?? []);
    if (selected.has(optionId)) selected.delete(optionId);
    else selected.add(optionId);
    update({ ...current, [groupId]: [...selected] });
  }

  const chips = groups
    .flatMap((group) =>
      (current[group.id] ?? []).map((optionId) => {
        const option = group.options.find((item) => item.id === optionId);
        return option
          ? {
              key: `${group.id}:${option.id}`,
              group,
              option,
              label: `${group.chipPrefix ?? ''}${option.label}`,
            }
          : null;
      }),
    )
    .filter(Boolean) as { key: string; group: FilterGroup; option: FilterOption; label: string }[];

  return (
    <section aria-labelledby={labelId} className={cn(surfaceClass(appearance), className)}>
      <Stack className={cn(cardClass(appearance), 'p-[var(--rui-content-padding)]')}>
        <Heading id={labelId} size="item">
          {title}
        </Heading>
        {chips.length ? (
          <Inline>
            {chips.map((chip) => (
              <Button
                key={chip.key}
                type="button"
                size="xs"
                variant="secondary"
                onClick={() => toggle(chip.group.id, chip.option.id)}
              >
                {chip.label}
                <X aria-hidden="true" />
              </Button>
            ))}
            <Button type="button" size="xs" variant="ghost" onClick={() => update({})}>
              清除全部
            </Button>
          </Inline>
        ) : null}
        <div className="grid gap-[var(--rui-content-gap-sm)]">
          {groups.map((group) => {
            const selected = current[group.id] ?? [];
            return (
              <Collapsible
                key={group.id}
                open={open.includes(group.id)}
                onOpenChange={(next) =>
                  setOpen((currentOpen) =>
                    next ? [...currentOpen, group.id] : currentOpen.filter((id) => id !== group.id),
                  )
                }
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-[var(--rui-radius)] py-[var(--rui-cell-padding-y)] text-left text-[length:var(--rui-font-interface)] focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring">
                  <span>
                    {group.label}
                    {selected.length ? (
                      <span className="ml-2 text-muted-foreground">{selected.length}</span>
                    ) : null}
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="grid gap-1 py-[var(--rui-content-gap-sm)]">
                    {group.options.map((option) => {
                      const optionId = `${group.id}-${option.id}`;
                      return (
                        <li key={option.id} className="flex items-center gap-2">
                          <Checkbox
                            id={optionId}
                            checked={selected.includes(option.id)}
                            onCheckedChange={() => toggle(group.id, option.id)}
                          />
                          <Label htmlFor={optionId}>{option.label}</Label>
                        </li>
                      );
                    })}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
        {hints ? (
          <p className="text-[length:var(--rui-font-caption)] text-muted-foreground">
            空格选择 · 方向键移动
          </p>
        ) : null}
      </Stack>
    </section>
  );
}
