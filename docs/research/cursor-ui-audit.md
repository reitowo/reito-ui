# Cursor UI：安装资源与开源基座证据审计

核验日期：2026-09-06（Asia/Shanghai）。本报告只分析官方资料、官方 VS Code 源码和本机 Cursor 安装资源。没有读取用户配置、会话、认证或工作区数据，没有启动或修改 Cursor，没有执行反编译、反混淆或运行时注入。

## 结论先行

Cursor 可以提供两类不同的参考：**经典 IDE 的工作台结构**，以及 **Agents Window 的会话、任务与变更审阅结构**。当前官方资料把二者明确分开：Agents Window 与 IDE 可以互相打开；IDE 保留 VS Code 扩展和灵活分屏；主题与扩展管理文档要求在 IDE 内操作。[Agents Window](https://cursor.com/docs/agent/agents-window)、[Themes and appearance](https://cursor.com/help/customization/themes)

本机确实存在 Cursor 自有的主题文件、`--cursor-*` / `--conversation-*` CSS 变量、composer 与 tool-call 的规则。这些足以校正“仅凭截图猜石墨色、猜 16px、猜所有内容无卡片”的方法，但不足以恢复 Cursor 的完整 React 组件树、状态逻辑或当前运行时默认值。

可直接核验的核心特征是：IDE 的 Dark 主题把编辑区设为 `#181818`，侧栏、标题栏、面板设为 `#141414`；大量边界和文字层次使用同一中性色加透明度。工具调用并非一律没有容器，其 CSS 同时支持有边界的 card，以及不同密度。完整来源和适用条件见后文。

## 证据等级与版本范围

| 等级 | 可以证明 | 不能证明 |
| --- | --- | --- |
| A：Cursor 官方产品资料 | 产品支持的界面、入口、交互概念 | 内部组件库、源码文件名、精确像素值 |
| B：本机安装 JSON / 静态 CSS | 该安装版本打包了哪些主题键、选择器、声明、尺寸及条件 | 当前窗口实际启用的规则、最终 computed style、某个源码组件一定存在 |
| C：官方 VS Code 固定版本源码 | 开源基座的类、组合方式、默认值、键盘/布局处理位置 | Cursor 分叉没有改过这些代码，或 Agents Window 完全沿用同一实现 |
| D：设计推断 | 本组件库可以借鉴的组织方式 | Cursor 官方规范或已经证实的实现事实 |

检出两套安装；以下静态 CSS 与主题分析使用较新的用户安装。未确认当前正在运行或系统默认关联的是哪一套。

| 安装范围 | 路径 | Cursor 版本 | `product.json` 的 `vscodeVersion` | 产品构建 commit | 构建时间 UTC |
| --- | --- | --- | --- | --- | --- |
| 用户安装，主要样本 | `C:\Users\reito\AppData\Local\Programs\cursor` | 3.19.7 | 1.128.0 | `90de2327392570a5f5f625c656c6749d228e6430` | 2026-09-02T23:03:07.739Z |
| 系统安装，只比对元数据 | `C:\Program Files\cursor` | 3.18.9 | 1.128.0 | `2ba48ff3f7514cc4643c52ca9f7b3173d9b66130` | 2026-08-27T01:42:22.092Z |

来源：[用户安装 package.json 第 2–17 行](C:/Users/reito/AppData/Local/Programs/cursor/resources/app/package.json:2)、[用户安装 product.json 第 7 行](C:/Users/reito/AppData/Local/Programs/cursor/resources/app/product.json:7)、[版本第 2209 行](C:/Users/reito/AppData/Local/Programs/cursor/resources/app/product.json:2209)、[commit 第 2262 行](C:/Users/reito/AppData/Local/Programs/cursor/resources/app/product.json:2262)、[构建时间第 2264 行](C:/Users/reito/AppData/Local/Programs/cursor/resources/app/product.json:2264)。系统安装的同名字段位置相同。精简元数据和 SHA-256 已保存在 [installation-evidence.json](../../.logs/research/cursor-ui-audit/installation-evidence.json)。

官方 VS Code 对照选择与元数据版本相同的 `1.128.0`，`git ls-remote` 将该 tag 解析为 `fc3def6774c76082adf699d366f31a557ce5573f`；本报告所有 VS Code 源码链接均固定到这个 revision。**这是匹配版本的上游对照，不是 Cursor 分叉的源码 commit。** 抓取记录见 [upstream-evidence.json](../../.logs/research/cursor-ui-audit/upstream-evidence.json)。

## Cursor 官方仓库能提供什么

当前 [cursor/cursor](https://github.com/cursor/cursor) 可见根目录主要是 README、SECURITY 和 issue 模板，README 引导用户提交反馈。它没有提供本次所需的 Cursor 应用 UI 源码；旧 `getcursor/cursor` 链接也不能因此被当成应用源码仓库。

本机 `resources/app/package.json` 第 10 行的 `private: true` 是包元数据，第 13 行的 repository 指向 `microsoft/vscode`。这既不能证明 Cursor 的所有代码开源，也不能证明 Cursor 自有界面使用某个 npm 组件库。本报告没有从依赖名称反推 shadcn、Radix、Emotion、Solid 或 React 的应用范围。

## 逐块对照：已证实与未证实

以下“源码来源”指可查看的 VS Code 基座，不把它冒充 Cursor 产品源码。

| UI 区块 | 可证实的 Cursor 安装 / 官方资料 | 可核验的开源基座 | 只能推断或尚未证实 |
| --- | --- | --- | --- |
| Sidebar | Dark/Light 主题具有 `sideBar.*` 颜色；CSS 有 sidebar / unified-sidebar 相关选择器和布局条件。 | `SidebarPart extends AbstractPaneCompositePart`，组合 ActivitybarPart；管理活动 view、尺寸、边界及位置。[SidebarPart](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/workbench/browser/parts/sidebar/sidebarPart.ts#L38) | Agents Window 的项目/任务树是否由这个类渲染；某张截图的侧栏默认宽度；当前活动项的数据模型。 |
| 标题与工具栏 | Theme 提供 `titleBar.*`；本机有 titlebar、action-bar、command-center 等 CSS 规则。 | `BrowserTitlebarPart` 使用 `WorkbenchToolBar` / `MenuWorkbenchToolBar`；基础 `ToolBar` 组合 `ActionBar` 与 `DropdownMenuActionViewItem`。[标题栏](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/workbench/browser/parts/titlebar/titlebarPart.ts#L226)、[ToolBar](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/base/browser/ui/toolbar/toolbar.ts#L81) | Agents Window 顶栏的框架、窗口按钮归属、各平台当前实际高度；不能把 IDE 顶栏直接等同于会话头。 |
| Split pane | 两份本机 CSS 都含 `monaco-split-view2` / `monaco-sash`；垂直/水平 sash 分别消费 `--vscode-sash-size`。官方说明 IDE 支持灵活分屏。 | `SplitView` 管理相邻 view、尺寸约束、拖动、吸附；`Sash` 管理分隔柄。[SplitView](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/base/browser/ui/splitview/splitview.ts#L412)、[Sash](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/base/browser/ui/sash/sash.ts#L251) | Agents Window 全部分栏均由 SplitView 实现；CSS 命中区域必然可拖动；分隔线视觉宽度等于可命中宽度。 |
| Editor tabs | 主题有 active/inactive 背景、文字、边框；安装 CSS 含 editor tabs 相关规则。 | `MultiEditorTabsControl` 创建 `role=tablist` 的 tabs-container、滚动容器和 `role=tab`；高度由 `EditorTabsControl` 管理。[Tabs 容器](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/workbench/browser/parts/editor/multiEditorTabsControl.ts#L184)、[高度](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/workbench/browser/parts/editor/editorTabsControl.ts#L102) | 会话切换条、任务列表或产物 Preview/Code 都应采用文件 tab 外观；Cursor 当前配置一定使用某种上游高度。 |
| Command | 官方确认通过命令面板打开 IDE / Agents Window；安装 CSS 有 `.quick-input-widget`、`.quick-input-list`。 | `QuickInputController` 组合 `QuickInputBox`、`QuickInputList`、ToolBar 和 QuickPick/InputBox 等控制对象。[QuickInputController](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/platform/quickinput/browser/quickInputController.ts#L140) | Agents Window 新版 Actions 面板完全是此对象；它使用 cmdk 或 shadcn Command。 |
| Composer | 安装 CSS 有 `.composer-bar`、`.composer-messages-container`、上下文 pill、模型选择器、编辑 banner 和会话排版变量。两份 workbench CSS 均包含这些规则。 | 本次不把 VS Code 自身 ChatInputPart 认作 Cursor Composer；没有对应的公开 Cursor 组件源码可核验。 | 输入由 textarea、Monaco、contenteditable、Lexical 或其他编辑器实现；React/Solid 的具体边界；发送/IME/流式状态机；一条 CSS 类名不能证明这些。 |
| ToolCall | 安装 CSS 明确存在 block-wrapper、block-card、simple-layout-header/body；`data-chrome=card` 控制卡片背景/边框；`data-density=flat/standard` 改变内距与 gap。 | 不把本库 Radix 或原生 details 方案声称为 Cursor 来源。 | 工具调用一定是无边界细行；所有状态都用同一高度；类名一一对应某个公开 React 组件。 |
| Diff | 主题定义新增/删除的行、文本背景；本机 CSS 有 `.monaco-diff-editor` 及 hidden-lines 区域；官方区分 Agents Window 新的 diff 审阅体验。 | `DiffEditorWidget` 显式组合 original、modified、accessibleDiffViewer，并创建 CodeEditorWidget，按并排模式设置 sash。[DiffEditorWidget](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/editor/browser/widget/diffEditor/diffEditorWidget.ts#L100) | Agents Window 的变更文件列表、PR 操作与每个 diff 块都由该 Widget 实现；自有审阅外壳的组件 API。 |

本地 CSS 依据：[desktop bundle 第 3 行](C:/Users/reito/AppData/Local/Programs/cursor/resources/app/out/vs/workbench/workbench.desktop.main.css:3)、[glass bundle 第 3 行](C:/Users/reito/AppData/Local/Programs/cursor/resources/app/out/vs/workbench/workbench.glass.main.css:3)。这两个文件各约 1.34 MB / 1.44 MB，主要规则被压在第 3 行，因此另外记录 selector、字符 offset 和整文件 hash，避免只给“第 3 行”却无法复核。

## 本机 Cursor 主题：可验证的颜色

主题扩展清单见 [theme-cursor/package.json 第 1 行](C:/Users/reito/AppData/Local/Programs/cursor/resources/app/extensions/theme-cursor/package.json:1)。其中将 `Cursor Dark` 绑定为 `vs-dark`，将 `Cursor Light` 绑定为 `vs`，另有 Midnight、High Contrast 和 Light Colorblind。下表取两个普通主题，**没有读取用户实际选择了什么主题**。

| 语义键 | Cursor Dark | Cursor Light |
| --- | --- | --- |
| `editor.background` | `#181818` | `#FCFCFC` |
| `editor.foreground` / `foreground` | `#F0F0F0` | `#141414` |
| `sideBar.background` | `#141414` | `#F3F3F3` |
| `sideBar.foreground` | `#F0F0F0BD` | `#141414BD` |
| `titleBar.activeBackground` / `panel.background` | `#141414` | `#F3F3F3` |
| `titleBar.activeForeground` | `#F0F0F084` | `#141414A8` |
| `sideBar.border` / `panel.border` / `editorGroup.border` | `#F0F0F013` | `#14141414` |
| `tab.activeBackground` | `#181818` | `#FCFCFC` |
| `tab.inactiveBackground` | `#141414` | `#F3F3F3` |
| `tab.activeForeground` | `#F0F0F0` | `#141414` |
| `tab.inactiveForeground` | `#F0F0F05C` | `#141414BD` |
| `input.background` | `#F0F0F00A` | `#FCFCFC` |
| `input.border` | `#F0F0F013` | `#14141433` |
| `input.placeholderForeground` | `#F0F0F099` | `#1414145C` |
| `focusBorder` | `#F0F0F026` | `#14141433` |
| `list.hoverBackground` | `#F0F0F011` | `#14141414` |
| `list.activeSelectionBackground` | `#F0F0F01E` | `#14141414` |
| `button.background` / `button.foreground` | `#81A1C1` / `#191c22` | `#2778C1` / `#FCFCFC` |
| `dropdown.background` | `#181818` | `#FCFCFC` |
| `diffEditor.insertedLineBackground` | `#3FA26633` | `#00AF6624` |
| `diffEditor.insertedTextBackground` | `#3FA26622` | `#00B06838` |
| `diffEditor.removedLineBackground` | `#B8004933` | `#FF617B38` |
| `diffEditor.removedTextBackground` | `#B8004922` | `#FF617B57` |
| `scrollbarSlider.background` | `#F0F0F011` | `#14141424` |

来源：[Dark JSON 第 1 行，`colors` 对象](C:/Users/reito/AppData/Local/Programs/cursor/resources/app/extensions/theme-cursor/themes/cursor-dark-color-theme.json:1)、[Light JSON 第 1 行，`colors` 对象](C:/Users/reito/AppData/Local/Programs/cursor/resources/app/extensions/theme-cursor/themes/cursor-light-color-theme.json:1)。字段快照：[theme-color-evidence.json](../../.logs/research/cursor-ui-audit/theme-color-evidence.json)。

八位十六进制最后两位是 alpha，而不是一种独立的不透明灰色；例如 `13/255 ≈ 7.45%`、`BD/255 ≈ 74.12%`。最终显示依赖底色，不能把该值直接与截图取色逐字比较。语义键和颜色格式可对照 [VS Code Theme Color](https://code.visualstudio.com/api/references/theme-color)。

两个主题都没有在当前 JSON 中显式定义 `quickInput.background`；Dark 也没有显式定义 `descriptionForeground`。快照中的 `null` 表示“该文件未定义”，并不表示运行时透明、黑色或无默认值。

## 本机 CSS：尺寸、变体和 token 关系

这是有限的静态规则清单，不是已测量的运行中界面。offset 是从整个 UTF-8 文本解码后的字符串起点计数的字符位置，复核时应先匹配整文件 hash。

| 对象 / selector | 已读到的声明 | 本地证据 |
| --- | --- | --- |
| `.composer-tool-call-simple-layout-header` | `height:28px`、`gap:8px`、底边 1px；水平内距有 8px / 6px fallback | desktop 第 3 行，offset 472390；glass 第 3 行，offset 499752 |
| `.composer-tool-call-simple-layout-header-icon` | 宽高 16px | `local-css-evidence.json` → desktop / toolcall |
| `.composer-tool-call-block-card` | flex column；字体引用 `--conversation-tool-font-size`；行高引用 conversation / cursor token，末级 fallback 22px | desktop 第 3 行，offset 471387 |
| `.composer-tool-call-block-card[data-chrome=card]` | 有背景、1px 边框及 `--conversation-surface-border-radius` 圆角 | desktop 第 3 行，offset 471695 |
| card 的 `data-density=flat` | 用 card padding 与 gap token；未指定 density 的 card 同属该分支 | desktop 第 3 行，offset 471944 |
| card 的 `data-density=standard` | `gap:0;padding:0`，由内部 header/body 分配空间 | `local-css-evidence.json` → desktop / toolcall |
| `.composer-bar,.composer-messages-container` | `--conversation-tool-card-padding-x:10px`，`-y:8px`；`--conversation-tool-font-size:var(--cursor-font-size-lg)`；surface radius 引用 `--cursor-radius-xl` | desktop 第 3 行，offset 612873；glass 第 3 行，offset 640165 |
| `body[data-cursor-glass-mode=true]` | `--cursor-font-size-lg:15px` | glass 第 3 行，offset 1269826 |
| `.monaco-sash.vertical` / `.horizontal` | 命中宽/高由 `--vscode-sash-size` 决定；hover 伪元素另用 `--vscode-sash-hover-size` | desktop 第 3 行，offset 21018 / 21105 / 22621 / 22735 |
| `.composer-input-edit-banner` | 字号 12px、内距 6px 12px、上角 6px；是“编辑已有输入”的 banner | desktop 第 3 行，offset 533435 |

因此：15px 是 **glass 模式特定 selector 中一个 token 的明确赋值**；22px 是 tool-call 行高引用的末级 fallback。不能把它们改写成“Cursor 所有消息永远是 15/22px”。同理，12px / 6px 的编辑 banner 也不能冒充主 Composer 的字号和圆角。主 Composer 的完整默认尺寸与实际编辑器类型，本次证据仍不完整。

另一个容易误读的事实是：`--cursor-bg-primary` 在 **非 glass** 模式的规则中是“前景色与透明混合”的填充层，不是画布底色。具体条件为 `body:not([data-cursor-glass-mode=true]) .monaco-workbench`，desktop 第 3 行 offset 1313005：

| 变量 | 静态声明 |
| --- | --- |
| `--cursor-text-primary` | `var(--vscode-editor-foreground)` |
| `--cursor-text-secondary` | 前景色 74% 与透明混合 |
| `--cursor-text-tertiary` | 前景色 60% 与透明混合 |
| `--cursor-bg-primary` | 前景色 20% 与透明混合 |
| `--cursor-bg-secondary` | 前景色 14% 与透明混合 |
| `--cursor-bg-tertiary` | 前景色 8% 与透明混合 |

同一 CSS 还有高对比模式覆盖和其他局部覆盖。glass bundle 中某些生成类具有独立的颜色赋值；未确认这些类的实际使用场景，故没有把它们列作 Agents Window 的默认全局色板。此处依据见 [targeted-css-evidence.json](../../.logs/research/cursor-ui-audit/targeted-css-evidence.json)。

## VS Code 开源基座：可验证尺寸与真实组件组合

| 可复核项目 | 固定版本事实 | 适用范围 |
| --- | --- | --- |
| Sidebar 约束 | 最小宽度 170px；preferredWidth 在活动 view 能给出 optimalWidth 时为 `max(optimalWidth,300)` | 上游 SidebarPart；不是 Cursor Sidebar 实测默认宽度。[源码 44–65 行](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/workbench/browser/parts/sidebar/sidebarPart.ts#L44) |
| 自定义标题栏 | `DEFAULT_CUSTOM_TITLEBAR_HEIGHT=35`；BrowserTitlebarPart 在 command center / WCO 等条件下使用该常量，否则分支为 30，并考虑 zoom | 上游平台和标题栏分支；不适用于直接猜所有桌面标题栏。[常量第 303 行](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/platform/window/common/window.ts#L303)、[使用第 233 行](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/workbench/browser/parts/titlebar/titlebarPart.ts#L233) |
| Editor tabs | normal 35px、compact 22px；styleOverride 分支 32px / 28px，后者包含容器内距 | 有模式分支；源码注释存在旧 14px 描述，表中按常量和执行分支，而非按过时注释取值。[102–110 行](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/workbench/browser/parts/editor/editorTabsControl.ts#L102)、[556–565 行](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/workbench/browser/parts/editor/editorTabsControl.ts#L556) |
| Quick input | MAX_WIDTH 600px；常见居中布局使用 `min(containerWidth*0.62,600)`，存在 anchor 等其他分支 | 上游命令/快速输入控制器，不能说所有菜单固定 600px。[第 53 行](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/platform/quickinput/browser/quickInputController.ts#L53)、[第 898 行](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/platform/quickinput/browser/quickInputController.ts#L898) |
| Sash 命中默认值 | `globalSize=4`，暴露 setGlobalSashSize；实例又可从 options.size 覆盖 | 可命中拖拽柄的默认值，不等于分隔线视觉厚度。[第 147 行](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/base/browser/ui/sash/sash.ts#L147)、[448–459 行](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/src/vs/base/browser/ui/sash/sash.ts#L448) |

这些组件的可见源码是 TypeScript 类、DOM 创建、工作台 service 与 action/menu 基础设施：例如 `ToolBar → ActionBar + DropdownMenuActionViewItem`，`QuickInputController → QuickInputBox + QuickInputList + ToolBar`，`DiffEditorWidget → original/modified CodeEditorWidget + accessibleDiffViewer + sash`。这是一条可验证的基座来源链；把它写成“Cursor 是 shadcn 换皮”没有证据。

## 对个人组件库的设计推断

以下是本项目的选型与组织建议，等级 D，不是 Cursor 官方组件 API。

1. **先选参考界面。** 为 IDE 工作区和 Agent 工作区分别定义 layout pattern，底层基础控件可以共享。文件 tabs、状态栏、命令中心不应该自动出现在每个会话页。
2. **语义层次应比色名更明确。** 分开 canvas / sidebar / input / popover / selected fill；中性色透明覆盖与不透明 surface 是不同角色。不要直接把 Cursor 的 `bg-primary` 复制成自己的 canvas token。
3. **控件密度与阅读排版分开。** 保存导航、工具调用、正文和 Composer 的独立字号/行高角色；安装 CSS 已证明同一产品有条件化字号和布局变体。
4. **ToolCall 至少需要 inline 与 container 两类。** 小步骤可折叠为一行；终端输出、文件内容或需要操作的结果拥有 header/body 容器。预览卡片要服务内容与行为，不能为了“克制”抹掉全部边界。
5. **Split pane 是行为组件。** 后续组件库若宣称完整桌面工作台，应覆盖最小宽度、拖拽、折叠、尺寸恢复和键盘访问，而不只是一个 CSS grid 两栏截图。
6. **确认原语、变体、组合三个层次。** Storybook 分别展示基础控件、ToolCall 的 chrome/density 状态、以及 IDE/Agent 的真实任务组合；不能从几个 Button / Card stories 推出产品相似度已达标。

复用方案仍可以由本项目的 React、TypeScript、Radix 和自有 tokens 实现。这是本项目的实现决定；参考 Cursor 的视觉结构不要求复制其内部框架或产品资源。

## 来源与复核记录

| 证据文件 | SHA-256 |
| --- | --- |
| Cursor 3.19.7 `workbench.desktop.main.css` | `0c46357d08c0d71bf314d943055f997f4f2eb0a5b641cfc67a4fd253b21b3de7` |
| Cursor 3.19.7 `workbench.glass.main.css` | `e394ef3125e9be9de96a23b4c3e32cf0eb469a5ebad0d541ec91c9c7d0060833` |
| Cursor Dark JSON | `117a4d53e7869b7a780468ff54db2b4ba769c4a34303377ac31f8b99d8f84727` |
| Cursor Light JSON | `00c81e6926f6651e36a5cc877a6481d43c972b643bdc1d08fdc05e6b23badd9b` |

可重跑的审计辅助脚本在 `.logs/research/cursor-ui-audit/`：`inspect-local.mjs` 只读安装 JSON / CSS 并输出元数据和有限选择器样本；`extract-targeted-css.mjs` 提取本报告相关规则；`fetch-upstream.mjs` 缓存固定官方 revision 的明确文件。它们不导入产品 JS，也不调用 Cursor。样本匹配数仅用于检索，不表示组件数量或实际运行覆盖率。

本次共成功获取 14 个固定 revision 的 VS Code 文件（含许可证），没有因一个旧 CSS 路径 404 而推断其实现不存在；实际 import 指向 `multieditortabscontrol.css`，已按该路径核验。

VS Code 上游文件保留 [MIT License](https://github.com/microsoft/vscode/blob/fc3def6774c76082adf699d366f31a557ce5573f/LICENSE.txt)。Cursor 安装元数据虽然有 `licenseName: MIT`，其 `licenseUrl` 当前转向 [Cursor Terms of Service](https://cursor.com/terms-of-service)；本报告没有据一个字段给 Cursor 自有 UI 资源作开源授权判断。研究缓存用于本地证据，未将 Cursor 字体、图标、整份 CSS 或主题包加入本组件库的发布资产。

本报告没有进行 Cursor 的实时 DOM / computed style 测量，所以不包含“当前用户主题”“运行窗口全部默认尺寸”“完整自有组件树”或“浏览器像素级复现成功”的结论。后续若要逐屏确认，需先明确 IDE 还是 Agents Window、版本、主题和窗口状态，再单独记录观察结果。
