import * as React from "react";
import * as P from "@reito/ui/basic";
import { Trash2 } from "lucide-react";

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

function EditableGroup({ disabled = false, invalid = false }: { disabled?: boolean; invalid?: boolean }) {
  const id = React.useId();
  const [removed, setRemoved] = React.useState(false);
  if (removed) return <P.Button variant="outline" onClick={() => setRemoved(false)}>恢复示例功能组</P.Button>;
  return <P.FieldSet variant="outline" disabled={disabled} className="w-full max-w-2xl">
    <P.FieldLegend variant="label">功能组 1</P.FieldLegend>
    <P.FieldGroup>
      <P.Field data-invalid={invalid || undefined}>
        <P.FieldLabel htmlFor={`${id}-name`}>组名</P.FieldLabel>
        <P.FieldControlRow actions={<P.Button type="button" size="icon-sm" variant="ghost" aria-label="删除功能组 1" disabled={disabled} onClick={() => setRemoved(true)}><Trash2 aria-hidden="true" /></P.Button>}>
          <P.Input id={`${id}-name`} defaultValue={invalid ? '' : '取证试用'} disabled={disabled} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined} />
        </P.FieldControlRow>
        {invalid && <P.FieldError id={`${id}-error`}>请填写组名。</P.FieldError>}
      </P.Field>
      <P.Field>
        <P.FieldLabel htmlFor={`${id}-users`}>组内域账号</P.FieldLabel>
        <P.Textarea id={`${id}-users`} rows={3} defaultValue="example.user" disabled={disabled} aria-describedby={`${id}-help`} />
        <P.FieldDescription id={`${id}-help`}>用逗号或换行分隔；每个账号须已在接待名单内。这是本地示例。</P.FieldDescription>
      </P.Field>
      <P.FieldSet>
        <P.FieldLegend variant="label">开放功能</P.FieldLegend>
        <P.FieldGroup>
          <P.Field orientation="horizontal"><P.Checkbox id={`${id}-trace`} defaultChecked disabled={disabled} /><P.FieldLabel htmlFor={`${id}-trace`}>请求 ID 追踪</P.FieldLabel></P.Field>
          <P.Field orientation="horizontal"><P.Checkbox id={`${id}-billing`} disabled={disabled} /><P.FieldLabel htmlFor={`${id}-billing`}>扣费查询</P.FieldLabel></P.Field>
        </P.FieldGroup>
      </P.FieldSet>
    </P.FieldGroup>
  </P.FieldSet>;
}

export const EditableGroupLayout: Story = { name: "组合 · 可编辑功能组", render: () => <EditableGroup /> };
export const EditableGroupInvalid: Story = { name: "组合 · 功能组校验", render: () => <EditableGroup invalid /> };
export const EditableGroupDisabled: Story = { name: "组合 · 功能组禁用", render: () => <EditableGroup disabled /> };

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
