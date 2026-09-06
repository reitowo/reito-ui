import { useArgs } from "storybook/preview-api";
import * as P from "@reito/ui/basic";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { HoverCardDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Hover Card",
  component: HoverCardDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      story: { inline: false, height: 'var(--rui-container-lg)' },
      description: {
        component:
          "链接预览卡片。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof HoverCardDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
  render: () => <HoverCardDemo />,
};

function DocumentPreview({ side = "bottom" }: { side?: "bottom" | "right" }) {
  return (
    <P.HoverCard defaultOpen>
      <P.HoverCardTrigger
        render={
          <a
            href="#component-docs"
            onClick={(event) => event.preventDefault()}
            className="text-sm underline underline-offset-4"
          />
        }
      >
        组件文档
      </P.HoverCardTrigger>
      <P.HoverCardContent side={side}>
        <div className="grid gap-2">
          <p className="font-medium">Reito UI</p>
          <p className="text-muted-foreground">桌面组件库的本地说明。</p>
        </div>
      </P.HoverCardContent>
    </P.HoverCard>
  );
}
export const Default: Story = {
  name: "位置 / 下方预览",
  render: () => <DocumentPreview />,
};
export const Beside: Story = {
  name: "位置 / 右侧预览",
  render: () => <DocumentPreview side="right" />,
};

type PlaygroundArgs = { open: boolean; side: "top" | "bottom" | "left" | "right"; align: "start" | "center" | "end"; title: string; description: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { open: false, side: "bottom", align: "center", title: "Reito UI", description: "桌面组件库的本地说明。" },
  argTypes: {
    open: { control: "boolean" },
    side: { control: "select", options: ["top", "bottom", "left", "right"], description: "HoverCardContent.side" },
    align: { control: "select", options: ["start", "center", "end"], description: "HoverCardContent.align" },
    title: { control: "text", table: { category: "组合示例" } }, description: { control: "text", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["open", "side", "align", "title", "description"] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <P.HoverCard open={args.open} onOpenChange={(open) => updateArgs({ open })}><P.HoverCardTrigger render={<a href="#component-docs" onClick={(event) => event.preventDefault()} className="text-sm underline underline-offset-4" />}>组件文档</P.HoverCardTrigger><P.HoverCardContent side={args.side} align={args.align}><div className="grid gap-2"><p className="font-medium">{args.title}</p><p className="text-muted-foreground">{args.description}</p></div></P.HoverCardContent></P.HoverCard>;
  },
};
