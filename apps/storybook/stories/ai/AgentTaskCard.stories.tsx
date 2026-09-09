import { textControl, choiceControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentTaskCard } from '../../../../packages/ui/src/ai/decisions.js';
import { AgentTaskCardDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { id: "ai-agenttaskcard", title: "AI/AgentTaskCard 智能体任务", component: AgentTaskCard, args: { title: '检查工作区布局', description: '确认输入区、工具调用和预览面板的状态。', status: 'running', context: 'reito-ui / local-example', updatedLabel: '本地示例' }, decorators: [Story => <StoryFrame><Story /></StoryFrame>] } satisfies Meta<typeof AgentTaskCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: "状态 · 运行中",};
export const Pending: Story = { name: "等待开始", args: { status: 'pending' } };
export const NeedsAttention: Story = { name: "需要处理", args: { status: 'needs-attention' } };
export const Complete: Story = { name: "已完成", args: { status: 'success' } };
export const Error: Story = { name: "状态 · 失败", args: { status: 'error' } };
export const LocalActions: Story = { name: "交互 · 打开与继续任务", render: () => <AgentTaskCardDemo /> };


export const Playground: Story = {
  name: "参数调试", args: { status: 'running', title: '检查工作区布局', description: '本地任务状态示例。', context: 'reito-ui / local-example', updatedLabel: '刚刚' },
  argTypes: { status: choiceControl(['pending', 'running', 'success', 'error', 'needs-attention']), title: textControl, description: textControl, context: textControl, updatedLabel: textControl },
  parameters: { controls: { include: ['status', 'title', 'description', 'context', 'updatedLabel'] } }, render: args => <AgentTaskCard {...args} />,
};
