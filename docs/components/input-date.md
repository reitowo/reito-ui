# InputDate

`InputDate` 表示不携带时间和时区的本地日历日。它将年、月、日拆为可编辑分段，默认按照 `locale.code` 推导排列顺序；显式传入 `order="ymd" | "mdy" | "dmy"` 可覆盖显示顺序。公开值仍是本地构造的 `Date`，表单值固定为 `YYYY-MM-DD`，不会经过 UTC 转换。

```tsx
import { InputDate } from '@reito/ui/basic';
import { zhCN } from 'react-day-picker/locale';

export function DeliveryDate() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 8, 7));
  return <InputDate
    label="交付日期"
    value={date}
    onValueChange={setDate}
    onValueCommit={saveDeliveryDate}
    locale={zhCN}
    min={new Date(2026, 0, 1)}
    max={new Date(2027, 11, 31)}
    name="deliveryDate"
  />;
}
```

`value / onValueChange` 为受控模式，`defaultValue` 提供非受控初值。完整且合法的分段会触发 `onValueChange`；Enter、整体失焦、方向键调整、清除或日历选择会触发 `onValueCommit`。输入过程允许不完整草稿；不存在的日期、超出 `min / max` 或命中 `isDateDisabled` 的日期显示字段错误且不会提交。Escape 恢复本轮编辑开始时的提交值。

左右方向键在光标位于分段边界时移动焦点，上下方向键按当前分段增加或减少日期，并在月末、闰年和范围边界保持合法日期。Home / End 定位到首尾分段。Calendar 继续负责日期网格、月份导航与焦点语义；`InputDate` 只实现单日期输入，不复制 Calendar 已有的多选、多月和范围能力。

`clearable` 控制清除按钮；`readOnly` 保留可读取的分段并移除操作入口；`disabled` 禁用全部分段和日历按钮。`name` 生成隐藏表单字段并提交已提交日期的 `YYYY-MM-DD`。`formatLocalDate` 和 `parseLocalDate` 可用于宿主序列化，不会调用 `toISOString()`。
