import { ThemeTokenDemo } from '../../../../packages/ui/src/basic/theme-token-demo';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReitoThemeProvider, Theme, createTheme, Panel, SelectInput, Stack, Inline, Text, Button, Badge, Switch, Checkbox, Slider, Progress, RadioGroup, RadioGroupItem, Toggle, Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@reito/ui/basic';
const meta = { id: '基础-theme', title: '基础/ReitoThemeProvider 动态主题', component: ReitoThemeProvider,
  args: { mode: 'dark', colors: { primary: 'violet', neutral: 'zinc' } },
  argTypes: { mode: { control: 'select', options: ['dark','light','system'] }, colors: { control: 'object' } },
  render: args => <ReitoThemeProvider {...args}><div className="grid gap-3 rounded-lg border bg-background px-[var(--rui-card-padding-x)] py-[var(--rui-card-padding-y)]"><div className="flex flex-wrap gap-2"><Button>主题主色</Button><Button color="green" variant="outline">独立绿色</Button><Button color="amber" variant="secondary">柔和琥珀</Button><Button color="rose" disabled>禁用操作</Button><Button color="blue" disabled aria-busy="true">处理中</Button><Badge color="success" variant="secondary">已完成</Badge></div><div className="flex items-center gap-3"><Switch aria-label="主题开关" defaultChecked/><Checkbox color="cyan" aria-label="独立青色" defaultChecked/><Toggle color="violet" defaultPressed>切换</Toggle></div><RadioGroup color="blue" defaultValue="a" aria-label="主题选择"><RadioGroupItem value="a" aria-label="第一项"/><RadioGroupItem value="b" aria-label="第二项"/></RadioGroup><Slider color="rose" defaultValue={40} aria-label="独立粉色进度"/><Progress value={60} color="green" aria-label="主题进度"/><Dialog><DialogTrigger render={<Button variant="outline"/>}>打开同主题弹窗</DialogTrigger><DialogContent><DialogTitle>继承最近的主题</DialogTitle><DialogDescription>通过 React 作用域进入 Portal。</DialogDescription><Button>弹层主操作</Button></DialogContent></Dialog></div></ReitoThemeProvider>,
} satisfies Meta<typeof ReitoThemeProvider>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { name: '参数调试' };
export const Light: Story = { name: '浅色 · 紫色主操作', args: { mode:'light' } };
export const Nested: Story = { name: '局部主题 · 明暗独立', render: () => <ReitoThemeProvider mode="dark" colors={{primary:'blue',neutral:'graphite'}}><div className="grid gap-3 bg-background p-4"><Button>外层蓝色</Button><ReitoThemeProvider mode="light" colors={{primary:'rose',neutral:'stone'}}><div className="grid gap-2 bg-card p-4"><Button>局部粉色</Button><Dialog><DialogTrigger render={<Button variant="outline"/>}>打开局部浅色弹层</DialogTrigger><DialogContent><DialogTitle>局部浅色主题</DialogTitle><DialogDescription>颜色与控件密度均来自最近的 Provider。</DialogDescription><Button>局部主操作</Button></DialogContent></Dialog></div></ReitoThemeProvider></div></ReitoThemeProvider> };

export const ComponentTokens: Story = { name: '共享尺寸与组件 token', render: args => <ReitoThemeProvider {...args}><div className="bg-background text-foreground p-4"><ThemeTokenDemo/></div></ReitoThemeProvider> };

const productTheme = createTheme(
  { colors: { primary: 'violet', neutral: 'zinc' }, defaults: { Button: { variant: 'outline' } } },
  { tokens: { components: { button: { radius: '10px' } } } },
);
const scopes = [{ value: 'all', label: '全部会话' }, { value: 'mine', label: '我的会话' }];
export const Preset: Story = { name: 'createTheme 预设 · 全局默认值', render: () => <ReitoThemeProvider mode="light" theme={productTheme}><Stack inset className="bg-background text-foreground"><Inline><Button>预设默认 outline</Button><Button variant="default">显式 default 优先</Button></Inline><Text tone="muted">预设由多层 createTheme 合并；组件显式属性优先。</Text></Stack></ReitoThemeProvider> };
export const ScopedDefaults: Story = { name: '局部 Theme · 组件默认值', render: () => <ReitoThemeProvider mode="dark" theme={productTheme}><Stack inset className="bg-background text-foreground"><Inline><Button>外层默认</Button></Inline><Theme mode="light" colors={{ primary: 'rose', neutral: 'stone' }} defaults={{ Button: { variant: 'secondary', size: 'sm' }, SelectInput: { placeholder: '选择范围' } }}><Panel title="局部 Theme" actions={<Button variant="ghost">显式 ghost</Button>}><Inline><Button>局部默认 secondary</Button><SelectInput aria-label="局部范围" options={scopes} /><Dialog><DialogTrigger render={<Button />}>打开局部弹层</DialogTrigger><DialogContent><DialogTitle>Portal 继承局部 Theme</DialogTitle><DialogDescription>颜色、明暗与组件默认值都来自最近的 Theme。</DialogDescription><Button>局部弹层操作</Button></DialogContent></Dialog></Inline></Panel></Theme></Stack></ReitoThemeProvider> };
