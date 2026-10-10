# 全库中性焦点规则

日期：2026-10-10。用户在取消树组件左侧高亮后明确要求其他组件同理。

## 实现

- themes.dark/light.focus引用对应text-muted，蓝色accent / action-accent、错误danger、状态颜色保持独立。
- foundation.focus-width引用border-width，默认1px；键盘专用ring / outline消费focus-width，错误 / 拖放outline-width保留2px。
- Conversation、WorkspacePane、ScrollArea、TabsContent、Table的rui-scroll-focus改为中性outline+负offset。移除旧rui-scroll-focus-border及透明左边占位；不增加新的Tab停靠点。
- 树行仍限定直接子代；组织图移除祖先group-focus选择器，改为当前li的直接organization-chart-node。
- 普通控件、复合输入、编辑器、菜单、Sidebar等共享中性focus和细轮廓。标签、原生焦点、focus-visible、IME和回调结构没有改变。
- ContentNavigation当前章节取消左侧边条，改轻灰背景；结构性的目录连接线、引用边界、拖放位置、错误提示保留用途。

## 检查

已完成59项回归：ContentNavigation15、OrganizationChart16、scroll-focus13、Tabs/Table11、树行4。四种主题密度都通过；表格滚动前后截图的左右边缘均有连续中性outline，并非旧的左侧单边标记。鼠标进入后无焦点框，键盘焦点明确，子控件不会带亮父面板，强制颜色模式使用系统Highlight。窄布局、axe、选择、折叠、焦点恢复和原生滚动语义保留。

普通控件另外4项覆盖Input/Button/Select及InputGroup，检查focus与text-muted的解析值一致、focus-width为1px。首次直接读取动画中boxShadow，得到0.89 / 0.97px过渡值，改为等待稳定的computed style，未改变动效实现。结果见末尾更新。

实际在用户总览中通过Tab / Shift+Tab聚焦ScrollArea，得到灰色outline、无boxShadow，没有左侧色条。正常100%测试值为1px；用户浏览器缩放使computed stroke量化为0.666667px，不把它误报成另一套token。复用此前已检查的Cursor工作面灰阶参考，不使用产品资产；本轮是本库中性焦点偏好更新。

截图来自.logs/neutral-focus-regression中的keyboard-focus.png等；保留深色紧凑代表截图。自动测试不证明所有状态的完整视觉验收，亦不替代真实OS输入法或实际200%缩放。

CI列表已登记200项、24文件，仅代表配置，未声称远端执行。没有提交、推送或发布npm。

当前普通控件4项（含InputGroup）复测全部通过，加59项回归合计63项。npm run check及git diff --check通过；npm run build也退出0，保留已有大chunk告警。Source中原左側focus helper和祖先组织图group-focus已不存在；仅保留有明确结构或业务含义的边界。
