# Knob

`Knob` 是带持续读数的紧凑圆形单值输入，适合音量、模型温度或有限配额。需要双端范围时使用 `Slider`；需要直接输入精确数字或显式增减按钮时使用 `NumberField`。

```tsx
import { useState } from 'react';
import { Knob } from '@reito/ui/basic';

export function ContextBudget() {
  const [value, setValue] = useState(62);
  return <Knob
    label="上下文预算"
    value={value}
    onValueChange={setValue}
    onValueCommitted={value => savePreference(value)}
    min={0}
    max={100}
    step={1}
    tone="accent"
    formatValue={value => `${value}%`}
    showRange
  />;
}
```

`value / onValueChange` 可受控，未受控时使用 `defaultValue`。所有输入按 `step` 对齐并限制在 `min / max`；非有限范围会回退到 0–100，非正步长回退到可用正数。指针按 270° 环形轨道映射，拖动期间触发 `onValueChange`，指针释放和键盘提交触发 `onValueCommitted`。

键盘支持方向键按一步调整、Home/End 到边界、PageUp/PageDown 调整十步。组件使用 `role="slider"` 和可读范围/当前值；`valueText` 可覆盖屏幕阅读器文字，`formatValue` 控制中心和可选端点文字。

`size` 为 `sm / default / lg`，`stroke` 为 `thin / default / thick`，`tone` 为 `default / accent / success / warning / danger`。`readOnly` 保留正常视觉但不接受输入；`disabled` 同时降低权重。传入 `name` 时提交规范化后的隐藏表单值。

组件只调节本地数值，不保存偏好或控制设备。触控旋转、线性滑块与数字输入的选择应按工作场景决定。
