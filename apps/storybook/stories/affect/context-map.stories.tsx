import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContextMapDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-context-map',
  title: '模式/ContextMap 上下文地图',
  component: ContextMapDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：窗口占用与压缩前后。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof ContextMapDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
