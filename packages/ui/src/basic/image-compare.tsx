import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { GripHorizontal, GripVertical, ImageOff, RotateCcw } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Spinner } from '../primitives/spinner.js';
import { cn } from '../lib/utils.js';

export interface ImageCompareSource {
  src: string;
  alt: string;
  label?: string;
  status?: 'loading' | 'error';
  error?: string;
}

export interface ImageCompareProps {
  before: ImageCompareSource;
  after: ImageCompareSource;
  position?: number;
  defaultPosition?: number;
  onPositionChange?: (position: number) => void;
  onRetry?: (side: 'before' | 'after', source: ImageCompareSource) => void;
  orientation?: 'horizontal' | 'vertical';
  step?: number;
  label?: string;
  beforeLabel?: string;
  afterLabel?: string;
  objectFit?: 'cover' | 'contain';
  aspectRatio?: number;
  disabled?: boolean;
  className?: string;
}

function normalizePosition(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.max(0, Math.min(100, value));
}

function CompareImage({ source, fit, side, retryKey }: { source: ImageCompareSource; fit: 'cover' | 'contain'; side: 'before' | 'after'; retryKey: number }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => setState('loading'), [source.src, retryKey]);
  const visibleState = source.status ?? state;
  return <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-muted/30">
    {visibleState === 'loading' && <span role="status" className="absolute inset-0 flex items-center justify-center gap-[var(--rui-space-2)] text-xs text-muted-foreground"><Spinner aria-hidden="true" />正在加载{side === 'before' ? '对比前' : '对比后'}图像</span>}
    {visibleState === 'error' ? <div className="relative flex flex-col items-center gap-[var(--rui-content-gap-sm)] p-[var(--rui-content-padding)] text-center text-muted-foreground"><ImageOff className="size-5" aria-hidden="true" /><p role="alert" className="text-xs">{source.error ?? `${source.alt}加载失败`}</p></div> : <img key={`${source.src}-${retryKey}`} src={source.src} alt={source.alt} draggable={false} onLoad={() => setState('ready')} onError={() => setState('error')} className={cn('size-full select-none transition-opacity duration-[var(--rui-duration-fast)]', fit === 'cover' ? 'object-cover' : 'object-contain', visibleState === 'ready' ? 'opacity-100' : 'opacity-0')} />}
  </div>;
}

export function ImageCompare({
  before,
  after,
  position,
  defaultPosition = 50,
  onPositionChange,
  onRetry,
  orientation = 'horizontal',
  step = 1,
  label = '图像前后对比',
  beforeLabel,
  afterLabel,
  objectFit = 'cover',
  aspectRatio = 16 / 9,
  disabled = false,
  className,
}: ImageCompareProps) {
  const [internalPosition, setInternalPosition] = useState(normalizePosition(defaultPosition));
  const [retryKeys, setRetryKeys] = useState({ before: 0, after: 0 });
  const current = normalizePosition(position ?? internalPosition);
  const rangeInput = useRef<HTMLInputElement>(null);
  const dragging = useRef<number | undefined>(undefined);
  const horizontal = orientation === 'horizontal';

  function update(next: number) {
    const normalized = normalizePosition(next);
    if (position === undefined) setInternalPosition(normalized);
    if (normalized !== current) onPositionChange?.(normalized);
  }

  function updateFromPointer(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const next = horizontal ? ((event.clientX - bounds.left) / bounds.width) * 100 : ((event.clientY - bounds.top) / bounds.height) * 100;
    update(next);
  }

  function startPointer(event: PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = event.pointerId;
    updateFromPointer(event);
    rangeInput.current?.focus({ preventScroll: true });
  }

  function movePointer(event: PointerEvent<HTMLDivElement>) {
    if (dragging.current === event.pointerId) updateFromPointer(event);
  }

  function finishPointer(event: PointerEvent<HTMLDivElement>) {
    if (dragging.current === event.pointerId) dragging.current = undefined;
  }

  const beforeText = beforeLabel ?? before.label ?? '对比前';
  const afterText = afterLabel ?? after.label ?? '对比后';
  const clipPath = horizontal ? `inset(0 ${100 - current}% 0 0)` : `inset(0 0 ${100 - current}% 0)`;
  const beforeFailed = before.status === 'error';
  const afterFailed = after.status === 'error';

  function retry(side: 'before' | 'after', source: ImageCompareSource) {
    setRetryKeys(keys => ({ ...keys, [side]: keys[side] + 1 }));
    onRetry?.(side, source);
  }

  return <section role="region" aria-label={label} className={cn('min-w-0 space-y-[var(--rui-content-gap-sm)]', className)}>
    <div
      role="group"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cn('relative isolate min-w-0 overflow-hidden rounded-lg border border-border bg-muted/30', horizontal ? 'touch-pan-y' : 'touch-pan-x', disabled ? 'cursor-not-allowed opacity-[var(--rui-opacity-disabled)]' : horizontal ? 'cursor-col-resize' : 'cursor-row-resize')}
      style={{ aspectRatio }}
      onPointerDown={startPointer}
      onPointerMove={movePointer}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
    >
      <CompareImage source={after} fit={objectFit} side="after" retryKey={retryKeys.after} />
      <div className="absolute inset-0" style={{ clipPath }}><CompareImage source={before} fit={objectFit} side="before" retryKey={retryKeys.before} /></div>
      <input
        ref={rangeInput}
        type="range"
        min={0}
        max={100}
        step={Math.max(0.1, Math.abs(step) || 1)}
        value={current}
        disabled={disabled}
        aria-label={label}
        aria-valuetext={`${beforeText} ${Math.round(current)}%，${afterText} ${Math.round(100 - current)}%`}
        onChange={event => update(event.currentTarget.valueAsNumber)}
        className="peer pointer-events-none absolute inset-0 size-full opacity-0"
      />
      <span aria-hidden="true" className={cn('pointer-events-none absolute bg-border-strong peer-focus-visible:ring-[length:var(--rui-outline-width)] peer-focus-visible:ring-ring', horizontal ? 'inset-y-0 w-px -translate-x-1/2' : 'inset-x-0 h-px -translate-y-1/2')} style={horizontal ? { left: `${current}%` } : { top: `${current}%` }}>
        <span className="absolute top-1/2 left-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border-strong bg-popover text-popover-foreground shadow-sm">{horizontal ? <GripVertical className="size-4" /> : <GripHorizontal className="size-4" />}</span>
      </span>
      <span className="pointer-events-none absolute top-[var(--rui-space-2)] left-[var(--rui-space-2)] rounded-md bg-popover/90 px-[var(--rui-space-2)] py-[var(--rui-space-1)] text-xs text-popover-foreground shadow-sm">{beforeText}</span>
      <span className={cn('pointer-events-none absolute rounded-md bg-popover/90 px-[var(--rui-space-2)] py-[var(--rui-space-1)] text-xs text-popover-foreground shadow-sm', horizontal ? 'top-[var(--rui-space-2)] right-[var(--rui-space-2)]' : 'bottom-[var(--rui-space-2)] left-[var(--rui-space-2)]')}>{afterText}</span>
    </div>
    <div className="flex min-w-0 items-center justify-between gap-[var(--rui-content-gap-sm)]">
      <div className="flex min-w-0 flex-wrap items-center gap-[var(--rui-space-1)]">{onRetry && beforeFailed && <Button type="button" variant="outline" size="xs" onClick={() => retry('before', before)}><RotateCcw aria-hidden="true" />重试{beforeText}图像</Button>}{onRetry && afterFailed && <Button type="button" variant="outline" size="xs" onClick={() => retry('after', after)}><RotateCcw aria-hidden="true" />重试{afterText}图像</Button>}</div>
      <p role="status" className="shrink-0 text-right text-xs tabular-nums text-muted-foreground">{Math.round(current)} / {Math.round(100 - current)}</p>
    </div>
  </section>;
}
