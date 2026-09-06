import type { KeyboardEvent, ReactNode } from 'react';
import type { Row } from '@tanstack/react-table';
import { Input } from '../primitives/input.js';
import { NativeSelect, NativeSelectOption } from '../primitives/native-select.js';

export type DataTableEditValue = string | number | boolean | null;
export type DataTableEditMode = 'cell' | 'row';

export interface DataTableEditOption {
  value: string | number;
  label: string;
}

export interface DataTableEditorRenderProps<TData> {
  row: Row<TData>;
  value: DataTableEditValue;
  onChange: (value: DataTableEditValue) => void;
  onCommit: () => void;
  onCancel: () => void;
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
  autoFocus: boolean;
}

export interface DataTableEditableColumn<TData> {
  id: string;
  label: string;
  kind?: 'text' | 'number' | 'date' | 'select';
  options?: DataTableEditOption[];
  required?: boolean;
  placeholder?: string;
  validate?: (value: DataTableEditValue, row: TData, values: Record<string, DataTableEditValue>) => string | undefined;
  renderEditor?: (props: DataTableEditorRenderProps<TData>) => ReactNode;
}

export interface DataTableEditingState {
  rowId: string;
  columnId?: string;
  values: Record<string, DataTableEditValue>;
}

export interface DataTableEditCommit<TData> {
  mode: DataTableEditMode;
  rowId: string;
  row: TData;
  values: Record<string, DataTableEditValue>;
  changedValues: Record<string, DataTableEditValue>;
}

export function DataTableCellEditor<TData>({ definition, row, value, onChange, onCommit, onCancel, disabled, error, errorId, autoFocus, mode }: {
  definition: DataTableEditableColumn<TData>;
  row: Row<TData>;
  value: DataTableEditValue;
  onChange: (value: DataTableEditValue) => void;
  onCommit: () => void;
  onCancel: () => void;
  disabled: boolean;
  error?: string;
  errorId: string;
  autoFocus: boolean;
  mode: DataTableEditMode;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      return;
    }
    const composing = event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229;
    if (event.key === 'Enter' && !composing && (mode === 'cell' || event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      event.stopPropagation();
      onCommit();
    }
  }
  const shared = { 'aria-label': `编辑${definition.label}`, 'aria-invalid': Boolean(error), 'aria-describedby': error ? errorId : undefined, disabled, autoFocus, onKeyDown };
  if (definition.renderEditor) return definition.renderEditor({ row, value, onChange, onCommit, onCancel, disabled, invalid: Boolean(error), describedBy: error ? errorId : undefined, autoFocus });
  if (definition.kind === 'select') return <NativeSelect {...shared} size="sm" value={value === null ? '' : String(value)} onChange={event => { const option = definition.options?.find(item => String(item.value) === event.target.value); onChange(option?.value ?? event.target.value); }}><NativeSelectOption value="">请选择</NativeSelectOption>{definition.options?.map(option => <NativeSelectOption key={String(option.value)} value={option.value}>{option.label}</NativeSelectOption>)}</NativeSelect>;
  return <Input {...shared} type={definition.kind === 'number' ? 'number' : definition.kind === 'date' ? 'date' : 'text'} placeholder={definition.placeholder} className="h-[var(--rui-control-height-sm)] rounded-md px-[var(--rui-space-2)]" value={value === null ? '' : String(value)} onChange={event => onChange(definition.kind === 'number' ? event.target.value === '' ? null : Number(event.target.value) : event.target.value)} />;
}
