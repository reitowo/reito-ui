import { useId, useState } from 'react';
import { Area, Bar, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { tokenMetrics } from '@reito/tokens/metrics';
import { Button } from '../primitives/button.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../primitives/table.js';
import { cn } from '../lib/utils.js';
import { chartToneColors, validateChartData, type ChartKind, type ChartRow, type ChartSeries, type ChartTone } from './chart-model.js';
export type { ChartKind, ChartRow, ChartSeries, ChartTone } from './chart-model.js';

export interface ChartProps {
  label: string;
  data: readonly ChartRow[];
  series: readonly ChartSeries[];
  kind?: ChartKind;
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  formatValue?: (value: number) => string;
  className?: string;
}
const tones: ChartTone[] = ['default','success','warning','danger','muted'];
const number = (value: number) => new Intl.NumberFormat('zh-CN').format(value);
const shortCategory = (value: string) => Array.from(value).length > 8 ? `${Array.from(value).slice(0,8).join('')}…` : value;

/** Host-owned values rendered with an accessible chart and an equivalent data table. */
export function Chart({label,data,series,kind='line',showLegend=true,showGrid=true,stacked=false,loading=false,error,onRetry,formatValue=number,className}:ChartProps) {
  const id=useId();
  const [hidden,setHidden]=useState<string[]>([]);
  const polar=kind==='pie'||kind==='donut';
  const problem=error || validateChartData(data,series,kind);
  const color=(index:number)=>chartToneColors[series[index]?.tone ?? tones[index%tones.length]];
  const rows=data.map(row=>({...row, ...Object.fromEntries(series.map((item,index)=>[`value${index}`,row.values[item.key]]))}));
  const toggle=(key:string)=>setHidden(current=>current.includes(key)?current.filter(item=>item!==key):[...current,key]);
  const formatCell=(value:number|null)=>value===null?'缺失':formatValue(value);
  const legend=polar?data.map((row,index)=>({key:row.id,label:row.label,color:chartToneColors[tones[index%tones.length]]})):series.map((item,index)=>({key:item.key,label:item.label,color:color(index)}));
  const tooltip=<Tooltip content={({active,payload,label:pointLabel})=>active&&payload?.length?<div role="status" className="rounded-md border border-border bg-popover p-[var(--rui-content-padding)] text-xs text-popover-foreground shadow-md"><p>{pointLabel}</p>{payload.map((entry,index)=><p key={index}>{entry.name}：{typeof entry.value==='number'?formatValue(entry.value):'缺失'}</p>)}</div>:null} />;
  return <section data-slot="chart" aria-labelledby={id} className={cn('grid min-w-0 gap-[var(--rui-content-gap)] text-sm text-foreground',className)}>
    <h3 id={id} className="font-medium">{label}</h3>
    {loading?<p role="status" className="text-muted-foreground">正在加载图表…</p>:problem?<div className="grid gap-[var(--rui-content-gap-sm)]"><p role="alert" className="text-destructive">{problem}</p>{onRetry&&<Button variant="outline" onClick={onRetry}>重试</Button>}</div>:!data.length?<p role="status" className="text-muted-foreground">暂无图表数据</p>:<>
      {showLegend&&<div aria-label="图例" className="flex flex-wrap gap-[var(--rui-content-gap-sm)]">{legend.map(item=><Button key={item.key} size="xs" variant="ghost" aria-pressed={!hidden.includes(item.key)} onClick={()=>toggle(item.key)}><span aria-hidden="true" className="size-2 rounded-full" style={{backgroundColor:item.color}} />{item.label}</Button>)}</div>}
      <div className="h-64 min-w-0 text-xs [&_.recharts-surface:focus-visible]:outline [&_.recharts-surface:focus-visible]:outline-ring">
        <ResponsiveContainer width="100%" height="100%">
          {polar?<PieChart accessibilityLayer aria-label={label}>{tooltip}<Pie data={rows.filter(row=>!hidden.includes(row.id))} dataKey="value0" nameKey="label" innerRadius={kind==='donut'?'55%':0} outerRadius="80%" isAnimationActive={false}>{data.filter(row=>!hidden.includes(row.id)).map(row=><Cell key={row.id} fill={legend.find(item=>item.key===row.id)?.color} stroke="var(--rui-bg)" />)}</Pie></PieChart>:<ComposedChart data={rows} accessibilityLayer aria-label={label}>
            {showGrid&&<CartesianGrid vertical={false} stroke="var(--rui-border)" />}
            <XAxis dataKey="label" tickFormatter={shortCategory} interval="preserveStartEnd" tick={{fill:'var(--rui-text-muted)'}} tickLine={false} axisLine={false} />
            <YAxis width={tokenMetrics['space-16']} tick={{fill:'var(--rui-text-muted)'}} tickLine={false} axisLine={false} tickFormatter={formatValue} />
            {tooltip}
            {series.map((item,index)=>{
              const shared={dataKey:`value${index}`,name:item.label,hide:hidden.includes(item.key),isAnimationActive:false,stroke:color(index),fill:color(index)};
              return kind==='bar'?<Bar key={item.key} {...shared} stackId={stacked?'values':undefined}/>:kind==='area'?<Area key={item.key} {...shared} stackId={stacked?'values':undefined} connectNulls={false}/>:<Line key={item.key} {...shared} connectNulls={false} strokeWidth={tokenMetrics['outline-width']} />;
            })}
          </ComposedChart>}
        </ResponsiveContainer>
      </div>
      <details><summary className="cursor-pointer text-xs text-muted-foreground">查看数据表</summary><Table aria-label={`${label}数据`}><TableHeader><TableRow><TableHead>类别</TableHead>{series.map(item=><TableHead key={item.key}>{item.label}</TableHead>)}</TableRow></TableHeader><TableBody>{data.map(row=><TableRow key={row.id}><TableHead scope="row">{row.label}</TableHead>{series.map(item=><TableCell key={item.key}>{formatCell(row.values[item.key])}</TableCell>)}</TableRow>)}</TableBody></Table></details>
    </>}
  </section>;
}
