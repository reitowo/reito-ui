import { Children, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { ArrowDown, LoaderCircle } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { classes } from './shared.js';

export interface ConversationProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  follow?: boolean;
  label?: string;
  empty?: ReactNode;
}

/** Follows new content only while the reader is at the bottom; scrolling up suspends following. */
export function Conversation({ children, follow = true, label = '对话内容', empty, className, ...props }: ConversationProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const [atEnd, setAtEnd] = useState(true);
  const id = useId();

  function updatePosition() {
    const element = viewportRef.current;
    if (!element) return;
    const nearEnd = element.scrollHeight - element.clientHeight - element.scrollTop < 48;
    following.current = nearEnd;
    setAtEnd(nearEnd);
  }

  function goToEnd() {
    const element = viewportRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
    following.current = true;
    setAtEnd(true);
  }

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const resize = new ResizeObserver(() => {
      if (follow && following.current) goToEnd();
      else updatePosition();
    });
    resize.observe(content);
    return () => resize.disconnect();
  }, [follow]);

  return <div className={classes('relative flex min-h-0 min-w-0 flex-col', className)} {...props}>
    <div id={id} ref={viewportRef} role="region" aria-label={label} tabIndex={0} className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-md focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:outline-ring" onScroll={updatePosition}>
      <div ref={contentRef} className="mx-auto grid w-full max-w-[var(--rui-reading-width)] gap-[var(--rui-message-gap)] p-[var(--rui-content-padding)]">{Children.count(children) ? children : empty}</div>
    </div>
    {!atEnd && <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center"><Button type="button" variant="outline" size="sm" className="pointer-events-auto shadow-sm" aria-controls={id} onClick={goToEnd}><ArrowDown className="size-3.5" aria-hidden="true" />回到最新</Button></div>}
  </div>;
}

export interface MessageProps extends HTMLAttributes<HTMLElement> {
  from: 'user' | 'assistant' | 'system';
  name?: string;
  children: ReactNode;
  streaming?: boolean;
  actions?: ReactNode;
  local?: boolean;
}

export function Message({ from, name, children, streaming = false, actions, local = false, className, ...props }: MessageProps) {
  const author = name ?? (from === 'user' ? '你' : from === 'assistant' ? '助手' : '系统');
  return <article aria-label={`${author}的消息`} className={classes('min-w-0', from === 'user' ? 'ml-auto max-w-[92%]' : 'w-full', className)} {...props}>
    {(local || name || from === 'system') && <div className="mb-1.5 text-xs text-muted-foreground">{author}{local ? ' · 本地示例' : ''}</div>}
    <div className={classes('whitespace-pre-wrap break-words text-[length:var(--rui-font-interface)] leading-6', from === 'user' && 'rounded-xl bg-muted px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)]', from === 'system' && 'text-muted-foreground')}>{children}</div>
    {streaming && <div role="status" className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><LoaderCircle className="size-3 motion-safe:animate-spin" aria-hidden="true" />正在输出</div>}
    {actions && <div className="mt-2 flex flex-wrap items-center gap-1">{actions}</div>}
  </article>;
}
