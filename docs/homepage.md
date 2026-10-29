# Reito UI 首页与公开站点

运行 `npm run dev` 后访问 `http://127.0.0.1:5173/`。首页是组件库的介绍与入口。文档在 `/docs/<页面>`，组件库在 `/gallery` 与 `/gallery/<id>`，组件详情（Lab）在 `/components/<id>`，例如 `/components/button`。示例索引在 `/templates`（`/examples` 会转到同一页）。

主导航在首页、文档和组件库之间共享：文档、组件、示例、Lab、Storybook。旧的 `?view=` 和 `?layer=&component=` 地址会在打开时改写成路径。Lab 左上角品牌链接返回首页。

首页主行动按钮使用 Button 的 `xl` 尺寸：阅读文档、浏览组件、安装。高度来自密度 token `control-height-xl`。

页面包括：共享导航、版本入口、居中标题与三入口、可交互工作区、基础/复杂/AI 三层导航、Graphite 主题展示、快速开始、AI 可读文档入口和页脚。

展示使用现有 Button、Input、Switch、Tabs、Table、Progress、Badge、CodeBlock 和 TokenReference。任务筛选、完成/重新打开、开关和代码切换是本地状态；不代表真实任务服务、AI 调用或偏好持久化。主题使用既有 reito-theme 浏览器偏好，首页固定紧凑密度，不新增密度切换。Lab 与 Storybook 仍有自己的检查工具。

## 文档与 AI 镜像

文档 IA：介绍、安装、快速开始、主题（含 `--rui-radius` / Theme / createTheme）、与 AI 协作，以及从 `docs/` 与 skill 设计契约引入的组合、布局参考、配方和全部组件页。页面由 `apps/lab/site/docs-pipeline.ts` 在构建时生成，源文件不另维护一份平行目录。

编码助手可直接读取：

- `/llms.txt`：文档与组件索引（[llms.txt 约定](https://llmstxt.org/)）
- `/llms-full.txt`：全文
- `/docs/<页面>.md`：单页 Markdown，例如 `/docs/installation.md`、`/docs/components/button.md`

说明见 `/docs/ai`。暂不提供 MCP。

## 参考及差异

结构参考 [Base UI](https://base-ui.com/) 与 [affectUI](https://www.affectui.com/) 的公开站点：居中主标题、文档 / 组件 / 安装入口、组件库网格与详情、文档侧栏。本库保留 Graphite 语义 tokens、中文文案和紧凑桌面组件，不是像素复制。

已检查本地深浅色 1440px 和 390px。移动导航单独成行，工作台与内容分栏自然堆叠；样式均通过共享 token 审计。

生产构建的 `dark:` 变体改为扁平选择器（见 `packages/ui/src/styles.css`），避免嵌套 `@scope` 在 Pages 上丢失规则。

## 验证入口

`tests/home.spec.ts` 验证筛选、任务更新、代码页签、Tokens 对话框与焦点、组件库与 Lab 往返、主题持久化、桌面/手机无横向溢出及 axe。`tests/docs-site.spec.ts` 验证文档导航、`.md` 镜像、`llms.txt` / `llms-full.txt` 与组件库详情。

Storybook 地址由 `VITE_STORYBOOK_URL` 配置，本地默认 `http://127.0.0.1:6007`。AI 文档里的绝对链接在生产使用 `https://reitowo.github.io/reito-ui`（可用 `VITE_SITE_URL` 覆盖）。
