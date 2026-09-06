# MASK-01 InputMask 验收

2026-09-07，MASK-01 已完成。新增 `InputMask`，覆盖 raw/display 双值、默认与自定义槽位、可选尾段、转义、不完整值策略、格式化粘贴、格式符边界删除、光标恢复、Unicode IME、只读/禁用、错误和原生表单值。当前共 104 个组件族（基础 63、复杂 22、AI 19），826 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **16/16** 测试通过：raw 格式化、真实剪贴板粘贴、可选分机、字母/数字/自定义槽位、格式符退格、allow/clear/restore、composition、raw FormData、字段状态、同页 Controls，以及四种主题/密度。
- **68/68** Story 组合通过：17 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- compact / comfortable 输入实测为 32 / 40px；dark/compact 与 light/comfortable 截图人工检查确认格式输入直接复用普通 Input 的边界、字号和内距。
- `9 / a / *`、字面量和 `?` 可选尾段构成首版 mask 语法；复杂条件、数字本地化和日期语义校验不冒充字符 mask，由专门字段或宿主 schema 处理。
- 能力范围核对 PrimeVue InputMask 的数字/字母/字母数字槽位、格式字面量、可选尾段和未完成值清空策略；React 状态机、raw 表单契约、composition 与光标处理为本项目实现。

证据：[检查](../.logs/input-mask/check.log)、[构建](../.logs/input-mask/build.log)、[交互](../tests/input-mask.spec.ts)、[Story 扫描](../.logs/storybook-input-mask.json)、[四组合截图](../.logs/input-mask)、[组件源码](../packages/ui/src/basic/input-mask.tsx)、[用法](components/input-mask.md)。
