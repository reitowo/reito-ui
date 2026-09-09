import * as P from "@reito/ui/basic";
import { ChevronDown } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ButtonGroupDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-button-group",
  title: "基础/ButtonGroup 按钮组",
  component: P.ButtonGroup,

  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "相邻操作、分隔与共享边缘。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof P.ButtonGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互演示",
  render: () => <ButtonGroupDemo />,
};

export const Default: Story = {
  name: "方向 · 横向",
  render: () => (
    <P.ButtonGroup aria-label="文件操作">
      <P.Button variant="outline">复制</P.Button>
      <P.Button variant="outline">移动</P.Button>
    </P.ButtonGroup>
  ),
};
export const Vertical: Story = {
  name: "方向 · 纵向",
  render: () => (
    <P.ButtonGroup orientation="vertical" aria-label="文件操作">
      <P.Button variant="outline">复制</P.Button>
      <P.Button variant="outline">移动</P.Button>
    </P.ButtonGroup>
  ),
};
export const WithText: Story = {
  name: "组合 · 状态文字",
  render: () => (
    <P.ButtonGroup aria-label="分页">
      <P.Button variant="outline" disabled>
        上一页
      </P.Button>
      <P.ButtonGroupText>1 / 5</P.ButtonGroupText>
      <P.Button variant="outline">下一页</P.Button>
    </P.ButtonGroup>
  ),
};
export const WithSeparator: Story = {
  name: "组合 · 分隔操作",
  render: () => (
    <P.ButtonGroup aria-label="保存操作">
      <P.Button variant="secondary">保存</P.Button>
      <P.ButtonGroupSeparator />
      <P.Button variant="secondary" size="icon" aria-label="更多保存操作">
        <ChevronDown />
      </P.Button>
    </P.ButtonGroup>
  ),
};

type PlaygroundArgs = { orientation: "horizontal" | "vertical"; buttonVariant: "default" | "secondary" | "outline" | "ghost"; buttonSize: "xs" | "sm" | "default" | "lg"; disabled: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { orientation: "horizontal", buttonVariant: "outline", buttonSize: "default", disabled: false },
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    buttonVariant: { control: "select", options: ["default", "secondary", "outline", "ghost"], description: "内部 Button.variant", table: { category: "组合示例" } },
    buttonSize: { control: "select", options: ["xs", "sm", "default", "lg"], description: "内部 Button.size", table: { category: "组合示例" } },
    disabled: { control: "boolean", description: "内部 Button.disabled", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["orientation", "buttonVariant", "buttonSize", "disabled"] } },
  render: (args) => <P.ButtonGroup orientation={args.orientation} aria-label="文件操作"><P.Button variant={args.buttonVariant} size={args.buttonSize} disabled={args.disabled}>复制</P.Button><P.Button variant={args.buttonVariant} size={args.buttonSize} disabled={args.disabled}>移动</P.Button></P.ButtonGroup>,
};
