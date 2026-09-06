import * as P from "@reito/ui/basic";
import { Search, Inbox } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyDemo } from "../../../../packages/ui/src/basic/catalog.js";

type EmptyExampleArgs = {
  title: string;
  description: string;
  icon: "none" | "inbox" | "search";
  mediaVariant: "default" | "icon";
  border: boolean;
};

// These controls compose Empty's slots; they are not extra public Empty props.
function EmptyExample({ title, description, icon, mediaVariant, border }: EmptyExampleArgs) {
  return <P.Empty className={border ? "max-w-lg border" : "max-w-lg"}>
    <P.EmptyHeader>
      {icon !== "none" && <P.EmptyMedia variant={mediaVariant}>{icon === "search" ? <Search /> : <Inbox />}</P.EmptyMedia>}
      <P.EmptyTitle>{title}</P.EmptyTitle>
      {description && <P.EmptyDescription>{description}</P.EmptyDescription>}
    </P.EmptyHeader>
  </P.Empty>;
}

const meta = {
  title: "基础/Empty",
  component: EmptyExample,
  tags: ["autodocs"],
  args: { title: "还没有任务", description: "新建任务后会显示在这里。", icon: "none", mediaVariant: "icon", border: false },
  argTypes: {
    title: { control: "text", description: "EmptyTitle.children", table: { category: "组合示例" } },
    description: { control: "text", description: "EmptyDescription.children；留空隐藏", table: { category: "组合示例" } },
    icon: { control: "select", options: ["none", "inbox", "search"], description: "EmptyMedia 内的图标子组件", table: { category: "组合示例" } },
    mediaVariant: { control: "select", options: ["default", "icon"], description: "EmptyMedia.variant", table: { category: "子组件 props" } },
    border: { control: "boolean", description: "Empty.className 的 border 工具类", table: { category: "组合示例" } },
  },
  parameters: {
    controls: { include: ["title", "description", "icon", "mediaVariant", "border"] },
    docs: { description: { component: "可执行下一步的空状态。Controls 调整 Empty 的子组件和组合内容，Empty 本身没有 size / color 属性。所有预设使用同一 args 驱动的组合。" } },
  },
  render: (args) => <EmptyExample {...args} />,
} satisfies Meta<typeof EmptyExample>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = { name: "交互示例", render: () => <EmptyDemo />, parameters: { controls: { disable: true } } };
export const Default: Story = { name: "内容 / 纯文字", args: { title: "还没有任务", description: "新建任务后会显示在这里。", icon: "none", border: false } };
export const WithIcon: Story = { name: "内容 / 图标说明", args: { title: "收件箱为空", description: "暂时没有待处理内容。", icon: "inbox", mediaVariant: "icon", border: false } };
export const NoResults: Story = { name: "场景 / 无搜索结果", args: { title: "没有匹配的组件", description: "尝试缩短关键词或调整筛选条件。", icon: "search", mediaVariant: "icon", border: true } };
export const Playground: Story = { name: "参数调试", args: { title: "没有匹配的组件", description: "尝试缩短关键词或调整筛选条件。", icon: "search", mediaVariant: "icon", border: true } };
