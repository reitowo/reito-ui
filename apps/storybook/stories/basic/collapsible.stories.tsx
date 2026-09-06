import { useArgs } from "storybook/preview-api";
import * as React from "react";
import * as P from "@reito/ui/basic";
import { Folder, ChevronDown } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { CollapsibleDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Collapsible",
  component: P.Collapsible,

  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "按需展开的辅助内容。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof P.Collapsible>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
  render: () => <CollapsibleDemo />,
};

function FileDisclosure(props: React.ComponentProps<typeof P.Collapsible>) {
  return (
    <P.Collapsible className="w-full max-w-md" {...props}>
      <P.CollapsibleTrigger render={<P.Button variant="ghost" />}>
        <Folder />
        展开 3 个文件
        <ChevronDown />
      </P.CollapsibleTrigger>
      <P.CollapsibleContent>
        <div className="mt-2 space-y-2 rounded-lg border p-3 font-mono text-xs">
          <p>tokens.json</p>
          <p>theme.css</p>
          <p>button.tsx</p>
        </div>
      </P.CollapsibleContent>
    </P.Collapsible>
  );
}
export const Default: Story = {
  name: "状态 / 默认收起",
  args: { defaultOpen: false },
  render: (args) => <FileDisclosure {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "展开 3 个文件" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByText("tokens.json")).toBeVisible());
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard(" ");
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "false"),
    );
  },
};
export const Expanded: Story = {
  name: "状态 / 默认展开",
  args: { defaultOpen: true },
  render: (args) => <FileDisclosure {...args} />,
};
export const Disabled: Story = {
  name: "状态 / 禁用",
  args: { disabled: true },
  render: (args) => <FileDisclosure {...args} />,
};

type PlaygroundArgs = { open: boolean; disabled: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { open: false, disabled: false },
  argTypes: { open: { control: "boolean" }, disabled: { control: "boolean" } },
  parameters: { controls: { include: ["open", "disabled"] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <FileDisclosure open={args.open} disabled={args.disabled} onOpenChange={(open) => updateArgs({ open })} />;
  },
};
