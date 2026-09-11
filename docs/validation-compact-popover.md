# 紧凑浮层列表验证

针对数据表中展开的短路径列表，名称与方法/计数默认同排；不增加重复标题、段落和行分隔。通用 Popover 的默认组合保持兼容，信息列表显式选择 `variant="list"`。这些规则同时记录在设计语言与组件文档中。

## 已执行

- `npm run check`：通过，包括 tokens 同步、目录一致性、设计检查、token 审计及全部工作区类型检查。
- `npm run build`：UI、Lab、Storybook、Workbench 构建通过；保留现有的大包体积提示。
- 构建产物的服务端渲染检查：路径/元数据内容保留、文本转义、原生列表语义及显式多行通过。
- `npx playwright test tests/popover-list.spec.ts --list`：成功发现 12 个用例。该命令只验证用例可加载，不代表交互断言通过。

初次安装遇到上游锁文件缺少可选依赖记录，使用 `npm install --ignore-scripts --no-package-lock` 完成隔离安装，未修改锁文件。首次 check 与 tokens 构建同时运行时读到生成文件中间状态；生成结束后顺序重跑 check 通过。

## 待执行

当前浏览器工具连接不可用，未完成视觉比较及 Playwright 交互执行。PR 保持草稿，不能把构建或 SSR 检查视为实际行高、窄屏和焦点行为证明。

交互用例覆盖 dark/light × compact/comfortable、桌面/窄屏、单行几何、浮层不改变宿主尺寸、Escape/外部点击关闭、键盘滚动、长路径及显式多行。Storybook 用例沿用 `REITO_STORYBOOK_URL`（默认 6007）；启动 Lab、Workbench 与该 Storybook 服务后运行上述用例，不使用线上服务。
