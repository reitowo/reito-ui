# CommandSearch 与 ApplicationSearch

`CommandSearch` 是可嵌入面板的命令搜索面；`ApplicationSearch` 将同一搜索面放入应用级 Dialog，并补上全局快捷键、异步命令状态和焦点归还。两者都不创建搜索索引，也不连接文件、任务、AI 或远程服务。

命令由宿主按资源分组注入。`label` 是主名称，`description` 提供路径或上下文，`keywords` 只参与匹配，`actionLabel` 表示“打开”“查看”“运行”等结果动作，`shortcut` 只显示该命令自己的提示。查询可由 `query / onQueryChange` 控制，宿主可在查询变化后传入新的 `groups`、`loading`、`error` 和 `onRetry`。

```tsx
import { ApplicationSearch, type CommandGroupDefinition } from '@reito/ui/complex';

const groups: CommandGroupDefinition[] = [
  {
    id: 'files',
    label: '文件',
    commands: [{
      id: 'workspace-story',
      label: 'Workspace.stories.tsx',
      description: 'apps/storybook/stories/complex',
      keywords: ['workspace', 'story'],
      actionLabel: '打开',
    }],
  },
  {
    id: 'actions',
    label: '操作',
    commands: [{
      id: 'run-check',
      label: '运行组件检查',
      actionLabel: '运行',
    }],
  },
];

export function ProjectSearch() {
  return <ApplicationSearch
    groups={groups}
    context="reito-ui / 当前工作区"
    contextLabel="当前工作"
    label="搜索应用"
    placeholder="搜索文件、任务或操作…"
    shortcut="mod+k"
    shortcutLabel="Ctrl K"
    onSelect={async command => {
      await runHostCommand(command.id);
    }}
  />;
}
```

`ApplicationSearch` 默认非受控，可使用 `defaultOpen`；需要和菜单或标题栏按钮同步时使用 `open / onOpenChange`。默认快捷键是 `mod+k`，其中 `mod` 接受 Windows/Linux 的 Ctrl 或 macOS 的 Meta；也可传 `false` 关闭。快捷键处理忽略 `isComposing` 与 keyCode 229，输入法候选确认不会打开搜索或执行命令。

`onSelect` 可以返回 Promise。等待期间结果被锁定并显示执行状态；成功后默认关闭 Dialog，失败后留在原位并显示可恢复错误。关闭 Dialog 会让迟到的 Promise 结果失效，但不会取消宿主任务；需要真正取消网络或进程时由宿主持有 AbortController 或任务句柄。`closeOnSelect={false}` 适用于连续切换或批量动作。

直接使用 `CommandSearch` 时，命令选择是同步通知；异步动作生命周期应由宿主转成 `loading / error / onRetry`，或使用 `ApplicationSearch` 的内建事务。`footer={false}` 可隐藏帮助区；自定义 footer 应保留键盘说明。禁用命令继续可见但不可选择，整个搜索禁用时输入和命令都不可操作。
