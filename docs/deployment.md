# GitHub Pages 部署

`.github/workflows/pages.yml` 在 main 推送或手动触发时检查、构建并发布主页、Lab 和 Storybook。仓库 Settings → Pages 的构建来源必须设为 GitHub Actions。

- 主页：`https://reitovo.github.io/reito-ui/`
- Lab：`https://reitovo.github.io/reito-ui/?layer=basic&component=button`
- Storybook：`https://reitovo.github.io/reito-ui/storybook/`

构建根目录是仓库根目录。Node 24.11.1，先 `npm ci`、`npm run check`，再 `npm run build`。将 `apps/storybook/storybook-static` 复制到 `apps/lab/dist/storybook`，上传 `apps/lab/dist`。

Lab 的 `VITE_BASE_PATH` 由 configure-pages 的 base_path 提供，可适配项目子路径或自定义域名。站内链接使用 Vite BASE_URL；生产默认 Storybook 地址为 BASE_URL 下的 storybook，开发仍使用 localhost:6007。需要单独托管 Storybook 时，在构建环境设置 VITE_STORYBOOK_URL。

GitHub Pages 发布的是构建后的公开静态内容，不发布后端或 npm 包。私有仓库需要支持私有仓库 Pages 的 GitHub 套餐；不要为了开启 Pages 自动改动源码仓库可见性。

官方说明：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## 本地验证

2026-09-09：在独立检出中运行 npm run check、npm run build 均通过；以 /reito-ui/ 挂载生产产物，用 Edge/Playwright 验证主页 → Lab → 首页、Storybook 深链接及 iframe 组件加载，未发现页面脚本错误或 HTTP 失败。构建仍有现有的大 chunk 提示。线上发布需先解决私有仓库套餐限制。
