# MeterGroup / ProgressGroup

`MeterGroup` 显示一个已知上限内的多段测量构成，例如存储、预算或分类占比。`ProgressGroup` 显示任务完成进度；总量无法估算时使用 `indeterminate`。单个标量优先使用 `Meter`，普通单段任务进度可以继续使用 `Progress`。

```tsx
import { MeterGroup, ProgressGroup } from '@reito/ui/basic';

<MeterGroup
  label="工作区存储构成"
  max={128}
  items={[
    { id: 'projects', label: '项目文件', value: 42, tone: 'default' },
    { id: 'indexes', label: '本地索引', value: 18, tone: 'accent' },
    { id: 'cache', label: '缓存', value: 12, tone: 'muted' },
  ]}
  formatValue={value => `${value} GB`}
/>

<ProgressGroup
  label="索引重建进度"
  max={100}
  items={[
    { id: 'scan', label: '扫描文件', value: 35, tone: 'success' },
    { id: 'parse', label: '解析内容', value: 28 },
  ]}
  formatValue={value => `${value}%`}
/>
```

每段 `value` 按从零开始的量解释，负数和非有限数归零。组件将各段相加得到总量；超过 `max` 时轨道裁切到容量边界，`valueLabel` 和 `overflowLabel` 仍应提供真实值。`max` 非有限或不大于零时回退为 100 或 1，避免无效范围。

`showLegend={false}` 只适用于附近已经存在可读分类明细的场景。颜色不能代替 `label`、数值或状态文字。`legendPosition="start"` 可把图例放到轨道之前；长标签会截断，说明和值保持各自对齐。

`ProgressGroup indeterminate` 会省略 `aria-valuenow`，设置 `aria-busy` 并显示不确定动画；减少动态效果的系统偏好会关闭动画。组件没有键盘操作，也不执行任务、计算业务进度或轮询服务端。

