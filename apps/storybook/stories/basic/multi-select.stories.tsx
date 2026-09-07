import { useState } from 'react';
import { useArgs } from "storybook/preview-api";
import { MultiSelect } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { MultiSelectDemo } from '../../../../packages/ui/src/basic/catalog.js';

const options = [
  { value: 'react', label: 'React', description: '界面组件', group: '前端' },
  { value: 'typescript', label: 'TypeScript', description: '类型系统', group: '前端' },
  { value: 'tailwind', label: 'Tailwind CSS', description: '样式工具', group: '工具' },
  { value: 'storybook', label: 'Storybook', description: '组件工作台', group: '工具' },
  { value: 'rust', label: 'Rust', description: '由组织锁定', group: '后端', disabled: true },
];
const virtualOptions = Array.from({ length: 50_000 }, (_, index) => ({ value: `item-${index}`, label: `资源 ${String(index + 1).padStart(5, '0')}`, description: index % 3 === 0 ? `来自工作区分片 ${Math.floor(index / 1000) + 1}` : undefined, group: `分片 ${Math.floor(index / 1000) + 1}` }));

const meta = { title: '基础/MultiSelect', component: MultiSelect, tags: ['autodocs'], args: { label: '项目技术栈', options }, parameters: { docs: { description: { component: '本地多选封装。分组、创建新项、当前筛选结果全选/半选、批量清除和禁用项边界由公共 props 提供；批量操作不会改动当前结果外的值。' } } } } satisfies Meta<typeof MultiSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '搜索、选择与移除', render: () => <MultiSelectDemo />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement); const body = within(canvasElement.ownerDocument.body);
  const input = canvas.getByRole('combobox', { name: '项目技术栈' });
  await userEvent.type(input, 'Type');
  await userEvent.click(await body.findByRole('option', { name: 'TypeScript' }));
  await userEvent.keyboard('{Escape}');
  await expect(canvas.getByText('已选择：react, typescript')).toBeVisible();
  await userEvent.click(canvas.getByRole('button', { name: '移除React' }));
  await waitFor(() => expect(canvas.getByText('已选择：typescript')).toBeVisible());
} };
export const Disabled: Story = { name: '禁用', render: () => <MultiSelectDemo state="disabled" /> };
export const Loading: Story = { name: '加载选项', render: () => <MultiSelectDemo state="loading" /> };
export const Empty: Story = { name: '无可选项', render: () => <MultiSelectDemo state="empty" />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement); const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(canvas.getByRole('combobox', { name: '项目技术栈' }));
  await expect(await body.findByText('没有匹配的选项')).toBeVisible();
  await userEvent.keyboard('{Escape}');
} };
export const Invalid: Story = { name: '字段错误', render: () => <MultiSelectDemo state="invalid" /> };

export const Unselected: Story = { name: '尚未选择', render: () => <MultiSelect label="项目技术栈" options={[{ value: 'react', label: 'React' }, { value: 'typescript', label: 'TypeScript' }]} defaultValue={[]} className="max-w-sm" /> };

export const Grouped: Story = { name: '分组选项', render: () => <MultiSelect label="项目技术栈" options={options} defaultValue={['react']} className="max-w-sm" /> };
export const PartialSelection: Story = { name: '局部全选与半选', render: () => <MultiSelect label="项目技术栈" options={options} defaultValue={['react']} showSelectAll className="max-w-sm" /> };
export const DisabledBoundary: Story = { name: '禁用项批量边界', render: () => <MultiSelect label="项目技术栈" options={options} defaultValue={['react', 'rust']} showSelectAll description="Rust 已由组织锁定，批量清除与标签操作都不会移除它。" className="max-w-sm" /> };
export const CreateOption: Story = { name: '创建新项', render: () => <MultiSelect label="项目技术栈" options={options} defaultValue={[]} onCreateOption={label => ({ value: label.toLocaleLowerCase().replaceAll(' ', '-'), label, group: '自定义' })} className="max-w-sm" /> };
export const FilteredBulk: Story = { name: '筛选范围批量操作', render: () => <MultiSelect label="项目技术栈" options={options} defaultValue={['tailwind']} showSelectAll description="输入“前端”后，全选只增减当前分组的可用结果，并保留 Tailwind CSS。" className="max-w-sm" /> };
export const VirtualLarge: Story = { name: '五万项虚拟弹层', render: () => <MultiSelect label="工作区资源" options={virtualOptions} defaultValue={['item-25000']} virtual description="只渲染当前弹层窗口与 overscan；打开后定位到远端已选项。" className="max-w-sm" /> };
export const VirtualVariableRows: Story = { name: '可变选项高度', render: () => <MultiSelect label="工作区资源" options={virtualOptions.slice(0, 1000)} defaultValue={['item-8']} virtual description="说明行与分组首项由 ResizeObserver 重新测量。" className="max-w-sm" /> };
export const VirtualRange: Story = { name: '虚拟范围回调', render: function Render() { const [range, setRange] = useState('尚未测量'); return <div className="grid max-w-sm gap-2"><MultiSelect label="工作区资源" options={virtualOptions} virtual virtualOverscan={2} onVirtualRangeChange={next => setRange(`${next.visibleStartIndex}-${next.visibleEndIndex} / ${next.startIndex}-${next.endIndex}`)} /><output data-testid="virtual-range" className="font-mono text-xs text-muted-foreground">range={range}</output></div>; } };

export const Playground: StoryObj<{ label: string; value: string[]; disabled: boolean; loading: boolean; error: string; placeholder: string; showSelectAll: boolean; allowCreate: boolean; grouped: boolean; virtual: boolean; virtualOverscan: number }> = {
  name: '参数调试', args: { label: '项目技术栈', value: ['react'], disabled: false, loading: false, error: '', placeholder: '搜索并选择…', showSelectAll: true, allowCreate: true, grouped: true, virtual: false, virtualOverscan: 4 },
  argTypes: { label: { control: 'text' }, value: { control: 'check', options: ['react', 'typescript', 'tailwind', 'storybook', 'rust'] }, disabled: { control: 'boolean' }, loading: { control: 'boolean' }, error: { control: 'text' }, placeholder: { control: 'text' }, showSelectAll: { control: 'boolean' }, allowCreate: { control: 'boolean' }, grouped: { control: 'boolean' }, virtual: { control: 'boolean' }, virtualOverscan: { control: { type: 'number', min: 0, max: 20 } } },
  parameters: { controls: { include: ['label', 'value', 'disabled', 'loading', 'error', 'placeholder', 'showSelectAll', 'allowCreate', 'grouped', 'virtual', 'virtualOverscan'] } },
  render: function Render({ allowCreate, grouped, ...args }) { const [, updateArgs] = useArgs(); return <MultiSelect {...args} options={(args.virtual ? virtualOptions.slice(0, 1000) : options).map(option => grouped ? option : { ...option, group: undefined })} onCreateOption={allowCreate ? label => ({ value: label.toLocaleLowerCase().replaceAll(' ', '-'), label }) : undefined} onValueChange={value => updateArgs({ value })} className="max-w-sm" />; },
};
