import { useArgs } from "storybook/preview-api";
import { useState } from 'react';
import { Inbox, FileText, Settings } from 'lucide-react';
import { Sidebar, SidebarProvider, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Sidebar",
  component: SidebarDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "搜索、分组、活动行与页脚。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof SidebarDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
};

function WorkspaceSidebar({ variant = 'sidebar', collapsed = false }: { variant?: 'sidebar' | 'floating' | 'inset'; collapsed?: boolean }) {
 const [active, setActive] = useState('收件箱');
 return <SidebarProvider defaultOpen={!collapsed}><Sidebar variant={variant} collapsible="icon"><SidebarContent><SidebarGroup><SidebarGroupLabel>工作区</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{[{ title: '收件箱', Icon: Inbox }, { title: '任务', Icon: FileText }, { title: '设置', Icon: Settings }].map(({ title, Icon }) => <SidebarMenuItem key={title}><SidebarMenuButton isActive={active === title} aria-label={title} tooltip={title} onClick={() => setActive(title)}><Icon /><span>{title}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent></Sidebar><SidebarInset><div className="flex items-center gap-2 border-b p-2"><SidebarTrigger aria-label="切换侧栏" /><span className="text-sm">{active}</span></div><p className="p-[var(--rui-content-padding)] text-sm text-muted-foreground">选择侧栏项目，或切换为图标导航。</p></SidebarInset></SidebarProvider>;
}
export const Default: Story = { name: '默认侧栏', parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <WorkspaceSidebar /> };
export const Floating: Story = { name: '悬浮侧栏', parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <WorkspaceSidebar variant="floating" /> };
export const Inset: Story = { name: '内嵌工作面', parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <WorkspaceSidebar variant="inset" /> };
export const IconCollapsed: Story = { name: '图标折叠', parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <WorkspaceSidebar collapsed /> };

export const Playground: StoryObj<{ variant: 'sidebar' | 'floating' | 'inset'; collapsible: 'offcanvas' | 'icon' | 'none'; side: 'left' | 'right'; open: boolean; active: string }> = {
  name: '参数调试', args: { variant: 'sidebar', collapsible: 'icon', side: 'left', open: true, active: '收件箱' },
  argTypes: { variant: { control: 'select', options: ['sidebar', 'floating', 'inset'] }, collapsible: { control: 'select', options: ['offcanvas', 'icon', 'none'] }, side: { control: 'select', options: ['left', 'right'] }, open: { control: 'boolean', table: { category: 'SidebarProvider' } }, active: { control: 'select', options: ['收件箱', '任务', '设置'], table: { category: '组合示例' }, description: '映射各菜单按钮的 isActive。' } },
  parameters: { layout: 'fullscreen', controls: { include: ['variant', 'collapsible', 'side', 'open', 'active'] }, docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <SidebarProvider open={args.open} onOpenChange={open => updateArgs({ open })}><Sidebar variant={args.variant} collapsible={args.collapsible} side={args.side}><SidebarContent><SidebarGroup><SidebarGroupLabel>工作区</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{[{ title: '收件箱', Icon: Inbox }, { title: '任务', Icon: FileText }, { title: '设置', Icon: Settings }].map(({ title, Icon }) => <SidebarMenuItem key={title}><SidebarMenuButton isActive={args.active === title} aria-label={title} tooltip={title} onClick={() => updateArgs({ active: title })}><Icon /><span>{title}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent></Sidebar><SidebarInset><div className="flex items-center gap-2 border-b p-2"><SidebarTrigger aria-label="切换侧栏" /><span className="text-sm">{args.active}</span></div><p className="p-[var(--rui-content-padding)] text-sm text-muted-foreground">本地组件工作区示例。</p></SidebarInset></SidebarProvider>; },
};
