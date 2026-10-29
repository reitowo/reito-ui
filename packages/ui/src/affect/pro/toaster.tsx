import { useEffect, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { Check, Info, LoaderCircle, X } from 'lucide-react';
import { Inline, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';

export type ToastId = string;
export type ToastKind = 'default' | 'success' | 'error' | 'info' | 'loading';
export type ToastAction = {
  label: string;
  onClick: (event: { preventDefault: () => void }) => void;
};
export type ToastOptions = {
  id?: ToastId;
  description?: ReactNode;
  action?: ToastAction;
  duration?: number;
  icon?: ReactNode;
  toaster?: string;
  onDismiss?: () => void;
};
export type ToastCopy = ReactNode | { title: ReactNode; description?: ReactNode };
export type PromiseMessages<T> = {
  loading: ToastCopy;
  success: ToastCopy | ((value: T) => ToastCopy);
  error: ToastCopy | ((error: unknown) => ToastCopy);
};
export type ToasterProps = {
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  inline?: boolean;
  id?: string;
  duration?: number;
  visibleToasts?: number;
  expand?: boolean;
  offset?: number;
  gap?: number;
  hotkey?: string | null;
  hairline?: boolean;
  closeButton?: boolean;
  label?: string;
  className?: string;
};

type ToastRecord = {
  id: ToastId;
  kind: ToastKind;
  title: ReactNode;
  description?: ReactNode;
  action?: ToastAction;
  linger: number;
  toaster?: string;
  icon?: ReactNode;
  onDismiss?: () => void;
  created: number;
};

type ToastStore = {
  items: ToastRecord[];
};

const store: ToastStore = { items: [] };
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snapshot() {
  return store.items;
}

function nextId() {
  return `toast-${Math.random().toString(36).slice(2, 10)}`;
}

function copyOf(copy: ToastCopy): { title: ReactNode; description?: ReactNode } {
  return typeof copy === 'object' && copy != null && 'title' in copy ? copy : { title: copy };
}

function upsert(kind: ToastKind, title: ReactNode, options?: ToastOptions): ToastId {
  const id = options?.id ?? nextId();
  const linger = options?.duration ?? (kind === 'loading' ? Number.POSITIVE_INFINITY : 4000);
  const next: ToastRecord = {
    id,
    kind,
    title,
    description: options?.description,
    action: options?.action,
    linger,
    toaster: options?.toaster,
    icon: options?.icon,
    onDismiss: options?.onDismiss,
    created: Date.now(),
  };
  const index = store.items.findIndex((item) => item.id === id);
  store.items =
    index >= 0 ? store.items.map((item) => (item.id === id ? next : item)) : [...store.items, next];
  emit();
  return id;
}

function dismiss(id?: ToastId) {
  const closing = id ? store.items.filter((item) => item.id === id) : store.items;
  store.items = id ? store.items.filter((item) => item.id !== id) : [];
  closing.forEach((item) => item.onDismiss?.());
  emit();
}

function toastFn(title: ReactNode, options?: ToastOptions) {
  return upsert('default', title, options);
}

toastFn.success = (title: ReactNode, options?: ToastOptions) => upsert('success', title, options);
toastFn.error = (title: ReactNode, options?: ToastOptions) => upsert('error', title, options);
toastFn.info = (title: ReactNode, options?: ToastOptions) => upsert('info', title, options);
toastFn.loading = (title: ReactNode, options?: ToastOptions) => upsert('loading', title, options);
toastFn.dismiss = dismiss;
toastFn.promise = function promise<T>(
  source: Promise<T> | (() => Promise<T>),
  messages: PromiseMessages<T>,
  options?: ToastOptions,
) {
  const id = upsert('loading', copyOf(messages.loading).title, {
    ...options,
    description: copyOf(messages.loading).description,
    duration: Number.POSITIVE_INFINITY,
  });
  const run = typeof source === 'function' ? source() : source;
  return run.then(
    (value) => {
      const copy = copyOf(
        typeof messages.success === 'function' ? messages.success(value) : messages.success,
      );
      upsert('success', copy.title, { ...options, id, description: copy.description });
      return value;
    },
    (error) => {
      const copy = copyOf(
        typeof messages.error === 'function' ? messages.error(error) : messages.error,
      );
      upsert('error', copy.title, { ...options, id, description: copy.description });
      throw error;
    },
  );
};

export const toast = toastFn;

const icons: Record<ToastKind, ReactNode> = {
  default: null,
  success: <Check className="size-3.5" />,
  error: <X className="size-3.5" />,
  info: <Info className="size-3.5" />,
  loading: <LoaderCircle className="size-3.5 motion-safe:animate-spin" />,
};

const positions: Record<NonNullable<ToasterProps['position']>, string> = {
  'top-left': 'top-[var(--offset)] left-[var(--offset)] items-start',
  'top-center': 'top-[var(--offset)] left-1/2 -translate-x-1/2 items-center',
  'top-right': 'top-[var(--offset)] right-[var(--offset)] items-end',
  'bottom-left': 'bottom-[var(--offset)] left-[var(--offset)] items-start',
  'bottom-center': 'bottom-[var(--offset)] left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-[var(--offset)] right-[var(--offset)] items-end',
};

/** Recreated from public Toaster docs. Not Pro source. Sibling of basic Toast. */
export function Toaster({
  position = 'bottom-right',
  inline = false,
  id,
  duration,
  visibleToasts,
  expand = false,
  offset,
  gap,
  hotkey = 'F8',
  hairline = true,
  closeButton = true,
  label = '通知',
  className,
}: ToasterProps) {
  const linger = duration ?? 4000;
  const visible = visibleToasts ?? 3;
  const edge = offset ?? (inline ? 20 : 24);
  const space = gap ?? 10;
  const items = useSyncExternalStore(subscribe, snapshot, snapshot).filter((item) =>
    id ? item.toaster === id : !item.toaster,
  );
  const shown = items.slice(-visible);

  useEffect(() => {
    const timers = shown
      .filter((item) =>
        Number.isFinite(
          item.linger === Number.POSITIVE_INFINITY ? item.linger : item.linger || linger,
        ),
      )
      .map((item) => {
        const wait = item.linger === Number.POSITIVE_INFINITY ? item.linger : item.linger || linger;
        if (!Number.isFinite(wait)) return 0;
        return window.setTimeout(() => dismiss(item.id), wait);
      });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [linger, shown]);

  useEffect(() => {
    if (!hotkey) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === hotkey || event.code === hotkey) {
        event.preventDefault();
        document.getElementById(`affect-toaster-${shown.at(-1)?.id ?? ''}`)?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkey, shown]);

  if (!shown.length) return null;

  return (
    <div
      role="region"
      aria-label={`${label}${hotkey ? `，快捷键 ${hotkey}` : ''}`}
      className={cn(
        'z-[var(--rui-z-toast)] flex w-[min(100%,var(--rui-container-xs))] flex-col',
        inline ? 'absolute' : 'fixed',
        positions[position],
        className,
      )}
      style={{ '--offset': `${edge}px`, gap: expand ? `${space}px` : undefined } as CSSProperties}
    >
      {shown.map((item) => (
        <article
          key={item.id}
          id={`affect-toaster-${item.id}`}
          tabIndex={-1}
          className="grid gap-1 rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)] shadow-sm outline-none focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50"
        >
          <Inline className="justify-between">
            <Inline>
              <span aria-hidden="true">{item.icon ?? icons[item.kind]}</span>
              <Text variant="interface">{item.title}</Text>
            </Inline>
            {closeButton ? (
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label="关闭通知"
                onClick={() => dismiss(item.id)}
              >
                <X className="size-3" />
              </Button>
            ) : null}
          </Inline>
          {item.description ? (
            <Text variant="caption" tone="muted">
              {item.description}
            </Text>
          ) : null}
          {item.action ? (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(event) => {
                let closed = true;
                item.action?.onClick({
                  preventDefault: () => {
                    closed = false;
                  },
                });
                if (closed) dismiss(item.id);
                event.preventDefault();
              }}
            >
              {item.action.label}
            </Button>
          ) : null}
          {hairline &&
          Number.isFinite(
            item.linger === Number.POSITIVE_INFINITY ? item.linger : item.linger || linger,
          ) ? (
            <span className="block h-px bg-border" aria-hidden="true" />
          ) : null}
        </article>
      ))}
    </div>
  );
}
