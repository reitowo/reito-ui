import { useState } from 'react';
import { Heading } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { AppShell, type AppShellProps } from './app-shell.js';
import { DataTable } from './data-table.js';

export type CrmScreenProps = Pick<AppShellProps, 'onNavigate' | 'workspace' | 'user' | 'className'>;

const views = ['全部', '洽谈', '已签约'] as const;
const rows = {
  全部: [
    { id: 'north', name: '北区医疗', stage: '洽谈', owner: '阿宁', value: 48 },
    { id: 'west', name: '西岸物流', stage: '已签约', owner: '林可', value: 72 },
    { id: 'lab', name: '实验室联盟', stage: '线索', owner: '阿宁', value: 16 },
  ],
  洽谈: [{ id: 'north', name: '北区医疗', stage: '洽谈', owner: '阿宁', value: 48 }],
  已签约: [{ id: 'west', name: '西岸物流', stage: '已签约', owner: '林可', value: 72 }],
};

/** Recreated from public CRM docs. Not Pro source. */
export function CrmScreen({
  onNavigate,
  workspace = 'Acme',
  user = { name: 'Alex Morgan' },
  className,
}: CrmScreenProps) {
  const [view, setView] = useState<(typeof views)[number]>('全部');
  return (
    <AppShell
      active="CRM"
      workspace={workspace}
      user={user}
      onNavigate={onNavigate}
      header={{ title: '客户' }}
      className={className}
    >
      <div className="grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
        <Heading size="item">公司</Heading>
        <div role="tablist" aria-label="视图" className="flex gap-1">
          {views.map((item) => (
            <Button
              key={item}
              type="button"
              size="xs"
              role="tab"
              aria-selected={view === item}
              variant={view === item ? 'secondary' : 'ghost'}
              onClick={() => setView(item)}
            >
              {item}
            </Button>
          ))}
        </div>
        <DataTable
          title={view}
          columns={[
            { key: 'name', label: '公司', type: 'title', editable: true },
            { key: 'stage', label: '阶段', type: 'tag', options: ['线索', '洽谈', '已签约'] },
            { key: 'owner', label: '负责人', type: 'text' },
            { key: 'value', label: '金额', type: 'number' },
          ]}
          rows={rows[view]}
        />
      </div>
    </AppShell>
  );
}
