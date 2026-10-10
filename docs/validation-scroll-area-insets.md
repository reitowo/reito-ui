# 滚动列表内距验证

参考为本轮用户标注的 Reito UI 总览截图，深色、compact、1303×1244，目标为 Scroll Area 文件列表。该截图展示滚动到中部的列表；此前 Root 上下8px与行内 cell padding 6px叠加，单行32px，边缘和行间距较松。

共享 ScrollArea 的 inset 变体新增组件 padding-x/y token。横向继承 compact-surface-padding-x（compact 12px / comfortable 16px），纵向引用 space-1（4px）；default 变体继续不附加内距。文件列表共享示例的行内距采用 Menu item-padding-y 与 item-line-height，单行28 / 36px。未修改 Lab 页面 CSS。

在实际总览中检查 dark/compact：Root padding=4px 12px，行padding=4px 0px，高28px；顶部行从 viewport 起点进入，左右图标不再叠加行内距。完整示例截图保存在 `.logs/scroll-area-insets-live.png`，页面仍保留原来窄文件列表的示例宽度和容器边界。滚动到任意位置时允许首尾行被正常裁切；本次未引入滚动吸附，也未改变滚动语义。

`tests/scroll-area-insets.spec.ts` 的深浅主题×两种密度四项检查通过：固定边缘、行高、键盘 PageDown、Ctrl+End / Ctrl+Home、首尾可达、外层高度稳定和运行时组件 padding-y 覆盖。首次运行发现原引用 control-inset 实际为3px，已改为正确的 space-1（4px）并重建后重跑。连同 token-generation 三项回归，最终结果：7 passed，见 `.logs/scroll-area-insets-tests-final.log`。

首次全库 check 发现新组件名 scroll-area 含连字符，而生成器没有引用 TypeScript 属性名。已在源生成器统一使用 JSON.stringify 引用组件键，重新生成声明后执行全库检查；未手改生成文件。

全库 `npm run check`、`npm run build` 均通过（退出码0），结果记录于 `.logs/scroll-area-insets-check.log`、`.logs/scroll-area-insets-build.log`。token 审计351文件、0未批准项、29项精确登记例外；构建保留已有的大体积 chunk 提示。`git diff --check` 通过。
