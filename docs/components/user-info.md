# UserInfo

`UserInfo` 是紧凑的身份信息行，组合头像、名称、辅助说明、可读状态和独立宿主动作。它本身是静态容器；每个动作保留自己的 Button 焦点与回调，避免可点击整行中再嵌套按钮。

```tsx
import { UserInfo, type UserInfoAction } from '@reito/ui/complex';

const actions: UserInfoAction[] = [
  { id: 'message', label: '发送消息', icon: <Mail />, onSelect: openMessage },
  { id: 'more', label: '更多操作', icon: <More />, disabled: true, onSelect: openMenu },
];

<UserInfo
  name="Reito"
  description="组件系统维护者"
  fallback="R"
  status="在线"
  statusTone="success"
  actions={actions}
/>
```

## 头像与文字

`avatarSrc` 使用基础 Avatar 的图片加载与 fallback 契约；`avatarAlt` 命名头像。没有图片时，字符串名称自动取前两个词的首字符；复合 ReactNode 名称使用通用用户图标。宿主可以通过 `fallback` 显式覆盖。

名称和辅助说明会在窄行中省略显示。字符串内容同时写入 `title`，完整名称仍可取得；组件不会缩小字号来塞入长文本。`size="sm | default | lg"` 同步选择基础 Avatar 尺寸，行内 padding 继续跟随全局 density tokens。

## 状态

`status` 必须包含可读文字，状态点只是辅助。`statusTone="neutral | success | warning | danger"` 使用共享语义色；不要只传空文字并依赖颜色表达在线、暂离或错误。

## 动作

每个 `UserInfoAction` 使用稳定 `id`、可读 `label` 和宿主 `onSelect`，可独立 `disabled / loading`。图标动作默认使用 XS 图标按钮并由 `label` 提供可访问名称和 title；`showActionLabels` 显示完整文字。没有图标的动作自动显示文字。

`disabled` 表达整行不可操作，并禁用全部动作；静态身份信息仍可阅读。`actionsLabel` 命名动作组。宿主需要菜单时，应把其中一个动作连接到 DropdownMenu；组件不会把动作数组解释为菜单模型。

`variant="plain | muted | outline"` 只控制共享语义表面。消费页面可用外部布局把多行 UserInfo 排成列表；列表选择、导航链接、复选与虚拟化应由相应集合组件承担。
