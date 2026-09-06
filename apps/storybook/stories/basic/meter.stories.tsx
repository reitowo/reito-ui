import { Meter } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { MeterDemo } from '../../../../packages/ui/src/basic/catalog.js';

const meta = { title: '基础/Meter', component: MeterDemo, tags: ['autodocs'], parameters: { docs: { description: { component: '本地 Base UI Meter 组合，语义为有界测量值（role=meter），不是任务执行的 Progress。以标签、数值文字与说明补足颜色含义。' } } } } satisfies Meta<typeof MeterDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '存储容量', play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const meter = canvas.getByRole('meter', { name: '工作区存储' });
  await expect(meter).toHaveAttribute('aria-valuenow', '68');
  await expect(meter).toHaveAttribute('aria-valuemax', '128');
  await userEvent.click(canvas.getByRole('button', { name: '增加示例值' }));
  await waitFor(() => expect(meter).toHaveAttribute('aria-valuenow', '76'));
  await userEvent.click(canvas.getByRole('button', { name: '归零' }));
  await expect(meter).toHaveAttribute('aria-valuenow', '0');
} };
export const Warning: Story = { name: '接近容量上限', args: { state: 'warning' } };
export const Zero: Story = { name: '零值容量', args: { state: 'zero' } };
export const Quality: Story = { name: '数据质量', args: { state: 'quality' } };

export const Danger: Story = { name: '危险阈值', render: () => <Meter label="工作区存储" min={0} max={128} value={126} valueLabel="126 / 128 GB" tone="danger" description="可用容量不足，请整理文件。" className="max-w-sm" /> };

export const Playground: StoryObj<{ label: string; value: number; min: number; max: number; tone: 'default' | 'success' | 'warning' | 'danger'; description: string }> = {
  name: '参数调试', args: { label: '工作区存储', value: 68, min: 0, max: 128, tone: 'default', description: '本地容量测量示例。' },
  argTypes: { label: { control: 'text' }, value: { control: 'number' }, min: { control: 'number' }, max: { control: 'number' }, tone: { control: 'select', options: ['default', 'success', 'warning', 'danger'] }, description: { control: 'text' } },
  parameters: { controls: { include: ['label', 'value', 'min', 'max', 'tone', 'description'] } },
  render: args => <Meter {...args} className="max-w-sm" />,
};
