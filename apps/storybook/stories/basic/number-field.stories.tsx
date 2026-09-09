import { useArgs } from "storybook/preview-api";
import { NumberField } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { NumberFieldDemo } from '../../../../packages/ui/src/basic/catalog.js';

const meta = { id: "基础-numberfield", title: "基础/NumberField 数字输入", component: NumberFieldDemo, tags: ['autodocs'], parameters: { docs: { description: { component: '本地 Base UI NumberField 组合，使用公共 Button、Label 与语义输入样式。Group 仅在整个字段 disabled 时降低权重。保留 number|null、locale/format、min/max/step 和 onValueCommitted；不另造数字解析或键盘步进。' } } } } satisfies Meta<typeof NumberFieldDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "步进与边界", play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: '增加并发任务数' }));
  await waitFor(() => expect(canvas.getByText('当前数值：3')).toBeVisible());
  const input = canvas.getByRole('textbox', { name: '并发任务数' });
  await userEvent.click(input); await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => expect(canvas.getByText('当前数值：2')).toBeVisible());
  await userEvent.clear(input); await userEvent.type(input, '20'); await userEvent.tab();
  await waitFor(() => expect(canvas.getByText('当前数值：8')).toBeVisible());
  await expect(canvas.getByRole('button', { name: '增加并发任务数' })).toBeDisabled();
} };
export const Currency: Story = { name: "本地化金额", args: { state: 'currency' } };
export const Disabled: Story = { name: "状态 · 禁用", render: () => <NumberField label="并发任务数" defaultValue={2} min={1} max={8} disabled className="max-w-sm" /> };
export const Invalid: Story = { name: "错误说明", args: { state: 'invalid' } };
export const Empty: Story = { name: "可空数值", args: { state: 'empty' } };

export const ReadOnly: Story = { name: "状态 · 只读", render: () => <NumberField label="只读配额" value={8} readOnly className="max-w-sm" /> };

export const Playground: StoryObj<{ label: string; value: number | null; min: number; max: number; step: number; disabled: boolean; readOnly: boolean; error: string }> = {
  name: "参数调试", args: { label: '并发任务数', value: 2, min: 1, max: 8, step: 1, disabled: false, readOnly: false, error: '' },
  argTypes: { label: { control: 'text' }, value: { control: 'number' }, min: { control: 'number' }, max: { control: 'number' }, step: { control: { type: 'number', min: 1 } }, disabled: { control: 'boolean' }, readOnly: { control: 'boolean' }, error: { control: 'text' } },
  parameters: { controls: { include: ['label', 'value', 'min', 'max', 'step', 'disabled', 'readOnly', 'error'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <NumberField {...args} onValueChange={value => updateArgs({ value })} className="max-w-sm" />; },
};
