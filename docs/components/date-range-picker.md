# DateRangePicker

`DateRangePicker` 编辑一组不带时区的本地日历日。`value` 与 `onValueChange` 是受控边界；日历、日期输入和预设只修改弹层草稿，用户点击“应用范围”后才提交。取消、Escape 或在应用前关闭弹层都会丢弃草稿。

```tsx
const [range, setRange] = useState<DateRange>();

<DateRangePicker
  value={range}
  onValueChange={setRange}
  minDate={new Date(2026, 0, 1)}
  maxDate={new Date(2026, 11, 31)}
/>
```

## 预设

默认预设为今天、近 7 天、近 30 天和本月。选择预设后仍需要应用；预设的任一端超出 `minDate` / `maxDate` 时，对应按钮会禁用并在 `title` 说明原因，不会暗中截断日期。

```tsx
<DateRangePicker
  value={range}
  onValueChange={setRange}
  today={new Date(2026, 8, 15)}
  presets={[
    {
      id: 'release-window',
      label: '发布窗口',
      range: ({ today }) => ({
        from: addDays(today, -2),
        to: addDays(today, 2),
      }),
    },
  ]}
/>
```

`presets={false}` 隐藏预设。`today` 为相对预设提供当地日参考；省略时在组件挂载时取当天，测试、回放与 SSR 宿主应传入稳定值。

## locale 与格式

`locale` 透传给 React DayPicker，同时为默认触发器格式提供 locale code。`formatDate(date, locale)` 可覆盖触发器中每个日期的文本；`placeholder`、`incompleteLabel`、`clearLabel`、`cancelLabel` 和 `applyLabel` 由宿主提供完整文案。locale 本身不会翻译这些产品文本。

```tsx
<DateRangePicker
  label="Reporting period"
  value={range}
  onValueChange={setRange}
  locale={enUS}
  formatDate={(date, locale) =>
    new Intl.DateTimeFormat(locale.code, {
      month: 'short', day: 'numeric', year: 'numeric',
    }).format(date)
  }
  clearLabel="Clear"
  cancelLabel="Cancel"
  applyLabel="Apply"
/>
```

原生日期输入使用 `YYYY-MM-DD` 值并保留浏览器的本地显示与键盘行为。组件不附加任意时区、时刻或 UTC 转换；起止时刻精度及序列化由 `DATERANGE-02` 跟踪。“清除”是明确的立即受控提交，不等待应用。
