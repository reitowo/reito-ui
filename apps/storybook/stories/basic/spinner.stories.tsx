import { Button, Spinner } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpinnerDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-spinner",
  title: "基础/Spinner 加载指示器",
  component: SpinnerDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "加载指示与按钮组合。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof SpinnerDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
};

export const Default: Story = { name: "独立指示器", render: () => <Spinner aria-label="正在加载" /> };
export const WithLabel: Story = { name: "带状态文字", render: () => <div className="flex items-center gap-2 text-sm" role="status"><Spinner aria-hidden="true" />正在加载组件…</div> };
export const InButton: Story = { name: "按钮加载", render: () => <Button disabled aria-busy="true"><Spinner aria-hidden="true" />处理中</Button> };

export const Playground: StoryObj<{ className: 'size-3' | 'size-4' | 'size-5' | 'size-6'; 'aria-label': string }> = {
  name: "参数调试", args: { className: 'size-4', 'aria-label': '正在加载' },
  argTypes: { className: { control: 'select', options: ['size-3', 'size-4', 'size-5', 'size-6'], description: '通过共享尺寸工具类调整图标；Spinner 没有额外的 size prop。' }, 'aria-label': { control: 'text' } },
  parameters: { controls: { include: ['className', 'aria-label'] } },
  render: args => <Spinner {...args} />,
};
