import { ThemeTokenDemo } from '../../../packages/ui/src/basic/theme-token-demo';
import { ThemeControls, useDensityPreferences } from './ThemeControls';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Moon, Palette, RotateCcw, Sun } from 'lucide-react';
import { Badge, Button, Checkbox, Input, Label, Progress, ProgressLabel, ProgressValue, SelectInput, Switch, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@reito/ui/basic';
import { ReitoThemeProvider, type ThemeColors, type ThemeMode, type NeutralPalette } from '@reito/ui/basic';
type StudyPrimary = ThemeColors['primary'];
type StudyNeutral = NeutralPalette;
type StudyScheme = ThemeMode;
import { readThemeColors as storedColors } from './theme-preferences';
import { CodeBlock } from '../../../packages/ui/src/ai/code-block';

const primaryOptions = [{value:'neutral',label:'灰白'}, {value:'blue',label:'蓝色'}, {value:'green',label:'绿色'}, {value:'violet',label:'紫色'}, {value:'amber',label:'琥珀'}, ...['red','orange','yellow','lime','emerald','teal','cyan','sky','indigo','purple','fuchsia','pink','rose'].map(value=>({value,label:value}))];
const neutralOptions = [{value:'graphite',label:'Graphite 中性灰'}, ...['gray','zinc','slate','stone','neutral'].map(value=>({value,label:value[0].toUpperCase()+value.slice(1)}))];
const name = (options:typeof primaryOptions,value:string) => options.find(option=>option.value===value)?.label ?? value;

export function ThemeGuide() {
  const [density,setDensity]=useDensityPreferences();
  const [primary,setPrimary]=useState<StudyPrimary>(()=>storedColors().primary || 'violet');
  const [neutral,setNeutral]=useState<StudyNeutral>(()=>storedColors().neutral || 'graphite');
  const [scheme,setScheme]=useState<StudyScheme>(()=>{try{return localStorage.getItem('reito-theme')==='light'?'light':localStorage.getItem('reito-theme')==='system'?'system':'dark';}catch{return 'dark';}});
  const [localColor,setLocalColor]=useState<StudyPrimary>('green');
  const [localVariant,setLocalVariant]=useState<'default'|'outline'|'ghost'>('default');
  const [enabled,setEnabled]=useState(true);
  const [selected,setSelected]=useState(true);
  const [workspace,setWorkspace]=useState('个人工作区');
  const [saved,setSaved]=useState(false);
  useEffect(()=>{try { localStorage.setItem('reito-colors',JSON.stringify({primary,neutral})); localStorage.setItem('reito-theme',scheme); } catch {} document.title='动态主题配色示例 · Reito UI';},[scheme,primary,neutral]);
  const api = ['// 当前可用 API：来自 @reito/ui/basic', '<ReitoThemeProvider', '  mode="'+scheme+'"', '  density="'+density+'"', '  colors={{ primary: "'+primary+'", neutral: "'+neutral+'" }}', '>', '  <Button color="primary">保存</Button>', '  <Button color="'+localColor+'" variant="'+localVariant+'">单独配色</Button>', '</ReitoThemeProvider>'].join('\n');
  return <ReitoThemeProvider root mode={scheme} density={density} colors={{primary,neutral}} className="reito-root min-h-screen bg-background text-foreground" style={{display:"block"}}>
    <header className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3">
      <a href={`${import.meta.env.BASE_URL}?view=overview`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3" aria-hidden="true"/>组件总览</a>
      <div className="flex items-center gap-2"><Badge variant="outline">配色交互示例</Badge><ThemeControls colors={{primary,neutral}} onChange={colors=>{setPrimary(colors.primary ?? 'neutral');setNeutral(colors.neutral ?? 'graphite');}} mode={scheme} onModeChange={setScheme} density={density} onDensityChange={setDensity}/></div>
    </header>
    <main className="mx-auto grid w-full max-w-[var(--rui-container-5xl)] gap-6 px-4 py-6">
      <div className="grid gap-2"><h1 className="text-xl font-semibold">动态主题配色示例</h1><p className="text-sm text-muted-foreground">主色决定强调操作，底色决定工作面的灰阶，单个组件可以另选颜色。</p><p className="text-xs text-muted-foreground">当前使用正式主题接口：17 套彩色色阶、6 套底色色系，支持系统明暗和局部弹层继承。选择会保留到组件总览。</p></div>
      <div className="grid items-start gap-6 lg:grid-cols-[var(--rui-sidebar-width)_minmax(0,1fr)]">
        <aside className="grid gap-4 rounded-lg border bg-card px-[var(--rui-card-padding-x)] py-[var(--rui-card-padding-y)]" aria-label="全局配色设置">
          <div className="flex items-center gap-2"><Palette className="size-4" aria-hidden="true"/><h2 className="font-medium">切换全局配色</h2></div>
          <div className="grid gap-2"><Label htmlFor="guide-primary">主题主色</Label><SelectInput className="w-full" id="guide-primary" aria-label="主题主色" value={primary} onValueChange={v=>setPrimary(v as StudyPrimary)} options={primaryOptions}/><p className="text-xs text-muted-foreground">按钮填充、开关选中和进度一起变化。</p></div>
          <div className="grid gap-2"><Label htmlFor="guide-neutral">底色色系</Label><SelectInput className="w-full" id="guide-neutral" aria-label="底色色系" value={neutral} onValueChange={v=>setNeutral(v as StudyNeutral)} options={neutralOptions}/><p className="text-xs text-muted-foreground">预览区的背景、面板、边框与正文一起协调变化。</p></div>
          <div className="grid gap-2"><Label htmlFor="guide-scheme">明暗模式</Label><SelectInput className="w-full" id="guide-scheme" aria-label="明暗模式" value={scheme} onValueChange={v=>setScheme(v as StudyScheme)} options={[{value:'dark',label:'深色'},{value:'light',label:'浅色'},{value:'system',label:'跟随系统'}]}/></div>
          <Button variant="ghost" onClick={()=>{setPrimary('violet');setNeutral('graphite');setLocalColor('green');setLocalVariant('default');}}><RotateCcw aria-hidden="true"/>重置配色</Button>
        </aside>
        <ReitoThemeProvider mode={scheme} colors={{primary,neutral}} style={{display:"grid"}} className="grid gap-4 rounded-xl border bg-background px-[var(--rui-card-padding-x)] py-[var(--rui-card-padding-y)]" aria-label="主题效果预览">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-medium">一个工作面，整体换色</h2><Badge color="primary" variant="secondary">{name(primaryOptions,primary)} · {name(neutralOptions,neutral)}</Badge></div>
          <div className="grid gap-2"><Label htmlFor="guide-workspace">工作区名称</Label><Input id="guide-workspace" value={workspace} onChange={e=>{setWorkspace(e.target.value);setSaved(false);}}/></div>
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="grid gap-0.5"><Label htmlFor="guide-switch">任务完成提醒</Label><p className="text-xs text-muted-foreground">切换配色后，开关和输入内容仍保持当前状态。</p></div><Switch id="guide-switch" checked={enabled} onCheckedChange={setEnabled}/></div>
          <div className="flex items-center gap-2"><Checkbox id="guide-check" checked={selected} onCheckedChange={v=>setSelected(Boolean(v))}/><Label htmlFor="guide-check">将此工作区设为默认</Label></div>
          <Progress value={68}><ProgressLabel>本地示例进度</ProgressLabel><ProgressValue/></Progress>
          <div className="flex flex-wrap items-center gap-2"><Button color="primary" onClick={()=>setSaved(true)}><Check aria-hidden="true"/><span className="inline-grid"><span aria-hidden="true" className="invisible col-start-1 row-start-1">保存工作区</span><span className="col-start-1 row-start-1">{saved?'已保存':'保存工作区'}</span></span></Button><Button color="primary" variant="outline" onClick={()=>setSaved(false)}>取消</Button><Button color="primary" variant="ghost" disabled>暂不可用</Button></div>
          <p role="status" className="min-h-[var(--rui-line-interface)] text-xs text-muted-foreground">{saved?'已保存在当前示例中。':'操作只改变本地示例状态。'}</p>
          <div className="grid gap-2 border-t pt-3"><h3 className="text-xs font-medium text-muted-foreground">实际使用的颜色角色</h3><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{[['bg-background','底色'],['bg-card','面板'],['bg-muted','弱底色'],['bg-primary','主色'],['bg-info-soft','信息底色'],['bg-foreground','正文']].map(([className,label])=><div key={label} className="grid gap-1"><span className={'h-8 rounded-sm border '+className}/><span className="text-xs text-muted-foreground">{label}</span></div>)}</div></div>
        </ReitoThemeProvider>
      </div>
      <ReitoThemeProvider mode={scheme} colors={{primary,neutral}} style={{display:"grid"}} className="grid gap-4 rounded-xl border bg-background px-[var(--rui-card-padding-x)] py-[var(--rui-card-padding-y)]" aria-label="组件单独配色示例">
        <div className="grid gap-1"><h2 className="font-medium">单个组件可以使用另一种颜色</h2><p className="text-sm text-muted-foreground">全局主色是{name(primaryOptions,primary)}，下面的操作可以单独使用{name(primaryOptions,localColor)}。颜色和填充样式分别选择。</p></div>
        <div className="flex flex-wrap items-end gap-3"><div className="grid min-w-0 gap-1"><Label htmlFor="guide-local">组件颜色</Label><SelectInput id="guide-local" aria-label="组件颜色" value={localColor} onValueChange={v=>setLocalColor(v as StudyPrimary)} options={primaryOptions}/></div><div className="grid min-w-0 gap-1"><Label htmlFor="guide-variant">呈现样式</Label><SelectInput id="guide-variant" aria-label="呈现样式" value={localVariant} onValueChange={v=>setLocalVariant(v as typeof localVariant)} options={[{value:'default',label:'实心'},{value:'outline',label:'描边'},{value:'ghost',label:'轻量'}]}/></div></div>
        <div className="flex flex-wrap items-center gap-3"><Button color="primary">跟随全局主色</Button><div className="flex flex-wrap items-center gap-2"><Button color={localColor} variant={localVariant}>单独配色的操作</Button><Badge color={localColor} variant="secondary">局部颜色标签</Badge></div></div>
      </ReitoThemeProvider>
      <ReitoThemeProvider mode="light" colors={{primary:"rose",neutral:"stone"}}><section aria-label="局部浅色主题" className="grid gap-3 rounded-lg border bg-card px-[var(--rui-card-padding-x)] py-[var(--rui-card-padding-y)]"><h2 className="font-medium">局部主题与弹层</h2><p className="text-sm text-muted-foreground">这块固定使用浅色 Stone + Rose。打开弹窗后，弹层沿用这里的主题；外层仍使用你的选择。</p><Dialog><DialogTrigger render={<Button/>}>查看局部主题弹窗</DialogTrigger><DialogContent><DialogHeader><DialogTitle>局部主题也进入弹层</DialogTitle><DialogDescription>浅色 Stone 背景、Rose 主色与中性键盘焦点。</DialogDescription></DialogHeader><DialogFooter><Button>局部主题操作</Button><Button color="green" variant="outline">独立绿色操作</Button></DialogFooter></DialogContent></Dialog></section></ReitoThemeProvider>
      <ThemeTokenDemo/>
      <section className="grid gap-4" aria-labelledby="guide-explain"><h2 id="guide-explain" className="font-medium">这三个设置分别负责什么</h2><div className="grid gap-4 md:grid-cols-3">{[['主题主色','用在主要操作、选中控件和进度上。换成彩色后，组件尺寸与圆角保持原样。'],['底色色系','决定背景、表面、边框和文字的灰阶倾向。主色是紫色，整个页面也可以继续保持中性灰。'],['组件颜色与样式','颜色回答“用哪套配色”，样式回答“实心、描边还是轻量”。同一种颜色可以有不同强调程度。']].map(([title,description])=><div key={title} className="grid content-start gap-2 border-t pt-3"><h3 className="text-sm font-medium">{title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></div>)}</div></section>
      <section className="grid gap-3"><div className="grid gap-1"><h2 className="font-medium">当前可用的主题 API</h2><p className="text-xs text-muted-foreground">下面随你的选择更新。Provider 管理主题，color 独立于 variant；省略 color 时保持组件现有默认样式。</p></div><CodeBlock code={api} language="tsx" filename="主题用法.tsx" copyable={false}/></section>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs text-muted-foreground"><p>焦点保持中性细边界，密度与配色独立。</p><div className="flex flex-wrap gap-4"><a href="https://ui.nuxt.com/docs/getting-started/theme/design-system" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">Nuxt UI 配色机制<ArrowUpRight className="size-3"/></a><a href="https://primevue.dev/theming/styled" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">PrimeVue 主题机制<ArrowUpRight className="size-3"/></a></div></footer>
    </main>
  </ReitoThemeProvider>;
}
