# Chart 验收（APP-CHART-01）

## 范围

提供折线、面积、柱状、饼图、环形图五种首批图形。支持系列图例开关、类别轴/值轴、网格、面积/柱状堆叠、键盘 tooltip、格式器、缺失值、负数（笛卡尔图）、加载/空/错误/宿主重试，以及可展开数据表。原始数据与表格不随图例隐藏而丢失。

使用 Recharts 3.10.1 / MIT。聚合与转换由宿主负责；组件校验稳定身份、有限数与占比约束，缺失值保持 null。首批不包含金融 OHLC、地图或服务端聚合，不声称完整覆盖参考库所有图形。

## 已取得证据

- 16 项测试通过：五类图形及等价表格、图例、键盘 tooltip、同页 Controls、四主题密度窄屏、错误重试、异常值/身份、长中文标签。`.logs/chart-tests-final.log`。
- 12 个 Story × 四种主题密度，48 组审计通过。没有控制台/页面错误、WCAG 违规或横向溢出。`.logs/chart-audit-final.json`。
- 长轴标签修正后追加四种主题密度审计通过。`.logs/chart-label-audit.json`。
- 最新 check / build 均通过，日志 `.logs/chart-check-final.log`、`.logs/chart-build.log`。保留现有 bundle 体积提示。

## 视觉与限制

已查看本地 390px 深色紧凑截图和长标签截图。使用共享灰阶表面、轻网格与原有语义色；缺失值形成折线断点，轴上简写保留两个长类别，完整名称可在 tooltip 和表格阅读。截图位于 `.logs/chart/`。

已查看 PrimeVue Chart 浅色官方页面（https://primevue.dev/chart/）实际柱状图：顶部图例、类别轴、值轴及网格。本库保持这些数据结构，改用紧凑间距、轻横向网格、Graphite 语义色，并增加真实数据表。主题不同，不声称像素复刻；未复制品牌资源或 PRO 代码。
