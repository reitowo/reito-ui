# RATING-01 验收

2026-09-07，RATING-01 已完成。新增 `Rating`，覆盖受控/非受控评分、整数/半星/四分之一精度、清除、悬停预览、级数、尺寸、语义色、自定义内容、只读/禁用/必填/错误和原生表单值。全库增为 107 个组件族（基础 66、复杂 22、AI 19），共 882 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计检查 253 个文件，0 个未批准项。
- **15/15** 组件测试在最终源码上通过：radio 组命名与值、点击、方向键、半星/四分之一精度、清除、悬停不提交、必填、只读/禁用、错误关联、FormData、同页 Controls，以及四种主题/密度的窄屏检查。
- **64/64** 全族 Story 组合通过：16 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 420px 窄宽度截图人工检查 dark/compact 与 light/comfortable：五级半星评分、清除入口、标签、数值和说明保持紧凑，没有挤出页面；三档图标尺寸消费共享尺度，颜色消费语义 tokens。
- 每个精度位置由隐藏的原生 radio 表达，方向键和空格沿用浏览器行为；悬停只更新临时显示，受控值在选择时回写。`null` 表示未评分，必填时不提供清除入口。
- Rating 表达有序数值；MessageActions 的赞踩仍是明确反馈动作，没有被映射为星级。

证据：[检查](../.logs/rating/check.log)、[构建](../.logs/rating/build.log)、[组件测试](../.logs/rating/tests-final.log)、[Story 扫描](../.logs/rating/storybook-audit.json)、[四组合截图](../.logs/rating)、[组件源码](../packages/ui/src/basic/rating.tsx)、[用法](components/rating.md)。
