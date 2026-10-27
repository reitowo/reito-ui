import type { Meta, StoryObj } from '@storybook/react-vite';
import { LeadSourcingDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-lead-sourcing',
  title: '模式/LeadSourcing 线索来源',
  component: LeadSourcingDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '来源与助手连接。' } } },
} satisfies Meta<typeof LeadSourcingDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
