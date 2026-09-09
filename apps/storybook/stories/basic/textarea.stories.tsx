import { useArgs } from "storybook/preview-api";
import { Textarea, Field, FieldError } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextareaDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-textarea",
  title: "基础/Textarea 多行输入",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "多行编辑与字数反馈。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => <TextareaDemo />,
  name: "总览对比",
};

export const Default: Story = { name: "普通多行输入", args: { 'aria-label': '任务说明', placeholder: '描述你准备完成的工作…', className: 'max-w-sm' } };
export const ReadOnly: Story = { name: "状态 · 只读", args: { 'aria-label': '只读任务说明', readOnly: true, defaultValue: '已经确认的本地任务说明。', className: 'max-w-sm' } };
export const Disabled: Story = { name: "状态 · 禁用", args: { 'aria-label': '不可编辑的说明', disabled: true, defaultValue: '已归档任务', className: 'max-w-sm' } };
export const Invalid: Story = { name: "状态 · 错误", args: { 'aria-label': '任务说明', 'aria-invalid': true, defaultValue: '任务' }, render: args => <Field data-invalid className="max-w-sm"><Textarea {...args} aria-describedby="textarea-invalid-error" /><FieldError id="textarea-invalid-error">请补充任务目标和验收条件。</FieldError></Field> };

export const Playground: Story = {
  name: "参数调试", args: { 'aria-label': '任务说明', value: '检查组件的主题、密度与交互状态。', placeholder: '描述你准备完成的工作…', disabled: false, readOnly: false, 'aria-invalid': false },
  argTypes: { value: { control: 'text' }, placeholder: { control: 'text' }, disabled: { control: 'boolean' }, readOnly: { control: 'boolean' }, 'aria-invalid': { control: 'boolean' } },
  parameters: { controls: { include: ['value', 'placeholder', 'disabled', 'readOnly', 'aria-invalid'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <Textarea {...args} onChange={event => updateArgs({ value: event.target.value })} className="max-w-sm" />; },
};
