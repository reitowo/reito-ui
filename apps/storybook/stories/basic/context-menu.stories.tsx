import { useArgs } from "storybook/preview-api";
import * as P from "@reito/ui/basic";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContextMenuDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-context-menu",
  title: "基础/ContextMenu 右键菜单",
  component: ContextMenuDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "右键打开的上下文操作。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof ContextMenuDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互演示",
  render: () => <ContextMenuDemo />,
};

function FileContextMenu({
  state = "default",
}: {
  state?: "default" | "disabled" | "destructive" | "checkbox";
}) {
  return (
    <P.ContextMenu>
      <P.ContextMenuTrigger className="flex h-36 w-full max-w-md items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        在此区域右键打开文件操作
      </P.ContextMenuTrigger>
      <P.ContextMenuContent>
        {state === "checkbox" ? (
          <P.ContextMenuCheckboxItem defaultChecked>
            显示隐藏文件
          </P.ContextMenuCheckboxItem>
        ) : (
          <P.ContextMenuItem
            disabled={state === "disabled"}
            variant={state === "destructive" ? "destructive" : "default"}
          >
            {state === "destructive" ? "移除文件" : "打开文件"}
          </P.ContextMenuItem>
        )}
      </P.ContextMenuContent>
    </P.ContextMenu>
  );
}
export const Default: Story = {
  name: "条目 · 普通操作",
  render: () => <FileContextMenu />,
};
export const Disabled: Story = {
  name: "条目 · 禁用操作",
  render: () => <FileContextMenu state="disabled" />,
};
export const Destructive: Story = {
  name: "条目 · 危险操作",
  render: () => <FileContextMenu state="destructive" />,
};
export const Checkbox: Story = {
  name: "条目 · 复选操作",
  render: () => <FileContextMenu state="checkbox" />,
};

type PlaygroundArgs = { open: boolean; variant: "default" | "destructive"; disabled: boolean; inset: boolean; itemLabel: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { open: false, variant: "default", disabled: false, inset: false, itemLabel: "打开文件" },
  argTypes: {
    open: { control: "boolean" },
    variant: { control: "select", options: ["default", "destructive"], description: "ContextMenuItem.variant" },
    disabled: { control: "boolean", description: "ContextMenuItem.disabled" }, inset: { control: "boolean", description: "ContextMenuItem.inset" },
    itemLabel: { control: "text", description: "ContextMenuItem.children", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["open", "variant", "disabled", "inset", "itemLabel"] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <P.ContextMenu open={args.open} onOpenChange={(open) => updateArgs({ open })}><P.ContextMenuTrigger className="flex h-36 w-full max-w-md items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">在此区域右键打开文件操作</P.ContextMenuTrigger><P.ContextMenuContent><P.ContextMenuItem variant={args.variant} disabled={args.disabled} inset={args.inset}>{args.itemLabel}</P.ContextMenuItem></P.ContextMenuContent></P.ContextMenu>;
  },
};
