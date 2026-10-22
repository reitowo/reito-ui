# 南窗 · 2026-10-22

公开站点是 Lab（GitHub Pages：`https://reitowo.github.io/reito-ui/`）。交互示例挂在 `/?view=gallery`，首页导航与主 CTA 已链接。画廊是一本虚构城市杂志的编辑室：这一期封面是周宁的《雨季的书店》，主编林夏、校对陈麦、美编阿禾，印刷厂江岸印务把潮了的封面退了回来。所有开关和命令都留在本地，不会送出编辑室。

## 覆盖

- 这一期：封面进程、审稿、作者、本期
- 编辑室：编辑台、稿件柜、室规
- 顶栏：深浅主题；密度 dense / compact / comfortable（`?view=dense` 仍锁定高密，供既有测试与深链）。顶栏高度跟随 `control-height-lg`，分栏标题跟随 `control-height + space-2`，开关轨道和滑块跟随密度 token
- 交互：菜单、时间线键盘、资源列表操作、室规开关均可操作；无真实业务后端

## 移动端

窄屏（≤640px）将侧栏换成横向可滚动页面标签；审稿 / 作者 / 本期在手机上用列表 ↔ 详情切换，避免双栏挤爆；编辑台改为单列。首页与画廊均禁止横向溢出。`tests/gallery-mobile.spec.ts` 在 390×844 下覆盖画廊各页与首页。

## 检查

- `npm run check` 通过
- `tests/gallery.spec.ts`、`tests/gallery-mobile.spec.ts`、`tests/dense-density.spec.ts` 通过
- 部署说明见 [deployment.md](deployment.md)
