import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl, rangeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Reasoning } from '../../../../packages/ui/src/ai/execution.js';
import { ReasoningDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { id: "ai-reasoning", title: "AI/Reasoning 推理过程", component: Reasoning, args: { children: '这段过程说明由调用方提供。组件仅呈现内容、折叠状态和经过时间。', elapsedSeconds: 6 }, decorators: [Story => <StoryFrame><Story /></StoryFrame>] } satisfies Meta<typeof Reasoning>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: "默认折叠",};
export const Expanded: Story = { name: "展开", args: { defaultOpen: true } };
export const Running: Story = { name: "进行中", args: { status: 'running', elapsedSeconds: undefined, defaultOpen: true } };
export const Idle: Story = { name: "尚未开始", args: { status: 'idle' } };
export const LocalTimer: Story = { name: "交互 · 本地计时", render: () => <ReasoningDemo /> };


export const Playground: Story = {
  name: "参数调试", args: { open: false, status: 'complete', elapsedSeconds: 6, title: '过程说明', children: '调用方提供的本地说明。' },
  argTypes: { open: booleanControl, status: choiceControl(['idle', 'running', 'complete']), elapsedSeconds: rangeControl(0, 120), title: textControl, children: textControl },
  parameters: { controls: { include: ['open', 'status', 'elapsedSeconds', 'title', 'children'] } },
  render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <Reasoning {...args} onOpenChange={open => updateArgs({ open })} />; },
};
