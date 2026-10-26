import { useState } from 'react';
import { ReitoThemeProvider, type ThemeTokenOverrides } from '../theme.js';
import { Button } from '../primitives/button.js';
import { Input } from '../primitives/input.js';
import { Label } from '../primitives/label.js';
import { Checkbox } from '../primitives/checkbox.js';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../primitives/card.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../primitives/dropdown-menu.js';
import { SelectInput } from './select-input.js';

/** Shared Lab/Storybook example; all geometry changes use the public token API. */
export function ThemeTokenDemo() {
  const [larger, setLarger] = useState(false);
  const [buttonOnly, setButtonOnly] = useState(false);
  const [compactCard, setCompactCard] = useState(false);
  const [draft, setDraft] = useState('保留当前工作区');
  const [selected, setSelected] = useState('尚未操作');
  const tokens: ThemeTokenOverrides = {
    semantic: larger
      ? {
          'button-height': 'var(--rui-control-height-lg)',
          'control-height-sm': 'var(--rui-control-height-lg)',
        }
      : {},
    components: {
      button: buttonOnly ? { height: 'var(--rui-control-height-xs)' } : {},
      card: compactCard
        ? {
            'padding-x': 'var(--rui-compact-surface-padding-x)',
            'padding-y': 'var(--rui-compact-surface-padding-y)',
          }
        : {},
    },
  };
  return (
    <section id="theme-component-tokens" className="grid gap-4" aria-label="组件 token 继承示例">
      <div className="grid gap-1">
        <h2 className="font-medium">共享尺寸与组件微调</h2>
        <p className="text-sm text-muted-foreground">
          调整共享动作尺寸，按钮和单行菜单一起变化。组件覆盖只影响本区域，输入内容保持不变。
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1">
          <Label htmlFor="token-action-size">共享动作尺寸</Label>
          <SelectInput
            id="token-action-size"
            aria-label="共享动作尺寸"
            value={larger ? 'larger' : 'default'}
            onValueChange={(value) => setLarger(value === 'larger')}
            options={[
              { value: 'default', label: '默认尺寸' },
              { value: 'larger', label: '增加一级' },
            ]}
          />
        </div>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={buttonOnly}
            onCheckedChange={(value) => setButtonOnly(Boolean(value))}
          />
          仅按钮覆盖为 XS
        </label>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={compactCard}
            onCheckedChange={(value) => setCompactCard(Boolean(value))}
          />
          卡片使用紧凑面板内距
        </label>
      </div>
      <ReitoThemeProvider tokens={tokens}>
        <Card aria-label="局部 token 卡片">
          <CardHeader className="border-b">
            <CardTitle>继承同一套规则</CardTitle>
            <CardDescription>标题、内容和操作区使用同一组卡片内距。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="token-workspace">Token 示例工作区</Label>
              <Input
                id="token-workspace"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              输入框保持表单尺寸，动作控件使用较小的共享尺度。
            </p>
          </CardContent>
          <CardFooter className="flex-wrap gap-2">
            <Button onClick={() => setSelected('已保存当前示例')}>Token 示例保存</Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                Token 示例菜单
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelected('已打开工作区')}>
                  打开工作区
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelected('已查看设置')}>
                  查看设置
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelected('已查看详细说明')}>
                  <span className="grid gap-0.5">
                    <span>带说明的操作</span>
                    <span className="text-xs text-muted-foreground">多行内容自然增加高度</span>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>暂不可用</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ReitoThemeProvider>
              <Button variant="ghost" onClick={() => setSelected('嵌套作用域继承成功')}>
                嵌套继承操作
              </Button>
            </ReitoThemeProvider>
          </CardFooter>
        </Card>
      </ReitoThemeProvider>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setLarger(false);
            setButtonOnly(false);
            setCompactCard(false);
          }}
        >
          重置尺寸示例
        </Button>
        <output className="text-xs text-muted-foreground">{selected} · 改动不会影响外层控件</output>
      </div>
    </section>
  );
}
