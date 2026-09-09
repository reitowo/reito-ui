import { useState, type ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SortableList } from '../../../../packages/ui/src/complex/sortable-list.js';
import { SortableListDemo, sortableItems } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, textControl } from '../feature-controls.js';

const meta = { id: "复杂-sortablelist-排序列表", title: "复杂/SortableList 排序列表", component: SortableList, tags: ['autodocs'], args: { items: sortableItems }, parameters: { docs: { description: { component: '稳定 ID 顺序支持选择后移动、Alt+方向键和原生拖放。禁用项保持位置并阻断跨越。' } } } } satisfies Meta<typeof SortableList>;
export default meta;
type Story = StoryObj<typeof meta>;
type Args = Pick<ComponentProps<typeof SortableList>, 'order' | 'selected' | 'label' | 'multiple' | 'draggable' | 'disabled' | 'readOnly'>;

export const Playground: StoryObj<Args> = {
  name: "参数调试",
  args: { order: sortableItems.map(item => item.id), selected: ['plan'], label: '任务顺序', multiple: true, draggable: true, disabled: false, readOnly: false },
  argTypes: { order: { control: 'object' }, selected: { control: { type: 'check' }, options: sortableItems.filter(item => !item.disabled).map(item => item.id) }, label: textControl, multiple: booleanControl, draggable: booleanControl, disabled: booleanControl, readOnly: booleanControl },
  parameters: { controls: { include: ['order', 'selected', 'label', 'multiple', 'draggable', 'disabled', 'readOnly'] } },
  render: function Render(args) { const [, update] = useArgs<Args>(); return <SortableList items={sortableItems} {...args} onOrderChange={next => update({ order: next })} onSelectedChange={next => update({ selected: next })} />; },
};
export const Overview: Story = { name: "总览对比", render: () => <SortableListDemo /> };
export const Controlled: Story = { name: "受控顺序", render: function Render() { const [order, setOrder] = useState(sortableItems.map(item => item.id)); return <div className="grid gap-[var(--rui-content-gap-sm)]"><SortableList items={sortableItems} order={order} onOrderChange={setOrder} defaultSelected={['execute']} /><output className="text-xs text-muted-foreground">{order.join(' > ')}</output></div>; } };
export const Batch: Story = { name: "批量移动", render: () => <SortableList items={sortableItems} defaultSelected={['context', 'plan']} /> };
export const Keyboard: Story = { name: "键盘移动", render: () => <SortableList items={sortableItems} defaultSelected={['execute']} /> };
export const LockedBarrier: Story = { name: "禁用项边界", render: () => <SortableList items={sortableItems} defaultSelected={['execute']} /> };
export const SingleSelection: Story = { name: "单选", render: () => <SortableList items={sortableItems} multiple={false} /> };
export const NoDrag: Story = { name: "仅按钮与键盘", render: () => <SortableList items={sortableItems} draggable={false} /> };
export const ReadOnly: Story = { name: "状态 · 只读", render: () => <SortableList items={sortableItems} defaultSelected={['plan']} readOnly /> };
export const Disabled: Story = { name: "状态 · 禁用", render: () => <SortableList items={sortableItems} defaultSelected={['plan']} disabled /> };
export const Empty: Story = { name: "空列表", render: () => <SortableList items={[]} /> };
export const Narrow: Story = { name: "窄容器", render: () => <div className="max-w-xs"><SortableList items={sortableItems} defaultSelected={['plan']} /></div> };
export const LongContent: Story = { name: "长内容", render: () => <SortableList items={[...sortableItems, { id: 'long', label: '这是一个非常长的任务名称，用于确认排序列表不会产生页面级横向溢出', description: '说明保持截断，完整业务文本仍由宿主数据持有。' }]} /> };
