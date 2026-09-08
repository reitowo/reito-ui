# Scheduler 工作面范围（APP-SCHEDULER-01）

面向个人工作台的日/周/月排程，采用 FullCalendar Standard 7.1.0（MIT）日网格、时间网格和交互模块，不使用 Premium 资源时间线。首次实现必须同时覆盖三种视图、事件选择与编辑、拖动和调整时长、键盘等价编辑、只读、加载、空、宿主保存失败恢复。

## 数据协议

宿主提供稳定 id、标题、start/end 和 allDay。结束为排他边界；全天使用 YYYY-MM-DD 日期，跨日覆盖 start 到 end 前一天。定时事件必须带 Z 或数值时区偏移，结束严格晚于开始。重复 id、无效日期、混用全天/定时格式需要显式反馈。重叠事件允许存在并由时间网格并排呈现，不隐式合并或拒绝。

组件提供本地/UTC 显示时区。宿主负责网络、持久化、周期事件展开及其他 IANA 时区转换。移动/调整/编辑统一发送候选事件及旧事件给 onEventChange；保存期间阻止重复操作，失败恢复原值并保留重试入口，不能把控件预览误报为已经保存。

## 视觉和验收

共享 Graphite tokens 控制表面、边界、字重、间距与焦点。使用本库工具栏与日期/时间输入，避免独立主题造成两套控件视觉。Storybook 同页可调视图、日期、只读与失败场景，覆盖全天、跨日、重叠、中文长标题和窄屏。

证据包括日/周/月切换、选择/编辑、拖动/调整与键盘等价、宿主失败回退/重试、数据边界、主题密度、可访问性及 check/build。实际通过前不标完成。

参考：https://fullcalendar.io/docs/eventDrop 、https://fullcalendar.io/docs/eventResize 、https://fullcalendar.io/license 。
