import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from '../../../../packages/ui/src/primitives/input.js';
import { InlineEdit, type InlineEditKind } from '../../../../packages/ui/src/complex/inline-edit.js';
import { InlineEditDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, choiceControl, numberControl, textControl } from '../feature-controls.js';

const meta = {
  title: '复杂/InlineEdit 行内编辑',
  component: InlineEdit,
  args: { label: '工作区名称', value: 'Graphite 工作区', onValueChange: () => undefined },
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '短文本与数字的显示/编辑事务。打开后聚焦编辑器；校验或异步保存失败时保留草稿；保存、取消与 Escape 都有明确焦点去向。显示和编辑内容可由宿主替换。' } } },
} satisfies Meta<typeof InlineEdit>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  label: string; value: string; kind: InlineEditKind; editing: boolean; disabled: boolean; readOnly: boolean;
  required: boolean; min: number; max: number; saveBehavior: 'success' | 'error'; customDisplay: boolean; receipt: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { label: '工作区名称', value: 'Graphite 工作区', kind: 'text', editing: false, disabled: false, readOnly: false, required: true, min: 1, max: 365, saveBehavior: 'success', customDisplay: false, receipt: '等待编辑。' },
  argTypes: {
    label: textControl, value: textControl, kind: choiceControl(['text', 'number']), editing: booleanControl,
    disabled: booleanControl, readOnly: booleanControl, required: booleanControl, min: numberControl, max: numberControl,
    saveBehavior: choiceControl(['success', 'error']), customDisplay: booleanControl, receipt: { control: false },
  },
  parameters: { controls: { include: ['label', 'value', 'kind', 'editing', 'disabled', 'readOnly', 'required', 'min', 'max', 'saveBehavior', 'customDisplay'] } },
  render: function PlaygroundRender(args) {
    const [, update] = useArgs<PlaygroundArgs>();
    const parsed = args.kind === 'number' ? Number(args.value) || 0 : args.value;
    return <div className="grid gap-[var(--rui-content-gap-sm)]">
      <InlineEdit {...args} value={parsed} onEditingChange={editing => update({ editing })} onValueChange={value => update({ value: String(value), receipt: `已保存：${String(value)}` })} onSubmit={async () => { await new Promise(resolve => setTimeout(resolve, 120)); if (args.saveBehavior === 'error') throw new Error('本地保存模拟失败，请重试。'); }} renderDisplay={args.customDisplay ? value => <span className="font-mono">workspace/{String(value)}</span> : undefined} />
      <p role="status" className="text-xs text-muted-foreground">{args.receipt}</p>
    </div>;
  },
};

export const Default: Story = { name: '默认本地示例', render: () => <InlineEditDemo /> };
export const NumberValue: Story = { name: '数字范围', args: { label: '保留天数', value: 30, kind: 'number', min: 1, max: 365, defaultEditing: true } };
export const RequiredError: Story = { name: '必填校验', args: { label: '工作区名称', value: '', required: true, defaultEditing: true } };
export const AsyncFailure: Story = { name: '异步失败保留草稿', args: { defaultEditing: true, onSubmit: async () => { await new Promise(resolve => setTimeout(resolve, 120)); throw new Error('名称已被本地记录使用。'); } } };
export const AsyncPending: Story = { name: '异步保存中可取消', args: { defaultEditing: true, onSubmit: () => new Promise<void>(() => undefined) }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: '保存' })); await expect(canvas.getByRole('button', { name: '正在保存…' })).toBeDisabled(); await expect(canvas.getByRole('button', { name: '取消' })).toBeEnabled(); } };
export const Disabled: Story = { name: '禁用', args: { disabled: true } };
export const ReadOnly: Story = { name: '只读显示', args: { readOnly: true } };
export const EmptyValue: Story = { name: '空值占位', args: { value: '', emptyLabel: '尚未命名' } };
export const CustomDisplay: Story = { name: '自定义显示槽', args: { renderDisplay: value => <span className="font-mono">workspace/{String(value)}</span> } };
export const CustomEditor: Story = { name: '自定义编辑槽', args: { defaultEditing: true, renderEditor: ({ draft, onDraftChange, inputProps }) => <div className="flex items-center gap-[var(--rui-space-1)]"><span className="text-xs text-muted-foreground">workspace/</span><Input {...inputProps} value={draft} onChange={event => onDraftChange(event.target.value)} /></div> } };
export const KeyboardFlow: Story = {
  name: '键盘提交与焦点恢复', render: () => <InlineEditDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const edit = canvas.getByRole('button', { name: '编辑工作区名称' });
    await userEvent.click(edit);
    const input = canvas.getByRole('textbox', { name: '工作区名称' });
    await expect(input).toHaveFocus();
    await userEvent.clear(input); await userEvent.type(input, '本地工作区{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('当前名称：本地工作区');
    await expect(canvas.getByRole('button', { name: '编辑工作区名称' })).toHaveFocus();
  },
};
