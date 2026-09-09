# Reito UI 首页

运行 `npm run dev` 后访问 `http://127.0.0.1:5173/`。首页是组件库的介绍与入口，Lab 保留在带 `layer/component` 参数的地址，例如 `/?layer=basic&component=button`。Lab 左上角品牌链接返回首页；直接分享组件链接不受影响。Lab 按需加载，首页无需先加载整个组件示例目录。

页面包括：导航、版本入口、居中标题与双入口、可交互工作区、基础/复杂/AI 三层导航、Graphite 主题展示、快速开始、Storybook 入口和页脚。

展示使用现有 Button、Input、Switch、Tabs、Table、Progress、Badge、CodeBlock 和 TokenReference。任务筛选、完成/重新打开、开关和代码切换是本地状态；不代表真实任务服务、AI 调用或偏好持久化。主题使用既有 reito-theme 浏览器偏好，首页固定紧凑密度，不新增密度切换。旧 Lab 仍有自己的检查工具。

Storybook 地址由 `VITE_STORYBOOK_URL` 配置，本地默认 `http://127.0.0.1:6007`。部署到其他环境应设置实际 Storybook 地址。仓库与复用指南链接指向公开源码地址；安装说明使用克隆、npm ci 与本地打包流程，不声称包已发布 npm。

## 参考及差异

本轮实际打开 [PrimeVue 官网首页](https://primevue.dev/)，查看浅色 1440px 首屏和页面结构，截图 `.logs/home-reference.png`。参考其居中主标题、版本入口、双行动入口、工作台大幅展示以及后续快速开始/主题介绍的顺序。

本库保留 Graphite 语义 tokens、自己的中文文案和紧凑桌面组件。金融示例替换为本地任务工作区；客户标识、下载量、商业背书和第三方品牌素材均未复制。没有新增插画、第三方字体或产品商标。深色是默认主题，浅色也提供；较参考页更克制，没有照搬其业务统计或动画。

已检查本地深浅色 1440px 和 390px 全页截图。移动导航单独成行，工作台与内容分栏自然堆叠；样式均通过共享 token 审计，没有新增硬编码豁免。

## 验证入口

`tests/home.spec.ts` 验证筛选、任务更新、代码页签、Tokens 对话框与焦点、首页和 Lab 往返、主题持久化、桌面/手机无横向溢出及 axe。原 `tests/workbench.spec.ts` 的组件检查入口显式使用组件 URL，以免把首页当成 Lab。

本地证据：`.logs/home-final-tests.log`、`.logs/home-build.log`、`.logs/home-final-check.log`；截图 `.logs/home-{dark|light}-{1440|390}.png`。本次只提供可运行主页，不包含公网部署、真实后台或商业集成。

实际结果：6 项首页专项与 12 项 Lab 回归，共 18 项通过；全量 `npm run build`、`npm run check` 通过；token 审计未批准项为零。构建保留已有的大 chunk 提示。首页的四组深浅主题/桌面手机扫描无 axe 违规及横向溢出。
