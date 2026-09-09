import * as P from "@reito/ui/basic";
import { Check } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AvatarDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-avatar",
  title: "基础/Avatar 头像",
  component: P.Avatar,

  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "回退文字、尺寸与头像组。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof P.Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
  render: () => <AvatarDemo />,
};

export const Default: Story = {
  name: "尺寸 · 默认",
  args: {
    role: "img",
    "aria-label": "Reito",
    children: <P.AvatarFallback>R</P.AvatarFallback>,
  },
};
export const Small: Story = {
  name: "尺寸 · 小",
  args: {
    size: "sm",
    role: "img",
    "aria-label": "Reito",
    children: <P.AvatarFallback>R</P.AvatarFallback>,
  },
};
export const Large: Story = {
  name: "尺寸 · 大",
  args: {
    size: "lg",
    role: "img",
    "aria-label": "Reito",
    children: <P.AvatarFallback>R</P.AvatarFallback>,
  },
};
export const WithBadge: Story = {
  name: "内容 · 状态标记",
  args: {
    role: "img",
    "aria-label": "Reito，在线",
    children: (
      <>
        <P.AvatarFallback>R</P.AvatarFallback>
        <P.AvatarBadge>
          <Check />
        </P.AvatarBadge>
      </>
    ),
  },
};
export const Group: Story = {
  name: "组合 · 头像组",
  render: () => (
    <P.AvatarGroup role="group" aria-label="工作区成员">
      <P.Avatar role="img" aria-label="Reito">
        <P.AvatarFallback>R</P.AvatarFallback>
      </P.Avatar>
      <P.Avatar role="img" aria-label="Ming">
        <P.AvatarFallback>M</P.AvatarFallback>
      </P.Avatar>
      <P.AvatarGroupCount role="img" aria-label="另外 3 位成员">
        +3
      </P.AvatarGroupCount>
    </P.AvatarGroup>
  ),
};

type PlaygroundArgs = { size: "default" | "sm" | "lg"; fallback: string; label: string; showBadge: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { size: "default", fallback: "R", label: "Reito", showBadge: false },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    fallback: { control: "text", description: "AvatarFallback.children", table: { category: "组合示例" } },
    label: { control: "text", description: "Avatar 的 aria-label", table: { category: "组合示例" } },
    showBadge: { control: "boolean", description: "显示 AvatarBadge 子组件", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["size", "fallback", "label", "showBadge"] } },
  render: (args) => <P.Avatar size={args.size} role="img" aria-label={args.label}><P.AvatarFallback>{args.fallback}</P.AvatarFallback>{args.showBadge && <P.AvatarBadge><Check /></P.AvatarBadge>}</P.Avatar>,
};
