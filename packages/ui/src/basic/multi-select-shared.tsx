import { Check, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { ComboboxGroup, ComboboxItem, ComboboxLabel, ComboboxList } from '../primitives/combobox.js';

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
  group?: string;
  disabled?: boolean;
}

export interface MultiSelectEnhancementProps<TOption extends MultiSelectOption = MultiSelectOption> {
  showSelectAll?: boolean;
  selectAllLabel?: string;
  clearAllLabel?: string;
  onCreateOption?: (label: string) => TOption | Promise<TOption>;
  createLabel?: (label: string) => string;
  creatingLabel?: string;
  onCreateError?: (error: unknown, label: string) => void;
}

export function filterMultiSelectOptions<TOption extends MultiSelectOption>(options: TOption[], query: string) {
  const term = query.trim().toLocaleLowerCase();
  if (!term) return options;
  return options.filter(option => [option.label, option.description, option.group].some(value => value?.toLocaleLowerCase().includes(term)));
}

export function mergeMultiSelectOptions<TOption extends MultiSelectOption>(options: TOption[], created: TOption[]) {
  const merged = new Map<string, TOption>();
  for (const option of [...created, ...options]) merged.set(option.value, option);
  return [...merged.values()];
}

export function toggleVisibleSelection(selected: string[], visibleOptions: MultiSelectOption[]) {
  const available = visibleOptions.filter(option => !option.disabled).map(option => option.value);
  const selectedSet = new Set(selected);
  const allSelected = available.length > 0 && available.every(value => selectedSet.has(value));
  if (allSelected) return selected.filter(value => !available.includes(value));
  return [...selected, ...available.filter(value => !selectedSet.has(value))];
}

export function clearRemovableSelection(selected: string[], optionMap: Map<string, MultiSelectOption>) {
  return selected.filter(value => optionMap.get(value)?.disabled);
}

export function hasExactMultiSelectOption(options: MultiSelectOption[], query: string) {
  const term = query.trim().toLocaleLowerCase();
  return !term || options.some(option => option.label.trim().toLocaleLowerCase() === term || option.value.trim().toLocaleLowerCase() === term);
}

export function MultiSelectActions({ selected, visibleOptions, optionMap, showSelectAll, selectAllLabel = '全选当前结果', clearAllLabel = '清除已选', onValueChange }: {
  selected: string[];
  visibleOptions: MultiSelectOption[];
  optionMap: Map<string, MultiSelectOption>;
  showSelectAll?: boolean;
  selectAllLabel?: string;
  clearAllLabel?: string;
  onValueChange: (value: string[]) => void;
}) {
  const available = visibleOptions.filter(option => !option.disabled);
  const selectedCount = available.filter(option => selected.includes(option.value)).length;
  const allSelected = available.length > 0 && selectedCount === available.length;
  const partiallySelected = selectedCount > 0 && !allSelected;
  const removableCount = selected.filter(value => !optionMap.get(value)?.disabled).length;
  if (!showSelectAll) return null;
  return <div data-slot="multi-select-actions" className="flex min-w-0 items-center gap-1 border-b border-border px-1 py-1">
    {showSelectAll && <Button type="button" variant="ghost" size="xs" role="checkbox" aria-checked={partiallySelected ? 'mixed' : allSelected} disabled={available.length === 0} onMouseDown={event => event.preventDefault()} onClick={() => onValueChange(toggleVisibleSelection(selected, visibleOptions))} className="min-w-0 justify-start">
      {partiallySelected ? <Minus aria-hidden="true" /> : <Check aria-hidden="true" className={allSelected ? undefined : 'opacity-40'} />}
      <span className="truncate">{selectAllLabel}</span>
      <span className="text-muted-foreground">{selectedCount}/{available.length}</span>
    </Button>}
    {removableCount > 0 && <Button type="button" variant="ghost" size="xs" onMouseDown={event => event.preventDefault()} onClick={() => onValueChange(clearRemovableSelection(selected, optionMap))} className="ml-auto shrink-0 text-muted-foreground"><Trash2 aria-hidden="true" />{clearAllLabel}</Button>}
  </div>;
}

export function MultiSelectCreateAction({ label, creating, onCreate }: { label: string; creating: boolean; onCreate: () => void }) {
  return <div data-slot="multi-select-create" className="border-t border-border p-1">
    <Button type="button" variant="ghost" size="xs" disabled={creating} onMouseDown={event => event.preventDefault()} onClick={onCreate} className="w-full justify-start">
      {creating ? <span className="size-3 animate-spin rounded-full border border-current border-r-transparent motion-reduce:animate-none" aria-hidden="true" /> : <Plus aria-hidden="true" />}
      <span className="truncate">{label}</span>
    </Button>
  </div>;
}

export function MultiSelectOptionList({ options }: { options: MultiSelectOption[] }) {
  const groups = new Map<string, MultiSelectOption[]>();
  for (const option of options) { const group = option.group ?? ''; groups.set(group, [...(groups.get(group) ?? []), option]); }
  return <ComboboxList>{[...groups.entries()].map(([group, groupOptions]) => group ? <ComboboxGroup key={group}>
    <ComboboxLabel>{group}</ComboboxLabel>{groupOptions.map(option => <MultiSelectOptionItem key={option.value} option={option} />)}
  </ComboboxGroup> : groupOptions.map(option => <MultiSelectOptionItem key={option.value} option={option} />))}</ComboboxList>;
}

function MultiSelectOptionItem({ option }: { option: MultiSelectOption }) {
  return <ComboboxItem value={option.value} disabled={option.disabled}><span className="min-w-0"><span className="block truncate">{option.label}</span>{option.description && <span className="block truncate text-xs text-muted-foreground">{option.description}</span>}</span></ComboboxItem>;
}
