# OrganizationChart 验收

日期：2026-09-07

## 范围

ORGCHART-01 新增紧凑层级关系图，覆盖递归层级布局、受控与非受控单选/折叠、节点内容模板、禁用、空态、长内容、局部横向滚动，以及 ARIA tree 方向键和焦点恢复。组件明确不承担任意图编辑。

## 自动验证

- `npx playwright test tests/organization-chart.spec.ts --workers=1`：16 项通过。
- 行为覆盖 ARIA level/posinset/setsize、可见树上下左右/Home/End、点击/Enter/Space 选择、受控折叠、折叠后最近祖先焦点恢复、禁用节点、固定展开、模板、空态和局部溢出。
- 深色/浅色主题 × 紧凑/舒适密度均执行 axe 与 390 × 720 窄工作面截图检查；页面级横向溢出为 0。
- Storybook 本族 12 个 Story × 4 组主题密度，共 48 次组合审计通过；page error、console error、可访问性违规和页面级横向溢出均为 0，审计期间源码指纹保持不变。
- Playground 的 `selectedId / collapsedIds / collapsible / disabled / label / emptyLabel` 六个 Controls 均有显式类型与初值；浏览器测试验证 Controls 与组件交互双向回写且不切换 Story。
- `npm run check` 与 `npm run build` 通过；生产构建仅保留既有的 chunk size 提示。

全库 `test:storybook:controls` 在既有 `复杂-asynctreeview-异步树--playground` 缺少显式 Controls 时提前停止，因此没有把该全库命令记为通过；OrganizationChart 的契约与实际 Controls 已单独验证。

## 视觉检查

检查 `.logs/organization-chart/dark-compact.png` 与 `light-comfortable.png`。节点宽度为 160px，标题与说明保持紧凑层级，折叠按钮落在连接轴线上；窄工作面内两列子节点只在图表区域裁切与滚动，不撑宽文档。深浅主题均使用 Graphite 的 surface、border、muted、accent 与 ring 角色。

参考为 [PrimeVue OrganizationChart 官方 Basic、Collapsible、Controlled 与 Content 示例](https://primevue.dev/organizationchart/)，检查日期 2026-09-07。共同结构是居中层级节点、正交连接线、分支折叠和可替换节点内容。Reito UI 有意使用更窄的无头像卡片、Graphite 中性灰阶和 roving tree 方向键；没有复制 PrimeVue 模板、CSS、人物图片或品牌样式。当前连接线只表达父子树，不支持任意连边、节点坐标、拖动、缩放和历史。
