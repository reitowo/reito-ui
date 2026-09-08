# AI-COMPOSER-01 验收记录

2026-09-08。本项扩展现有 Composer，组件族数量仍为 131（基础 70 / 复杂 40 / AI 21）。公开草稿、命令、提及与上下文类型见 `packages/ui/src/ai/composer.tsx` 和 [使用契约](components/composer.md)。

## 当前验证

- `npm run check`：通过，日志 `.logs/composer-check.log`。
- `npm run build`：通过，日志 `.logs/composer-build.log`，保留已有的大 chunk 提示。
- `npx playwright test tests/composer.spec.ts --reporter=line`：15/15 通过。覆盖字符串兼容、空建议误发防护、Shift+Enter、候选键盘导航、提及前方和内部编辑、合成 IME、结构化失败重试与上下文 ID 保留、长列表自动滚入视区。
- 20 个 Composer Story × 两主题 × 两密度：80/80 通过，9 个带 play 的 Story，0 页面错误、0 axe 违规、0 横向溢出。报告 `.logs/composer-audit.json`。
- 本轮截图脚本使用已安装的 Edge；默认 Playwright Chromium 缺失，未为此下载浏览器。

## 已检查的视觉参考

实际查看 [Nuxt UI ChatPrompt](https://ui.nuxt.com/docs/components/chat-prompt) v4.11.1 的 With an Editor 深色示例，1100×760，截图 `.logs/composer-reference.png`。参考把输入与模式/发送工具放在同一轻量容器，内部边界较弱。

本地实际查看 `.logs/composer-dark-compact.png` 与 `.logs/composer-light-comfortable.png`，输入、上下文和操作共用同一圆角容器，候选列表使用中性选中背景。Reito 使用灰阶、中文提示和 ContextPill；与参考不同，当前候选内联展开，会增高输入容器，保留原生 textarea，不是 Tiptap 内联原子节点。附件属于下一验收项。其余两种主题密度截图已生成，自动组合检查通过。

## 补充验收与边界

已实际操作同页 Controls 改变文字、提及开关、禁用与错误状态，Story 路径保持不变。360px 下四种主题密度均验证候选展开、提及插入及无横向溢出，截图位于 `.logs/composer-narrow-*.png`，实际查看深色紧凑和浅色舒适截图。受控宿主在请求期间替换文字、提及和上下文后，旧请求完成仍保留新值；最终示例改用共享 Button 后专项回归 1/1 通过。真实系统中文 IME 未验证，仅合成事件覆盖；附件粘贴由 AI-COMPOSER-02 跟踪。
