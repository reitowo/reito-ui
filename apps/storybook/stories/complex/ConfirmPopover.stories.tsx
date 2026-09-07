import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Archive, Trash2 } from 'lucide-react';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { ConfirmPopover } from '../../../../packages/ui/src/complex/confirm-popover.js';
import { ConfirmPopoverDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, textControl } from '../feature-controls.js';

const meta = {
  title: '复杂/ConfirmPopover 锚点确认',
  component: ConfirmPopover,
  args: {
    trigger: <Button type="button" variant="outline" size="sm">归档</Button>,
    title: '归档这个项目？',
    description: '项目会从当前列表移出。',
    onConfirm: () => undefined,
  },
  tags: ['autodocs'],
  parameters: {
    docs: {
      story: { inline: false, height: 'var(--rui-container-lg)' },
      description: {
        component: '贴近触发器的模态确认面，适合工具栏、列表行和属性面板。取消、Escape 与成功提交都会关闭并把焦点交还触发器；异步失败留在原位显示错误，pending 期间阻止重复提交和意外关闭。',
      },
    },
  },
} satisfies Meta<typeof ConfirmPopover>;
export default meta;
type Story = StoryObj<typeof meta>;

type Outcome = 'success' | 'failure';
type PlaygroundArgs = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  pendingLabel: string;
  open: boolean;
  destructive: boolean;
  pending: boolean;
  disabled: boolean;
  side: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
  outcome: Outcome;
  status: string;
};

const delay = (duration = 240) => new Promise(resolve => window.setTimeout(resolve, duration));

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: {
    title: '归档这个项目？',
    description: '项目会从当前列表移出，可以稍后恢复。',
    confirmLabel: '归档',
    cancelLabel: '取消',
    pendingLabel: '正在归档…',
    open: false,
    destructive: false,
    pending: false,
    disabled: false,
    side: 'bottom',
    align: 'center',
    outcome: 'success',
    status: '尚未执行操作',
  },
  argTypes: {
    title: textControl,
    description: textControl,
    confirmLabel: textControl,
    cancelLabel: textControl,
    pendingLabel: textControl,
    open: booleanControl,
    destructive: booleanControl,
    pending: booleanControl,
    disabled: booleanControl,
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    outcome: { control: 'select', options: ['success', 'failure'], table: { category: '组合示例' } },
    status: { control: false },
  },
  parameters: {
    controls: { include: ['title', 'description', 'confirmLabel', 'cancelLabel', 'pendingLabel', 'open', 'destructive', 'pending', 'disabled', 'side', 'align', 'outcome'] },
  },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <div className="grid min-h-[var(--rui-container-sm)] place-content-center gap-[var(--rui-content-gap-sm)]">
      <ConfirmPopover
        {...args}
        trigger={<Button type="button" variant="outline" size="sm"><Archive aria-hidden="true" />归档项目</Button>}
        onOpenChange={open => updateArgs({ open })}
        onCancel={() => updateArgs({ status: '已取消归档' })}
        onConfirm={async () => {
          updateArgs({ status: '正在执行本地异步示例…' });
          await delay();
          if (args.outcome === 'failure') throw new Error('本地示例未能归档，请重试。');
          updateArgs({ status: '项目已归档（本地示例）' });
        }}
      />
      <p role="status" className="text-center text-xs text-muted-foreground">{args.status}</p>
    </div>;
  },
};

export const Default: Story = { name: '默认本地示例', render: () => <ConfirmPopoverDemo /> };

export const Destructive: Story = {
  name: '危险确认',
  args: {
    trigger: <Button type="button" variant="outline" size="sm"><Trash2 aria-hidden="true" />删除草稿</Button>,
    title: '删除这份草稿？',
    description: '删除后无法从当前工作区恢复。',
    destructive: true,
    confirmLabel: '删除',
    defaultOpen: true,
    onConfirm: () => undefined,
  },
};

export const WithDetails: Story = {
  name: '附加详情',
  args: {
    trigger: <Button type="button" variant="outline" size="sm">移除连接</Button>,
    title: '移除本地连接？',
    description: '后续任务将不能再使用此连接。',
    details: <span className="block rounded-md bg-muted px-[var(--rui-space-2)] py-[var(--rui-space-1)]">Local workspace · reito-ui</span>,
    destructive: true,
    confirmLabel: '移除',
    defaultOpen: true,
    onConfirm: () => undefined,
  },
};

export const ExternalPending: Story = {
  name: '外部忙碌状态',
  args: {
    trigger: <Button type="button" variant="outline" size="sm">归档</Button>,
    title: '归档这个项目？',
    description: '等待宿主完成当前请求。',
    pending: true,
    pendingLabel: '正在归档…',
    defaultOpen: true,
    onConfirm: () => undefined,
  },
};

export const HostError: Story = {
  name: '宿主错误状态',
  args: {
    trigger: <Button type="button" variant="outline" size="sm">重新连接</Button>,
    title: '重新连接工作区？',
    description: '确认后会重建本地连接。',
    error: '工作区正在使用中，请关闭占用进程后重试。',
    confirmLabel: '重试',
    defaultOpen: true,
    onConfirm: () => undefined,
  },
};

function AsyncExample({ fail = false }: { fail?: boolean }) {
  const [status, setStatus] = useState('等待确认');
  return <div className="grid gap-[var(--rui-content-gap-sm)]">
    <ConfirmPopover
      trigger={<Button type="button" variant="outline" size="sm">运行异步操作</Button>}
      title="运行本地异步示例？"
      description="请求完成前确认面保持打开。"
      confirmLabel="运行"
      pendingLabel="正在运行…"
      onCancel={() => setStatus('已取消')}
      onConfirm={async () => {
        setStatus('运行中');
        await delay(320);
        if (fail) throw new Error('本地示例执行失败，可以再次尝试。');
        setStatus('已完成');
      }}
    />
    <p role="status" className="text-xs text-muted-foreground">{status}</p>
  </div>;
}

export const AsyncSuccess: Story = { name: '异步成功', render: () => <AsyncExample /> };
export const AsyncFailure: Story = { name: '异步失败与重试', render: () => <AsyncExample fail /> };

export const Disabled: Story = {
  name: '禁用触发器',
  args: {
    trigger: <Button type="button" variant="outline" size="sm">删除锁定项目</Button>,
    title: '删除锁定项目？',
    disabled: true,
    destructive: true,
    confirmLabel: '删除',
    onConfirm: () => undefined,
  },
};

export const KeyboardFocus: Story = {
  name: '键盘关闭与焦点恢复',
  render: () => <div className="grid min-h-[var(--rui-container-sm)] place-content-center">
    <ConfirmPopover
      trigger={<Button type="button" variant="outline" size="sm">归档项目</Button>}
      title="归档这个项目？"
      description="按 Escape 或取消都会回到触发器。"
      confirmLabel="归档"
      onConfirm={() => undefined}
    />
  </div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentBody = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: '归档项目' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const dialog = await documentBody.findByRole('alertdialog');
    await expect(within(dialog).getByRole('button', { name: '取消' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
