import { useEffect } from 'react';
import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ResourceList } from '../../../../packages/ui/src/complex/resource-list.js';
import { ResourceListDemo, demoResources } from '../../../../packages/ui/src/complex/catalog.js';

const meta = {
  title: '复杂/ResourceList 资源列表', component: ResourceListDemo,
  parameters: { docs: { description: { component: '本地资源列表支持搜索、排序、单选或批量选择。稳定 ID 保持过滤后的选择，行操作由宿主回调负责；不读取或删除磁盘资源。' } } },
} satisfies Meta<typeof ResourceListDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  name: '交互场景：筛选、批量选择、排序与行操作',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('checkbox', { name: '选择 specs.md' }));
    await userEvent.type(canvas.getByRole('textbox', { name: '搜索项目资源' }), 'tokens');
    expect(canvas.getByText('显示 1 / 4 项 · 已选择 1 项')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('checkbox', { name: '选择筛选结果' }));
    expect(canvas.getByText('显示 1 / 4 项 · 已选择 2 项')).toBeInTheDocument();
    await userEvent.clear(canvas.getByRole('textbox', { name: '搜索项目资源' }));
    expect(canvas.getByRole('checkbox', { name: '选择 specs.md' })).toBeChecked();
    expect(canvas.getByRole('checkbox', { name: '选择 tokens.json' })).toBeChecked();
    await userEvent.click(canvas.getByRole('combobox', { name: '资源排序' }));
    await userEvent.click(body.getByRole('option', { name: '名称 Z → A' }));
    const rows = within(canvas.getByRole('list', { name: '项目资源列表' })).getAllByRole('listitem');
    expect(within(rows[0]).getByText('workspace.png')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '打开 tokens.json' }));
    expect(canvas.getByText('已打开 tokens.json（本地预览）')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '移除 tokens.json' }));
    expect(canvas.queryByRole('checkbox', { name: '选择 tokens.json' })).not.toBeInTheDocument();
    expect(canvas.getByText('显示 3 / 3 项 · 已选择 1 项')).toBeInTheDocument();
  },
};
export const SingleSelection: Story = { name: '单选', render: () => <ResourceList items={demoResources.filter(item => !item.disabled)} selectionMode="single" /> };
export const Empty: Story = { name: '空资源', render: () => <ResourceList items={[]} /> };
export const Loading: Story = { name: '加载中', render: () => <ResourceList items={[]} loading /> };
export const Error: Story = { name: '错误状态', render: () => <ResourceList items={[]} error="无法加载资源，请检查宿主数据来源。" /> };

export const Default: Story = { name: '默认资源列表', render: () => <ResourceList items={demoResources.filter(item => !item.disabled)} selectionMode="none" /> };
export const MultipleSelection: Story = { name: '多选', render: () => <ResourceList items={demoResources.filter(item => !item.disabled)} selectionMode="multiple" /> };
export const Disabled: Story = { name: '禁用资源操作', render: () => <ResourceList items={demoResources.filter(item => !item.disabled)} disabled /> };

type PlaygroundArgs = Pick<ComponentProps<typeof ResourceList>, 'selectionMode' | 'selectedIds' | 'query' | 'sort' | 'loading' | 'disabled' | 'label' | 'error'> & { empty: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { selectionMode: 'multiple', selectedIds: [], query: '', sort: 'name-asc', loading: false, disabled: false, label: '项目资源', error: '', empty: false },
 argTypes: { selectionMode: choiceControl(['none', 'single', 'multiple']), selectedIds: { control: 'check', options: demoResources.filter(item => !item.disabled).map(item => item.id), description: 'single 模式仅保留第一项；none 模式清空。规范化结果同步回 Controls。' }, query: textControl, sort: choiceControl(['name-asc', 'name-desc', 'updated-desc']), loading: booleanControl, disabled: booleanControl, label: textControl, error: textControl, empty: recipeControl(booleanControl, '传入空 items。') },
 parameters: { controls: { include: ['selectionMode', 'selectedIds', 'query', 'sort', 'loading', 'disabled', 'label', 'error', 'empty'] } },
 render: function PlaygroundRender(args) {
   const [, updateArgs] = useArgs();
   useEffect(() => {
     const selectedIds = args.selectedIds ?? [];
     if (args.selectionMode === 'none' && selectedIds.length) updateArgs({ selectedIds: [] });
     else if (args.selectionMode === 'single' && selectedIds.length > 1) updateArgs({ selectedIds: selectedIds.slice(0, 1) });
   }, [args.selectionMode, args.selectedIds, updateArgs]);
   const { empty, ...props } = args;
   return <ResourceList {...props} items={empty ? [] : demoResources} onSelectionChange={selectedIds => updateArgs({ selectedIds })} onQueryChange={query => updateArgs({ query })} onSortChange={sort => updateArgs({ sort })} onRetry={() => updateArgs({ error: '' })} />;
 },
};
