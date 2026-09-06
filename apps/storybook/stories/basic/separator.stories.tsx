import { Separator } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SeparatorDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Separator",
  component: SeparatorDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "水平与垂直分隔。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof SeparatorDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
};

export const Horizontal: Story = { name: '水平', render: () => <div className="grid max-w-sm gap-3 text-sm"><span>组件库</span><Separator /><span>基础层</span></div> };
export const Vertical: Story = { name: '垂直', render: () => <div className="flex h-6 items-center gap-3 text-sm"><span>文档</span><Separator orientation="vertical" /><span>示例</span></div> };

export const Playground: StoryObj<{ orientation: 'horizontal' | 'vertical' }> = {
  name: '参数调试', args: { orientation: 'horizontal' },
  argTypes: { orientation: { control: 'select', options: ['horizontal', 'vertical'] } },
  parameters: { controls: { include: ['orientation'] } },
  render: args => <div className={args.orientation === 'vertical' ? 'flex h-12 items-center gap-3 text-sm' : 'grid max-w-sm gap-3 text-sm'}><span>组件库</span><Separator orientation={args.orientation} /><span>基础层</span></div>,
};
