# 动态条件表单配方

[同页参数调试](http://127.0.0.1:6006/?path=/story/复杂-form-表单管理--dynamic-playground)；[配方源码](../../packages/ui/src/complex/dynamic-form-demo.tsx)。这是基于公开 FormField、AsyncForm 和基础输入的可复用示例，不是 JSON FormBuilder 或 schema 自动生成引擎。

字段定义包含稳定 name、label、kind 和可选 visible(values) 函数。渲染器把 text、mode、switch 映射到共享 Input、NativeSelect、Switch；新增类型时显式处理值和 ref 的适配，不执行配置中的任意字符串脚本。

工作区类型选择“团队”时显示团队名称；启用通知时显示邮箱。校验器使用相同条件，只校验当前可见字段，返回的 Payload 也只包含生效配置。隐藏字段不会因为旧错误阻止提交。

| hiddenValuePolicy | 隐藏时 | 重新显示 | 提交 |
| --- | --- | --- | --- |
| retain（默认） | 保留 RHF 草稿，清除该字段错误 | 恢复原输入并按条件重新校验 | 排除隐藏字段 |
| discard | resetField 回到空默认值，清除状态 | 空值重新输入 | 排除隐藏字段 |

保留策略不代表隐藏值可以绕过校验写入 Payload，也不代表原错误永远忽略。字段重新显示后再次参与校验。discard 的默认值由配方定义为空字符串；消费工程使用其他字段类型时应提供对应类型默认值。

`initialMode`、`initialNotifications` 在 Controls 改变时重置整份默认数据和提交结果。页面里的条件切换只改变当前草稿，不改变默认基线；“重置配置”恢复初始条件和全部默认值。提交失败保留当前草稿，后续可重试。隐藏期间没有输入节点，但 RHF 注册状态默认保留；字段是否写入提交结果由校验器的显式投影决定。

所有保存都是本地演示。实际宿主使用 AsyncForm 的 signal 和 isCurrent 管理异步结果；副作用、权限与持久化仍由宿主负责。高级动态数组可继续组合 useFieldArray，但不能对重排项使用按下标的 React key 或通用隐藏清理来替代数组操作。

验收状态见 [FORM-04 账本](../component-completion.md)。
