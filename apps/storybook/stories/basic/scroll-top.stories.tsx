import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokenMetrics } from '@reito/tokens/metrics';
import { ScrollTopDemo, WindowScrollTopDemo } from '../../../../packages/ui/src/basic/scroll-top-demo';
const meta = {
  title: '基础/ScrollTop', component: ScrollTopDemo,
  args: { threshold: tokenMetrics['container-xs'], behavior: 'smooth', disabled: false, short: false },
  argTypes: { threshold: { control: 'number' }, behavior: { control: 'select', options: ['smooth', 'instant', 'auto'] }, disabled: { control: 'boolean' }, short: { control: 'boolean' } },
} satisfies Meta<typeof ScrollTopDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Instant: Story = { args: { behavior: 'instant' } };
export const Disabled: Story = { args: { disabled: true } };
export const ShortContent: Story = { args: { short: true } };
export const IndependentPanels: Story = { render: () => <div className="grid gap-4"><ScrollTopDemo /><ScrollTopDemo /></div> };
export const WindowTarget: Story = { render: () => <WindowScrollTopDemo /> };
