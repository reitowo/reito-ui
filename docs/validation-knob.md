# KNOB-01 验收

2026-09-07，KNOB-01 已完成。新增 `Knob`，覆盖受控/非受控值、环形指针拖动、min/max/step、持续/提交回调、完整 slider 键盘路径、格式化、三档尺寸/线宽、语义色、范围文字、只读/禁用/错误和隐藏表单值。全库增为 108 个组件族（基础 67、复杂 22、AI 19），共 898 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计检查 255 个文件，0 个未批准项。
- **13/13** 组件测试在最终源码上通过：范围/当前值、方向键/Home/End/Page 键、环形拖动、步进与边界、只读/禁用、错误关联、格式化端点、FormData、同页 Controls，以及四种主题/密度的窄屏检查。
- **64/64** 全族 Story 组合通过：16 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 420px 窄宽度截图人工检查 dark/compact 与 light/comfortable：默认直径 80px，端点文字与旋钮宽度对齐，标题、说明和回调输出未挤出页面。尺寸、间距、颜色、焦点和透明度消费共享尺度或语义 tokens。
- 指针坐标映射到 270° 圆弧并按 step 对齐；释放指针和键盘操作触发提交回调。自定义 `role="slider"` 提供当前值、边界、可读值、只读/禁用和错误语义。
- Knob 只负责圆形单值调节；双端范围继续由 Slider 负责，直接数字编辑继续由 NumberField 负责。

证据：[检查](../.logs/knob/check.log)、[构建](../.logs/knob/build.log)、[组件测试](../.logs/knob/tests-final.log)、[Story 扫描](../.logs/knob/storybook-audit.json)、[四组合截图](../.logs/knob)、[组件源码](../packages/ui/src/basic/knob.tsx)、[用法](components/knob.md)。
