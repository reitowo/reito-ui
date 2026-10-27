import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-button',
  title: '模式/Button 按钮适配',
  component: ButtonDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: 'Affect API 覆盖 Reito Button，含加载与干净外观。' } },
  },
} satisfies Meta<typeof ButtonDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
