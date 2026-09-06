import { tokenMetrics } from "@reito/tokens/metrics";
import * as React from "react";
import { ToastProvider, useToastManager } from './feedback.js';
import { AsyncCombobox, type AsyncComboboxOption } from './async-combobox.js';
import { AsyncMultiSelect } from './async-multi-select.js';
import { InputTags } from './input-tags.js';
import { MultiSelect } from './multi-select.js';
import { NumberField } from './number-field.js';
import { Meter } from './meter.js';
import { ColorPicker } from './color-picker.js';
import { InputDate } from './input-date.js';
import { InputTime, formatTimeValue, type TimeValue } from './input-time.js';
import { DateTimePicker, formatLocalDateTime, type LocalDateTimeValue } from './date-time-picker.js';
import {
  ArrowUp,
  Bold,
  Check,
  ChevronDown,
  FileText,
  Folder,
  Inbox,
  Info,
  Italic,
  Plus,
  Search,
  Settings,
  Terminal,
  Underline,
  X,
} from "lucide-react";
import * as P from "../primitives/index.js";

function Stack({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4 text-sm">
      {children}
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}
function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
  );
}

export function ButtonDemo() {
  const [count, setCount] = React.useState(0);
  return (
    <Stack>
      <Row>
        <P.Button onClick={() => setCount(count + 1)}>保存更改</P.Button>
        <P.Button variant="secondary">次要操作</P.Button>
        <P.Button variant="outline">描边按钮</P.Button>
        <P.Button variant="ghost">轻量操作</P.Button>
        <P.Button variant="link">查看文档</P.Button>
        <P.Button variant="destructive">移除</P.Button>
      </Row>
      <Row>
        <P.Button size="xs">XS</P.Button>
        <P.Button size="sm">Small</P.Button>
        <P.Button>Default</P.Button>
        <P.Button size="lg">Large</P.Button>
        <P.Button size="icon" aria-label="添加项目">
          <Plus />
        </P.Button>
        <P.Button disabled>不可用</P.Button>
        <P.Button disabled aria-busy="true">
          <P.Spinner />
          保存中
        </P.Button>
      </Row>
      <output aria-live="polite">已保存 {count} 次</output>
    </Stack>
  );
}
export function ButtonGroupDemo() {
  const [page, setPage] = React.useState(2);
  return (
    <P.ButtonGroup aria-label="浏览记录">
      <P.Button
        variant="outline"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        上一页
      </P.Button>
      <P.ButtonGroupText>{page} / 5</P.ButtonGroupText>
      <P.Button
        variant="outline"
        disabled={page === 5}
        onClick={() => setPage(page + 1)}
      >
        下一页
      </P.Button>
    </P.ButtonGroup>
  );
}
export function BadgeDemo() {
  return (
    <Row>
      <P.Badge>默认</P.Badge>
      <P.Badge variant="secondary">草稿</P.Badge>
      <P.Badge variant="outline">TypeScript</P.Badge>
      <P.Badge variant="destructive">失败</P.Badge>
      <P.Badge variant="secondary">
        <Check />
        已完成
      </P.Badge>
    </Row>
  );
}
export function InputDemo() {
  const id = React.useId();
  const [value, setValue] = React.useState("");
  return (
    <Stack>
      <P.Field>
        <P.FieldLabel htmlFor={id}>项目名称</P.FieldLabel>
        <P.Input
          id={id}
          placeholder="例如：个人工作台"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <P.FieldDescription>
          支持中文输入；这里不会提交到外部服务。
        </P.FieldDescription>
      </P.Field>
      <P.Input
        aria-label="无效项目名称"
        aria-invalid="true"
        defaultValue="已有同名项目"
      />
      <P.Input aria-label="只读项目编号" readOnly value="RUI-003" />
      <P.Input aria-label="禁用输入" disabled placeholder="不可编辑" />
      <output>当前：{value || "尚未输入"}</output>
    </Stack>
  );
}
export function InputTagsDemo() {
  const [value, setValue] = React.useState(['React', 'TypeScript']);
  return <Stack>
    <InputTags label="项目标签" value={value} onValueChange={setValue} maxTags={5} description="输入任意内容后按 Enter 或逗号创建；点击标签文字可编辑。" />
    <output>当前标签：{value.join(', ') || '无'}</output>
  </Stack>;
}
export function ColorPickerDemo() {
  const [value, setValue] = React.useState('#4F7DFFFF');
  return <Stack>
    <ColorPicker label="界面强调色" value={value} onValueChange={setValue} allowAlpha presets={['#4F7DFF', '#29A36A', '#C58A21', '#B64655', '#8A63D2']} description="可直接输入 HEX、RGB 或 HSL；打开色板后调整区域、色相、透明度与通道。" />
    <output className="font-mono text-xs text-muted-foreground">当前颜色：{value}</output>
  </Stack>;
}
export function InputDateDemo() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 8, 7));
  return <Stack>
    <InputDate label="交付日期" value={value} onValueChange={setValue} min={new Date(2026, 0, 1)} max={new Date(2027, 11, 31)} description="分段输入本地日历日；方向键调整，日历与文本保持同步。" />
    <output className="font-mono text-xs text-muted-foreground">当前日期：{value ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}` : '未选择'}</output>
  </Stack>;
}
export function InputTimeDemo() {
  const [value, setValue] = React.useState<TimeValue | null>({ hour: 9, minute: 30, second: 0 });
  return <Stack>
    <InputTime label="提醒时间" value={value} onValueChange={setValue} minuteStep={5} description="纯时间值，不附带任意日期；方向键按分段与步进调整。" />
    <output className="font-mono text-xs text-muted-foreground">当前时间：{formatTimeValue(value) || '未选择'}</output>
  </Stack>;
}
export function DateTimePickerDemo() {
  const [value, setValue] = React.useState<LocalDateTimeValue | null>({ date: new Date(2026, 8, 7), time: { hour: 9, minute: 30 } });
  return <Stack>
    <DateTimePicker label="计划执行时间" value={value} onValueChange={setValue} minuteStep={5} description="本地日期时间；不隐式附加浏览器时区或 UTC 标记。" />
    <output className="font-mono text-xs text-muted-foreground">当前：{formatLocalDateTime(value) || '未选择'}</output>
  </Stack>;
}
const asyncTechnologyOptions: AsyncComboboxOption[] = [
  { value: 'react', label: 'React', description: '界面组件' },
  { value: 'typescript', label: 'TypeScript', description: '类型系统' },
  { value: 'tailwind', label: 'Tailwind CSS', description: '样式工具' },
  { value: 'storybook', label: 'Storybook', description: '组件工作台' },
];
export function AsyncComboboxDemo() {
  const [value, setValue] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  return <Stack><AsyncCombobox label="异步查找技术栈" query={query} onQueryChange={setQuery} value={value} onValueChange={setValue} debounceMs={120} loadOptions={async (term, { signal }) => { await new Promise<void>((resolve, reject) => { const timer = window.setTimeout(resolve, 180); signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true }); }); return asyncTechnologyOptions.filter(option => option.label.toLocaleLowerCase().includes(term.trim().toLocaleLowerCase())); }} description="查询由宿主回调提供；组件取消旧请求并忽略过期结果。" /><output>query={JSON.stringify(query)} · value={value ?? 'null'}</output></Stack>;
}
export function AsyncMultiSelectDemo() {
  const [value, setValue] = React.useState(['react']);
  const [query, setQuery] = React.useState('');
  return <Stack><AsyncMultiSelect label="异步选择技术栈" query={query} onQueryChange={setQuery} value={value} onValueChange={setValue} selectedOptions={asyncTechnologyOptions.filter(option => value.includes(option.value))} debounceMs={120} loadOptions={async (term, { signal }) => { await new Promise<void>((resolve, reject) => { const timer = window.setTimeout(resolve, 180); signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true }); }); return asyncTechnologyOptions.filter(option => option.label.toLocaleLowerCase().includes(term.trim().toLocaleLowerCase())); }} description="当前查询结果变化时，已选标签继续保留。" /><output>query={JSON.stringify(query)} · value={JSON.stringify(value)}</output></Stack>;
}
export function TextareaDemo() {
  const [value, setValue] = React.useState("");
  return (
    <Stack>
      <P.Textarea
        aria-label="任务说明"
        placeholder="描述你准备完成的工作…"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Note>{value.length} 字 · 中文多行编辑</Note>
      <P.Textarea
        aria-label="不可编辑的说明"
        disabled
        defaultValue="已归档任务"
      />
    </Stack>
  );
}
export function LabelDemo() {
  const id = React.useId();
  return (
    <P.Field className="max-w-sm">
      <P.Label htmlFor={id}>工作目录</P.Label>
      <P.Input id={id} defaultValue="~/projects/reito" />
    </P.Field>
  );
}
export function FieldDemo() {
  const id = React.useId();
  return (
    <P.FieldSet className="max-w-sm">
      <P.FieldLegend>工作区设置</P.FieldLegend>
      <P.FieldGroup>
        <P.Field>
          <P.FieldLabel htmlFor={`${id}-name`}>名称</P.FieldLabel>
          <P.Input id={`${id}-name`} defaultValue="Reito UI" />
          <P.FieldDescription>仅用于本地展示。</P.FieldDescription>
        </P.Field>
        <P.Field data-invalid="true">
          <P.FieldLabel htmlFor={`${id}-path`}>目录</P.FieldLabel>
          <P.Input
            id={`${id}-path`}
            aria-invalid="true"
            aria-describedby={`${id}-error`}
            defaultValue=""
          />
          <P.FieldError id={`${id}-error`}>请选择一个有效目录。</P.FieldError>
        </P.Field>
      </P.FieldGroup>
    </P.FieldSet>
  );
}
export function InputGroupDemo() {
  return (
    <Stack>
      <P.InputGroup>
        <P.InputGroupAddon>
          <Search />
        </P.InputGroupAddon>
        <P.InputGroupInput aria-label="搜索组件" placeholder="搜索组件…" />
        <P.InputGroupAddon align="inline-end">
          <P.Kbd>⌘ K</P.Kbd>
        </P.InputGroupAddon>
      </P.InputGroup>
      <P.InputGroup>
        <P.InputGroupTextarea aria-label="附加说明" placeholder="添加说明…" />
        <P.InputGroupAddon align="block-end">
          <P.InputGroupText>本地示例</P.InputGroupText>
          <P.InputGroupButton
            className="ml-auto"
            variant="default"
            size="icon-sm"
            aria-label="添加说明"
          >
            <ArrowUp />
          </P.InputGroupButton>
        </P.InputGroupAddon>
      </P.InputGroup>
    </Stack>
  );
}
export function CheckboxDemo() {
  const id = React.useId();
  const [checked, setChecked] = React.useState(false);
  return (
    <Stack>
      <Row>
        <P.Checkbox id={id} checked={checked} onCheckedChange={setChecked} />
        <P.Label htmlFor={id}>保存本地草稿</P.Label>
      </Row>
      <Row>
        <P.Checkbox aria-label="部分选中" indeterminate />
        <span>部分选中</span>
        <P.Checkbox aria-label="禁用复选框" disabled defaultChecked />
        <span>已锁定</span>
        <P.Checkbox aria-label="需要确认" aria-invalid="true" />
      </Row>
      <output>{checked ? "草稿保存已开启" : "草稿保存已关闭"}</output>
    </Stack>
  );
}
export function SwitchDemo() {
  const id = React.useId();
  const [checked, setChecked] = React.useState(true);
  return (
    <Stack>
      <Row>
        <P.Switch id={id} checked={checked} onCheckedChange={setChecked} />
        <P.Label htmlFor={id}>自动保存</P.Label>
        <P.Switch size="sm" aria-label="紧凑开关" defaultChecked />
        <P.Switch disabled aria-label="禁用开关" />
      </Row>
      <output>{checked ? "自动保存开启" : "自动保存关闭"}</output>
    </Stack>
  );
}
export function RadioGroupDemo() {
  const id = React.useId();
  const [value, setValue] = React.useState("local");
  return (
    <Stack>
      <P.RadioGroup
        aria-label="执行位置"
        value={value}
        onValueChange={setValue}
      >
        {[
          ["local", "本地"],
          ["worktree", "隔离工作区"],
          ["cloud", "云端（不可用）"],
        ].map(([key, label]) => (
          <Row key={key}>
            <P.RadioGroupItem
              id={`${id}-${key}`}
              value={key}
              disabled={key === "cloud"}
            />
            <P.Label htmlFor={`${id}-${key}`}>{label}</P.Label>
          </Row>
        ))}
      </P.RadioGroup>
      <Note>当前：{value}</Note>
    </Stack>
  );
}
export function SliderDemo() {
  const [value, setValue] = React.useState<number[]>([60]);
  return (
    <Stack>
      <P.Label>上下文预算：{value[0]}%</P.Label>
      <P.Slider
        aria-label="上下文预算"
        value={value}
        onValueChange={(next) => setValue(Array.isArray(next) ? next : [next])}
      />
      <P.Slider aria-label="禁用范围" defaultValue={[20, 80]} disabled />
    </Stack>
  );
}
export function ToggleDemo() {
  return (
    <Row>
      <P.Toggle aria-label="粗体" variant="outline">
        <Bold />
      </P.Toggle>
      <P.Toggle aria-label="斜体">
        <Italic />
      </P.Toggle>
      <P.Toggle aria-label="禁用下划线" disabled>
        <Underline />
      </P.Toggle>
    </Row>
  );
}
export function ToggleGroupDemo() {
  return (
    <P.ToggleGroup
      multiple
      defaultValue={["bold"]}
      aria-label="文字格式"
      variant="outline"
      spacing={0}
    >
      <P.ToggleGroupItem value="bold" aria-label="粗体">
        <Bold />
      </P.ToggleGroupItem>
      <P.ToggleGroupItem value="italic" aria-label="斜体">
        <Italic />
      </P.ToggleGroupItem>
      <P.ToggleGroupItem value="underline" aria-label="下划线">
        <Underline />
      </P.ToggleGroupItem>
    </P.ToggleGroup>
  );
}
export function SelectDemo() {
  const [value, setValue] = React.useState<string | null>("local");
  const options = [
    { value: "local", label: "本地工作区" },
    { value: "worktree", label: "隔离工作区" },
    { value: "cloud", label: "云端（不可用）" },
  ];
  return (
    <Stack>
      <P.Select items={options} value={value} onValueChange={setValue}>
        <P.SelectTrigger aria-label="选择执行位置" className="w-60">
          <P.SelectValue placeholder="选择位置" />
        </P.SelectTrigger>
        <P.SelectContent>
          <P.SelectGroup>
            <P.SelectLabel>执行位置</P.SelectLabel>
            {options.map((option) => (
              <P.SelectItem
                key={option.value}
                value={option.value}
                disabled={option.value === "cloud"}
              >
                {option.label}
              </P.SelectItem>
            ))}
          </P.SelectGroup>
        </P.SelectContent>
      </P.Select>
      <P.Select disabled>
        <P.SelectTrigger aria-label="禁用选择器">
          <P.SelectValue placeholder="当前不可用" />
        </P.SelectTrigger>
      </P.Select>
      <output>已选择：{value}</output>
    </Stack>
  );
}
export function ComboboxDemo() {
  const items = ["React", "TypeScript", "Tailwind CSS", "Storybook", "Base UI"];
  const [value, setValue] = React.useState<string | null>(null);
  return (
    <Stack>
      <P.Combobox items={items} value={value} onValueChange={setValue}>
        <P.ComboboxInput
          aria-label="查找技术栈"
          placeholder="输入名称筛选…"
          showClear
        />
        <P.ComboboxContent>
          <P.ComboboxEmpty>没有匹配项</P.ComboboxEmpty>
          <P.ComboboxList>
            {(item: string) => (
              <P.ComboboxItem key={item} value={item}>
                {item}
              </P.ComboboxItem>
            )}
          </P.ComboboxList>
        </P.ComboboxContent>
      </P.Combobox>
      <output>已选择：{value ?? "尚未选择"}</output>
    </Stack>
  );
}
export function AccordionDemo() {
  return (
    <P.Accordion className="w-full max-w-xl" defaultValue={["tokens"]}>
      <P.AccordionItem value="tokens">
        <P.AccordionTrigger>如何统一主题？</P.AccordionTrigger>
        <P.AccordionContent>
          基础组件读取共享语义颜色、圆角与字体，应用只切换主题。
        </P.AccordionContent>
      </P.AccordionItem>
      <P.AccordionItem value="reuse">
        <P.AccordionTrigger>如何复用组件？</P.AccordionTrigger>
        <P.AccordionContent>
          保留官方组合 API，通过业务层封装具体流程。
        </P.AccordionContent>
      </P.AccordionItem>
      <P.AccordionItem value="disabled" disabled>
        <P.AccordionTrigger>暂不可用的章节</P.AccordionTrigger>
        <P.AccordionContent>禁用内容</P.AccordionContent>
      </P.AccordionItem>
    </P.Accordion>
  );
}
export function CollapsibleDemo() {
  return (
    <P.Collapsible className="w-full max-w-md">
      <P.CollapsibleTrigger render={<P.Button variant="ghost" />}>
        <Folder />
        展开 3 个文件
        <ChevronDown />
      </P.CollapsibleTrigger>
      <P.CollapsibleContent>
        <div className="mt-2 space-y-2 rounded-lg border p-3 font-mono text-xs">
          <p>tokens.json</p>
          <p>theme.css</p>
          <p>button.tsx</p>
        </div>
      </P.CollapsibleContent>
    </P.Collapsible>
  );
}
export function TabsDemo() {
  return (
    <P.Tabs defaultValue="preview" className="w-full max-w-lg">
      <P.TabsList aria-label="查看方式">
        <P.TabsTrigger value="preview">预览</P.TabsTrigger>
        <P.TabsTrigger value="code">代码</P.TabsTrigger>
        <P.TabsTrigger value="history" disabled>
          历史
        </P.TabsTrigger>
      </P.TabsList>
      <P.TabsContent value="preview" className="p-4">
        组件预览内容
      </P.TabsContent>
      <P.TabsContent value="code" className="p-4 font-mono text-xs">
        {'<Button variant="outline">Save</Button>'}
      </P.TabsContent>
    </P.Tabs>
  );
}
export function DialogDemo() {
  const [open, setOpen] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const id = React.useId();
  return (
    <Stack>
      <P.Dialog open={open} onOpenChange={setOpen}>
        <P.DialogTrigger render={<P.Button variant="outline" />}>
          编辑项目
        </P.DialogTrigger>
        <P.DialogContent>
          <P.DialogHeader>
            <P.DialogTitle>编辑项目</P.DialogTitle>
            <P.DialogDescription>
              更新这个本地示例的显示名称。
            </P.DialogDescription>
          </P.DialogHeader>
          <P.Field>
            <P.FieldLabel htmlFor={id}>项目名称</P.FieldLabel>
            <P.Input id={id} defaultValue="Reito UI" />
          </P.Field>
          <P.DialogFooter>
            <P.DialogClose render={<P.Button variant="outline" />}>
              取消
            </P.DialogClose>
            <P.Button
              onClick={() => {
                setSaved(true);
                setOpen(false);
              }}
            >
              确认保存
            </P.Button>
          </P.DialogFooter>
        </P.DialogContent>
      </P.Dialog>
      <output aria-live="polite">{saved ? "项目已保存" : "尚未修改"}</output>
    </Stack>
  );
}
export function AlertDialogDemo() {
  const [open, setOpen] = React.useState(false);
  const [archived, setArchived] = React.useState(false);
  return (
    <Stack>
      <P.AlertDialog open={open} onOpenChange={setOpen}>
        <P.AlertDialogTrigger render={<P.Button variant="destructive" />}>
          归档示例任务
        </P.AlertDialogTrigger>
        <P.AlertDialogContent>
          <P.AlertDialogHeader>
            <P.AlertDialogTitle>归档任务？</P.AlertDialogTitle>
            <P.AlertDialogDescription>
              只改变当前示例状态，可使用重置按钮恢复。
            </P.AlertDialogDescription>
          </P.AlertDialogHeader>
          <P.AlertDialogFooter>
            <P.AlertDialogCancel>取消</P.AlertDialogCancel>
            <P.AlertDialogAction
              onClick={() => {
                setArchived(true);
                setOpen(false);
              }}
            >
              确认归档
            </P.AlertDialogAction>
          </P.AlertDialogFooter>
        </P.AlertDialogContent>
      </P.AlertDialog>
      <Row>
        <output>{archived ? "已归档" : "进行中"}</output>
        {archived && (
          <P.Button variant="ghost" onClick={() => setArchived(false)}>
            重置
          </P.Button>
        )}
      </Row>
    </Stack>
  );
}
export function DropdownMenuDemo() {
  const [action, setAction] = React.useState("尚未执行");
  const [pinned, setPinned] = React.useState(false);
  return (
    <Stack>
      <P.DropdownMenu>
        <P.DropdownMenuTrigger render={<P.Button variant="outline" />}>
          任务操作
          <ChevronDown />
        </P.DropdownMenuTrigger>
        <P.DropdownMenuContent>
          <P.DropdownMenuGroup>
            <P.DropdownMenuLabel>当前任务</P.DropdownMenuLabel>
            <P.DropdownMenuItem onClick={() => setAction("已复制任务链接")}>
              复制链接<P.DropdownMenuShortcut>⌘ C</P.DropdownMenuShortcut>
            </P.DropdownMenuItem>
            <P.DropdownMenuCheckboxItem
              checked={pinned}
              onCheckedChange={setPinned}
            >
              置顶任务
            </P.DropdownMenuCheckboxItem>
            <P.DropdownMenuSeparator />
            <P.DropdownMenuItem disabled>发布到云端</P.DropdownMenuItem>
            <P.DropdownMenuItem
              variant="destructive"
              onClick={() => setAction("已归档示例任务")}
            >
              归档任务
            </P.DropdownMenuItem>
          </P.DropdownMenuGroup>
        </P.DropdownMenuContent>
      </P.DropdownMenu>
      <output>
        {action}
        {pinned ? " · 已置顶" : ""}
      </output>
    </Stack>
  );
}
export function ContextMenuDemo() {
  const [value, setValue] = React.useState("在此区域右键");
  return (
    <P.ContextMenu>
      <P.ContextMenuTrigger className="flex h-36 w-full max-w-md items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        {value}
      </P.ContextMenuTrigger>
      <P.ContextMenuContent>
        <P.ContextMenuItem onClick={() => setValue("已打开任务")}>
          打开任务
        </P.ContextMenuItem>
        <P.ContextMenuItem onClick={() => setValue("已复制路径")}>
          复制路径
        </P.ContextMenuItem>
        <P.ContextMenuSeparator />
        <P.ContextMenuItem disabled>恢复历史版本</P.ContextMenuItem>
      </P.ContextMenuContent>
    </P.ContextMenu>
  );
}
export function PopoverDemo() {
  const id = React.useId();
  return (
    <P.Popover>
      <P.PopoverTrigger render={<P.Button variant="outline" />}>
        显示设置
      </P.PopoverTrigger>
      <P.PopoverContent>
        <P.PopoverHeader>
          <P.PopoverTitle>显示设置</P.PopoverTitle>
          <P.PopoverDescription>
            调整当前工作区的显示方式。
          </P.PopoverDescription>
        </P.PopoverHeader>
        <P.Field orientation="horizontal">
          <P.Label htmlFor={id}>显示行号</P.Label>
          <P.Switch id={id} defaultChecked />
        </P.Field>
      </P.PopoverContent>
    </P.Popover>
  );
}
export function TooltipDemo() {
  return (
    <P.TooltipProvider delay={tokenMetrics["tooltip-delay"]}>
      <P.Tooltip>
        <P.TooltipTrigger
          render={
            <P.Button variant="outline" size="icon" aria-label="新增任务" />
          }
        >
          <Plus />
        </P.TooltipTrigger>
        <P.TooltipContent>
          新增任务<P.Kbd>⌘ N</P.Kbd>
        </P.TooltipContent>
      </P.Tooltip>
    </P.TooltipProvider>
  );
}
export function HoverCardDemo() {
  return (
    <P.HoverCard>
      <P.HoverCardTrigger
        render={
          <a
            href="#component-details"
            onClick={(event) => event.preventDefault()}
            className="text-sm underline underline-offset-4"
          />
        }
      >
        Reito UI
      </P.HoverCardTrigger>
      <P.HoverCardContent>
        <div className="space-y-2">
          <p className="font-medium">Reito UI 组件库</p>
          <p className="text-sm text-muted-foreground">
            用于桌面工作区的共享基础组件、复杂结构与 AI 交互模式。
          </p>
          <P.Badge variant="secondary">本地文档</P.Badge>
        </div>
      </P.HoverCardContent>
    </P.HoverCard>
  );
}
export function SheetDemo() {
  return (
    <P.Sheet>
      <P.SheetTrigger render={<P.Button variant="outline" />}>
        打开任务详情
      </P.SheetTrigger>
      <P.SheetContent>
        <P.SheetHeader>
          <P.SheetTitle>任务详情</P.SheetTitle>
          <P.SheetDescription>按需展示的辅助面板。</P.SheetDescription>
        </P.SheetHeader>
        <div className="space-y-4 p-4">
          <P.Badge variant="secondary">本地草稿</P.Badge>
          <p className="text-sm">主题与组件已准备好，可继续查看变体和状态。</p>
        </div>
        <P.SheetFooter>
          <P.SheetClose render={<P.Button variant="outline" />}>
            完成
          </P.SheetClose>
        </P.SheetFooter>
      </P.SheetContent>
    </P.Sheet>
  );
}
export function CardDemo() {
  const [connected, setConnected] = React.useState(false);
  return (
    <P.Card className="w-full max-w-sm">
      <P.CardHeader>
        <P.CardTitle>本地工作区</P.CardTitle>
        <P.CardDescription>
          独立的示例卡片，包含标题、内容和操作。
        </P.CardDescription>
        <P.CardAction>
          <P.Badge variant="outline">Demo</P.Badge>
        </P.CardAction>
      </P.CardHeader>
      <P.CardContent>
        <p className="text-sm">
          {connected
            ? "示例工作区已打开。"
            : "确认布局后，继续完善自己的组件。"}
        </p>
      </P.CardContent>
      <P.CardFooter>
        <P.Button onClick={() => setConnected(!connected)}>
          {connected ? "关闭工作区" : "打开工作区"}
        </P.Button>
      </P.CardFooter>
    </P.Card>
  );
}
export function AlertDemo() {
  return (
    <Stack>
      <P.Alert>
        <Info />
        <P.AlertTitle>修改已保存在本地</P.AlertTitle>
        <P.AlertDescription>
          可以继续预览主题、密度和交互状态。
        </P.AlertDescription>
      </P.Alert>
      <P.Alert variant="destructive">
        <P.AlertTitle>验证未通过</P.AlertTitle>
        <P.AlertDescription>请补充项目名称后重试。</P.AlertDescription>
      </P.Alert>
    </Stack>
  );
}
export function EmptyDemo() {
  const [created, setCreated] = React.useState(false);
  return (
    <P.Empty className="max-w-lg border border-dashed">
      <P.EmptyHeader>
        <P.EmptyMedia variant="icon">
          <Inbox />
        </P.EmptyMedia>
        <P.EmptyTitle>{created ? "示例任务已创建" : "还没有任务"}</P.EmptyTitle>
        <P.EmptyDescription>
          {created
            ? "这个操作仅更新本地展示。"
            : "创建第一个任务，开始整理你的工作。"}
        </P.EmptyDescription>
      </P.EmptyHeader>
      <P.EmptyContent>
        <P.Button onClick={() => setCreated(!created)}>
          {created ? "重置示例" : "创建任务"}
        </P.Button>
      </P.EmptyContent>
    </P.Empty>
  );
}
export function AvatarDemo() {
  return (
    <Row>
      <P.Avatar size="sm">
        <P.AvatarFallback>R</P.AvatarFallback>
      </P.Avatar>
      <P.Avatar>
        <P.AvatarFallback>RU</P.AvatarFallback>
        <P.AvatarBadge>
          <Check />
        </P.AvatarBadge>
      </P.Avatar>
      <P.Avatar size="lg">
        <P.AvatarFallback>UI</P.AvatarFallback>
      </P.Avatar>
      <P.AvatarGroup>
        {["A", "B", "C"].map((name) => (
          <P.Avatar key={name}>
            <P.AvatarFallback>{name}</P.AvatarFallback>
          </P.Avatar>
        ))}
        <P.AvatarGroupCount>+2</P.AvatarGroupCount>
      </P.AvatarGroup>
    </Row>
  );
}
export function SkeletonDemo() {
  return (
    <div
      className="flex w-full max-w-sm gap-3"
      role="status"
      aria-label="正在载入任务"
    >
      <P.Skeleton className="size-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <P.Skeleton className="h-4 w-3/4" />
        <P.Skeleton className="h-4 w-full" />
        <P.Skeleton className="h-4 w-1/2" />
      </div>
      <span className="sr-only">正在载入任务</span>
    </div>
  );
}
export function SpinnerDemo() {
  return (
    <Row>
      <P.Spinner aria-label="正在加载" />
      <span>正在加载组件…</span>
      <P.Button disabled>
        <P.Spinner />
        处理中
      </P.Button>
    </Row>
  );
}
export function SeparatorDemo() {
  return (
    <Stack>
      <p>组件库 / 基础层</p>
      <P.Separator />
      <div className="flex h-5 items-center gap-3">
        <span>文档</span>
        <P.Separator orientation="vertical" />
        <span>示例</span>
        <P.Separator orientation="vertical" />
        <span>源码</span>
      </div>
    </Stack>
  );
}
export function ScrollAreaDemo() {
  return (
    <P.ScrollArea className="h-48 w-72 rounded-lg border" aria-label="文件列表">
      <div className="p-3">
        {Array.from({ length: 18 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-2 border-b py-2 text-sm last:border-0"
          >
            <FileText className="size-4 text-muted-foreground" />
            component-{String(index + 1).padStart(2, "0")}.tsx
          </div>
        ))}
      </div>
    </P.ScrollArea>
  );
}
export function ProgressDemo() {
  const [value, setValue] = React.useState(45);
  return (
    <Stack>
      <P.Progress value={value}>
        <P.ProgressLabel>组件检查</P.ProgressLabel>
        <P.ProgressValue />
      </P.Progress>
      <Row>
        <P.Button
          variant="outline"
          size="sm"
          onClick={() => setValue(Math.min(100, value + 10))}
        >
          增加进度
        </P.Button>
        <P.Button variant="ghost" size="sm" onClick={() => setValue(0)}>
          重置
        </P.Button>
      </Row>
    </Stack>
  );
}
export function TableDemo() {
  return (
    <P.Table>
      <P.TableCaption>本地组件清单示例</P.TableCaption>
      <P.TableHeader>
        <P.TableRow>
          <P.TableHead>组件</P.TableHead>
          <P.TableHead>类别</P.TableHead>
          <P.TableHead className="text-right">状态</P.TableHead>
        </P.TableRow>
      </P.TableHeader>
      <P.TableBody>
        {[
          ["Button", "基础"],
          ["DataTable", "复杂"],
          ["Message", "AI"],
        ].map(([name, kind]) => (
          <P.TableRow key={name}>
            <P.TableCell className="font-medium">{name}</P.TableCell>
            <P.TableCell>{kind}</P.TableCell>
            <P.TableCell className="text-right">
              <P.Badge variant="secondary">可预览</P.Badge>
            </P.TableCell>
          </P.TableRow>
        ))}
      </P.TableBody>
    </P.Table>
  );
}
export function PaginationDemo() {
  const [page, setPage] = React.useState(1);
  return (
    <Stack>
      <P.Pagination>
        <P.PaginationContent>
          <P.PaginationItem>
            <P.PaginationPrevious
              href="#previous"
              onClick={(event) => {
                event.preventDefault();
                setPage(Math.max(1, page - 1));
              }}
            />
          </P.PaginationItem>
          {[1, 2, 3].map((value) => (
            <P.PaginationItem key={value}>
              <P.PaginationLink
                href={`#page-${value}`}
                isActive={page === value}
                onClick={(event) => {
                  event.preventDefault();
                  setPage(value);
                }}
              >
                {value}
              </P.PaginationLink>
            </P.PaginationItem>
          ))}
          <P.PaginationItem>
            <P.PaginationNext
              href="#next"
              onClick={(event) => {
                event.preventDefault();
                setPage(Math.min(3, page + 1));
              }}
            />
          </P.PaginationItem>
        </P.PaginationContent>
      </P.Pagination>
      <Note>第 {page} 页</Note>
    </Stack>
  );
}
export function BreadcrumbDemo() {
  const [place, setPlace] = React.useState("Button");
  return (
    <Stack>
      <P.Breadcrumb>
        <P.BreadcrumbList>
          <P.BreadcrumbItem>
            <P.BreadcrumbLink
              href="#library"
              onClick={(event) => {
                event.preventDefault();
                setPlace("组件库");
              }}
            >
              组件库
            </P.BreadcrumbLink>
          </P.BreadcrumbItem>
          <P.BreadcrumbSeparator />
          <P.BreadcrumbItem>
            <P.BreadcrumbLink
              href="#basic"
              onClick={(event) => {
                event.preventDefault();
                setPlace("基础组件");
              }}
            >
              基础组件
            </P.BreadcrumbLink>
          </P.BreadcrumbItem>
          <P.BreadcrumbSeparator />
          <P.BreadcrumbItem>
            <P.BreadcrumbPage>Button</P.BreadcrumbPage>
          </P.BreadcrumbItem>
        </P.BreadcrumbList>
      </P.Breadcrumb>
      <Note>当前选择：{place}</Note>
    </Stack>
  );
}
export function CommandDemo() {
  const [selection, setSelection] = React.useState("尚未选择");
  return (
    <Stack>
      <P.Command className="max-w-md border">
        <P.CommandInput aria-label="搜索命令" placeholder="搜索命令…" />
        <P.CommandList>
          <P.CommandEmpty>没有匹配的命令。</P.CommandEmpty>
          <P.CommandGroup heading="工作区">
            <P.CommandItem onSelect={() => setSelection("新建任务")}>
              <Plus />
              新建任务<P.CommandShortcut>⌘ N</P.CommandShortcut>
            </P.CommandItem>
            <P.CommandItem onSelect={() => setSelection("打开设置")}>
              <Settings />
              打开设置
            </P.CommandItem>
            <P.CommandItem disabled>同步云端</P.CommandItem>
          </P.CommandGroup>
        </P.CommandList>
      </P.Command>
      <output>命令：{selection}</output>
    </Stack>
  );
}
export function ResizableDemo() {
  return (
    <P.ResizablePanelGroup
      orientation="horizontal"
      className="min-h-44 w-full max-w-xl rounded-lg border"
    >
      <P.ResizablePanel defaultSize="35%" minSize="20%">
        <div className="flex h-44 items-center justify-center p-3">导航</div>
      </P.ResizablePanel>
      <P.ResizableHandle withHandle aria-label="调整面板宽度" />
      <P.ResizablePanel defaultSize="65%" minSize="30%">
        <div className="flex h-44 items-center justify-center p-3">
          拖动分隔线，或聚焦后使用方向键
        </div>
      </P.ResizablePanel>
    </P.ResizablePanelGroup>
  );
}
export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 8, 6),
  );
  return (
    <Stack>
      <P.Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        defaultMonth={new Date(2026, 8, 1)}
        disabled={{ before: new Date(2026, 8, 1) }}
        className="rounded-lg border"
      />
      <output>
        已选日期：
        {date
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
          : "尚未选择"}
      </output>
    </Stack>
  );
}
export function SidebarDemo() {
  const [active, setActive] = React.useState("收件箱");
  return (
    <P.SidebarProvider
      className="min-h-80 overflow-hidden rounded-lg border"
    >
      <P.Sidebar collapsible="none" className="min-h-80">
        <P.SidebarHeader>
          <P.SidebarInput aria-label="搜索任务" placeholder="搜索任务…" />
        </P.SidebarHeader>
        <P.SidebarContent>
          <P.SidebarGroup>
            <P.SidebarGroupLabel>工作区</P.SidebarGroupLabel>
            <P.SidebarGroupContent>
              <P.SidebarMenu>
                {[
                  ["收件箱", Inbox],
                  ["任务", FileText],
                  ["设置", Settings],
                ].map(([label, icon]) => {
                  const Icon = icon as typeof Inbox;
                  return (
                    <P.SidebarMenuItem key={String(label)}>
                      <P.SidebarMenuButton
                        isActive={active === label}
                        onClick={() => setActive(String(label))}
                      >
                        <Icon />
                        <span>{String(label)}</span>
                      </P.SidebarMenuButton>
                    </P.SidebarMenuItem>
                  );
                })}
              </P.SidebarMenu>
            </P.SidebarGroupContent>
          </P.SidebarGroup>
        </P.SidebarContent>
        <P.SidebarFooter>
          <P.SidebarMenu>
            <P.SidebarMenuItem>
              <P.SidebarMenuButton>
                <P.Avatar size="sm">
                  <P.AvatarFallback>R</P.AvatarFallback>
                </P.Avatar>
                本地工作区
              </P.SidebarMenuButton>
            </P.SidebarMenuItem>
          </P.SidebarMenu>
        </P.SidebarFooter>
      </P.Sidebar>
      <div className="flex flex-1 items-center justify-center p-6 text-sm">
        {active}
      </div>
    </P.SidebarProvider>
  );
}
export function AspectRatioDemo() {
  return (
    <div className="w-full max-w-md">
      <P.AspectRatio
        ratio={16 / 9}
        className="flex items-center justify-center rounded-lg border bg-muted text-muted-foreground"
      >
        <div className="text-center">
          <Terminal className="mx-auto mb-2 size-8" />
          <p>16:9 预览区域</p>
        </div>
      </P.AspectRatio>
    </div>
  );
}
export function InputOTPDemo() {
  const [value, setValue] = React.useState("");
  return (
    <Stack>
      <P.InputOTP
        aria-label="六位验证码"
        maxLength={6}
        value={value}
        onChange={setValue}
      >
        <P.InputOTPGroup>
          {[0, 1, 2].map((index) => (
            <P.InputOTPSlot key={index} index={index} />
          ))}
        </P.InputOTPGroup>
        <P.InputOTPSeparator />
        <P.InputOTPGroup>
          {[3, 4, 5].map((index) => (
            <P.InputOTPSlot key={index} index={index} />
          ))}
        </P.InputOTPGroup>
      </P.InputOTP>
      <Note>
        {value.length === 6
          ? "输入已完成（仅本地示例）"
          : `已输入 ${value.length} / 6 位`}
      </Note>
    </Stack>
  );
}
export function ItemDemo() {
  const [installed, setInstalled] = React.useState(false);
  return (
    <P.Item variant="outline" className="max-w-xl">
      <P.ItemMedia variant="icon">
        <Folder />
      </P.ItemMedia>
      <P.ItemContent>
        <P.ItemTitle>个人组件库</P.ItemTitle>
        <P.ItemDescription>
          基础、复杂与 AI 组件共享一个主题。
        </P.ItemDescription>
      </P.ItemContent>
      <P.ItemActions>
        <P.Button
          variant="outline"
          size="sm"
          onClick={() => setInstalled(!installed)}
        >
          {installed ? "已添加" : "添加"}
        </P.Button>
      </P.ItemActions>
    </P.Item>
  );
}
export function KbdDemo() {
  return (
    <Row>
      <span>快速搜索</span>
      <P.KbdGroup>
        <P.Kbd>⌘</P.Kbd>
        <P.Kbd>K</P.Kbd>
      </P.KbdGroup>
      <span>换行</span>
      <P.Kbd>Shift ↵</P.Kbd>
      <span>关闭</span>
      <P.Kbd>Esc</P.Kbd>
    </Row>
  );
}
export function NativeSelectDemo() {
  const [value, setValue] = React.useState("system");
  return (
    <Stack>
      <P.NativeSelect
        aria-label="主题偏好"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      >
        <P.NativeSelectOption value="system">跟随系统</P.NativeSelectOption>
        <P.NativeSelectOption value="light">浅色</P.NativeSelectOption>
        <P.NativeSelectOption value="dark">深色</P.NativeSelectOption>
      </P.NativeSelect>
      <P.NativeSelect aria-label="禁用的原生选择器" disabled>
        <P.NativeSelectOption>不可用</P.NativeSelectOption>
      </P.NativeSelect>
      <Note>偏好：{value}</Note>
    </Stack>
  );
}
export function NavigationMenuDemo() {
  const [page, setPage] = React.useState("选择一个文档");
  return (
    <Stack>
      <P.NavigationMenu>
        <P.NavigationMenuList>
          <P.NavigationMenuItem>
            <P.NavigationMenuTrigger>组件文档</P.NavigationMenuTrigger>
            <P.NavigationMenuContent className="w-60">
              {["基础组件", "复杂组件", "AI 组件"].map((label) => (
                <P.NavigationMenuLink
                  key={label}
                  href={`#${label}`}
                  onClick={(event) => {
                    event.preventDefault();
                    setPage(label);
                  }}
                >
                  {label}
                </P.NavigationMenuLink>
              ))}
            </P.NavigationMenuContent>
          </P.NavigationMenuItem>
          <P.NavigationMenuItem>
            <P.NavigationMenuLink
              href="#tokens"
              onClick={(event) => {
                event.preventDefault();
                setPage("设计 Tokens");
              }}
            >
              设计 Tokens
            </P.NavigationMenuLink>
          </P.NavigationMenuItem>
        </P.NavigationMenuList>
      </P.NavigationMenu>
      <Note>{page}</Note>
    </Stack>
  );
}
export function MenubarDemo() {
  const [action, setAction] = React.useState("尚未执行");
  return (
    <Stack>
      <P.Menubar>
        <P.MenubarMenu>
          <P.MenubarTrigger>文件</P.MenubarTrigger>
          <P.MenubarContent>
            <P.MenubarItem onClick={() => setAction("新建任务")}>
              新建任务<P.MenubarShortcut>⌘ N</P.MenubarShortcut>
            </P.MenubarItem>
            <P.MenubarItem onClick={() => setAction("打开工作区")}>
              打开工作区
            </P.MenubarItem>
            <P.MenubarSeparator />
            <P.MenubarItem disabled>导出到云端</P.MenubarItem>
          </P.MenubarContent>
        </P.MenubarMenu>
        <P.MenubarMenu>
          <P.MenubarTrigger>查看</P.MenubarTrigger>
          <P.MenubarContent>
            <P.MenubarItem onClick={() => setAction("显示文档")}>
              显示文档
            </P.MenubarItem>
            <P.MenubarItem onClick={() => setAction("显示组件")}>
              显示组件
            </P.MenubarItem>
          </P.MenubarContent>
        </P.MenubarMenu>
      </P.Menubar>
      <Note>{action}</Note>
    </Stack>
  );
}

export interface BasicCatalogEntry {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
}
export const basicCatalog: BasicCatalogEntry[] = [
  {
    id: "button",
    name: "Button",
    description: "六种操作层级、尺寸、禁用与加载状态。",
    component: ButtonDemo,
  },
  {
    id: "button-group",
    name: "Button Group",
    description: "相邻操作、分隔与共享边缘。",
    component: ButtonGroupDemo,
  },
  {
    id: "badge",
    name: "Badge",
    description: "轻量标签、状态与图标组合。",
    component: BadgeDemo,
  },
  {
    id: "input",
    name: "Input",
    description: "文本输入、中文、只读、错误与禁用。",
    component: InputDemo,
  },
  {
    id: "input-tags",
    name: "InputTags",
    description: "任意标签创建、去重、上限、编辑与删除。",
    component: InputTagsDemo,
  },
  {
    id: "color-picker",
    name: "ColorPicker / ColorInput",
    description: "颜色文本、色板、通道、格式与透明度。",
    component: ColorPickerDemo,
  },
  {
    id: "input-date",
    name: "InputDate",
    description: "日期分段、locale 顺序、范围、日历与表单值。",
    component: InputDateDemo,
  },
  {
    id: "input-time",
    name: "InputTime",
    description: "时间分段、小时制、精度、步进、范围与表单值。",
    component: InputTimeDemo,
  },
  {
    id: "date-time-picker",
    name: "DateTimePicker",
    description: "本地日期时间、跨日范围、一致提交与序列化。",
    component: DateTimePickerDemo,
  },
  {
    id: "textarea",
    name: "Textarea",
    description: "多行编辑与字数反馈。",
    component: TextareaDemo,
  },
  {
    id: "label",
    name: "Label",
    description: "与控件显式关联的表单标签。",
    component: LabelDemo,
  },
  {
    id: "field",
    name: "Field",
    description: "标签、说明、错误与字段分组。",
    component: FieldDemo,
  },
  {
    id: "input-group",
    name: "Input Group",
    description: "前后缀、快捷键与输入操作。",
    component: InputGroupDemo,
  },
  {
    id: "checkbox",
    name: "Checkbox",
    description: "选中、部分选中、错误与禁用。",
    component: CheckboxDemo,
  },
  {
    id: "switch",
    name: "Switch",
    description: "即时布尔设置与紧凑变体。",
    component: SwitchDemo,
  },
  {
    id: "radio-group",
    name: "Radio Group",
    description: "互斥选项与键盘移动。",
    component: RadioGroupDemo,
  },
  {
    id: "slider",
    name: "Slider",
    description: "连续数值、范围与禁用状态。",
    component: SliderDemo,
  },
  {
    id: "toggle",
    name: "Toggle",
    description: "独立可切换操作。",
    component: ToggleDemo,
  },
  {
    id: "toggle-group",
    name: "Toggle Group",
    description: "可多选的工具栏按钮组。",
    component: ToggleGroupDemo,
  },
  {
    id: "select",
    name: "Select",
    description: "可控单选、分组与禁用选项。",
    component: SelectDemo,
  },
  {
    id: "combobox",
    name: "Combobox",
    description: "可搜索选项、清除与空结果。",
    component: ComboboxDemo,
  },
  {
    id: "async-combobox",
    name: "AsyncCombobox",
    description: "宿主异步查询、取消过期请求、重试与选中项缓存。",
    component: AsyncComboboxDemo,
  },
  {
    id: "async-multi-select",
    name: "AsyncMultiSelect",
    description: "宿主异步多选、过期请求保护与跨结果页标签缓存。",
    component: AsyncMultiSelectDemo,
  },
  {
    id: "accordion",
    name: "Accordion",
    description: "分组折叠内容与禁用章节。",
    component: AccordionDemo,
  },
  {
    id: "collapsible",
    name: "Collapsible",
    description: "按需展开的辅助内容。",
    component: CollapsibleDemo,
  },
  {
    id: "tabs",
    name: "Tabs",
    description: "预览/代码切换与禁用标签。",
    component: TabsDemo,
  },
  {
    id: "dialog",
    name: "Dialog",
    description: "可控模态、表单、保存与焦点恢复。",
    component: DialogDemo,
  },
  {
    id: "alert-dialog",
    name: "Alert Dialog",
    description: "确认操作与可恢复的本地反馈。",
    component: AlertDialogDemo,
  },
  {
    id: "dropdown-menu",
    name: "Dropdown Menu",
    description: "操作、快捷键、复选与禁用条目。",
    component: DropdownMenuDemo,
  },
  {
    id: "context-menu",
    name: "Context Menu",
    description: "右键打开的上下文操作。",
    component: ContextMenuDemo,
  },
  {
    id: "popover",
    name: "Popover",
    description: "与触发器关联的辅助设置。",
    component: PopoverDemo,
  },
  {
    id: "tooltip",
    name: "Tooltip",
    description: "悬停与键盘焦点说明。",
    component: TooltipDemo,
  },
  {
    id: "hover-card",
    name: "Hover Card",
    description: "链接预览卡片。",
    component: HoverCardDemo,
  },
  {
    id: "sheet",
    name: "Sheet",
    description: "按需打开的任务详情抽屉。",
    component: SheetDemo,
  },
  {
    id: "card",
    name: "Card",
    description: "标题、内容、动作与页脚组合。",
    component: CardDemo,
  },
  {
    id: "alert",
    name: "Alert",
    description: "信息与错误提示。",
    component: AlertDemo,
  },
  {
    id: "empty",
    name: "Empty",
    description: "可执行下一步的空状态。",
    component: EmptyDemo,
  },
  {
    id: "avatar",
    name: "Avatar",
    description: "回退文字、尺寸与头像组。",
    component: AvatarDemo,
  },
  {
    id: "skeleton",
    name: "Skeleton",
    description: "结构稳定的加载占位。",
    component: SkeletonDemo,
  },
  {
    id: "spinner",
    name: "Spinner",
    description: "加载指示与按钮组合。",
    component: SpinnerDemo,
  },
  {
    id: "separator",
    name: "Separator",
    description: "水平与垂直分隔。",
    component: SeparatorDemo,
  },
  {
    id: "scroll-area",
    name: "Scroll Area",
    description: "可滚动文件列表与细滚动条。",
    component: ScrollAreaDemo,
  },
  {
    id: "progress",
    name: "Progress",
    description: "数值进度、标签与重置操作。",
    component: ProgressDemo,
  },
  {
    id: "table",
    name: "Table",
    description: "表格标题、列头、行与状态。",
    component: TableDemo,
  },
  {
    id: "pagination",
    name: "Pagination",
    description: "页码选择与相邻页导航。",
    component: PaginationDemo,
  },
  {
    id: "breadcrumb",
    name: "Breadcrumb",
    description: "层级导航与当前页标识。",
    component: BreadcrumbDemo,
  },
  {
    id: "command",
    name: "Command",
    description: "可过滤命令列表与选择反馈。",
    component: CommandDemo,
  },
  {
    id: "resizable",
    name: "Resizable",
    description: "鼠标与键盘可调整的双面板。",
    component: ResizableDemo,
  },
  {
    id: "calendar",
    name: "Calendar",
    description: "固定月份的可控单日选择与禁用日期。",
    component: CalendarDemo,
  },
  {
    id: "sidebar",
    name: "Sidebar",
    description: "搜索、分组、活动行与页脚。",
    component: SidebarDemo,
  },
  {
    id: "aspect-ratio",
    name: "Aspect Ratio",
    description: "保持固定比例的内容容器。",
    component: AspectRatioDemo,
  },
  {
    id: "input-otp",
    name: "Input OTP",
    description: "分组验证码输入与完成反馈。",
    component: InputOTPDemo,
  },
  {
    id: "item",
    name: "Item",
    description: "媒体、描述、内容与行内操作。",
    component: ItemDemo,
  },
  {
    id: "kbd",
    name: "Kbd",
    description: "单键与组合快捷键提示。",
    component: KbdDemo,
  },
  {
    id: "native-select",
    name: "Native Select",
    description: "使用平台原生选择行为。",
    component: NativeSelectDemo,
  },
  {
    id: "navigation-menu",
    name: "Navigation Menu",
    description: "产品导航与文档入口。",
    component: NavigationMenuDemo,
  },
  {
    id: "menubar",
    name: "Menubar",
    description: "桌面菜单栏与分组命令。",
    component: MenubarDemo,
  },
  { id: 'toast', name: 'Toast', description: 'Base UI 管理的通知、撤销动作与异步反馈。', component: ToastDemo },
  { id: 'multi-select', name: 'MultiSelect', description: '可搜索多选、标签移除与空/加载/禁用状态。', component: MultiSelectDemo },
  { id: 'number-field', name: 'NumberField', description: '本地化数值输入、步进、边界与空值。', component: NumberFieldDemo },
  { id: 'meter', name: 'Meter', description: '容量、预算与质量的有界测量值。', component: MeterDemo },
];

export function ToastDemo({ mode = 'default' }: { mode?: 'default' | 'undo' | 'async' | 'error' } = {}) {
  return <ToastProvider timeout={0}><ToastDemoActions mode={mode} /></ToastProvider>;
}
function ToastDemoActions({ mode }: { mode: 'default' | 'undo' | 'async' | 'error' }) {
  const manager = useToastManager();
  const [archived, setArchived] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  async function save() {
    setPending(true);
    try {
      await manager.promise(new Promise<string>(resolve => setTimeout(() => resolve('本地设置'), 400)), {
        loading: { title: '正在保存设置', description: '本地异步演示。', type: 'loading' },
        success: value => ({ title: '设置已保存', description: `${value}已更新。`, type: 'success' }),
        error: { title: '保存失败', description: '请重试。', type: 'error' },
      });
    } finally { setPending(false); }
  }
  return <Stack><Row>
    {mode === 'default' && <P.Button onClick={() => manager.add({ title: '更改已保存', description: '组件偏好已保存在本地示例中。', type: 'success' })}>显示通知</P.Button>}
    {mode === 'undo' && <P.Button variant="outline" disabled={archived} onClick={() => {
      setArchived(true);
      const id = manager.add({ title: '任务已归档', description: '可以立即撤销本地示例操作。', actionProps: { children: '撤销归档', onClick: () => { setArchived(false); manager.close(id); } } });
    }}>归档示例任务</P.Button>}
    {mode === 'async' && <P.Button disabled={pending} onClick={() => void save()}>{pending && <P.Spinner />}保存设置</P.Button>}
    {mode === 'error' && <P.Button variant="outline" onClick={() => manager.add({ title: '连接失败', description: '这是本地错误示例；请检查地址后重试。', type: 'error', priority: 'high' })}>显示错误通知</P.Button>}
  </Row>{mode === 'undo' && <output>{archived ? '任务状态：已归档' : '任务状态：进行中'}</output>}<Note>通知由 Base UI 管理公告、关闭和焦点；F6 可进入通知区域。所有操作仅更新本地示例。</Note></Stack>;
}

const multiSelectOptions = [
  { value: 'react', label: 'React' }, { value: 'typescript', label: 'TypeScript' },
  { value: 'tailwind', label: 'Tailwind CSS' }, { value: 'storybook', label: 'Storybook' },
  { value: 'legacy', label: '旧版框架（不可用）', disabled: true },
];
export function MultiSelectDemo({ state = 'default' }: { state?: 'default' | 'disabled' | 'loading' | 'empty' | 'invalid' } = {}) {
  const [value, setValue] = React.useState<string[]>(['react']);
  return <Stack><MultiSelect label="项目技术栈" options={state === 'empty' ? [] : multiSelectOptions} value={state === 'empty' ? [] : value} onValueChange={setValue} disabled={state === 'disabled'} loading={state === 'loading'} error={state === 'invalid' ? '请至少保留两个技术标签。' : undefined} description="输入关键词筛选；可用键盘移动到标签并移除。" /><output>已选择：{state === 'empty' ? '无' : value.join(', ') || '无'}</output></Stack>;
}

export function NumberFieldDemo({ state = 'default' }: { state?: 'default' | 'currency' | 'disabled' | 'invalid' | 'empty' } = {}) {
  const [value, setValue] = React.useState<number | null>(state === 'empty' ? null : state === 'currency' ? 125.5 : 2);
  return <Stack><NumberField label={state === 'currency' ? '月度预算' : '并发任务数'} value={value} onValueChange={setValue} min={state === 'currency' ? 0 : 1} max={state === 'currency' ? 1000 : 8} step={state === 'currency' ? 0.5 : 1} format={state === 'currency' ? { style: 'currency', currency: 'CNY' } : undefined} locale="zh-CN" disabled={state === 'disabled'} inputPlaceholder="输入数值" error={state === 'invalid' ? '当前方案最多允许 1 个并发任务。' : undefined} description={state === 'currency' ? '支持本地化金额与 0.5 元步进。' : '允许 1–8；方向键调整，直接输入可在失焦时提交。'} /><output>当前数值：{value ?? '空'}</output>{state === 'disabled' && <NumberField label="只读配额" value={8} readOnly />}</Stack>;
}

export function MeterDemo({ state = 'default' }: { state?: 'default' | 'warning' | 'zero' | 'quality' } = {}) {
  const [value, setValue] = React.useState(state === 'warning' ? 116 : state === 'zero' ? 0 : state === 'quality' ? 82 : 68);
  const quality = state === 'quality';
  const max = quality ? 100 : 128;
  return <Stack><Meter label={quality ? '数据完整度' : '工作区存储'} min={0} max={max} value={value} valueLabel={quality ? `${value}%` : `${value} / 128 GB`} tone={state === 'warning' ? 'warning' : quality ? 'success' : 'default'} description={state === 'warning' ? '容量接近上限，请整理已有文件。' : quality ? '这是当前数据质量测量，不表示后台任务进度。' : '展示当前已用容量；不表示任务完成百分比。'} /><Row><P.Button variant="outline" size="sm" onClick={() => setValue(Math.min(max, value + 8))}>增加示例值</P.Button><P.Button variant="ghost" size="sm" onClick={() => setValue(0)}>归零</P.Button></Row></Stack>;
}
