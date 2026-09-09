import { Skeleton } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SkeletonDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-skeleton",
  title: "基础/Skeleton 骨架屏",
  component: SkeletonDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "结构稳定的加载占位。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof SkeletonDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "组合示例",
};

export const Default: Story = { name: "文本占位", render: () => <div className="grid w-full max-w-sm gap-2" role="status" aria-label="正在加载正文"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><span className="sr-only">正在加载正文</span></div> };
export const Avatar: Story = { name: "头像占位", render: () => <div role="status" aria-label="正在加载头像"><Skeleton className="size-10 rounded-full" /><span className="sr-only">正在加载头像</span></div> };

export const Playground: StoryObj<{ shape: 'text' | 'avatar' | 'panel'; lines: number }> = {
  name: "参数调试", args: { shape: 'text', lines: 3 },
  argTypes: { shape: { control: 'select', options: ['text', 'avatar', 'panel'], table: { category: '组合示例' }, description: '通过 token-backed className 排列占位结构；不是 Skeleton 的 size prop。' }, lines: { control: { type: 'number', min: 1, max: 8 }, table: { category: '组合示例' }, description: '文本占位行数。' } },
  parameters: { controls: { include: ['shape', 'lines'] } },
  render: args => <div className="grid w-full max-w-sm gap-2" role="status" aria-label="正在加载内容">{args.shape === 'avatar' ? <Skeleton className="size-10 rounded-full" /> : args.shape === 'panel' ? <Skeleton className="h-40 w-full" /> : Array.from({ length: Math.max(1, Math.min(8, Math.floor(args.lines))) }, (_, index) => <Skeleton key={index} className={index === args.lines - 1 ? 'h-4 w-3/4' : 'h-4 w-full'} />)}<span className="sr-only">正在加载内容</span></div>,
};
