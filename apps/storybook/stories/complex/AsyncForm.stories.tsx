import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AsyncFormDemo } from '../../../../packages/ui/src/complex/async-form-demo.js';
import { booleanControl, choiceControl } from '../feature-controls.js';
const meta = { id: "复杂-asyncform-异步表单", title: "复杂/AsyncForm 异步表单", component: AsyncFormDemo } satisfies Meta<typeof AsyncFormDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  name: "参数调试",
  parameters: { controls: { include: ['disabled', 'validationMode', 'manualResolution', 'submitBehavior'] } },
  args: { disabled: false, validationMode: 'onBlur', manualResolution: false, submitBehavior: 'success' },
  argTypes: { disabled: booleanControl, validationMode: choiceControl(['onSubmit', 'onBlur', 'onChange', 'onTouched', 'all']), manualResolution: booleanControl, submitBehavior: choiceControl(['success', 'error', 'field-error']) },
};
export const Disabled: Story = { name: "状态 · 禁用", args: { disabled: true } };
export const ManualResponses: Story = { name: "交互 · 手动响应", args: { manualResolution: true, validationMode: 'onSubmit' }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: '校验当前值' }));
  await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('校验中'));
  await userEvent.click(canvas.getByRole('button', { name: '重置当前记录' }));
  await userEvent.click(canvas.getByRole('button', { name: '返回请求 1' }));
  await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('就绪'));
  expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
} };
export const SubmitFailure: Story = { name: "状态 · 提交失败", args: { submitBehavior: 'error' } };
export const FieldFailure: Story = { name: "状态 · 字段校验失败", args: { submitBehavior: 'field-error' } };
