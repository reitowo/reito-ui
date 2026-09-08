# COMBO-BANNER-01 · Banner 验收记录

日期：2026-09-07

新增复杂层 Banner，复用 Alert/Button，覆盖五种语义、图标、长内容、单动作、关闭、受控重开、disabled/loading 和 live region 边界。

- `tests/banner.spec.ts`：11/11 通过。
- 11 个 Story；首次 44 组合并发审计有 16 个开发服务器超时，随后对这 16 组独立重试全部通过。合并结果为 44/44：页面错误、控制台错误、WCAG 违规和水平溢出均为 0。
- dark/light × compact/comfortable 默认行均小于 96px；288px 窄容器保留动作和关闭入口。
- Playground 在同一 Story 调整文案、tone、live、图标、动作、关闭、busy/disabled 和受控 open。

实际查看 Nuxt UI 官方 [Banner](https://ui.nuxt.com/docs/components/banner) 当前浅色桌面页面（1280 × 900），截图为 `.logs/references/nuxt-ui-banner-2026-09-07.png`。Reito UI 保留通用的短通知/动作/关闭结构，但使用 Graphite 中性紧凑表面和自己的 React 状态；未复制品牌色、Vue API、CSS、动画或资源，也不把官网顶栏式宣传 Banner 当桌面工作区默认。
