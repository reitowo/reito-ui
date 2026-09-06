# Reito Workbench

一个直接消费 `@reito/ui` 公共基础、复杂与 AI 组件的完整本地示例。默认端口 **5175**，与组件目录 Lab 的 5173 分开。

从仓库根目录运行：

```sh
npm run dev:workbench
npm run typecheck --workspace @reito/workbench
npm run build --workspace @reito/workbench
npx playwright test -c apps/workbench/playwright.config.ts
```

## 可操作路径

- **Agent**：编辑和记录消息、将请求加入本地队列、暂停或取消队列状态、对消息反馈、播放并停止固定示例文本、新建会话、用建议填入草稿。
- **产物预览**：从消息打开 `WorkspaceSettings.tsx`，切换代码或版本，修改名称。宽屏使用并排面板，窄屏使用保留键盘焦点语义的 Dialog。
- **文件与差异**：搜索与选择资源、检查明确的前后行配对、切换差异布局、记录审查行为、筛选或清除日志、通过确认层恢复本地名称。
- **设置**：验证名称、调整数字字段、开关后续本地日志、编辑和验证键值参数。名称状态与产物、侧栏和差异共享。
- **外观**：在 `html` 上切换主题与密度；这两项偏好保存在浏览器。其他数据只保留在当前页面。

这个示例没有后端。消息内容、队列和文件差异来自本地数据；工具状态没有执行命令，恢复点没有修改磁盘，模型选择没有连接模型服务。

## 复用方式

`src/App.tsx` 只从公共 `@reito/ui` 导入组件，不复制组件实现。`AppShell` 与 `WorkspacePane` 管理布局，页面只持有业务状态和回调。`src/data.ts` 明确提供资源、日志、队列和差异数据；`src/app.css` 只定义应用布局并引用共享语义令牌。

Vite 和 TypeScript 的 alias 用于仓库内开发，可以直接验证尚未打包的公共入口。将此示例迁移到独立工程时，安装相同版本的 `@reito/ui`、`@reito/tokens` 并移除仓库源码 alias；主题和密度仍放在 `document.documentElement`。同时把 `src/app.css` 顶部指向仓库的 `@reference` 替换为下面两行，让消费项目生成自己的布局 utilities；组件本身仍从 `@reito/ui/styles.css` 加载已编译样式。

```css
@import "tailwindcss";
@import "@reito/tokens/tailwind";
```

独立工程保留 Tailwind 4 / Vite 插件来构建该应用自身的 utility 类。只使用组件包、不使用本示例的应用 utility 时，消费项目无需 Tailwind 插件。

## 验证记录

2026-09-06，版本 0.4.1：

- `npm run build --workspace @reito/workbench` 通过，包含 TypeScript 检查与 Vite 生产构建。
- 独立 Playwright 测试 **14 / 14 通过**，测试文件为 `tests/workbench-app.spec.ts`。
- 三种视图检查 dark/light × compact/comfortable；console、页面错误和 WCAG 2 A/AA、2.1 AA 的 axe 检查无未处理问题。
- 390、640、960 px 以及 1280 px / 200% 根字号检查无页面级横向溢出；窄屏产物 Dialog 的 Escape 与焦点回收通过。
- 消费流程发现并修复了共享 Composer 的停止按钮默认行为：同步结束运行不会再意外提交现有草稿。对应新增 Storybook 回归为 `AI/Composer/Stop Preserves Controlled Draft`。

以上检查不代表完整无障碍认证，也不覆盖真实操作系统中文输入法或任何外部 AI、文件系统集成。

## 视觉检查

对照了 [Cursor Agents Window 官方文档](https://cursor.com/docs/agent/agents-window) 中已经保存并查看的应用截图，仓库参考为 `.logs/references/audit-cursor-agents-window.png`。该参考是浅色工作面且打开了命令弹层，背景被遮罩变暗，因此没有从背景像素推导本项目的颜色。

实际查看本地 **1440 × 1000、compact** 的 Agent + 产物深色页面，以及文件审查浅色页面。这里采用了短标题工具栏、正文直接放在工作面上、底部单一 composer、需要时才打开的产物面板。文件列表与差异并排，日志独立滚动；设置保持表单结构。

剩余差异是有意保留的：导航只有三个本地功能视图，文件内容和工具状态为演示数据；没有 Cursor 的真实 PR、代码编辑器、扩展或命令系统。颜色、字体、控件密度与圆角来自 Reito 的共享令牌，并不声称像素复刻。

代表截图：

- `docs/images/v04-workbench-agent-dark.png`
- `docs/images/v04-workbench-files-dark.png`
- `docs/images/v04-workbench-settings-dark.png`
- `docs/images/v04-workbench-files-light.png`
