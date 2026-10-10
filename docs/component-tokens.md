# 共享规则与组件 token

`packages/tokens/src/tokens.json` 是唯一默认值来源。基础尺度经 `foundation`、`themes`、`density` 提供共享角色；新增 `components` 为具体组件提供默认别名。CSS 生成及 Provider 的颜色预设绑定保留 `var()` 引用，因此修改基础角色和选定色阶不再要求重新编译 CSS。数值 API 的 `tokenMetrics` 和容器查询断点仍是构建期值。

## 当前支持

| 组件组 | 组件 token |
| --- | --- |
| Button | height、padding-x、font-size、radius；height 适用于默认文字和图标按钮，显式 size 继续使用对应尺寸尺度 |
| Input | height、padding-x、font-size、radius；使用 Input 组合的密码等字段自动继承 |
| Menu | item-height、item-line-height、item-padding-x、item-padding-y、font-size；DropdownMenu、ContextMenu、Menubar、Select、Combobox 的展开条目共享此组 |
| Card | padding-x、padding-y、text-gap、radius；标题、内容、脚注使用同组内距 |
| ScrollArea | padding-x、padding-y；仅 inset 变体的固定滚动边缘，默认引用 compact-surface-padding-x 和 space-1 |

其他组件继续消费共享语义角色。这次没有为每个 CSS 声明制造一个独立 token，也没有改变所有组件的默认尺寸。

## 使用方式

```tsx
import { ReitoThemeProvider, Button } from '@reito/ui/basic';
import type { ThemeTokenOverrides } from '@reito/ui/basic';

const tokens: ThemeTokenOverrides = {
  semantic: {
    // 默认按钮和展开菜单一起提高一级；表单高度保持原样。
    'control-height-sm': 'var(--rui-control-height)',
  },
  components: {
    card: {
      'padding-x': 'var(--rui-compact-surface-padding-x)',
      'padding-y': 'var(--rui-compact-surface-padding-y)',
    },
  },
};

<ReitoThemeProvider tokens={tokens}>
  <Button>跟随共享尺寸</Button>
</ReitoThemeProvider>;
```

`tokens` 是受类型检查的声明式配置，更新 props 会即时生效，不重新挂载子组件。省略的键继承父级设置；局部配置按组件和 token 键合并，不替换整个组件配置。用一个局部 Provider 包住单个组件即可限制调整范围。优先级为默认引用 → 父级配置 → 本级配置。`root` 将配置应用到文档根，局部 Provider 和 Base UI Portal 使用最近的 React 主题配置。

生成变量以 `--rui-component-<组件>-<角色>` 命名。既有共享角色保留；消费工程优先通过 Provider 的 `tokens` 微调，避免页面选择器覆盖。CSS 自定义属性在声明处求值，局部基础值不能靠继承已计算的别名传播；Provider 会在自己的作用域和弹层重新绑定引用。

菜单默认高度引用 `control-height-sm`，上下内距按 `(目标高度 - 行高) / 2` 推导，并限制为非负值。默认 compact 为 28px / 20px / 4px，comfortable 为 36px / 20px / 8px。它是单行目标，不给多行条目设置固定高度。特殊内距可以覆盖 `components.menu['item-padding-y']`，但使用方需要检查实际高度。

计算表达式写在 `$extensions.reito.css` 中，它是本项目的扩展，不是 DTCG 标准表达式。`$value` 保留 compact 默认回退值；CSS 使用实时表达式。生成器检查普通引用与表达式引用的缺失目标和循环依赖。该检查不能验证消费工程运行时传入的任意 CSS 字符串。

在 Lab 的 `?view=theme-guide` 查看“共享尺寸与组件微调”，或在 Storybook 的 ReitoThemeProvider 下选择同名示例。两处使用同一个交互示例。
