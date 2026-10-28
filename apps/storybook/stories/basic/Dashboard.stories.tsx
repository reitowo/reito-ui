import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardDemo } from '../../../../packages/ui/src/basic/composition-demo.js';

const meta = {
  id: '基础-dashboard',
  title: '基础/Dashboard 工作台区域',
  component: DashboardDemo,
  tags: ['autodocs'],
  args: { bounded: false },
  argTypes: {
    bounded: {
      control: 'boolean',
      description: '在桌面中使用主题定义的窄容器，验证实际可用宽度。',
    },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DashboardDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: '完整导航与页面' };
export const Bounded: Story = { name: '桌面内窄容器', args: { bounded: true } };
