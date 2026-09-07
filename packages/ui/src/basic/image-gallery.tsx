import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Download, FlipHorizontal2, FlipVertical2, ImageOff, Maximize, Maximize2, RotateCcw, RotateCw, ZoomIn, ZoomOut, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../primitives/dialog.js';
import { Spinner } from '../primitives/spinner.js';
import { cn } from '../lib/utils.js';

export interface ImageGalleryItem {
  id: string;
  src: string;
  thumbnailSrc?: string;
  alt: string;
  title?: string;
  description?: string;
  status?: 'loading' | 'error';
  error?: string;
}

export interface ImageViewerTransform {
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  x: number;
  y: number;
}

export interface ImageGalleryProps {
  items: ImageGalleryItem[];
  activeId?: string;
  defaultActiveId?: string;
  onActiveChange?: (id: string, item: ImageGalleryItem) => void;
  previewOpen?: boolean;
  defaultPreviewOpen?: boolean;
  onPreviewOpenChange?: (open: boolean) => void;
  onRetry?: (item: ImageGalleryItem) => void;
  onDownload?: (item: ImageGalleryItem) => void;
  onTransformChange?: (transform: ImageViewerTransform, item: ImageGalleryItem) => void;
  onFullscreenChange?: (fullscreen: boolean) => void;
  label?: string;
  emptyLabel?: string;
  showThumbnails?: boolean;
  loop?: boolean;
  viewerTools?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  disabled?: boolean;
  className?: string;
}

function GalleryImage({ item, source, retryKey, onRetry, className, imageClassName, imageStyle }: { item: ImageGalleryItem; source: string; retryKey: number; onRetry?: () => void; className?: string; imageClassName?: string; imageStyle?: CSSProperties }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => { setState('loading'); }, [source, retryKey]);
  const visibleState = item.status ?? state;
  return <div className={cn('relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden bg-muted/30', className)}>
    {visibleState === 'loading' && <span role="status" className="absolute inset-0 flex items-center justify-center gap-[var(--rui-space-2)] text-xs text-muted-foreground"><Spinner aria-hidden="true" />正在加载图像</span>}
    {visibleState === 'error' ? <div className="flex flex-col items-center gap-[var(--rui-content-gap-sm)] p-[var(--rui-content-padding)] text-center text-muted-foreground"><ImageOff className="size-5" aria-hidden="true" /><p role="alert" className="text-xs">{item.error ?? `图像加载失败：${item.alt}`}</p>{onRetry && <Button type="button" variant="outline" size="xs" onClick={onRetry}><RotateCcw aria-hidden="true" />重试</Button>}</div> : <img key={`${source}-${retryKey}`} src={source} alt={item.alt} draggable={false} style={imageStyle} className={cn('size-full object-contain transition-opacity duration-[var(--rui-duration-fast)]', visibleState === 'ready' ? 'opacity-100' : 'opacity-0', imageClassName)} onLoad={() => setState('ready')} onError={() => setState('error')} />}
  </div>;
}

export function ImageGallery({
  items, activeId, defaultActiveId, onActiveChange, previewOpen, defaultPreviewOpen = false, onPreviewOpenChange, onRetry, onDownload, onTransformChange, onFullscreenChange,
  label = '图片画廊', emptyLabel = '没有可预览的图片', showThumbnails = true, loop = false, viewerTools = true, minZoom = 0.5, maxZoom = 4, zoomStep = 0.25, disabled = false, className,
}: ImageGalleryProps) {
  const firstId = items[0]?.id ?? '';
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveId ?? firstId);
  const [internalOpen, setInternalOpen] = useState(defaultPreviewOpen);
  const [retryKeys, setRetryKeys] = useState<Record<string, number>>({});
  const initialTransform: ImageViewerTransform = { scale: 1, rotation: 0, flipX: false, flipY: false, x: 0, y: 0 };
  const [transform, setTransform] = useState<ImageViewerTransform>(initialTransform);
  const [fullscreen, setFullscreen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const tabs = useRef(new Map<string, HTMLButtonElement>());
  const viewer = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number; originX: number; originY: number } | undefined>(undefined);
  const selectedId = items.some(item => item.id === (activeId ?? internalActiveId)) ? activeId ?? internalActiveId : firstId;
  const selectedIndex = Math.max(0, items.findIndex(item => item.id === selectedId));
  const selected = items[selectedIndex];
  const open = previewOpen ?? internalOpen;

  useEffect(() => {
    const reset = { ...initialTransform };
    setTransform(reset);
    if (selected) onTransformChange?.(reset, selected);
  }, [selectedId, open]);
  useEffect(() => {
    function changed() {
      const next = document.fullscreenElement === viewer.current;
      setFullscreen(next);
      onFullscreenChange?.(next);
    }
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, [onFullscreenChange]);

  function select(index: number, focus = false) {
    if (!items.length) return;
    const bounded = loop ? (index + items.length) % items.length : Math.max(0, Math.min(items.length - 1, index));
    const item = items[bounded];
    if (!item) return;
    if (activeId === undefined) setInternalActiveId(item.id);
    onActiveChange?.(item.id, item);
    if (focus) requestAnimationFrame(() => tabs.current.get(item.id)?.focus());
  }

  function setOpen(next: boolean) {
    if (!next && document.fullscreenElement === viewer.current) void document.exitFullscreen().catch(() => {});
    if (previewOpen === undefined) setInternalOpen(next);
    onPreviewOpenChange?.(next);
  }

  function retry(item: ImageGalleryItem) {
    setRetryKeys(previous => ({ ...previous, [item.id]: (previous[item.id] ?? 0) + 1 }));
    onRetry?.(item);
  }

  function navigate(delta: number) {
    const next = selectedIndex + delta;
    if (!loop && (next < 0 || next >= items.length)) return;
    select(next);
  }

  function changeTransform(update: (current: ImageViewerTransform) => ImageViewerTransform) {
    setTransform(current => {
      const next = update(current);
      if (selected) onTransformChange?.(next, selected);
      return next;
    });
  }

  function zoom(delta: number) {
    changeTransform(current => {
      const scale = Math.min(Math.max(current.scale + delta, Math.min(minZoom, maxZoom)), Math.max(minZoom, maxZoom));
      return { ...current, scale, x: scale <= 1 ? 0 : current.x, y: scale <= 1 ? 0 : current.y };
    });
  }

  function resetTransform() { changeTransform(() => ({ ...initialTransform })); }

  async function toggleFullscreen() {
    if (!viewer.current) return;
    try {
      if (document.fullscreenElement === viewer.current) await document.exitFullscreen();
      else await viewer.current.requestFullscreen();
    } catch { setFullscreen(false); }
  }

  if (!selected) return <section aria-label={label} className={cn('rounded-lg border border-dashed border-border p-[var(--rui-content-padding)] text-sm text-muted-foreground', className)}>{emptyLabel}</section>;

  return <Dialog open={open} onOpenChange={setOpen}>
    <section aria-label={label} aria-roledescription="gallery" className={cn('min-w-0 space-y-[var(--rui-content-gap)] font-sans text-foreground', className)}>
      <DialogTrigger render={<Button type="button" variant="ghost" className="group relative block h-auto w-full overflow-hidden rounded-lg border border-border p-0" disabled={disabled} aria-label={`放大预览：${selected.alt}`} />}>
        <GalleryImage item={selected} source={selected.src} retryKey={retryKeys[selected.id] ?? 0} className="aspect-video w-full" />
        <span className="absolute right-[var(--rui-space-2)] bottom-[var(--rui-space-2)] inline-flex items-center gap-[var(--rui-space-1)] rounded-md bg-popover/90 px-[var(--rui-space-2)] py-[var(--rui-space-1)] text-xs text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><Maximize2 aria-hidden="true" className="size-3" />放大预览</span>
      </DialogTrigger>
      {(selected.title || selected.description) && <div aria-live="polite" className="min-w-0"><p className="truncate text-sm font-medium">{selected.title ?? selected.alt}</p>{selected.description && <p className="mt-[var(--rui-space-1)] text-xs text-muted-foreground">{selected.description}</p>}</div>}
      {showThumbnails && items.length > 1 && <div role="tablist" aria-label={`${label}缩略图`} className="flex min-w-0 gap-[var(--rui-space-2)] overflow-x-auto pb-[var(--rui-space-1)]">{items.map((item, index) => <button ref={node => { if (node) tabs.current.set(item.id, node); else tabs.current.delete(item.id); }} key={item.id} type="button" role="tab" aria-selected={item.id === selected.id} aria-label={`查看第 ${index + 1} 张：${item.alt}`} tabIndex={item.id === selected.id ? 0 : -1} disabled={disabled} onClick={() => select(index)} onKeyDown={event => {
        if (event.key === 'ArrowRight') { event.preventDefault(); select(index + 1, true); }
        else if (event.key === 'ArrowLeft') { event.preventDefault(); select(index - 1, true); }
        else if (event.key === 'Home') { event.preventDefault(); select(0, true); }
        else if (event.key === 'End') { event.preventDefault(); select(items.length - 1, true); }
      }} className="size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30 p-[var(--rui-space-1)] outline-none transition-colors aria-selected:border-ring aria-selected:ring-[length:var(--rui-outline-width)] aria-selected:ring-ring/30 focus-visible:border-ring focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring/50 disabled:opacity-[var(--rui-opacity-disabled)]"><GalleryImage item={item} source={item.thumbnailSrc ?? item.src} retryKey={retryKeys[item.id] ?? 0} className="size-full rounded-sm" /></button>)}</div>}
    </section>
    <DialogContent ref={viewer} showCloseButton={false} className="h-[calc(100dvh-var(--rui-space-8))] max-h-[var(--rui-container-5xl)] max-w-[var(--rui-container-5xl)] grid-rows-[auto_minmax(0,1fr)_auto] gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)] fullscreen:inset-0 fullscreen:size-screen fullscreen:max-h-none fullscreen:max-w-none fullscreen:translate-x-0 fullscreen:translate-y-0 fullscreen:rounded-none" onKeyDown={event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1); }
      else if (event.key === 'Home') { event.preventDefault(); select(0); }
      else if (event.key === 'End') { event.preventDefault(); select(items.length - 1); }
      else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(zoomStep); }
      else if (event.key === '-') { event.preventDefault(); zoom(-zoomStep); }
      else if (event.key === '0') { event.preventDefault(); resetTransform(); }
    }}>
      <div className="min-w-0 space-y-[var(--rui-content-gap-sm)]"><div className="flex min-w-0 items-start justify-between gap-[var(--rui-content-gap)]"><div className="min-w-0"><DialogTitle className="truncate">{selected.title ?? selected.alt}</DialogTitle><DialogDescription className="mt-[var(--rui-space-1)]">第 {selectedIndex + 1} 张，共 {items.length} 张{selected.description ? ` · ${selected.description}` : ''}</DialogDescription></div><DialogClose render={<Button type="button" variant="ghost" size="icon-sm" aria-label="关闭预览" />}><X aria-hidden="true" /></DialogClose></div>
      {viewerTools && <div role="toolbar" aria-label="图像查看工具" className="flex min-w-0 flex-wrap items-center gap-[var(--rui-space-1)]"><Button type="button" variant="ghost" size="icon-sm" aria-label="缩小" disabled={transform.scale <= Math.min(minZoom, maxZoom)} onClick={() => zoom(-zoomStep)}><ZoomOut aria-hidden="true" /></Button><span data-view-scale className="min-w-10 text-center text-xs text-muted-foreground">{Math.round(transform.scale * 100)}%</span><Button type="button" variant="ghost" size="icon-sm" aria-label="放大" disabled={transform.scale >= Math.max(minZoom, maxZoom)} onClick={() => zoom(zoomStep)}><ZoomIn aria-hidden="true" /></Button><Button type="button" variant="ghost" size="icon-sm" aria-label="重置视图" onClick={resetTransform}><RotateCcw aria-hidden="true" /></Button><Button type="button" variant="ghost" size="icon-sm" aria-label="向右旋转" onClick={() => changeTransform(current => ({ ...current, rotation: (current.rotation + 90) % 360 }))}><RotateCw aria-hidden="true" /></Button><Button type="button" variant="ghost" size="icon-sm" aria-label="水平翻转" aria-pressed={transform.flipX} onClick={() => changeTransform(current => ({ ...current, flipX: !current.flipX }))}><FlipHorizontal2 aria-hidden="true" /></Button><Button type="button" variant="ghost" size="icon-sm" aria-label="垂直翻转" aria-pressed={transform.flipY} onClick={() => changeTransform(current => ({ ...current, flipY: !current.flipY }))}><FlipVertical2 aria-hidden="true" /></Button><Button type="button" variant="ghost" size="icon-sm" aria-label={fullscreen ? '退出全屏' : '进入全屏'} aria-pressed={fullscreen} onClick={() => { void toggleFullscreen(); }}><Maximize aria-hidden="true" /></Button>{onDownload && <Button type="button" variant="ghost" size="icon-sm" aria-label="下载当前图片" onClick={() => onDownload(selected)}><Download aria-hidden="true" /></Button>}</div>}</div>
      <div data-image-stage data-scale={transform.scale} data-rotation={transform.rotation} data-flip-x={transform.flipX} data-flip-y={transform.flipY} data-x={transform.x} data-y={transform.y} className={cn('min-h-0 overflow-hidden rounded-lg border border-border', transform.scale > 1 && (dragging ? 'cursor-grabbing' : 'cursor-grab'))} onWheel={event => { if (event.ctrlKey || event.metaKey) { event.preventDefault(); zoom(event.deltaY < 0 ? zoomStep : -zoomStep); } }} onPointerDown={event => { if (transform.scale <= 1) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, originX: transform.x, originY: transform.y }; setDragging(true); }} onPointerMove={event => { const current = drag.current; if (!current || current.pointerId !== event.pointerId) return; changeTransform(view => ({ ...view, x: current.originX + event.clientX - current.x, y: current.originY + event.clientY - current.y })); }} onPointerUp={event => { if (drag.current?.pointerId === event.pointerId) { drag.current = undefined; setDragging(false); } }} onPointerCancel={() => { drag.current = undefined; setDragging(false); }}>
        <GalleryImage item={selected} source={selected.src} retryKey={retryKeys[selected.id] ?? 0} onRetry={onRetry ? () => retry(selected) : undefined} className="size-full" imageClassName="will-change-transform" imageStyle={{ transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotation}deg) scale(${transform.scale * (transform.flipX ? -1 : 1)}, ${transform.scale * (transform.flipY ? -1 : 1)})` }} />
      </div>
      <div className="flex items-center justify-between gap-[var(--rui-content-gap)]"><Button type="button" variant="outline" size="sm" disabled={!loop && selectedIndex === 0} onClick={() => navigate(-1)}><ChevronLeft aria-hidden="true" />上一张</Button><span role="status" className="text-xs text-muted-foreground">{selectedIndex + 1} / {items.length}</span><Button type="button" variant="outline" size="sm" disabled={!loop && selectedIndex === items.length - 1} onClick={() => navigate(1)}>下一张<ChevronRight aria-hidden="true" /></Button></div>
    </DialogContent>
  </Dialog>;
}
