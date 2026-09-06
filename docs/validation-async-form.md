# AsyncForm 验收记录

2026-09-06，FORM-02 验收通过。当前实现已加入公共 `useAsyncForm` / `AsyncForm`、Lab 目录与 5 个 Story，组件族总数为 90。此结论覆盖 FORM-02，不代表 FORM-03 / FORM-04 或全部缺口完成。

## 已验证

- 最终新增测试 **20/20**：控制器 5 项、浏览器 15 项。控制器覆盖立即取消、ABA 与旧 finally、提交校验中 reset、宿主保存中 reset 与晚回填、提交互斥及失败恢复、快照和转换输出。
- 浏览器覆盖 ABA、继续编辑但未再次校验、提交校验中重置并重试、同值记录切换、跨字段错误焦点与恢复、五种校验时机、同页 Controls，以及四种主题/密度下 390px 窄屏布局与 axe。
- 共享 FormFrame 调整后，原 Form 与 resolver 共 18 项回归通过。
- `npm run check` 与 `npm run build` 均退出 0，构建仅有现有分包大小提示。
- 冻结构建 6007 的 5 个 Story × 4 种主题/密度，**20/20**；1 个 play，0 页面错误、0 可访问性违规、0 横向溢出。
- 初轮开发服务缓存缺失模块，重启后恢复；请求列表缺少分组角色已修正。后续测试修正了只改 html 而未同步 Storybook 主题容器的测试设置，改为 globals；Controls 使用冻结构建。模式测试以无焦点副作用的事件返回模拟响应，避免测试操作本身触发额外 blur。以上问题均不隐藏，最终 20 项全通过。

## 视觉比较

检查了四种主题/密度的窄屏截图，使用与 Form 相同的共享 Field、Input、Button 和密度变量，未增加视觉 token 或页面覆盖。对照已采集并再次查看的 [PrimeVue Forms ValidateOn 深色参考](../.logs/form/reference-primevue-validateon-dark-form.png)，保留多字段纵排和邻近错误提示；本库有独立可见标签、局部宽度的提交按钮，以及用于演示取消语义的记录工具行，未照搬参考的占位提示和等宽提交按钮。

截图：[深色紧凑](../.logs/form-async/dark-compact.png)、[深色舒适](../.logs/form-async/dark-comfortable.png)、[浅色紧凑](../.logs/form-async/light-compact.png)、[浅色舒适](../.logs/form-async/light-comfortable.png)。参考来源与采集上下文见 [Form 视觉记录](validation-form-visual.md)。

## 契约与边界

见 [AsyncForm 使用说明](components/async-form.md)。请求控制器不让 RHF 异步 resolver 参与状态提交，避免旧 resolver 完成后再次更新错误或 touched/dirty。异步状态从 handle.state 读取，RHF 继续提供字段状态。reset 与 values 对象切换取消旧工作；宿主副作用不能回滚，提供 signal、isCurrent 和作用域 setFieldError。

证据目录：[交互日志](../.logs/form-async/interactions.log)、[检查](../.logs/form-async/check.log)、[构建](../.logs/form-async/build.log)、[Story 扫描](../.logs/form-async/story-audit.json)。后续重新执行可能更新这些文件，应以最终命令退出状态为准。
