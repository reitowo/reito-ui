import { useArgs } from "storybook/preview-api";
import * as P from "@reito/ui/basic";
import { ChevronDown } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { DropdownMenuDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Dropdown Menu",
  component: DropdownMenuDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      story: { inline: false, height: 'var(--rui-container-lg)' },
      description: {
        component:
          "操作、快捷键、复选与禁用条目。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof DropdownMenuDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
  render: () => <DropdownMenuDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "任务操作" }));
    await userEvent.click(
      await body.findByRole("menuitem", { name: /复制链接/ }),
    );
    await expect(canvas.getByText("已复制任务链接")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "任务操作" }));
    const unavailable = await body.findByRole("menuitem", {
      name: "发布到云端",
    });
    await expect(unavailable).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Escape}");
  },
};

function TaskMenu({
  state = "default",
}: {
  state?: "default" | "disabled" | "destructive" | "checkbox";
}) {
  return (
    <P.DropdownMenu defaultOpen>
      <P.DropdownMenuTrigger render={<P.Button variant="outline" />}>
        任务操作
        <ChevronDown />
      </P.DropdownMenuTrigger>
      <P.DropdownMenuContent>
        {state === "checkbox" ? (
          <P.DropdownMenuCheckboxItem defaultChecked>
            置顶任务
          </P.DropdownMenuCheckboxItem>
        ) : (
          <P.DropdownMenuItem
            disabled={state === "disabled"}
            variant={state === "destructive" ? "destructive" : "default"}
          >
            {state === "destructive" ? "归档任务" : "复制任务链接"}
          </P.DropdownMenuItem>
        )}
      </P.DropdownMenuContent>
    </P.DropdownMenu>
  );
}
export const Default: Story = {
  name: "条目 / 普通操作",
  render: () => <TaskMenu />,
};
export const Disabled: Story = {
  name: "条目 / 禁用操作",
  render: () => <TaskMenu state="disabled" />,
};
export const Destructive: Story = {
  name: "条目 / 危险操作",
  render: () => <TaskMenu state="destructive" />,
};
export const Checkbox: Story = {
  name: "条目 / 复选操作",
  render: () => <TaskMenu state="checkbox" />,
};

type PlaygroundArgs = { open: boolean; variant: "default" | "destructive"; disabled: boolean; inset: boolean; itemLabel: string; side: "top" | "bottom" | "left" | "right"; align: "start" | "center" | "end" };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { open: false, variant: "default", disabled: false, inset: false, itemLabel: "复制任务链接", side: "bottom", align: "start" },
  argTypes: {
    open: { control: "boolean" },
    variant: { control: "select", options: ["default", "destructive"], description: "DropdownMenuItem.variant" },
    disabled: { control: "boolean", description: "DropdownMenuItem.disabled" }, inset: { control: "boolean", description: "DropdownMenuItem.inset" },
    itemLabel: { control: "text", description: "DropdownMenuItem.children", table: { category: "组合示例" } },
    side: { control: "select", options: ["top", "bottom", "left", "right"], description: "DropdownMenuContent.side" },
    align: { control: "select", options: ["start", "center", "end"], description: "DropdownMenuContent.align" },
  },
  parameters: { controls: { include: ["open", "variant", "disabled", "inset", "itemLabel", "side", "align"] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <P.DropdownMenu open={args.open} onOpenChange={(open) => updateArgs({ open })}><P.DropdownMenuTrigger render={<P.Button variant="outline" />}>任务操作<ChevronDown /></P.DropdownMenuTrigger><P.DropdownMenuContent side={args.side} align={args.align}><P.DropdownMenuItem variant={args.variant} disabled={args.disabled} inset={args.inset}>{args.itemLabel}</P.DropdownMenuItem></P.DropdownMenuContent></P.DropdownMenu>;
  },
};
