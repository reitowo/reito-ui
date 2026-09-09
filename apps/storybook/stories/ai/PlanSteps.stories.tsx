import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlanSteps } from '../../../../packages/ui/src/ai/execution.js';
import { PlanStepsDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { id: "ai-plansteps", title: "AI/PlanSteps 计划步骤", component: PlanSteps, args: { steps: [{ id: 'read', title: '检查共享令牌', status: 'success' }, { id: 'build', title: '组合组件', status: 'running' }, { id: 'test', title: '验证状态', status: 'pending' }] }, decorators: [Story => <StoryFrame><Story /></StoryFrame>] } satisfies Meta<typeof PlanSteps>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: "计划进度场景",};
export const Selectable: Story = { name: "交互 · 选择步骤", render: () => <PlanStepsDemo /> };
export const Error: Story = { name: "状态 · 失败", args: { steps: [{ id: 'check', title: '检查组件', description: '示例错误：需要补充一个可访问名称。', status: 'error' }] } };
export const Complete: Story = { name: "已完成", args: { steps: [{ id: 'check', title: '检查组件', status: 'success' }] } };
export const Empty: Story = { name: "空计划", args: { steps: [] } };

export const Default: Story = { name: "等待开始", args: { steps: [{ id: 'read', title: '检查共享令牌', status: 'pending' }] } };
export const Running: Story = { name: "进行中", args: { steps: [{ id: 'read', title: '检查共享令牌', description: '正在检查默认主题和紧凑密度。', status: 'running' }] } };

type PlaygroundArgs = { title: string; stepTitle: string; stepDescription: string; stepStatus: 'pending' | 'running' | 'success' | 'error'; empty: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: "参数调试", args: { title: '执行计划', stepTitle: '检查共享令牌', stepDescription: '本地计划步骤示例。', stepStatus: 'running', empty: false },
 argTypes: { title: textControl, stepTitle: recipeControl(textControl, 'steps[0].title'), stepDescription: recipeControl(textControl, 'steps[0].description'), stepStatus: recipeControl(choiceControl(['pending', 'running', 'success', 'error']), 'steps[0].status'), empty: recipeControl(booleanControl, '传入空 steps。') },
 parameters: { controls: { include: ['stepStatus', 'title', 'stepTitle', 'stepDescription', 'empty'] } },
 render: args => <PlanSteps title={args.title} steps={args.empty ? [] : [{ id: 'example', title: args.stepTitle, description: args.stepDescription, status: args.stepStatus }]} />,
};
