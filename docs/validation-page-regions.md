# 页面区域组件验证（2026-10-27）

## 范围

从 origin/main 09431a2 建立独立工作区；修改 Shell、Page、Panel 区域接口、例子、公开文档和可分发 skill。
主仓及其他工作区的未提交改动不属于本变更。组件使用既有语义 token，无新增应用样式或依赖。

- Shell.Sidebar／Main／Topbar／Content／Footer 组织导航、顶栏、正文与滚动。
- Page.Header／Content 统一页头与正文；原 Page title 简写使用同一实现。
- Panel.Header／Content／Footer 统一面板区域；原 Panel title 简写保持，flush 继承主题并允许局部覆盖。
- 两个公开配方展示权限申请与消息接纳。实例状态为本地示例，不接外部平台或业务命令。

## 检查与修正

| 检查 | 结果 |
| --- | --- |
| npm run check | 通过；类型、格式、目录、配方、token 审计及语义颜色检查 |
| npm run build | 通过；UI、Lab、Storybook、Workbench 完整构建 |
| 编译包 composition 检查 | 23/23；源码别名、应用 CSS 与 Tailwind 插件均未接入消费者 |
| 新区域宽屏排列回归 | 先失败（侧栏 right=224、主区 left=0），修正后原测试通过 |
| 两主题／三密度 | 页面节奏、内距与文字角色通过 |
| 窄屏／键盘／草稿 | 390px 无横向溢出，页签草稿保持，键盘和区域停靠可用 |
| 区域与标题 | 正文只包一层，flush 内距为零，Panel 标题身份分别可解析 |

首次干净工作区的 check 在 Storybook 公共包类型未构建时失败。构建库产物后，同一 check 重跑通过。
Shell 初版将容器查询放在容器本身，宽屏仍纵排；移到内部布局层后，实际编译包回归通过。
既有 Page/Tabs、主题覆盖、Portal 与组件默认值测试也通过，不把单独重跑计作额外测试覆盖。

## 视觉核对

参考为用户提供的消息接纳／权限申请区域结构，以及 docs/composition.md 的主题和密度契约。
截图来自公开编译包、零应用 CSS 的独立消费者。原产品的路由、账号、数据及接纳命令没有接入该例子。

- [浅色区域结构](images/page-regions-light.png)：侧栏、顶栏、Page 与 Panel 边缘分别由所属组件提供。
- [深色窄屏](images/page-regions-dark-narrow.png)：标题、页签及档位字段自然换行，主题角色保持。
- 截图中的 session_id_012345 是消费者独立等宽字体检查，位于配方之外，不是产品状态。

本验证证明库源码和本地构建；不代表 npm 已发布、OpMaster 已升级或线上已部署这些新接口。
