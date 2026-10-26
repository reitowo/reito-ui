# 默认主题与组合验证

本轮修复默认 Button/Input/Select 的尺寸对齐，Empty、Field、Item 的密度接线和全局字体覆盖。
新增公开的 Stack、Inline、Grid、Text、Heading、PageHeader、Panel，以及不带应用 CSS 的组合例子。
SelectInput 的空字符串选项显示真实 label；ModelSelector 的控件 size 与 compact 标签显示独立。
版本使用 0.6.0-next.0 标记默认外观变化，未执行 npm 发布。

本地 npm run build 与 npm run check 通过。编译消费页 7 项通过：light/dark、三档 density、390px、
主题覆盖、浮层、空选项标签、草稿、等宽字体和单层内距。已有四文件 18 项回归通过。
完整 CI 交互门槛由 MR 检查继续验证，最终结果见该 MR。

原失败与修正：Windows CRLF 导致格式检查失败，增加 LF 仓库属性并规范行尾；新 Item 类名超长已分组；
首次独立 worktree 缺构建声明，先构建后检查通过。浏览器缺本机 Chromium 制品后使用项目现有 Edge 配置。
窄屏测试改为等待真实布局稳定；保留原失败。完整回归首次被同时构建的 HMR 打断，重跑期间冻结源码与制品。
静态整套旧回归包含原始 CSS 单位序列化假设，不替代既有 CI 的开发服务器门槛；编译产物由专门消费测试覆盖。

视觉参考为用户提出的工作台内容层级、相邻控件对齐和单层内距要求。实际查看了编译消费页的桌面与窄屏，
该例子的内容和操作是本地演示，不代表 OpMaster 的业务接入或平台发布。
