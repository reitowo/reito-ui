import type { Meta, StoryObj } from '@storybook/react-vite';
import { DecisionTreeDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-decision-tree',
  title: '模式/DecisionTree 决策树',
  component: DecisionTreeDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：分支后果与自写指示。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof DecisionTreeDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
