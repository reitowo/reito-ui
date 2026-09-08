import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../primitives/dialog.js';
import { Composer, type ComposerProps } from './composer.js';
import { Conversation } from './conversation.js';

export interface ChatOverlayProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  triggerLabel?: string;
  disabled?: boolean;
  children?: ReactNode;
  empty?: ReactNode;
  follow?: boolean;
  composer: ComposerProps;
}

/** Closing hides the workspace; it does not discard drafts or stop host execution. */
export function ChatOverlay({ open, defaultOpen = false, onOpenChange, title = '工作区助手', description = '围绕当前工作继续对话', triggerLabel = '打开助手', disabled = false, children, empty = '还没有消息，输入问题开始对话。', follow = true, composer }: ChatOverlayProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  return <Dialog open={open ?? internalOpen} onOpenChange={next => { if (open === undefined) setInternalOpen(next); onOpenChange?.(next); }}>
    <DialogTrigger render={<Button type="button" variant="outline" disabled={disabled} />}>{triggerLabel}</DialogTrigger>
    <DialogContent keepMounted showCloseButton={false} className="flex max-h-[calc(100dvh-var(--rui-space-8))] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
      <header className="flex min-w-0 items-start gap-[var(--rui-content-gap-sm)] border-b border-border p-[var(--rui-content-padding)]">
        <div className="min-w-0 flex-1"><DialogTitle className="break-words">{title}</DialogTitle><DialogDescription className="mt-1">{description}</DialogDescription></div>
        <DialogClose render={<Button type="button" variant="ghost" size="icon-sm" aria-label="关闭助手" />}><X aria-hidden="true" /></DialogClose>
      </header>
      <Conversation className="h-[var(--rui-container-xl)] shrink" follow={follow} empty={<p className="text-sm text-muted-foreground">{empty}</p>}>{children}</Conversation>
      <div className="min-h-0 shrink-0 overflow-y-auto border-t border-border p-[var(--rui-content-padding)]"><Composer {...composer} /></div>
    </DialogContent>
  </Dialog>;
}
