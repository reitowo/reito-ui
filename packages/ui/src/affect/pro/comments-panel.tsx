import { useMemo, useState } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Tabs, TabsList, TabsTrigger } from '../../primitives/tabs.js';
import { Textarea } from '../../primitives/textarea.js';
import { Avatar, AvatarFallback } from '../../primitives/avatar.js';
import { cn } from '../../lib/utils.js';
import { initials } from '../shared.js';

export type CommentAuthor = { name: string; avatar?: string };
export type PanelComment = {
  id: string;
  author: CommentAuthor;
  createdAt: number | Date;
  text: string;
  resolved?: boolean;
};
export type CommentsPanelProps = {
  comments: PanelComment[];
  currentUser?: CommentAuthor;
  onRunEdit?: (comment: PanelComment) => void | Promise<void>;
  onAdd?: (comment: PanelComment) => void;
  onClose?: () => void;
  title?: string;
  className?: string;
};

function isEdit(text: string) {
  return /^\/edit\b/i.test(text.trim());
}

function ago(time: number, now: number) {
  const minutes = Math.max(1, Math.round((now - time) / 60000));
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.round(hours / 24)} 天前`;
}

/** Recreated from public Comments Panel docs. Not Pro source. */
export function CommentsPanel({
  comments,
  currentUser = { name: '你' },
  onRunEdit,
  onAdd,
  onClose,
  title = '评论',
  className,
}: CommentsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved' | 'edits'>('all');
  const [sort, setSort] = useState<'new' | 'old'>('new');
  const [draft, setDraft] = useState('');
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [local, setLocal] = useState<PanelComment[]>([]);
  const items = [...comments, ...local];
  const visible = useMemo(() => {
    const list = items.filter((comment) => {
      const done = resolved[comment.id] ?? comment.resolved;
      if (filter === 'open') return !done;
      if (filter === 'resolved') return done;
      if (filter === 'edits') return isEdit(comment.text);
      return true;
    });
    return list.sort((a, b) => {
      const left = new Date(a.createdAt).getTime();
      const right = new Date(b.createdAt).getTime();
      return sort === 'new' ? right - left : left - right;
    });
  }, [items, filter, sort, resolved]);

  async function run(comment: PanelComment) {
    setRunning(comment.id);
    try {
      await onRunEdit?.(comment);
    } finally {
      setRunning(null);
    }
  }

  return (
    <section
      className={cn(
        'grid max-w-sm gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">{title}</Heading>
        {onClose ? (
          <Button type="button" size="xs" variant="ghost" onClick={onClose}>
            关闭
          </Button>
        ) : null}
      </Inline>
      <Inline className="justify-between">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <TabsList variant="line">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="open">未解决</TabsTrigger>
            <TabsTrigger value="resolved">已解决</TabsTrigger>
            <TabsTrigger value="edits">编辑</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          onClick={() => setSort((value) => (value === 'new' ? 'old' : 'new'))}
        >
          {sort === 'new' ? '最新' : '最早'}
        </Button>
      </Inline>
      <ol className="grid gap-[var(--rui-content-gap)]" aria-live="polite">
        {visible.map((comment) => {
          const done = resolved[comment.id] ?? comment.resolved;
          const time = new Date(comment.createdAt).getTime();
          return (
            <li key={comment.id} className="grid gap-2">
              <Inline className="justify-between">
                <Inline>
                  <Avatar size="sm">
                    <AvatarFallback>{initials(comment.author.name)}</AvatarFallback>
                  </Avatar>
                  <Stack gap="none">
                    <Text variant="interface">{comment.author.name}</Text>
                    <time
                      dateTime={new Date(time).toISOString()}
                      className="text-[length:var(--rui-font-caption)] text-muted-foreground"
                    >
                      {ago(time, Date.now())}
                    </time>
                  </Stack>
                </Inline>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  aria-pressed={Boolean(done)}
                  onClick={() => setResolved((current) => ({ ...current, [comment.id]: !done }))}
                >
                  {done ? '已解决' : '解决'}
                </Button>
              </Inline>
              <Text>{comment.text}</Text>
              {isEdit(comment.text) ? (
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={running === comment.id}
                  onClick={() => void run(comment)}
                >
                  {running === comment.id ? '运行中…' : '运行编辑'}
                </Button>
              ) : null}
            </li>
          );
        })}
      </ol>
      <form
        className="grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const text = draft.trim();
          if (!text) return;
          const comment: PanelComment = {
            id: `c-${items.length + 1}`,
            author: currentUser,
            createdAt: Date.now(),
            text,
          };
          setLocal((current) => [...current, comment]);
          onAdd?.(comment);
          setDraft('');
        }}
      >
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="写一条评论，或以 /edit 开头"
          aria-label="新评论"
          rows={2}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <Inline className="justify-end">
          <Button type="submit" size="sm" disabled={!draft.trim()}>
            发送
          </Button>
        </Inline>
      </form>
    </section>
  );
}
