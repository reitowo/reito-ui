import { useEffect, useState } from 'react';
import { Palette, Sun, Moon, Monitor, Layers, RotateCcw } from 'lucide-react';
import { themeTokens } from '@reito/tokens/themes';
import { Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, type ThemeColors, type ThemeMode } from '@reito/ui/basic';
import { readThemeColors } from './theme-preferences';
export function useThemePreferences() {
  const [colors, setColors] = useState(readThemeColors);
  useEffect(() => { try { localStorage.setItem('reito-colors', JSON.stringify(colors)); } catch { /* Session colors remain usable. */ } }, [colors]);
  return [colors, setColors] as const;
}
const title = (value: string) => value === 'graphite' ? 'Graphite' : value[0].toUpperCase() + value.slice(1);
function ColorDot({ value, action = false }: { value: string; action?: boolean }) {
  const color = value === 'graphite' ? 'var(--rui-text-muted)' : action && value === 'neutral' ? 'var(--rui-text)' : themeTokens.paletteVariables[value]['500'];
  return <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{backgroundColor:color}}/>;
}
const modeOptions = [{ value:'light', label:'浅色', Icon:Sun }, { value:'dark', label:'深色', Icon:Moon }, { value:'system', label:'跟随系统', Icon:Monitor }] as const;
/** Shared Lab header control: one entry, color submenus and mode radios. */
export function ThemeControls({ colors, onChange, mode, onModeChange }: { colors: Partial<ThemeColors>; onChange: (colors: Partial<ThemeColors>) => void; mode: ThemeMode; onModeChange: (mode: ThemeMode) => void }) {
  const primary = colors.primary ?? 'neutral', neutral = colors.neutral ?? 'graphite';
  const primaryName = primary === 'neutral' ? '灰白' : title(primary);
  return <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" aria-label="主题"/>}><Palette className="text-primary" aria-hidden="true"/>主题</DropdownMenuTrigger><DropdownMenuContent align="end" className="w-60" aria-label="主题选择">
    <DropdownMenuSub><DropdownMenuSubTrigger aria-label={'主色 '+primaryName}><Palette aria-hidden="true"/><span className="flex-1">主色</span><span className="flex items-center gap-2 text-xs text-muted-foreground"><ColorDot value={primary} action/>{primaryName}</span></DropdownMenuSubTrigger><DropdownMenuSubContent className="w-44" aria-label="选择主色"><DropdownMenuRadioGroup value={primary} onValueChange={value=>onChange({...colors,primary:value as ThemeColors['primary']})}>{['neutral',...Object.keys(themeTokens.colors)].map(value=><DropdownMenuRadioItem key={value} value={value} closeOnClick={false} label={value==='neutral'?'灰白':title(value)}><ColorDot value={value} action/>{value==='neutral'?'灰白':title(value)}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuSubContent></DropdownMenuSub>
    <DropdownMenuSub><DropdownMenuSubTrigger aria-label={'底色色系 '+title(neutral)}><Layers aria-hidden="true"/><span className="flex-1">底色色系</span><span className="flex items-center gap-2 text-xs text-muted-foreground"><ColorDot value={neutral}/>{title(neutral)}</span></DropdownMenuSubTrigger><DropdownMenuSubContent className="w-44" aria-label="选择底色色系"><DropdownMenuRadioGroup value={neutral} onValueChange={value=>onChange({...colors,neutral:value as ThemeColors['neutral']})}>{['graphite',...Object.keys(themeTokens.neutrals)].map(value=><DropdownMenuRadioItem key={value} value={value} closeOnClick={false} label={title(value)}><ColorDot value={value}/>{title(value)}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuSubContent></DropdownMenuSub>
    <DropdownMenuSeparator/>
    <DropdownMenuGroup><DropdownMenuLabel className="flex items-center justify-between">明暗模式<span>{modeOptions.find(option=>option.value===mode)?.label}</span></DropdownMenuLabel><DropdownMenuRadioGroup value={mode} onValueChange={value=>onModeChange(value as ThemeMode)} aria-label="明暗模式" className="flex gap-1">{modeOptions.map(({value,label,Icon})=><DropdownMenuRadioItem key={value} value={value} label={label} aria-label={label} title={label} closeOnClick={false} className="flex-1 justify-center px-2 text-muted-foreground aria-checked:bg-accent aria-checked:text-foreground [&_[data-slot=dropdown-menu-radio-item-indicator]]:hidden"><Icon aria-hidden="true"/><span className="sr-only">{label}</span></DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuGroup>
    <DropdownMenuSeparator/><DropdownMenuItem onClick={()=>{onChange({...colors,primary:'neutral',neutral:'graphite'});onModeChange('dark');}}><RotateCcw aria-hidden="true"/>恢复默认主题</DropdownMenuItem>
  </DropdownMenuContent></DropdownMenu>;
}
