import { useArgs } from "storybook/preview-api";
import * as React from "react";
import * as P from "@reito/ui/basic";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { ComboboxDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Combobox",
  component: ComboboxDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "可搜索选项、清除与空结果。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof ComboboxDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
  render: () => <ComboboxDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("combobox", { name: "查找技术栈" });
    await userEvent.type(input, "Tail");
    await userEvent.click(
      await body.findByRole("option", { name: "Tailwind CSS" }),
    );
    await expect(canvas.getByText("已选择：Tailwind CSS")).toBeVisible();
  },
};

function TechnologyPicker({
  disabled = false,
  empty = false,
  initial = null,
  invalid = false,
}: {
  disabled?: boolean;
  empty?: boolean;
  initial?: string | null;
  invalid?: boolean;
}) {
  const [value, setValue] = React.useState<string | null>(initial);
  const items = empty
    ? []
    : ["React", "TypeScript", "Tailwind CSS", "Storybook", "Base UI"];
  return (
    <div className="w-full max-w-sm">
      <P.Combobox
        items={items}
        value={value}
        onValueChange={setValue}
        disabled={disabled}
      >
        <P.ComboboxInput
          aria-label="查找技术栈"
          placeholder="输入名称筛选…"
          showClear
          triggerLabel="显示或隐藏技术栈选项"
          disabled={disabled}
          aria-invalid={invalid || undefined}
        />
        <P.ComboboxContent>
          <P.ComboboxEmpty>没有匹配项</P.ComboboxEmpty>
          <P.ComboboxList>
            {(item: string) => (
              <P.ComboboxItem key={item} value={item}>
                {item}
              </P.ComboboxItem>
            )}
          </P.ComboboxList>
        </P.ComboboxContent>
      </P.Combobox>
    </div>
  );
}
export const Default: Story = {
  name: "状态 / 未选择",
  render: () => <TechnologyPicker />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole("button", { name: "显示或隐藏技术栈选项" }),
    );
    await userEvent.click(
      await body.findByRole("option", { name: "TypeScript" }),
    );
    await expect(
      canvas.getByRole("combobox", { name: "查找技术栈" }),
    ).toHaveValue("TypeScript");
    await userEvent.click(
      await canvas.findByRole("button", { name: "Clear selection" }),
    );
    await waitFor(() =>
      expect(canvas.getByRole("combobox", { name: "查找技术栈" })).toHaveValue(
        "",
      ),
    );
    await expect(
      await canvas.findByRole("button", { name: "显示或隐藏技术栈选项" }),
    ).toBeVisible();
    await userEvent.keyboard("{Escape}");
  },
};
export const Selected: Story = {
  name: "状态 / 已选择可清除",
  render: () => <TechnologyPicker initial="TypeScript" />,
};
export const Disabled: Story = {
  name: "状态 / 禁用",
  render: () => <TechnologyPicker disabled initial="React" />,
};
export const Empty: Story = {
  name: "状态 / 无可选项",
  render: () => <TechnologyPicker empty />,
};
export const Invalid: Story = {
  name: "状态 / 校验错误",
  render: () => <TechnologyPicker invalid />,
};

type PlaygroundArgs = { value: "none" | "React" | "TypeScript" | "Tailwind CSS" | "Storybook" | "Base UI"; disabled: boolean; showClear: boolean; showTrigger: boolean; placeholder: string; empty: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { value: "none", disabled: false, showClear: true, showTrigger: true, placeholder: "输入名称筛选…", empty: false },
  argTypes: {
    value: { control: "select", options: ["none", "React", "TypeScript", "Tailwind CSS", "Storybook", "Base UI"], description: "none 映射为 null；其余为 Combobox.value。" },
    disabled: { control: "boolean" }, showClear: { control: "boolean", description: "ComboboxInput.showClear" }, showTrigger: { control: "boolean", description: "ComboboxInput.showTrigger" },
    placeholder: { control: "text", description: "ComboboxInput.placeholder" },
    empty: { control: "boolean", description: "组合示例：items 使用空列表", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["value", "disabled", "showClear", "showTrigger", "placeholder", "empty"] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    const items: Exclude<PlaygroundArgs["value"], "none">[] = args.empty ? [] : ["React", "TypeScript", "Tailwind CSS", "Storybook", "Base UI"];
    return <div className="w-full max-w-sm"><P.Combobox items={items} value={args.value === "none" ? null : args.value} onValueChange={(value) => updateArgs({ value: value ?? "none" })} disabled={args.disabled}>
      <P.ComboboxInput aria-label="查找技术栈" placeholder={args.placeholder} showClear={args.showClear} showTrigger={args.showTrigger} triggerLabel="显示或隐藏技术栈选项" disabled={args.disabled} />
      <P.ComboboxContent><P.ComboboxEmpty>没有匹配项</P.ComboboxEmpty><P.ComboboxList>{(item: string) => <P.ComboboxItem key={item} value={item}>{item}</P.ComboboxItem>}</P.ComboboxList></P.ComboboxContent>
    </P.Combobox></div>;
  },
};
