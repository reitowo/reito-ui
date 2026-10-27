import {
  Children,
  isValidElement,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ChevronDown, Wrench } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../primitives/collapsible.js';
import { CodeBlock } from '../ai/code-block.js';
import { cn } from '../lib/utils.js';
import { formatDuration } from './shared.js';

export type ToolCallStatus = 'running' | 'success' | 'error';
export type ToolCallCardProps = {
  name: string;
  summary?: ReactNode;
  icon?: ReactNode;
  status: ToolCallStatus;
  args?: unknown;
  result?: unknown;
  error?: string;
  startedAt?: number;
  duration?: number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  openOnError?: boolean;
  onRetry?: () => void;
  maxCodeHeight?: number;
  className?: string;
};
export type ToolCallGroupProps = {
  children: ReactNode;
  label?: string;
  runningLabel?: string;
  duration?: number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

function asCode(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function statusLabel(status: ToolCallStatus, seconds: number) {
  if (status === 'running') return `进行中 · ${formatDuration(seconds)}`;
  if (status === 'error') return '失败';
  return formatDuration(seconds);
}

/** One tool call with arguments, result and retry. */
export function ToolCallCard({
  name,
  summary,
  icon,
  status,
  args,
  result,
  error,
  startedAt,
  duration,
  defaultOpen = false,
  open,
  onOpenChange,
  openOnError = true,
  onRetry,
  maxCodeHeight,
  className,
}: ToolCallCardProps) {
  const [internalOpen, setInternalOpen] = useState(
    defaultOpen || (openOnError && status === 'error'),
  );
  const [seconds, setSeconds] = useState(() =>
    duration != null
      ? Math.round(duration / 1000)
      : startedAt
        ? Math.max(0, Math.round((Date.now() - startedAt) / 1000))
        : 0,
  );
  const expanded = open ?? internalOpen;

  useEffect(() => {
    if (status !== 'running' || duration != null) return;
    const origin = startedAt ?? Date.now();
    const timer = window.setInterval(
      () => setSeconds(Math.max(0, Math.round((Date.now() - origin) / 1000))),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [status, duration, startedAt]);

  useEffect(() => {
    if (openOnError && status === 'error' && open === undefined) setInternalOpen(true);
  }, [openOnError, status, open]);

  return (
    <Collapsible
      open={expanded}
      onOpenChange={(next) => {
        if (open === undefined) setInternalOpen(next);
        onOpenChange?.(next);
      }}
      className={cn('min-w-0 rounded-[var(--rui-radius)] border border-border bg-card', className)}
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-[var(--rui-compact-surface-padding-x)] py-[var(--rui-cell-padding-y)] text-left focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring">
        <span className="text-muted-foreground" aria-hidden="true">
          {icon ?? <Wrench className="size-3.5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-mono text-[length:var(--rui-font-caption)]">{name}</span>
          {summary ? (
            <span className="ml-2 text-[length:var(--rui-font-caption)] text-muted-foreground">
              {summary}
            </span>
          ) : null}
        </span>
        <span className="text-[length:var(--rui-font-caption)] text-muted-foreground">
          {statusLabel(status, seconds)}
        </span>
        <ChevronDown
          className={cn(
            'size-3.5 text-muted-foreground transition-transform motion-reduce:transition-none',
            !expanded && '-rotate-90',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          className="grid gap-[var(--rui-content-gap-sm)] border-t border-border p-[var(--rui-content-padding)]"
          style={
            maxCodeHeight
              ? { maxHeight: `calc(${maxCodeHeight} * 1px)`, overflow: 'auto' }
              : undefined
          }
        >
          {args != null ? (
            <CodeBlock filename="arguments.json" language="json" code={asCode(args)} />
          ) : null}
          {result != null ? (
            <CodeBlock filename="result.json" language="json" code={asCode(result)} />
          ) : null}
          {status === 'error' ? (
            <div className="grid gap-2">
              <p className="text-[length:var(--rui-font-interface)] text-destructive">
                {error ?? '工具调用失败。'}
              </p>
              {onRetry ? (
                <Button type="button" size="sm" variant="outline" onClick={onRetry}>
                  重试
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/** Groups several tool cards into one summary line. */
export function ToolCallGroup({
  children,
  label,
  runningLabel = '正在调用工具',
  duration,
  defaultOpen = false,
  open,
  onOpenChange,
  className,
}: ToolCallGroupProps) {
  const cards = Children.toArray(children).filter(
    isValidElement,
  ) as ReactElement<ToolCallCardProps>[];
  const running = cards.some((card) => card.props.status === 'running');
  const total = duration ?? cards.reduce((sum, card) => sum + (card.props.duration ?? 0), 0);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const expanded = open ?? internalOpen;
  const title = running
    ? runningLabel
    : (label ?? `使用了 ${cards.length} 个工具 · ${formatDuration(Math.round(total / 1000))}`);

  return (
    <Collapsible
      open={expanded}
      onOpenChange={(next) => {
        if (open === undefined) setInternalOpen(next);
        onOpenChange?.(next);
      }}
      className={cn('min-w-0', className)}
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 py-[var(--rui-cell-padding-y)] text-left text-[length:var(--rui-font-interface)] text-muted-foreground focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring">
        <Wrench className="size-3.5" aria-hidden="true" />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-[var(--rui-content-gap-sm)]">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
