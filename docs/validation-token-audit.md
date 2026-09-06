# 全组件 Token 统一验证

2026-09-06，Windows / Microsoft Edge，Node 24.11.1，当前工作区源码。实施范围与静态边界见 [审计说明](token-audit.md)。

## 已执行

- `npm run check`：通过，包含 tokens/catalog 一致性、语义色、100 对对比度、全组件 token 审计与所有工作区类型。[日志](../.logs/token-audit/check.log)。扫描 197 文件，0 未批准项，25 条精确例外对应 28 处使用；所有例外原因可审查，没有关闭颜色或未知 token 检查。
- `node scripts/audit-design-tokens.mjs --self-test`：33 条断言通过，包含间接常量、容器查询拒绝运行时 var、生成常量与 token 源一致性。
- `npm run build`：UI、Lab、Storybook、Workbench 构建通过。[日志](../.logs/token-audit/build.log)。最后的 PropertyList story 兼容性修正再次单独构建 Storybook 通过：[日志](../.logs/token-audit/storybook-build-final.log)。已有 >500kB chunk 提示保留，未提高阈值。
- `npm run test:ui`：**45/45 通过**。[日志](../.logs/token-audit/ui-final.log)。包含深浅/密度、Input/Button/Composer 的 token 实时覆盖、宽窄分栏、表格/AI 内容密度、ContextPill、语法高亮、文件树原生键盘与指针、Workbench 三工作面、IME 合成事件、390/640/960/1280 布局和 200% 文字放大。最后只改 Storybook 测试包装，不改运行组件。
- 最终静态 Storybook 全量：**880/880 通过**，220 stories、88 组件族、54 个 play，dark/light × compact/comfortable；无 page/console error、axe 违规或页面水平溢出，扫描前后源码指纹相同。[最终报告](../.logs/token-audit/storybook-final.json)、[日志](../.logs/token-audit/storybook-final.log)。使用 `--base-url http://127.0.0.1:6007` 检查刚构建的静态产物；开发版 PropertyList 的补充四组合也通过。
- 动画与 hover 额外浏览器探针：dark/light 两组通过，实际覆盖 duration/ease 后 Accordion 为 600ms/linear，secondary Button 仍有 hover 色差。[记录](../.logs/token-audit/motion-metrics.json)。
- 40 组完整页面量度：Input、Workspace、DataTable、Composer、Workbench × 四主题/密度 × 1280×800 / 960×720，根主题/密度匹配、无页面水平溢出或 page error。[记录](../.logs/token-audit/visual-metrics.json)。

## 视觉比较

实际查看本轮暗色紧凑 Input、Workspace、Workbench，以及浅色舒适 Composer。对照前序用户 Workspace 标注与 [上轮工作区截图](../.logs/workspace-density/after-dark-compact.png)，保留目录的紧凑行、30/70 分栏和中性工作面；本轮 Lab 辅助字归到 12px、字号与字重纳入角色、内容内距随密度一致变化。Composer 的背景与圆角现在采用其既有专用 token。

视觉复查发现容器查询使用运行时 var 会令宽工作台错误纵排，已改为从 token 源编译尺寸，并新增浏览器分栏断言；[修正前证据](../.logs/token-audit/workbench-container-regression.png) 保留。下面为修正后的完整工作面。

![工作台暗色紧凑](../.logs/token-audit/workbench-dark-compact.png)

构建、axe 和状态测试不证明与 Cursor / Claude 像素一致。本次没有重新复制产品资产，也没有单独修改页面配色来贴近截图。

## 初始失败与边界

首次 UI 检查在新增 `@reito/tokens/metrics` 导出后命中了旧 Vite 导出缓存，16 项失败；服务重载后已完整重跑并通过，原日志保留 [于此](../.logs/token-audit/ui-initial.log)。

开发版 Storybook 首扫 870/880，10 次失败为导航中断/超时；最终改用构建产物的静态预览，避免开发服务热更新干扰。静态首扫 876/880，PropertyList 四组合由于生产 React 不提供 act 而失败。示例现按实际运行环境使用 act 或直接执行，再等待取消与焦点恢复；开发版定向 4/4 已通过。原始 [开发报告](../.logs/token-audit/storybook-dev-initial.json)、[静态报告](../.logs/token-audit/storybook-static-initial.json) 保留，不用最后结果覆盖初始失败。

未重跑独立 tarball 消费、真实 OS 中文输入法或真实浏览器 200% zoom；测试中的 200% text 明确为文字放大。已有 0.4.1 tarball 未覆盖，本轮改动仍为工作区增量。
