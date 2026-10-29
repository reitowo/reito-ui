import { useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { Label } from '../../primitives/label.js';
import { cn } from '../../lib/utils.js';
import { initials } from '../shared.js';

export type TaskStatus = { id: string; label: string; icon?: ReactNode };
export type TaskLabel = { id: string; label: string; color?: string };
export type TaskPerson = { id: string; name: string; avatar?: string };
export type BoardSubtask = { id: string; title: string; done?: boolean };
export type BoardTask = {
  key: string;
  title: string;
  status: string;
  priority?: number;
  estimate?: string;
  labels?: string[];
  assignee?: string;
  dueIn?: string;
  subtasks?: BoardSubtask[];
  pullRequest?: string;
  created?: string;
  starred?: boolean;
};
export type TaskBoardProps = {
  tasks?: BoardTask[];
  statuses?: TaskStatus[];
  labels?: TaskLabel[];
  people?: TaskPerson[];
  path?: string[];
  onChange?: (tasks: BoardTask[]) => void;
  className?: string;
};

const sampleStatuses: TaskStatus[] = [
  { id: 'todo', label: '待办' },
  { id: 'doing', label: '进行中' },
  { id: 'review', label: '审查' },
  { id: 'done', label: '完成' },
];
const sampleLabels: TaskLabel[] = [
  { id: 'docs', label: '文档' },
  { id: 'ui', label: '界面' },
];
const samplePeople: TaskPerson[] = [
  { id: 'lena', name: 'Lena Hart' },
  { id: 'alex', name: 'Alex Morgan' },
];
const sampleTasks: BoardTask[] = [
  {
    key: 'REI-12',
    title: '对齐公开目录',
    status: 'doing',
    priority: 2,
    estimate: '3',
    labels: ['docs'],
    assignee: 'lena',
    dueIn: '2d',
    subtasks: [
      { id: 'a', title: 'blocks', done: true },
      { id: 'b', title: 'motion' },
    ],
    created: '昨天',
  },
  {
    key: 'REI-13',
    title: '审查密度轨道',
    status: 'todo',
    priority: 1,
    labels: ['ui'],
    assignee: 'alex',
    created: '今天',
  },
  {
    key: 'REI-14',
    title: '补插画标记',
    status: 'review',
    priority: 3,
    labels: ['ui'],
    created: '今天',
  },
];

const priorities = ['无', '低', '中', '高', '紧急'];

/** Recreated from public Task Board docs. Status moves via the detail panel. Not Pro source. */
export function TaskBoard({
  tasks = sampleTasks,
  statuses = sampleStatuses,
  labels = sampleLabels,
  people = samplePeople,
  path = ['Northwind', 'Launch', 'Sprint 12'],
  onChange,
  className,
}: TaskBoardProps) {
  const [items, setItems] = useState(tasks);
  const [query, setQuery] = useState('');
  const [activeLabels, setActiveLabels] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const current = items.find((item) => item.key === open);
  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          item.title.toLowerCase().includes(query.trim().toLowerCase()) &&
          (!activeLabels.length || item.labels?.some((label) => activeLabels.includes(label))),
      ),
    [activeLabels, items, query],
  );

  function commit(next: BoardTask[]) {
    setItems(next);
    onChange?.(next);
  }

  function patch(key: string, partial: Partial<BoardTask>) {
    commit(items.map((item) => (item.key === key ? { ...item, ...partial } : item)));
  }

  return (
    <section className={cn('grid min-w-0 gap-[var(--rui-content-gap)]', className)}>
      <nav aria-label="路径">
        <ol className="flex flex-wrap gap-1 text-[length:var(--rui-font-caption)] text-muted-foreground">
          {path.map((item, index) => (
            <li
              key={item}
              className={index === path.length - 1 ? 'text-foreground' : undefined}
              aria-current={index === path.length - 1 ? 'page' : undefined}
            >
              {index ? ' / ' : null}
              {item}
            </li>
          ))}
        </ol>
      </nav>
      <Inline className="justify-between">
        <Label htmlFor="affect-task-search" className="sr-only">
          搜索任务
        </Label>
        <Input
          id="affect-task-search"
          value={query}
          placeholder="搜索"
          onChange={(event) => setQuery(event.target.value)}
        />
        <Inline>
          <Button
            type="button"
            size="xs"
            variant={compact ? 'secondary' : 'ghost'}
            aria-pressed={compact}
            onClick={() => setCompact((value) => !value)}
          >
            紧凑
          </Button>
          {labels.map((label) => (
            <Button
              key={label.id}
              type="button"
              size="xs"
              variant={activeLabels.includes(label.id) ? 'secondary' : 'ghost'}
              aria-pressed={activeLabels.includes(label.id)}
              onClick={() =>
                setActiveLabels((prev) =>
                  prev.includes(label.id)
                    ? prev.filter((id) => id !== label.id)
                    : [...prev, label.id],
                )
              }
            >
              {label.label}
            </Button>
          ))}
        </Inline>
      </Inline>
      <div className="flex min-w-0 gap-[var(--rui-content-gap)] overflow-x-auto">
        {statuses.map((status) => {
          const column = visible.filter((item) => item.status === status.id);
          return (
            <section
              key={status.id}
              aria-label={status.label}
              className="grid min-w-[var(--rui-container-3xs)] flex-1 content-start gap-2"
            >
              <Inline>
                {status.icon}
                <Heading size="item">{status.label}</Heading>
                <Text variant="caption" tone="muted">
                  {column.length}
                </Text>
              </Inline>
              {column.map((task) => (
                <button
                  key={task.key}
                  type="button"
                  onClick={() => setOpen(task.key)}
                  className={cn(
                    'grid gap-1 rounded-[var(--rui-radius)] border border-border bg-card p-[var(--rui-compact-surface-padding-x)] text-left',
                    compact && 'py-1',
                  )}
                >
                  <Inline className="justify-between">
                    <Text variant="caption" tone="muted">
                      {task.key}
                    </Text>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-pressed={task.starred}
                      aria-label="星标"
                      onClick={(event) => {
                        event.stopPropagation();
                        patch(task.key, { starred: !task.starred });
                      }}
                    >
                      {task.starred ? '★' : '☆'}
                    </Button>
                  </Inline>
                  <Text>{task.title}</Text>
                  {!compact ? (
                    <Inline>
                      {task.labels?.map((id) => (
                        <Badge key={id} variant="secondary">
                          {labels.find((label) => label.id === id)?.label ?? id}
                        </Badge>
                      ))}
                      {task.assignee ? (
                        <Text variant="caption">
                          {initials(
                            people.find((person) => person.id === task.assignee)?.name ??
                              task.assignee,
                          )}
                        </Text>
                      ) : null}
                    </Inline>
                  ) : null}
                </button>
              ))}
              {adding === status.id ? (
                <form
                  className="grid gap-1"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!draft.trim()) return;
                    commit([
                      ...items,
                      {
                        key: `REI-${items.length + 20}`,
                        title: draft.trim(),
                        status: status.id,
                        created: '刚刚',
                      },
                    ]);
                    setDraft('');
                    setAdding(null);
                  }}
                >
                  <Label htmlFor={`affect-new-${status.id}`} className="sr-only">
                    新任务
                  </Label>
                  <Input
                    id={`affect-new-${status.id}`}
                    value={draft}
                    autoFocus
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') setAdding(null);
                    }}
                  />
                  <Button type="submit" size="xs">
                    添加
                  </Button>
                </form>
              ) : (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => setAdding(status.id)}
                >
                  添加任务
                </Button>
              )}
            </section>
          );
        })}
      </div>
      {current ? (
        <aside className="rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]">
          <Inline className="justify-between">
            <Heading size="item">{current.title}</Heading>
            <Button type="button" size="xs" variant="ghost" onClick={() => setOpen(null)}>
              关闭
            </Button>
          </Inline>
          <Text variant="caption" tone="muted">
            {current.key} · {current.created}
          </Text>
          <Stack gap="small" className="mt-[var(--rui-content-gap)]">
            <Text variant="caption">状态</Text>
            <Inline>
              {statuses.map((status) => (
                <Button
                  key={status.id}
                  type="button"
                  size="xs"
                  variant={current.status === status.id ? 'secondary' : 'ghost'}
                  aria-pressed={current.status === status.id}
                  onClick={() => patch(current.key, { status: status.id })}
                >
                  {status.label}
                </Button>
              ))}
            </Inline>
            <Text variant="caption">优先级</Text>
            <Inline>
              {priorities.map((label, index) => (
                <Button
                  key={label}
                  type="button"
                  size="xs"
                  variant={(current.priority ?? 0) === index ? 'secondary' : 'ghost'}
                  aria-pressed={(current.priority ?? 0) === index}
                  onClick={() => patch(current.key, { priority: index })}
                >
                  {label}
                </Button>
              ))}
            </Inline>
            <Text variant="caption">标签</Text>
            <Inline>
              {labels.map((label) => (
                <Button
                  key={label.id}
                  type="button"
                  size="xs"
                  variant={current.labels?.includes(label.id) ? 'secondary' : 'ghost'}
                  aria-pressed={current.labels?.includes(label.id)}
                  onClick={() => {
                    const next = current.labels?.includes(label.id)
                      ? current.labels.filter((id) => id !== label.id)
                      : [...(current.labels ?? []), label.id];
                    patch(current.key, { labels: next });
                  }}
                >
                  {label.label}
                </Button>
              ))}
            </Inline>
            <Text variant="caption">负责人</Text>
            <Inline>
              {people.map((person) => (
                <Button
                  key={person.id}
                  type="button"
                  size="xs"
                  variant={current.assignee === person.id ? 'secondary' : 'ghost'}
                  aria-pressed={current.assignee === person.id}
                  onClick={() => patch(current.key, { assignee: person.id })}
                >
                  {person.name}
                </Button>
              ))}
            </Inline>
            <Button
              type="button"
              size="xs"
              variant="destructive"
              onClick={() => {
                commit(items.filter((item) => item.key !== current.key));
                setOpen(null);
              }}
            >
              删除
            </Button>
          </Stack>
        </aside>
      ) : null}
    </section>
  );
}
