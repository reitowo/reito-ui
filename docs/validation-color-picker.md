# COLOR-01 ColorPicker / ColorInput 验收

2026-09-07，COLOR-01 已完成。新增同一受控/未受控字段契约下的 `ColorInput` 与 `ColorPicker`，覆盖 HEX/RGB/HSL 解析和格式化、弹出/内联色板、饱和度与亮度区域、色相/透明度滑块、RGB(A) 通道、预设颜色、无效草稿恢复、提交事件、只读/禁用和原生表单值。当前共 99 个组件族（基础 58、复杂 22、AI 19），749 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **13/13** 交互通过：文本提交/无效恢复、三格式转换、弹层预设、Escape 焦点恢复、二维区域键盘调整、RGB 通道边界、透明度 0/100、FormData、只读/禁用、同页 Controls，以及四种主题/密度。
- **60/60** Story 组合通过：15 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- compact / comfortable 字段实测为 32 / 40px；dark/compact 与 light/comfortable 截图人工检查确认弹层宽度、色板高度、通道和预设保持紧凑，前景/表面随主题切换。
- 色相渐变及黑白混合端点定义在 token 源；实际颜色值和透明度渐变由调用方数据计算。组件不写入系统主题，也不负责对比度策略或颜色持久化。
- 参考 Nuxt UI 的表单层 ColorPicker，以及 PrimeVue 的受控值、弹出/内联和格式能力；实现、React API、可访问文本输入与 Graphite 样式为本项目原创。

证据：[检查](../.logs/color-picker/check.log)、[构建](../.logs/color-picker/build.log)、[交互](../tests/color-picker.spec.ts)、[Story 扫描](../.logs/storybook-color-picker.json)、[四组合截图](../.logs/color-picker)、[组件源码](../packages/ui/src/basic/color-picker.tsx)、[token 源](../packages/tokens/src/tokens.json)、[用法](components/color-picker.md)。
