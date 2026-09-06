import * as P from "@reito/ui/basic";
import { Info } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Alert",
  component: P.Alert,

  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "信息与错误提示。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof P.Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
  render: () => <AlertDemo />,
};

export const Default: Story = {
  name: "样式 / 普通提示",
  render: () => (
    <P.Alert className="max-w-xl">
      <Info />
      <P.AlertTitle>修改已保存在本地</P.AlertTitle>
      <P.AlertDescription>
        可以继续预览主题、密度和交互状态。
      </P.AlertDescription>
    </P.Alert>
  ),
};
export const Destructive: Story = {
  name: "样式 / 错误提示",
  render: () => (
    <P.Alert variant="destructive" className="max-w-xl">
      <Info />
      <P.AlertTitle>无法加载工作区</P.AlertTitle>
      <P.AlertDescription>
        这是本地错误示例，请检查目录后重试。
      </P.AlertDescription>
    </P.Alert>
  ),
};
export const TitleOnly: Story = {
  name: "内容 / 仅标题",
  render: () => (
    <P.Alert className="max-w-xl">
      <P.AlertTitle>本地草稿已保存</P.AlertTitle>
    </P.Alert>
  ),
};

type PlaygroundArgs = { variant: "default" | "destructive"; title: string; description: string; showIcon: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { variant: "default", title: "修改已保存在本地", description: "可以继续预览主题、密度和交互状态。", showIcon: true },
  argTypes: {
    variant: { control: "select", options: ["default", "destructive"] },
    title: { control: "text", description: "AlertTitle.children", table: { category: "组合示例" } },
    description: { control: "text", description: "AlertDescription.children；留空隐藏", table: { category: "组合示例" } },
    showIcon: { control: "boolean", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["variant", "title", "description", "showIcon"] } },
  render: (args) => <P.Alert variant={args.variant} className="max-w-xl">{args.showIcon && <Info />}<P.AlertTitle>{args.title}</P.AlertTitle>{args.description && <P.AlertDescription>{args.description}</P.AlertDescription>}</P.Alert>,
};
