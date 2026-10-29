# 弹出选项尺寸试调

日期：2026-10-10。用户标注 AsyncCombobox 输入框，指出相比下面的 Select / Menu 显得大，希望下方稍微放大看看。本次明确按展开的选项内容试调，未改变普通按钮、Tabs 和输入字段。

## 实测与修正

当前用户浏览器 dark/compact：异步输入为 32px 高、13px 字号；双行选项原为 44px 高、主文字 13px，padding 4px 32px 4px 6px。因此不是将选项高度低于输入当成事实，用户指出的是视觉比例；本次先调整选项的阅读尺度与留白。

共享 foundation.menu-font-size 引用 text-md=14px；menu-item-padding-y 从 compact/comfortable 的 4/6px 改成 6/8px。Select / Combobox 使用同一菜单内距，组标签横向对齐选项。DropdownMenu / ContextMenu / Menubar 的动作项、选择项、子菜单入口共用此字号和行高；普通触发器和辅助信息不跟随。

用户浏览器修改后实测：AsyncCombobox 每项 48px 高，主文字 14px，padding 6px 32px 6px 12px；输入框保持原尺寸。实际查看了同一页面的展开结果，未从截图像素推断 CSS 尺寸，没有新增图标、边框或 Card 分区。

## 验证

22 项 surface-consistency、Select 弹层定位、虚拟多选回归通过，含四主题密度的选项字号 / 内距、输入框高度不变、菜单键盘退出、远端虚拟位置 / 分页 / 动态行测量 / 查询取消与重试。AsyncCombobox 专项首次 12 通过、1 失败；该键盘测试只等待 TypeScript 可见，但 TypeScript 同时在初始结果和搜索结果中，可能选中尚未替换的初始 React。补充等待当前筛选结果仅剩一项后，键盘专项重跑通过，未修改异步选择行为。35 个唯一相关用例通过。

npm run tokens:build 和完整 npm run build 通过，包含 UI、Lab、Storybook、Workbench；保留已有大产物体积提示。最终 npm run check 通过，所有工作区类型、tokens 同步、目录命名和视觉 token 审计通过。git diff --check 通过。截图 .logs/popup-density-{theme}-{density}.png。

此调整来自本库用户提供的现状截图，不声称来自 Cursor 官方 token。此次检查的视觉方向是略放大弹出内容；其他控件尺度的调整仍需要实际组合比较。
