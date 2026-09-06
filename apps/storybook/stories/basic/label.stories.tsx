import { useId } from 'react';
import { Field, Label, Input } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LabelDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Label",
  component: LabelDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "与控件显式关联的表单标签。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof LabelDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
};

function LabelField({ disabled = false, required = false }: { disabled?: boolean; required?: boolean }) { const id = useId(); return <Field className="max-w-sm" data-disabled={disabled}><Label htmlFor={id}>工作目录{required && <span aria-hidden="true"> *</span>}</Label><Input id={id} defaultValue="~/projects/reito" disabled={disabled} required={required} /></Field>; }
export const Default: Story = { name: '关联输入框', render: () => <LabelField /> };
export const Required: Story = { name: '必填标签', render: () => <LabelField required /> };
export const Disabled: Story = { name: '禁用字段标签', render: () => <LabelField disabled /> };

export const Playground: StoryObj<{ children: string; disabled: boolean; required: boolean }> = {
  name: '参数调试', args: { children: '工作目录', disabled: false, required: false },
  argTypes: { children: { control: 'text', description: 'Label.children：标签文字' }, disabled: { control: 'boolean', table: { category: '组合示例' }, description: '同时禁用关联的 Input 与 Field。' }, required: { control: 'boolean', table: { category: '组合示例' }, description: '为关联的 Input 添加必填语义与标签标记。' } },
  parameters: { controls: { include: ['children', 'disabled', 'required'] } },
  render: function Render({ children, disabled, required }) { const id = useId(); return <Field className="max-w-sm" data-disabled={disabled}><Label htmlFor={id}>{children}{required && <span aria-hidden="true"> *</span>}</Label><Input id={id} defaultValue="~/projects/reito" disabled={disabled} required={required} /></Field>; },
};
