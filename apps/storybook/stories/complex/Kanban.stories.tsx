import type { Meta, StoryObj } from '@storybook/react-vite';
import { KanbanDemo } from '../../../../packages/ui/src/complex/kanban-demo.js';
const meta = {
  id: '复杂-kanban-看板',
  title: '复杂/Kanban 看板',
  component: KanbanDemo,
} satisfies Meta<typeof KanbanDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  name: '参数调试',
  args: { readOnly: false, loading: false, empty: false, failSave: false },
  argTypes: {
    readOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
    empty: { control: 'boolean' },
    failSave: { control: 'boolean' },
  },
  parameters: { controls: { include: ['readOnly', 'loading', 'empty', 'failSave'] } },
};
export const ReadOnly: Story = { name: '状态 · 只读', args: { readOnly: true } };
export const Loading: Story = { name: '状态 · 加载中', args: { loading: true } };
export const Empty: Story = { name: '状态 · 空内容', args: { empty: true } };
export const SaveFailure: Story = { name: '状态 · 保存失败', args: { failSave: true } };
