# Reito UI 0.5.5

发布日期：2026-10-11。

本版完善共享 token 的运行时继承和紧凑控件表现，沿用已发布的138个组件族；本地 Kanban 草稿不属于本版。

- CSS 别名保留基础变量引用，支持基础色阶、语义角色和组件参数的动态调整。
- ReitoThemeProvider 新增受类型约束的 tokens 配置，支持父子作用域按键合并，弹层继承局部配置。Button、Input、Menu、Card、ScrollArea 接入组件 token。
- 菜单主文字使用13px界面字号，紧凑单行28px、舒适单行36px，主题色菜单与共享选择器保持同一尺度。
- 表单错误使用沿内边缘向内淡出的共享高亮，支持主题错误色、强制颜色和独立键盘焦点；组合输入避免重复高亮。
- ScrollArea inset 变体改为薄上下边缘，文件行复用菜单尺度，避免容器和数据单元格内距叠加。

组件 token 和语义角色可以运行时覆盖；数值型 metrics 和容器查询断点仍在构建时确定。已存在的显式尺寸、组件颜色配置和多行内容保留各自契约。0.x 默认视觉的调整需在消费应用中检查。

安装：

```sh
npm install @reito/ui@0.5.5 @reito/tokens@0.5.5
```

实现与验证记录见 component-tokens.md、validation-component-tokens.md、validation-menu-density.md、validation-inset-glow.md 和 validation-scroll-area-insets.md。发布流程执行完整构建、静态检查、核心交互回归与包契约检查后，按 tokens、ui 顺序发布 npm 包。最终发布状态以 GitHub Actions 和 npm registry 为准。
