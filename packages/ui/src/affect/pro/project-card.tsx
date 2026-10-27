import { useState } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { initials } from '../shared.js';

export type ProjectTask = { id: string; label: string; done?: boolean; assignee?: string };
export type ProjectOption = { id: string; label: string; tone?: string; icon?: React.ReactNode };
export type ProjectMember = { name: string; avatar?: React.ReactNode };
export type ProjectCardProps = {
  title: string;
  tasks: ProjectTask[];
  onTasksChange?: (tasks: ProjectTask[]) => void;
  status?: string;
  statuses?: ProjectOption[];
  onStatusChange?: (id: string) => void;
  due?: string;
  members?: ProjectMember[];
  action?: { label: string; onClick: () => void };
  hint?: React.ReactNode;
  trigger?: 'hover' | 'click';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

const defaultStatuses: ProjectOption[] = [
  { id: 'todo', label: '待办' },
  { id: 'progress', label: '进行中' },
  { id: 'review', label: '审查中' },
  { id: 'done', label: '完成' },
];

/** Recreated from public Project Card docs. Not Pro source. */
export function ProjectCard({
  title,
  tasks,
  onTasksChange,
  status,
  statuses = defaultStatuses,
  onStatusChange,
  due,
  members = [],
  action,
  hint,
  trigger = 'hover',
  open,
  defaultOpen = false,
  onOpenChange,
  className,
}: ProjectCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalTasks, setInternalTasks] = useState(tasks);
  const [internalStatus, setInternalStatus] = useState(status ?? statuses[0]?.id ?? 'todo');
  const [statusOpen, setStatusOpen] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const expanded = open ?? internalOpen;
  const items = onTasksChange ? tasks : internalTasks;
  const current = status ?? internalStatus;
  const currentLabel = statuses.find((item) => item.id === current)?.label ?? current;
  const left = items.filter((task) => !task.done).length;
  const done = items.length - left;
  const visible = filter ? items.filter((task) => task.assignee === filter) : items;
  const tray = hint ?? (left ? `${left} 项未完成` : '全部完成');

  function setExpanded(next: boolean) {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }

  function toggle(id: string) {
    const next = items.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
    if (!onTasksChange) setInternalTasks(next);
    onTasksChange?.(next);
  }

  function setStatus(id: string) {
    if (status === undefined) setInternalStatus(id);
    onStatusChange?.(id);
    setStatusOpen(false);
  }

  return (
    <article
      className={cn(
        'grid max-w-xs gap-[var(--rui-compact-surface-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-compact-surface-padding-y)] px-[var(--rui-compact-surface-padding-x)]',
        className,
      )}
      onMouseEnter={() => trigger === 'hover' && setExpanded(true)}
      onMouseLeave={() => trigger === 'hover' && setExpanded(false)}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={`${title}，${done}/${items.length} 完成，${currentLabel}${due ? `，截止 ${due}` : ''}`}
        className="grid w-full gap-1 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <Inline className="justify-between">
          <Heading size="item">{title}</Heading>
          <Inline>
            {members.map((member) => (
              <span
                key={member.name}
                className="grid size-6 place-items-center rounded-full bg-muted text-[length:var(--rui-font-micro)]"
                title={member.name}
              >
                {member.avatar ?? initials(member.name)}
              </span>
            ))}
          </Inline>
        </Inline>
        <Inline>
          <Text variant="caption" tone="muted">
            {done}/{items.length}
          </Text>
          <Badge variant="secondary">{currentLabel}</Badge>
          {due ? (
            <Text variant="caption" tone="muted">
              {expanded ? `截止 ${due}` : due}
            </Text>
          ) : null}
        </Inline>
      </button>
      {expanded ? (
        <Stack
          gap="small"
          inert={!expanded ? true : undefined}
          className="border-t border-border pt-[var(--rui-compact-surface-padding-y)]"
        >
          <Inline>
            <div className="relative">
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => setStatusOpen(!statusOpen)}
              >
                {currentLabel}
              </Button>
              {statusOpen ? (
                <div
                  role="radiogroup"
                  aria-label="状态"
                  className="absolute mt-1 grid rounded-[var(--rui-radius)] border border-border bg-card p-1"
                >
                  {statuses.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      size="xs"
                      variant={item.id === current ? 'secondary' : 'ghost'}
                      role="radio"
                      aria-checked={item.id === current}
                      onClick={() => setStatus(item.id)}
                    >
                      {item.icon}
                      {item.label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
            {members.map((member) => (
              <Button
                key={member.name}
                type="button"
                size="xs"
                variant={filter === member.name ? 'secondary' : 'ghost'}
                aria-pressed={filter === member.name}
                onClick={() => setFilter(filter === member.name ? null : member.name)}
              >
                {member.name}
              </Button>
            ))}
          </Inline>
          <ul className="grid gap-1">
            {visible.map((task) => (
              <li key={task.id}>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(task.done)}
                    onChange={() => toggle(task.id)}
                  />
                  <Text
                    as="span"
                    variant="caption"
                    className={task.done ? 'line-through text-muted-foreground' : undefined}
                  >
                    {task.label}
                  </Text>
                  {task.assignee ? (
                    <Text as="span" variant="caption" tone="muted">
                      {task.assignee}
                    </Text>
                  ) : null}
                </label>
              </li>
            ))}
          </ul>
          <Inline className="justify-between">
            <Text variant="caption" tone="muted" aria-live="polite">
              {tray}
            </Text>
            {action ? (
              <Button type="button" size="xs" onClick={action.onClick}>
                {action.label}
              </Button>
            ) : null}
          </Inline>
        </Stack>
      ) : null}
    </article>
  );
}
