import { useMemo, useState } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Progress } from '../../primitives/progress.js';
import { cn } from '../../lib/utils.js';

export type SetupTask = { id: string; label: string; done?: boolean };
export type SetupGroup = { id: string; title: string; tasks: SetupTask[] };
export type SetupGuideProps = {
  groups: SetupGroup[];
  title?: string;
  onEdit?: () => void;
  onClose?: () => void;
  onChange?: (done: string[]) => void;
  className?: string;
};

function flatten(groups: SetupGroup[]) {
  return groups.flatMap((group) => group.tasks);
}

/** Recreated from public Setup Guide docs. Not Pro source. */
export function SetupGuide({
  groups,
  title = '设置指南',
  onEdit,
  onClose,
  onChange,
  className,
}: SetupGuideProps) {
  const [items, setItems] = useState(groups);
  const [openId, setOpenId] = useState<string | null>(groups[0]?.id ?? null);
  const tasks = flatten(items);
  const doneIds = tasks.filter((task) => task.done).map((task) => task.id);
  const value = tasks.length ? Math.round((doneIds.length / tasks.length) * 100) : 0;

  const unlocked = useMemo(() => {
    const ids = new Set<string>();
    let locked = false;
    for (const task of flatten(items)) {
      if (!locked) ids.add(task.id);
      if (!task.done) locked = true;
    }
    return ids;
  }, [items]);

  function toggle(taskId: string) {
    if (!unlocked.has(taskId)) return;
    const next = items.map((group) => ({
      ...group,
      tasks: group.tasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)),
    }));
    setItems(next);
    const finished = flatten(next)
      .filter((task) => task.done)
      .map((task) => task.id);
    onChange?.(finished);
    const nextOpen = next.find((group) => group.tasks.some((task) => !task.done));
    if (nextOpen) setOpenId(nextOpen.id);
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
        <Inline>
          {onEdit ? (
            <Button type="button" size="xs" variant="ghost" onClick={onEdit}>
              编辑
            </Button>
          ) : null}
          {onClose ? (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              aria-label="关闭设置指南"
              onClick={onClose}
            >
              关闭
            </Button>
          ) : null}
        </Inline>
      </Inline>
      <Stack gap="small">
        <Text variant="caption" tone="muted">
          {doneIds.length}/{tasks.length} · {value}%
        </Text>
        <Progress value={value} aria-label={`${title}进度 ${value}%`} />
      </Stack>
      <div className="grid gap-[var(--rui-content-gap-sm)]">
        {items.map((group) => {
          const finished = group.tasks.every((task) => task.done);
          const expanded = openId === group.id;
          return (
            <section key={group.id} className="grid gap-1">
              <button
                type="button"
                aria-expanded={expanded}
                className="flex w-full items-center justify-between text-left"
                onClick={() => setOpenId(expanded ? null : group.id)}
              >
                <Text
                  as="span"
                  variant="interface"
                  className={finished ? 'text-muted-foreground line-through' : undefined}
                >
                  {group.title}
                </Text>
                <Text as="span" variant="caption" tone="muted">
                  {group.tasks.filter((task) => task.done).length}/{group.tasks.length}
                </Text>
              </button>
              {expanded ? (
                <ul className="grid gap-1">
                  {group.tasks.map((task) => {
                    const ready = unlocked.has(task.id);
                    return (
                      <li key={task.id}>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-pressed={Boolean(task.done)}
                          disabled={!ready}
                          className="w-full justify-start"
                          onClick={() => toggle(task.id)}
                        >
                          <Text
                            as="span"
                            className={task.done ? 'line-through text-muted-foreground' : undefined}
                          >
                            {task.label}
                          </Text>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </section>
  );
}
