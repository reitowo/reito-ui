# LogViewer 日志查看

`@reito/ui/complex` 导出 `LogViewer`、`LogEntry`、`LogLevel`、`LogViewerViewPreferences` 与 `LogViewerProps`。组件面向桌面工作区中的结构化日志流；宿主负责日志传输、历史加载、缓存、取消和偏好持久化。

```tsx
const [entries, setEntries] = useState<LogEntry[]>(initialLogs);
const [follow, setFollow] = useState(true);
const [preferences, setPreferences] = useState({
  wrapLines: true,
  showTimestamp: true,
  showLevel: true,
  showSource: true,
});

<LogViewer
  entries={entries}
  totalCount={history.total}
  hasOlder={history.hasOlder}
  loadingOlder={history.loading}
  loadOlderError={history.error}
  onLoadOlder={() => history.loadPreviousPage()}
  follow={follow}
  onFollowChange={setFollow}
  viewPreferences={preferences}
  onViewPreferencesChange={setPreferences}
/>
```

| 参数 | 契约 |
| --- | --- |
| `entries` | 已加载且按时间排列的日志。`id` 必须在追加、前插和查询期间稳定；重复 ID 无法形成可靠锚点。 |
| `virtualized / overscan` | 默认启用动态虚拟窗口，只挂载可见范围附近的日志；`overscan` 默认 6。设为 `false` 可用于很小的静态集合。 |
| `viewportClassName` | 调整滚动区尺寸，默认 `h-64`。横向溢出只留在该滚动区。 |
| `query / levels` | 在已加载日志中查询消息、来源和时间，并按等级筛选。可分别受控；组件不把本地查询解释为远程协议。 |
| `follow` | 跟随时增量追加跳到最新；鼠标向上滚动、触摸滚动或拖动滚动条离开末尾会暂停。恢复跟随后立即到末尾。 |
| `viewPreferences` | `wrapLines`、`showTimestamp`、`showLevel`、`showSource` 可部分受控。回调总是返回完整偏好；组件不访问 localStorage。 |
| `totalCount / hasOlder` | `totalCount` 表示当前日志源总量。`hasOlder`、`loadingOlder`、`loadOlderError` 与 `onLoadOlder` 表达向前分页；组件不发起网络请求。 |
| `onVisibleRangeChange` | 返回共享 `VirtualListRange`，供宿主预取、遥测或缓存使用。 |
| `loading / error` | `loading` 且没有缓存时显示首次加载；`error` 可与已有日志同时展示。历史加载使用独立状态，不遮住当前日志。 |

动态测量让同一条日志可以包含换行。暂停跟随后，末尾追加和开头插入都会按稳定日志 ID 保留当前阅读行；原始 `scrollTop` 可能随前插内容总高度改变，阅读行相对视口的位置保持不变。关闭自动换行会产生日志区内部横向滚动，不会扩大页面。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-logviewer-日志查看--playground) 可在同一 Story 调整查询、等级、跟随、虚拟化、加载和视图偏好；[一万条日志](http://127.0.0.1:6006/?path=/story/复杂-logviewer-日志查看--virtual-large)、[跟随追加](http://127.0.0.1:6006/?path=/story/复杂-logviewer-日志查看--append-following)、[暂停追加](http://127.0.0.1:6006/?path=/story/复杂-logviewer-日志查看--append-paused) 和[前插历史](http://127.0.0.1:6006/?path=/story/复杂-logviewer-日志查看--load-older)固定高级边界。[Lab](http://127.0.0.1:5173/?layer=complex&component=log-viewer) 使用同一公共组件。
