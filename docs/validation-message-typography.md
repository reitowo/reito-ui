# 消息字号调整

2026-09-06，Windows / Microsoft Edge。根据用户对 Lab Conversation 两条消息的标注，将共享 Message 的用户、助手正文从 16px / 28px 行高调整为 14px / 24px，使用已有 `--rui-font-interface`。系统消息也使用相同行高；角色标签仍为 12px。两种密度字号一致，未修改全局字号 token 或 Composer 输入字号。

## 实际验证

后续校正：此记录的原始量度脚本仅设置了 Lab 的偏好键，Workbench 实际仍为默认 dark / compact；其 JSON 中其他 Workbench 主题/密度标签不能作为对应组合已验证的证据。Lab 四组合、默认 Workbench 字号量度及 Storybook 四组合仍有效。后续 [TaskQueue 验证](validation-task-queue.md) 使用 Workbench 独立偏好键并断言实际根主题与密度。

- `npm run check`、`npm run build` 均通过：[检查日志](../.logs/message-typography/check.log)、[构建日志](../.logs/message-typography/build.log)。
- Lab / Workbench × dark/light × compact/comfortable 的 8 组实际量度，用户与助手正文均从 16px / 28px 变为 14px / 24px：[调整前](../.logs/message-typography/before.json)、[调整后](../.logs/message-typography/after.json)。每组在 1503×1216、1280×800、960×720 检查，共 24 个布局无页面水平溢出。
- Conversation 的 Guidelines、Roles、Empty、LongConversation 共 4 stories × 4 主题/密度组合，16/16 通过。现有 LongConversation play 验证向上阅读暂停跟随、追加内容与“回到最新”；无页面/console error、axe 违规或水平溢出，扫描期间源码指纹一致：[报告](../.logs/message-typography/storybook.json)。
- Workbench 既有消息编辑、反馈、本地播放与停止保留草稿测试 1/1 通过：[日志](../.logs/message-typography/interaction.log)。

## 视觉比较与范围

参考本次用户的两个暗色紧凑页面标注，定位同一条用户消息与助手正文；以相同 1503×1216 视口记录前后。实际查看了 Lab 调整后的暗色紧凑、浅色舒适截图，以及 Workbench 暗色紧凑的前后完整工作面。正文与周围控件的字号更接近，行高收紧，用户气泡随内容变矮；助手正文保持自然换行，工具调用和产物按钮继续使用各自控件样式。

![调整后对话组件](../.logs/message-typography/after-lab-dark-compact.png)

本次只调整共享消息排版，页面结构、灰阶、边界、字重、阅读宽度与 composer 未修改；不由此推断与参考产品的像素相似度。未重新执行全库扫描、独立 tarball 消费验证或真实浏览器 200% 缩放；既有 0.4.1 tarball 保留原样。
