import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Check } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { Label } from '../../primitives/label.js';
import { cn } from '../../lib/utils.js';

export type StepErrors = Record<string, string | undefined>;
export type StepRenderCtx<V> = {
  values: V;
  setValues: (partial: Partial<V>) => void;
  errors: StepErrors;
  goTo: (idOrIndex: string | number) => void;
  next: () => void;
};
export type Step<V> = {
  id: string;
  title: string;
  heading?: string;
  description?: string;
  render: (ctx: StepRenderCtx<V>) => ReactNode;
  validate?: (values: V) => StepErrors;
};
export type StepperFormProps<V> = {
  steps: Step<V>[];
  initialValues: V;
  onComplete?: (values: V) => void | Promise<void>;
  initialStep?: number;
  step?: number;
  onStepChange?: (step: number) => void;
  submitLabel?: string;
  submittingLabel?: string;
  success?: (values: V, reset: () => void) => ReactNode;
  className?: string;
};
export type StepperFieldProps = {
  name: string;
  label: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
};
export type StepperInputProps = InputHTMLAttributes<HTMLInputElement> & { prefix?: string };
export type StepperTagsProps = {
  value: string[];
  onChange: (value: string[]) => void;
  validate?: (text: string) => string | undefined;
  max?: number;
  placeholder?: string;
};
export type StepperChoice = {
  value: string;
  title: string;
  aside?: string;
  description?: string;
  badge?: string;
};
export type StepperChoicesProps = {
  value: string;
  onChange: (value: string) => void;
  options: StepperChoice[];
  label: string;
};
export type StepperReviewRow = { label: string; value: ReactNode; step?: string };
export type StepperReviewProps = { rows: StepperReviewRow[]; onEdit?: (id: string) => void };
export type StepperSuccessProps = { title?: string; description?: string; children?: ReactNode };

const FieldCtx = createContext<{ errors: StepErrors; invalid: string | null }>({
  errors: {},
  invalid: null,
});

function emailOk(text: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

/** Recreated from public Stepper Form docs. Not Pro source. */
export function StepperForm<V extends Record<string, unknown>>({
  steps,
  initialValues,
  onComplete,
  initialStep = 0,
  step,
  onStepChange,
  submitLabel = '完成',
  submittingLabel = '正在创建…',
  success,
  className,
}: StepperFormProps<V>) {
  const [internalStep, setInternalStep] = useState(initialStep);
  const [values, setValuesState] = useState(initialValues);
  const [errors, setErrors] = useState<StepErrors>({});
  const [invalid, setInvalid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [live, setLive] = useState('');
  const card = useRef<HTMLDivElement>(null);
  const current = step ?? internalStep;
  const last = steps.length - 1;
  const item = steps[current];

  function go(next: number) {
    const index = Math.min(last, Math.max(0, next));
    if (step === undefined) setInternalStep(index);
    onStepChange?.(index);
    setErrors({});
    setInvalid(null);
    const nextStep = steps[index];
    setLive(`第 ${index + 1} 步，共 ${steps.length} 步：${nextStep?.title ?? ''}`);
    window.requestAnimationFrame(() => {
      const focusable = card.current?.querySelector<HTMLElement>(
        'input,button,textarea,[tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    });
  }

  function goTo(idOrIndex: string | number) {
    if (typeof idOrIndex === 'number') {
      go(idOrIndex);
      return;
    }
    const index = steps.findIndex((row) => row.id === idOrIndex);
    if (index >= 0) go(index);
  }

  function setValues(partial: Partial<V>) {
    setValuesState((currentValues) => ({ ...currentValues, ...partial }));
  }

  function validateCurrent() {
    const messages = item?.validate?.(values) ?? {};
    const first = Object.entries(messages).find(([, message]) => message)?.[0] ?? null;
    setErrors(messages);
    setInvalid(first);
    return !first;
  }

  async function next() {
    if (!validateCurrent()) {
      setLive(Object.values(errors).find(Boolean) ?? '请先完成这一步');
      return;
    }
    if (current >= last) {
      setBusy(true);
      setCompleteError(null);
      try {
        await onComplete?.(values);
        setDone(true);
        setLive('已完成');
      } catch (error) {
        setCompleteError(error instanceof Error ? error.message : '未能完成');
      } finally {
        setBusy(false);
      }
      return;
    }
    go(current + 1);
  }

  function reset() {
    setValuesState(initialValues);
    setDone(false);
    go(initialStep);
  }

  if (done && item) {
    return (
      <section className={cn('grid max-w-lg gap-[var(--rui-content-gap)]', className)}>
        {success ? (
          success(values, reset)
        ) : (
          <StepperSuccess title="已创建" description="可以继续下一步工作。" />
        )}
      </section>
    );
  }

  if (!item) return null;

  return (
    <section className={cn('@container grid max-w-lg gap-[var(--rui-content-gap)]', className)}>
      <ol className="flex flex-wrap gap-1" aria-label="步骤">
        {steps.map((row, index) => {
          const finished = index < current;
          return (
            <li key={row.id}>
              {finished ? (
                <Button type="button" size="xs" variant="ghost" onClick={() => go(index)}>
                  <Check className="size-3" />
                  {row.title}
                </Button>
              ) : (
                <span
                  aria-current={index === current ? 'step' : undefined}
                  className={cn(
                    'inline-flex h-[var(--rui-control-height-sm)] items-center rounded-[var(--rui-radius)] px-2 text-[length:var(--rui-font-caption)]',
                    index === current ? 'bg-muted' : 'text-muted-foreground',
                  )}
                >
                  {index + 1} {row.title}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <Text variant="caption" tone="muted" className="@md:sr-only">
        第 {current + 1} 步，共 {steps.length} 步 · {item.title}
      </Text>
      <div
        ref={card}
        className="grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]"
      >
        <Stack gap="small">
          <Heading size="item">{item.heading ?? item.title}</Heading>
          {item.description ? (
            <Text variant="caption" tone="muted">
              {item.description}
            </Text>
          ) : null}
        </Stack>
        <FieldCtx.Provider value={{ errors, invalid }}>
          {item.render({ values, setValues, errors, goTo, next })}
        </FieldCtx.Provider>
        <Inline className="justify-between">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={current === 0}
            onClick={() => go(current - 1)}
          >
            返回
          </Button>
          <Button type="button" size="sm" disabled={busy} onClick={() => void next()}>
            {current >= last ? (busy ? submittingLabel : submitLabel) : '继续'}
          </Button>
        </Inline>
        {completeError ? (
          <Text variant="caption" className="text-destructive">
            {completeError}
          </Text>
        ) : null}
      </div>
      <Text variant="caption" tone="muted" aria-live="polite">
        {live || `第 ${current + 1} 步，共 ${steps.length} 步：${item.title}`}
      </Text>
    </section>
  );
}

export function StepperField({ name, label, hint, optional, children }: StepperFieldProps) {
  const ctx = useContext(FieldCtx);
  const message = ctx.errors[name];
  const id = useId();
  return (
    <div className={cn('grid gap-1', ctx.invalid === name && 'motion-safe:animate-pulse')}>
      <Label htmlFor={id}>
        {label}
        {optional ? (
          <Text as="span" variant="caption" tone="muted">
            {' '}
            可选
          </Text>
        ) : null}
      </Label>
      <div data-stepper-field={name} data-invalid={message ? '' : undefined}>
        {children}
      </div>
      {hint && !message ? (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
      {message ? (
        <Text id={`${id}-error`} variant="caption" className="text-destructive">
          {message}
        </Text>
      ) : null}
    </div>
  );
}

export function StepperInput({ prefix, id, className, ...props }: StepperInputProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <div className="flex items-center gap-1 rounded-[var(--rui-component-input-radius)] border border-border px-[var(--rui-component-input-padding-x)]">
      {prefix ? (
        <Text as="span" variant="caption" tone="muted">
          {prefix}
        </Text>
      ) : null}
      <Input id={fieldId} className={cn('border-0', className)} {...props} />
    </div>
  );
}

export function StepperTags({
  value,
  onChange,
  validate = (text) => (emailOk(text) ? undefined : '请输入邮箱'),
  max,
  placeholder = '添加邮箱…',
}: StepperTagsProps) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  function add(raw: string) {
    const parts = raw
      .split(/[,\s]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    const next = [...value];
    for (const part of parts) {
      const message = validate(part);
      if (message) {
        setError(message);
        return;
      }
      if (!next.includes(part) && (max == null || next.length < max)) next.push(part);
    }
    setError(null);
    setDraft('');
    onChange(next);
  }

  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (draft.trim()) add(draft);
    }
    if (event.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="grid gap-1">
      <div className="flex flex-wrap gap-1 rounded-[var(--rui-component-input-radius)] border border-border p-1">
        {value.map((item) => (
          <Badge key={item} variant="secondary">
            {item}
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label={`移除 ${item}`}
              onClick={() => onChange(value.filter((row) => row !== item))}
            >
              ×
            </Button>
          </Badge>
        ))}
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKey}
          onPaste={(event) => {
            const text = event.clipboardData.getData('text');
            if (text.includes(',') || text.includes('\n')) {
              event.preventDefault();
              add(text);
            }
          }}
          className="min-w-[var(--rui-space-16)] border-0"
        />
      </div>
      {error ? (
        <Text variant="caption" className="text-destructive">
          {error}
        </Text>
      ) : null}
    </div>
  );
}

export function StepperChoices({ value, onChange, options, label }: StepperChoicesProps) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={cn(
            'grid gap-1 rounded-[var(--rui-radius)] border border-border p-2 text-left',
            value === option.value && 'border-primary bg-muted',
          )}
          onClick={() => onChange(option.value)}
        >
          <Inline className="justify-between">
            <Text variant="interface">{option.title}</Text>
            <Inline>
              {option.aside ? (
                <Text variant="caption" tone="muted">
                  {option.aside}
                </Text>
              ) : null}
              {option.badge ? <Badge variant="secondary">{option.badge}</Badge> : null}
            </Inline>
          </Inline>
          {option.description ? (
            <Text variant="caption" tone="muted">
              {option.description}
            </Text>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function StepperReview({ rows, onEdit }: StepperReviewProps) {
  return (
    <dl className="grid gap-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start justify-between gap-2">
          <div>
            <dt>
              <Text variant="caption" tone="muted">
                {row.label}
              </Text>
            </dt>
            <dd>
              <Text variant="interface">{row.value}</Text>
            </dd>
          </div>
          {row.step && onEdit ? (
            <Button type="button" size="xs" variant="ghost" onClick={() => onEdit(row.step!)}>
              编辑
            </Button>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

export function StepperSuccess({ title = '完成', description, children }: StepperSuccessProps) {
  return (
    <div className="grid justify-items-center gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)] text-center">
      <span className="grid size-10 place-items-center rounded-full bg-success text-success-foreground">
        <Check className="size-5" />
      </span>
      <Heading size="item">{title}</Heading>
      {description ? (
        <Text variant="caption" tone="muted">
          {description}
        </Text>
      ) : null}
      {children}
    </div>
  );
}
