import { useId, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../basic/composition.js';
import { Avatar, AvatarFallback } from '../primitives/avatar.js';
import { Button } from '../primitives/button.js';
import { Textarea } from '../primitives/textarea.js';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../primitives/collapsible.js';
import { cn } from '../lib/utils.js';
import { cardClass, initials, surfaceClass, type AffectAppearance } from './shared.js';
import { ThinkingLoader } from './thinking-loader.js';

export type ThreadAuthor = { name: string; avatar?: ReactNode | string; assistant?: boolean };
export type ThreadMessage = {
  id: string;
  author: ThreadAuthor;
  createdAt: Date | number;
  text: string;
  status?: string;
  details?: string[];
};
export type CommentThreadProps = {
  title?: string;
  messages: ThreadMessage[];
  currentUser: ThreadAuthor;
  assistant?: ThreadAuthor;
  onReply?: (text: string) => ThreadMessage | Promise<ThreadMessage | void> | void;
  onClose?: () => void;
  appearance?: AffectAppearance;
  className?: string;
};

function ago(time: number, now: number) {
  const seconds = Math.max(0, Math.round((now - time) / 1000));
  if (seconds < 45) return '刚刚';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.round(hours / 24);
  return `${days} 天前`;
}

function AuthorMark({ author }: { author: ThreadAuthor }) {
  if (typeof author.avatar === 'string') {
    return (
      <Avatar>
        <img src={author.avatar} alt="" className="size-full object-cover" />
        <AvatarFallback>{initials(author.name)}</AvatarFallback>
      </Avatar>
    );
  }
  if (author.avatar) return <>{author.avatar}</>;
  return (
    <Avatar>
      <AvatarFallback>{initials(author.name)}</AvatarFallback>
    </Avatar>
  );
}

export function AssistantMark() {
  return (
    <span className="rounded-full bg-accent-soft px-1.5 text-[length:var(--rui-font-caption)] text-accent">
      助手
    </span>
  );
}

/** One comment with replies. Assistant answers can fold open details. */
export function CommentThread({
  title = '评论',
  messages,
  currentUser,
  assistant,
  onReply,
  onClose,
  appearance = 'default',
  className,
}: CommentThreadProps) {
  const fieldId = useId();
  const [items, setItems] = useState(messages);
  const [draft, setDraft] = useState('');
  const [composing, setComposing] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const now = Date.now();

  async function submit() {
    const text = draft.trim();
    if (!text || waiting) return;
    const userMessage: ThreadMessage = {
      id: `local-${items.length + 1}`,
      author: currentUser,
      createdAt: Date.now(),
      text,
    };
    setItems((current) => [...current, userMessage]);
    setDraft('');
    setWaiting(true);
    try {
      const reply = await onReply?.(text);
      if (reply) setItems((current) => [...current, reply]);
    } finally {
      setWaiting(false);
    }
  }

  return (
    <section aria-label={title} className={cn(surfaceClass(appearance), className)}>
      <Stack className={cn(cardClass(appearance), 'p-[var(--rui-content-padding)]')}>
        <Inline className="justify-between">
          <Heading size="item">{title}</Heading>
          {onClose ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="关闭评论"
              onClick={onClose}
            >
              <X />
            </Button>
          ) : null}
        </Inline>
        <ol className="grid gap-[var(--rui-content-gap)]">
          {items.map((message) => (
            <li key={message.id} className="flex min-w-0 gap-2">
              <AuthorMark author={message.author} />
              <Stack gap="small" className="min-w-0 flex-1">
                <Inline>
                  <Text as="span" variant="interface">
                    {message.author.name}
                  </Text>
                  {message.author.assistant ? <AssistantMark /> : null}
                  <Text as="span" variant="caption" tone="muted">
                    {ago(new Date(message.createdAt).getTime(), now)}
                  </Text>
                </Inline>
                <Text variant="interface">{message.text}</Text>
                {message.details?.length ? (
                  <Collapsible>
                    <CollapsibleTrigger className="text-[length:var(--rui-font-caption)] text-muted-foreground underline-offset-4 hover:underline">
                      {message.status ?? '查看详情'}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="mt-1 list-disc pl-4 text-[length:var(--rui-font-caption)] text-muted-foreground">
                        {message.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                ) : null}
              </Stack>
            </li>
          ))}
        </ol>
        {waiting ? <ThinkingLoader phases={['正在回复']} variant="plain" size="sm" /> : null}
        <div className="grid gap-[var(--rui-content-gap-sm)]">
          <label htmlFor={fieldId} className="sr-only">
            回复{assistant ? ` ${assistant.name}` : ''}
          </label>
          <Textarea
            id={fieldId}
            value={draft}
            rows={2}
            onChange={(event) => setDraft(event.target.value)}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !composing) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder="写下回复…"
          />
          <Inline>
            <Button
              type="button"
              size="sm"
              disabled={!draft.trim() || waiting}
              onClick={() => void submit()}
            >
              回复
            </Button>
          </Inline>
        </div>
      </Stack>
    </section>
  );
}
