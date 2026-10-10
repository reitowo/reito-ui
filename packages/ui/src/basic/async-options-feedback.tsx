import type { ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Spinner } from '../primitives/spinner.js';
import type { AsyncOptionsStatus } from './async-options.js';

interface AsyncOptionsFeedbackProps {
  status: AsyncOptionsStatus;
  idleMessage: string;
  loadingMessage: string;
  error?: string;
  retryLabel: string;
  onRetry: () => void;
  children: ReactNode;
}

/** Shared query feedback; each selector retains its own option and selection UI. */
export function AsyncOptionsFeedback({
  status,
  idleMessage: resolvedIdle,
  loadingMessage,
  error: loadError,
  retryLabel,
  onRetry: retry,
  children,
}: AsyncOptionsFeedbackProps) {
  if (status === 'idle')
    return (
      <p className="px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-sm text-muted-foreground">
        {resolvedIdle}
      </p>
    );
  if (status === 'loading')
    return (
      <div
        role="status"
        className="flex items-center gap-[var(--rui-space-2)] px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-sm text-muted-foreground"
      >
        <Spinner aria-hidden="true" />
        {loadingMessage}
      </div>
    );
  if (status === 'error')
    return (
      <div className="grid gap-[var(--rui-space-2)] px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)]">
        <p
          role="alert"
          className="flex items-start gap-[var(--rui-space-2)] text-sm text-destructive"
        >
          <AlertCircle aria-hidden="true" className="mt-[var(--rui-space-1)] size-3 shrink-0" />
          {loadError}
        </p>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="justify-self-start"
          onClick={retry}
        >
          <RotateCcw aria-hidden="true" />
          {retryLabel}
        </Button>
      </div>
    );
  return <>{children}</>;
}
