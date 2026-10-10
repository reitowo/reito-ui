# 组件 token 继承验证 · 2026-10-10

## 改动范围

默认值仍由 `packages/tokens/src/tokens.json` 管理。CSS 构建保留普通引用，并新增 Button、Input、Menu、Card 组件默认别名与 Reito 计算表达式。Provider 增加受类型检查的 `tokens` 配置，逐键继承，局部主题和 Portal 重新绑定别名。数值 API 和容器查询继续使用构建期默认值。

## 实测

Lab `?view=theme-guide`，深色 / compact，1303 × 1244：

| 状态 | 示例按钮 | 单行菜单 | 菜单上下内距 | 卡片标题 / 内容 / 脚注内距 |
| --- | ---: | ---: | ---: | --- |
| 默认 | 28px | 28px | 4px | 三者均上下12px、左右16px |
| 共享尺寸增加一级 + 卡片紧凑内距 | 32px | 32px | 6px | 三者均上下8px、左右12px |

第二种状态下，作用域外的“重置尺寸示例”按钮仍为28px。菜单主文字13px，输入框保持表单尺寸。多行条目自然增高，不强制截入单行目标高度。现场截图 `.logs/component-tokens-live-demo.png`。

视觉参照为用户提供的本库紧凑主题菜单截图 `C:/Users/reito/AppData/Local/Temp/codex-clipboard-144fffaa-cee7-4233-a44e-d91810dd107f.png`，以及上一轮 `.logs/theme-menu-compact-after.png`。默认菜单保留修正后的28px、13px文字和横向较大的内距；没有恢复参考中松散的36px紧凑行。新增示例使用本库卡片，并明确展示同一组区域内距，不宣称复刻第三方页面。

## 检查记录

- `npm run tokens:build`：通过，生成 CSS / TS 声明 / 运行时绑定与数字 metrics。
- `npm run build`：通过，包括 UI、Lab、Storybook、Workbench；仍有已有的大 chunk 提示。
- `npm run check`：通过。Token 审计350个文件、0个未批准项，保留29项精确例外。
- 相关 Playwright 用例26项：组件引用与局部微调及色阶继承6项，菜单密度4项，既有 token 合约3项，主题回归10项，缺失引用 / 普通循环 / 表达式循环3项。主题与密度包含dark / light × compact / comfortable。

过程发现并修复：重绑范围最初包含仅承载文档根主题的空 wrapper，遮住了根字体覆盖，现只在真正的主题/密度作用域及 Provider 的显式样式重新绑定。既有 token 合约先等待按钮挂载，再覆盖根变量，并使用按钮已有的 action-font-size 角色。主题保存状态断言限制到对应预览区，避免新示例 output 的隐式 status 造成定位歧义。

一次运行中途有源码热更新及另一个 Playwright 运行清理共享输出目录，出现菜单定位超时和 trace 文件缺失；稳定源码后串行重跑配色与系统模式两项均通过。最终组件、颜色和生成器回归在 `.logs/component-tokens-complete-tests.log` 中记录。其他相关日志分别为 `.logs/component-tokens-tests-final.log`、`.logs/component-tokens-final-repairs.log`、`.logs/component-tokens-palette-recheck.log`、`.logs/component-tokens-last-tests.log`。以上是这些相关用例在修复/重跑后的结果，不代表执行了整个仓库测试集。

## 边界

本次建立共享机制并接入四个组件组，其他组件仍通过共享语义变量工作。没有给全部139个组件族增加独立配置，也没有新增发布版本。运行时任意 CSS 字符串的有效性由调用方负责；类型检查约束 token 键，生成器检查源文件引用图，均不能自动保证任意覆盖组合的视觉合理性。
