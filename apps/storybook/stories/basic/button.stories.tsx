import * as P from "@reito/ui/basic";
import { Plus } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ButtonDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-button",
  title: "基础/Button 按钮",
  component: P.Button,

  tags: ["autodocs"],
  args: { variant: "default", size: "default", disabled: false, children: "保存更改" },
  argTypes: {
    variant: { control: "select", options: ["default", "secondary", "outline", "ghost", "link", "destructive"] },
    size: { control: "select", options: ["xs", "sm", "default", "lg", "icon-xs", "icon-sm", "icon", "icon-lg"] },
    disabled: { control: "boolean" },
    children: { control: "text", description: "按钮文字；图标尺寸下作为可访问名称。" },
  },
  render: ({ children, size, ...args }) => (
    <P.Button {...args} size={size} aria-label={size?.startsWith("icon") ? (typeof children === "string" ? children : args["aria-label"] ?? "添加项目") : args["aria-label"]}>
      {size?.startsWith("icon") ? <Plus /> : children}
    </P.Button>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "六种操作层级、尺寸、禁用与加载状态。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof P.Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
  render: () => <ButtonDemo />,
};

export const Default: Story = {
  name: "样式 · 主要操作",
  args: { variant: "default", children: "保存更改" },
};
export const Secondary: Story = {
  name: "样式 · 次要操作",
  args: { variant: "secondary", children: "稍后处理" },
};
export const Outline: Story = {
  name: "样式 · 描边",
  args: { variant: "outline", children: "查看详情" },
};
export const Ghost: Story = {
  name: "样式 · 轻量",
  args: { variant: "ghost", children: "更多操作" },
};
export const Link: Story = {
  name: "样式 · 链接",
  args: { variant: "link", children: "查看文档" },
};
export const Destructive: Story = {
  name: "样式 · 危险操作",
  args: { variant: "destructive", children: "移除任务" },
};
export const ExtraSmall: Story = {
  name: "尺寸 · 文字 XS",
  args: { size: "xs", children: "保存更改" },
};
export const Small: Story = {
  name: "尺寸 · 文字 SM",
  args: { size: "sm", children: "保存更改" },
};
export const DefaultSize: Story = {
  name: "尺寸 · 文字默认",
  args: { size: "default", children: "保存更改" },
};
export const Large: Story = {
  name: "尺寸 · 文字 LG",
  args: { size: "lg", children: "保存更改" },
};
export const IconExtraSmall: Story = {
  name: "尺寸 · 图标 XS",
  args: { size: "icon-xs", "aria-label": "添加项目", children: <Plus /> },
};
export const IconSmall: Story = {
  name: "尺寸 · 图标 SM",
  args: { size: "icon-sm", "aria-label": "添加项目", children: <Plus /> },
};
export const IconDefault: Story = {
  name: "尺寸 · 图标默认",
  args: { size: "icon", "aria-label": "添加项目", children: <Plus /> },
};
export const IconLarge: Story = {
  name: "尺寸 · 图标 LG",
  args: { size: "icon-lg", "aria-label": "添加项目", children: <Plus /> },
};
export const Disabled: Story = {
  name: "状态 · 禁用",
  args: { disabled: true, children: "不可用" },
};
export const Loading: Story = {
  name: "状态 · 加载中",
  args: {
    disabled: true,
    "aria-busy": true,
    children: (
      <>
        <P.Spinner aria-hidden="true" />
        保存中
      </>
    ),
  },
};

export const Playground: Story = {
  name: "参数调试",
  args: { variant: "default", size: "default", disabled: false, children: "保存更改" },
  parameters: { controls: { include: ["variant", "size", "disabled", "children"] } },
};
