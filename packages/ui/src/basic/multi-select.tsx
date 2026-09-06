import { useId, useMemo, type ReactNode } from 'react';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Combobox, ComboboxChips, ComboboxChip, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from '../primitives/combobox.js';
import { Label } from '../primitives/label.js';
import { Spinner } from '../primitives/spinner.js';
import { cn } from '../lib/utils.js';

export interface MultiSelectOption { value: string; label: string; disabled?: boolean }
export interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  name?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  description?: ReactNode;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

/** String-valued multiselection; chip navigation/removal and popup focus stay with Base UI. */
export function MultiSelect({ label, options, value, defaultValue, onValueChange, name, disabled = false, loading = false, error, description, placeholder = '搜索并选择…', emptyMessage = '没有匹配的选项', className }: MultiSelectProps) {
  const id = useId();
  const anchor = useComboboxAnchor();
  const labels = useMemo(() => new Map(options.map(option => [option.value, option.label])), [options]);
  const optionMap = useMemo(() => new Map(options.map(option => [option.value, option])), [options]);
  const items = useMemo(() => options.map(option => option.value), [options]);
  const describedBy = [description ? `${id}-description` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return <div data-slot="multi-select" className={cn('grid min-w-0 gap-2 text-sm', className)}>
    <Label htmlFor={id}>{label}</Label>
    <Combobox<string, true> multiple items={items} value={value} defaultValue={defaultValue} onValueChange={onValueChange} itemToStringLabel={item => labels.get(item) ?? item} disabled={disabled || loading} name={name}>
      <ComboboxChips ref={anchor} className="min-h-[var(--rui-control-height)]" aria-busy={loading}>
        <ComboboxValue>{(selected: string[]) => selected.map(item => <ComboboxChip key={item} showRemove={false}>
          <span>{labels.get(item) ?? item}</span>
          <ComboboxPrimitive.ChipRemove aria-label={`移除${labels.get(item) ?? item}`} render={<Button variant="ghost" size="icon-xs" className="-mr-1" />}><X className="size-3" aria-hidden="true" /></ComboboxPrimitive.ChipRemove>
        </ComboboxChip>)}</ComboboxValue>
        <ComboboxChipsInput id={id} placeholder={loading ? '正在加载选项…' : placeholder} aria-invalid={Boolean(error)} aria-describedby={describedBy} />
        {loading && <Spinner aria-label="正在加载选项" />}
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item} disabled={optionMap.get(item)?.disabled}>{labels.get(item) ?? item}</ComboboxItem>}</ComboboxList>
      </ComboboxContent>
    </Combobox>
    {description && <p id={`${id}-description`} className="text-xs leading-relaxed text-muted-foreground">{description}</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
  </div>;
}
