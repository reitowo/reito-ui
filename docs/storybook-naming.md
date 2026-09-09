# Storybook 命名与语言规范

## 目录名称

固定两级：`基础 / EnglishAPI 中文用途`、`复杂 / EnglishAPI 中文用途`、`AI / EnglishAPI 中文用途`。源码 title 中只有一条层级斜线，例如 `基础/Accordion 折叠面板`。英文使用组件 PascalCase，不再混用 Alert Dialog、AlertDialog；中文用简短用途，如“警告对话框”。

组合展示仍放在同一个组件目录。例如 MarkdownContent 与 RichMessage 共用“MarkdownContent 富文本内容”，组合关系写在文档，不用额外斜线制造第三级目录。基础 Table 与复杂 DataTable 分别叫“基础表格”和“数据表格”，InputOTP 与 OneTimeCode 分别叫“验证码输入”和“验证码展示”。

## 示例名称

- 每个导出的 Story 显式写 `name`，不用 Storybook 从英文变量名自动生成标签。
- 主 Playground 固定“参数调试”，使用 Controls 在同页调整参数。其他 Playground 保留具体用途，例如“附件参数调试”。
- 默认、总览和通用交互示例分别使用“默认示例”“总览对比”“交互演示”；已有描述具体内容的名称保留，比如“状态 · 全部收起”。
- 分类与具体场景之间使用 ` · `：`状态 · 禁用`、`行为 · 多项展开`、`图形 · 柱状图`。不混用斜线和冒号作为分类符号，也不强行给每个已有中文场景加分类。
- 禁用、只读、加载中、错误等通用状态用一致词汇；区别空值、空选项、无搜索结果、无内容，不把不同业务状态合并成一个名称。
- JavaScript、TSX、JSON、Markdown 等技术标识保留英文，以“语言 · TSX”等中文分类补充语境。prop、参数值、类型和导出名保留真实 API 拼写，不翻译成不可复制的伪 API。
- 同一组件目录中的示例显示名必须唯一。

## 文档与检查工具

主题菜单显示“深色 / 浅色”，密度菜单显示“紧凑 / 舒适”。这些菜单只用于组件检查；消费产品仍默认紧凑，不自动增加密度切换控件。

侧栏 Docs 显示为“使用文档”。通过 manager 的 `sidebar.renderLabel` 翻译；保持配置 `docs.defaultName: 'Docs'`，因为修改 defaultName 会改变文档 URL。

Storybook 内置 Controls、Actions 等插件名以及开发者工具名保留官方名称。在自有说明里写“Controls（参数面板）”“组件属性（props）”。本次不做修改 DOM 或覆盖第三方内部翻译的补丁。

## 稳定链接

显示 title 与链接身份分开：所有 meta 显式填写 `id`。本次保留原先由旧 title 生成的 ID；部分历史 ID 有连字符或中文，这是兼容约定，不再按新 title 重算。

Story 的英文导出名保持不变。改 name 不改 URL；新组件选择唯一稳定 id，新 Story 使用能表达语义的英文导出名。不要为了语言调整重新命名导出。

Lab 目录生成器优先使用 meta.id 生成跳转地址。构建时的命名检查验证两级双语目录、ID 唯一、中文 name、Playground 固定名称与目录内名称唯一。

## 验证

`node scripts/check-storybook-names.mjs` 执行命名检查；`catalog:check` 与 `catalog:build` 自动调用，因此 `npm run check` 和 `npm run build` 都会检查新增命名。

本轮对本地 141 个目录、1,442 个 Story 完成规范化，其中包含工作区尚未提交的 Kanban 示例。改名前后开发服务 1,583 个索引 ID（含文档）全部保留。公开提交不混入该延期组件或其他未提交的业务调整。

运行 `tests/storybook-naming.spec.ts` 核对实际索引、旧链接、侧栏中文文档标签及 Accordion 同页 Controls；完整构建和检查记录在 `.logs/story-naming-*.log`。显示名调整不替代各组件既有行为验收。
