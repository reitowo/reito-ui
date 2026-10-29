import { useState } from 'react';
import {
  Checkbox, Input, Textarea, SelectInput, InputGroup, InputGroupInput,
  InputGroupAddon, NumberField,
} from '@reito/ui/basic';

export function ValidationGlowExample() {
  const [invalid, setInvalid] = useState(true);
  return <div className="grid max-w-xl gap-4">
    <label className="flex items-center gap-2"><Checkbox checked={invalid} onCheckedChange={value => setInvalid(Boolean(value))}/>显示错误状态</label>
    <div className="grid gap-3 sm:grid-cols-2">
      <Input aria-label="渐变输入框" aria-invalid={invalid} defaultValue="保留当前输入"/>
      <SelectInput aria-label="渐变选择器" aria-invalid={invalid} defaultValue="local" options={[{value:'local',label:'本地工作区'},{value:'isolated',label:'隔离工作区'}]}/>
      <Textarea aria-label="渐变多行输入" aria-invalid={invalid} defaultValue="保留当前说明"/>
      <InputGroup><InputGroupAddon>目录</InputGroupAddon><InputGroupInput aria-label="渐变组合输入" aria-invalid={invalid} defaultValue="~/workspace"/></InputGroup>
      <NumberField label="渐变数值输入" defaultValue={3} error={invalid ? '请确认这个数值。' : undefined}/>
    </div>
    <p className="text-xs text-muted-foreground">错误提示沿内边缘淡出；键盘焦点独立显示，切换错误状态保留输入内容。</p>
  </div>;
}
