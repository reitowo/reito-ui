# 默认弹窗动作区留白（2026-10-10）

参考用户对 theme-guide 局部浅色 DialogFooter 的标注：操作区 padding 略大。实测用户浏览器四边均16px，区域高约60.67px。默认 DialogFooter、AlertDialogFooter 改用共享 action-footer-padding-y，引用对应密度的 card-padding-y：compact 12px、comfortable 16px；水平仍16px。compact 变体继续其专用紧凑面板内距。默认按钮保持前轮28px / 14px，紧凑密度的操作区因此减少8px。

没有添加主题页特定覆盖。实际比较同一 Stone + Rose 局部浅色弹窗：左右仍对齐标题区，分隔线下的上下空白缩小；圆角、背景和按钮关系保持，截图 .logs/dialog-footer-after.png。参考是用户提供的本库标注截图，不称为其他产品的官方尺寸。

验证：npm run tokens:build、npm run build、npm run check、git diff --check通过。5项弹层/主题/键盘/焦点恢复回归通过（.logs/dialog-footer-tests.log）。两个默认footer在深浅主题、两种密度的8组实际留白均符合16px横向、12 / 16px纵向（.logs/dialog-footer-matrix.json）。未执行完整CI集合，未提交或发布。
