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
    docs: {
      description: {
        component:
          'Affect Button 按公开 MIT registry CSS 实现表面语言（32/40/48、软圆角、渐变主按钮、浅底危险），走 --rui-* 令牌，不是 Reito Button 别名。',
      },
    },
  },
} satisfies Meta<typeof ButtonDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
