# FORM-03 嵌套与数组验收

2026-09-06，FORM-03 已完成。公开入口沿用 `@reito/ui/complex` 的 `useFieldArray`、`Form` 和 `FormField`；增强共享 FormArrayDemo 配方及同页参数，不新增重复的数组状态引擎。

## 行为

- 项使用 RHF 的稳定 id 作为 React key；字段路径随当前位置更新。移动与删除后，存活项的值、错误和 touched 保持对应关系。
- dirty 保留 RHF 的位置基线语义。不同联系人互换会让两个位置变 dirty，恢复原顺序后回到未修改；不会把 dirty 误称为按业务 ID 的修改历史。
- 添加聚焦新邮箱；删除聚焦相邻邮箱；删除最后一项聚焦添加按钮。空数组校验显示可访问错误并关联添加按钮，提交失败后焦点也能到达该入口。
- reset 恢复嵌套工作区值、数组顺序和错误/touched/dirty。只读保留输入值和浏览焦点，禁用编辑、结构修改及提交。
- ArrayPlayground 同页支持 disabled、readOnly、initialCount、showFieldState、validationMode。另有空态、只读、禁用以及重复邮箱校验/移动交互预设。

## 验证

`npm run check`、`npm run build` 均退出 0；构建保留既有分包大小提示，无新增依赖或 token。

- **28/28** 测试：新增数组 10 项（含同页 Controls、四种主题/密度下窄屏键盘与 axe），原 Form/resolver 18 项。
- **20/20** Story 组合：5 个相关 Story × 深/浅主题 × 紧凑/舒适；1 个 play，0 页面错误、0 可访问性违规、0 横向溢出。
- 本轮冻结构建后执行检查，测试使用 6007 静态 Storybook；原 Form 回归使用 5173 Lab。目录仍为 90 个组件族。

证据：[检查日志](../.logs/form-array/check.log)、[构建日志](../.logs/form-array/build.log)、[交互结果](../.logs/form-array/interactions.log)、[Story 结果](../.logs/form-array/story-audit.json)、[测试源码](../tests/form-array.spec.ts)。

## 视觉参考

再次查看已采集的 PrimeVue Forms / ValidateOn 浅色参考，采集来源及主题见 [Form 视觉记录](validation-form-visual.md)。本配方沿用共享 Field/Input/Button 的纵排字段、邻近错误提示和密度，不复制参考的占位式标签与全宽提交按钮。数组行增加轻量移动/删除动作；字段状态是可关闭的检查辅助内容。

实际查看四张 390×900 窄工作面截图：[深色紧凑](../.logs/form-array/dark-compact.png)、[深色舒适](../.logs/form-array/dark-comfortable.png)、[浅色紧凑](../.logs/form-array/light-compact.png)、[浅色舒适](../.logs/form-array/light-comfortable.png)。控件、操作行、键盘焦点使用共享主题和密度，未增加卡片或页面样式覆盖。参考不包含同名数组重排工作面，因此仅对齐表单字段呈现，数组行为另由交互测试证明。

完整使用边界见 [Form 数组配方](components/form.md)。动态条件字段的注册/默认值/校验生命周期继续由 FORM-04 跟踪。
