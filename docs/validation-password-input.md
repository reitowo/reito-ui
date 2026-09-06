# PASSWORD-01 PasswordInput 验收

2026-09-07，PASSWORD-01 已完成。新增 `PasswordInput`，覆盖显隐及焦点恢复、宿主规则、默认与自定义强度、反馈关闭、受控值与提交、空值、必填、只读/禁用、错误关联、自动填充语义和原生表单值。当前共 103 个组件族（基础 62、复杂 22、AI 19），809 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **14/14** 测试通过：显隐和焦点、规则/强度更新、宿主算法、失焦提交、关闭反馈、原生字段状态、宿主错误关联、FormData、自动填充、同页 Controls，以及四种主题/密度。
- **60/60** Story 组合通过：15 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- compact / comfortable 输入实测为 32 / 40px；dark/compact 与 light/comfortable 截图人工检查确认显隐按钮、四段强度、规则列表和辅助信息保持紧凑。
- 密码政策和泄露检查留给宿主。默认强度只反映宿主规则通过比例，可通过 `getStrength` 完全替换；关闭反馈后普通密码输入语义不变。
- 能力范围核对 PrimeVue Password 的 strength / toggleMask / aria-live，以及 Base UI Input 和 Form 的名称、描述、错误与 ref 要求；React API、规则模型和 Graphite 样式为本项目实现。

证据：[检查](../.logs/password-input/check.log)、[构建](../.logs/password-input/build.log)、[交互](../tests/password-input.spec.ts)、[Story 扫描](../.logs/storybook-password-input.json)、[四组合截图](../.logs/password-input)、[组件源码](../packages/ui/src/basic/password-input.tsx)、[用法](components/password-input.md)。
