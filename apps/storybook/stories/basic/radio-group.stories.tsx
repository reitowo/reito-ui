import { useArgs } from "storybook/preview-api";
import { useId } from 'react';
import { RadioGroup, RadioGroupItem, Label } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroupDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Radio Group",
  component: RadioGroupDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "互斥选项与键盘移动。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof RadioGroupDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
};

function ExecutionRadios({ disabled = false, disabledOption = false, invalid = false }: { disabled?: boolean; disabledOption?: boolean; invalid?: boolean }) {
 const id = useId();
 return <div className="grid max-w-sm gap-2"><RadioGroup aria-label="执行位置" defaultValue={invalid ? undefined : 'local'} disabled={disabled} aria-invalid={invalid}>{[{ value: 'local', label: '本地' }, { value: 'worktree', label: '隔离工作区' }].map(option => <div className="flex items-center gap-3" key={option.value}><RadioGroupItem value={option.value} id={id + option.value} disabled={disabledOption && option.value === 'worktree'} aria-invalid={invalid} /><Label htmlFor={id + option.value}>{option.label}</Label></div>)}</RadioGroup>{invalid && <p className="text-xs text-destructive" role="alert">请选择执行位置。</p>}</div>;
}
export const Default: Story = { name: '默认单选', render: () => <ExecutionRadios /> };
export const Disabled: Story = { name: '整组禁用', render: () => <ExecutionRadios disabled /> };
export const DisabledOption: Story = { name: '含禁用选项', render: () => <ExecutionRadios disabledOption /> };
export const Invalid: Story = { name: '错误', render: () => <ExecutionRadios invalid /> };

export const Playground: StoryObj<{ value: string; disabled: boolean; invalid: boolean; disabledOption: boolean }> = {
  name: '参数调试', args: { value: 'local', disabled: false, invalid: false, disabledOption: false },
  argTypes: { value: { control: 'select', options: ['local', 'worktree'] }, disabled: { control: 'boolean' }, invalid: { control: 'boolean', table: { category: '组合示例' }, description: '同步根节点和选项的 aria-invalid。' }, disabledOption: { control: 'boolean', table: { category: '组合示例' }, description: '禁用隔离工作区选项。' } },
  parameters: { controls: { include: ['value', 'disabled', 'invalid', 'disabledOption'] } },
  render: function Render(args) { const id = useId(); const [, updateArgs] = useArgs(); return <RadioGroup aria-label="执行位置" value={args.value} onValueChange={value => updateArgs({ value })} disabled={args.disabled} aria-invalid={args.invalid}>{[{ value: 'local', label: '本地' }, { value: 'worktree', label: '隔离工作区' }].map(option => <div className="flex items-center gap-3" key={option.value}><RadioGroupItem value={option.value} id={id + option.value} disabled={args.disabledOption && option.value === 'worktree'} aria-invalid={args.invalid} /><Label htmlFor={id + option.value}>{option.label}</Label></div>)}</RadioGroup>; },
};
