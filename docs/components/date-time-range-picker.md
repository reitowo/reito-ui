# DateTimeRangePicker

`DateTimeRangePicker` 组合两个 `DateTimePicker`，用于编辑一组本地墙上时间。公开值始终保留两个可独立修正的端点；组件校验完整性、先后顺序和全局上下限，不把输入中的本地日期时间隐式解释为浏览器时区或 UTC 瞬时值。

```tsx
import { DateTimeRangePicker, type DateTimeRangeValue } from '@reito/ui/complex';

const [value, setValue] = useState<DateTimeRangeValue>({
  start: { date: new Date(2026, 8, 7), time: { hour: 17, minute: 30 } },
  end: { date: new Date(2026, 8, 8), time: { hour: 9, minute: 30 } },
});

<DateTimeRangePicker
  label="执行窗口"
  value={value}
  onValueChange={setValue}
  minuteStep={5}
  timeZone="Asia/Shanghai"
/>
```

`precision="minute" | "second"` 同时控制两个端点的输入与序列化精度；`hourCycle` 只改变显示。`min` / `max` 是包含端点的完整本地日期时间边界，首尾日期上的时间限制也会传给相应分段输入。倒置、缺少端点和越界草稿保留在界面中供用户修正，但不会得到有效序列化文本。

```tsx
const text = serializeDateTimeRange(value, {
  precision: 'second',
  timeZone: 'Asia/Shanghai',
});

// {"start":"2026-09-07T17:30:00","end":"2026-09-08T09:30:00","timeZone":"Asia/Shanghai"}
const parsed = parseDateTimeRange(text);
```

`timeZone` 接收运行环境支持的 IANA 时区标识，并作为独立元数据写入固定键序 JSON。组件不会据此计算 offset，也不会处理夏令时跳跃或重复时刻；宿主应在提交边界用业务选定的时区库、Temporal 实现或服务端规则将墙上时间转换为瞬时值。未提供 `timeZone` 时，JSON 只包含 `start` 与 `end`。

传入 `name` 会添加一个隐藏表单字段，值与 `serializeDateTimeRange` 相同。范围无效时字段值为空，同时组件显示可读错误；服务端仍需重复校验完整性、顺序、边界和时区。`onValueCommit` 只在某个端点完成提交且整个范围有效时触发。
