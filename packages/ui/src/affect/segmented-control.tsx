import { useState, type ReactNode } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../primitives/toggle-group.js';
import { Tabs, TabsList, TabsTrigger } from '../primitives/tabs.js';
import { cn } from '../lib/utils.js';

export type SegmentOption<T extends string = string> = {
  value: T;
  label?: ReactNode;
  icon?: ReactNode;
  count?: number | string;
  badge?: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  controls?: string;
};

export type SegmentedControlProps<T extends string = string> = {
  options: SegmentOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'tray' | 'underline';
  fullWidth?: boolean;
  kind?: 'radio' | 'tabs';
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
};

const sizeMap = { sm: 'sm', md: 'default', lg: 'lg' } as const;

/** Segmented switch over ToggleGroup or Tabs. */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  defaultValue,
  onChange,
  size = 'md',
  variant = 'tray',
  fullWidth = false,
  kind = 'radio',
  disabled = false,
  className,
  ...aria
}: SegmentedControlProps<T>) {
  const first = options.find((option) => !option.disabled)?.value;
  const [internal, setInternal] = useState<T | undefined>(defaultValue ?? first);
  const current = value ?? internal;

  function select(next: T) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  const content = (option: SegmentOption<T>) => (
    <span className="inline-flex items-center gap-1">
      {option.icon}
      {option.label}
      {option.count != null ? <span className="text-muted-foreground">{option.count}</span> : null}
      {option.badge}
    </span>
  );

  if (kind === 'tabs' || variant === 'underline') {
    return (
      <Tabs
        value={current}
        onValueChange={(next) => select(next as T)}
        className={cn(fullWidth && 'w-full', className)}
      >
        <TabsList
          variant={variant === 'underline' ? 'line' : 'default'}
          className={cn(fullWidth && 'w-full')}
          aria-label={aria['aria-label']}
        >
          {options.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              disabled={disabled || option.disabled}
              aria-label={option.ariaLabel}
              aria-controls={option.controls}
            >
              {content(option)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    );
  }

  return (
    <ToggleGroup
      value={current ? [current] : []}
      onValueChange={(next) => {
        const picked = next[0] as T | undefined;
        if (picked) select(picked);
      }}
      disabled={disabled}
      size={sizeMap[size]}
      variant="outline"
      spacing={0}
      aria-label={aria['aria-label']}
      className={cn(fullWidth && 'w-full', className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          aria-label={option.ariaLabel}
          className={cn(fullWidth && 'flex-1')}
        >
          {content(option)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
