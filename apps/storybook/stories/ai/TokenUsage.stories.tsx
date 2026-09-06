import { textControl, numberControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TokenUsage } from '../../../../packages/ui/src/ai/decisions.js';
import { StoryFrame } from './story-frame.js';

const meta = { title: 'AI/TokenUsage', component: TokenUsage, args: { sourceLabel: '手动提供的示例数据', input: 1280, output: 346, contextUsed: 8120, contextLimit: 32000 }, decorators: [Story => <StoryFrame><Story /></StoryFrame>], parameters: { docs: { description: { component: '纯展示组件。数值由调用方提供，必须注明来源。不根据字符数、消息数或本地模拟输出伪造模型用量。缺失值显示破折号。' } } } } satisfies Meta<typeof TokenUsage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: '默认用量',};
export const NearLimit: Story = { name: '接近上下文上限', args: { contextUsed: 30800 } };
export const MissingValues: Story = { name: '缺少用量数据', args: { input: undefined, output: undefined, contextUsed: undefined, contextLimit: undefined, sourceLabel: '尚未提供用量' } };
export const ZeroUsage: Story = { name: '零用量', args: { input: 0, output: 0, contextUsed: 0 } };


export const Playground: Story = {
  name: '参数调试', args: { input: 1280, output: 346, contextUsed: 8120, contextLimit: 32000, sourceLabel: '手动提供的示例数据' },
  argTypes: { input: numberControl, output: numberControl, contextUsed: numberControl, contextLimit: numberControl, sourceLabel: textControl },
  parameters: { controls: { include: ['input', 'output', 'contextUsed', 'contextLimit', 'sourceLabel'] } }, render: args => <TokenUsage {...args} />,
};
