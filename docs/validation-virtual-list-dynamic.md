# VIRT-02 动态虚拟列表验收

2026-09-07，VIRT-02 已完成。`VirtualList` 新增实际行高测量、稳定 key 阅读锚点、仅在末尾跟随追加、焦点行保留与删除后的视口焦点恢复。示例只修改本地数组和本地详情行，不暗示远程流式服务。

## 验证结果

- `npm run check`、`npm run build` 退出 0；tokens、目录和公开类型检查通过。构建仅有既有分包大小提示。
- **15/15** 浏览器测试通过：动态列表 7 项，固定列表回归 8 项。覆盖首部插入、上方行增长、末尾追加/离开末尾、删除焦点行、密度实时切换、Home/End、10 万项 DOM 有界、稀疏范围、错误恢复及同页 Controls。
- 深/浅主题 × 紧凑/舒适密度的 4 个窄工作面通过 axe 和横向溢出检查。动态行在紧凑模式以 36px token 高度起步，舒适模式随 `--rui-row-height` 与单元格内边距重新测量。
- **24/24** Story 组合通过：6 个 Story × 深浅主题 × 两档密度；0 页面错误、0控制台错误、0 可访问性违规、0 横向溢出，审计期间源码指纹未变化。

证据：[检查](../.logs/virtual-list-dynamic/check.log)、[构建](../.logs/virtual-list-dynamic/build.log)、[交互](../.logs/virtual-list-dynamic/interactions-final.log)、[Story 扫描](../.logs/virtual-list-dynamic/story-audit.json)、[测试源码](../tests/virtual-list-dynamic.spec.ts)。

## 视觉与来源

沿用 VIRT-01 对 [PrimeVue 5.0.1 VirtualScroller](https://primevue.dev/virtualscroller/) 浅色 Usage/Basic 工作面的实际检查，并针对动态更新读取固定版本 `@tanstack/virtual-core` 的测量、锚点与追加行为。参考提供能力与工作面尺度，不复制上游样式。

四张窄屏结果：[深色紧凑](../.logs/virtual-list-dynamic/dark-compact.png)、[深色舒适](../.logs/virtual-list-dynamic/dark-comfortable.png)、[浅色紧凑](../.logs/virtual-list-dynamic/light-compact.png)、[浅色舒适](../.logs/virtual-list-dynamic/light-comfortable.png)。列表继续使用中性工作面、柔和分隔线和小型操作；动态详情只增加内容所需高度。相对参考，本示例增加明确的本地插入、增长、删除和恢复动作，方便检查行为边界。

实现使用已安装的 `@tanstack/react-virtual` 3.14.10 与 `virtual-core` 3.17.8（MIT），并在其窗口计算之上补充基于实际 DOM 位置的稳定 key 锚点。宿主仍负责数据请求、缓存、去重和流式内容来源；二维网格留给 VIRT-03。使用说明见 [VirtualList](components/virtual-list.md)。
