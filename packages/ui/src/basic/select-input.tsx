"use client";

import type * as React from 'react';
import type { Select as SelectPrimitive } from '@base-ui/react/select';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../primitives/select.js';

export interface SelectOption<Value extends string | number = string> {
  value: Value;
  label: React.ReactNode;
  disabled?: boolean;
}

export type SelectInputProps<Value extends string | number = string> = Pick<
  SelectPrimitive.Root.Props<Value>,
  'value' | 'defaultValue' | 'name' | 'form' | 'autoComplete' | 'required' | 'readOnly' | 'disabled'
> & Omit<
  React.ComponentProps<typeof SelectTrigger>,
  'value' | 'defaultValue' | 'name' | 'form' | 'autoComplete' | 'disabled' | 'children' | 'render' | 'onChange'
> & {
  options: readonly SelectOption<Value>[];
  placeholder?: React.ReactNode;
  /** Returns the option value itself, preserving number values. No synthetic DOM change event. */
  onValueChange?: (value: Value, details: SelectPrimitive.Root.ChangeEventDetails) => void;
};

/**
 * Data-driven single select for application forms and toolbars.
 * Uses the same Graphite Select parts as compound compositions, including its portalled menu.
 * Null represents no selection; selecting an option reports its non-null value.
 * The ref, id, label and validation attributes belong to the focusable trigger.
 */
export function SelectInput<Value extends string | number = string>({
  options, value, defaultValue, onValueChange, placeholder = '请选择',
  name, form, autoComplete, required, readOnly, disabled, ...triggerProps
}: SelectInputProps<Value>) {
  return <Select<Value>
    items={options} value={value} defaultValue={defaultValue}
    name={name} form={form} autoComplete={autoComplete}
    required={required} readOnly={readOnly} disabled={disabled}
    onValueChange={(next, details) => { if (next !== null) onValueChange?.(next, details); }}
  >
    <SelectTrigger {...triggerProps}><SelectValue placeholder={placeholder} /></SelectTrigger>
    <SelectContent align="start" alignItemWithTrigger={false}>
      <SelectGroup>{options.map(option => <SelectItem key={`${typeof option.value}:${option.value}`} value={option.value} disabled={option.disabled}>{option.label}</SelectItem>)}</SelectGroup>
    </SelectContent>
  </Select>;
}
