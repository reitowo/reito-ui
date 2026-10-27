# 页面组合与默认主题

当前候选为 0.6.0-next.0，包含有意的默认视觉变化。应用只选择组件、内容和公开属性；
普通表单、列表、空状态、标题和内容面板不需要应用 CSS。

## 一次接入

同时安装匹配的 UI 与 tokens 版本。入口依次导入 @reito/tokens/css 和 @reito/ui/styles.css，
用 ReitoThemeProvider root 包住应用并选择 mode。默认 compact，不要求产品提供密度切换。
全局主题可以写成 createTheme 预设传给 theme；局部变化用 Theme 包住子树，详见 docs/theme-guide.md。
样式已经编译，消费工程不需要 Tailwind、扫描 node_modules 或复制字体规则。

## 页面区域：先确定 Shell → Page → Panel

普通运营、列表和表单页面按区域组合；不需要先研究一串布局工具再自行编写 content/body 样式。

| 区域 | 公开入口 | 所有权 |
| --- | --- | --- |
| 应用外壳 | Shell、Shell.Sidebar、Shell.Main | 导航与主区域，宿主提供高度，窄容器保留导航 |
| 顶栏 | Shell.Topbar | 高度、对齐、边界与内距 |
| 工作内容 | Shell.Content | 独立滚动与键盘停靠；不叠加页面 padding |
| 整页 | Page、Page.Header、Page.Content | 页头到正文间距，inset 只提供一次页面边缘 |
| 内容面板 | Panel、Panel.Header、Panel.Content、Panel.Footer | 标题身份、面板表面与一层内距 |

```tsx
<Shell>
  <Shell.Sidebar>{navigation}</Shell.Sidebar>
  <Shell.Main>
    <Shell.Topbar>{breadcrumbs}</Shell.Topbar>
    <Shell.Content>
      <Page inset>
        <Page.Header title="消息接纳" description="查看归属与处理进度" actions={refresh} />
        <Page.Content>
          {summary}
          <Panel flush>
            <Panel.Header title="接纳记录" />
            <Panel.Content>{recordsOrEmpty}</Panel.Content>
            <Panel.Footer>{pagination}</Panel.Footer>
          </Panel>
        </Page.Content>
      </Page>
    </Shell.Content>
  </Shell.Main>
</Shell>
```

Header、Content、Footer 始终带所属区域。Shell.Content 管滚动，Page 管页面边缘，Panel.Content 管面板内距。
Page.Content 的 gap 继承 Page.gap，允许独立选择语义 gap；Panel.Content 的 flush 继承 Panel 和主题默认值，
局部 flush 属性可以覆盖。Header 中标题、说明和操作使用同一文字与间距角色，调用者不补 margin。
Panel 必须提供标题（简写 title 或 Panel.Header）或 aria-label；标题关联在服务端渲染时即可用。
命名区域必须是各自根组件的后代，嵌套 Panel 的身份和内距不会覆盖外层。

现有 `<Page title=…>` 和 `<Panel title=…>` 简写继续使用这些区域实现，不添加第二层正文。
旧 PageHeader 导出保持兼容；新配方优先使用 Page.Header。AppShell／WorkspacePreset 的既有复杂分栏不变。
需要分栏切换、检查器或持久化布局时继续使用对应工作区组件，Shell 不自动执行路由、认证或保存配置。
权限申请把 Tabs 放在 Page.Content 内，Tabs.Content 再放 Panel；消息接纳把摘要与记录 Panel 依次放在正文流中。
完整可运行例子见 `RegionPageDemo`／`RegionShellDemo` 和 Storybook“页面与面板区域”。

## 组合所有权

- Stack 提供纵向间距，inset 显式提供内容内距；Inline 对齐并自动换行。
- Grid 按容器可用宽度排列同级区域，窄面板也能自动收为单列。
- 整页使用 Page：title、description、actions 与内容通过一个公开入口组合，统一页头到内容的距离。
  Page 不添加默认外部 margin；inset 只在页面需要自己提供外边缘时启用。
- PageHeader 统一标题、说明和主要操作，供已有容器使用；Panel 统一区域标题、操作和页脚。
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
| Page 页头到内容 | 16px | 20px | 12px |
| 标题到说明 | 4px | 6px | 2px |
| Tabs 导航到面板 | 12px | 16px | 8px |
| Empty 内距 | 24px | 32px | 16px |
| 正文字号 | 14px | 14px | 14px |

按 16px 根字号折算，真实值由 tokens.json 生成。密度调整控件和空间，保留独立正文角色。
radius-control 默认引用 6px 小圆角，radius-surface 默认引用 8px 中圆角；菜单和 composer 有明确角色。
Card、Empty、Panel 消费 surface 角色，Input、Select、Button 消费 control 角色。
基础字体规则位于 CSS base 层，不能压过等宽字体或组件自己的文字角色。

## 页头与页签

```tsx
<Page title="知识库" description="检索已发布内容，管理来源与审核">
  <Panel title="检索知识">{/* 业务内容 */}</Panel>
  <Grid>{/* 同级内容区 */}</Grid>
</Page>
```

Page 使用 section-gap 管理页头到内容，用 gap 属性管理内容区的同级间距。
标题到说明使用 compact-surface-gap；Tabs 到面板使用 content-gap。这些角色随密度和 Provider 覆盖变化。
应用不需要给 PageHeader、TabsContent 或首个 Panel 添加 margin-top／margin-bottom 来补齐布局。

Tabs 的 default 是紧凑分段控件，line 是占满可用宽度的页面导航。
line 标签按内容宽度排列，底边与选中指示线在同一位置；不使用指示线的负空间来制造面板间距。
两种样式的长标签在导航内横向滚动，保持完整文字；方向键聚焦会把目标滚入可见范围。
纵向 line 导航沿右边显示选中状态。导航样式不改变 Base UI 的选择、禁用或键盘行为。
需要保留未发送表单 DOM 时使用 TabsContent keepMounted，业务草稿与命令仍由应用管理。

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
