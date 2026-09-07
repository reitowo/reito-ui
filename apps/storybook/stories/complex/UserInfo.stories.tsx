import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Mail, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import {
  UserInfo,
  type UserInfoAction,
  type UserInfoSize,
  type UserInfoStatusTone,
  type UserInfoVariant,
} from '../../../../packages/ui/src/complex/user-info.js';
import { UserInfoDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, textControl } from '../feature-controls.js';

const meta = {
  title: '复杂/User 信息行',
  component: UserInfo,
  args: { name: 'Reito' },
  tags: ['autodocs'],
  parameters: {
    docs: {
      story: { inline: false, height: 'var(--rui-container-sm)' },
      description: {
        component: '紧凑、非交互的身份行，组合头像、名称、辅助说明、可读状态和独立宿主动作。长文本在行内截断并保留 title；图片缺失或加载失败时使用 fallback。',
      },
    },
  },
} satisfies Meta<typeof UserInfo>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  name: string;
  description: string;
  fallback: string;
  status: string;
  statusTone: UserInfoStatusTone;
  size: UserInfoSize;
  variant: UserInfoVariant;
  showActionLabels: boolean;
  disabled: boolean;
  actionDisabled: boolean;
  actionLoading: boolean;
};

function InteractiveUser({
  actionDisabled = false,
  actionLoading = false,
  showActionLabels = false,
  ...props
}: Omit<ComponentProps<typeof UserInfo>, 'actions'> & {
  actionDisabled?: boolean;
  actionLoading?: boolean;
}) {
  const [message, setMessage] = useState('等待用户操作');
  const actions: UserInfoAction[] = [
    { id: 'message', label: '发送本地示例消息', icon: <Mail aria-hidden="true" />, loading: actionLoading, onSelect: () => setMessage('已触发消息操作（本地示例）') },
    { id: 'more', label: '更多用户操作', icon: <MoreHorizontal aria-hidden="true" />, disabled: actionDisabled, onSelect: () => setMessage('已触发更多操作（本地示例）') },
  ];
  return <div className="grid gap-[var(--rui-content-gap-sm)]">
    <UserInfo {...props} showActionLabels={showActionLabels} actions={actions} />
    <p role="status" className="text-xs text-muted-foreground">{message}</p>
  </div>;
}

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: {
    name: 'Reito',
    description: '组件系统维护者',
    fallback: 'R',
    status: '在线',
    statusTone: 'success',
    size: 'default',
    variant: 'muted',
    showActionLabels: false,
    disabled: false,
    actionDisabled: false,
    actionLoading: false,
  },
  argTypes: {
    name: textControl,
    description: textControl,
    fallback: textControl,
    status: textControl,
    statusTone: { control: 'select', options: ['neutral', 'success', 'warning', 'danger'] },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    variant: { control: 'select', options: ['plain', 'muted', 'outline'] },
    showActionLabels: booleanControl,
    disabled: booleanControl,
    actionDisabled: { ...booleanControl, table: { category: '组合示例' } },
    actionLoading: { ...booleanControl, table: { category: '组合示例' } },
  },
  render: args => <div className="w-[var(--rui-container-md)] max-w-full">
    <InteractiveUser {...args} />
  </div>,
};

export const Default: Story = { name: '默认本地示例', render: () => <div className="w-[var(--rui-container-md)] max-w-full"><UserInfoDemo /></div> };

export const LongContent: Story = {
  name: '长名称与说明',
  render: () => <div className="w-[var(--rui-container-2xs)]">
    <UserInfo
      name="Reito UI 组件系统本地工作区的长期维护者"
      description="负责组件契约、设计 tokens、主题密度和可访问性验证"
      status="审阅中"
      statusTone="warning"
      fallback="RU"
      variant="outline"
      actions={[{ id: 'more', label: '更多用户操作', icon: <MoreHorizontal aria-hidden="true" />, onSelect: () => undefined }]}
    />
  </div>,
};

export const MissingAvatar: Story = {
  name: '缺少头像与自动缩写',
  args: { name: 'Lin Ming', description: '本地协作者', status: '离线', fallback: undefined },
};

export const StatusTones: Story = {
  name: '可读状态',
  render: () => <div className="grid w-[var(--rui-container-md)] max-w-full gap-[var(--rui-space-1)]">
    <UserInfo name="默认状态" status="未知" statusTone="neutral" fallback="?" />
    <UserInfo name="可用成员" status="在线" statusTone="success" fallback="A" />
    <UserInfo name="暂离成员" status="暂离" statusTone="warning" fallback="B" />
    <UserInfo name="忙碌成员" status="请勿打扰" statusTone="danger" fallback="C" />
  </div>,
};

export const VisibleActions: Story = {
  name: '文字操作',
  render: () => <div className="w-[var(--rui-container-md)] max-w-full"><InteractiveUser name="Reito" description="本地协作者" fallback="R" showActionLabels /></div>,
};

export const DisabledAction: Story = {
  name: '单项操作禁用',
  render: () => <div className="w-[var(--rui-container-md)] max-w-full"><InteractiveUser name="Reito" description="更多操作当前不可用" fallback="R" actionDisabled /></div>,
};

export const LoadingAction: Story = {
  name: '单项操作忙碌',
  render: () => <div className="w-[var(--rui-container-md)] max-w-full"><InteractiveUser name="Reito" description="正在发送本地示例消息" fallback="R" actionLoading /></div>,
};

export const DisabledRow: Story = {
  name: '整行禁用',
  render: () => <div className="w-[var(--rui-container-md)] max-w-full"><InteractiveUser name="锁定成员" description="宿主已禁用全部操作" fallback="L" disabled /></div>,
};

export const CustomTrailingContent: Story = {
  name: '独立宿主内容',
  render: () => <div className="w-[var(--rui-container-md)] max-w-full"><UserInfo name="管理员" description="本地工作区" fallback="A" actions={[{ id: 'verify', label: '查看权限', icon: <ShieldCheck aria-hidden="true" />, onSelect: () => undefined }]} /><div className="mt-[var(--rui-space-2)]"><Button size="xs" variant="ghost">行外宿主操作</Button></div></div>,
};
