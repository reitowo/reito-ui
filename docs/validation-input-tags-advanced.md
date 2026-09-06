# TAGS-02 InputTags 高级输入验收

2026-09-07，TAGS-02 已完成。InputTags 在 TAGS-01 基础上增加批量粘贴拆分、中文 IME 保护、本地/异步建议、建议 loading/error/retry 与过期保护、明确创建项、异步创建事务、标签级禁用/错误，以及 chips 与建议的键盘导航。组件总数保持 98 族（基础 57、复杂 22、AI 19），Story 总数增至 734。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **16/16** TAGS-02 新增交互通过：批量粘贴、composition 生命周期、建议与禁用项、键盘建议选择、异步 loading/error/retry/过期保护、创建 pending/success/failure、标签状态、chip 焦点流、同页 Controls，以及四种主题/密度。
- **16/16** TAGS-01 回归通过，覆盖原有创建、分隔、去重、上限、编辑、删除、只读/禁用、FormData、Controls 和视觉矩阵。
- **92/92** InputTags Story 组合通过：23 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 建议工作面的 compact / comfortable 输入实测为 32 / 40px；dark/compact 与 light/comfortable 截图人工检查通过，chip、查询、双行建议和创建项均使用共享 Graphite tokens。
- 本地示例只验证 UI 契约；远程查询、标签持久化和服务端校验仍由宿主提供。

证据：[检查](../.logs/input-tags-advanced/check.log)、[构建](../.logs/input-tags-advanced/build.log)、[新增交互](../tests/input-tags-advanced.spec.ts)、[基础回归](../tests/input-tags.spec.ts)、[Story 扫描](../.logs/storybook-input-tags-advanced.json)、[四组合截图](../.logs/input-tags-advanced)、[组件源码](../packages/ui/src/basic/input-tags.tsx)、[用法](components/input-tags.md)。
