# ScrollTop 验收 · 2026-09-09

公开实现为 `packages/ui/src/basic/scroll-top.tsx`，导出至 basic 和根入口，共享 Demo 注册到 Lab；用法见 [ScrollTop](components/scroll-top.md)。

## 本轮覆盖

`tests/scroll-top.spec.ts` 的 9 项覆盖：阈值显隐、Enter 激活及标题焦点、reduced-motion、面板不带动窗口、四主题密度的 390px 窄布局、禁用/短内容、双面板隔离、Window 目标、同页 Controls 修改阈值/禁用/内容长度。

6 个 Story × 深浅主题 × 紧凑/舒适密度，共 24 组静态审计通过；无页面错误、axe 违规或水平溢出。动态交互由上述专项测试覆盖，静态审计不是动作验证。

首轮遇到 Storybook 6007 未运行，确认端口无监听后启动并重测。Controls 的可选 number 初始没有输入框，改为使用共享 container-xs token 作为示例初值后通过。库级未传 threshold 仍默认一个目标视口高度。合并 PR 后旧 dist 缺 OneTimeCode 类型声明，先 build 再 check 解决；没有删除类型检查。

最终完整专项重跑：9 项全部通过，见 .logs/scroll-top-all-final.log。全量 build/check 已通过。

本地日志：`.logs/scroll-top-tests-final.log`、`.logs/scroll-top-story-tests.log`、`.logs/scroll-top-controls.log`、`.logs/scroll-top-audit.json`。最终构建和检查结果在 `.logs/scroll-top-build.log` 与 `.logs/scroll-top-check-final.log`；构建仍有已有的大 chunk 提示。

## 视觉参考与边界

本轮实际打开 [PrimeVue ScrollTop](https://primevue.dev/scrolltop/) 浅色文档并截图，查看其滚动内容示例；与本地 Graphite 深色紧凑 390px 面板截图比较。参考截图 `.logs/scroll-top/reference.png`，本地四种主题密度截图 `.logs/scroll-top/`。原版为宽文档页面，本库是紧凑工作区中有文字标签的共享 Button，放在独立面板后；没有复制页面边栏、字体、颜色或浮层位置。初始参考截图未展示激活后的按钮，不据此声称按钮形状或动画像素对齐。

没有验证真实宿主文档或虚拟条目定位。监听清理通过源码检查，未做长时间内存压测。默认没有请求、定时刷新或自动跟随。
