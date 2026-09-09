import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, RefreshCw } from 'lucide-react';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { Banner, type BannerLive, type BannerTone } from '../../../../packages/ui/src/complex/banner.js';
import { BannerDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, textControl } from '../feature-controls.js';

const meta = { id: "复杂-banner-通知条",
  title: "复杂/Banner 通知条",
  component: Banner,
  args: { title: '组件索引可以更新' },
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '复用 Alert 的紧凑应用通知，可带单个宿主动作和关闭按钮。默认静态通知使用 region；只有动态到达且需要播报的信息才选择 polite/assertive。' } } },
} satisfies Meta<typeof Banner>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  title: string;
  description: string;
  tone: BannerTone;
  live: BannerLive;
  open: boolean;
  showIcon: boolean;
  showAction: boolean;
  showDismiss: boolean;
  actionLoading: boolean;
  actionDisabled: boolean;
  status: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { title: '组件索引可以更新', description: '这是本地示例，不会请求远端服务。', tone: 'info', live: 'off', open: true, showIcon: true, showAction: true, showDismiss: true, actionLoading: false, actionDisabled: false, status: '等待操作' },
  argTypes: {
    title: textControl,
    description: textControl,
    tone: { control: 'select', options: ['neutral', 'info', 'success', 'warning', 'danger'] },
    live: { control: 'select', options: ['off', 'polite', 'assertive'] },
    open: booleanControl,
    showIcon: booleanControl,
    showAction: booleanControl,
    showDismiss: booleanControl,
    actionLoading: { ...booleanControl, table: { category: '组合示例' } },
    actionDisabled: { ...booleanControl, table: { category: '组合示例' } },
    status: { control: false },
  },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <div className="grid gap-[var(--rui-content-gap-sm)]">
      <Banner {...args} icon={args.showIcon ? undefined : false} action={args.showAction ? { label: '查看', loading: args.actionLoading, disabled: args.actionDisabled, onSelect: () => updateArgs({ status: '已触发查看操作（本地示例）' }) } : undefined} onDismiss={args.showDismiss ? () => updateArgs({ status: '已关闭本地通知' }) : undefined} onOpenChange={open => updateArgs({ open })} />
      <p role="status" className="text-xs text-muted-foreground">{args.status}</p>
    </div>;
  },
};

export const Default: Story = { name: "默认本地示例", render: () => <BannerDemo /> };
export const Tones: Story = { name: "语义状态", render: () => <div className="grid gap-[var(--rui-space-2)]"><Banner title="普通通知" /><Banner title="信息已更新" tone="info" /><Banner title="同步完成" tone="success" /><Banner title="即将达到限制" tone="warning" /><Banner title="同步失败" tone="danger" /></div> };
export const TitleOnly: Story = { name: "仅标题", args: { title: '本地草稿已保存', tone: 'success' } };
export const LongContent: Story = { name: "长内容", args: { title: '工作区配置需要重新加载', description: '检测到多个本地配置文件已经发生变化。重新加载会保留当前未提交的编辑，并重新读取主题、密度和组件索引。', tone: 'warning', action: { label: '重新加载', onSelect: () => undefined }, onDismiss: () => undefined } };
export const Narrow: Story = { name: "窄容器", render: () => <div className="w-[var(--rui-container-2xs)] max-w-full"><Banner title="可用更新" description="重新加载组件索引以继续。" tone="info" action={{ label: '查看', onSelect: () => undefined }} onDismiss={() => undefined} /></div> };
export const ActionDisabled: Story = { name: "动作禁用", args: { title: '当前无法更新', description: '等待本地任务结束后再试。', action: { label: '更新', disabled: true, onSelect: () => undefined } } };
export const ActionLoading: Story = { name: "动作忙碌", args: { title: '正在更新索引', description: '通知保持可关闭。', action: { label: '更新中…', loading: true, onSelect: () => undefined }, onDismiss: () => undefined } };
export const PoliteLive: Story = { name: "动态礼貌播报", args: { title: '后台同步完成', description: '这是动态到达通知的示例。', live: 'polite', tone: 'success' } };
export const AssertiveLive: Story = { name: "动态紧急播报", args: { title: '连接已中断', description: '当前保存操作没有完成。', live: 'assertive', tone: 'danger' } };

function ControlledExample() {
  const [open, setOpen] = useState(true);
  return <div className="grid gap-[var(--rui-content-gap-sm)]"><Button size="sm" variant="outline" onClick={() => setOpen(true)}><RefreshCw aria-hidden="true" />重新显示</Button><Banner open={open} onOpenChange={setOpen} title="受控通知" icon={<Bell aria-hidden="true" />} onDismiss={() => undefined} /></div>;
}
export const ControlledDismiss: Story = { name: "受控关闭与重新显示", render: () => <ControlledExample /> };
