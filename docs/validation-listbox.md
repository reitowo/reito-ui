# LISTBOX-01 Listbox 验收

2026-09-07，LISTBOX-01 已完成。新增常驻 `Listbox`，覆盖单选/多选、受控选择和活动项、分组、搜索、图标与说明、禁用项、范围/批量选择、清除、只读/禁用、错误和重复 FormData。当前共 105 个组件族（基础 64、复杂 22、AI 19），843 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计无未批准项。
- **20/20** 测试通过：选择与活动项分离、Space 切换、方向键/Home/End、禁用跳过、分组名称、搜索、焦点交接、typeahead、Shift 点击/方向键、Ctrl/Command+A、清除、空态、只读/禁用、错误关联、FormData、受控活动项、同页 Controls，以及四种主题/密度。
- **68/68** Story 组合通过：17 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 富选项行在 compact / comfortable 下实测为 36 / 40px；dark/compact 与 light/comfortable 截图人工检查确认双行信息、分组和选择标记保持紧凑且清楚。
- `aria-activedescendant` 保持列表容器焦点，活动项与选中项独立；空态消息位于 listbox 语义外的共享滚动视口，避免无效 required-owned 元素。
- 当前只处理本地完整选项集合；窗口化、非可见选项定位和远程 loading/error 契约留给 LISTBOX-02。

证据：[检查](../.logs/listbox/check.log)、[构建](../.logs/listbox/build.log)、[交互](../tests/listbox.spec.ts)、[Story 扫描](../.logs/listbox/storybook-audit-final.json)、[四组合截图](../.logs/listbox)、[组件源码](../packages/ui/src/basic/listbox.tsx)、[用法](components/listbox.md)。
