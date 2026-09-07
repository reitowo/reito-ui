# COMBO-SPLIT-01 · SplitButton 验收记录

日期：2026-09-07

## 范围

新增复杂层 `SplitButton` 组合，复用 `ButtonGroup`、`Button` 与 Base UI `DropdownMenu`。验收覆盖默认命令、相关菜单、整组/两按钮/单条目禁用、三层忙碌状态、空菜单、可访问标签、快捷键提示、受控弹层、类型查找、Escape 与焦点恢复。

## 行为验证

- `tests/split-button.spec.ts`：13/13 通过。
- 主命令和菜单条目调用各自宿主回调；选择条目后菜单关闭并把焦点还给触发器。
- 菜单触发器可用 ArrowDown / Enter 打开；方向键、Home、类型查找和 Escape 沿用 Base UI Menu。
- `disabled / actionDisabled / menuDisabled` 互不混淆；主操作、菜单内容和单项 loading 都有 `aria-busy` 与重复触发保护。
- Playground 的 label、可访问名称和 open 状态可在同一个 Story 中由 Controls 修改并双向同步。
- dark/light × compact/comfortable 四组中两按钮高度一致、边缘相接、页面没有水平溢出，定向 WCAG 2A / 2AA / 2.1AA axe 扫描无违规。

## Storybook 与构建

本族提供 9 个 Story：Playground、默认示例、图标/快捷键、独立禁用、主操作忙碌、菜单加载、单项忙碌、空菜单、键盘/焦点。9 × 4 = 36 次冻结 Story 组合全部通过：页面错误 0、控制台错误 0、WCAG 违规 0、横向溢出 0。`npm run check` 通过，catalog 为基础 70 / 复杂 33 / AI 20，共 123 族；token 审计 288 个文件、0 个未批准项。`npm run build` 的 UI、Lab、Storybook 与 Workbench 全部通过，仅保留既有 Vite 大 chunk 提示。

## 视觉对照

实际查看 PrimeVue 官方 [SplitButton](https://primevue.org/splitbutton/) 当前浅色桌面页面，视口 1280 × 900，截图保存在本地 `.logs/references/primevue-splitbutton-2026-09-07.png`。参考页面把默认命令与下拉箭头做成一个共享外轮廓，这是本组合采用的结构判断。

Reito UI 在 960 × 720 下检查了 Graphite dark/compact 与 light/comfortable：两按钮使用同一高度、紧凑文字、单一内接缝，弹层按菜单按钮右缘对齐，图标、文字、禁用态和快捷键形成稳定三列。深色与浅色继续消费本库 primary、popover、border、muted、ring 和 control-height tokens。

仍有意保持的差异：不复制 PrimeVue 的品牌色、字体、圆角、阴影、菜单模型或 CSS；Reito 的间距更紧，菜单由 Base UI 驱动，并提供菜单加载、单项加载及独立禁用契约。PrimeVue 文档页面的外围导航和演示卡片不属于本组件参考范围。
