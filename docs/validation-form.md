# Form 首项验收（FORM-01）

2026-09-06，Windows / Edge，Node 24.11.1。对应 [逐项账本](component-completion.md) 的 `FORM-01`，已完成该项验收；后续高级项保持独立状态。

## 实现

- [Form / FormField / FormError](../packages/ui/src/complex/form.tsx)：原生 form、RHF provider、字段状态与可访问关联、同步提交锁、失败保留草稿、reset、IME 保护及输入解锁后的错误焦点。
- [schemaResolver](../packages/ui/src/complex/form-resolver.ts)：复用官方 Standard Schema resolver，保留嵌套/数组路径、输出转换/raw，并防止全表单错误在 RHF 提交时被清除。
- [共享示例](../packages/ui/src/complex/form-demo.tsx) 与 [Storybook](../apps/storybook/stories/complex/Form.stories.tsx)：10 个 Story，其中 6 个有自动交互；包含 Input、Checkbox、Select、Switch、schema 转换与数组组合。
- [用法与限制](components/form.md)：消费方控制 schema、数据和网络；必填提示不替代校验规则，保留名和真实输入 ref 适配均已说明。

目录从 88 个组件族 / 614 个 Story 增为 **89 / 624**，基础 54、复杂 16、AI 19。Form 的样式复用现有 Field / 控件 / token，没有新增独立颜色、尺寸或页面覆盖。运行入口不导出 demo，不包含 Zod 运行依赖；编译后 `dist/complex.js` 的 6 个主要新增导出已通过 Node 实际导入。

## 发现并修复的问题

1. 固定版本 `@hookform/resolvers@5.9.1` 会把无路径 issue 放入 `root`，`react-hook-form@7.87.0` 在提交判断前清除 root；复现可错误进入成功回调。本库适配器改存保留字段 `_form`，验证异常也转为可重试错误。
2. 失焦校验在 pointerdown 与 pointerup 之间插入错误行，保存按钮/Checkbox 下移 22 px，导致首次点击丢失。共享 Form 将这次 pointer 手势中的 blur 校验排队，在 click / cancel 后释放；Tab blur 仍即时执行。[修复前事件与坐标](../.logs/form/pointer-diagnostics.json)。
3. 校验期间字段禁用会让 RHF 的早期 focus 尝试失效。Form 在 React 提交解锁后的 DOM 上恢复首个无效输入/Trigger 焦点。
4. 开发服务器曾缓存安装前的 resolver 解析失败；重启此仓库 5173 / 6006 后解析恢复。早轮 HMR 污染的测试不计最终通过。

## 实际结果

| 检查 | 最终结果 | 证据 |
| --- | --- | --- |
| `npm run check` | 通过；tokens / catalog 同步、4 workspace 类型检查、100 对比度组合；204 文件 token 审计 0 未批准项 | [日志](../.logs/form/check.log) |
| `npm run build` | UI / Lab / Storybook / Workbench 全部通过；保留大 chunk 提示 | [日志](../.logs/form/build.log) |
| 浏览器 + resolver | **18/18**；14 浏览器、4 resolver；冻结源码后单独执行 | [最终日志](../.logs/form/ui-final.log)、[浏览器测试](../tests/form.spec.ts)、[resolver 测试](../tests/form-resolver.spec.ts) |
| 静态 Storybook | **40/40**；10 Story × 4 主题密度，6 play Story；0 console/pageerror、0 axe 违规、0 横向溢出，源码指纹一致 | [报告](../.logs/form/story-audit-final.json) |
| Lab 主题、密度、布局 | 四组合输入高 32 / 40 px；1280×800、960×720 无页面横向溢出，完整错误状态截图已检查 | [深/紧凑](../.logs/form/dark-compact-validation.png)、[浅/舒适](../.logs/form/light-comfortable-validation.png) |
| 同页 Controls 与独立视觉 | **10/10** Controls；四主题密度 × 4 视口 **16/16**，0 console/pageerror/横向溢出，源码哈希前后一致；含 390px 窄屏及 200% 等效空间 | [独立记录](validation-form-visual.md) |

浏览器覆盖字段标签/描述/错误关联、首错焦点、reset、异步名称校验、失败保留与重试、服务端字段错误、布尔 false payload、同 tick 三次提交、busy 期间再次提交、Tab 与取消指针手势。IME 是合成 composition / isComposing / keyCode 229 事件验证，没有进行真实 Windows 中文输入法人工验收。

本次没有重跑全部历史 Story 或全库所有交互测试；改动集中在新增 Form。自动 axe 只覆盖对应规则，并不代表完整无障碍认证。官方参考、主题与剩余外观差异在独立视觉记录中说明，不以构建通过宣称像素复刻。

## 尚未验收的后续项

`FORM-02` 的过期异步结果/重置竞态、`FORM-03` 的数组 dirty/touched 完整状态与重排矩阵、`FORM-04` 的动态配置/条件字段配方仍单独跟踪。当前已有相关基础和部分示例，不能以本次通过记录预勾后续高级项。已有 0.4.1 tarball 未替换。
