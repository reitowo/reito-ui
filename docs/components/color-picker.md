# ColorPicker / ColorInput

`ColorInput` 用于颜色文本提交，`ColorPicker` 在同一字段契约上增加色板。两者接受 HEX、RGB(A) 与 HSL(A) 输入，并按 `format="hex" | "rgb" | "hsl"` 输出稳定格式。

```tsx
import { ColorPicker } from '@reito/ui/basic';

export function AccentColor() {
  const [color, setColor] = useState('#4F7DFFFF');
  return <ColorPicker
    label="界面强调色"
    value={color}
    onValueChange={setColor}
    onValueCommit={value => savePreference(value)}
    format="hex"
    allowAlpha
    presets={['#4F7DFF', '#29A36A', '#C58A21']}
  />;
}
```

`value / onValueChange` 为受控模式，`defaultValue` 为未受控初值。色板拖动、滑块和通道输入会触发 `onValueChange`；指针释放、滑块提交、预设选择及文本 Enter/失焦会触发 `onValueCommit`。宿主可用前者即时预览，用后者保存偏好。

文本草稿允许暂时不完整。有效值在 Enter 或失焦时规范化为目标格式；无效值显示字段错误且不覆盖最后一次有效颜色，Escape 恢复已提交文本。解析器只接受明确的 HEX、RGB(A) 和 HSL(A)，不依赖浏览器命名颜色。

`allowAlpha` 开启透明度滑块与 A 通道；HEX 输出固定为八位，RGB/HSL 输出对应 alpha 函数。关闭时输出不含透明度且 alpha 归一为 1。`inline` 直接显示面板，默认使用 Popover；`showChannels={false}` 可隐藏 RGB 数字通道，`presets` 接受可解析的颜色字符串。

饱和度/亮度区域支持指针和方向键，Shift + 方向键使用较大步长；色相和透明度使用可访问 Slider，RGB(A) 通道使用原生 number 输入。`readOnly` 保留可复制文本并移除弹出入口；内联只读面板保留展示但禁用调整。`disabled` 禁用整个字段。传入 `name` 后，规范化的文本值由原生表单提交。

色相渐变、颜色空间黑白端点、控件尺寸、边界、前景色和弹层表面都来自共享 tokens。当前颜色、透明度预览和预设色属于调用方数据，因此作为运行时样式值，不充当组件 chrome。
