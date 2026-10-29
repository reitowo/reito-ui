---
title: 与 AI 协作
description: 让 Cursor、Claude Code 等编码助手读取 llms.txt、整站 Markdown 与逐页 .md 文档。
---

# 与 AI 协作

本站的每一页文档都有一份干净的 Markdown 镜像，供编码助手直接读取，不需要解析 HTML 或执行脚本。内容与网页来自同一份源文件，在每次部署时一起生成。

## 可用的入口

| 地址 | 内容 |
| --- | --- |
| [`/llms.txt`]({{SITE_URL}}/llms.txt) | 索引：全部文档、配方与组件的标题、一句话说明和绝对链接（[llms.txt 约定](https://llmstxt.org/)） |
| [`/llms-full.txt`]({{SITE_URL}}/llms-full.txt) | 全文：把所有文档与组件页拼成一个 Markdown 文件 |
| `/docs/<页面>.md` | 单页：例如 [`/docs/installation.md`]({{SITE_URL}}/docs/installation.md)、[`/docs/theming.md`]({{SITE_URL}}/docs/theming.md) |
| `/docs/components/<id>.md` | 单个组件：例如 [`/docs/components/button.md`]({{SITE_URL}}/docs/components/button.md)、[`/docs/components/data-table.md`]({{SITE_URL}}/docs/components/data-table.md) |

在任意文档页顶部，可以用「复制 Markdown」把当前页复制到剪贴板，或用「Markdown」打开这一页的 `.md` 地址。每个文档页的 HTML 也通过 `<link rel="alternate" type="text/markdown">` 指向它的镜像。

## 推荐用法

1. **先给索引。** 在对话或规则中加入 `{{SITE_URL}}/llms.txt`，让助手按需打开具体页面，比一次塞入全文更省上下文。
2. **需要完整约束时给全文。** 搭建整套应用外壳或做大范围改造时，提供 `{{SITE_URL}}/llms-full.txt`。
3. **具体组件给单页。** 例如修改表格时只提供 `{{SITE_URL}}/docs/components/data-table.md`。

一段可以直接放进 Cursor Rules、`AGENTS.md` 或 `CLAUDE.md` 的说明：

```md
本项目使用 Reito UI（@reito/ui + @reito/tokens，React 19）。
写界面前先读取 {{SITE_URL}}/llms.txt，再打开与任务相关的页面：
- 页面组合：{{SITE_URL}}/docs/composition.md
- 设计契约：{{SITE_URL}}/docs/design-contract.md
- 主题：{{SITE_URL}}/docs/theming.md
只使用公开组件与语义 token；普通页面不写应用 CSS、间距或排版 utility。
```

## 可安装的 Skill

仓库提供一份可携带的 agent skill：[`skills/reito-ui`](https://github.com/reitowo/reito-ui/tree/main/skills/reito-ui)。它包含核心规则、按任务路由的布局参考（dashboard、settings）、[设计契约](/docs/design-contract) 与一份只用公开组件的可执行页面 `workbench.tsx`。把整个目录复制到助手的 skills 目录（例如 `.cursor/skills/reito-ui` 或 `.claude/skills/reito-ui`）即可。

## 使用边界

- 这些文件是静态文档，不是 API；内容以仓库 `main` 为准，版本说明见 [安装](/docs/installation)。
- AI 组件只提供界面与本地状态，站内示例不代表真实的模型响应或外部集成。
- 暂不提供 MCP 服务。如果以后提供，会在此页说明；当前用 `llms.txt` 和 `.md` 地址即可覆盖文档读取。
