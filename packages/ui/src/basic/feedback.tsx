import type { ReactNode } from 'react';
import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import { CheckCircle2, CircleAlert, Info, LoaderCircle, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { cn } from '../lib/utils.js';

export interface ToastProviderProps extends ToastPrimitive.Provider.Props {
  viewportLabel?: string;
  viewportClassName?: string;
  closeLabel?: string;
}

/** One provider and viewport per notification region; Base UI owns timers, focus and announcements. */
export function ToastProvider({ children, viewportLabel = '通知', viewportClassName, closeLabel = '关闭通知', ...props }: ToastProviderProps) {
  return <ToastPrimitive.Provider {...props}>
    {children}
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport aria-label={viewportLabel} className={cn('fixed right-4 bottom-4 z-[var(--rui-z-toast)] flex w-80 max-w-[calc(100vw-var(--rui-space-8))] flex-col-reverse gap-[var(--rui-content-gap-sm)] outline-none', viewportClassName)}>
        <ToastList closeLabel={closeLabel} />
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  </ToastPrimitive.Provider>;
}

function ToastList({ closeLabel }: { closeLabel: string }) {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map(toast => {
    let icon: ReactNode = <Info className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />;
    if (toast.type === 'success') icon = <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />;
    if (toast.type === 'error') icon = <CircleAlert className="size-4 shrink-0 text-destructive" aria-hidden="true" />;
    if (toast.type === 'loading') icon = <LoaderCircle className="size-4 shrink-0 text-muted-foreground motion-safe:animate-spin" aria-hidden="true" />;
    return <ToastPrimitive.Root key={toast.id} toast={toast} data-slot="toast" className="relative rounded-xl border border-border bg-popover p-[var(--rui-content-padding)] text-popover-foreground shadow-md outline-none data-limited:hidden focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring">
      <ToastPrimitive.Content className="flex items-start gap-[var(--rui-content-gap-sm)]">
        <div className="pt-0.5">{icon}</div>
        <div className="min-w-0 flex-1 space-y-1">
          {toast.title && <ToastPrimitive.Title className="text-sm font-medium leading-snug" />}
          {toast.description && <ToastPrimitive.Description className="break-words text-xs leading-relaxed text-muted-foreground" />}
          {toast.actionProps && <ToastPrimitive.Action render={<Button variant="outline" size="xs" className="mt-2" />} />}
        </div>
        <ToastPrimitive.Close aria-label={closeLabel} render={<Button variant="ghost" size="icon-xs" />}><X aria-hidden="true" /></ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>;
  });
}

export const useToastManager = ToastPrimitive.useToastManager;
export const createToastManager = ToastPrimitive.createToastManager;

