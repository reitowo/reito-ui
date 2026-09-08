# MessageParts / StructuredMessage

`MessageParts` 把宿主保存的结构化消息映射到 Reito UI 已有的 AI 组件。它支持文本、工具调用、来源、附件、产物和未知类型；网络请求、模型 SDK、消息持久化与状态推进仍由宿主负责。

```tsx
import { StructuredMessage, type MessagePart } from '@reito/ui';

const parts: MessagePart[] = [
  {
    id: 'answer',
    type: 'text',
    format: 'markdown',
    status: 'streaming',
    streamKey: 'response-42',
    text: '正在生成 **结构化内容**',
  },
  {
    id: 'tool-read',
    type: 'tool',
    title: '读取设计规范',
    status: 'complete',
    content: 'docs/design-language.md',
  },
];

<StructuredMessage
  from="assistant"
  parts={parts}
  onRetryPart={partId => retryPart(partId)}
  onToolOpenChange={(partId, open) => updateTool(partId, { open })}
/>
```

## Part 类型

| `type` | 数据 | 映射组件 |
| --- | --- | --- |
| `text` | `text`、`plain \| markdown`、可选 `streamKey` | `MarkdownContent` 或紧凑纯文本 |
| `tool` | `title`、`content`、展开状态与显示变体 | `ToolCall` |
| `source` | `SourceItem[]` | `Sources` |
| `attachment` | `AttachmentItem[]` | `AttachmentList` |
| `artifact` | `ArtifactVersion[]`、版本和视图 | `ArtifactPanel` |
| `unknown` | 原始类型、标签与不透明 payload | 默认可读占位或 `renderUnknownPart` |

每个 part 必须有消息内唯一且稳定的 `id`。流式追加、错误恢复和宿主重新渲染时保持该 ID，React 才能保留已经稳定的 part DOM；开始一段替换式文本流时保留 part ID，并更换文本 part 的 `streamKey`，让 `MarkdownContent` 重建内部文档树。

## 状态与宿主控制

`status` 统一为 `pending | streaming | complete | error`。工具 part 会映射到 `ToolCall` 的等待、运行、完成和失败状态；其他 part 在已有内容下方显示紧凑状态。错误不会清除已接收内容，`onRetryPart(partId)` 只报告意图，由宿主决定何时进入新状态。

附件移除/重试回调同时返回 part ID 与附件 ID。工具展开、产物版本/视图/关闭也都返回 part ID，因此同一消息中可以安全存在多组相同类型。受控字段传入后，组件不会自行改写宿主数据。

`StructuredMessage` 组合现有 `Message` 与 `MessageParts`。没有显式传入 `streaming` 时，只要任一 part 处于 `streaming`，消息就显示“正在输出”；显式值可覆盖派生结果。单独使用 `MessageParts` 时，调用方负责外层消息角色。

## Provider 适配边界

模型 SDK 的 `text`、`tool-*`、`source-*`、`file` 或自定义 data part 应先在应用适配层转换成 `MessagePart`。不要把 Provider 的任意对象直接作为 ReactNode，也不要让组件根据传输层事件猜测工具执行状态。运行时遇到尚未适配的类型时，默认降级为一条可读提示，不展示 payload；需要专用 UI 时使用 `renderUnknownPart`。

Storybook 主入口：[参数调试](http://127.0.0.1:6007/?path=/story/ai-messageparts--playground)。同页 Controls 可以调整文本格式与状态、消息角色、工具状态/展开、来源、附件、产物视图和未知类型。
