import { useArgs } from "storybook/preview-api";
import { Button, Select, SelectInput, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '../../../../packages/ui/src/basic.js';
import { useRef, useState } from 'react';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { SelectDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-select",
  title: "基础/Select 选择器",
  component: SelectDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "产品界面的默认单选组件，菜单默认从触发器下方展开并左对齐，空间不足时自动避让。需要已选项覆盖触发器的原生菜单风格时，可显式设置 alignItemWithTrigger。支持可控单选、分组、禁用选项和键盘导航。",
      },
    },
  },
} satisfies Meta<typeof SelectDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole("combobox", { name: "选择执行位置" }),
    );
    const option = await body.findByRole("option", { name: "隔离工作区" });
    await userEvent.click(option);
    await expect(canvas.getByText("已选择：worktree")).toBeVisible();
    await expect(
      canvas.getByRole("combobox", { name: "禁用选择器" }),
    ).toBeDisabled();
  },
};

const executionOptions = [{ value: 'local', label: '本地工作区' }, { value: 'worktree', label: '隔离工作区' }, { value: 'cloud', label: '云端' }];
function ExecutionSelect({ size = 'default', disabled = false, placeholder = false, invalid = false, disabledOption = false }: { size?: 'sm' | 'default'; disabled?: boolean; placeholder?: boolean; invalid?: boolean; disabledOption?: boolean }) {
 return <Select items={executionOptions} defaultValue={placeholder ? null : 'local'} disabled={disabled}><SelectTrigger aria-label="选择执行位置" aria-invalid={invalid} size={size} className="w-60"><SelectValue placeholder="选择位置" /></SelectTrigger><SelectContent><SelectGroup><SelectLabel>执行位置</SelectLabel>{executionOptions.map(option => <SelectItem key={option.value} value={option.value} disabled={disabledOption && option.value === 'cloud'}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select>;
}
export const Default: Story = { name: "默认示例", render: () => <ExecutionSelect /> };
export const Placeholder: Story = { name: "未选择", render: () => <ExecutionSelect placeholder /> };
export const Small: Story = { name: "小尺寸", render: () => <ExecutionSelect size="sm" /> };
export const Disabled: Story = { name: "状态 · 禁用", render: () => <ExecutionSelect disabled /> };
export const DisabledOption: Story = { name: "含禁用选项", render: () => <ExecutionSelect disabledOption /> };
export const Invalid: Story = { name: "状态 · 错误", render: () => <div className="grid gap-2"><ExecutionSelect invalid /><p className="text-xs text-destructive" role="alert">所选位置已失效，请重新选择。</p></div> };

export const Input: Story = {
  name: "应用单选 · SelectInput",
  render: () => <SelectInput aria-label="界面密度" defaultValue="compact" options={[{ value: 'compact', label: '紧凑' }, { value: 'comfortable', label: '舒适' }, { value: 'unavailable', label: '暂不可用', disabled: true }]} />,
};

export const InputStates: Story = {
  name: "应用单选 · 未选择与禁用",
  render: () => <div className="grid gap-2">
    <SelectInput aria-label="未选择位置" value={null} options={executionOptions} placeholder="选择位置" />
    <SelectInput aria-label="禁用位置" value="local" disabled options={executionOptions} />
    <SelectInput aria-label="无可用位置" value={null} disabled options={[]} placeholder="暂无可用选项" />
    <SelectInput aria-label="无效位置" value={null} aria-invalid options={executionOptions} />
  </div>,
};

export const NumericForm: Story = {
  name: "应用单选 · 数值与表单",
  render: function NumericFormExample() {
    const [size, setSize] = useState(10);
    const [receipt, setReceipt] = useState('尚未提交');
    const trigger = useRef<HTMLButtonElement>(null);
    return <form className="grid gap-2" onSubmit={event => { event.preventDefault(); setReceipt(String(new FormData(event.currentTarget).get('pageSize'))); }}>
      <label htmlFor="select-input-page-size">每页记录数</label>
      <SelectInput ref={trigger} id="select-input-page-size" name="pageSize" required value={size} onValueChange={setSize}
        options={[{ value: 10, label: '10 条' }, { value: 20, label: '20 条' }, { value: 50, label: '50 条', disabled: true }]} />
      <Button type="button" onClick={() => trigger.current?.focus()}>定位选择器</Button>
      <Button type="submit">提交示例</Button>
      <output aria-label="当前数值">{typeof size}:{size}</output>
      <output aria-label="表单结果">{receipt}</output>
    </form>;
  },
};

export const Playground: StoryObj<{ value: string | null; size: 'default' | 'sm'; disabled: boolean; invalid: boolean; placeholder: string }> = {
  name: "参数调试", args: { value: 'local', size: 'default', disabled: false, invalid: false, placeholder: '选择位置' },
  argTypes: { value: { control: 'select', options: [null, 'local', 'worktree', 'cloud'] }, size: { control: 'select', options: ['default', 'sm'], table: { category: 'SelectTrigger' } }, disabled: { control: 'boolean' }, invalid: { control: 'boolean', table: { category: '组合示例' }, description: '映射 SelectTrigger 的 aria-invalid。' }, placeholder: { control: 'text', table: { category: 'SelectValue' } } },
  parameters: { controls: { include: ['value', 'size', 'disabled', 'invalid', 'placeholder'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <SelectInput options={executionOptions} value={args.value} onValueChange={value => updateArgs({ value })} disabled={args.disabled} aria-label="选择执行位置" aria-invalid={args.invalid} size={args.size} className="w-60" placeholder={args.placeholder} />; },
};
