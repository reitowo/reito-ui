import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useRef, useState } from 'react';
import type { ColumnDef, PaginationState, RowSelectionState, SortingState } from '@tanstack/react-table';
import { useArgs } from 'storybook/preview-api';
import { expect, userEvent, within } from 'storybook/test';
import { DataTable, matchesDataTableColumnFilter, serializeDataTableColumnFilters, type DataTableColumnFilterDefinition, type DataTableColumnFiltersState, type DataTableEditableColumn, type DataTableEditCommit, type DataTableEditingState, type DataTableEditMode } from '../../../../packages/ui/src/complex/index.js';
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
const ownerGrouping = ['owner'];
const ownerGroupingDefinitions = [{ id: 'owner', label: '负责人' }];
const managedColumns: ColumnDef<FilterRecord>[] = [
  { header: '任务信息', columns: [{ accessorKey: 'name', header: '任务', size: 180, minSize: 120 }, { accessorKey: 'owner', header: '负责人', size: 120 }, { accessorKey: 'status', header: '状态', size: 110 }] },
  { header: '任务指标', columns: [{ accessorKey: 'score', header: '评分', size: 90, minSize: 70 }, { accessorKey: 'updated', header: '更新日期', size: 140 }] },
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

export const ColumnManagement: Story = { name: '列显隐、排序、宽度与固定', render: () => <div className="max-w-2xl"><DataTable data={remoteRecords} columns={managedColumns} getRowId={row => row.id} caption="可管理任务" manageColumns defaultColumnVisibility={{ status: false }} defaultColumnPinning={{ left: ['name'], right: ['updated'] }} columnLabels={{ name: '任务', owner: '负责人', status: '状态', score: '评分', updated: '更新日期' }} pageSize={10} /></div> };

type TaskNode = DemoRecord & { detail?: string; children?: TaskNode[] };
const nestedRecords: TaskNode[] = [
  { id: 'EPIC-01', name: '桌面工作区', owner: 'Reito', status: '进行中', updated: '2026-09-07', children: [
    { id: 'TASK-101', name: '压缩表格密度', owner: 'Lin', status: '已完成', updated: '2026-09-06', detail: '统一使用 cell padding tokens，并完成四种主题密度检查。' },
    { id: 'TASK-102', name: '补齐分组交互', owner: 'Reito', status: '进行中', updated: '2026-09-07', detail: '展开状态由宿主管理，折叠后保留子行选择。' },
  ] },
  { id: 'EPIC-02', name: 'AI 工作面', owner: 'Ming', status: '待开始', updated: '2026-09-08', children: [
    { id: 'TASK-201', name: '消息布局复核', owner: 'Ming', status: '待开始', updated: '2026-09-08', detail: '检查长内容、工具调用和代码块的窄工作面表现。' },
  ] },
];

export const RowExpansion: Story = { name: '层级子行与详情展开', render: () => <DataTable data={nestedRecords} columns={demoColumns as ColumnDef<TaskNode>[]} getRowId={row => row.id} getSubRows={row => row.children} getRowCanExpand={row => Boolean(row.original.children?.length || row.original.detail)} defaultExpanded={{ 'EPIC-01': true }} renderExpandedRow={row => row.original.detail ? <div className="grid gap-1 text-sm"><span className="font-medium">任务说明</span><span className="text-muted-foreground">{row.original.detail}</span></div> : null} caption="层级任务" pageSize={10} /> };

const groupedColumns: ColumnDef<FilterRecord>[] = [
  { accessorKey: 'name', header: '任务', cell: info => <span className="font-medium">{String(info.getValue())}</span> },
  { accessorKey: 'owner', header: '负责人', enableGrouping: true },
  { accessorKey: 'status', header: '状态', enableGrouping: true },
  { accessorKey: 'score', header: '评分', aggregationFn: 'mean', aggregatedCell: info => `平均 ${Math.round(Number(info.getValue()))}` },
  { accessorKey: 'updated', header: '更新日期' },
];
export const RowGrouping: Story = { name: '数据行分组与聚合', render: () => <DataTable data={remoteRecords.slice(0, 12)} columns={groupedColumns} getRowId={row => row.id} caption="分组任务" groupingDefinitions={[{ id: 'owner', label: '负责人' }, { id: 'status', label: '状态' }]} defaultGrouping={['owner']} defaultExpanded renderGroupHeader={row => <span>{String(row.groupingValue)} <span className="font-normal text-muted-foreground">· {row.getLeafRows().length} 项</span></span>} renderGroupSummary={row => `分组汇总：${row.getLeafRows().length} 项任务`} pageSize={20} /> };

const editableColumns: DataTableEditableColumn<DemoRecord>[] = [
  { id: 'name', label: '任务', required: true, placeholder: '任务名称', validate: value => String(value).trim().length < 3 ? '任务名称至少需要 3 个字符' : undefined },
  { id: 'owner', label: '负责人', kind: 'select', required: true, options: ['Reito', 'Lin', 'Ming'].map(value => ({ value, label: value })) },
  { id: 'status', label: '状态', kind: 'select', required: true, options: ['待开始', '进行中', '已完成'].map(value => ({ value, label: value })) },
  { id: 'updated', label: '更新日期', kind: 'date', required: true },
];

function EditableDataTable({ mode, failFirst = false, controlled = false }: { mode: DataTableEditMode; failFirst?: boolean; controlled?: boolean }) {
  const [records, setRecords] = useState<DemoRecord[]>(demoRecords.slice(0, 6));
  const [result, setResult] = useState('尚未保存本地修改');
  const [editing, setEditing] = useState<DataTableEditingState | null>(null);
  const attempts = useRef(0);
  async function save(change: DataTableEditCommit<DemoRecord>) {
    await new Promise(resolve => setTimeout(resolve, 180));
    if (failFirst && attempts.current++ === 0) throw new globalThis.Error('本地保存模拟失败，草稿已保留。');
    setRecords(current => current.map(record => record.id === change.rowId ? { ...record, ...change.changedValues } as DemoRecord : record));
    setResult(`已保存 ${change.rowId}：${Object.keys(change.changedValues).join('、') || '没有字段变化'}`);
  }
  return <div className="grid gap-[var(--rui-content-gap-sm)]"><DataTable data={records} columns={demoColumns} getRowId={row => row.id} caption={controlled ? '受控编辑任务' : mode === 'row' ? failFirst ? '失败重试任务' : '行编辑任务' : '单元格编辑任务'} editMode={mode} editableColumns={editableColumns} editingState={controlled ? editing : undefined} onEditingStateChange={controlled ? setEditing : undefined} onEditCommit={save} pageSize={10} /><output className="text-xs text-muted-foreground">{result}{controlled && ` · draft=${editing?.values.name ?? '∅'}`}</output></div>;
}

export const RowEditing: Story = { name: '行编辑与宿主更新', render: () => <EditableDataTable mode="row" /> };
export const CellEditing: Story = { name: '单元格编辑', render: () => <EditableDataTable mode="cell" /> };
export const EditingFailure: Story = { name: '异步失败、草稿保留与重试', render: () => <EditableDataTable mode="row" failFirst /> };
export const ControlledEditing: Story = { name: '受控编辑草稿', render: () => <EditableDataTable mode="row" controlled /> };

type PlaygroundArgs = { manual: boolean; rowCount: number; pageIndex: number; query: string; columnFiltersEnabled: boolean; ownerFilter: string; manageColumns: boolean; resizableColumns: boolean; groupByOwner: boolean; expandableRows: boolean; editing: 'off' | DataTableEditMode; saveBehavior: 'success' | 'error'; loading: boolean; selectable: boolean; pageSize: number; caption: string; searchPlaceholder: string; error: string; empty: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { manual: false, rowCount: 23, pageIndex: 0, query: '', columnFiltersEnabled: true, ownerFilter: '', manageColumns: false, resizableColumns: false, groupByOwner: false, expandableRows: false, editing: 'off', saveBehavior: 'success', loading: false, selectable: true, pageSize: 5, caption: '本地任务', searchPlaceholder: '筛选所有列…', error: '', empty: false },
 argTypes: { manual: booleanControl, rowCount: { control: { type: 'number', min: 0 } }, pageIndex: { control: { type: 'number', min: 0 } }, query: textControl, columnFiltersEnabled: booleanControl, ownerFilter: choiceControl(['', 'Reito', 'Lin', 'Ming']), manageColumns: booleanControl, resizableColumns: booleanControl, groupByOwner: booleanControl, expandableRows: booleanControl, editing: choiceControl(['off', 'cell', 'row']), saveBehavior: choiceControl(['success', 'error']), loading: booleanControl, selectable: booleanControl, pageSize: choiceControl([3, 5, 10, 20]), caption: textControl, searchPlaceholder: textControl, error: textControl, empty: recipeControl(booleanControl, '传入空 data；列定义仍由调用方提供。') },
 parameters: { controls: { include: ['manual', 'rowCount', 'pageIndex', 'query', 'columnFiltersEnabled', 'ownerFilter', 'manageColumns', 'resizableColumns', 'groupByOwner', 'expandableRows', 'editing', 'saveBehavior', 'loading', 'selectable', 'pageSize', 'caption', 'searchPlaceholder', 'error', 'empty'] } },
 render: function Render(args) { const [, update] = useArgs(); const [localRecords, setLocalRecords] = useState<DemoRecord[]>(demoRecords); const [remoteDraft, setRemoteDraft] = useState<DemoRecord[]>(remoteRecords); const records = args.manual ? remoteDraft.slice(args.pageIndex * args.pageSize, (args.pageIndex + 1) * args.pageSize) : localRecords; const filters: DataTableColumnFiltersState = args.ownerFilter ? [{ id: 'owner', value: { kind: 'select', operator: 'in', values: [args.ownerFilter] } }] : []; const groupingProps = args.groupByOwner ? { groupingDefinitions: ownerGroupingDefinitions, grouping: ownerGrouping, expanded: true as const } : {}; const expansionProps = args.expandableRows ? { expanded: true as const, getRowCanExpand: () => true, renderExpandedRow: (row: { original: DemoRecord }) => <span className="text-sm text-muted-foreground">{row.original.name} 的本地详情预览。</span> } : {}; async function save(change: DataTableEditCommit<DemoRecord>) { await new Promise(resolve => setTimeout(resolve, 120)); if (args.saveBehavior === 'error') throw new globalThis.Error('本地保存模拟失败，草稿已保留。'); const apply = (items: DemoRecord[]) => items.map(record => record.id === change.rowId ? { ...record, ...change.changedValues } as DemoRecord : record); if (args.manual) setRemoteDraft(apply); else setLocalRecords(apply); } return <DataTable data={args.empty ? [] : records} columns={demoColumns} getRowId={row => row.id} manual={args.manual} rowCount={args.manual ? args.rowCount : undefined} globalFilter={args.query} onGlobalFilterChange={query => update({ query })} filterDefinitions={args.columnFiltersEnabled ? [filterDefinitions[1]] : []} columnFilters={filters} onColumnFiltersChange={next => update({ ownerFilter: next[0]?.value.kind === 'select' ? next[0].value.values[0] ?? '' : '' })} manageColumns={args.manageColumns} resizableColumns={args.resizableColumns} columnLabels={{ name: '任务', owner: '负责人', status: '状态', updated: '更新日期' }} {...groupingProps} {...expansionProps} editMode={args.editing === 'off' ? undefined : args.editing} editableColumns={args.editing === 'off' ? [] : editableColumns} onEditCommit={save} pagination={{ pageIndex: args.pageIndex, pageSize: args.pageSize }} onPaginationChange={pagination => update({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize })} loading={args.loading} selectable={args.selectable} caption={args.caption} searchPlaceholder={args.searchPlaceholder} error={args.error} />; },
};
