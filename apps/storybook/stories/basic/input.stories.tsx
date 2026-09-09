import { useArgs } from "storybook/preview-api";
import { Input, Field, FieldError } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { InputDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-input",
  title: "基础/Input 输入框",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "文本输入、中文、只读、错误与禁用。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => <InputDemo />,
  name: "总览对比",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("textbox", { name: "项目名称" });
    await userEvent.type(field, "我的组件库");
    await expect(field).toHaveValue("我的组件库");
    await expect(
      canvas.getByRole("textbox", { name: "无效项目名称" }),
    ).toHaveAttribute("aria-invalid", "true");
    await expect(
      canvas.getByRole("textbox", { name: "禁用输入" }),
    ).toBeDisabled();
  },
};

export const Default: Story = { name: "普通输入", args: { 'aria-label': '项目名称', placeholder: '例如：个人工作台', className: 'max-w-sm' } };
export const ReadOnly: Story = { name: "状态 · 只读", args: { 'aria-label': '只读项目编号', readOnly: true, value: 'RUI-003', className: 'max-w-sm' } };
export const Invalid: Story = { name: "状态 · 错误", args: { 'aria-label': '项目名称', 'aria-invalid': true, defaultValue: '已有同名项目' }, render: args => <Field data-invalid className="max-w-sm"><Input {...args} aria-describedby="input-invalid-error" /><FieldError id="input-invalid-error">已有同名项目，请换一个名称。</FieldError></Field> };
export const Disabled: Story = { name: "状态 · 禁用", args: { 'aria-label': '禁用输入', disabled: true, placeholder: '不可编辑', className: 'max-w-sm' } };
export const Password: Story = { name: "密码输入", args: { 'aria-label': '本地示例密码', type: 'password', defaultValue: 'local-example', className: 'max-w-sm' } };
export const File: Story = { name: "文件选择", args: { 'aria-label': '选择本地文件', type: 'file', className: 'max-w-sm' } };

export const Playground: Story = {
  name: "参数调试",
  args: { 'aria-label': '项目名称', value: '个人工作台', placeholder: '输入项目名称', type: 'text', disabled: false, readOnly: false, 'aria-invalid': false },
  argTypes: { value: { control: 'text' }, placeholder: { control: 'text' }, type: { control: 'select', options: ['text', 'password', 'email', 'search', 'url', 'tel'] }, disabled: { control: 'boolean' }, readOnly: { control: 'boolean' }, 'aria-invalid': { control: 'boolean' } },
  parameters: { controls: { include: ['value', 'placeholder', 'type', 'disabled', 'readOnly', 'aria-invalid'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <Input {...args} onChange={event => updateArgs({ value: event.target.value })} className="max-w-sm" />; },
};
