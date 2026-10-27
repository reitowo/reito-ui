import type { Meta, StoryObj } from '@storybook/react-vite';
import { DecisionInboxDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-decision-inbox',
  title: '模式/DecisionInbox 决策收件箱',
  component: DecisionInboxDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '两项快速回答，完成后离开列表。' } } },
} satisfies Meta<typeof DecisionInboxDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
