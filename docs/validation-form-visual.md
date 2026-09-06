# Form 独立视觉与同页 Controls 验收

检查日期：2026-09-06。**本次约定范围通过：同页 Controls 10/10、Lab 布局组合 16/16，截图已人工检查。** 这是 `FORM-01` 的展示与指定 Playground 控件证据，不能据此宣称整个 Form 对标完成；跨字段/异步竞争、FieldArray 和动态表单的完整验收仍属于 `FORM-02`–`FORM-04`，本记录不修改这些条目的状态。

最终使用 Microsoft Edge 152.0.4191.62 headless、DPR=1。Controls 使用冻结构建的 [6007 Playground](http://127.0.0.1:6007/?path=/story/复杂-form-表单管理--playground)，Lab 使用 [5173 Form](http://127.0.0.1:5173/?layer=complex&component=form)。执行时间为 2026-09-06 15:07:22–15:07:35 UTC；随后 15:08:44–15:08:49 UTC 补采动画结束后的布局尺寸。最终浏览器 console error / pageerror 均为 0。

## 参考工作上下文

实际打开并截图检查 [PrimeVue 5.0.1 Forms](https://primevue.dev/forms/) 的 **ValidateOn** 示例，观察多字段竖排、字段级错误、提交动作和文档工作面。参考用于比较信息结构与状态呈现，不是像素复刻目标；没有拷贝其字体或样式资产。

| 来源 | 主题与测量 | 截图 |
| --- | --- | --- |
| PrimeVue Forms / ValidateOn | 官方浅色；1440×1000 CSS px；表单 224×210 px；输入高 35 px、字体 14 px | [整页](../.logs/form/reference-primevue-validateon-light.png)、[表单](../.logs/form/reference-primevue-validateon-light-form.png) |
| PrimeVue Forms / ValidateOn | 官方深色，通过 `Toggle Dark Mode` 切换，html=`p-dark`；相同视口/表单尺寸 | [整页](../.logs/form/reference-primevue-validateon-dark.png)、[表单](../.logs/form/reference-primevue-validateon-dark-form.png) |

截图已通过图像查看工具逐张检查。参考示例在宽文档区居中放置窄表单，以占位文字作为主要字段提示；错误以输入边框和紧邻下方文字同时呈现，提交按钮与输入同宽。官方截图没有对应 Reito 的 compact/comfortable 密度开关，不能把两套密度当作官方已有同名模式。[采集数据](../.logs/form/reference-form.json)、[采集脚本](../.logs/form/reference-form.mjs)。

## 同页 Controls 结果

在一个 Playground 页面实际操作 Controls 面板，未导航到其他 Story。每次切换检查 URL 的 Story path、预览当前 Story ID 与 StoryStore args；之后等待具体 DOM 行为成立。证据见 [完整结果](../.logs/form/visual-audit.json)、[执行脚本](../.logs/form/visual-audit.mjs)。`controlChanges` 是 args 同步后的瞬时诊断值，可能早于 React DOM 提交；通过结论依据后续等待式断言，不能用瞬时 `fieldsetDisabled` 值代替禁用检查。

| 控件 / 场景 | 实际验收结果 | 证据 |
| --- | --- | --- |
| `disabled` true → false | 3 个文本输入、Checkbox、保存和重置全部禁用，再恢复可用 | [禁用截图](../.logs/form/controls-disabled.png) |
| `showDescriptions` false → true | 描述由 2 条变 0 条再变 2 条；compact 表单高度 343 → 297 px | [关闭描述](../.logs/form/controls-descriptions-off.png) |
| `validationMode=onSubmit` | 输入非法名称、失焦均不显示错误，提交后显示 | 完整结果中对应 mode |
| `validationMode=onBlur` | 输入时不显示错误，失焦后显示 | 完整结果中对应 mode |
| `validationMode=onChange` / `all` | 输入 `x` 后仍在该输入框内保持焦点，错误已显示 | [onChange 同页截图](../.logs/form/controls-validation-onchange.png) |
| `validationMode=onTouched` | 第一次失焦才显示；随后在输入框内改正即消失，再输入非法值即显示 | 完整结果中对应 mode |
| `submitBehavior=error` | 出现“本地保存失败”，保留修改的草稿并恢复保存按钮 | [表单错误](../.logs/form/controls-submit-error.png) |
| `submitBehavior=field-error` | 邮箱出现“邮箱暂不可用”并获得焦点，草稿保留 | [字段错误](../.logs/form/controls-submit-field-error.png) |
| `submitBehavior=success` | 出现“已保存本地设置”和本地结果，草稿保留，保存按钮恢复可用 | [成功结果](../.logs/form/controls-submit-success.png) |

5 种 mode 是同页实时切换的结果，没有用重新导航或切换到另一个 Story 代替验证。此处没有覆盖所有 mode 下的异步校验竞争组合；那是高级验收边界。

## Lab 视觉与布局结果

实际用 Lab 顶部按钮切换主题与密度。尺寸采用等待有限 CSS 动画完成后的[补采结果](../.logs/form/visual-stable-layout.json)；[补采脚本](../.logs/form/visual-stable-layout.mjs)只检查 Lab，不重复 Controls。桌面截图中的表单尺寸不含其上方的“提交结果”场景选择器。

| 1440×1000 CSS px | 表单宽×高 | 输入高 / 字体 | 已检查截图 |
| --- | --- | --- | --- |
| dark / compact | 998×343 px | 32 / 14 px | [组成页面](../.logs/form/lab-form-dark-compact.png) |
| dark / comfortable | 982×391 px | 40 / 14 px | [组成页面](../.logs/form/lab-form-dark-comfortable.png) |
| light / compact | 998×343 px | 32 / 14 px | [组成页面](../.logs/form/lab-form-light-compact.png) |
| light / comfortable | 982×391 px | 40 / 14 px | [组成页面](../.logs/form/lab-form-light-comfortable.png) |

四种组合均保留可见字段标签、必填标识、描述、通知选项、保存/重置与提交状态；深浅主题下字段和动作没有重叠或截断，comfortable 增大控件和间距，信息层级保持一致。错误截图中名称/邮箱以标签、边框和紧邻文字表示错误，焦点环可见；表单级提交错误位于操作之前。截图视觉检查不等于独立的对比度或屏幕阅读器认证。

| CSS 视口 | 四主题密度结果 | 已检查代表截图 |
| --- | --- | --- |
| 390×844 | 4/4；表单宽 compact 328、comfortable 312 px；无横向溢出，保存/重置可达 | [dark compact](../.logs/form/lab-form-narrow-390-dark-compact.png)、[light comfortable](../.logs/form/lab-form-narrow-390-light-comfortable.png) |
| 720×500 | 4/4；表单宽 434 / 418 px；保留窄侧栏，滚动后操作可达 | [dark 操作区](../.logs/form/lab-form-200-equivalent-720-dark-comfortable-actions.png)、[light 操作区](../.logs/form/lab-form-200-equivalent-720-light-compact-actions.png) |
| 640×360 | 4/4；表单宽 578 / 562 px；侧栏收起，滚动后操作可达 | [dark 操作区](../.logs/form/lab-form-200-equivalent-640-dark-compact-actions.png)、[light 操作区](../.logs/form/lab-form-200-equivalent-640-light-comfortable-actions.png) |

16 个组合的文档与表单横向溢出测量均为 0。窄视口输入字体为 16 px；390 宽 comfortable 的底部状态不全在首屏，720/640 的低高度需要滚动，这是已观察到的布局行为。检查覆盖操作可达性，不要求整个表单一次全部在屏幕内。

200% 等效检查使用 1440×1000 → 720×500、1280×720 → 640×360 的 **CSS 可用空间折半**，验证响应式、滚动和操作可达性。它不改变 Windows 显示缩放，也不等于真实浏览器 200% zoom；没有覆盖系统字体栅格化、浏览器 chrome、设备像素比或多屏 DPI 行为。

## 参考比较与剩余差异

- 信息结构对齐：两者都保持竖向字段次序、紧邻字段的错误文本和明确提交动作；本地另外展示持久标签、描述、重置、草稿状态和服务器字段错误，适用于设置工作上下文。
- 尺度明显不同：PrimeVue 示例表单宽 224 px、输入高 35 px；本地 Lab 在桌面横向延伸到 982–998 px，输入高为 32 / 40 px。当前输入中的短文本与右侧留下较多空白。若以后做实际设置页面，应在共享布局层选择合适的内容宽度；本次不把宽度差异判作像素相似，也不改造 Lab。
- 主题保留 Reito 原有中性 Graphite：本地深色工作面比官方近黑参考更亮，浅色偏暖中性，边界更轻；并非官方配色复刻。
- 官方示例使用与输入同宽的提交按钮，本地使用左侧紧凑“保存设置 / 重置”操作组；本地 Checkbox 在标签下一行，较典型同行选项占用更多竖向空间。两者当前可辨识、可操作，这些仍是组合布局差异。
- Lab 外框、“提交结果”选择器与提交后 JSON 是组件检查/本地演示环境；不能当作真实后端服务或真实业务页已完成的证据。正式视觉结论是**当前 Form 在 Reito Lab 中结构清晰，四主题密度未发现阻断性视觉问题**，不是与参考的像素一致或所有高级能力的视觉验收。

## 保留的初轮与脚本问题

- 6006 开发 Storybook 的初轮 `disabled` true→false 和 `showDescriptions` false→true 曾得到对应 DOM 变化；随后表单意外再次整体禁用，导致重置动作超时。保留了[初轮失败截图](../.logs/form/failure-controls-mode-onSubmit.png)。同一时段有开发构建 HMR / reload，**这轮不能作为最终通过或 Form 根因结论**。
- 在 6007 的单独探针中，同一 Playground 将 `validationMode` 从 `onBlur` 改为 `onChange`，StoryStore args 同步更新；输入 `x` 且仍保持焦点时出现名称错误。记录见 [JSON](../.logs/form/mode-probe.json)、[同页截图](../.logs/form/mode-probe-6007-onchange.png)。这只证明该次模式切换，尚不能代替全部 mode / Controls 验收。
- 主任务随后修复失焦校验插入错误时可能移动点击目标的问题。上面的最终记录来自通知后的稳定版本；本次 10 组 Controls 已在该版本重测，具体失焦点击回归由主任务的交互测试负责。
- 稳定构建第一次执行中，成功提交断言的 `getByRole('status')` 同时匹配 Spinner 与状态段落，触发 Playwright strict mode 错误。保留 [失败 JSON](../.logs/form/visual-audit-selector-failure.json)。将测试定位收窄为 `p[role="status"]` 后完整 Controls 重测通过；这是验收脚本错误，没有通过修改产品来掩盖。

最终执行前后 `form.tsx`、`form-demo.tsx`、`Form.stories.tsx` 的 SHA256 完全相同，完整值保存在结果 JSON；Form 主文件前缀 `6ca3830fff7d`。布局补采不改变产品。原始综合 JSON 中尺寸可能采到主题/密度过渡的中间值，表格与最终 Lab 截图以 `visual-stable-layout.json` 为准。

本次没有运行全量 Storybook 扫描、没有修改产品源码；主任务的构建、测试与高级功能结果应独立引用，不由截图检查替代。
