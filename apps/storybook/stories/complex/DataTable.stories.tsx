import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DataTable } from '../../../../packages/ui/src/complex/index.js';
import { DataTableDemo, demoColumns, demoRecords } from '../../../../packages/ui/src/complex/catalog.js';

const meta = { title: '复杂/DataTable 数据表格', component: DataTableDemo, parameters: { docs: { description: { component: '客户端 TanStack Table v8：提供完整本地数据与稳定 getRowId。筛选、排序与翻页均保留已选记录；远程查询由调用方单独设计。' } } } } satisfies Meta<typeof DataTableDemo>;
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

type PlaygroundArgs = { loading: boolean; selectable: boolean; pageSize: number; caption: string; searchPlaceholder: string; error: string; empty: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { loading: false, selectable: true, pageSize: 5, caption: '本地任务', searchPlaceholder: '筛选所有列…', error: '', empty: false },
 argTypes: { loading: booleanControl, selectable: booleanControl, pageSize: { ...choiceControl([3, 5, 10, 20]), description: '组件的初始分页大小；修改此参数会重建表格，重置内部筛选与分页。' }, caption: textControl, searchPlaceholder: textControl, error: textControl, empty: recipeControl(booleanControl, '传入空 data；列定义仍由调用方提供。') },
 parameters: { controls: { include: ['loading', 'selectable', 'pageSize', 'caption', 'searchPlaceholder', 'error', 'empty'] } },
 render: args => <DataTable key={args.pageSize} data={args.empty ? [] : demoRecords} columns={demoColumns} getRowId={row => row.id} loading={args.loading} selectable={args.selectable} pageSize={args.pageSize} caption={args.caption} searchPlaceholder={args.searchPlaceholder} error={args.error} />,
};
