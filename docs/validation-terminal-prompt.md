# TerminalPrompt 验收

日期：2026-09-07

## 范围

TERMINAL-01 新增宿主驱动的命令交互面板，覆盖命令草稿、历史导航、响应/错误列表、提交/取消、失败恢复、滚动跟随、长输出与中文 IME。执行、进程、权限和 PTY 明确保留给消费应用。

## 自动验证

- `npx playwright test tests/terminal-prompt.spec.ts --workers=1`：19 项通过。
- 行为覆盖 live log 与原生列表语义、普通 Enter、IME 候选 Enter、历史边界与草稿恢复、异步提交防重复、失败保留、宿主并发草稿更新、Escape/按钮取消、取消失败、跟随恢复、清除回调、空/错误/只读/禁用和长输出。
- 深色/浅色主题 × 紧凑/舒适密度均执行 axe 与 390 × 720 窄工作面截图检查；输出区保持 256px token 高度，页面级横向溢出为 0。
- Storybook 本族 18 个 Story × 4 组主题密度，共 72 次组合审计通过；page error、console error、可访问性违规和页面级横向溢出均为 0，审计期间源码指纹保持不变。
- Playground 的 11 个可调 props 均有显式 Controls 和初值；浏览器测试验证 Controls 与组件回调双向回写且不切换 Story。
- `npm run check` 与 `npm run build` 通过；生产构建仅保留既有的 chunk size 提示。

全库 `test:storybook:controls` 仍会在既有 `复杂-asynctreeview-异步树--playground` 缺少显式 Controls 时提前停止；TerminalPrompt 的 Controls 契约已单独验证，没有把该全库命令写成通过。

## 视觉检查

检查 `.logs/terminal-prompt/dark-compact.png` 与 `light-comfortable.png`。在 256px 宽窄面中，面板标题、提示符、命令、时间/状态和底部输入保持清楚的单列层级；输出行使用 cell padding，输入区使用 XS 高度控件，没有额外卡片嵌套。默认输出高度来自 `--rui-terminal-height`，长内容只在输出区域滚动。

参考为 [PrimeVue Terminal 官方 Basic 与 Accessibility 说明](https://primevue.dev/terminal/)，检查日期 2026-09-07。共同结构是历史命令/响应、单行提示符、Enter 提交和 live 输出。Reito UI 增加了宿主状态、取消、失败恢复、历史草稿和滚动跟随，同时使用 Graphite 灰阶与紧凑工具栏；没有复制 PrimeVue 模板、源码或样式。剩余差异是本组件不模拟 ANSI、光标控制、PTY 尺寸或真实 shell 输出。
