import { useState, type ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Transfer } from '../../../../packages/ui/src/complex/transfer.js';
import { TransferDemo, transferItems } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, textControl } from '../feature-controls.js';

const meta = { id: "复杂-transfer-穿梭选择",
  title: "复杂/Transfer 穿梭选择",
  component: Transfer,
  tags: ['autodocs'],
  args: { items: transferItems },
  parameters: { docs: { description: { component: '双侧 Listbox 使用稳定值维护有序目标集合。搜索、当前结果批量转移、禁用项和 Alt+方向键均属于公开组件契约。' } } },
} satisfies Meta<typeof Transfer>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = Pick<ComponentProps<typeof Transfer>, 'value' | 'sourceLabel' | 'targetLabel' | 'sourceQuery' | 'targetQuery' | 'searchable' | 'bulkActions' | 'disabled' | 'readOnly' | 'loading'>;
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { value: ['read'], sourceLabel: '可用权限', targetLabel: '已授予权限', sourceQuery: '', targetQuery: '', searchable: true, bulkActions: true, disabled: false, readOnly: false, loading: false },
  argTypes: {
    value: { control: { type: 'check' }, options: transferItems.map(item => item.value) },
    sourceLabel: textControl,
    targetLabel: textControl,
    sourceQuery: textControl,
    targetQuery: textControl,
    searchable: booleanControl,
    bulkActions: booleanControl,
    disabled: booleanControl,
    readOnly: booleanControl,
    loading: booleanControl,
  },
  parameters: { controls: { include: ['value', 'sourceLabel', 'targetLabel', 'sourceQuery', 'targetQuery', 'searchable', 'bulkActions', 'disabled', 'readOnly', 'loading'] } },
  render: function Render(args) {
    const [, update] = useArgs<PlaygroundArgs>();
    return <Transfer items={transferItems} {...args} onValueChange={next => update({ value: next })} onSourceQueryChange={next => update({ sourceQuery: next })} onTargetQueryChange={next => update({ targetQuery: next })} />;
  },
};

export const Overview: Story = { name: "总览对比", render: () => <TransferDemo /> };
export const Controlled: Story = { name: "受控值与移动详情", render: function Render() {
  const [value, setValue] = useState(['read']);
  const [detail, setDetail] = useState('等待移动');
  return <div className="grid gap-[var(--rui-content-gap-sm)]"><Transfer items={transferItems} value={value} onValueChange={(next, event) => { setValue(next); setDetail(event.direction + ':' + event.moved.join(',')); }} /><output className="text-xs text-muted-foreground">value={value.join(',') || '空'}; {detail}</output></div>;
} };
export const CurrentResultBulk: Story = { name: "当前搜索结果批量转移", render: () => <Transfer items={transferItems} defaultSourceQuery="文件" sourceLabel="搜索后的来源" targetLabel="目标" /> };
export const KeyboardTransfer: Story = { name: "键盘转移", render: () => <Transfer items={transferItems} defaultSourceSelection={['write']} sourceLabel="Alt+右方向键移动" targetLabel="Alt+左方向键移回" /> };
export const DisabledItems: Story = { name: "禁用项不可转移", render: () => <Transfer items={transferItems} sourceLabel="包含锁定项" targetLabel="已选项" /> };
export const ReadOnly: Story = { name: "状态 · 只读", render: () => <Transfer items={transferItems} defaultValue={['read', 'terminal']} readOnly /> };
export const Disabled: Story = { name: "状态 · 禁用", render: () => <Transfer items={transferItems} defaultValue={['read']} disabled /> };
export const Loading: Story = { name: "状态 · 加载中", render: () => <Transfer items={transferItems} defaultValue={['read']} loading /> };
export const EmptySource: Story = { name: "来源为空", render: () => <Transfer items={transferItems.filter(item => !item.disabled)} defaultValue={['read', 'write', 'terminal', 'browser']} /> };
export const EmptyTarget: Story = { name: "目标为空", render: () => <Transfer items={transferItems} /> };
export const NoSearch: Story = { name: "无搜索栏", render: () => <Transfer items={transferItems} searchable={false} /> };
export const NoBulk: Story = { name: "仅移动所选", render: () => <Transfer items={transferItems} bulkActions={false} /> };
export const Narrow: Story = { name: "窄容器", render: () => <div className="max-w-sm"><Transfer items={transferItems} defaultValue={['read']} /></div> };
export const LongContent: Story = { name: "长内容", render: () => <Transfer items={[...transferItems, { value: 'long', label: '读取非常长的跨工作区资源名称与相关元数据', description: '长内容保持在自己的列表面板内，不挤压转移操作。' }]} /> };
