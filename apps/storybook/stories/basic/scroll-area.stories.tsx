import { ScrollArea, ScrollBar } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollAreaDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-scroll-area",
  title: "基础/ScrollArea 滚动区域",
  component: ScrollAreaDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "可滚动文件列表与细滚动条。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof ScrollAreaDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互演示",
};

export const Horizontal: Story = { name: "水平滚动", render: () => <ScrollArea className="w-72 max-w-full rounded-lg border" aria-label="工作区路径"><div className="w-max p-[var(--rui-content-padding)] font-mono text-sm">workspace / packages / components / documentation / design-language.md</div><ScrollBar orientation="horizontal" /></ScrollArea> };
export const ShortContent: Story = { name: "无需滚动的短内容", render: () => <ScrollArea className="h-48 w-72 max-w-full rounded-lg border" aria-label="文件列表"><p className="p-[var(--rui-content-padding)] text-sm">design-language.md</p></ScrollArea> };

export const Playground: StoryObj<{ orientation: 'vertical' | 'horizontal'; rowCount: number }> = {
  name: "参数调试", args: { orientation: 'vertical', rowCount: 20 },
  argTypes: { orientation: { control: 'select', options: ['vertical', 'horizontal'], table: { category: '组合示例' }, description: '内容排列与 ScrollBar.orientation 同步切换。' }, rowCount: { control: { type: 'number', min: 1, max: 50 }, table: { category: '组合示例' }, description: '用于检查滚动的本地文件数量。' } },
  parameters: { controls: { include: ['orientation', 'rowCount'] } },
  render: args => <ScrollArea className="h-48 w-72 max-w-full rounded-lg border" aria-label="文件列表"><div className={args.orientation === 'horizontal' ? 'flex w-max gap-4 p-[var(--rui-content-padding)] text-sm' : 'grid gap-2 p-[var(--rui-content-padding)] text-sm'}>{Array.from({ length: Math.max(1, Math.min(50, Math.floor(args.rowCount))) }, (_, index) => <p key={index}>component-{index + 1}.tsx</p>)}</div><ScrollBar orientation={args.orientation} /></ScrollArea>,
};
