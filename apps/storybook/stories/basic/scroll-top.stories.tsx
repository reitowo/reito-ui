import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokenMetrics } from '@reito/tokens/metrics';
import { ScrollTopDemo, WindowScrollTopDemo } from '../../../../packages/ui/src/basic/scroll-top-demo';
const meta = { id: "基础-scrolltop",
  title: "基础/ScrollTop 返回顶部", component: ScrollTopDemo,
  args: { threshold: tokenMetrics['container-xs'], behavior: 'smooth', disabled: false, short: false },
  argTypes: { threshold: { control: 'number' }, behavior: { control: 'select', options: ['smooth', 'instant', 'auto'] }, disabled: { control: 'boolean' }, short: { control: 'boolean' } },
} satisfies Meta<typeof ScrollTopDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { name: "参数调试",};
export const Instant: Story = { name: "行为 · 即时滚动", args: { behavior: 'instant' } };
export const Disabled: Story = { name: "状态 · 禁用", args: { disabled: true } };
export const ShortContent: Story = { name: "内容 · 无需滚动", args: { short: true } };
export const IndependentPanels: Story = { name: "布局 · 独立面板", render: () => <div className="grid gap-4"><ScrollTopDemo /><ScrollTopDemo /></div> };
export const WindowTarget: Story = { name: "目标 · 页面窗口", render: () => <WindowScrollTopDemo /> };
