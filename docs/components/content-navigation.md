# ContentNavigation 文档导航

`ContentNavigation` 把层级目录与一个独立滚动的正文工作面组合起来。目录复用 `TreeView` 的方向键、展开和选择语义；正文复用 `WorkspacePreset` 的宽窄布局、目录显隐和单一滚动归属。组件只保存或接收章节 ID，不读取路由，也不解析 Markdown。

```tsx
import { useState } from 'react';
import {
  ContentNavigation,
  type ContentNavigationSection,
} from '@reito/ui/complex';

const sections: ContentNavigationSection[] = [
  {
    id: 'overview',
    title: '概览',
    description: '目标与边界',
    content: <p>正文由宿主渲染。</p>,
  },
  {
    id: 'usage',
    title: '使用方式',
    children: [
      { id: 'routing', title: '路由同步', content: <p>保存稳定章节 ID。</p> },
    ],
  },
];

export function Guide() {
  const [current, setCurrent] = useState('overview');

  return <ContentNavigation
    className="h-full"
    sections={sections}
    value={current}
    onValueChange={(id, meta) => {
      setCurrent(id);
      if (meta.reason === 'navigation') history.replaceState(null, '', `#${id}`);
    }}
    title="组件指南"
    navigationTitle="目录"
    contentTitle="正文"
  />;
}
```

`value / onValueChange` 用于与 URL、标签页或宿主文档状态同步。目录选择发出 `reason: 'navigation'`，用户滚动跨过章节边界发出 `reason: 'scroll'`；宿主可据此决定是否写入浏览器历史。外部修改 `value` 时，组件滚动到对应章节，并在程序化滚动完成前忽略中间位置，避免受控值被旧章节覆盖。最后一个章节即使受滚动上限限制不能贴到容器顶部，也会在到达底部时成为当前位置。

未传 `value` 时使用 `defaultValue`，否则选择首个未禁用章节。禁用章节仍保留在正文中，但不能从目录触发导航。重复或不稳定 ID 会破坏引用和路由同步，调用方必须在整棵章节树中提供唯一且稳定的 ID。

`layoutMode="auto"` 按组件容器切换宽窄布局；`wide` 同时显示目录和正文，`narrow` 只显示当前面板。需要保存目录显隐和窄布局当前面板时，向 `layoutView / onLayoutViewChange` 传入宿主状态，或组合 `useWorkspacePresetState`。`scrollBehavior` 支持 `auto / smooth`。长标题在目录中截断并保留完整 title，在正文中自然换行；空文档和空章节分别使用 `emptyMessage / emptySectionMessage`。

组件不负责 Markdown AST、文档搜索、上一页/下一页、服务端数据或实际路由写入。Markdown 内容可先由 `MarkdownContent` 或宿主渲染器生成 React 节点；完整内容工作面在 `CONTENT-RECIPE-01` 中组合。
