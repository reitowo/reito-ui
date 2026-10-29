# 顶栏统一主题菜单（2026-10-10）

用户认可既有配色与留白后，要求右上角改为类似 Nuxt 的主题选择按钮。实际观察官方 ui.nuxt.com 的主题菜单和 Primary 子菜单，参考记录见 references.md。

首页、组件详情、全组件总览、主题说明页复用同一个 ThemeControls 布局入口。顶部合并为“主题”；主色与底色色系用带色点及当前值的子菜单，选中项使用现有 MenuRadioItem 的勾选。浅色 / 深色 / 跟随系统在同一菜单内使用带名称的图标单选项；恢复默认主题返回灰白 / Graphite / 深色。即时应用和存储沿用已有受控主题接口；说明页左侧教学控制与顶栏同步。

所有菜单沿用现有 DropdownMenu 键盘、层级关闭、焦点恢复、触屏点击和碰撞定位。图标模式项仍是 menuitemradio，不在菜单中嵌入另一套 Tab 键盘模型。分隔、文字、内距、按钮和菜单尺寸使用共享组件与 token。色点消费 tokens:build 生成的 paletteVariables；完整命名色阶同时输出为全局 --rui-palette-* CSS 变量，移除每次主题更新时重复写入整套色阶的工作。不使用动态不完整变量名的审计豁免。

视觉：深色 Zinc / Violet 的顶部单入口、两行当前颜色、下方三个明暗图标与恢复动作；保持此前用户要求的小操作区和较大控件。与 Nuxt 参考相比使用本库的中文标签、14px菜单文字及36 / 40px选项行高，仅展示已有的颜色和明暗能力。截图 .logs/theme-menu-main.png、theme-menu-primary.png。

验证：完整构建和 check 通过；8项回归覆盖主页深浅/宽窄布局与可访问性、总览直接渲染/状态保留、系统模式和跨页偏好、即时换色、390px子菜单边界、键盘进入/分层Escape、复原状态。默认复原为深色后该专项再次通过。日志 .logs/theme-menu-final-tests.log、theme-menu-reset-tests.log、theme-menu-delivery-build.log、theme-menu-final-check.log。打开主色子菜单后的WCAG标签扫描0 violations（.logs/theme-menu-a11y.json）。初轮主页在reload后尚未渲染时启动Axe，以及子菜单名称被Base UI关联触发器重写导致用例失败，修正就绪等待和定位后复查通过；动态色阶变量在构建器生成完整映射后token审计通过。CI发现215项 / 27文件，本轮未执行完整集合；未提交或发布。
