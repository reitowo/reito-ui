import { useState } from 'react';
import { Kanban, type KanbanColumn } from './kanban.js';
const cards = [
  { id: 'layout', title: '检查布局', description: '本地任务示例' },
  { id: 'tokens', title: '统一 tokens' },
  { id: 'focus', title: '检查焦点' },
  { id: 'locked', title: '归档记录', disabled: true },
];
const initial: KanbanColumn[] = [
  { id: 'todo', title: '待办', cardIds: ['layout', 'tokens'] },
  { id: 'doing', title: '进行中', cardIds: ['focus'] },
  { id: 'done', title: '完成', cardIds: ['locked'] },
];
export function KanbanDemo({
  readOnly = false,
  loading = false,
  empty = false,
  failSave = false,
}: {
  readOnly?: boolean;
  loading?: boolean;
  empty?: boolean;
  failSave?: boolean;
}) {
  const [columns, setColumns] = useState(initial);
  return (
    <Kanban
      label="本地任务看板"
      cards={empty ? [] : cards}
      columns={empty ? columns.map((column) => ({ ...column, cardIds: [] })) : columns}
      readOnly={readOnly}
      loading={loading}
      onMove={async (next) => {
        if (failSave) throw new Error('本地保存失败');
        setColumns(next);
      }}
    />
  );
}
