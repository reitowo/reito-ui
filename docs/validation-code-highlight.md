# CodeBlock 语法高亮

2026-09-06，Windows / Microsoft Edge，工作区源码。此前 CodeBlock 的 `language` 仅为标签，内部直接输出源码字符串；现在共享组件使用固定版本 Refractor 5.0.0 的语法树渲染 token span，Artifact 和 Workbench 代码视图同步生效。复制仍使用原始 `code`。

## 实现与主题

- 只注册 15 类常见语法：JavaScript、TypeScript、JSX、TSX、JSON、HTML/XML、CSS、Bash、PowerShell、Python、SQL、YAML、Markdown、Go、Rust。支持相应常用别名；默认纯文本，不自动猜测语言。
- 以 React 文本和 span 渲染，不注入源码 HTML。未知语言、显式纯文本及超过 50,000 个 UTF-16 代码单元的输入保留纯文本；语言白名单排除解析器内部方法名（如 extend），代码或语言变化会重新计算当前高亮。
- 在 token 源新增 9 个语法角色，CSS 只作用于共享 code-content slot。深浅色分别定义关键字、字符串、注释、数字、函数、类型、属性、运算符、标点；色值与引擎许可来源见 [设计语言](design-language.md) 和 [参考记录](references.md#codeblock-语法引擎2026-09-06-工作区增量)。
- 代码保持原有等宽字体、12px 字号、24px 行高和 12/20px 内容内距，没有增加嵌套 padding。[Lab / Artifact 四组合的实际量度](../.logs/code-highlight/visual-metrics.json)。

## 最终检查

| 检查 | 结果 | 范围 |
| --- | --- | --- |
| `npm run check` | 通过 | token / catalog 同步、全部工作区类型、语义样式和 100 对颜色对比，其中语法角色新增 54 对；[日志](../.logs/code-highlight/check.log) |
| `npm run build` | 通过 | UI、Lab、Storybook、Workbench；[日志](../.logs/code-highlight/build.log) |
| 定向 Playwright | 5/5 通过 | CodeBlock / Artifact 的 dark/light × compact/comfortable：真实颜色不同、源码一致、剪贴板 API 入参、键盘焦点、版本切换；另含 Workbench 产物编辑、差异与检查点恢复 |
| 定向 Storybook | 64/64 通过 | CodeBlock 11 stories + ArtifactPanel 5 stories × 4 主题/密度；8 个 play，含 15 类语言逐个切换、未知/超长回退、HTML 原文、动态更新、复制及长行滚动；[最终报告](../.logs/code-highlight/storybook-final.json) |

最终 Storybook 结束状态无页面/console error、axe 违规或页面水平溢出，前后源码指纹一致。最初扫描的 12 个失败组合保留在 [初次报告](../.logs/code-highlight/storybook.json)：4 个受开发服务器依赖预构建缓存影响，8 个揭示 Refractor 把 text/plain 也注册为空语法，导致纯文本误标为已高亮。显式纯文本现直接回退；最终重新执行 check、build 和所有受影响 stories，没有放宽检查。

构建仍提示 Workbench 单个 JS chunk 超过 500kB（约 548kB / gzip 181kB），退出码为 0；没有通过提高警告阈值隐藏它。这里未重跑全库 stories、独立 tarball 消费、真实系统剪贴板或浏览器 200% 缩放。已有 0.4.1 tarball 未覆盖，新增依赖及源码需下次版本化分发。

## 视觉对照

参考本次用户标注的暗色紧凑 CodeBlock 截图（1503×1216 视口）：原来整段使用正文色，现在关键字为紫色、字符串为绿色，其他 token 使用相应语法角色。实际查看了相同视口下的深浅紧凑 CodeBlock、暗色紧凑 Artifact 和 Workbench 产物代码面板；字体、内距、边界和工具栏保持原结构，长行在代码区域内滚动。语法配色是本库原创定义，不宣称与 Cursor / Claude 的主题色值完全相同。

![深色紧凑代码高亮](../.logs/code-highlight/code-block-dark-compact.png)

可在 [CodeBlock 多语言示例](http://127.0.0.1:6006/?path=/story/ai-codeblock--languages) 切换语言并检查主题与密度。
