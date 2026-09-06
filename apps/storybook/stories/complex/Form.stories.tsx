import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { FormDemo, FormArrayDemo, FormControlsDemo } from '../../../../packages/ui/src/complex/form-demo.js';
import { booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import { DynamicFormDemo } from '../../../../packages/ui/src/complex/dynamic-form-demo.js';

const meta = {
  title: '复杂/Form 表单管理', component: FormDemo,
  parameters: { docs: { description: { component: 'Form 复用共享 Field 与 React Hook Form，支持 Standard Schema、跨字段与异步校验、提交互斥、草稿保留和 reset。FormField 用 render 明确连接输入的 ref、值、事件与可访问属性。所有保存均为本地演示。' } } },
} satisfies Meta<typeof FormDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const DynamicPlayground: StoryObj<typeof DynamicFormDemo> = {
  name: '动态条件表单参数调试', render: args => <DynamicFormDemo {...args} />,
  args: { disabled: false, initialMode: 'personal', initialNotifications: false, hiddenValuePolicy: 'retain', submitBehavior: 'success' },
  argTypes: { disabled: booleanControl, initialMode: choiceControl(['personal', 'team']), initialNotifications: booleanControl, hiddenValuePolicy: choiceControl(['retain', 'discard']), submitBehavior: choiceControl(['success', 'error']) },
  parameters: { controls: { include: ['disabled', 'initialMode', 'initialNotifications', 'hiddenValuePolicy', 'submitBehavior'] } },
};
export const DynamicTeam: StoryObj<typeof DynamicFormDemo> = { ...DynamicPlayground, name: '团队条件字段', args: { ...DynamicPlayground.args, initialMode: 'team', initialNotifications: true } };
export const DynamicDiscard: StoryObj<typeof DynamicFormDemo> = { ...DynamicPlayground, name: '隐藏时清除', args: { ...DynamicPlayground.args, hiddenValuePolicy: 'discard' } };
export const DynamicDisabled: StoryObj<typeof DynamicFormDemo> = { ...DynamicPlayground, name: '动态表单禁用', args: { ...DynamicPlayground.args, disabled: true } };
export const DynamicFailure: StoryObj<typeof DynamicFormDemo> = { ...DynamicPlayground, name: '动态表单保存失败', args: { ...DynamicPlayground.args, submitBehavior: 'error' } };

export const Playground: Story = {
  name: '参数调试',
  args: { disabled: false, validationMode: 'onBlur', showDescriptions: true, submitBehavior: 'success', showScenarioControl: false },
  argTypes: {
    disabled: booleanControl,
    validationMode: recipeControl(choiceControl(['onSubmit', 'onBlur', 'onChange', 'onTouched', 'all']), 'useForm({mode})；可直接改变校验触发时机。'),
    showDescriptions: recipeControl(booleanControl, '切换 FormField.description。'),
    submitBehavior: recipeControl(choiceControl(['success', 'error', 'field-error']), '改变本地 onSubmit 的结果：成功、抛错或 setError。'),
    showScenarioControl: { control: false, table: { disable: true } },
  },
  parameters: { controls: { include: ['disabled', 'validationMode', 'showDescriptions', 'submitBehavior'] } },
};
export const Default: Story = { name: '工作区设置' };
export const Disabled: Story = { name: '禁用', args: { disabled: true } };
export const WithoutDescriptions: Story = { name: '紧凑字段', args: { showDescriptions: false } };
export const SubmitFailure: Story = {
  name: '保存失败保留草稿', args: { submitBehavior: 'error', showScenarioControl: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '保存设置' }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent('本地保存失败'));
    expect(canvas.getByRole('textbox', { name: '工作区名称' })).toHaveValue('Graphite 工作区');
  },
};
export const FieldFailure: Story = {
  name: '服务端字段错误', args: { submitBehavior: 'field-error', showScenarioControl: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '保存设置' }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent('邮箱暂不可用'));
    await waitFor(() => expect(canvas.getByRole('textbox', { name: '通知邮箱' })).toHaveFocus());
  },
};
export const Validation: Story = {
  name: '交互场景：校验和重置',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole('textbox', { name: '工作区名称' });
    await userEvent.clear(name);
    await userEvent.click(canvas.getByRole('button', { name: '保存设置' }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent('名称至少需要 2 个字符'));
    await waitFor(() => expect(name).toHaveFocus());
    await userEvent.click(canvas.getByRole('button', { name: '重置' }));
    expect(name).toHaveValue('Graphite 工作区');
    await waitFor(() => expect(canvas.queryByRole('alert')).not.toBeInTheDocument());
  },
};
export const AsyncValidation: Story = {
  name: '异步名称校验',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole('textbox', { name: '工作区名称' });
    await userEvent.clear(name); await userEvent.type(name, '已占用'); await userEvent.tab();
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent('名称已被占用'));
  },
};
export const ArrayPlayground: StoryObj<typeof FormArrayDemo> = {
  name: '嵌套与数组参数调试', render: args => <FormArrayDemo {...args} />,
  args: { disabled: false, readOnly: false, initialCount: 1, showFieldState: false, validationMode: 'onSubmit' },
  argTypes: { disabled: booleanControl, readOnly: booleanControl, initialCount: { control: { type: 'number', min: 0, max: 5 } }, showFieldState: booleanControl, validationMode: choiceControl(['onSubmit', 'onBlur', 'onChange', 'onTouched', 'all']) },
  parameters: { controls: { include: ['disabled', 'readOnly', 'initialCount', 'showFieldState', 'validationMode'] } },
};
export const ArrayEmpty: StoryObj<typeof FormArrayDemo> = { ...ArrayPlayground, name: '数组空态', args: { ...ArrayPlayground.args, initialCount: 0 } };
export const ArrayReadOnly: StoryObj<typeof FormArrayDemo> = { ...ArrayPlayground, name: '数组只读', args: { ...ArrayPlayground.args, readOnly: true } };
export const ArrayDisabled: StoryObj<typeof FormArrayDemo> = { ...ArrayPlayground, name: '数组禁用', args: { ...ArrayPlayground.args, disabled: true } };
export const NestedAndArray: StoryObj<typeof FormArrayDemo> = {
  ...ArrayPlayground, name: '交互：数组重复校验与移动',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '添加联系人' }));
    const second = canvas.getByRole('textbox', { name: '联系人 2 邮箱' });
    await userEvent.type(second, 'reito@example.com');
    await userEvent.click(canvas.getByRole('button', { name: '保存联系人' }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent('联系人邮箱不能重复'));
    expect(canvas.getByRole('status')).not.toHaveTextContent('已保存');
    await userEvent.clear(second); await userEvent.type(second, 'lin@example.com');
    await userEvent.click(canvas.getByRole('button', { name: '上移联系人 2' }));
    expect(canvas.getByRole('textbox', { name: '联系人 1 邮箱' })).toHaveValue('lin@example.com');
    await userEvent.click(canvas.getByRole('button', { name: '保存联系人' }));
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('已保存 2 个联系人'));
  },
};
export const ControlsAndTransform: Story = {
  name: '选择器、开关与值转换', render: () => <FormControlsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '保存归档' }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent('请选择权限'));
    const select = canvas.getByRole('combobox', { name: '访问权限' });
    await waitFor(() => expect(select).toHaveFocus());
    await userEvent.click(select);
    await userEvent.click(within(canvasElement.ownerDocument.body).getByRole('option', { name: '可编辑' }));
    await userEvent.click(canvas.getByRole('switch', { name: '启用归档' }));
    await userEvent.click(canvas.getByRole('button', { name: '保存归档' }));
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('editor · 保留 30 天（number）· 停用'));
  },
};
