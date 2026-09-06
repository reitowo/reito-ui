import * as P from "@reito/ui/basic";
import { Check } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BadgeDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Badge",
  component: P.Badge,

  tags: ["autodocs"],
  args: { variant: "default", children: "已发布" },
  argTypes: {
    variant: { control: "select", options: ["default", "secondary", "outline", "destructive", "ghost", "link"] },
    children: { control: "text", description: "标签内容；图标组合预设仍保留原始 JSX。" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "轻量标签、状态与图标组合。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof P.Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
  render: () => <BadgeDemo />,
};

export const Default: Story = {
  name: "样式 / 默认",
  args: { children: "已发布" },
};
export const Secondary: Story = {
  name: "样式 / 次要",
  args: { variant: "secondary", children: "草稿" },
};
export const Outline: Story = {
  name: "样式 / 描边",
  args: { variant: "outline", children: "TypeScript" },
};
export const Destructive: Story = {
  name: "样式 / 失败",
  args: { variant: "destructive", children: "失败" },
};
export const Ghost: Story = {
  name: "样式 / 轻量",
  args: { variant: "ghost", children: "本地" },
};
export const Link: Story = {
  name: "样式 / 链接",
  args: {
    variant: "link",
    render: (
      <a href="#badge-docs" onClick={(event) => event.preventDefault()} />
    ),
    children: "查看文档",
  },
};
export const WithIcon: Story = {
  name: "内容 / 图标标签",
  args: {
    variant: "secondary",
    children: (
      <>
        <Check />
        已完成
      </>
    ),
  },
};

export const Playground: Story = {
  name: "参数调试",
  args: { variant: "default", children: "已发布" },
  parameters: { controls: { include: ["variant", "children"] } },
};
