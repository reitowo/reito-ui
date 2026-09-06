import { useId } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../primitives/select.js';
import { classes } from './shared.js';

export interface ModelOption { id: string; name: string; description?: string; disabled?: boolean }
export interface ModelSelectorProps {
  options: ModelOption[];
  value: string | null;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  compact?: boolean;
  className?: string;
}

/** Model labels and availability belong to the caller; changing this field does not connect a service. */
export function ModelSelector({ options, value, onValueChange, disabled = false, label = '选择模型', compact = false, className }: ModelSelectorProps) {
  const id = useId();
  return <div className={classes('grid min-w-0 gap-1.5', className)}>
    {!compact && <label htmlFor={id} className="text-xs text-muted-foreground">{label}</label>}
    <Select items={options.map(option => ({ value: option.id, label: option.name }))} value={value} onValueChange={next => { if (next !== null) onValueChange(next); }} disabled={disabled || !options.length}>
      <SelectTrigger id={id} aria-label={label} size="sm" className={classes('max-w-full', compact && 'border-transparent bg-transparent shadow-none dark:bg-transparent')}><SelectValue placeholder={options.length ? '选择模型' : '没有可用模型'} /></SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false}>{options.map(option => <SelectItem key={option.id} value={option.id} disabled={option.disabled}><span className="grid min-w-0 gap-0.5"><span>{option.name}</span>{option.description && <span className="text-xs text-muted-foreground">{option.description}</span>}</span></SelectItem>)}</SelectContent>
    </Select>
  </div>;
}
