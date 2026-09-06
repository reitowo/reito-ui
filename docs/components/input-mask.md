# InputMask

`InputMask` 用于电话号码、编号等固定格式输入。公开 `value` 始终是去掉格式符的 raw 值；输入框显示由 `mask` 生成的 display 值。

```tsx
import { InputMask } from '@reito/ui/basic';

export function PhoneField() {
  const [phone, setPhone] = useState('02155551234');
  return <InputMask
    label="联系电话"
    mask="999-9999-9999? x99999"
    value={phone}
    onValueChange={setPhone}
    incompleteBehavior="restore"
    name="phone"
  />;
}
```

默认槽位为 `9`（数字）、`a`（ASCII 字母）和 `*`（ASCII 字母或数字）。`?` 之后的槽位与字面量为可选段，反斜杠用于转义控制字符。`definitions` 可以增加业务槽位，例如 `{ 文: /[\p{L}\p{N}]/u }`；应传入稳定对象，避免无意义地重编译 mask。

`onValueChange(raw, details)` 在合法字符变化后触发，`details` 包含 `displayValue` 与 `complete`。`onValueCommit` 在失焦结算后触发。`formatMaskValue`、`parseMaskValue` 和 `isMaskComplete` 可在表单适配、存储或测试中复用同一规则。

未完成值的失焦策略由 `incompleteBehavior` 控制：`allow` 保留并报告未完成，`clear` 清空，`restore` 恢复上一次提交值。`required` 会让空值也显示未完成反馈。宿主错误通过 `error` 接入，并与输入的 `aria-describedby` 关联。

组件通过 change/input 数据流处理键入和粘贴，在 `compositionend` 后统一规范化输入法文本；Backspace / Delete 只补足格式字面量边界的删除行为。`name` 对应隐藏字段并提交 raw 值，显示输入仍保留原生 label、required、autocomplete、inputMode、ref、只读和禁用语义。
