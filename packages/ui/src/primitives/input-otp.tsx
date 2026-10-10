'use client';

import * as React from 'react';
import { cn } from '../lib/utils.js';
import { OTPInput, OTPInputContext } from 'input-otp';
import { MinusIcon } from 'lucide-react';

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        'cn-input-otp flex items-center has-disabled:opacity-[var(--rui-opacity-disabled)]',
        containerClassName,
      )}
      spellCheck={false}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('flex items-center rounded-lg rui-validation', className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        [
          // Layout
          'relative flex size-[var(--rui-control-height)] items-center justify-center',
          // Surface
          'border-y border-r border-input',
          // Typography
          'text-sm',
          // Motion
          'transition-all',
          // Surface
          'outline-none',
          // Layout
          'first:rounded-l-lg first:border-l last:rounded-r-lg',
          // Validation state
          'rui-validation',
          // Component state
          'data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-[length:var(--rui-outline-width)] data-[active=true]:ring-ring/50',
          // Dark theme
          'dark:bg-input/30',
          // Validation state
        ],
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
