# 树行焦点修复

日期：2026-10-10。用户提供本库树导航截图：components父目录、button.tsx、input.tsx、禁用private.tsx同时出现整圈蓝框。

原因：TreeView的每个li使用group/treeitem，内部行使用group-focus/treeitem:ring。父节点获得焦点时，所有后代行也能匹配相同祖先选择器；该规则对鼠标focus同样生效。不是多个元素真的同时获得DOM焦点，也不是token颜色失效。

当前共享规则：
- TreeView的li使用rui-tree-item；仅直接子代 :focus-visible > [data-slot="tree-item-row"] 获得样式。
- 键盘当前行采用中性hover表面和2px焦点色内侧领先标记，取消整圈ring。
- 普通选中保留原中性背景和字重，鼠标点击不添加键盘焦点提示。
- DisclosureTree同样使用当前行的focus-visible标记，保留summary和button原生键盘语义。
- AsyncTreeView、ReorderableTreeView和其他TreeView组合继承同一规则。拖放目标的提示继续由独立data-drop-position控制，不与键盘焦点混淆。
- 强制颜色模式使用系统Highlight描边，只作用于当前行；未移除键盘停靠点、焦点恢复或禁用语义。

实际在总览的深色紧凑TreeView复现相同父目录聚焦路径：全部行中仅components有inset shadow（2px），子项和禁用项没有。截图.logs/tree-focus-{theme}-{density}.png记录四组合。对照用户附图及此前检查的Cursor工作区控件参考，保留本库原创灰阶、行高、缩进和字体，仅修正焦点归属与外观；不能用回归计数证明产品像素相似。

新增4项测试覆盖鼠标quiet、父焦点不传给后代、键盘箭头在父子之间移动、选中语义、系统强制颜色及DisclosureTree原生Tab顺序。原有TreeView、勾选与重排回归另外执行。最终命令结果见下面更新。

最终结果：npm run check、npm run build、git diff --check通过；32项相关测试全部通过（新增树行焦点4项、TreeView8项、勾选树11项、重排树9项）。测试包含四种主题密度、系统强制颜色、焦点恢复和原有axe / 窄布局。生产构建保留既有大chunk告警。CI列表196项、23文件；未声称远端执行，未提交或发布这些本地变更。

## 取消左侧标记（2026-10-10）

用户进一步明确不接受左侧高亮条。当前树焦点取消左侧2px阴影，改为hover语义灰底和1px中性内描边（border-width / text-muted）。仍仅作用于键盘focus-visible的当前直接行；鼠标点击保持无焦点框，父焦点不传给后代。此前领先标记截图和32项结果保留为历史记录。

当前截图为.logs/tree-focus-neutral-{theme}-{density}.png。新增规则的4项四组合检查全部通过，额外断言阴影四边零偏移、1px spread和text-muted解析后的中性色，保留强制颜色、父子移动与DisclosureTree Tab顺序的检查。

本次取消左侧条后的 npm run check、npm run build、git diff --check 均通过；4项四组合焦点检查全绿。页面实际 computed shadow 为中性灰色、0 / 0偏移、1px spread inset。没有再次执行上一轮全部32项行为测试，未改变其交互实现。
