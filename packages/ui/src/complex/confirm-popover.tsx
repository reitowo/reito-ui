import { useRef, useState, type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { CircleAlert, LoaderCircle } from 'lucide-react';
import { Button } from '../primitives/button.js';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '../primitives/popover.js';
import { cx } from './shared.js';

export interface ConfirmPopoverProps {
  trigger: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  details?: ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  onConfirmError?: (reason: unknown) => void;
  error?: ReactNode;
  getErrorMessage?: (reason: unknown) => ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  pending?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  pendingLabel?: ReactNode;
  side?: ComponentProps<typeof PopoverContent>['side'];
  align?: ComponentProps<typeof PopoverContent>['align'];
  className?: string;
}

function defaultErrorMessage(reason: unknown): ReactNode {
  if (reason instanceof Error && reason.message) return reason.message;
  return '操作失败，请检查后重试。';
}

/** An anchored, focus-contained confirmation surface with host-owned async work. */
export function ConfirmPopover({
  trigger,
  title,
  description,
  details,
  onConfirm,
  onCancel,
  onConfirmError,
  error,
  getErrorMessage = defaultErrorMessage,
  open,
  defaultOpen = false,
  onOpenChange,
  pending = false,
  disabled = false,
  destructive = false,
  confirmLabel = '确认',
  cancelLabel = '取消',
  pendingLabel = '正在处理…',
  side = 'bottom',
  align = 'center',
  className,
}: ConfirmPopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalPending, setInternalPending] = useState(false);
  const [operationError, setOperationError] = useState<ReactNode>();
  const inFlight = useRef(false);
  const currentOpen = open ?? internalOpen;
  const busy = pending || internalPending;
  const visibleError = error ?? operationError;

  function publishOpen(next: boolean) {
    if (!next && busy) return;
    if (open === undefined) setInternalOpen(next);
    if (next) setOperationError(undefined);
    onOpenChange?.(next);
  }

  async function confirm() {
    if (busy || disabled || inFlight.current) return;
    inFlight.current = true;
    setInternalPending(true);
    setOperationError(undefined);
    try {
      await onConfirm();
      if (open === undefined) setInternalOpen(false);
      onOpenChange?.(false);
    } catch (reason) {
      setOperationError(getErrorMessage(reason));
      onConfirmError?.(reason);
    } finally {
      inFlight.current = false;
      setInternalPending(false);
    }
  }

  return (
    <Popover modal open={currentOpen} onOpenChange={publishOpen}>
      <PopoverTrigger render={trigger} disabled={disabled || busy} />
      <PopoverContent
        role="alertdialog"
        side={side}
        align={align}
        aria-busy={busy || undefined}
        className={cx(
          'w-[var(--rui-container-2xs)] max-w-[calc(100vw-var(--rui-space-8))] gap-[var(--rui-content-gap-sm)] p-[var(--rui-content-padding)]',
          className,
        )}
      >
        <div className="grid gap-[var(--rui-space-1)]">
          <PopoverTitle>{title}</PopoverTitle>
          {description && <PopoverDescription>{description}</PopoverDescription>}
        </div>
        {details && <div className="text-sm text-muted-foreground">{details}</div>}
        {visibleError && (
          <p role="alert" className="flex items-start gap-[var(--rui-space-1)] text-xs text-destructive">
            <CircleAlert aria-hidden="true" className="mt-px size-3 shrink-0" />
            <span className="min-w-0">{visibleError}</span>
          </p>
        )}
        {busy && <p role="status" className="sr-only">{pendingLabel}</p>}
        <div className="flex flex-wrap justify-end gap-[var(--rui-content-gap-sm)] border-t border-border pt-[var(--rui-content-gap-sm)]">
          <PopoverClose
            render={<Button type="button" variant="ghost" size="sm" />}
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </PopoverClose>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            size="sm"
            disabled={busy || disabled}
            aria-busy={busy || undefined}
            onClick={() => { void confirm(); }}
          >
            {busy && <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />}
            {busy ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
