# TAGS-01 InputTags 验收

2026-09-07，TAGS-01 已完成。新增 `InputTags` 基础组件族，支持任意字符串创建、中英文分隔键、可配置规范化、忽略/拒绝/允许重复、数量与字符上限、原位编辑、删除、受控/非受控值、只读/禁用和原生重复表单值。当前 96 个组件族（基础 55、复杂 22、AI 19），共 701 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **16/16** 交互通过：覆盖 Enter/中英文逗号、空值、三种重复策略、数量上限、编辑提交/取消/空值删除、删除焦点恢复、只读、禁用、FormData、同页 Controls，以及四种主题/密度的高度、可访问性和窄屏 containment。
- **52/52** InputTags Story 组合通过：13 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 紧凑/舒适单行输入容器实测为 32/40px；长标签可截断，标签换行仍由同一组 token 控制。
- 视觉检查覆盖 dark/compact 与 light/comfortable；中性弱边界、紧凑 chip、明确焦点与 14px 输入文字符合 Graphite 规则。Nuxt UI 与 PrimeVue 仅用于公开能力范围核对，没有复制源码、CSS、模板或资产。

证据：[交互测试](../tests/input-tags.spec.ts)、[Story 扫描](../.logs/storybook-input-tags.json)、[四组合截图](../.logs/input-tags)、[组件源码](../packages/ui/src/basic/input-tags.tsx)、[用法](components/input-tags.md)。
