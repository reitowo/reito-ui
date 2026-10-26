# 页面组合与默认主题

当前候选为 0.6.0-next.0，包含有意的默认视觉变化。应用只选择组件、内容和公开属性；
普通表单、列表、空状态、标题和内容面板不需要应用 CSS。

## 一次接入

同时安装匹配的 UI 与 tokens 版本。入口依次导入 @reito/tokens/css 和 @reito/ui/styles.css，
用 ReitoThemeProvider root 包住应用并选择 mode。默认 compact，不要求产品提供密度切换。
样式已经编译，消费工程不需要 Tailwind、扫描 node_modules 或复制字体规则。

## 组合所有权

- Stack 提供纵向间距，inset 显式提供内容内距；Inline 对齐并自动换行。
- Grid 按容器可用宽度排列同级区域，窄面板也能自动收为单列。
- PageHeader 统一页面标题、说明和主要操作；Panel 统一区域标题、操作和页脚。
- Panel 默认自己提供一层内容内距；表格、ItemGroup、Empty 已有自己的内距，使用 flush。
- Text 的 body/interface/caption/reading 角色、Heading 的 page/section/item 尺寸管理文字层级。
  Heading level 单独管理文档语义。正文默认完整换行，标题和段落不带浏览器默认 margin。
- FieldGroup 与 Field 提供组间、标签和说明间距。Inline align="end" 中的字段与默认按钮对齐。
- ItemGroup 不重复添加记录间隙；ItemSeparator 只提供分隔线。Item 默认保留长标题和完整说明。

公开接口见 packages/ui/src/basic/composition.tsx；可运行例子在 Lab 的 Composition 页面积木中，
Storybook 同名条目提供默认与主题覆盖场景。portable skill 的 assets/workbench.tsx 从同一个例子生成，
npm run recipe:check 检查其内容和公共导入，避免文档里的接口与实现脱节。

## 统一默认尺寸

| 角色 | compact | comfortable | dense |
| --- | ---: | ---: | ---: |
| 默认 Button / Input / Select 高度 | 32px | 36px | 24px |
| 默认控件字号 | 13px | 13px | 12px |
| 通用内容内距 | 12px | 16px | 8px |
| Empty 内距 | 24px | 32px | 16px |
| 正文字号 | 14px | 14px | 14px |

按 16px 根字号折算，真实值由 tokens.json 生成。密度调整控件和空间，保留独立正文角色。
radius-control 默认引用 6px 小圆角，radius-surface 默认引用 8px 中圆角；菜单和 composer 有明确角色。
Card、Empty、Panel 消费 surface 角色，Input、Select、Button 消费 control 角色。
基础字体规则位于 CSS base 层，不能压过等宽字体或组件自己的文字角色。

## 从 0.5.8 升级

这是默认外观变化，不是纯修补。默认按钮从 28px 调整为与输入同高；显式 size 仍表示对应尺寸。
SelectInput 正确显示空字符串选项的 label，null 仍表示未选择。字段说明去掉负 margin，
Empty 和记录间距跟随 density；Item 的隐式文本截断被移除，内容可自然增加高度。

升级前盘点应用对按钮高度、字体、圆角以及 Card/Empty/Field/Item 的补偿样式。升级后先验证
真实组合，再删除这些补偿。业务尺寸差异通过 Provider 的 typed tokens 表达，不重复写全局选择器。
不自动迁移应用业务状态或交互行为。发布记录、包是否已发布与各消费工程升级状态分别核实。

## 维护验收

npm run test:composition 构建 tests/consumer，只使用包的公开编译产物和发布 CSS。
测试覆盖浅深主题、三档密度、390px 窄屏、嵌套 token、portaled Select、空值标签、草稿保留、
文字角色和无重复内距。每个库级修复应有公开组合复现；源码扫描通过不代表视觉组合正确。
新增 API 同时补充 Storybook、catalog 和 skill 的组件选择指引。默认不把主题调试控件放进业务页面。
