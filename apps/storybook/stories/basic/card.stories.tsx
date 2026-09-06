import * as P from "@reito/ui/basic";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Card",
  component: CardDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "标题、内容、动作与页脚组合。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof CardDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
  render: () => <CardDemo />,
};

function WorkspaceCard({
  size = "default",
  footer = false,
}: {
  size?: "default" | "sm";
  footer?: boolean;
}) {
  return (
    <P.Card size={size} className="w-full max-w-sm">
      <P.CardHeader>
        <P.CardTitle>本地工作区</P.CardTitle>
        <P.CardDescription>共享主题与组件的示例项目。</P.CardDescription>
      </P.CardHeader>
      <P.CardContent>基础、复杂与 AI 组件保持一致。</P.CardContent>
      {footer && (
        <P.CardFooter>
          <P.Badge variant="secondary">草稿</P.Badge>
        </P.CardFooter>
      )}
    </P.Card>
  );
}
export const Default: Story = {
  name: "尺寸 / 默认",
  render: () => <WorkspaceCard />,
};
export const Small: Story = {
  name: "尺寸 / 紧凑",
  render: () => <WorkspaceCard size="sm" />,
};
export const WithFooter: Story = {
  name: "组合 / 页脚",
  render: () => <WorkspaceCard footer />,
};

type PlaygroundArgs = { size: "default" | "sm"; title: string; description: string; content: string; footer: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { size: "default", title: "本地工作区", description: "共享主题与组件的示例项目。", content: "基础、复杂与 AI 组件保持一致。", footer: false },
  argTypes: {
    size: { control: "select", options: ["default", "sm"] },
    title: { control: "text", description: "CardTitle.children", table: { category: "组合示例" } },
    description: { control: "text", description: "CardDescription.children", table: { category: "组合示例" } },
    content: { control: "text", description: "CardContent.children", table: { category: "组合示例" } },
    footer: { control: "boolean", description: "显示 CardFooter", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["size", "title", "description", "content", "footer"] } },
  render: (args) => <P.Card size={args.size} className="w-full max-w-sm"><P.CardHeader><P.CardTitle>{args.title}</P.CardTitle>{args.description && <P.CardDescription>{args.description}</P.CardDescription>}</P.CardHeader><P.CardContent>{args.content}</P.CardContent>{args.footer && <P.CardFooter><P.Badge variant="secondary">草稿</P.Badge></P.CardFooter>}</P.Card>,
};
