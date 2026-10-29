import { useId, type ReactNode } from 'react';
import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field';
import { Minus, Plus } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Label } from '../primitives/label.js';
import { cn } from '../lib/utils.js';

export interface NumberFieldProps
  extends Omit<NumberFieldPrimitive.Root.Props, 'children' | 'className'> {
  label: string;
  description?: ReactNode;
  error?: string;
  inputPlaceholder?: string;
  incrementLabel?: string;
  decrementLabel?: string;
  className?: string;
}

/** Base UI manages locale parsing, nullable input, stepping, clamping and commit events. */
export function NumberField({
  label,
  description,
  error,
  inputPlaceholder,
  incrementLabel = `增加${label}`,
  decrementLabel = `减少${label}`,
  id: suppliedId,
  className,
  ...props
}: NumberFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const describedBy =
    [description ? `${id}-description` : '', error ? `${id}-error` : '', props['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <NumberFieldPrimitive.Root
      id={id}
      data-slot="number-field"
      className={cn('grid min-w-0 gap-2 text-sm', className)}
      {...props}
    >
      <Label htmlFor={id}>{label}</Label>
      <NumberFieldPrimitive.Group
        data-slot="number-field-group"
        className={cn([
          // Layout
          'relative flex h-[var(--rui-control-height)] w-full min-w-0 items-center',
          // Surface
          'rounded-[var(--rui-component-input-radius)] border border-input',
          // Motion
          'transition-colors',
          // Surface
          'outline-none',
          // Keyboard focus
          'focus-within:border-ring focus-within:ring-[length:var(--rui-focus-width)] focus-within:ring-ring/50',
          // Disabled state
          'data-disabled:opacity-[var(--rui-opacity-disabled)]',
          // Validation state
          'rui-validation',
          // Dark theme
          'dark:bg-input/30',
        ])}
      >
        <NumberFieldPrimitive.Decrement
          aria-label={decrementLabel}
          render={
            <Button size="icon" variant="ghost" className="rounded-r-none border-r border-border" />
          }
        >
          <Minus aria-hidden="true" />
        </NumberFieldPrimitive.Decrement>
        <NumberFieldPrimitive.Input
          data-slot="input-group-control"
          placeholder={inputPlaceholder}
          aria-invalid={Boolean(error) || props['aria-invalid']}
          aria-describedby={describedBy}
          className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-center text-sm tabular-nums outline-none disabled:cursor-not-allowed"
        />
        <NumberFieldPrimitive.Increment
          aria-label={incrementLabel}
          render={
            <Button size="icon" variant="ghost" className="rounded-l-none border-l border-border" />
          }
        >
          <Plus aria-hidden="true" />
        </NumberFieldPrimitive.Increment>
      </NumberFieldPrimitive.Group>
      {description && (
        <p id={`${id}-description`} className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </NumberFieldPrimitive.Root>
  );
}
