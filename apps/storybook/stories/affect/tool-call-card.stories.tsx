import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToolCallCardDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-tool-call-card',
  title: '模式/ToolCallCard 工具调用卡',
  component: ToolCallCardDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '参数、结果、重试与分组。' } } },
} satisfies Meta<typeof ToolCallCardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
