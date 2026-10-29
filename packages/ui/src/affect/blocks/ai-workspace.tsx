import { useId, useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { Label } from '../../primitives/label.js';
import { Avatar, AvatarFallback, AvatarImage } from '../../primitives/avatar.js';
import { cn } from '../../lib/utils.js';
import { initials, usePrefersReducedMotion } from '../shared.js';
import { ChatComposer } from '../pro/chat-composer.js';

export type WorkspaceMessage = { role: 'user' | 'assistant'; content: string };
export type WorkspaceConversation = { id: string; title: string; messages: WorkspaceMessage[] };
export type WorkspaceProject = {
  id?: string;
  name: string;
  description?: string;
  updatedDays?: number;
  pinned?: boolean;
};
export type AiWorkspaceProps = {
  respond?: (message: string, history: WorkspaceMessage[]) => Promise<string>;
  userName?: string;
  userAvatar?: string;
  workspace?: ReactNode;
  pinned?: string[];
  conversations?: WorkspaceConversation[];
  projects?: WorkspaceProject[];
  className?: string;
};

const sampleConversations: WorkspaceConversation[] = [
  {
    id: 'brief',
    title: '本周简报',
    messages: [
      { role: 'user', content: '整理本周变化。' },
      { role: 'assistant', content: '先从审查队列和规范差异开始。' },
    ],
  },
  {
    id: 'draft',
    title: '客户回复',
    messages: [{ role: 'user', content: '起草一封跟进说明。' }],
  },
];

const sampleProjects: WorkspaceProject[] = [
  { id: 'surface', name: '表面重建', description: '公开目录对齐', updatedDays: 1, pinned: true },
  { id: 'density', name: '密度对齐', description: '28px 轨道', updatedDays: 3 },
];

/** Recreated from public AI Workspace docs. Composes Chat Composer. Not Pro source. */
export function AiWorkspace({
  respond,
  userName = 'Lena',
  userAvatar,
  workspace = 'N',
  pinned = [],
  conversations = sampleConversations,
  projects = sampleProjects,
  className,
}: AiWorkspaceProps) {
  const reduced = usePrefersReducedMotion();
  const createId = useId();
  const [open, setOpen] = useState(true);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [items, setItems] = useState(conversations);
  const [boards, setBoards] = useState(projects);
  const [active, setActive] = useState(conversations[0]?.id ?? '');
  const [view, setView] = useState<'chat' | 'projects'>('chat');
  const [busy, setBusy] = useState(false);
  const current = items.find((item) => item.id === active) ?? items[0];
  const pins = [
    ...new Set([...pinned, ...boards.filter((item) => item.pinned).map((item) => item.name)]),
  ];

  async function send(message: string) {
    const history = [...(current?.messages ?? []), { role: 'user' as const, content: message }];
    setItems((prev) =>
      prev.map((item) => (item.id === current?.id ? { ...item, messages: history } : item)),
    );
    setBusy(true);
    const answer = respond
      ? await respond(message, history)
      : `已记下「${message}」。这是本地示例回复，不是模型输出。`;
    setItems((prev) =>
      prev.map((item) =>
        item.id === current?.id
          ? { ...item, messages: [...history, { role: 'assistant', content: answer }] }
          : item,
      ),
    );
    setBusy(false);
  }

  return (
    <section
      className={cn(
        'grid min-h-[var(--rui-preview-min-height)] overflow-hidden rounded-[var(--rui-radius-surface)] border border-border bg-background @md:grid-cols-[auto_minmax(0,1fr)]',
        className,
      )}
    >
      <aside
        className={cn(
          'grid content-start gap-[var(--rui-content-gap-sm)] border-border bg-card p-[var(--rui-content-padding)]',
          open ? 'w-[var(--rui-sidebar-width-narrow)] border-r' : 'w-[var(--rui-control-height)]',
          !reduced && 'transition-[width] duration-[var(--rui-motion-duration)]',
        )}
        inert={!open ? true : undefined}
      >
        <Inline className="justify-between">
          <span className="grid size-8 place-items-center rounded-[var(--rui-radius)] bg-muted text-[length:var(--rui-font-caption)] font-medium">
            {workspace}
          </span>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={open ? '收起侧栏' : '展开侧栏'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? '‹' : '›'}
          </Button>
        </Inline>
        {open ? (
          <>
            <Stack gap="small">
              <Text variant="caption" tone="muted">
                置顶
              </Text>
              {pins.length ? (
                pins.map((item) => <Text key={item}>{item}</Text>)
              ) : (
                <Text variant="caption">暂无置顶</Text>
              )}
            </Stack>
            <Stack gap="small">
              <Text variant="caption" tone="muted">
                对话
              </Text>
              {items.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="xs"
                  variant={item.id === current?.id && view === 'chat' ? 'secondary' : 'ghost'}
                  className="justify-start"
                  onClick={() => {
                    setActive(item.id);
                    setView('chat');
                  }}
                >
                  {item.title}
                </Button>
              ))}
            </Stack>
            <Button
              type="button"
              size="xs"
              variant={view === 'projects' ? 'secondary' : 'ghost'}
              onClick={() => setView('projects')}
            >
              项目
            </Button>
            <Button type="button" size="xs" variant="outline" onClick={() => setCreating(true)}>
              新建项目
            </Button>
            <div className="mt-auto flex items-center gap-2">
              <Avatar size="sm">
                {userAvatar ? <AvatarImage src={userAvatar} alt="" /> : null}
                <AvatarFallback>{initials(userName)}</AvatarFallback>
              </Avatar>
              <Text variant="caption">{userName}</Text>
            </div>
          </>
        ) : null}
      </aside>
      <div className="grid min-w-0 content-start gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
        {view === 'projects' ? (
          <div className="grid gap-[var(--rui-content-gap)] @md:grid-cols-2">
            {boards.map((item) => (
              <article
                key={item.id ?? item.name}
                className="rounded-[var(--rui-radius)] border border-border bg-card p-[var(--rui-content-padding)]"
              >
                <Heading size="item">{item.name}</Heading>
                <Text variant="caption" tone="muted">
                  {item.description}
                  {item.updatedDays != null ? ` · ${item.updatedDays} 天前` : ''}
                </Text>
              </article>
            ))}
          </div>
        ) : (
          <>
            <Stack gap="small">
              <Heading size="section">你好，{userName}</Heading>
              <Text variant="caption" tone="muted">
                {current?.title ?? '新对话'}
              </Text>
            </Stack>
            <div className="grid gap-2" aria-live="polite">
              {(current?.messages ?? []).map((message, index) => (
                <p
                  key={`${message.role}-${index}`}
                  className={cn(
                    'max-w-[var(--rui-reading-width)] rounded-[var(--rui-radius)] px-[var(--rui-compact-surface-padding-x)] py-[var(--rui-cell-padding-y)] text-[length:var(--rui-font-interface)]',
                    message.role === 'user'
                      ? 'justify-self-end bg-primary text-primary-foreground'
                      : 'bg-muted',
                  )}
                >
                  {message.content}
                </p>
              ))}
              {busy ? (
                <Text variant="caption" tone="muted">
                  正在写入回复…
                </Text>
              ) : null}
            </div>
            <ChatComposer onSend={(text) => void send(text)} />
          </>
        )}
      </div>
      {creating ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${createId}-title`}
          className="col-span-full grid place-items-center bg-[var(--rui-overlay)] p-[var(--rui-content-padding)]"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setCreating(false);
          }}
        >
          <form
            className="grid w-full max-w-[var(--rui-container-xs)] gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draftName.trim()) return;
              setBoards((prev) => [{ name: draftName.trim(), updatedDays: 0 }, ...prev]);
              setDraftName('');
              setCreating(false);
              setView('projects');
            }}
          >
            <Heading id={`${createId}-title`} size="item">
              新建项目
            </Heading>
            <Label htmlFor={`${createId}-name`}>名称</Label>
            <Input
              id={`${createId}-name`}
              value={draftName}
              autoFocus
              onChange={(event) => setDraftName(event.target.value)}
            />
            <Inline className="justify-end">
              <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
                取消
              </Button>
              <Button type="submit">创建</Button>
            </Inline>
          </form>
        </div>
      ) : null}
    </section>
  );
}
