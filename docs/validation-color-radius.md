# ColorInput 色块圆角修复

2026-09-14：用户在 Lab 的 ColorPicker / ColorInput 截图中指出色块直角。共享 ColorTextField 的 addon 有 overflow-hidden，但没有圆角，颜色内容及透明棋盘格未按输入框轮廓裁剪。为该容器增加 rounded-[inherit]，从 InputGroup 继承圆角，覆盖按钮和只读预览；不改全局 token。

以用户提供的深色紧凑 Lab 截图为修正参考，实际检查修改后深浅主题紧凑输入框截图：色块已圆角，文本、尺寸与布局保持不变。浏览器检查 dark/light × compact/comfortable，addon 与输入框均为 12px 且开启裁剪；打开色板、Escape 关闭和焦点恢复全部通过。没有引入新的产品样式参考或资产。

本次 npm run check 与 npm run build 均通过；构建保留现有大 chunk 提示。
