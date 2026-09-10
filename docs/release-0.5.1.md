# Reito UI 0.5.1

## 发布内容

- SelectInput：以数据选项组合共享 Select，支持字符串和数字值、受控状态、禁用选项、表单提交及触发器焦点。
- 表格、表单、PropertyList 和 KeyValueEditor 统一使用主题化选择菜单；原生选择器移到显式 @reito/ui/native 兼容入口。迁移说明见 reuse-guide.md。
- 合并 PR #4：Conversation、WorkspacePane 和 ScrollArea 使用共享键盘焦点标记，保留强制颜色模式下的可见焦点。
- 所有工作区包与内部依赖同步为 0.5.1。Kanban 等此前暂停项不在本次发布内。

## 2026-09-10 验证

在独立检出中完成 npm run build、npm run check；相关 Playwright 回归 136 项全部通过（1.7 分钟）。覆盖 SelectInput、表格筛选/列管理/受控状态/编辑/偏好、动态表单、表单、键值编辑、属性编辑及 PR #4 滚动焦点。主题和密度组合、键盘、强制颜色、相关无障碍和窄屏行为按测试用例覆盖。构建保留既有大 chunk 提示。

GitHub Pages 从 main 构建发布。版本显示来自 Lab package.json；本地版本号不能代替线上部署结果。此记录不表示已发布 npm 包。
