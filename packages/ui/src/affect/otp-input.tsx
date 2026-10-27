import { useEffect, useId, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '../primitives/input-otp.js';
import { Button } from '../primitives/button.js';
import { Field, FieldError, FieldLabel } from '../primitives/field.js';
import { cn } from '../lib/utils.js';
import { formatClock } from './shared.js';

export type OtpStatus = 'idle' | 'verifying' | 'error' | 'success';
export type OtpInputProps = {
  length?: number;
  separator?: boolean | number;
  numeric?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  status?: OtpStatus;
  errorMessage?: ReactNode;
  clearOnError?: boolean;
  successLabel?: string;
  onResend?: () => void;
  resendIn?: number;
  align?: 'start' | 'center';
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
  className?: string;
};

/** Verification code field on Reito InputOTP, with status, resend and success morph. */
export function OtpInput({
  length = 6,
  separator = true,
  numeric = true,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  status = 'idle',
  errorMessage,
  clearOnError = true,
  successLabel = '已验证',
  onResend,
  resendIn = 0,
  align = 'start',
  disabled = false,
  autoFocus = false,
  label = '验证码',
  className,
}: OtpInputProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const [remaining, setRemaining] = useState(resendIn);
  const code = value ?? internal;
  const slots = Math.min(24, Math.max(1, length));
  const splitAt =
    separator === true ? Math.floor(slots / 2) : typeof separator === 'number' ? separator : -1;

  useEffect(() => {
    if (status !== 'error' || !clearOnError) return;
    const timer = window.setTimeout(() => {
      setInternal('');
      onChange?.('');
    }, 700);
    return () => window.clearTimeout(timer);
  }, [status, clearOnError, onChange]);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [remaining]);

  if (status === 'success') {
    return (
      <div
        role="status"
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-success bg-success-soft px-[var(--rui-compact-surface-padding-x)] py-[var(--rui-cell-padding-y)] text-success',
          className,
        )}
      >
        <Check className="size-3.5" aria-hidden="true" />
        {successLabel}
      </div>
    );
  }

  return (
    <Field
      className={cn(align === 'center' && 'items-center', className)}
      data-invalid={status === 'error' || undefined}
    >
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputOTP
        id={id}
        maxLength={slots}
        value={code}
        inputMode={numeric ? 'numeric' : 'text'}
        pattern={numeric ? '[0-9]*' : undefined}
        autoFocus={autoFocus}
        disabled={disabled || status === 'verifying'}
        containerClassName={status === 'error' ? 'animate-pulse' : undefined}
        onChange={(next) => {
          const normalized = numeric ? next.replace(/\D/g, '') : next;
          if (value === undefined) setInternal(normalized);
          onChange?.(normalized);
          if (normalized.length === slots) onComplete?.(normalized);
        }}
      >
        <InputOTPGroup>
          {Array.from({ length: slots }, (_, index) => (
            <span key={index} className="contents">
              {index === splitAt && splitAt > 0 ? <InputOTPSeparator /> : null}
              <InputOTPSlot index={index} />
            </span>
          ))}
        </InputOTPGroup>
      </InputOTP>
      {status === 'error' && errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      {status === 'verifying' ? (
        <p className="text-[length:var(--rui-font-caption)] text-muted-foreground">正在验证…</p>
      ) : null}
      {onResend ? (
        remaining > 0 ? (
          <p className="text-[length:var(--rui-font-caption)] text-muted-foreground">
            {formatClock(remaining)} 后可重新发送
          </p>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setRemaining(resendIn);
              onResend();
            }}
          >
            重新发送验证码
          </Button>
        )
      ) : null}
    </Field>
  );
}
