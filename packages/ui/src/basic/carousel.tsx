import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { cn } from '../lib/utils.js';

export interface CarouselProps<T> {
  items: T[];
  getItemId: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  activeIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number, item: T) => void;
  itemsPerView?: number;
  itemsPerMove?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  autoplayInterval?: number;
  paused?: boolean;
  defaultPaused?: boolean;
  onPausedChange?: (paused: boolean) => void;
  label?: string;
  emptyLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  disabled?: boolean;
  className?: string;
}

function clampInteger(value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, Math.min(maximum, Math.floor(value)));
}

function getPageStarts(itemCount: number, visibleCount: number, moveCount: number) {
  const lastStart = Math.max(0, itemCount - visibleCount);
  const starts = [0];
  for (let start = moveCount; start < lastStart; start += moveCount) starts.push(start);
  if (lastStart > 0 && starts.at(-1) !== lastStart) starts.push(lastStart);
  return starts;
}

export function Carousel<T>({
  items,
  getItemId,
  renderItem,
  activeIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  itemsPerView = 1,
  itemsPerMove = 1,
  loop = false,
  showControls = true,
  showIndicators = true,
  autoplayInterval = 0,
  paused,
  defaultPaused = false,
  onPausedChange,
  label = '内容轮播',
  emptyLabel = '没有可展示的内容',
  previousLabel = '上一页',
  nextLabel = '下一页',
  disabled = false,
  className,
}: CarouselProps<T>) {
  const visibleCount = clampInteger(itemsPerView, 1, Math.max(1, items.length));
  const moveCount = clampInteger(itemsPerMove, 1, Math.max(1, items.length));
  const pages = useMemo(() => getPageStarts(items.length, visibleCount, moveCount), [items.length, visibleCount, moveCount]);
  const normalizeIndex = (value: number) => pages.reduce((nearest, page) => Math.abs(page - value) < Math.abs(nearest - value) ? page : nearest, pages[0] ?? 0);
  const [internalIndex, setInternalIndex] = useState(() => normalizeIndex(defaultActiveIndex));
  const [internalPaused, setInternalPaused] = useState(defaultPaused);
  const [interacting, setInteracting] = useState(false);
  const currentIndex = normalizeIndex(activeIndex ?? internalIndex);
  const currentPage = Math.max(0, pages.indexOf(currentIndex));
  const isPaused = paused ?? internalPaused;
  const autoplayEnabled = autoplayInterval > 0 && items.length > visibleCount;
  const viewport = useRef<HTMLDivElement>(null);
  const slides = useRef(new Map<number, HTMLDivElement>());
  const indicators = useRef(new Map<number, HTMLButtonElement>());
  const drag = useRef<{ pointerId: number; startX: number; startScroll: number; moved: boolean } | undefined>(undefined);

  function selectPage(page: number) {
    if (!pages.length || disabled) return;
    const wrappedPage = loop ? (page + pages.length) % pages.length : Math.max(0, Math.min(pages.length - 1, page));
    const nextIndex = pages[wrappedPage] ?? 0;
    if (activeIndex === undefined) setInternalIndex(nextIndex);
    const item = items[nextIndex];
    if (item && nextIndex !== currentIndex) onActiveIndexChange?.(nextIndex, item);
  }

  function setPaused(next: boolean) {
    if (paused === undefined) setInternalPaused(next);
    onPausedChange?.(next);
  }

  useEffect(() => {
    if (activeIndex === undefined && internalIndex !== currentIndex) setInternalIndex(currentIndex);
  }, [activeIndex, currentIndex, internalIndex]);

  useEffect(() => {
    const root = viewport.current;
    const slide = slides.current.get(currentIndex);
    if (!root || !slide) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.scrollTo({ left: slide.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
  }, [currentIndex, visibleCount]);

  useEffect(() => {
    const root = viewport.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      const slide = slides.current.get(currentIndex);
      if (slide) root.scrollTo({ left: slide.offsetLeft, behavior: 'auto' });
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [currentIndex]);

  useEffect(() => {
    if (!autoplayEnabled || isPaused || interacting || disabled) return;
    const timer = window.setInterval(() => selectPage(currentPage + 1), Math.max(250, autoplayInterval));
    return () => window.clearInterval(timer);
  }, [autoplayEnabled, autoplayInterval, currentPage, disabled, interacting, isPaused, loop, pages.length]);

  function onIndicatorKeyDown(event: KeyboardEvent<HTMLButtonElement>, page: number) {
    let next: number | undefined;
    if (event.key === 'ArrowRight') next = loop ? (page + 1) % pages.length : Math.min(pages.length - 1, page + 1);
    else if (event.key === 'ArrowLeft') next = loop ? (page - 1 + pages.length) % pages.length : Math.max(0, page - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = pages.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectPage(next);
    requestAnimationFrame(() => indicators.current.get(next!)?.focus());
  }

  function onCarouselKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); selectPage(currentPage + 1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); selectPage(currentPage - 1); }
    else if (event.key === 'Home') { event.preventDefault(); selectPage(0); }
    else if (event.key === 'End') { event.preventDefault(); selectPage(pages.length - 1); }
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (disabled || pages.length < 2) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startScroll: event.currentTarget.scrollLeft, moved: false };
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const delta = event.clientX - current.startX;
    if (Math.abs(delta) > 4) current.moved = true;
    event.currentTarget.scrollLeft = current.startScroll - delta;
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const delta = event.clientX - current.startX;
    drag.current = undefined;
    if (current.moved && Math.abs(delta) >= Math.min(64, event.currentTarget.clientWidth * 0.15)) selectPage(currentPage + (delta < 0 ? 1 : -1));
    else {
      const slide = slides.current.get(currentIndex);
      if (slide) event.currentTarget.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
    }
  }

  if (!items.length) return <section role="region" aria-label={label} aria-roledescription="carousel" className={cn('rounded-lg border border-dashed border-border p-[var(--rui-empty-padding)] text-center text-sm text-muted-foreground', className)}>{emptyLabel}</section>;

  return <section
    role="region"
    aria-label={label}
    aria-roledescription="carousel"
    aria-disabled={disabled || undefined}
    tabIndex={disabled ? -1 : 0}
    onKeyDown={onCarouselKeyDown}
    onMouseEnter={() => setInteracting(true)}
    onMouseLeave={() => setInteracting(false)}
    onFocusCapture={() => setInteracting(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
    className={cn('min-w-0 space-y-[var(--rui-content-gap-sm)] outline-none focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring/50', className)}
  >
    <div
      ref={viewport}
      aria-live={autoplayEnabled && !isPaused && !interacting ? 'off' : 'polite'}
      aria-atomic="false"
      className="min-w-0 touch-pan-y overflow-hidden rounded-lg"
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={finishDrag}
      onPointerCancel={event => { drag.current = undefined; const slide = slides.current.get(currentIndex); if (slide) event.currentTarget.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' }); }}
    >
      <div className="relative flex min-w-0 select-none">
        {items.map((item, index) => {
          const visible = index >= currentIndex && index < currentIndex + visibleCount;
          return <div
            ref={node => { if (node) slides.current.set(index, node); else slides.current.delete(index); }}
            key={getItemId(item, index)}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${items.length}`}
            aria-hidden={!visible}
            inert={!visible}
            className="min-w-0 shrink-0 px-[var(--rui-space-1)]"
            style={{ width: `${100 / visibleCount}%` }}
          >{renderItem(item, index)}</div>;
        })}
      </div>
    </div>
    {(showControls || showIndicators || autoplayEnabled) && <div className="flex min-w-0 items-center justify-between gap-[var(--rui-content-gap-sm)]">
      <div className="flex items-center gap-[var(--rui-space-1)]">
        {showControls && <><Button type="button" variant="outline" size="icon-sm" aria-label={previousLabel} disabled={disabled || (!loop && currentPage === 0)} onClick={() => selectPage(currentPage - 1)}><ChevronLeft aria-hidden="true" /></Button><Button type="button" variant="outline" size="icon-sm" aria-label={nextLabel} disabled={disabled || (!loop && currentPage === pages.length - 1)} onClick={() => selectPage(currentPage + 1)}><ChevronRight aria-hidden="true" /></Button></>}
        {autoplayEnabled && <Button type="button" variant="ghost" size="icon-sm" aria-label={isPaused ? '继续自动播放' : '暂停自动播放'} aria-pressed={isPaused} disabled={disabled} onClick={() => setPaused(!isPaused)}>{isPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</Button>}
      </div>
      {showIndicators && pages.length > 1 && <div role="group" aria-label="选择轮播页" className="flex min-w-0 items-center justify-center gap-[var(--rui-space-1)]">{pages.map((start, page) => <button
        ref={node => { if (node) indicators.current.set(page, node); else indicators.current.delete(page); }}
        key={start}
        type="button"
        aria-label={`转到第 ${page + 1} 页`}
        aria-current={page === currentPage ? 'true' : undefined}
        tabIndex={page === currentPage ? 0 : -1}
        disabled={disabled}
        onClick={() => selectPage(page)}
        onKeyDown={event => onIndicatorKeyDown(event, page)}
        className="size-2 rounded-full bg-muted-foreground/35 outline-none transition-[width,background-color] duration-[var(--rui-duration-fast)] aria-current:w-5 aria-current:bg-foreground focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring disabled:opacity-[var(--rui-opacity-disabled)] motion-reduce:transition-none"
      />)}</div>}
      <span role="status" className="min-w-10 text-right text-xs tabular-nums text-muted-foreground">{currentPage + 1} / {pages.length}</span>
    </div>}
  </section>;
}
