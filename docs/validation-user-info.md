# COMBO-USER-01 · UserInfo 验收记录

日期：2026-09-07

## 范围

新增复杂层 `UserInfo` 组合，复用 Graphite Avatar 与 Button。验收覆盖头像/fallback、名称和辅助说明、可读状态、状态语义色、图标/文字动作、单项 disabled/loading、整行禁用、长文本、省略提示、三档尺寸、三种表面以及同页 Controls。

## 行为验证

- `tests/user-info.spec.ts`：13 项完整测试最终通过；期间另行复测同页 Controls 与四组视觉场景。
- 缺头像时字符串名称自动生成双字符缩写；显式 `avatarAlt / fallback` 由宿主覆盖。
- 名称与说明在窄容器内截断，字符串保留完整 `title`；状态始终包含文字，不依赖颜色独立表达。
- 图标操作有可访问名称，文字操作显示完整标签；disabled 与 loading 只影响对应动作，整行 disabled 会禁用全部动作。
- Playground 的名称、说明、fallback、状态、状态色、尺寸、表面、动作标签、整行/单项状态均可在同一个 Story 中由 Controls 修改。
- dark/light × compact/comfortable 四组中默认行高度均小于 72px、没有页面水平溢出，定向 WCAG 2A / 2AA / 2.1AA axe 扫描无违规。

## Storybook 与构建

本族提供 10 个 Story：Playground、默认示例、长内容、缺头像、可读状态、文字操作、单项禁用、单项忙碌、整行禁用与独立宿主内容。10 × 4 = 40 次冻结 Story 组合全部通过：页面错误 0、控制台错误 0、WCAG 违规 0、横向溢出 0。最终全仓 `npm run check` 与 `npm run build` 结果记录在本次提交验证中。

## 视觉对照

实际查看 Nuxt UI 官方 [User](https://ui.nuxt.com/docs/components/user) 当前浅色桌面文档，视口 1280 × 900；截图保存在 `.logs/references/nuxt-ui-user-2026-09-07.png` 与 `.logs/references/nuxt-ui-user-avatar-2026-09-07.png`。参考页面确认 User 的核心是同一紧凑横行中的 Avatar、name 和 description，并提供 size、chip、orientation 与 link 等独立配方。

Reito UI 在 1440 × 1000 下检查了 Graphite dark/compact 与 light/comfortable。默认示例宽 448px：32px 头像、两级短文本、文字状态点和两个 24/32px 密度动作保持在一行；浅色和深色都只使用弱背景，未增加卡片阴影。长内容在 288px 容器内截断，动作仍可达。

仍有意保持的差异：不复制 Nuxt UI 的品牌绿色、Vue API、chip、链接、纵向配方、字体、CSS 或示例图片。Reito UI 针对桌面列表补充动作组、独立 loading/disabled、长文本约束和 Graphite 状态色；导航、整行选择与菜单继续由宿主组合。
