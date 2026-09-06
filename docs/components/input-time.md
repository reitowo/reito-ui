# InputTime

`InputTime` 表示一天内的时间，不携带日期或时区。公开值为 `{ hour, minute, second? }`，其中 `hour` 始终使用 0–23；`hourCycle={12}` 只改变输入显示和 AM/PM 操作，不改变数据模型。

```tsx
import { InputTime, type TimeValue } from '@reito/ui/basic';

export function ReminderTime() {
  const [time, setTime] = useState<TimeValue | null>({ hour: 9, minute: 30 });
  return <InputTime
    label="提醒时间"
    value={time}
    onValueChange={setTime}
    onValueCommit={saveReminder}
    hourCycle={24}
    minuteStep={5}
    min={{ hour: 8, minute: 30 }}
    max={{ hour: 18, minute: 0 }}
    name="reminderTime"
  />;
}
```

`precision="minute" | "second"` 控制分段与序列化精度；`minuteStep` 和 `secondStep` 限制合法输入并决定方向键增量。完整、合法且在 `min / max` 内的草稿触发 `onValueChange`；Enter、整体失焦、方向键、AM/PM 切换和清除触发 `onValueCommit`。Escape 恢复本轮编辑开始时的提交值。

左右方向键在光标位于分段边界时移动焦点，上下方向键按当前分段与配置步进调整；没有范围时跨午夜回绕，有范围时停在边界。Home / End 定位首尾分段。`readOnly` 保留可读取时间并移除操作，`disabled` 禁用全部分段。`name` 提交 `HH:mm` 或 `HH:mm:ss`，无效草稿不会污染已提交表单值。

`formatTimeValue` 与 `parseTimeValue` 供宿主处理稳定字符串。DateTimePicker 负责把日期与时间组合并解释时区；InputTime 不创建任意日期，也不返回 `Date`。
