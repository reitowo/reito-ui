import * as React from "react";
import * as P from "@reito/ui/basic";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { FieldDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-field",
  title: "基础/Field 表单字段",
  component: FieldDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "标签、说明、错误与字段分组。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof FieldDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
  render: () => <FieldDemo />,
};

function NamedField({
  invalid = false,
  disabled = false,
  orientation = "vertical",
}: {
  invalid?: boolean;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal" | "responsive";
}) {
  const id = React.useId();
  return (
    <P.FieldGroup className="w-full max-w-lg">
      <P.Field
        orientation={orientation}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
      >
        <P.FieldLabel htmlFor={id}>工作区名称</P.FieldLabel>
        <P.FieldContent>
          <P.Input
            id={id}
            defaultValue={invalid ? "" : "研究工作台"}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={id + "-help"}
          />
          {invalid ? (
            <P.FieldError id={id + "-help"}>请填写工作区名称。</P.FieldError>
          ) : (
            <P.FieldDescription id={id + "-help"}>
              只用于本地示例展示。
            </P.FieldDescription>
          )}
        </P.FieldContent>
      </P.Field>
    </P.FieldGroup>
  );
}
export const Default: Story = {
  name: "布局 · 纵向",
  render: () => <NamedField />,
};
export const Horizontal: Story = {
  name: "布局 · 横向",
  render: () => <NamedField orientation="horizontal" />,
};
export const Responsive: Story = {
  name: "布局 · 响应式",
  render: () => <NamedField orientation="responsive" />,
};
export const Invalid: Story = {
  name: "状态 · 校验错误",
  render: () => <NamedField invalid />,
};
export const Disabled: Story = {
  name: "状态 · 禁用",
  render: () => <NamedField disabled />,
};

type PlaygroundArgs = { orientation: "vertical" | "horizontal" | "responsive"; disabled: boolean; invalid: boolean; label: string; description: string; error: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { orientation: "vertical", disabled: false, invalid: false, label: "工作区名称", description: "只用于本地示例展示。", error: "请填写工作区名称。" },
  argTypes: {
    orientation: { control: "select", options: ["vertical", "horizontal", "responsive"] },
    disabled: { control: "boolean", description: "Field.data-disabled + Input.disabled", table: { category: "组合示例" } },
    invalid: { control: "boolean", description: "Field.data-invalid + Input.aria-invalid", table: { category: "组合示例" } },
    label: { control: "text", description: "FieldLabel.children", table: { category: "组合示例" } },
    description: { control: "text", description: "FieldDescription.children", table: { category: "组合示例" } },
    error: { control: "text", description: "FieldError.children", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["orientation", "disabled", "invalid", "label", "description", "error"] } },
  render: function PlaygroundRender(args) {
    const id = React.useId();
    return <P.FieldGroup className="w-full max-w-lg"><P.Field orientation={args.orientation} data-disabled={args.disabled || undefined} data-invalid={args.invalid || undefined}><P.FieldLabel htmlFor={id}>{args.label}</P.FieldLabel><P.FieldContent><P.Input id={id} defaultValue="研究工作台" disabled={args.disabled} aria-invalid={args.invalid} aria-describedby={id + "-help"} />{args.invalid ? <P.FieldError id={id + "-help"}>{args.error}</P.FieldError> : <P.FieldDescription id={id + "-help"}>{args.description}</P.FieldDescription>}</P.FieldContent></P.Field></P.FieldGroup>;
  },
};
