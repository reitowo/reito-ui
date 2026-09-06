import { useArgs } from "storybook/preview-api";
import { MultiSelect } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { MultiSelectDemo } from '../../../../packages/ui/src/basic/catalog.js';

const meta = { title: '基础/MultiSelect', component: MultiSelectDemo, tags: ['autodocs'], parameters: { docs: { description: { component: '本地多选封装，组合现有 Combobox 的 multiple、Value、Chips、Chip、ChipsInput、List 与 Item。值为 string[]；移除按钮使用有明确名称的 Base UI ChipRemove。' } } } } satisfies Meta<typeof MultiSelectDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '搜索、选择与移除', play: async ({ canvasElement }) => {
  const canvas = within(canvasElement); const body = within(canvasElement.ownerDocument.body);
  const input = canvas.getByRole('combobox', { name: '项目技术栈' });
  await userEvent.type(input, 'Type');
  await userEvent.click(await body.findByRole('option', { name: 'TypeScript' }));
  await userEvent.keyboard('{Escape}');
  await expect(canvas.getByText('已选择：react, typescript')).toBeVisible();
  await userEvent.click(canvas.getByRole('button', { name: '移除React' }));
  await waitFor(() => expect(canvas.getByText('已选择：typescript')).toBeVisible());
} };
export const Disabled: Story = { name: '禁用', args: { state: 'disabled' } };
export const Loading: Story = { name: '加载选项', args: { state: 'loading' } };
export const Empty: Story = { name: '无可选项', args: { state: 'empty' }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement); const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(canvas.getByRole('combobox', { name: '项目技术栈' }));
  await expect(await body.findByText('没有匹配的选项')).toBeVisible();
  await userEvent.keyboard('{Escape}');
} };
export const Invalid: Story = { name: '字段错误', args: { state: 'invalid' } };

export const Unselected: Story = { name: '尚未选择', render: () => <MultiSelect label="项目技术栈" options={[{ value: 'react', label: 'React' }, { value: 'typescript', label: 'TypeScript' }]} defaultValue={[]} className="max-w-sm" /> };

export const Playground: StoryObj<{ label: string; value: string[]; disabled: boolean; loading: boolean; error: string; placeholder: string }> = {
  name: '参数调试', args: { label: '项目技术栈', value: ['react'], disabled: false, loading: false, error: '', placeholder: '搜索并选择…' },
  argTypes: { label: { control: 'text' }, value: { control: 'check', options: ['react', 'typescript', 'tailwind'] }, disabled: { control: 'boolean' }, loading: { control: 'boolean' }, error: { control: 'text' }, placeholder: { control: 'text' } },
  parameters: { controls: { include: ['label', 'value', 'disabled', 'loading', 'error', 'placeholder'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <MultiSelect {...args} options={[{ value: 'react', label: 'React' }, { value: 'typescript', label: 'TypeScript' }, { value: 'tailwind', label: 'Tailwind CSS' }]} onValueChange={value => updateArgs({ value })} className="max-w-sm" />; },
};
