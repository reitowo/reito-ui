import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, Clock3, CornerDownLeft, ListChecks, X } from 'lucide-react';
import { Badge } from '../primitives/badge.js';
import { Button } from '../primitives/button.js';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../primitives/collapsible.js';
import { CodeBlock } from './code-block.js';
import { classes, ExecutionIcon, executionLabels, type ExecutionStatus } from './shared.js';

export interface ReasoningProps {
  children: ReactNode;
  status?: 'idle' | 'running' | 'complete';
  elapsedSeconds?: number;
  title?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/** Displays caller-provided explanatory content; it does not produce or reveal model reasoning. */
export function Reasoning({
  children,
  status = 'complete',
  elapsedSeconds,
  title = '过程说明',
  open,
  defaultOpen = false,
  onOpenChange,
  className,
}: ReasoningProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [measuredSeconds, setMeasuredSeconds] = useState(0);
  const start = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (status !== 'running' || elapsedSeconds !== undefined) return;
    start.current = Date.now();
    setMeasuredSeconds(0);
    const timer = setInterval(
      () => setMeasuredSeconds(Math.floor((Date.now() - (start.current ?? Date.now())) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [status, elapsedSeconds]);
  const suppliedSeconds = elapsedSeconds ?? measuredSeconds;
  const seconds = Number.isFinite(suppliedSeconds) ? Math.max(0, Math.floor(suppliedSeconds)) : 0;
  const expanded = open ?? internalOpen;
  return (
    <Collapsible
      open={expanded}
      onOpenChange={(next) => {
        if (open === undefined) setInternalOpen(next);
        onOpenChange?.(next);
      }}
      className={classes('min-w-0', className)}
    >
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md py-[var(--rui-cell-padding-y)] text-left text-sm text-muted-foreground hover:text-foreground focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring">
        <ChevronDown
          aria-hidden="true"
          className={classes(
            'size-3.5 shrink-0 transition-transform motion-reduce:transition-none',
            !expanded && '-rotate-90',
          )}
        />
        <span>{title}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1 text-xs">
          <Clock3 className="size-3" aria-hidden="true" />
          {status === 'running'
            ? `进行中 · ${seconds}s`
            : status === 'complete'
              ? `${seconds}s`
              : '尚未开始'}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="my-2 border-l pl-[var(--rui-content-padding)] text-sm leading-6 text-muted-foreground">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export interface ToolCallProps {
  title: string;
  status: ExecutionStatus;
  children?: ReactNode;
  /** `trace` is a one-line event card for dense execution logs. */
  variant?: 'inline' | 'card' | 'trace';
  durationLabel?: string;
  /** trace: leading clock time supplied by the host, e.g. `18:28:35`. */
  timestamp?: string;
  /** trace: short event kind shown before the title, e.g. `eval 执行`. */
  kind?: string;
  /** trace: trailing tag; strings render as an XS badge. */
  tag?: ReactNode;
  /** trace: source preview; collapsed to its first line with a line count. */
  input?: string;
  inputLanguage?: string;
  /** trace: result text, shown as one truncated line. */
  output?: string;
  /** trace: line count of the full result when `output` is a summary. */
  outputLines?: number;
  /** trace: error message, shown in full below the header. */
  error?: string;
  /** Inline/card: body expansion. Trace: input preview expansion. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRetry?: () => void;
  className?: string;
}

const lineCount = (text: string) => text.replace(/\n$/, '').split('\n').length;

function TraceToolCall({
  title,
  status,
  children,
  durationLabel,
  timestamp,
  kind,
  tag,
  input,
  inputLanguage = 'javascript',
  output,
  outputLines,
  error,
  expanded,
  onExpandedChange,
  onRetry,
  className,
}: Omit<ToolCallProps, 'variant' | 'open' | 'defaultOpen' | 'onOpenChange'> & {
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
}) {
  const failed = status === 'error';
  const inputLines = input ? lineCount(input) : 0;
  const resultLines = outputLines ?? (output ? lineCount(output) : 0);
  return (
    <div
      data-slot="tool-call"
      data-variant="trace"
      data-status={status}
      className={classes(
        'grid min-w-0 gap-[var(--rui-compact-surface-gap)] rounded-[var(--rui-component-card-radius)] border bg-card',
        'px-[var(--rui-component-card-padding-x)] py-[var(--rui-component-card-padding-y)] text-sm',
        failed && 'border-destructive/60',
        className,
      )}
    >
      <div
        data-slot="tool-call-header"
        className="flex min-h-[var(--rui-control-height-xs)] min-w-0 items-center gap-2"
      >
        {timestamp && (
          <time className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums dense:text-2xs">
            {timestamp}
          </time>
        )}
        {(status === 'running' || status === 'pending') && (
          <ExecutionIcon status={status} className="size-3" />
        )}
        {kind && (
          <span
            className={classes(
              'shrink-0 text-xs',
              failed ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {kind}
          </span>
        )}
        <span
          className={classes('min-w-0 flex-1 truncate font-medium', failed && 'text-destructive')}
          title={title}
        >
          {title}
        </span>
        <span className="sr-only">{executionLabels[status]}</span>
        {durationLabel && (
          <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums dense:text-2xs">
            {durationLabel}
          </span>
        )}
        {typeof tag === 'string' ? (
          <Badge variant="secondary" size="xs" className="shrink-0 font-normal">
            {tag}
          </Badge>
        ) : (
          tag
        )}
      </div>
      {input && (
        <Collapsible open={expanded} onOpenChange={onExpandedChange} className="min-w-0">
          <CollapsibleTrigger
            variant="row"
            data-slot="tool-call-input"
            className="bg-sunken"
            aria-label={`${title}源码，${inputLines} 行`}
          >
            <ChevronRight data-slot="collapsible-chevron" className="size-3" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate font-mono text-foreground">
              {expanded ? inputLanguage : input.split('\n')[0]}
            </span>
            <span className="shrink-0 text-2xs tabular-nums">{inputLines} 行</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CodeBlock variant="inline" code={input} language={inputLanguage} className="mt-px" />
          </CollapsibleContent>
        </Collapsible>
      )}
      {output && (
        <div
          data-slot="tool-call-output"
          className="flex min-h-[var(--rui-control-height-xs)] min-w-0 items-center gap-1.5 rounded-xs bg-sunken px-[var(--rui-cell-padding-x)] text-xs"
        >
          <CornerDownLeft className="size-3 shrink-0 text-success" aria-hidden="true" />
          <span className="sr-only">结果：</span>
          <span className="min-w-0 flex-1 truncate font-mono text-success" title={output}>
            {output.replace(/\s*\n\s*/g, ' ')}
          </span>
          {resultLines > 1 && (
            <span className="shrink-0 text-2xs text-muted-foreground tabular-nums">
              {resultLines} 行
            </span>
          )}
        </div>
      )}
      {error && (
        <p
          data-slot="tool-call-error"
          className="flex min-w-0 items-start gap-1.5 px-[var(--rui-cell-padding-x)] text-xs break-words text-destructive"
        >
          <X className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
          <span className="min-w-0 font-mono">{error}</span>
        </p>
      )}
      {children && (
        <div
          data-slot="tool-call-content"
          className="min-w-0 px-[var(--rui-cell-padding-x)] text-xs text-muted-foreground"
        >
          {children}
        </div>
      )}
      {failed && onRetry && (
        <div data-slot="tool-call-actions" className="flex items-center gap-2">
          <Button type="button" size="xs" variant="outline" onClick={onRetry}>
            重试此步骤
          </Button>
        </div>
      )}
    </div>
  );
}

export function ToolCall({
  title,
  status,
  children,
  variant = 'inline',
  durationLabel,
  open,
  defaultOpen = false,
  onOpenChange,
  onRetry,
  className,
  ...trace
}: ToolCallProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const expanded = open ?? internalOpen;
  const setExpanded = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  if (variant === 'trace') {
    return (
      <TraceToolCall
        {...trace}
        title={title}
        status={status}
        durationLabel={durationLabel}
        expanded={expanded}
        onExpandedChange={setExpanded}
        onRetry={onRetry}
        className={className}
      >
        {children}
      </TraceToolCall>
    );
  }
  return (
    <Collapsible
      open={expanded}
      onOpenChange={setExpanded}
      data-slot="tool-call"
      className={classes(
        'min-w-0',
        variant === 'card' && 'overflow-hidden rounded-xl border bg-card',
        className,
      )}
    >
      <CollapsibleTrigger
        data-slot="tool-call-header"
        className={classes(
          'group flex w-full min-w-0 items-center gap-2 rounded-md px-[var(--rui-content-gap-sm)] py-[var(--rui-cell-padding-y)] text-left text-sm hover:bg-muted/60 focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring',
          variant === 'card' &&
            'rounded-none px-[var(--rui-card-padding-x)] py-[var(--rui-card-padding-y)]',
        )}
      >
        <ChevronDown
          className={classes(
            'size-3 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
            !expanded && '-rotate-90',
          )}
          aria-hidden="true"
        />
        <ExecutionIcon status={status} />
        <span className="min-w-0 flex-1 break-words">{title}</span>
        <span
          className={classes(
            'shrink-0 text-xs',
            status === 'error' ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {executionLabels[status]}
          {durationLabel ? ` · ${durationLabel}` : ''}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          data-slot="tool-call-body"
          className={classes(
            'min-w-0 text-sm leading-6',
            variant === 'card'
              ? 'border-t'
              : 'ml-3 grid gap-[var(--rui-content-gap-sm)] border-l px-[var(--rui-content-padding)] pb-[var(--rui-content-padding)] pt-2',
          )}
        >
          <div
            data-slot="tool-call-content"
            className={classes(
              'min-w-0',
              variant === 'card' && 'px-[var(--rui-card-padding-x)] py-[var(--rui-card-padding-y)]',
            )}
          >
            {children || (
              <p className="text-muted-foreground">
                {status === 'pending'
                  ? '等待开始此步骤。'
                  : status === 'running'
                    ? '正在处理此步骤。'
                    : status === 'success'
                      ? '此步骤已完成。'
                      : '此步骤失败，请查看错误信息。'}
              </p>
            )}
          </div>
          {status === 'error' && onRetry && (
            <div
              data-slot="tool-call-actions"
              className={classes(
                'flex flex-wrap items-center gap-2',
                variant === 'card' &&
                  'border-t px-[var(--rui-card-padding-x)] py-[var(--rui-card-padding-y)]',
              )}
            >
              <Button type="button" size="default" variant="outline" onClick={onRetry}>
                重试此步骤
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export interface PlanStep {
  id: string;
  title: string;
  description?: string;
  status: ExecutionStatus;
}
export function PlanSteps({
  steps,
  onStepSelect,
  title = '执行计划',
  className,
}: {
  steps: PlanStep[];
  onStepSelect?: (id: string) => void;
  title?: string;
  className?: string;
}) {
  const completed = steps.filter((step) => step.status === 'success').length;
  return (
    <section
      aria-label={title}
      className={classes('grid min-w-0 gap-[var(--rui-content-gap)]', className)}
    >
      <div className="flex items-center gap-2 text-sm">
        <ListChecks className="size-4 text-muted-foreground" aria-hidden="true" />
        <h3 className="font-medium">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {completed} / {steps.length}
        </span>
      </div>
      {steps.length ? (
        <ol className="grid gap-2">
          {steps.map((step) => (
            <li key={step.id} className="flex min-w-0 gap-2.5">
              <span className="pt-1">
                <ExecutionIcon status={step.status} />
              </span>
              <div className="min-w-0 flex-1">
                {onStepSelect ? (
                  <button
                    type="button"
                    onClick={() => onStepSelect(step.id)}
                    className="rounded text-left text-sm underline-offset-4 hover:underline focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring"
                  >
                    {step.title}
                  </button>
                ) : (
                  <p className="text-sm">{step.title}</p>
                )}
                {step.description && (
                  <p className="text-xs leading-5 text-muted-foreground">{step.description}</p>
                )}
              </div>
              <span className="shrink-0 pt-0.5 text-xs text-muted-foreground">
                {executionLabels[step.status]}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">暂无计划步骤</p>
      )}
    </section>
  );
}
