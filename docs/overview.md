# 全组件总览

入口：本地 `http://127.0.0.1:5173/?view=overview`。首页主导航与 Lab 标题栏也提供入口；生产路径使用 Vite BASE_URL，可在 GitHub Pages 子目录部署。

本轮工作区 catalog 为基础 72、复杂 43、AI 24，共 139 个组件族。总览直接复用相同目录和已有 Demo，Storybook 深链来自生成 manifest。数量包含工作区中既有的 Kanban 草稿，不表示这部分已发布到 npm；本轮没有修改其实现。

## 使用

- 顶部风格速览同时展示操作层级、尺寸、禁用状态、语义色块和紧凑确认面板；“打开真实弹窗”展示同一组公共 Dialog / Button 组合。
- 左侧搜索名称、描述或中文功能词，按基础 / 复杂 / AI 筛选，目录锚点可跳到组件。
- 每个组件展示可操作预览、详情链接、放大、重置和 Storybook Playground 入口。放大会占据整行，并增加可用高度。
- 主题和密度设置在 html，总览直接渲染的组件继承根主题，portal 也继承相同设置。独立 preview URL 仍用于单组件调试。密度开关只用于 Lab 检查工具。
- 总览直接渲染全部组件；滚动、切换主题/密度保留本地状态，筛选移除和重置会初始化状态。长演示在预览内滚动，默认高度不是组件的生产尺寸限制。

## 实现边界

当前总览直接复用同一 React 文档中的公共 Demo，各组件保留自身的 ID、provider 和本地状态。浮层通过触发器打开到总览文档，不创建139个独立 iframe。preview URL 保留为独立调试入口，历史 iframe 实现记录见下文。

每个目录族都有预览，不代表所有 props 的排列组合都会同时展开。浮层需操作触发器，loading / error / empty 等预设继续在 Storybook 检查。AI、上传、任务和通知均是本地演示；通知示例不调用浏览器 Notification 权限 API。

## 视觉参考与差异

参考为 2026-10-09 实际查看的 Cursor Web 深色按钮和搜索弹窗，以及用户的通知确认截图，来源与证据边界见 references.md。Reito 的紧凑确认采用 13px 标题、24px XS 按钮、6px 控件圆角和8px容器圆角，普通区域使用沉静灰阶和软边界。继续使用 Inter、中文内容和自己的语义强调色；确认宽度由 container-lg（512px）定义，并未复制参考的 520px 字面值。

总览的多列组件预览与 Cursor 的任务工作区结构不同，目的为横向比较组件。保持 16px 阅读文字，普通控件统一为 13px；舒适密度仍扩大控件高度与内容内距。

## 验证

2026-10-09 实际结果：

- `npm run check` 通过：token 同步、catalog、102 组对比度、340 个源文件 token 审计（0 未批准项）和全部 workspace 类型检查。
- `npm run build` 通过：tokens、UI、Lab、Storybook、Workbench 全部成功。仍有大型 chunk 提示；总览的可见区域加载减少同时挂载的演示，不宣称已经解决整个目录 bundle 的体积。
- 第一轮 `overview / overview-catalog / token-contract / scroll-focus / tabs-table-focus` 35 项中 34 通过。一项首次打开 Storybook 时尚未得到主题属性，后续相同测试在四种主题密度下均通过。更早一轮开发期间 Input 页面未及时载入的失败也已在两种密度下复测通过。
- 最后一轮 `overview / token-contract / tabs-table-focus / home / markdown-content` 的定向回归 13 项全部通过，包括四种组合的 WCAG 2/2.1 A/AA axe 扫描、搜索、嵌入操作/重置、主题继承、Escape / 焦点恢复、首页交互、Markdown 字号和共享 token 实时更新。
- 全部 139 个预览已由三个逐层测试载入，未出现 pageerror 或预览边界错误；并非对 139 个组件所有状态的完整交互验收。
- 1280×800、960×720、480×360 和390×844 的总览无页面/主滚动区水平溢出。480×360 检查较窄的内容重排，不称为实际浏览器 200% 缩放验收。
- CI 配置已加入 8 项总览检查；`playwright.ci.config.ts --list` 显示 178 项、18 个文件。未推送或声称远端 CI 已执行。

截图位于 `.logs/overview-{theme}-{density}-desktop.png`、`.logs/overview-dialog-{theme}-{density}.png` 和对应窄视口截图。本轮实际查看深色紧凑的完整首屏和确认面板，并在用户 Chrome 检查 AI Composer 组合。确认面板实测最大宽512px、8px圆角、13px标题、12px footer 内距；区别于参考的原通知截图估算值和搜索弹窗量度。

自动检查不证明完整视觉相似，也不替代真实中文输入法、浏览器200%缩放或所有组件状态的手工验收。

## 紧凑面板内距反馈（2026-10-10）

根据用户标注的总览确认面板，标题区从固定通用 `p-4`（16px）改为可复用的 density 语义角色：`compact-surface-padding-x/y`。紧凑为左右12px、上下8px，舒适为左右16px、上下12px。DialogHeader 在 compact DialogContent 内自动消费这组 token；独立面板显式指定 Header compact。Footer 的 compact 变体消费相同角色，Lab 与 Storybook 均移除局部 Header 内距。

TokenReference 已展示两个角色的密度值。其他组件可直接使用对应 CSS 变量，避免在已有 padding 内叠加。定义和复用示例见 design-language.md。

实际检查用户标注的同一页面，深色紧凑模式下 Header 和 Footer 的 computed padding 均为 `8px 12px`；1303×1244 视口中确认面板高度为106px。保持此前 Cursor 参考的字体、边界和操作结构，调整范围为内容内距。截图使用 `.logs/overview-dialog-dark-compact.png` 等四种主题密度下的真实弹窗截图。

本轮 `npm run check`、`npm run build` 和 `git diff --check` 通过；总览5项通过，包含四种主题密度的 Header/Footer 一致性、运行时覆盖 token 同时更新静态面板与 portal、键盘和 axe 检查。默认设置组合首次打开 Storybook 时停留在加载界面超时，其余4项通过；独立复测5项全部通过。未将这一首次加载时序失败归因于组件内距。

## 面板留白与文字节奏反馈（2026-10-10，第二轮）

用户继续标注确认面板和 ScrollTop 的文档滚动面板，指出不等轴内距和文字间隔不协调。现在两处使用相同规则：紧凑四边12px、舒适四边16px；相关文字间隔消费新角色 `compact-surface-gap`（4 / 8px）；标题与正文使用相同的20px界面行高。Header 自动使用该间隔，紧凑 DialogTitle 覆盖原有 `leading-none`。ScrollTopDemo 的段落移除 `py-2`，改用相同的文字间隔，文档示例的标题字重也与确认标题对齐。

这段记录更新上一轮8px纵向内距的当前默认值，上一节保留当时的测量结果。Tokens 面板包含三项紧凑面板角色。一般长文、表单的间距角色继续按其阅读用途选择。

实际在用户标注的1303×1244、深色紧凑页面比较：确认 Header 和滚动文档区的 computed padding 均为12px，标题行高均为20px，相关文字间隔均为4px。总览截图为 `.logs/surface-rhythm-{theme}-{density}-page.png`，另有 confirmation / scroll 两处的独立截图。实际查看深色紧凑截图，确认边缘和首段节奏一致；滚动示例展示的是重复短说明，间距不作为所有文章段落的默认值。

本轮 `npm run check`、`npm run build`、`git diff --check` 通过。`playwright test tests/overview.spec.ts tests/scroll-top.spec.ts --workers=1` 共14项全部通过，包括四种主题密度下的共享内距/间距、运行时 token 更新、portal 标题行高、iframe 文档区几何间隔、axe、窄布局以及 ScrollTop 键盘返回、焦点恢复、短内容、禁用、独立目标和 Controls 操作。

## 横向留白、菜单左内距与圆角反馈（2026-10-10，第三轮）

第二轮将内距设为四边等值是对用户视觉意图的误判，最新反馈明确横向应大于纵向。当前面板角色恢复为 compact 12 / 8 px、comfortable 16 / 12 px（横 / 纵），确认 Header / Footer 和 ScrollTop 文档区自动跟随。Alert、Card 的内容边缘及 Popover / HoverCard 也消费此对角色。此前两节保留历史验证记录，当前值以上述规则和 tokens.json 为准。

用户新提供的本地右键菜单截图显示文字靠近左侧，是本库现状证据；不是 Cursor 的 DOM 量度。ContextMenu、DropdownMenu、Menubar 统一使用新增 menu-item-padding-x/y，compact 12 / 4 px、comfortable 16 / 6 px。保留菜单外壳 4px 留白和选择指示区域。普通文字距左侧外壳为16 / 20 px。

Button 已是6px圆角，但 Toggle 的默认 / sm、ButtonGroup 外端及 InputGroupButton 的 XS 仍用了不同半径。现统一 radius-sm，禁用和加载不改变半径。组合内部接缝仍为0，图片预览和圆形专用动作保留用途不同的轮廓。

ScrollArea 的文件示例曾将顶部内距放在滚动内容里，滚动后会消失。新增 variant="inset"，将横纵内距移至 Root / Viewport 之间；列表行不叠加横向内距。默认 variant="default" 保持无内距布局，用于嵌入已有面板。Storybook Playground 可直接调 inset、方向和数量。

实际在 Chrome 深色紧凑总览打开右键菜单，computed 条目内距12 / 4px、圆角6px，截图比原附图左侧空间更大。固定滚动边缘实测上下一致、左右一致；边框在浏览器缩放下有小数CSS像素。保持此前已检查的 Cursor Web 中性灰阶、6px操作圆角、轻边界和13px文字，未将新内距称为官方产品规格。Alert仍以独立语义提示展示；总览仍是网格组件检查工具。

本轮生产构建通过。check 首次与 UI 构建重叠，Storybook 类型检查碰到 dist 声明被重建时暂时缺失；构建结束后独立完整 check 通过，不将此时序错误称为组件类型问题。25项交互检查通过（overview、scroll-focus、surface-consistency、token-contract），覆盖四种主题密度、运行时 token 更新、菜单 Escape、按钮组接缝、ScrollArea End / Home 和滚动前后几何不变。CI 列表已包含新4项，合计182项、19文件；未声称远端执行。

截图：.logs/feedback-alert-{theme}-{density}.png、feedback-card、feedback-menu、feedback-scroll-bottom；实际查看深色紧凑三处截图。自动测试不替代全部组件所有状态、真实IME或200%浏览器缩放验收。

## 总览加载修正（2026-10-10）

用户指出每个模块都要等待。源码原因是独立 iframe 经 main.tsx 启动；该入口静态导入 Home，预览又通过 catalog.ts 静态导入基础、复杂、AI 全部 Demo。IntersectionObserver 原来只在附近384px启动，滚远后卸载，回到组件时重新建立文档和模块运行环境。onLoad 只说明 HTML 文档已加载，不能说明 React Demo 已就绪。

当前总览只读取生成 manifest 元数据，不执行全目录 Demo；Home 改为按路由加载；OverviewPreview 根据层级动态导入一个目录。基础预览网络检查未请求 Home、复杂 / AI catalog 或 Tiptap。生产构建的三个 catalog 块分别约339KB（基础）、2352KB（复杂）、225KB（AI），这是目录块尺寸，不是页面完整下载量；共享依赖和样式另计，复杂编辑器所在层仍有大块警告。

附近加载范围使用 container-4xl 指标896px，预览首次进入范围后保持挂载，滚出视口不再卸载。主题 / 密度通过同源且验证 source / id 的消息更新 iframe html，保留状态。收到 Demo 就绪消息后才移除外部 loading 提示。显式重置重新载入一次；筛选移除的模块仍卸载。预览逐步保留会增加驻留内存；未测量浏览全部139项后的内存峰值，不声称已解决所有大目录性能开销。

实际10项检查全部通过：三层逐一渲染139个预览，等待内部 Suspense 结束；基础预览请求隔离；按钮操作后滚到 Alert 再返回仍保留次数；主题 / 密度切换保留同一预览文档，导航请求仍为1次；重置后为2次并继承当前外观。原5项总览键盘、portal、四种主题密度、无障碍和窄布局检查继续通过。全目录巡检中复杂层输出一条 React 尚未挂载时 state update 的开发警告；没有 pageerror 或预览边界失败，不将此巡检称为零 console warning。

npm run check、npm run build、git diff --check 通过。CI 列表184项、20文件；未声明远端执行。本机浏览器实际操作 Button，滚动到 Alert 后仍读取到“已保存 1 次”。截图 .logs/overview-loading-fixed.png。布局、主题、字体和 Cursor 参考规则保持此前版本，改变的是加载与状态生命周期，不以截图证明速度。首次某层仍有初始化成本，没有做同一环境的旧版 / 新版冷缓存延迟对照，故不报告速度倍数。

## 直接渲染、默认按钮和 Card 区域修复（2026-10-10）

用户明确要求直接展示组件，当前总览移除 iframe、逐模块观察器、载入遮罩、跨文档尺寸通信，直接渲染139个共享 Demo。主题和密度由一个根 html 继承；独立 preview 路由仅作为调试入口保留。初次页面需要一次载入总览及所有 Demo，滚动时不会再启动组件页面。各预览建立相对定位边界，约束 sr-only 的绝对定位范围，避免内容撑开文档并让标题栏跟随外部页面滚动。此前加载策略章节是历史记录，不是现行实现。

Card 的问题由上一轮替换引入：替换 p-(--card-spacing) 时误匹配到 gap-(--card-spacing)，生成了无效 gapx 类名；Popover 也有相同前缀误改。当前恢复为明确的共享间距变量，Card 的 Header / Content / Footer 距离分别在实际几何中验证，避免仅检查 padding 而漏掉相邻区域间隔。

默认 Button / icon 高度由独立 button-height token 定义，compact24 / comfortable32px，横向8px；sm28 /36、md32 /40、lg36 /44可显式指定；XS保持兼容。字体13px、圆角6px。原默认较大尺寸可迁移为 md / icon-md，输入框高度不变。Storybook 增加两个 MD 故事，Controls 可选择所有尺寸。

14项相关检查通过（四种主题密度下的 Card 区域实际间隔、运行时 gap token 变化、默认按钮高度与显式尺寸、主题 / 密度切换、零 iframe 和139个直接预览、滚动返回状态、重置、原有无障碍 / 窄布局 / token override）。初次检查失败包含新增 loading 按钮定位未考虑 Spinner 的可访问名称、直渲染后全局同名链接和已有隐藏 keepMounted portal 的测试定位问题；修正为区域定位和可见浮层检查。默认 Button 改用 font-interface 后，运行时字体覆盖也通过。

截图：.logs/card-spacing-fixed-{theme}-{density}.png、.logs/overview-direct-components.png。实际在本机总览查看用户标注的深色紧凑 Card，间距8px、左右12px、footer上下8px；普通按钮24px。仍使用此前已检查的 Cursor Web 控件参考，内距是本库原创规则。尚未发布这些源码变更。

补充回归：overview-loading、PopoverList、SplitButton 合计27项中19项首次通过，8项在 Storybook6007尚未启动时连接失败；启动服务并确认HTTP200后，8项独立复测全部通过。无组件代码修改。与核心14项中的2项加载测试去重后，共39项相关检查最终通过。CLI检查包含 token 同步、catalog、语义色、审计和四工程类型检查；最终生产构建通过，保留已有大块告警。
