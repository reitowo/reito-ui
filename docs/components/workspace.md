# Workspace 与 Sidebar 状态

`ResizableWorkspace` 负责两栏的指针与键盘缩放。`primaryPercent` / `onPrimaryPercentChange` 可将比例交给宿主控制；未传时使用 `defaultPrimaryPercent`。回调的第二个参数提供 `isUserInteraction`，应用可只保存指针和键盘产生的最终布局，忽略首次挂载或命令式同步。

`useWorkspaceLayoutState` 把 Sidebar 展开状态和主面板百分比保存在同一个版本化记录中。默认使用 `localStorage` 键 `reito.workspace.layout`，也可传入兼容 `getItem / setItem / removeItem` 的存储适配器。组件不会连接账号或远程偏好服务。

```tsx
import { Sidebar, SidebarInset, SidebarProvider } from '@reito/ui/basic';
import {
  ResizableWorkspace,
  WorkspacePane,
  useWorkspaceLayoutState,
} from '@reito/ui/complex';

export function ProjectWorkspace() {
  const layout = useWorkspaceLayoutState({
    storageKey: 'project.workspace.layout',
    defaultSidebarOpen: true,
    defaultPrimaryPercent: 36,
    minPanelPercent: 20,
  });

  return <SidebarProvider
    open={layout.state.sidebarOpen}
    onOpenChange={layout.setSidebarOpen}
    persistOpen={false}
  >
    <Sidebar collapsible="icon">导航</Sidebar>
    <SidebarInset>
      <ResizableWorkspace
        primaryPercent={layout.state.primaryPercent}
        minPanelPercent={20}
        onPrimaryPercentChange={(value, meta) => {
          if (meta.isUserInteraction) layout.setPrimaryPercent(value);
        }}
        primary={<WorkspacePane title="目录">项目文件</WorkspacePane>}
        secondary={<WorkspacePane title="内容">当前文件</WorkspacePane>}
      />
    </SidebarInset>
  </SidebarProvider>;
}
```

恢复结果的 `source` 为 `loading / current / legacy / fallback / unavailable`。当前 schema 是 `{ version: 1, sidebarOpen, primaryPercent }`；旧记录可从 `sidebarOpen / sidebar / open` 和 `primaryPercent / primary / layout.primary` 迁移。未知版本、损坏 JSON、超出最小面板约束的当前尺寸会整体回退。存储不可读或不可写时继续使用内存状态，并报告 `unavailable`。

`SidebarProvider.persistOpen` 默认仍写入 `sidebar_state` Cookie，以兼容基础 Sidebar 的独立使用。传 `false` 可关闭；传 `{ cookieName, maxAge }` 可配置。与 `useWorkspaceLayoutState` 组合时关闭 Cookie，避免两个持久化来源竞争。

受控 `ResizableWorkspace` 在宿主没有接受用户的新比例时会恢复传入值。`minPanelPercent` 会约束默认值、受控值、恢复记录和后续写入；范围自身被限制为 5%–45%。服务端首屏需要无布局跳动时，应从服务端可读偏好生成相同的初始比例，或等客户端完成恢复后再展示分栏。
