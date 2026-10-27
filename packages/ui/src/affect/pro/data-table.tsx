import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { Checkbox } from '../../primitives/checkbox.js';
import { cn } from '../../lib/utils.js';

export type DataColumnType = 'title' | 'tag' | 'link' | 'number' | 'text';
export type DataColumn = {
  key: string;
  label: string;
  icon?: ReactNode;
  width?: string;
  type?: DataColumnType;
  editable?: boolean;
  options?: string[];
};
export type DataRow = { id: string; logo?: ReactNode } & Record<
  string,
  string | number | undefined
>;
export type AffectDataTableProps = {
  title?: string;
  icon?: ReactNode;
  columns: DataColumn[];
  rows: DataRow[];
  tagTones?: Record<string, string>;
  editable?: boolean;
  onRowsChange?: (rows: DataRow[]) => void;
  onSelectionChange?: (ids: string[]) => void;
  className?: string;
};

/** Recreated from public Data Table docs. Not Pro source. Sibling of complex DataTable. */
export function DataTable({
  title = '表格',
  icon,
  columns,
  rows,
  tagTones,
  editable = true,
  onRowsChange,
  onSelectionChange,
  className,
}: AffectDataTableProps) {
  const [internal, setInternal] = useState(rows);
  const [checked, setChecked] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [active, setActive] = useState<[number, number]>([0, 0]);
  const [draft, setDraft] = useState<string | null>(null);
  const [history, setHistory] = useState<DataRow[][]>([rows]);
  const items = onRowsChange ? rows : internal;

  function commit(next: DataRow[]) {
    setHistory((current) => [...current, items]);
    if (!onRowsChange) setInternal(next);
    onRowsChange?.(next);
  }

  const sorted = useMemo(() => {
    if (!sortKey) return items;
    return [...items].sort((left, right) => {
      const a = String(left[sortKey] ?? '');
      const b = String(right[sortKey] ?? '');
      return sortDir === 'asc' ? a.localeCompare(b, 'zh') : b.localeCompare(a, 'zh');
    });
  }, [items, sortKey, sortDir]);

  function setCell(rowId: string, key: string, value: string) {
    commit(
      items.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [key]:
                columns.find((column) => column.key === key)?.type === 'number'
                  ? Number(value) || 0
                  : value,
            }
          : row,
      ),
    );
  }

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((value) => (value === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function onKey(event: KeyboardEvent) {
    const [row, col] = active;
    if (event.key === 'ArrowDown') setActive([Math.min(sorted.length - 1, row + 1), col]);
    if (event.key === 'ArrowUp') setActive([Math.max(0, row - 1), col]);
    if (event.key === 'ArrowRight' && draft == null)
      setActive([row, Math.min(columns.length - 1, col + 1)]);
    if (event.key === 'ArrowLeft' && draft == null) setActive([row, Math.max(0, col - 1)]);
    if ((event.key === 'Enter' || event.key === 'F2') && editable) {
      const column = columns[col];
      const current = sorted[row];
      if (column && current && column.editable !== false)
        setDraft(String(current[column.key] ?? ''));
    }
    if (event.key === 'Escape') setDraft(null);
    if ((event.key === 'Delete' || event.key === 'Backspace') && editable && draft == null) {
      const column = columns[col];
      const current = sorted[row];
      if (column && current) setCell(current.id, column.key, '');
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      const previous = history.at(-1);
      if (previous) {
        setHistory((current) => current.slice(0, -1));
        if (!onRowsChange) setInternal(previous);
        onRowsChange?.(previous);
      }
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'c') {
      const column = columns[col];
      const current = sorted[row];
      if (column && current) void navigator.clipboard?.writeText(String(current[column.key] ?? ''));
    }
  }

  const allChecked = checked.length === items.length && items.length > 0;
  const mixed = checked.length > 0 && !allChecked;

  return (
    <section
      className={cn(
        'grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Inline>
          {icon}
          <Heading size="item">{title}</Heading>
        </Inline>
        {editable ? (
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() =>
              commit([
                ...items,
                {
                  id: `row-${items.length + 1}`,
                  ...Object.fromEntries(columns.map((column) => [column.key, ''])),
                },
              ])
            }
          >
            添加行
          </Button>
        ) : null}
      </Inline>
      <div className="overflow-x-auto" onKeyDown={onKey}>
        <table
          className="w-full text-left text-[length:var(--rui-font-caption)]"
          role="grid"
          aria-label={title}
        >
          <thead>
            <tr>
              <th className="border-b border-border py-1 pr-2">
                <Checkbox
                  aria-label="全选"
                  checked={mixed ? 'mixed' : allChecked}
                  onCheckedChange={(value) => {
                    const next = value === true ? items.map((row) => row.id) : [];
                    setChecked(next);
                    onSelectionChange?.(next);
                  }}
                />
              </th>
              {columns.map((column) => (
                <th key={column.key} className="border-b border-border py-1 font-medium">
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    aria-sort={
                      sortKey === column.key
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    onClick={() => toggleSort(column.key)}
                  >
                    {column.icon}
                    {column.label}
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, rowIndex) => (
              <tr key={row.id}>
                <td className="border-b border-border py-1 pr-2">
                  <Checkbox
                    aria-label={`选择 ${row.id}`}
                    checked={checked.includes(row.id)}
                    onCheckedChange={(value) => {
                      const next =
                        value === true
                          ? [...checked, row.id]
                          : checked.filter((id) => id !== row.id);
                      setChecked(next);
                      onSelectionChange?.(next);
                    }}
                  />
                </td>
                {columns.map((column, colIndex) => {
                  const editing = draft != null && active[0] === rowIndex && active[1] === colIndex;
                  const value = row[column.key];
                  return (
                    <td
                      key={column.key}
                      role="gridcell"
                      aria-selected={active[0] === rowIndex && active[1] === colIndex}
                      className={cn(
                        'border-b border-border py-1',
                        active[0] === rowIndex && active[1] === colIndex && 'bg-muted',
                      )}
                      onClick={() => setActive([rowIndex, colIndex])}
                      onDoubleClick={() =>
                        editable && column.editable !== false && setDraft(String(value ?? ''))
                      }
                    >
                      {editing ? (
                        <Input
                          autoFocus
                          className="h-[var(--rui-control-height)]"
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          onBlur={() => {
                            setCell(row.id, column.key, draft ?? '');
                            setDraft(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              setCell(row.id, column.key, draft ?? '');
                              setDraft(null);
                              setActive([Math.min(sorted.length - 1, rowIndex + 1), colIndex]);
                            }
                          }}
                        />
                      ) : column.type === 'tag' ? (
                        <Badge variant="secondary">{String(value ?? '')}</Badge>
                      ) : column.type === 'link' ? (
                        <a href={String(value ?? '')} className="underline">
                          {String(value ?? '')}
                        </a>
                      ) : (
                        <Text as="span">{String(value ?? '')}</Text>
                      )}
                      {tagTones?.[String(value ?? '')] ? (
                        <span className="sr-only">{tagTones[String(value)]}</span>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
