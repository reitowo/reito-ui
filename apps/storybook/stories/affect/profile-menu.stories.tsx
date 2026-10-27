import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProfileMenuDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-profile-menu',
  title: '模式/ProfileMenu 账户菜单',
  component: ProfileMenuDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '用户、动作与资料进度。' } } },
} satisfies Meta<typeof ProfileMenuDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
