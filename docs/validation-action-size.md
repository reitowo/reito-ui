# 按钮与菜单尺寸调整（2026-10-10）

参考：用户提供本库 theme-guide 的局部浅色主题裁图（codex-clipboard-22c2dec3-92b1-4408-9f00-7b19d5c9638d.png），指出按钮及选单偏小。图片仅用于比较现状，不作为上游尺寸规范。实际在用户浏览器测得修改前默认按钮 24px 高、13px 字、左右 8px；选择器触发器 32px 高、13px 字。

共享 token：button-height 改用各密度的 control-height-sm（28 / 36px）；新增 button-padding-x（10 / 14px）；action-font-size 引用 text-md（14px）。Button、Toggle、Tabs、Menubar 触发器和 SelectTrigger 消费动作文字尺度。默认文字和图标按钮用 14px 图标；显式 XS 保持独立尺寸与小文字。菜单上下内距由6 / 8px改为8 / 10px，单行选项从32 / 36px变为36 / 40px。菜单文字继续14px，选择器触发器由13px变为14px。输入框的字段高度和正文尺度维持各自角色。

实际比较 dark / compact 的 Zinc + Violet 页面和 Stone + Rose 局部浅色面板：按钮变为28px高、14px字、左右10px；底色色系菜单行高36px，文字14px，上下内距8px。保留用户截图的标题、说明、动作层次与边界；新增尺寸由本库 token 定义。截图 .logs/action-size-preview.png、action-size-local-panel.png、action-size-menu.png。与原裁图相比，动作和选择器文字更大、动作上下空间更多，卡片横纵内距继续原共享规则。

验证：npm run build、npm run check、git diff --check通过；token审计0 unapproved。14个相关用例覆盖四种主题/密度的 Card 与按钮默认值、139组件族的尺寸和溢出扫描、菜单内距和键盘关闭，以及主题示例的窄屏/独立颜色/禁用状态。初轮13通过，dark/compact目录扫描因开发服务器首次加载超过默认5秒就绪等待超时，尚未进入尺寸断言；保持代码和断言不变，单独复跑该场景通过。日志 .logs/action-size-tests.log、action-size-recheck.log、action-size-build.log、action-size-check.log。未执行完整214项CI集合，未提交或发布。
