# 动态主题与配色说明页

本地入口：`/?view=theme-guide`。已从示意作用域升级为 `ReitoThemeProvider` 和组件 `color` API；这属于当前工作区实现，尚未发新版 npm 包。组件总览、组件详情和首页共享配色偏好，顶部调色入口可以即时调整颜色，不重建示例状态。

## 配色范围

- 工作面中性色系：Graphite、Gray、Zinc、Slate、Stone、Neutral。Graphite 保留本库原创灰阶；其他五套使用命名中性色阶。
- 主色：灰白，或 Red、Orange、Amber、Yellow、Lime、Green、Emerald、Teal、Cyan、Sky、Blue、Indigo、Violet、Purple、Fuchsia、Pink、Rose。
- 22 套命名色板均包含 50–950 的 11 个色阶，定义在 tokens.json 的 colorScales。colorThemes 存放本库深浅模式的语义映射。构建输出 `@reito/tokens/themes`，运行时与 CSS 来自同一源。
- `colors.success / warning / danger / info` 可以分别指定彩色板；它们和 primary 独立。shadcn 的 accent 仍是中性交互底色，info 对应信息语义色。
- 当前不包含任意 HEX 输入、自动生成品牌色阶或用户自定义色阶注册接口。

```tsx
import { ReitoThemeProvider, Button, Badge, Switch } from '@reito/ui/basic';
import '@reito/tokens/css';
import '@reito/ui/styles.css';

<ReitoThemeProvider root mode="system" colors={{ primary: 'violet', neutral: 'zinc' }}>
  <Button>跟随主题</Button>
  <Button color="green" variant="outline">独立绿色</Button>
  <Badge color="success" variant="secondary">已完成</Badge>
  <Switch color="primary" />
</ReitoThemeProvider>
```

## 作用域与兼容

Provider 默认仅影响自身子树；root 同时设置 html 的主题、密度和语义变量，卸载恢复原值。嵌套 Provider 合并父级 colors，可独立指定明暗；默认 compact。system 监听系统明暗变化，SSR 首屏使用 dark，客户端挂载后解析系统偏好。持久化由宿主处理，库本身不读写存储。

`Button / Badge / Switch / Checkbox / RadioGroup / Slider / Progress / Toggle` 支持独立 color。Button 与 Badge 的颜色独立于 variant：实心、柔和、描边、轻量和链接复用共享配色规则；destructive 保留危险状态含义。其他复杂和 AI 组件通过共享语义变量继承全局或局部主题，不宣称每个复合组件都有独立 color 参数。

Dialog、AlertDialog、Sheet、Select、Combobox、DropdownMenu、ContextMenu、Popover、Tooltip、HoverCard、NavigationMenu（Menubar 使用共享菜单 Portal）传递最近的 React 主题。作用域使用 display: contents，不增加布局容器。根作用域继承 html token，避免重复密度声明挡住宿主的运行时 padding 覆盖。局部主题明确重绑语义别名与文字色；dark variant 使用有边界的 CSS @scope，防止深色祖先污染局部浅色组件。独立组件色使用 CSS light-dark 随所在作用域解析。目标是支持这些 CSS 能力的现代浏览器。

## 来源与实际视觉检查

配色分层及 color / variant 分离参考 Nuxt UI、PrimeVue、Radix Themes 官方文档：

- https://ui.nuxt.com/docs/getting-started/theme/design-system
- https://primevue.dev/theming/styled
- https://www.radix-ui.com/themes/docs/theme/color

命名色阶来源是工作区实际安装的 Tailwind CSS 4.3.3（MIT），从 OKLCH 转为裁剪后的 sRGB；不是这些组件库的整套主题样式。许可证随 tokens 包的 THIRD_PARTY_NOTICES.md 发布。Graphite 语义映射、控件尺寸、内距、圆角与布局仍由本库定义。

在用户浏览器检查 dark / compact 的 Zinc + Violet 工作面、独立绿色按钮与 Stone + Rose 的局部浅色弹窗。与用户给出的旧冷暖色系选择器截图相比，控件布局和紧凑尺寸保持，色系名称改为明确色板名。与 Cursor 深色参考相比，保留轻边界、水平留白和小型动作；可选品牌主色是本库新增能力，不称为 Cursor 官方配色。嵌套浅色区域初轮继承了外层已计算的文字色，修正为局部语义文字；重复密度作用域遮住根 padding 覆盖的问题也已修正。

## 验证记录

验证包括 60 组五个示例主色 × 六个中性色系 × 两个明暗模式的浏览器文字对比度；所有 17 套彩色实心/柔和配对和五套中性色板的普通文字/表面对比度（至少 4.5）；系统模式、草稿保留、局部浅色弹层与键盘焦点恢复；四种明暗/密度的组件颜色和尺寸；总览即时换色保留交互状态。实际命令结果见最终日志，不将构建成功视为全库所有状态已验证。

彩色实心动作使用配对的 hover 色阶（dark 200 / light 800），避免通过透明度变淡导致文字对比度下降；根和局部动作共用此规则。系统偏好通过 useSyncExternalStore 订阅，客户端首次渲染直接读取偏好，SSR 使用稳定 dark 快照。Provider 的语义配置按字段保持稳定，编辑表单时不重复重设整套 html tokens。

最终结果（2026-10-10）：完整 npm run build 通过（.logs/theme-runtime-final-delivery-build.log），npm run check 通过（.logs/theme-runtime-final-result-check.log），token 审计 0 unapproved，基础语义配对 106 项通过。主题专项 9 项含悬停色对比度全部通过（.logs/theme-runtime-hover-final.log）；主题模式按钮改为读取已解析的 scheme 后，系统模式与总览保留状态的 2 项补充回归再次通过（.logs/theme-runtime-mode-final.log）。Card / 中性焦点 / 总览 / Select 的 19 项相关回归通过，记录在 .logs/theme-runtime-verified.log；该轮两个主题专项失败已在后续专项修正并复查。新主题 Storybook Playground 的 WCAG 标签扫描 0 violations（.logs/theme-runtime-a11y.json）。CI 配置发现 214 项 / 27 文件，本轮未执行完整集合。当前改动未提交或发布。
