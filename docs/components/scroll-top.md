# ScrollTop

基础层的返回顶部操作，复用 Graphite Button。宿主决定放在工具栏、内容尾部或其他位置；组件本身不创建覆盖页面的浮层。

```tsx
const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
const [heading, setHeading] = useState<HTMLHeadingElement | null>(null);
return <>
  <div ref={setViewport} className="h-64 overflow-auto" tabIndex={0}>
    <h2 ref={setHeading} tabIndex={-1}>文档</h2>
    {children}
  </div>
  <ScrollTop target={viewport} focusTarget={heading} />
</>;
```

从 `@reito/ui/basic` 或根入口导入。`target` 必填，接受实际滚动元素、Window 或挂载前的 null；使用回调 ref/state，使目标改变能触发订阅更新。不要仅改变 ref.current 而不重新渲染。

- `threshold` 是可选像素距离，默认一个目标视口高度；负数按零处理，非有限数回退到视口高度。大于阈值且有溢出时显示。
- `behavior` 默认 smooth，支持 auto/instant；系统要求减少运动时使用 instant。
- `focusTarget` 默认滚动元素或窗口 documentElement；建议传顶部标题。点击后先以 preventScroll 聚焦，再滚到顶部，避免控件隐藏后丢失焦点。无 tabindex 的目标临时添加 -1，失焦后移除。
- `disabled`、Button 尺寸/样式、aria-label 和 children 可覆盖；默认文本“返回顶部”。目标尺寸和内容变化重新计算可见性，目标更换及卸载清理观察器和监听。

不会请求网络、加载历史或开启自动跟随。虚拟列表的未渲染条目定位应使用列表公开 API；这个组件只处理实际 DOM 滚动面。提供稳定且连接在文档中的 focusTarget，不应把即将隐藏的按钮自身作为焦点目标。

Storybook：`基础-scrolltop--playground`，同页调节 threshold/behavior/disabled/short；另有即时滚动、禁用、短内容、双面板和窗口目标，共 6 个 Story。默认应用无需新增密度切换器。
