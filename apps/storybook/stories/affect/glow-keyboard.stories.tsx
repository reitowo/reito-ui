import type { Meta, StoryObj } from '@storybook/react-vite';
import { GlowKeyboardDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-glow-keyboard',
  title: '模式/GlowKeyboard 光键盘',
  component: GlowKeyboardDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '示例输入自打字，聚焦即停。' } } },
} satisfies Meta<typeof GlowKeyboardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
