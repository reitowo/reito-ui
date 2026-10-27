import type { Meta, StoryObj } from '@storybook/react-vite';
import { AffectComboboxDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-combobox',
  title: '模式/Combobox 组合框',
  component: AffectComboboxDemo,
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
        component: '公开文档重建：多选、分组与可创建。模式层兄弟，不是 Pro 源码移植。',
      },
    },
  },
} satisfies Meta<typeof AffectComboboxDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
