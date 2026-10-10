import { Download } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@reito/ui/basic';
import tokens from '../../../packages/tokens/src/tokens.json';
import { tokenMetrics } from '@reito/tokens/metrics';
import { version } from '../package.json';
const roles = ['bg','surface','elevated','text','text-secondary','text-muted','border','hover','active','primary','accent','success','warning','danger'] as const;
const densityRoles = [
  ['button-height', '默认按钮高度'],
  ['compact-surface-padding-x', '紧凑面板左右内距'], ['compact-surface-padding-y', '紧凑面板上下内距'],
  ['compact-surface-gap', '紧凑面板文字间距'],
  ['card-padding-x', '卡片区域左右内距'], ['card-padding-y', '卡片区域上下内距'],
  ['card-text-gap', '卡片相关文字间距'],
    ['menu-item-padding-x', '菜单条目左右内距'], ['menu-item-padding-y', '菜单条目上下内距'],
  ['cell-padding-x', '表格左右内距'], ['cell-padding-y', '表格上下内距'],
  ['content-padding', 'AI / 面板内容内距'], ['content-gap', '内容间距'],
  ['message-gap', '消息间距'], ['composer-input-height', '输入区最小高度'],
] as const;
type DimensionToken = { $value: { value: number; unit: string } | string };
function px(token: DimensionToken): string {
  if (typeof token.$value === 'string') {
    const resolved = token.$value.slice(1, -1).split('.').reduce<unknown>((value, key) => (value as Record<string, unknown>)[key], tokens);
    return px(resolved as DimensionToken);
  }
  return String(token.$value.value * (token.$value.unit === 'rem' ? 16 : 1)) + 'px';
}
export function downloadJson(name: string, value: unknown) { const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
export function TokenReference({open,onOpenChange}:{open:boolean;onOpenChange:(open:boolean)=>void}) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[85dvh] overflow-auto sm:max-w-2xl"><DialogHeader><DialogTitle>设计 Tokens</DialogTitle><DialogDescription>颜色、字体和密度来自同一份 tokens.json。这里的色块使用当前主题。</DialogDescription></DialogHeader><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{roles.map(role=><div key={role} className="flex items-center gap-2 rounded-md border p-2"><span className="size-6 shrink-0 rounded border" style={{background:`var(--rui-${role})`}} /><code className="text-xs">{role}</code></div>)}</div><div className="grid gap-2 text-sm"><p>字体：Inter Variable · 中文系统字体回退</p><p>弹出选项主文字：{tokenMetrics['menu-font-size']}px</p><p>正文 {tokenMetrics['font-reading']}px · 界面 {tokenMetrics['font-interface']}px · 辅助 {tokenMetrics['font-caption']}px</p><p>紧凑控件：{['control-height-xs', 'control-height-sm', 'control-height', 'control-height-lg'].map(key => px(tokens.density.compact[key as keyof typeof tokens.density.compact])).join(' / ')}</p><p>舒适控件：{['control-height-xs', 'control-height-sm', 'control-height', 'control-height-lg'].map(key => px(tokens.density.comfortable[key as keyof typeof tokens.density.comfortable])).join(' / ')}</p><p className="text-xs text-muted-foreground">数值按浏览器默认根字号 16px。默认灰阶、语义别名和 Tailwind @theme 桥接均随组件库交付。</p></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><caption className="mb-2 text-left text-sm font-medium">共享内容密度</caption><thead><tr><th className="py-2 font-medium">用途</th><th className="py-2 font-medium">紧凑</th><th className="py-2 font-medium">舒适</th></tr></thead><tbody>{densityRoles.map(([key, label]) => <tr key={key} className="border-t"><th scope="row" className="py-2 font-normal">{label}</th><td>{px(tokens.density.compact[key])}</td><td>{px(tokens.density.comfortable[key])}</td></tr>)}</tbody></table></div><Button variant="outline" onClick={()=>downloadJson(`reito-tokens-${version}.json`,tokens)}><Download />导出完整 Tokens JSON</Button></DialogContent></Dialog>;
}
