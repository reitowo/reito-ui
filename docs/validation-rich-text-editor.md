# RichTextEditor 基础内容模型验收

2026-09-07，`EDIT-01` 完成。新增 `RichTextEditor`，以固定的 Tiptap 3.31.3 / StarterKit / Markdown 建立真实 schema 文档树，覆盖 JSON、HTML、Markdown 输入输出、受控与未受控值、同步多格式快照、外部替换、解析失败、空/只读/禁用和宿主错误。

## 自动验证

- `npx playwright test tests/rich-text-editor.spec.ts --workers=1`：19/19 通过。覆盖三种输入格式、真实 schema 节点、逐事务输出、受控回声竞态、宿主替换/清空、占位、严格 JSON 错误、HTML schema 过滤、中文组合输入、Controls、窄屏和四种主题密度 axe。
- 17 个 Story × dark/light × compact/comfortable：68/68 通过；page error 0、console error 0、WCAG 2A/2AA/2.1AA 违规 0、横向溢出 0。报告为 `.logs/rich-text-editor/storybook-audit.json`。
- Playground 在同一 Story 公开 `format / value / label / description / placeholder / readOnly / disabled / showOutput` 八项 Controls，并验证组件回调会回写当前画布。
- `npm run check` 与 `npm run build`：通过。全库为 121 个组件族（基础 70、复杂 32、AI 19），Storybook 共有 1167 个 Story；构建只保留既有 chunk size 提示。

## 参考与视觉核对

能力和内容边界核对 [Nuxt UI Editor](https://ui.nuxt.com/docs/components/editor)、[Tiptap 内容模型](https://tiptap.dev/docs/editor/core-concepts/introduction)、[持久化建议](https://tiptap.dev/docs/editor/core-concepts/persistence)与 [Markdown 文档](https://tiptap.dev/docs/editor/markdown)。Nuxt UI 当前说明其 Editor 以 Tiptap 为基础，公开 JSON/HTML/Markdown，并把 toolbar、drag handle、suggestion、mention、emoji、图片和 AI 作为可组合能力；Tiptap 将 JSON 文档树作为内部模型，并明确 Markdown 扩展仍有 Beta 边界。

实际检查了 Nuxt UI 4.11.0 Editor 文档的当前渲染和 Theme 配置：参考使用较宽的 `*:my-5`、`sm:px-8`、正文 `leading-7` 和 3xl/2xl 标题，面向宽文档阅读。Reito 的 dark/light 截图位于 `.logs/rich-text-editor/`；它使用 14px 正文、lg/base 标题、共享内容 padding 和 224px 最小高度，保留紧凑桌面工作面的信息密度。两者都让正文直接成为编辑面并弱化外层装饰；Reito 额外显示当前宿主格式，暂未提供工具栏和媒体节点。

实现没有复制 Nuxt UI 的 Vue 源码、样式、模板或资产。Tiptap 依赖按 MIT 许可使用，版本与许可记录见 `docs/references.md` 和 `packages/ui/THIRD_PARTY_NOTICES.md`。
