import { Folder } from 'lucide-react';
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ItemDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Item",
  component: ItemDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "媒体、描述、内容与行内操作。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof ItemDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
};

function LibraryItem({ variant = 'default', size = 'default' }: { variant?: 'default' | 'outline' | 'muted'; size?: 'default' | 'sm' | 'xs' }) {
 return <Item variant={variant} size={size} className="max-w-xl"><ItemMedia variant="icon"><Folder /></ItemMedia><ItemContent><ItemTitle>个人组件库</ItemTitle><ItemDescription>基础、复杂与 AI 组件共享一个主题。</ItemDescription></ItemContent></Item>;
}
export const Default: Story = { name: '默认', render: () => <LibraryItem /> };
export const Outline: Story = { name: '描边', render: () => <LibraryItem variant="outline" /> };
export const Muted: Story = { name: '柔和背景', render: () => <LibraryItem variant="muted" /> };
export const Small: Story = { name: '小尺寸', render: () => <LibraryItem size="sm" /> };
export const ExtraSmall: Story = { name: '更小尺寸', render: () => <LibraryItem size="xs" /> };

export const Playground: StoryObj<{ variant: 'default' | 'outline' | 'muted'; size: 'default' | 'sm' | 'xs' }> = {
  name: '参数调试', args: { variant: 'default', size: 'default' },
  argTypes: { variant: { control: 'select', options: ['default', 'outline', 'muted'] }, size: { control: 'select', options: ['default', 'sm', 'xs'] } },
  parameters: { controls: { include: ['variant', 'size'] } },
  render: args => <LibraryItem {...args} />,
};
