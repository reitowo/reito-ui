# 表单错误内边缘渐变 · 2026-10-10

依据本轮用户标注的 Field「目录」错误状态截图：dark / compact，1303 × 1244。原来的控件外侧错误 ring 改为沿内边缘向内容区域淡出的 inset shadow，保留柔和的错误边界、错误文字和 ARIA 关联。截图中的输入框保持32px高度；键盘焦点仍独立使用1px中性提示。

共享实现位于 `packages/ui/src/styles.css` 的 `.rui-validation`。已有错误边界原语改为消费此配方，包括 Input、Textarea、Select、组合输入、Combobox 多选容器、NumberField、InputTags，以及带错误状态的选择/动作原语。组合输入外层负责高亮，内部 `input-group-control` 不重复显示 shadow。

源 token 位于 `packages/tokens/src/tokens.json`：

| Token | 默认值 | 作用 |
| --- | --- | --- |
| validation-glow-blur | 8px | 向内淡出的范围 |
| validation-glow-width | 1px | 内侧扩散宽度，不影响布局 |
| validation-glow-opacity | 0.28 | 渐变强度 |
| validation-border-opacity | 0.5 | 错误色与普通边界的混合比例 |

颜色使用 `--rui-danger`，跟随主题错误色。上述角色也可通过 `ReitoThemeProvider tokens.semantic` 局部调整。尺寸、padding、圆角与控件内容未改变。

Storybook 的 Input →「状态 · 内边缘渐变」并列展示输入框、多行输入、选择器、组合输入和数字输入，支持切换错误状态以检查输入保留和布局稳定。

## 验证

- Playwright：24项通过（`.logs/validation-glow-tests-final.log`），包括新增4种主题/密度组合、密码输入和 SelectInput 回归。
- 新增用例验证：每个错误表面只有一层 inset 高亮；组合内部输入无重复 shadow；焦点提示独立；切换错误状态不改变被测控件尺寸、不丢草稿；选项交互正常；blur token 可运行时调整；forced-colors 下系统边界/焦点可见。
- `npm run tokens:audit`：351个文件、0个未批准项，保留29项精确例外。
- 现场检查：总览 Field 的「目录」输入在普通和键盘聚焦状态均为32px；错误渐变为8px blur、1px inset spread、28%错误色。键盘聚焦额外显示中性1px ring。

视觉截图：`.logs/validation-inset-glow-live.png`。`npm run build` 与 `npm run check` 均通过，日志为 `.logs/validation-glow-build.log` 和 `.logs/validation-glow-check.log`；构建保留已有的大 chunk 提示。新增用例首先错误地期待自定义属性仍包含原始 `var()` 文本；浏览器返回已解析的值，修正为验证实际焦点 shadow 与普通状态不同，之后四种组合均通过。
