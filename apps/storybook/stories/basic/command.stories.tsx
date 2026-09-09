import { useArgs } from "storybook/preview-api";
import * as P from "@reito/ui/basic";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { CommandDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-command",
  title: "基础/Command 命令面板",
  component: CommandDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "可过滤命令列表与选择反馈。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof CommandDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互演示",
  render: () => <CommandDemo />,
};

function CommandListExample({
  empty = false,
  disabled = false,
}: {
  empty?: boolean;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState(empty ? "不存在的命令" : "");
  const commands = [{ id: "create", label: "新建任务" }];
  const matches = commands.filter((command) =>
    command.label.includes(query.trim()),
  );
  return (
    <P.Command label="搜索命令" className="max-w-md border" shouldFilter={false}>
      <P.CommandInput
        aria-label="搜索命令"
        placeholder="搜索命令…"
        value={query}
        onValueChange={setQuery}
      />
      {matches.length === 0 && (
        <div role="status"><P.CommandEmpty>没有匹配的命令。</P.CommandEmpty></div>
      )}
      <P.CommandList hidden={matches.length === 0}>
        {matches.length > 0 && (
          <P.CommandGroup heading="工作区">
            {matches.map((command) => (
              <P.CommandItem
                key={command.id}
                value={command.label}
                disabled={disabled}
              >
                <Plus />
                {command.label}
                <P.CommandShortcut>⌘ N</P.CommandShortcut>
              </P.CommandItem>
            ))}
          </P.CommandGroup>
        )}
      </P.CommandList>
    </P.Command>
  );
}
export const Default: Story = {
  name: "内容 · 命令与快捷键",
  render: () => <CommandListExample />,
};
export const Disabled: Story = {
  name: "状态 · 禁用命令",
  render: () => <CommandListExample disabled />,
};
export const Empty: Story = {
  name: "状态 · 无匹配命令",
  render: () => <CommandListExample empty />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "搜索命令" });
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "没有匹配的命令",
    );
    await expect(canvas.queryByRole("listbox")).not.toBeInTheDocument();
    await userEvent.clear(input);
    await waitFor(() =>
      expect(canvas.getByRole("option", { name: /新建任务/ })).toBeVisible(),
    );
    await userEvent.type(input, "不存在的命令");
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("没有匹配的命令"),
    );
    await expect(canvas.queryByRole("listbox")).not.toBeInTheDocument();
  },
};

type PlaygroundArgs = { query: string; placeholder: string; disabled: boolean; showShortcut: boolean; itemLabel: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { query: "", placeholder: "搜索命令…", disabled: false, showShortcut: true, itemLabel: "新建任务" },
  argTypes: {
    query: { control: "text", description: "CommandInput.value", table: { category: "子组件 props" } },
    placeholder: { control: "text", description: "CommandInput.placeholder", table: { category: "子组件 props" } },
    disabled: { control: "boolean", description: "CommandItem.disabled", table: { category: "子组件 props" } },
    showShortcut: { control: "boolean", table: { category: "组合示例" } },
    itemLabel: { control: "text", description: "CommandItem.children", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["query", "placeholder", "disabled", "showShortcut", "itemLabel"] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    const visible = args.itemLabel.includes(args.query.trim());
    return <P.Command label="搜索命令" className="max-w-md border" shouldFilter={false}>
      <P.CommandInput aria-label="搜索命令" placeholder={args.placeholder} value={args.query} onValueChange={(query) => updateArgs({ query })} />
      {!visible && <div role="status"><P.CommandEmpty>没有匹配的命令。</P.CommandEmpty></div>}
      <P.CommandList hidden={!visible}>{visible && <P.CommandGroup heading="工作区"><P.CommandItem value={args.itemLabel} disabled={args.disabled}><Plus />{args.itemLabel}{args.showShortcut && <P.CommandShortcut>⌘ N</P.CommandShortcut>}</P.CommandItem></P.CommandGroup>}</P.CommandList>
    </P.Command>;
  },
};
