# FORM-04 动态条件表单验收

2026-09-06，FORM-04 已完成。交付为可复用配置配方，使用公开的 AsyncForm / FormField 和共享 Input / NativeSelect / Switch；不是 schema 自动生成或 JSON FormBuilder 引擎。源码和生命周期说明见 [动态表单配方](components/dynamic-form.md)。

## 已验收行为

- 按配置映射字段类型与显示条件，使用稳定字段名作为 key。
- 团队名称和通知邮箱按条件显示；隐藏字段不参与校验、不进入最终 Payload。
- retain 保留隐藏草稿，discard 清除草稿与状态；重新显示时恢复对应值并再次参与校验。隐藏无效字段后可以提交，恢复显示后仍须通过规则。
- reset 恢复默认条件和所有初始值，清除错误和保存结果。Controls 改初始条件会更新默认基线；修改提交行为不清除草稿。
- 保存失败后保留草稿并可重试；临时保存锁复用 AsyncForm，所有结果均为本地示例。
- 同页 Controls 提供初始类型、初始通知、隐藏值策略、禁用和提交结果。

## 结果

- `npm run check`、`npm run build` 退出 0；无新增依赖/token，仅既有构建分包大小提示。
- **30/30** 测试：动态配方新增 10 项、AsyncForm 回归 20 项。覆盖两种隐藏策略、隐藏错误恢复、重置、禁用、同页 Controls 重试，以及四种主题/密度下窄屏错误状态和 axe。
- **20/20** Story 组合：5 个动态预设 × 深/浅 × 紧凑/舒适；0 页面错误、0 可访问性违规、0 横向溢出。此组无 play，交互由上述浏览器测试执行。
- 构建完成后冻结源码，测试使用 6007 静态 Storybook。

证据：[检查](../.logs/form-dynamic/check.log)、[构建](../.logs/form-dynamic/build.log)、[测试日志](../.logs/form-dynamic/interactions.log)、[Story 扫描](../.logs/form-dynamic/story-audit.json)、[交互源码](../tests/dynamic-form.spec.ts)。

## 视觉

实际检查了 390×900 的 [深色紧凑](../.logs/form-dynamic/dark-compact.png)、[深色舒适](../.logs/form-dynamic/dark-comfortable.png)、[浅色紧凑](../.logs/form-dynamic/light-compact.png)、[浅色舒适](../.logs/form-dynamic/light-comfortable.png) 截图。沿用此前已查看的 PrimeVue Forms / ValidateOn 表单参考，来源和图像见 [Form 视觉记录](validation-form-visual.md)。

保持字段纵排、错误紧邻字段和清晰焦点；本库使用独立标签和局部宽度的按钮，类型选择器按内容宽度呈现。新增条件开关及规则说明服务于配方检查，未增加卡片或独立视觉覆盖。参考未提供相同条件字段场景，不以此声称像素或完整交互复刻。
