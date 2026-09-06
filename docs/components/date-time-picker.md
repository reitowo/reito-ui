# DateTimePicker

`DateTimePicker` 将 `InputDate` 与 `InputTime` 组合为一个本地日期时间字段。公开值保持 `{ date, time }`，稳定文本格式为 `YYYY-MM-DDTHH:mm[:ss]`，不附加 `Z` 或 UTC offset。

```tsx
import {
  DateTimePicker,
  type LocalDateTimeValue,
} from '@reito/ui/basic';

export function ScheduleField() {
  const [value, setValue] = useState<LocalDateTimeValue | null>({
    date: new Date(2026, 8, 7),
    time: { hour: 17, minute: 30 },
  });

  return <DateTimePicker
    label="计划执行时间"
    value={value}
    onValueChange={setValue}
    onValueCommit={saveSchedule}
    min={{ date: new Date(2026, 8, 7), time: { hour: 16, minute: 0 } }}
    max={{ date: new Date(2026, 8, 8), time: { hour: 10, minute: 0 } }}
    minuteStep={5}
    name="schedule"
  />;
}
```

日期或时间只有一部分完成时，组件保留内部草稿，不向宿主发送不完整对象。两个部分完整且同时满足日期、时间与组合范围后才触发 `onValueChange`；Enter、整体失焦、日历选择、分段步进和清除触发相应的 `onValueCommit`。跨日范围只在最小日期当天应用最小时间，在最大日期当天应用最大时间。

`locale / order`、禁用日期、12/24 小时、分钟/秒精度、步进、只读和禁用状态继续由两个已验收字段处理。`name` 提交最后一次合法且已提交的本地日期时间，无效草稿不会污染 `FormData`。`formatLocalDateTime` 与 `parseLocalDateTime` 可用于存储或路由参数。

该值描述当地墙上时间。需要 UTC 瞬时值或 IANA 时区时，宿主必须同时提供时区，并在提交边界显式转换；组件不会从浏览器环境猜测业务时区。只需要日期或时间时分别使用 `InputDate` 或 `InputTime`。
