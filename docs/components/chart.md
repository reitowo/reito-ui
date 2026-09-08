# Chart 工作面范围（APP-CHART-01）

## 使用场景

桌面工作区的数据趋势、分组对比和占比查看。首批提供 line、area、bar、pie、donut，覆盖时间/类别趋势与单序列组成。多序列折线/面积/柱图使用同一行数据，不由图表执行聚合或单位转换。

## 渲染引擎与许可

选用 Recharts 3.10.1（MIT），兼容 React 19；react-is 与 React 主版本一致。参考官方 Accessibility 文档中的键盘导航与 tooltip 读屏语义，仍须实际测试。本库封装提供共享 tokens、状态、图例、数据表与格式契约，不复制 PRO 产品实现。

- https://github.com/recharts/recharts/blob/main/storybook/stories/API/Accessibility.mdx
- https://recharts.github.io/en-US/api/
- https://primevue.dev/chart/

## 数据与行为契约

每行带稳定 id、类别 label 与各系列的 number/null 值；null 表示缺失，不当作零。系列带稳定 key、显示标签与语义颜色。禁止非有限数进入坐标计算；负值用于笛卡尔图，饼/环图必须非负且总值大于零。组件不会悄悄丢弃异常数据而声称已正常展示。

图例允许隐藏/恢复系列；坐标与 tooltip 显示共享格式器。键盘支持数据点访问，并有可展开的真实数据表作为替代入口。空、加载、错误与宿主重试单独展示。图形随容器变化，颜色/文字/间距跟随主题与密度，动画默认关闭。

## 验收计划

Playground 同页调整类型、图例、网格、堆叠和数据状态；覆盖中文长类别、多系列、缺失/负数/零、窄屏和受控数据替换。验证键盘 tooltip、图例、替代表格、四主题密度、token 审计、check/build。实际通过前不标完成。

当前不包含金融 OHLC、地理图、大规模流式采样或服务端聚合；这些不在本项首批图形范围内。
