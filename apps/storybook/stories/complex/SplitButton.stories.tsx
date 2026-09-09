import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Download, GitBranch, Save, Trash2 } from 'lucide-react';
import {
  SplitButton,
  type SplitButtonItem,
  type SplitButtonSize,
  type SplitButtonVariant,
} from '../../../../packages/ui/src/complex/split-button.js';
import { SplitButtonDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, textControl } from '../feature-controls.js';

const defaultItems: SplitButtonItem[] = [
  { id: 'copy', label: '保存副本', icon: <Download aria-hidden="true" />, shortcut: 'Ctrl+Shift+S' },
  { id: 'branch', label: '保存并创建分支', textValue: 'branch', icon: <GitBranch aria-hidden="true" />, shortcut: 'Ctrl+Alt+S' },
  { id: 'remote', label: '发布到远端', disabled: true },
];

const meta = { id: "复杂-splitbutton-拆分按钮",
  title: "复杂/SplitButton 拆分按钮",
  component: SplitButton,
  args: { label: '保存', items: defaultItems, onAction: () => undefined },
  tags: ['autodocs'],
  parameters: {
    docs: {
      story: { inline: false, height: 'var(--rui-container-lg)' },
      description: {
        component: '主操作与相关菜单共享一组紧凑边缘；整组、主操作、菜单触发器和单个条目可分别禁用或显示忙碌状态。菜单沿用 Base UI 的方向键、首尾、类型查找、Escape 与焦点恢复。快捷键属性用于说明宿主绑定，不会注册全局监听。',
      },
    },
  },
} satisfies Meta<typeof SplitButton>;
export default meta;
type Story = StoryObj<typeof meta>;

type ItemState = 'default' | 'loading' | 'disabled' | 'destructive' | 'empty';
type PlaygroundArgs = {
  label: string;
  variant: SplitButtonVariant;
  size: SplitButtonSize;
  open: boolean;
  disabled: boolean;
  actionDisabled: boolean;
  menuDisabled: boolean;
  loading: boolean;
  menuLoading: boolean;
  itemState: ItemState;
  actionLabel: string;
  menuLabel: string;
  actionShortcut: string;
  menuShortcut: string;
  status: string;
};

function playgroundItems(state: ItemState): SplitButtonItem[] {
  if (state === 'empty') return [];
  return [
    { id: 'copy', label: '保存副本', icon: <Download aria-hidden="true" />, shortcut: 'Ctrl+Shift+S', loading: state === 'loading' },
    { id: 'branch', label: '保存并创建分支', icon: <GitBranch aria-hidden="true" />, disabled: state === 'disabled' },
    { id: 'remove', label: '删除草稿', icon: <Trash2 aria-hidden="true" />, variant: state === 'destructive' ? 'destructive' : 'default' },
  ];
}

export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: {
    label: '保存',
    variant: 'default',
    size: 'default',
    open: false,
    disabled: false,
    actionDisabled: false,
    menuDisabled: false,
    loading: false,
    menuLoading: false,
    itemState: 'default',
    actionLabel: '保存当前草稿',
    menuLabel: '更多保存操作',
    actionShortcut: 'Ctrl+S',
    menuShortcut: 'Alt+ArrowDown',
    status: '尚未执行操作',
  },
  argTypes: {
    label: textControl,
    variant: { control: 'select', options: ['default', 'secondary', 'outline', 'ghost', 'destructive'] },
    size: { control: 'select', options: ['xs', 'sm', 'default', 'lg'] },
    open: booleanControl,
    disabled: booleanControl,
    actionDisabled: booleanControl,
    menuDisabled: booleanControl,
    loading: booleanControl,
    menuLoading: booleanControl,
    itemState: { control: 'select', options: ['default', 'loading', 'disabled', 'destructive', 'empty'], table: { category: '组合示例' } },
    actionLabel: textControl,
    menuLabel: textControl,
    actionShortcut: textControl,
    menuShortcut: textControl,
    status: { control: false },
  },
  parameters: { controls: { include: ['label', 'variant', 'size', 'open', 'disabled', 'actionDisabled', 'menuDisabled', 'loading', 'menuLoading', 'itemState', 'actionLabel', 'menuLabel', 'actionShortcut', 'menuShortcut'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <div className="grid gap-[var(--rui-content-gap-sm)]">
      <SplitButton
        {...args}
        groupLabel="保存操作"
        items={playgroundItems(args.itemState)}
        onOpenChange={open => updateArgs({ open })}
        onAction={() => updateArgs({ status: '已执行主操作：保存' })}
        onItemSelect={item => updateArgs({ status: `已选择菜单操作：${String(item.label)}` })}
      />
      <p role="status" className="text-xs text-muted-foreground">{args.status}</p>
    </div>;
  },
};

export const Default: Story = { name: "默认本地示例", render: () => <SplitButtonDemo /> };

export const MenuWithShortcuts: Story = {
  name: "图标、快捷键与禁用条目",
  args: {
    label: <><Save aria-hidden="true" />保存</>,
    items: defaultItems,
    onAction: () => undefined,
    actionLabel: '保存当前草稿',
    menuLabel: '更多保存操作',
    actionShortcut: 'Ctrl+S',
    defaultOpen: true,
  },
};

export const IndependentDisabled: Story = {
  name: "独立禁用状态",
  render: () => <div className="flex flex-wrap gap-[var(--rui-content-gap)]">
    <SplitButton label="仅菜单可用" items={defaultItems} actionDisabled onAction={() => undefined} menuLabel="仅菜单可用的相关操作" />
    <SplitButton label="仅主操作可用" items={defaultItems} menuDisabled onAction={() => undefined} menuLabel="已禁用的相关操作" />
    <SplitButton label="整组禁用" items={defaultItems} disabled onAction={() => undefined} menuLabel="整组已禁用" />
  </div>,
};

export const MainLoading: Story = {
  name: "主操作忙碌",
  args: { label: '正在保存', items: defaultItems, loading: true, onAction: () => undefined, menuLabel: '保存期间仍可用的相关操作' },
};

export const MenuLoading: Story = {
  name: "菜单内容加载中",
  args: { label: '保存', items: [], menuLoading: true, defaultOpen: true, onAction: () => undefined, menuLabel: '查看正在加载的操作' },
};

export const ItemLoading: Story = {
  name: "单个菜单操作忙碌",
  args: { label: '保存', items: [{ ...defaultItems[0]!, loading: true }, defaultItems[1]!], defaultOpen: true, onAction: () => undefined, menuLabel: '更多保存操作' },
};

export const Empty: Story = {
  name: "空菜单",
  args: { label: '保存', items: [], defaultOpen: true, emptyLabel: '当前没有其他保存方式', onAction: () => undefined, menuLabel: '更多保存操作' },
};

function KeyboardExample() {
  const [status, setStatus] = useState('等待键盘操作');
  return <div className="grid gap-[var(--rui-content-gap-sm)]">
    <SplitButton
      label="保存"
      items={defaultItems.slice(0, 2)}
      onAction={() => setStatus('主操作已执行')}
      onItemSelect={item => setStatus(`菜单操作已执行：${String(item.label)}`)}
      menuLabel="更多保存操作"
    />
    <p role="status" className="text-xs text-muted-foreground">{status}</p>
  </div>;
}

export const KeyboardNavigation: Story = {
  name: "键盘与焦点恢复",
  render: () => <KeyboardExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentBody = within(canvasElement.ownerDocument.body);
    const main = canvas.getByRole('button', { name: '保存' });
    const trigger = canvas.getByRole('button', { name: '更多保存操作' });
    main.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('主操作已执行');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const firstItem = await documentBody.findByRole('menuitem', { name: /保存副本/ });
    await expect(firstItem).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
