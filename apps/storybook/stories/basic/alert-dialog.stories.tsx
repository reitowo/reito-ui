import { useArgs } from "storybook/preview-api";
import * as React from "react";
import * as P from "@reito/ui/basic";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertDialogDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-alert-dialog",
  title: "基础/AlertDialog 警告对话框",
  component: AlertDialogDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      story: { inline: false, height: 'var(--rui-container-lg)' },
      description: {
        component:
          "确认操作与可恢复的本地反馈。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof AlertDialogDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互演示",
  render: () => <AlertDialogDemo />,
};

function ArchiveDialog({
  size = "default",
  busy = false,
}: {
  size?: "default" | "sm";
  busy?: boolean;
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <P.AlertDialog open={open} onOpenChange={setOpen}>
      <P.AlertDialogTrigger render={<P.Button variant="destructive" />}>
        归档示例任务
      </P.AlertDialogTrigger>
      <P.AlertDialogContent size={size}>
        <P.AlertDialogHeader>
          <P.AlertDialogTitle>归档任务？</P.AlertDialogTitle>
          <P.AlertDialogDescription>
            此操作只改变本地示例状态。
          </P.AlertDialogDescription>
        </P.AlertDialogHeader>
        <P.AlertDialogFooter>
          <P.AlertDialogCancel>取消</P.AlertDialogCancel>
          <P.AlertDialogAction
            disabled={busy}
            aria-busy={busy || undefined}
            onClick={() => setOpen(false)}
          >
            {busy ? (
              <>
                <P.Spinner aria-hidden="true" />
                归档中
              </>
            ) : (
              "确认归档"
            )}
          </P.AlertDialogAction>
        </P.AlertDialogFooter>
      </P.AlertDialogContent>
    </P.AlertDialog>
  );
}
export const Default: Story = {
  name: "尺寸 · 默认确认框",
  render: () => <ArchiveDialog />,
};
export const Small: Story = {
  name: "尺寸 · 紧凑确认框",
  render: () => <ArchiveDialog size="sm" />,
};
export const Loading: Story = {
  name: "状态 · 提交中",
  render: () => <ArchiveDialog busy />,
};

type PlaygroundArgs = { open: boolean; size: "default" | "sm"; busy: boolean; title: string; description: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { open: false, size: "default", busy: false, title: "归档任务？", description: "此操作只改变本地示例状态。" },
  argTypes: {
    open: { control: "boolean" }, size: { control: "select", options: ["default", "sm"], description: "AlertDialogContent.size" },
    busy: { control: "boolean", table: { category: "组合示例" } },
    title: { control: "text", description: "AlertDialogTitle.children", table: { category: "组合示例" } },
    description: { control: "text", description: "AlertDialogDescription.children", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["open", "size", "busy", "title", "description"] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <P.AlertDialog open={args.open} onOpenChange={(open) => updateArgs({ open })}>
      <P.AlertDialogTrigger render={<P.Button variant="destructive" />}>归档示例任务</P.AlertDialogTrigger>
      <P.AlertDialogContent size={args.size}><P.AlertDialogHeader><P.AlertDialogTitle>{args.title}</P.AlertDialogTitle><P.AlertDialogDescription>{args.description}</P.AlertDialogDescription></P.AlertDialogHeader><P.AlertDialogFooter><P.AlertDialogCancel>取消</P.AlertDialogCancel><P.AlertDialogAction disabled={args.busy} aria-busy={args.busy} onClick={() => updateArgs({ open: false })}>{args.busy ? "归档中" : "确认归档"}</P.AlertDialogAction></P.AlertDialogFooter></P.AlertDialogContent>
    </P.AlertDialog>;
  },
};
