# 示例画廊 · 2026-10-21

公开站点是 Lab（GitHub Pages：`https://reitowo.github.io/reito-ui/`）。交互示例画廊挂在 `/?view=gallery`，首页导航与主 CTA 已链接。

## 覆盖

- 工作流：活动轨迹、事件流、数据检查、命令面板（由原 dense 示例中性化占位数据）
- 应用：工作概览、文件浏览、偏好设置
- 顶栏：深浅主题；密度 dense / compact / comfortable（`?view=dense` 仍锁定高密，供既有测试与深链）
- 交互：菜单、时间线键盘、资源列表操作、设置开关均可操作；无真实业务后端

## 移动端

窄屏（≤640px）将侧栏换成横向可滚动页面标签；事件流 / 数据检查 / 工作概览在手机上用列表 ↔ 详情切换，避免双栏挤爆；命令页改为单列。首页与画廊均禁止横向溢出。`tests/gallery-mobile.spec.ts` 在 390×844 下覆盖画廊各页与首页。

## 检查

- `npm run check` 通过
- `tests/gallery.spec.ts`、`tests/gallery-mobile.spec.ts`、`tests/dense-density.spec.ts` 通过
- 部署说明见 [deployment.md](deployment.md)
