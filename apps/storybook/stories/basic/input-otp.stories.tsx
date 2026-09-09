import { useArgs } from "storybook/preview-api";
import * as React from "react";
import * as P from "@reito/ui/basic";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { InputOTPDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-input-otp",
  title: "基础/InputOTP 验证码输入",
  component: InputOTPDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "分组验证码输入与完成反馈。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof InputOTPDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互演示",
  render: () => <InputOTPDemo />,
};

function VerificationCode({
  disabled = false,
  invalid = false,
  initial = "",
  grouped = true,
}: {
  disabled?: boolean;
  invalid?: boolean;
  initial?: string;
  grouped?: boolean;
}) {
  const [value, setValue] = React.useState(initial);
  const id = React.useId();
  return (
    <div className="grid gap-3">
      <P.InputOTP
        aria-label="六位验证码"
        maxLength={6}
        disabled={disabled}
        value={value}
        onChange={setValue}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? id : undefined}
      >
        <P.InputOTPGroup>
          {(grouped ? [0, 1, 2] : [0, 1, 2, 3, 4, 5]).map((index) => (
            <P.InputOTPSlot
              key={index}
              index={index}
              aria-invalid={invalid || undefined}
            />
          ))}
        </P.InputOTPGroup>
        {grouped && (
          <>
            <P.InputOTPSeparator />
            <P.InputOTPGroup>
              {[3, 4, 5].map((index) => (
                <P.InputOTPSlot
                  key={index}
                  index={index}
                  aria-invalid={invalid || undefined}
                />
              ))}
            </P.InputOTPGroup>
          </>
        )}
      </P.InputOTP>
      {invalid && <P.FieldError id={id}>验证码无效，请重新输入。</P.FieldError>}
    </div>
  );
}
export const Default: Story = {
  name: "布局 · 分组输入",
  render: () => <VerificationCode />,
};
export const Continuous: Story = {
  name: "布局 · 连续输入",
  render: () => <VerificationCode grouped={false} />,
};
export const Complete: Story = {
  name: "状态 · 已填满",
  render: () => <VerificationCode initial="123456" />,
};
export const Disabled: Story = {
  name: "状态 · 禁用",
  render: () => <VerificationCode disabled initial="123456" />,
};
export const Invalid: Story = {
  name: "状态 · 校验错误",
  render: () => <VerificationCode invalid initial="123456" />,
};

type PlaygroundArgs = { value: string; maxLength: number; disabled: boolean; invalid: boolean; grouped: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { value: "", maxLength: 6, disabled: false, invalid: false, grouped: true },
  argTypes: {
    value: { control: "text" }, maxLength: { control: { type: "range", min: 4, max: 8, step: 1 } }, disabled: { control: "boolean" },
    invalid: { control: "boolean", description: "InputOTP 与 InputOTPSlot 的 aria-invalid", table: { category: "组合示例" } },
    grouped: { control: "boolean", description: "将 slots 拆成两组", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["value", "maxLength", "disabled", "invalid", "grouped"] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    const id = React.useId();
    const indices = Array.from({ length: args.maxLength }, (_, index) => index);
    const split = args.grouped ? Math.ceil(args.maxLength / 2) : args.maxLength;
    return <div className="grid gap-3"><P.InputOTP aria-label="验证码" maxLength={args.maxLength} value={args.value.slice(0, args.maxLength)} onChange={(value) => updateArgs({ value })} disabled={args.disabled} aria-invalid={args.invalid} aria-describedby={args.invalid ? id : undefined}><P.InputOTPGroup>{indices.slice(0, split).map((index) => <P.InputOTPSlot key={index} index={index} aria-invalid={args.invalid} />)}</P.InputOTPGroup>{args.grouped && <><P.InputOTPSeparator /><P.InputOTPGroup>{indices.slice(split).map((index) => <P.InputOTPSlot key={index} index={index} aria-invalid={args.invalid} />)}</P.InputOTPGroup></>}</P.InputOTP>{args.invalid && <P.FieldError id={id}>验证码无效，请重新输入。</P.FieldError>}</div>;
  },
};
