import type { Meta, StoryObj } from '@storybook/react-vite';
import { OtpInputDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-otp-input',
  title: '模式/OtpInput 验证码输入',
  component: OtpInputDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '复用 InputOTP，带状态与重发。' } } },
} satisfies Meta<typeof OtpInputDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
