# Rating

`Rating` 用于收集或展示有顺序的数值评分。赞成/反对、喜欢/不喜欢等离散反馈应继续使用有明确名称的按钮，不要自动换算成星级。

```tsx
import { useState } from 'react';
import { Rating } from '@reito/ui/basic';

export function QualityRating() {
  const [value, setValue] = useState<number | null>(3.5);
  return <Rating
    label="本次回答质量"
    value={value}
    onValueChange={setValue}
    step={0.5}
    description="选择 1–5 星；方向键移动，空格选择。"
  />;
}
```

`value / onValueChange` 可受控，未受控时使用 `defaultValue`；未评分是 `null`。`max` 取 1–20 的整数，`step` 支持 `1 / 0.5 / 0.25`。组件按步长生成原生 radio 选项，因此方向键、空格和 `name` 表单值沿用浏览器语义；视觉星形不承担单独的可访问名称。

`allowClear` 默认开启，在已有可选评分时显示清除按钮；`required` 会移除清除入口。`hoverable` 只改变指针预览，不提前提交值。`readOnly` 保留正常视觉并关闭输入，`disabled` 同时降低整个字段权重。

`size` 为 `sm / default / lg`，`tone` 为 `default / warning / success / danger`。颜色仅辅助表达，标题和值文字始终保留。`renderIcon` 可替换每一级的空/实内容；函数会收到索引、填充与是否处于预览状态。

`error` 会设置组级 `aria-invalid` 并关联警告文字。组件不提交反馈请求、不聚合平均分，也不解释评分业务含义。
