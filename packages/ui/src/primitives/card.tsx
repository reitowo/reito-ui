import * as React from 'react';
import { cn } from '../lib/utils.js';

function Card({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        [
          // Layout
          'group/card flex flex-col',
          // Spacing
          'gap-0',
          // Layout
          'overflow-hidden',
          // Surface
          'rounded-xl bg-card',
          // Typography
          'text-sm text-card-foreground',
          // Surface
          'ring-1 ring-foreground/10',
          // Child and composition rules
          '[&>[data-slot=card-header]:not(.border-b):has(+[data-slot=card-content])]:pb-0 [&>[data-slot=card-header]:not(.border-b)+[data-slot=card-content]]:pt-[var(--rui-card-text-gap)] *:[img:first-child]:rounded-t-xl',
          '*:[img:last-child]:rounded-b-xl',
        ],
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-[var(--rui-card-text-gap)] rounded-t-xl px-[var(--rui-card-padding-x)] py-[var(--rui-card-padding-y)] has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]',
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm',
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-[var(--rui-card-padding-x)] py-[var(--rui-card-padding-y)]', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center rounded-b-xl border-t bg-muted/50 px-[var(--rui-card-padding-x)] py-[var(--rui-card-padding-y)]',
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
