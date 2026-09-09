import { useEffect, useState, type ComponentProps } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '../primitives/button.js';

export interface ScrollTopProps extends Omit<ComponentProps<typeof Button>, 'onClick'> {
  /** Actual scrolling surface. null means it has not mounted yet. */
  target: HTMLElement | Window | null;
  /** Defaults to one viewport height; independent of a particular page size. */
  threshold?: number;
  behavior?: ScrollBehavior;
  /** Focus destination at the top. Defaults to the scrolling surface. */
  focusTarget?: HTMLElement | null;
}

/** A flow-positioned control: the host chooses its location, never a global overlay. */
export function ScrollTop({ target, threshold, behavior = 'smooth', focusTarget, disabled, children,
  'aria-label': label = '返回顶部', variant = 'outline', size = 'sm', ...props }: ScrollTopProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!target) { setVisible(false); return; }
    const win = 'document' in target ? target : target.ownerDocument.defaultView!;
    const surface = 'document' in target ? target.document.documentElement : target;
    const measure = () => {
      const height = 'document' in target ? target.innerHeight : target.clientHeight;
      const top = 'document' in target ? target.scrollY : target.scrollTop;
      const limit = threshold === undefined || !Number.isFinite(threshold) ? height : Math.max(0, threshold);
      setVisible(top > limit && surface.scrollHeight > height);
    };
    measure();
    target.addEventListener('scroll', measure, { passive: true });
    win.addEventListener('resize', measure);
    const resize = new ResizeObserver(measure);
    resize.observe(surface);
    for (const child of surface.children) resize.observe(child);
    const mutation = new MutationObserver(() => {
      resize.disconnect(); resize.observe(surface);
      for (const child of surface.children) resize.observe(child);
      measure();
    });
    mutation.observe(surface, { childList: true, subtree: true, characterData: true });
    return () => { target.removeEventListener('scroll', measure); win.removeEventListener('resize', measure); resize.disconnect(); mutation.disconnect(); };
  }, [target, threshold]);

  function activate() {
    if (!target || disabled) return;
    const win = 'document' in target ? target : target.ownerDocument.defaultView!;
    const destination = focusTarget ?? ('document' in target ? target.document.documentElement : target);
    const hadTabIndex = destination.hasAttribute('tabindex');
    if (!hadTabIndex) destination.setAttribute('tabindex', '-1');
    destination.focus({ preventScroll: true });
    if (!hadTabIndex) destination.addEventListener('blur', () => destination.removeAttribute('tabindex'), { once: true });
    target.scrollTo({ top: 0, behavior: win.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : behavior });
  }
  if (!visible) return null;
  return <Button {...props} variant={variant} size={size} disabled={disabled} aria-label={label} onClick={activate}>
    {children ?? <><ArrowUp aria-hidden="true" />{label}</>}
  </Button>;
}
