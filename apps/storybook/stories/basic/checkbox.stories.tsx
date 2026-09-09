import { useArgs } from "storybook/preview-api";
import * as React from "react";
import * as P from "@reito/ui/basic";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { CheckboxDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-checkbox",
  title: "基础/Checkbox 复选框",
  component: P.Checkbox,

  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "选中、部分选中、错误与禁用。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof P.Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
  render: () => <CheckboxDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "保存本地草稿" });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(canvas.getByText("草稿保存已开启")).toBeVisible();
    await expect(
      canvas.getByRole("checkbox", { name: "禁用复选框" }),
    ).toHaveAttribute("aria-disabled", "true");
  },
};

function LabeledCheckbox(props: React.ComponentProps<typeof P.Checkbox>) {
  const id = React.useId();
  return (
    <div className="flex items-center gap-3">
      <P.Checkbox id={id} {...props} />
      <P.Label htmlFor={id}>保存本地草稿</P.Label>
    </div>
  );
}
export const Default: Story = {
  name: "状态 · 未选中",
  args: { defaultChecked: false },
  render: (args) => <LabeledCheckbox {...args} />,
};
export const Checked: Story = {
  name: "状态 · 已选中",
  args: { defaultChecked: true },
  render: (args) => <LabeledCheckbox {...args} />,
};
export const Indeterminate: Story = {
  name: "状态 · 部分选中",
  args: { indeterminate: true },
  render: (args) => <LabeledCheckbox {...args} />,
};
export const Disabled: Story = {
  name: "状态 · 禁用未选中",
  args: { disabled: true },
  render: (args) => <LabeledCheckbox {...args} />,
};
export const DisabledChecked: Story = {
  name: "状态 · 禁用已选中",
  args: { disabled: true, defaultChecked: true },
  render: (args) => <LabeledCheckbox {...args} />,
};
export const Invalid: Story = {
  name: "状态 · 校验错误",
  args: { "aria-invalid": true },
  render: (args) => <LabeledCheckbox {...args} />,
};

type PlaygroundArgs = { checked: boolean; indeterminate: boolean; disabled: boolean; invalid: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { checked: false, indeterminate: false, disabled: false, invalid: false },
  argTypes: {
    checked: { control: "boolean" }, indeterminate: { control: "boolean" }, disabled: { control: "boolean" },
    invalid: { control: "boolean", description: "映射到 aria-invalid", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["checked", "indeterminate", "disabled", "invalid"] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <LabeledCheckbox checked={args.checked} onCheckedChange={(checked) => updateArgs({ checked, indeterminate: false })} indeterminate={args.indeterminate} disabled={args.disabled} aria-invalid={args.invalid} />;
  },
};
