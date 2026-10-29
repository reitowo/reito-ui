import { useMemo, useState } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';

export type RadarAgent = {
  id: string;
  name: string;
  model?: string;
  avatar?: React.ReactNode;
  status?: 'running' | 'done';
};
export type RadarEdit = {
  agentId: string;
  lines: [number, number];
  summary?: string;
  active?: boolean;
};
export type RadarFile = {
  path: string;
  edits: RadarEdit[];
};
export type ConflictRadarProps = {
  agents: RadarAgent[];
  files: RadarFile[];
  title?: string;
  resolved?: Record<string, string>;
  defaultResolved?: Record<string, string>;
  onResolve?: (path: string, agentId: string) => void;
  onMerge?: () => void;
  className?: string;
};

function overlaps(a: [number, number], b: [number, number]) {
  return a[0] <= b[1] && b[0] <= a[1];
}

function isConflict(file: RadarFile) {
  const ranges = file.edits.map((edit) => edit.lines);
  return ranges.some((left, index) =>
    ranges.slice(index + 1).some((right) => overlaps(left, right)),
  );
}

/** Recreated from public Conflict Radar docs. Not Pro source. */
export function ConflictRadar({
  agents,
  files,
  title = '并行工作',
  resolved,
  defaultResolved = {},
  onResolve,
  onMerge,
  className,
}: ConflictRadarProps) {
  const [internal, setInternal] = useState(defaultResolved);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const picks = resolved ?? internal;
  const conflicts = files.filter(isConflict);
  const open =
    files.find((file) => file.path === openPath) ?? conflicts.find((file) => !picks[file.path]);
  const settled = conflicts.every((file) => picks[file.path]);
  const agentsDone = agents.every((agent) => agent.status !== 'running');
  const canMerge = settled && agentsDone && conflicts.length > 0;

  function pick(path: string, agentId: string) {
    if (resolved === undefined) setInternal((current) => ({ ...current, [path]: agentId }));
    onResolve?.(path, agentId);
  }

  const comparison = useMemo(() => {
    if (!open) return '没有未处理的冲突。';
    const chosen = picks[open.path];
    const agent = agents.find((item) => item.id === chosen);
    return chosen
      ? `${open.path} 已保留 ${agent?.name ?? chosen} 的改法。`
      : `${open.path} 仍待选择。`;
  }, [agents, open, picks]);

  return (
    <section
      className={cn(
        '@container grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">{title}</Heading>
        <Inline>
          <Text variant="caption" tone="muted" aria-live="polite">
            {conflicts.length} 处冲突 · {Object.keys(picks).length} 已选定
          </Text>
          <Button type="button" size="xs" disabled={!canMerge} onClick={() => onMerge?.()}>
            合并
          </Button>
        </Inline>
      </Inline>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[length:var(--rui-font-caption)]">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr>
              <th scope="col" className="border-b border-border py-1 pr-2 font-medium">
                文件
              </th>
              {agents.map((agent) => (
                <th
                  key={agent.id}
                  scope="col"
                  className="border-b border-border px-2 py-1 font-medium"
                >
                  <Stack gap="small">
                    <span>{agent.avatar}</span>
                    <span className="@min-[440px]:inline hidden">{agent.name}</span>
                    <span className="text-muted-foreground">
                      {agent.status === 'running' ? '进行中' : '完成'}
                    </span>
                  </Stack>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {files.map((file) => {
              const conflict = isConflict(file);
              const chosen = picks[file.path];
              return (
                <tr key={file.path}>
                  <th scope="row" className="border-b border-border py-1 pr-2 font-normal">
                    <button
                      type="button"
                      className="text-left underline-offset-2 hover:underline focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring"
                      aria-expanded={open?.path === file.path}
                      disabled={!conflict}
                      onClick={() => setOpenPath(openPath === file.path ? null : file.path)}
                    >
                      {file.path}
                    </button>
                    {conflict ? (
                      <Badge variant={chosen ? 'secondary' : 'destructive'} className="ml-1">
                        {chosen ? '已选定' : '冲突'}
                      </Badge>
                    ) : null}
                  </th>
                  {agents.map((agent) => {
                    const edit = file.edits.find((item) => item.agentId === agent.id);
                    const kept = chosen === agent.id;
                    return (
                      <td key={agent.id} className="border-b border-border px-2 py-1">
                        {edit ? (
                          <span
                            className={cn(
                              'block h-2 rounded-full bg-muted',
                              edit.active && 'bg-primary',
                              kept && 'bg-success',
                            )}
                          >
                            <span className="sr-only">
                              {agent.name} 改了 {edit.lines[0]}–{edit.lines[1]} 行
                              {kept ? '，已保留' : ''}
                              {edit.active ? '，仍在写入' : ''}
                            </span>
                          </span>
                        ) : (
                          <span className="sr-only">{agent.name} 未改此文件</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {open && isConflict(open) ? (
        <fieldset className="grid gap-[var(--rui-content-gap-sm)] rounded-[var(--rui-radius)] bg-muted p-[var(--rui-content-padding)]">
          <legend className="px-1 text-[length:var(--rui-font-interface)]">{open.path}</legend>
          {open.edits.map((edit) => {
            const agent = agents.find((item) => item.id === edit.agentId);
            return (
              <label key={edit.agentId} className="grid gap-1">
                <Inline>
                  <input
                    type="radio"
                    name={`affect-radar-${open.path}`}
                    checked={picks[open.path] === edit.agentId}
                    onChange={() => pick(open.path, edit.agentId)}
                  />
                  <Text as="span" variant="interface">
                    {agent?.name ?? edit.agentId}
                  </Text>
                  <Text as="span" variant="caption" tone="muted">
                    L{edit.lines[0]}–{edit.lines[1]}
                  </Text>
                </Inline>
                <Text variant="caption" tone="muted">
                  {edit.summary ?? '保留这一版改动'}
                </Text>
              </label>
            );
          })}
        </fieldset>
      ) : null}
      <Text variant="caption" tone="muted" aria-live="polite">
        {comparison}
      </Text>
    </section>
  );
}
