import * as React from 'react';
import { Check, Circle, Eye, EyeOff } from 'lucide-react';
import { Field, FieldDescription, FieldError, FieldLabel } from '../primitives/field.js';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '../primitives/input-group.js';
import { cn } from '../lib/utils.js';

export interface PasswordRule {
  id: string;
  label: React.ReactNode;
  test: RegExp | ((value: string) => boolean);
}

export interface PasswordRuleResult extends PasswordRule {
  passed: boolean;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: React.ReactNode;
}

export interface PasswordInputProps extends Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'size'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValueCommit?: (value: string) => void;
  label: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  rules?: readonly PasswordRule[];
  feedback?: boolean;
  getStrength?: (value: string, results: readonly PasswordRuleResult[]) => PasswordStrength;
  strengthLabels?: readonly [React.ReactNode, React.ReactNode, React.ReactNode, React.ReactNode, React.ReactNode];
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  inputClassName?: string;
}

const defaultStrengthLabels = ['尚未输入', '弱', '一般', '良好', '强'] as const;

export function evaluatePasswordRules(value: string, rules: readonly PasswordRule[]) {
  return rules.map(rule => {
    const passed = typeof rule.test === 'function'
      ? rule.test(value)
      : new RegExp(rule.test.source, rule.test.flags.replace(/[gy]/g, '')).test(value);
    return { ...rule, passed };
  });
}

export function passwordStrengthFromRules(value: string, results: readonly PasswordRuleResult[], labels: readonly React.ReactNode[] = defaultStrengthLabels): PasswordStrength {
  if (!value) return { score: 0, label: labels[0] };
  const ratio = results.length ? results.filter(result => result.passed).length / results.length : 0;
  const score = Math.max(1, Math.min(4, Math.round(ratio * 4))) as PasswordStrength['score'];
  return { score, label: labels[score] };
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput({
  value,
  defaultValue = '',
  onValueChange,
  onValueCommit,
  label,
  description,
  error,
  rules = [],
  feedback = true,
  getStrength,
  strengthLabels = defaultStrengthLabels,
  showPasswordLabel = '显示密码',
  hidePasswordLabel = '隐藏密码',
  id: suppliedId,
  disabled,
  readOnly,
  className,
  inputClassName,
  onBlur,
  'aria-describedby': suppliedDescribedBy,
  'aria-invalid': suppliedInvalid,
  ...inputProps
}, forwardedRef) {
  const generatedId = React.useId();
  const id = suppliedId ?? generatedId;
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = controlled ? value : internalValue;
  const [revealed, setRevealed] = React.useState(false);
  const internalRef = React.useRef<HTMLInputElement | null>(null);
  const results = React.useMemo(() => evaluatePasswordRules(currentValue, rules), [currentValue, rules]);
  const strength = (getStrength ?? ((next, nextResults) => passwordStrengthFromRules(next, nextResults, strengthLabels)))(currentValue, results);
  const hasFeedback = feedback && rules.length > 0;
  const descriptionId = description ? `${id}-description` : undefined;
  const feedbackId = hasFeedback ? `${id}-feedback` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [suppliedDescribedBy, descriptionId, feedbackId, errorId].filter(Boolean).join(' ') || undefined;
  const invalid = suppliedInvalid ?? Boolean(error);
  const tone = strength.score <= 1 ? 'bg-destructive' : strength.score <= 3 ? 'bg-warning' : 'bg-success';

  const assignRef = (node: HTMLInputElement | null) => {
    internalRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const toggleVisibility = () => {
    const selectionStart = internalRef.current?.selectionStart;
    const selectionEnd = internalRef.current?.selectionEnd;
    setRevealed(current => !current);
    requestAnimationFrame(() => {
      internalRef.current?.focus();
      if (selectionStart != null && selectionEnd != null) internalRef.current?.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  return <Field data-slot="password-field" data-disabled={disabled || undefined} data-invalid={invalid || undefined} className={className}>
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    <InputGroup data-slot="password-input">
      <InputGroupInput {...inputProps} ref={assignRef} id={id} type={revealed ? 'text' : 'password'} value={currentValue} disabled={disabled} readOnly={readOnly} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={inputClassName} onChange={event => { if (!controlled) setInternalValue(event.target.value); onValueChange?.(event.target.value); }} onBlur={event => { onBlur?.(event); if (!event.defaultPrevented) onValueCommit?.(event.currentTarget.value); }} />
      {!readOnly && <InputGroupAddon align="inline-end"><InputGroupButton size="icon-xs" aria-label={revealed ? hidePasswordLabel : showPasswordLabel} aria-pressed={revealed} disabled={disabled} onClick={toggleVisibility}>{revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</InputGroupButton></InputGroupAddon>}
    </InputGroup>
    {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
    {hasFeedback && <div id={feedbackId} className="grid gap-[var(--rui-space-2)] text-xs" aria-live="polite">
      <div className="flex items-center gap-[var(--rui-space-2)]">
        <div role="meter" aria-label="密码强度" aria-valuemin={0} aria-valuemax={4} aria-valuenow={strength.score} aria-valuetext={typeof strength.label === 'string' ? strength.label : undefined} className="grid min-w-0 flex-1 grid-cols-4 gap-[var(--rui-space-1)]">
          {[1, 2, 3, 4].map(segment => <span key={segment} aria-hidden="true" className={cn('h-1 rounded-full', segment <= strength.score ? tone : 'bg-muted')} />)}
        </div>
        <span className="min-w-12 text-right text-muted-foreground">{strength.label}</span>
      </div>
      <ul className="grid gap-[var(--rui-space-1)] sm:grid-cols-2">
        {results.map(result => <li key={result.id} className={cn('flex min-w-0 items-start gap-[var(--rui-space-1)]', result.passed ? 'text-success' : 'text-muted-foreground')}>{result.passed ? <Check aria-hidden="true" className="mt-px size-3.5 shrink-0" /> : <Circle aria-hidden="true" className="mt-px size-3.5 shrink-0" />}<span><span className="sr-only">{result.passed ? '已满足：' : '未满足：'}</span>{result.label}</span></li>)}
      </ul>
    </div>}
    {error && <FieldError id={errorId}>{error}</FieldError>}
  </Field>;
});
