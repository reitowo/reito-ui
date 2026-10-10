# 主题菜单紧凑密度验证 · 2026-10-10

参考：用户提供的本库深色主题选单截图，文件为 `C:/Users/reito/AppData/Local/Temp/codex-clipboard-144fffaa-cee7-4233-a44e-d91810dd107f.png`。这是对当前桌面组件总览菜单的修正，没有将外部产品截图当成官方尺寸规范。

## 原因与共享修正

本地浏览器实测确认 html 为 compact，但颜色选项仍为14px文字、20px行高、上下各8px内距，即36px一行。18项颜色加菜单外内距达到656px。较早的“选项稍微放大”反馈被后续共享间距调整过度放大。

唯一源 `packages/tokens/src/tokens.json` 将 menu-font-size 从 text-md 改为 font-interface（13px），menu-item-padding-y 从 compact / comfortable 的8 / 10px改为4 / 8px，横向12 / 16px保持。生成物由 tokens:build重建。DropdownMenu、ContextMenu、Menubar、Select和Combobox沿用共享角色，不添加宿主页面的CSS覆盖。单行标准菜单项为28 / 36px；多行说明项按内容计算高度。

## 渲染结果

在本地组件总览、深色 / compact、1303×1244视口检查菜单：Blue行实际28px，文字13px，上下4px、左12px；右側为选中勾预留32px。18项主色子菜单实际176×512px。主菜单与模式选项一起收紧，单列、名称、色点和勾选继续保留。列表仍展示18项，因此保留了完整颜色列表的纵向长度；没有增加色块网格或改变交互结构。

截图：`.logs/theme-menu-compact-after.png`，页面 `http://127.0.0.1:5173/?view=overview`，与用户截图比较可见行距和字号缩小，原有边界、圆角、阴影和页面结构保持。

## 实际检查

- `npm run tokens:build`通过。
- `npm run build`通过UI、Lab、Storybook和Workbench构建；仍有既有大包警告。
- `npm run check`在构建完成后通过，包括token生成一致性、源码规则、目录、token审计及全部workspace类型检查。审计为349文件、0未批准用法。首次与build并行的check遇到UI dist声明重建期间缺失；串行重跑通过。
- 相关Playwright共5项通过（43.1s）：深浅主题×两种密度下主题主菜单、颜色radio子菜单、普通下拉项、checkbox项、禁用项、右键菜单、Select项的尺寸及字体；End进入最后颜色、Enter选色、Escape关闭和焦点恢复；390px窄视口的原有主题菜单选择与恢复默认回归。
- 首次新测试将ThemeGuide误作comfortable检查宿主；该演示页固定compact。改用支持密度切换的Overview，断言实际根density后，四种组合通过；没有改组件来迎合错误的测试宿主。
- `git diff --check`通过。未运行全量交互套件，未提交或发布新的包版本。
