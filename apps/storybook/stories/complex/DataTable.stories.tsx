import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import type { ColumnDef, PaginationState, RowSelectionState, SortingState } from '@tanstack/react-table';
import { useArgs } from 'storybook/preview-api';
import { expect, userEvent, within } from 'storybook/test';
import { DataTable, matchesDataTableColumnFilter, serializeDataTableColumnFilters, type DataTableColumnFilterDefinition, type DataTableColumnFiltersState } from '../../../../packages/ui/src/complex/index.js';
import { DataTableDemo, demoColumns, demoRecords, type DemoRecord } from '../../../../packages/ui/src/complex/catalog.js';

const meta = { title: '复杂/DataTable 数据表格', component: DataTableDemo, parameters: { docs: { description: { component: 'TanStack Table v8：本地与 manual 远程模式共享受控查询状态；表头筛选菜单覆盖文本、枚举、数值与日期，列间按 AND 组合并可序列化给服务端。' } } } } satisfies Meta<typeof DataTableDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  name: '交互场景：排序、跨页选中与筛选',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '负责人' }));
    expect(within(canvas.getAllByRole('row')[1]).getByText('Lin')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('checkbox', { name: '选择记录 TASK-02' }));
    expect(canvas.getByText('共 8 条 · 已选 1 条')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '下一页' }));
    expect(canvas.getByText('第 2 / 2 页')).toBeInTheDocument();
    await userEvent.type(canvas.getByRole('textbox', { name: '筛选本地任务' }), 'tokens');
    expect(canvas.getByText('整理设计 tokens')).toBeInTheDocument();
    expect(canvas.getByText('共 1 条 · 已选 1 条')).toBeInTheDocument();
    expect(canvas.getByText('第 1 / 1 页')).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: '下一页' })).toBeDisabled();
    await userEvent.clear(canvas.getByRole('textbox', { name: '筛选本地任务' }));
    expect(canvas.getByRole('checkbox', { name: '选择记录 TASK-02' })).toBeChecked();
  },
};
export const Empty: Story = { name: '空数据', render: () => <DataTable data={[]} columns={demoColumns} getRowId={row => row.id} caption="本地任务" /> };
export const Loading: Story = { name: '加载中', render: () => <DataTable data={[]} columns={demoColumns} getRowId={row => row.id} caption="本地任务" loading /> };
export const Error: Story = { name: '错误与已缓存记录', render: () => <DataTable data={demoRecords} columns={demoColumns} getRowId={row => row.id} caption="本地任务" error="本地数据校验失败，以下保留上次有效记录。" /> };

export const Default: Story = { name: '默认可选表格', render: () => <DataTable data={demoRecords} columns={demoColumns} getRowId={row => row.id} caption="本地任务" /> };
export const WithoutSelection: Story = { name: '隐藏行选择', render: () => <DataTable data={demoRecords} columns={demoColumns} getRowId={row => row.id} caption="本地任务" selectable={false} /> };

type FilterRecord = DemoRecord & { score: number };
const remoteRecords: FilterRecord[] = Array.from({ length: 23 }, (_, index) => ({ id: `REMOTE-${String(index + 1).padStart(2, '0')}`, name: `远程任务 ${index + 1}`, owner: ['Reito', 'Lin', 'Ming'][index % 3], status: index % 2 ? '进行中' : '待开始', updated: `2026-09-${String(index + 1).padStart(2, '0')}`, score: (index * 17 + 12) % 101 }));
const filterColumns: ColumnDef<FilterRecord>[] = [
  { accessorKey: 'name', header: '任务', cell: info => <span className="font-medium">{String(info.getValue())}</span> },
  { accessorKey: 'owner', header: '负责人' },
  { accessorKey: 'status', header: '状态' },
  { accessorKey: 'score', header: '评分' },
  { accessorKey: 'updated', header: '更新日期' },
];
const filterDefinitions: DataTableColumnFilterDefinition[] = [
  { id: 'name', label: '任务', kind: 'text', placeholder: '任务名称' },
  { id: 'owner', label: '负责人', kind: 'select', options: ['Reito', 'Lin', 'Ming'].map(value => ({ value, label: value })) },
  { id: 'score', label: '评分', kind: 'number' },
  { id: 'updated', label: '更新日期', kind: 'date' },
];
export const RemoteControlled: Story = { name: '受控远程分页', render: function Render() {
  const [sorting, setSorting] = useState<SortingState>([]); const [globalFilter, setGlobalFilter] = useState(''); const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 }); const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const filtered = useMemo(() => remoteRecords.filter(row => `${row.name} ${row.owner} ${row.status}`.toLowerCase().includes(globalFilter.toLowerCase())), [globalFilter]);
  const sorted = useMemo(() => { const sort = sorting[0]; if (!sort) return filtered; return [...filtered].sort((a, b) => String(a[sort.id as keyof DemoRecord]).localeCompare(String(b[sort.id as keyof DemoRecord])) * (sort.desc ? -1 : 1)); }, [filtered, sorting]);
  const page = sorted.slice(pagination.pageIndex * pagination.pageSize, (pagination.pageIndex + 1) * pagination.pageSize);
  return <div className="grid gap-[var(--rui-content-gap-sm)]"><DataTable manual data={page} rowCount={filtered.length} columns={demoColumns} getRowId={row => row.id} caption="远程任务" sorting={sorting} onSortingChange={setSorting} globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} pagination={pagination} onPaginationChange={setPagination} rowSelection={rowSelection} onRowSelectionChange={setRowSelection} /><output className="text-xs text-muted-foreground">query={globalFilter || '∅'} · page={pagination.pageIndex + 1} · selected={Object.values(rowSelection).filter(Boolean).length}</output></div>;
} };

export const ColumnFilters: Story = { name: '文本、枚举、数值与日期列筛选', render: () => <DataTable data={remoteRecords} columns={filterColumns} filterDefinitions={filterDefinitions} getRowId={row => row.id} caption="可筛选任务" pageSize={10} /> };

export const RemoteColumnFilters: Story = { name: '远程列筛选与查询序列化', render: function Render() {
  const [filters, setFilters] = useState<DataTableColumnFiltersState>([{ id: 'owner', value: { kind: 'select', operator: 'in', values: ['Reito'] } }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const filtered = useMemo(() => remoteRecords.filter(row => filters.every(filter => matchesDataTableColumnFilter(row[filter.id as keyof FilterRecord], filter.value))), [filters]);
  const page = filtered.slice(pagination.pageIndex * pagination.pageSize, (pagination.pageIndex + 1) * pagination.pageSize);
  return <div className="grid gap-[var(--rui-content-gap-sm)]"><DataTable manual data={page} rowCount={filtered.length} columns={filterColumns} filterDefinitions={filterDefinitions} getRowId={row => row.id} caption="远程筛选任务" columnFilters={filters} onColumnFiltersChange={setFilters} pagination={pagination} onPaginationChange={setPagination} /><output aria-label="远程筛选查询" className="break-all font-mono text-xs text-muted-foreground">{serializeDataTableColumnFilters(filters)}</output></div>;
} };

type PlaygroundArgs = { manual: boolean; rowCount: number; pageIndex: number; query: string; columnFiltersEnabled: boolean; ownerFilter: string; loading: boolean; selectable: boolean; pageSize: number; caption: string; searchPlaceholder: string; error: string; empty: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { manual: false, rowCount: 23, pageIndex: 0, query: '', columnFiltersEnabled: true, ownerFilter: '', loading: false, selectable: true, pageSize: 5, caption: '本地任务', searchPlaceholder: '筛选所有列…', error: '', empty: false },
 argTypes: { manual: booleanControl, rowCount: { control: { type: 'number', min: 0 } }, pageIndex: { control: { type: 'number', min: 0 } }, query: textControl, columnFiltersEnabled: booleanControl, ownerFilter: choiceControl(['', 'Reito', 'Lin', 'Ming']), loading: booleanControl, selectable: booleanControl, pageSize: choiceControl([3, 5, 10, 20]), caption: textControl, searchPlaceholder: textControl, error: textControl, empty: recipeControl(booleanControl, '传入空 data；列定义仍由调用方提供。') },
 parameters: { controls: { include: ['manual', 'rowCount', 'pageIndex', 'query', 'columnFiltersEnabled', 'ownerFilter', 'loading', 'selectable', 'pageSize', 'caption', 'searchPlaceholder', 'error', 'empty'] } },
 render: function Render(args) { const [, update] = useArgs(); const records = args.manual ? remoteRecords.slice(args.pageIndex * args.pageSize, (args.pageIndex + 1) * args.pageSize) : demoRecords; const filters: DataTableColumnFiltersState = args.ownerFilter ? [{ id: 'owner', value: { kind: 'select', operator: 'in', values: [args.ownerFilter] } }] : []; return <DataTable data={args.empty ? [] : records} columns={demoColumns} getRowId={row => row.id} manual={args.manual} rowCount={args.manual ? args.rowCount : undefined} globalFilter={args.query} onGlobalFilterChange={query => update({ query })} filterDefinitions={args.columnFiltersEnabled ? [filterDefinitions[1]] : []} columnFilters={filters} onColumnFiltersChange={next => update({ ownerFilter: next[0]?.value.kind === 'select' ? next[0].value.values[0] ?? '' : '' })} pagination={{ pageIndex: args.pageIndex, pageSize: args.pageSize }} onPaginationChange={pagination => update({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize })} loading={args.loading} selectable={args.selectable} caption={args.caption} searchPlaceholder={args.searchPlaceholder} error={args.error} />; },
};
