import { Progress, ProgressLabel, ProgressValue } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Progress",
  component: ProgressDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "数值进度、标签与重置操作。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof ProgressDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
};

function CheckProgress({ value }: { value: number | null }) { return <Progress value={value} className="max-w-sm"><ProgressLabel>组件检查</ProgressLabel>{value !== null ? <ProgressValue /> : <span className="ml-auto text-xs text-muted-foreground">正在准备…</span>}</Progress>; }
export const Default: Story = { name: '进行中', render: () => <CheckProgress value={45} /> };
export const Empty: Story = { name: '尚未开始', render: () => <CheckProgress value={0} /> };
export const Complete: Story = { name: '已完成', render: () => <CheckProgress value={100} /> };
export const Indeterminate: Story = { name: '进度未知', render: () => <CheckProgress value={null} /> };

export const Playground: StoryObj<{ value: number; indeterminate: boolean; label: string }> = {
  name: '参数调试', args: { value: 45, indeterminate: false, label: '组件检查' },
  argTypes: { value: { control: { type: 'range', min: 0, max: 100, step: 1 } }, indeterminate: { control: 'boolean', table: { category: '组合示例' }, description: '将 Progress.value 设为 null，演示未知进度。' }, label: { control: 'text', table: { category: '组合示例' }, description: 'ProgressLabel 的 children。' } },
  parameters: { controls: { include: ['value', 'indeterminate', 'label'] } },
  render: args => <Progress value={args.indeterminate ? null : args.value} className="max-w-sm"><ProgressLabel>{args.label}</ProgressLabel>{args.indeterminate ? <span className="ml-auto text-xs text-muted-foreground">正在准备…</span> : <ProgressValue />}</Progress>,
};
