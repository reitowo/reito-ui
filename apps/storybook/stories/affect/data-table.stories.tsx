import type { Meta, StoryObj } from '@storybook/react-vite';
import { AffectDataTableDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-data-table',
  title: '模式/DataTable 数据表',
  component: AffectDataTableDemo,
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
        component: '公开文档重建：勾选、排序与格内编辑。模式层兄弟，不是 Pro 源码移植。',
      },
    },
  },
} satisfies Meta<typeof AffectDataTableDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
