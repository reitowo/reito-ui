import { useArgs } from "storybook/preview-api";
import * as React from "react";
import * as P from "@reito/ui/basic";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { DialogDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-dialog",
  title: "基础/Dialog 对话框",
  component: DialogDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      story: { inline: false, height: 'var(--rui-container-lg)' },
      description: {
        component:
          "可控模态、表单、保存与焦点恢复。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof DialogDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互演示",
  render: () => <DialogDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "编辑项目" });
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(body.getByRole("dialog", { name: "编辑项目" })).toBeVisible(),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(body.getByRole("dialog", { name: "编辑项目" })).toBeVisible(),
    );
    await userEvent.click(
      await body.findByRole("button", { name: "确认保存" }),
    );
    await expect(canvas.getByText("项目已保存")).toBeVisible();
  },
};

function ProjectDialog({
  footerClose = false,
  busy = false,
}: {
  footerClose?: boolean;
  busy?: boolean;
}) {
  const id = React.useId();
  return (
    <P.Dialog defaultOpen>
      <P.DialogTrigger render={<P.Button variant="outline" />}>
        编辑项目
      </P.DialogTrigger>
      <P.DialogContent showCloseButton={!footerClose}>
        <P.DialogHeader>
          <P.DialogTitle>编辑项目</P.DialogTitle>
          <P.DialogDescription>更新本地示例的显示名称。</P.DialogDescription>
        </P.DialogHeader>
        <P.Field>
          <P.FieldLabel htmlFor={id}>项目名称</P.FieldLabel>
          <P.Input id={id} defaultValue="研究工作台" disabled={busy} />
        </P.Field>
        <P.DialogFooter>
          <P.DialogClose render={<P.Button variant="outline" />}>
            取消
          </P.DialogClose>
          {busy ? (
            <P.Button disabled aria-busy="true">
              <P.Spinner aria-hidden="true" />
              保存中
            </P.Button>
          ) : (
            <P.DialogClose render={<P.Button />}>确认保存</P.DialogClose>
          )}
        </P.DialogFooter>
      </P.DialogContent>
    </P.Dialog>
  );
}
export const Default: Story = {
  name: "状态 · 已打开",
  render: () => <ProjectDialog />,
};
export const FooterClose: Story = {
  name: "布局 · 页脚关闭操作",
  render: () => <ProjectDialog footerClose />,
};
export const Loading: Story = {
  name: "状态 · 保存中",
  render: () => <ProjectDialog busy />,
};

type PlaygroundArgs = { open: boolean; showCloseButton: boolean; busy: boolean; title: string; description: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { open: false, showCloseButton: true, busy: false, title: "编辑项目", description: "更新本地示例的显示名称。" },
  argTypes: {
    open: { control: "boolean" }, showCloseButton: { control: "boolean", description: "DialogContent.showCloseButton" },
    busy: { control: "boolean", table: { category: "组合示例" } },
    title: { control: "text", description: "DialogTitle.children", table: { category: "组合示例" } },
    description: { control: "text", description: "DialogDescription.children", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["open", "showCloseButton", "busy", "title", "description"] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    const id = React.useId();
    return <P.Dialog open={args.open} onOpenChange={(open) => updateArgs({ open })}><P.DialogTrigger render={<P.Button variant="outline" />}>编辑项目</P.DialogTrigger><P.DialogContent showCloseButton={args.showCloseButton}><P.DialogHeader><P.DialogTitle>{args.title}</P.DialogTitle><P.DialogDescription>{args.description}</P.DialogDescription></P.DialogHeader><P.Field><P.FieldLabel htmlFor={id}>项目名称</P.FieldLabel><P.Input id={id} defaultValue="研究工作台" disabled={args.busy} /></P.Field><P.DialogFooter><P.DialogClose render={<P.Button variant="outline" />}>取消</P.DialogClose><P.Button disabled={args.busy} aria-busy={args.busy} onClick={() => updateArgs({ open: false })}>{args.busy ? "保存中" : "确认保存"}</P.Button></P.DialogFooter></P.DialogContent></P.Dialog>;
  },
};
