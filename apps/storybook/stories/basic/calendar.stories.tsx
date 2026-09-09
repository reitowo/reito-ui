import * as React from "react";
import * as P from "@reito/ui/basic";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-calendar",
  title: "基础/Calendar 日历",
  component: CalendarDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "固定月份的可控单日选择与禁用日期。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof CalendarDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互演示",
  render: () => <CalendarDemo />,
};

const month = new Date(2026, 8, 1);
export const Default: Story = {
  name: "选择 · 单日",
  render: function SingleDate() {
    const [selected, setSelected] = React.useState<Date | undefined>(
      new Date(2026, 8, 6),
    );
    return (
      <P.Calendar
        mode="single"
        defaultMonth={month}
        selected={selected}
        onSelect={setSelected}
      />
    );
  },
};
export const Multiple: Story = {
  name: "选择 · 多日",
  render: function MultipleDates() {
    const [selected, setSelected] = React.useState<Date[] | undefined>([
      new Date(2026, 8, 6),
      new Date(2026, 8, 9),
    ]);
    return (
      <P.Calendar
        mode="multiple"
        defaultMonth={month}
        selected={selected}
        onSelect={setSelected}
      />
    );
  },
};
export const Range: Story = {
  name: "选择 · 日期范围",
  render: function DateRange() {
    const [selected, setSelected] = React.useState<{
      from: Date | undefined;
      to?: Date;
    }>({ from: new Date(2026, 8, 6), to: new Date(2026, 8, 10) });
    return (
      <P.Calendar
        mode="range"
        defaultMonth={month}
        selected={selected}
        onSelect={(value) => setSelected(value ?? { from: undefined })}
      />
    );
  },
};
export const DisabledDates: Story = {
  name: "状态 · 禁用周末",
  render: () => (
    <P.Calendar
      mode="single"
      defaultMonth={month}
      disabled={{ dayOfWeek: [0, 6] }}
    />
  ),
};
export const DropdownCaption: Story = {
  name: "导航 · 月年选择器",
  render: () => (
    <P.Calendar mode="single" defaultMonth={month} captionLayout="dropdown" />
  ),
};

type PlaygroundArgs = { captionLayout: "label" | "dropdown" | "dropdown-months" | "dropdown-years"; numberOfMonths: number; showOutsideDays: boolean; fixedWeeks: boolean; disabled: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { captionLayout: "label", numberOfMonths: 1, showOutsideDays: true, fixedWeeks: false, disabled: false },
  argTypes: {
    captionLayout: { control: "select", options: ["label", "dropdown", "dropdown-months", "dropdown-years"] },
    numberOfMonths: { control: { type: "range", min: 1, max: 2, step: 1 } },
    showOutsideDays: { control: "boolean" }, fixedWeeks: { control: "boolean" }, disabled: { control: "boolean" },
  },
  parameters: { controls: { include: ["captionLayout", "numberOfMonths", "showOutsideDays", "fixedWeeks", "disabled"] } },
  render: function PlaygroundRender(args) {
    const [selected, setSelected] = React.useState<Date | undefined>(new Date(2026, 8, 6));
    return <P.Calendar mode="single" defaultMonth={month} selected={selected} onSelect={setSelected} {...args} />;
  },
};
