import { useArgs } from "storybook/preview-api";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger, NavigationMenuContent } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavigationMenuDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Navigation Menu",
  component: NavigationMenuDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "产品导航与文档入口。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof NavigationMenuDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
};

export const Default: Story = { name: '普通链接导航', render: () => <NavigationMenu aria-label="组件文档"><NavigationMenuList><NavigationMenuItem><NavigationMenuLink href="#basic" onClick={event => event.preventDefault()} active>基础组件</NavigationMenuLink></NavigationMenuItem><NavigationMenuItem><NavigationMenuLink href="#ai" onClick={event => event.preventDefault()}>AI 组件</NavigationMenuLink></NavigationMenuItem></NavigationMenuList></NavigationMenu> };
export const Dropdown: Story = { name: '展开文档导航', render: () => <NavigationMenu aria-label="组件目录"><NavigationMenuList><NavigationMenuItem><NavigationMenuTrigger>组件文档</NavigationMenuTrigger><NavigationMenuContent className="w-60"><NavigationMenuLink href="#basic" onClick={event => event.preventDefault()}>基础组件</NavigationMenuLink><NavigationMenuLink href="#complex" onClick={event => event.preventDefault()}>复杂组件</NavigationMenuLink><NavigationMenuLink href="#ai" onClick={event => event.preventDefault()}>AI 组件</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu> };

export const Playground: StoryObj<{ open: boolean; align: 'start' | 'center' | 'end'; disabled: boolean; title: string }> = {
  name: '参数调试', args: { open: false, align: 'start', disabled: false, title: '组件文档' },
  argTypes: { open: { control: 'boolean', table: { category: '组合示例' }, description: '映射 NavigationMenu 的 value（docs / null）。' }, align: { control: 'select', options: ['start', 'center', 'end'] }, disabled: { control: 'boolean', table: { category: 'NavigationMenuTrigger' } }, title: { control: 'text', table: { category: '组合示例' }, description: '导航触发器的 children。' } },
  parameters: { controls: { include: ['open', 'align', 'disabled', 'title'] }, docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <NavigationMenu aria-label="组件目录" align={args.align} value={args.open ? 'docs' : null} onValueChange={value => updateArgs({ open: value === 'docs' })}><NavigationMenuList><NavigationMenuItem value="docs"><NavigationMenuTrigger disabled={args.disabled}>{args.title}</NavigationMenuTrigger><NavigationMenuContent className="w-60">{['基础组件', '复杂组件', 'AI 组件'].map(label => <NavigationMenuLink key={label} href="#" onClick={event => { event.preventDefault(); updateArgs({ open: false }); }}>{label}</NavigationMenuLink>)}</NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu>; },
};
