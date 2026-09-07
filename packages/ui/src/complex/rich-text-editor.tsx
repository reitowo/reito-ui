import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { EditorContent, useEditor, useEditorState, type Editor, type JSONContent } from '@tiptap/react';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import { Emoji, type EmojiItem } from '@tiptap/extension-emoji';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Braces, Heading1, Heading2, Italic, Link2, List, ListChecks, ListOrdered, Pilcrow, Quote, Redo2, RemoveFormatting, Smile, Strikethrough, Underline, Undo2, Unlink2, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils.js';
import { Button } from '../primitives/button.js';
import { Input } from '../primitives/input.js';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '../primitives/popover.js';
import { Separator } from '../primitives/separator.js';
import {
  createRichTextEditorSuggestionExtensions,
  richTextEditorDefaultSlashCommands,
  richTextEditorSlashCommands,
  type RichTextEditorMentionItem,
  type RichTextEditorMentionLoader,
  type RichTextEditorSlashCommandName,
  type RichTextEditorSuggestionError,
} from './rich-text-editor-suggestions.js';

export { richTextEditorDefaultSlashCommands, richTextEditorSlashCommands } from './rich-text-editor-suggestions.js';
export type { RichTextEditorMentionItem, RichTextEditorMentionLoader, RichTextEditorSlashCommandName, RichTextEditorSuggestionError } from './rich-text-editor-suggestions.js';

export type RichTextEditorFormat = 'json' | 'html' | 'markdown';
export type RichTextEditorValue = string | JSONContent;
export type RichTextEditorEmojiName = 'sparkles' | 'thumbsup' | 'eyes' | 'rocket' | 'check' | 'warning' | 'bulb' | 'memo';
export type RichTextEditorToolbarItem = 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'clear-format' | 'paragraph' | 'heading-1' | 'heading-2' | 'bullet-list' | 'ordered-list' | 'task-list' | 'blockquote' | 'align-left' | 'align-center' | 'align-right' | 'align-justify' | 'emoji' | 'link' | 'unlink' | 'undo' | 'redo';

export interface RichTextEditorEmojiOption {
  name: RichTextEditorEmojiName;
  emoji: string;
  label: string;
}

export interface RichTextEditorSnapshot {
  json: JSONContent;
  html: string;
  markdown: string;
  text: string;
  isEmpty: boolean;
}

export interface RichTextEditorContentError {
  format: RichTextEditorFormat;
  value: RichTextEditorValue;
  message: string;
  cause?: unknown;
}

export interface RichTextEditorProps {
  format?: RichTextEditorFormat;
  value?: RichTextEditorValue;
  defaultValue?: RichTextEditorValue;
  onValueChange?: (value: RichTextEditorValue, snapshot: RichTextEditorSnapshot) => void;
  onContentError?: (error: RichTextEditorContentError) => void;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  error?: ReactNode;
  readOnly?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  toolbar?: boolean;
  toolbarItems?: readonly RichTextEditorToolbarItem[];
  emojiItems?: readonly RichTextEditorEmojiName[];
  suggestions?: boolean;
  mentionItems?: readonly RichTextEditorMentionItem[];
  loadMentionItems?: RichTextEditorMentionLoader;
  slashCommands?: readonly RichTextEditorSlashCommandName[];
  onSuggestionError?: (error: RichTextEditorSuggestionError) => void;
  linkPlaceholder?: string;
  editorClassName?: string;
  className?: string;
}

const emptyDocument: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };
export const richTextEditorEmojiOptions: readonly RichTextEditorEmojiOption[] = [
  { name: 'sparkles', emoji: '✨', label: '闪光' },
  { name: 'thumbsup', emoji: '👍', label: '赞' },
  { name: 'eyes', emoji: '👀', label: '关注' },
  { name: 'rocket', emoji: '🚀', label: '启动' },
  { name: 'check', emoji: '✅', label: '完成' },
  { name: 'warning', emoji: '⚠️', label: '警告' },
  { name: 'bulb', emoji: '💡', label: '想法' },
  { name: 'memo', emoji: '📝', label: '记录' },
] as const;
const editorEmojiItems: EmojiItem[] = richTextEditorEmojiOptions.map(item => ({ name: item.name, emoji: item.emoji, shortcodes: [item.name], tags: [item.label] }));
const editorExtensions = [
  StarterKit.configure({ link: { openOnClick: false } }),
  TaskList,
  TaskItem.configure({ nested: true, HTMLAttributes: { 'data-type': 'taskItem' }, a11y: { checkboxLabel: (node, checked) => `${checked ? '取消完成' : '标记完成'}任务：${node.textContent || '空任务'}` } }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Emoji.configure({ emojis: editorEmojiItems }),
  Markdown,
];
export const richTextEditorDefaultEmojiItems: readonly RichTextEditorEmojiName[] = richTextEditorEmojiOptions.map(item => item.name);
export const richTextEditorDefaultToolbarItems: readonly RichTextEditorToolbarItem[] = ['bold', 'italic', 'underline', 'strike', 'code', 'clear-format', 'paragraph', 'heading-1', 'heading-2', 'bullet-list', 'ordered-list', 'task-list', 'blockquote', 'align-left', 'align-center', 'align-right', 'align-justify', 'emoji', 'link', 'unlink', 'undo', 'redo'];

type ToolbarDefinition = {
  label: string;
  shortcut?: string;
  icon: LucideIcon;
  group: 'mark' | 'block' | 'align' | 'insert' | 'link' | 'history';
  active?: keyof RichTextToolbarState;
};

type RichTextToolbarState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  code: boolean;
  paragraph: boolean;
  heading1: boolean;
  heading2: boolean;
  bulletList: boolean;
  orderedList: boolean;
  taskList: boolean;
  blockquote: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
  alignJustify: boolean;
  link: boolean;
  linkHref: string;
  selectionEmpty: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

const emptyToolbarState: RichTextToolbarState = { bold: false, italic: false, underline: false, strike: false, code: false, paragraph: false, heading1: false, heading2: false, bulletList: false, orderedList: false, taskList: false, blockquote: false, alignLeft: false, alignCenter: false, alignRight: false, alignJustify: false, link: false, linkHref: '', selectionEmpty: true, canUndo: false, canRedo: false };

const toolbarDefinitions: Record<RichTextEditorToolbarItem, ToolbarDefinition> = {
  bold: { label: '粗体', shortcut: 'Ctrl+B', icon: Bold, group: 'mark', active: 'bold' },
  italic: { label: '斜体', shortcut: 'Ctrl+I', icon: Italic, group: 'mark', active: 'italic' },
  underline: { label: '下划线', shortcut: 'Ctrl+U', icon: Underline, group: 'mark', active: 'underline' },
  strike: { label: '删除线', shortcut: 'Ctrl+Shift+S', icon: Strikethrough, group: 'mark', active: 'strike' },
  code: { label: '行内代码', shortcut: 'Ctrl+E', icon: Braces, group: 'mark', active: 'code' },
  'clear-format': { label: '清除格式', icon: RemoveFormatting, group: 'mark' },
  paragraph: { label: '正文', shortcut: 'Ctrl+Alt+0', icon: Pilcrow, group: 'block', active: 'paragraph' },
  'heading-1': { label: '一级标题', shortcut: 'Ctrl+Alt+1', icon: Heading1, group: 'block', active: 'heading1' },
  'heading-2': { label: '二级标题', shortcut: 'Ctrl+Alt+2', icon: Heading2, group: 'block', active: 'heading2' },
  'bullet-list': { label: '无序列表', shortcut: 'Ctrl+Shift+8', icon: List, group: 'block', active: 'bulletList' },
  'ordered-list': { label: '有序列表', shortcut: 'Ctrl+Shift+7', icon: ListOrdered, group: 'block', active: 'orderedList' },
  'task-list': { label: '任务列表', shortcut: 'Ctrl+Shift+9', icon: ListChecks, group: 'block', active: 'taskList' },
  blockquote: { label: '引用', shortcut: 'Ctrl+Shift+B', icon: Quote, group: 'block', active: 'blockquote' },
  'align-left': { label: '左对齐', shortcut: 'Ctrl+Shift+L', icon: AlignLeft, group: 'align', active: 'alignLeft' },
  'align-center': { label: '居中对齐', shortcut: 'Ctrl+Shift+E', icon: AlignCenter, group: 'align', active: 'alignCenter' },
  'align-right': { label: '右对齐', shortcut: 'Ctrl+Shift+R', icon: AlignRight, group: 'align', active: 'alignRight' },
  'align-justify': { label: '两端对齐', shortcut: 'Ctrl+Shift+J', icon: AlignJustify, group: 'align', active: 'alignJustify' },
  emoji: { label: '插入 Emoji', icon: Smile, group: 'insert' },
  link: { label: '编辑链接', shortcut: 'Ctrl+K', icon: Link2, group: 'link', active: 'link' },
  unlink: { label: '移除链接', icon: Unlink2, group: 'link' },
  undo: { label: '撤销', shortcut: 'Ctrl+Z', icon: Undo2, group: 'history' },
  redo: { label: '重做', shortcut: 'Ctrl+Shift+Z', icon: Redo2, group: 'history' },
};

function toolbarState(current: Editor | null): RichTextToolbarState {
  if (!current) return emptyToolbarState;
  const paragraph = current.isActive('paragraph');
  const heading = current.isActive('heading');
  const textAlign = paragraph ? current.getAttributes('paragraph').textAlign : heading ? current.getAttributes('heading').textAlign : undefined;
  return {
    bold: current.isActive('bold'),
    italic: current.isActive('italic'),
    underline: current.isActive('underline'),
    strike: current.isActive('strike'),
    code: current.isActive('code'),
    paragraph,
    heading1: current.isActive('heading', { level: 1 }),
    heading2: current.isActive('heading', { level: 2 }),
    bulletList: current.isActive('bulletList'),
    orderedList: current.isActive('orderedList'),
    taskList: current.isActive('taskList'),
    blockquote: current.isActive('blockquote'),
    alignLeft: (paragraph || heading) && (!textAlign || textAlign === 'left'),
    alignCenter: textAlign === 'center',
    alignRight: textAlign === 'right',
    alignJustify: textAlign === 'justify',
    link: current.isActive('link'),
    linkHref: String(current.getAttributes('link').href ?? ''),
    selectionEmpty: current.state.selection.empty,
    canUndo: current.can().undo(),
    canRedo: current.can().redo(),
  };
}

function emptyValue(format: RichTextEditorFormat): RichTextEditorValue {
  return format === 'json' ? emptyDocument : '';
}

function validValue(format: RichTextEditorFormat, value: RichTextEditorValue) {
  if (format === 'json') return Boolean(value && typeof value === 'object' && !Array.isArray(value) && value.type === 'doc');
  return typeof value === 'string';
}

function snapshot(editor: Editor): RichTextEditorSnapshot {
  return {
    json: editor.getJSON(),
    html: editor.getHTML(),
    markdown: editor.getMarkdown(),
    text: editor.getText({ blockSeparator: '\n' }),
    isEmpty: editor.isEmpty,
  };
}

function outputFor(format: RichTextEditorFormat, state: RichTextEditorSnapshot): RichTextEditorValue {
  if (format === 'json') return state.json;
  if (format === 'html') return state.html;
  return state.markdown;
}

function sameValue(format: RichTextEditorFormat, left: RichTextEditorValue, right: RichTextEditorValue) {
  if (format === 'json') {
    try { return JSON.stringify(left) === JSON.stringify(right); }
    catch { return left === right; }
  }
  return left === right;
}

function runToolbarCommand(editor: Editor, item: RichTextEditorToolbarItem) {
  const chain = editor.chain().focus();
  switch (item) {
    case 'bold': return chain.toggleBold().run();
    case 'italic': return chain.toggleItalic().run();
    case 'underline': return chain.toggleUnderline().run();
    case 'strike': return chain.toggleStrike().run();
    case 'code': return chain.toggleCode().run();
    case 'clear-format': return chain.unsetAllMarks().clearNodes().run();
    case 'paragraph': return chain.setParagraph().run();
    case 'heading-1': return chain.toggleHeading({ level: 1 }).run();
    case 'heading-2': return chain.toggleHeading({ level: 2 }).run();
    case 'bullet-list': return chain.toggleBulletList().run();
    case 'ordered-list': return chain.toggleOrderedList().run();
    case 'task-list': return chain.toggleTaskList().run();
    case 'blockquote': return chain.toggleBlockquote().run();
    case 'align-left': return chain.setTextAlign('left').run();
    case 'align-center': return chain.setTextAlign('center').run();
    case 'align-right': return chain.setTextAlign('right').run();
    case 'align-justify': return chain.setTextAlign('justify').run();
    case 'unlink': return chain.extendMarkRange('link').unsetLink().run();
    case 'undo': return editor.commands.undo();
    case 'redo': return editor.commands.redo();
    case 'emoji':
    case 'link': return false;
  }
}

function RichTextEditorToolbar({
  editor,
  items,
  disabled,
  linkOpen,
  linkHref,
  linkError,
  linkPlaceholder,
  emojiOpen,
  emojiItems,
  onLinkOpenChange,
  onLinkHrefChange,
  onOpenLink,
  onApplyLink,
  onEmojiOpenChange,
  onOpenEmoji,
  onInsertEmoji,
}: {
  editor: Editor | null;
  items: readonly RichTextEditorToolbarItem[];
  disabled: boolean;
  linkOpen: boolean;
  linkHref: string;
  linkError?: string;
  linkPlaceholder: string;
  emojiOpen: boolean;
  emojiItems: readonly RichTextEditorEmojiName[];
  onLinkOpenChange: (open: boolean) => void;
  onLinkHrefChange: (href: string) => void;
  onOpenLink: () => void;
  onApplyLink: () => void;
  onEmojiOpenChange: (open: boolean) => void;
  onOpenEmoji: () => void;
  onInsertEmoji: (name: RichTextEditorEmojiName) => void;
}) {
  const linkErrorId = useId();
  const [rovingIndex, setRovingIndex] = useState(0);
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => toolbarState(current),
  }) ?? emptyToolbarState;

  function itemDisabled(item: RichTextEditorToolbarItem) {
    if (!editor || disabled) return true;
    if (item === 'undo') return !state.canUndo;
    if (item === 'redo') return !state.canRedo;
    if (item === 'link') return state.selectionEmpty && !state.link;
    if (item === 'unlink') return !state.link;
    return false;
  }

  const tabStopIndex = items[rovingIndex] && !itemDisabled(items[rovingIndex]) ? rovingIndex : items.findIndex(item => !itemDisabled(item));

  return <div data-slot="rich-text-editor-toolbar" role="toolbar" aria-label="文本格式" aria-orientation="horizontal" className="flex min-w-0 items-center gap-[var(--rui-space-1)] overflow-x-auto border-b border-border bg-muted/30 p-[var(--rui-space-1)]" onKeyDown={event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || !(event.target instanceof HTMLButtonElement)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
    const current = buttons.indexOf(event.target);
    if (current < 0 || !buttons.length) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
    buttons[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }}>
    {items.map((item, index) => {
      const definition = toolbarDefinitions[item];
      const previous = items[index - 1];
      const separated = previous && toolbarDefinitions[previous].group !== definition.group;
      const active = definition.active ? Boolean(state[definition.active]) : false;
      const Icon = definition.icon;
      const button = <Button
        type="button"
        size="icon-xs"
        variant={active ? 'secondary' : 'ghost'}
        aria-label={definition.label}
        aria-pressed={definition.active ? active : undefined}
        aria-keyshortcuts={definition.shortcut?.replace('Ctrl', 'Control')}
        title={definition.shortcut ? `${definition.label}（${definition.shortcut}）` : definition.label}
        disabled={itemDisabled(item)}
        tabIndex={itemDisabled(item) ? -1 : index === tabStopIndex ? 0 : -1}
        onFocus={() => setRovingIndex(index)}
        onPointerDown={event => event.preventDefault()}
        onClick={() => {
          if (item === 'link') onOpenLink();
          else if (item === 'emoji') onOpenEmoji();
          else if (editor) runToolbarCommand(editor, item);
        }}
      ><Icon aria-hidden="true" /></Button>;

      return <Fragment key={`${item}-${index}`}>
        {separated && <Separator orientation="vertical" className="h-[var(--rui-space-4)] shrink-0" />}
        {item === 'link' ? <Popover open={linkOpen} onOpenChange={onLinkOpenChange}>
          <PopoverTrigger render={button} />
          <PopoverContent align="start" className="w-[var(--rui-container-2xs)] max-w-[calc(100vw-var(--rui-space-8))] gap-[var(--rui-space-2)] p-[var(--rui-content-padding)]">
            <PopoverTitle>编辑链接</PopoverTitle>
            <form className="grid gap-[var(--rui-space-2)]" onSubmit={event => { event.preventDefault(); onApplyLink(); }}>
              <label className="grid gap-[var(--rui-space-1)] text-xs text-muted-foreground">链接地址
                <Input name="href" value={linkHref} placeholder={linkPlaceholder} aria-invalid={linkError ? true : undefined} aria-describedby={linkError ? linkErrorId : undefined} onChange={event => onLinkHrefChange(event.target.value)} />
              </label>
              {linkError && <p id={linkErrorId} role="alert" className="text-xs text-destructive">{linkError}</p>}
              <div className="flex justify-end gap-[var(--rui-space-1)]"><Button type="button" size="xs" variant="ghost" onClick={() => onLinkOpenChange(false)}>取消</Button><Button type="submit" size="xs">应用链接</Button></div>
            </form>
          </PopoverContent>
        </Popover> : item === 'emoji' ? <Popover open={emojiOpen} onOpenChange={onEmojiOpenChange}>
          <PopoverTrigger render={button} />
          <PopoverContent align="start" className="w-[var(--rui-container-3xs)] max-w-[calc(100vw-var(--rui-space-8))] gap-[var(--rui-space-2)] p-[var(--rui-content-padding)]">
            <PopoverTitle>插入 Emoji</PopoverTitle>
            {emojiItems.length ? <div role="listbox" aria-label="Emoji" className="grid grid-cols-4 gap-[var(--rui-space-1)]">
              {emojiItems.map(name => {
                const option = richTextEditorEmojiOptions.find(item => item.name === name);
                return option ? <Button key={name} type="button" size="icon-sm" variant="ghost" role="option" aria-label={`${option.label} ${option.emoji}`} title={`:${name}:`} onClick={() => onInsertEmoji(name)}><span aria-hidden="true" className="text-base leading-none">{option.emoji}</span></Button> : null;
              })}
            </div> : <p className="text-xs text-muted-foreground">没有可插入的 Emoji</p>}
          </PopoverContent>
        </Popover> : button}
      </Fragment>;
    })}
  </div>;
}

/** A schema-backed Tiptap document surface with explicit JSON, HTML and Markdown I/O. */
export function RichTextEditor({
  format = 'json',
  value,
  defaultValue,
  onValueChange,
  onContentError,
  label = '富文本内容',
  description,
  placeholder = '开始输入…',
  error,
  readOnly = false,
  disabled = false,
  autoFocus = false,
  toolbar = true,
  toolbarItems = richTextEditorDefaultToolbarItems,
  emojiItems = richTextEditorDefaultEmojiItems,
  suggestions = true,
  mentionItems = [],
  loadMentionItems,
  slashCommands = richTextEditorDefaultSlashCommands,
  onSuggestionError,
  linkPlaceholder = 'https://example.com',
  editorClassName,
  className,
}: RichTextEditorProps) {
  const descriptionId = useId();
  const errorId = useId();
  const suggestionId = useId().replaceAll(':', '');
  const initialized = useRef(false);
  const controlled = value !== undefined;
  const initialValue = useRef(defaultValue ?? value ?? emptyValue(format));
  const currentInput = useRef<RichTextEditorValue>(controlled ? value! : initialValue.current);
  const pendingHostEchoes = useRef<Array<{ format: RichTextEditorFormat; value: RichTextEditorValue }>>([]);
  const editorRef = useRef<Editor | null>(null);
  const linkShortcutRef = useRef<() => void>(() => undefined);
  const interactionRef = useRef({ toolbar, disabled, readOnly, linkAvailable: toolbarItems.includes('link'), emojiAvailable: toolbarItems.includes('emoji') });
  const savedLinkSelection = useRef<{ from: number; to: number } | undefined>(undefined);
  const savedEmojiSelection = useRef<{ from: number; to: number } | undefined>(undefined);
  const formatRef = useRef(format);
  const onValueChangeRef = useRef(onValueChange);
  const onContentErrorRef = useRef(onContentError);
  const suggestionEnabledRef = useRef(suggestions && !disabled && !readOnly);
  const mentionItemsRef = useRef(mentionItems);
  const mentionLoaderRef = useRef(loadMentionItems);
  const slashCommandsRef = useRef(slashCommands);
  const onSuggestionErrorRef = useRef(onSuggestionError);
  const suggestionExtensionsRef = useRef<ReturnType<typeof createRichTextEditorSuggestionExtensions> | null>(null);
  if (!suggestionExtensionsRef.current) {
    suggestionExtensionsRef.current = createRichTextEditorSuggestionExtensions({
      idPrefix: `rich-text-editor-${suggestionId}`,
      isEnabled: () => suggestionEnabledRef.current,
      getMentions: (query, signal) => {
        const loader = mentionLoaderRef.current;
        if (loader) return loader(query, { signal });
        const normalized = query.trim().toLocaleLowerCase();
        return mentionItemsRef.current.filter(item => !normalized || [item.id, item.label, item.description ?? '', ...(item.keywords ?? [])].some(value => value.toLocaleLowerCase().includes(normalized)));
      },
      getSlashCommands: () => slashCommandsRef.current,
      onError: suggestionError => onSuggestionErrorRef.current?.(suggestionError),
    });
  }
  const [isEmpty, setIsEmpty] = useState(true);
  const [parseError, setParseError] = useState<string>();
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkHref, setLinkHref] = useState('');
  const [linkError, setLinkError] = useState<string>();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const visibleEmojiItems = emojiItems.filter((name, index) => emojiItems.indexOf(name) === index);
  const visibleError = error ?? parseError;
  const describedBy = [description && descriptionId, visibleError && errorId].filter(Boolean).join(' ') || undefined;

  formatRef.current = format;
  currentInput.current = controlled ? value! : initialValue.current;
  onValueChangeRef.current = onValueChange;
  onContentErrorRef.current = onContentError;
  suggestionEnabledRef.current = suggestions && !disabled && !readOnly;
  mentionItemsRef.current = mentionItems;
  mentionLoaderRef.current = loadMentionItems;
  slashCommandsRef.current = slashCommands;
  onSuggestionErrorRef.current = onSuggestionError;
  interactionRef.current = { toolbar, disabled, readOnly, linkAvailable: toolbarItems.includes('link'), emojiAvailable: toolbarItems.includes('emoji') };

  function openLinkEditor() {
    const current = editorRef.current;
    if (!current || interactionRef.current.disabled || interactionRef.current.readOnly || !interactionRef.current.toolbar || !interactionRef.current.linkAvailable) return;
    const { from, to } = current.state.selection;
    if (from === to && !current.isActive('link')) return;
    savedLinkSelection.current = { from, to };
    setLinkHref(String(current.getAttributes('link').href ?? ''));
    setLinkError(undefined);
    setLinkOpen(true);
  }

  function closeLinkEditor(open: boolean) {
    setLinkOpen(open);
    if (!open) {
      setLinkError(undefined);
      requestAnimationFrame(() => editorRef.current?.commands.focus());
    }
  }

  function applyLink() {
    const current = editorRef.current;
    const selected = savedLinkSelection.current;
    const href = linkHref.trim();
    if (!current || !selected) return;
    if (!href) {
      setLinkError('请输入链接地址');
      return;
    }
    const maximum = current.state.doc.content.size;
    const from = Math.min(selected.from, maximum);
    const to = Math.min(selected.to, maximum);
    const applied = current.chain().focus().setTextSelection({ from, to }).extendMarkRange('link').setLink({ href }).run();
    if (!applied) {
      setLinkError('链接地址无效或当前选区不支持链接');
      return;
    }
    savedLinkSelection.current = { from: current.state.selection.from, to: current.state.selection.to };
    setLinkError(undefined);
    setLinkOpen(false);
    requestAnimationFrame(() => current.commands.focus());
  }

  function openEmojiPicker() {
    const current = editorRef.current;
    if (!current || interactionRef.current.disabled || interactionRef.current.readOnly || !interactionRef.current.toolbar || !interactionRef.current.emojiAvailable) return;
    savedEmojiSelection.current = { from: current.state.selection.from, to: current.state.selection.to };
    setEmojiOpen(true);
  }

  function closeEmojiPicker(open: boolean) {
    setEmojiOpen(open);
    if (!open) requestAnimationFrame(() => editorRef.current?.commands.focus());
  }

  function insertEmoji(name: RichTextEditorEmojiName) {
    const current = editorRef.current;
    const selected = savedEmojiSelection.current;
    if (!current || !selected) return;
    const maximum = current.state.doc.content.size;
    const from = Math.min(selected.from, maximum);
    const to = Math.min(selected.to, maximum);
    current.chain().focus().setTextSelection({ from, to }).setEmoji(name).run();
    setEmojiOpen(false);
    requestAnimationFrame(() => current.commands.focus());
  }

  linkShortcutRef.current = openLinkEditor;

  function reportContentError(nextFormat: RichTextEditorFormat, nextValue: RichTextEditorValue, cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause || '内容无法按所选格式解析');
    setParseError(message);
    onContentErrorRef.current?.({ format: nextFormat, value: nextValue, message, cause });
  }

  function replaceContent(editor: Editor, nextFormat: RichTextEditorFormat, nextValue: RichTextEditorValue) {
    if (!validValue(nextFormat, nextValue)) {
      reportContentError(nextFormat, nextValue, new Error(nextFormat === 'json' ? 'JSON 内容必须是 type 为 doc 的文档对象' : `${nextFormat.toUpperCase()} 内容必须是字符串`));
      return false;
    }
    try {
      const parsed = nextFormat === 'markdown'
        ? editor.markdown?.parse(nextValue as string) ?? emptyDocument
        : nextValue;
      editor.chain().setMeta('addToHistory', false).setContent(parsed, {
        contentType: nextFormat === 'markdown' ? 'json' : nextFormat,
        emitUpdate: false,
        // JSON is the canonical schema document and must be exact. HTML is
        // intentionally normalized to the installed schema like browser paste.
        errorOnInvalidContent: nextFormat === 'json',
      }).run();
      setParseError(undefined);
      setIsEmpty(editor.isEmpty);
      return true;
    } catch (cause) {
      reportContentError(nextFormat, nextValue, cause);
      return false;
    }
  }

  const editor = useEditor({
    extensions: [...editorExtensions, ...suggestionExtensionsRef.current.extensions],
    content: emptyDocument,
    editable: false,
    immediatelyRender: false,
    enableContentCheck: true,
    editorProps: {
      handleKeyDown: (_view, event) => {
        const interaction = interactionRef.current;
        if (event.isComposing || !interaction.toolbar || !interaction.linkAvailable || interaction.disabled || interaction.readOnly) return false;
        if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          linkShortcutRef.current();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: current }) => {
      const state = snapshot(current);
      const currentFormat = formatRef.current;
      const nextValue = outputFor(currentFormat, state);
      setIsEmpty(state.isEmpty);
      setParseError(undefined);
      pendingHostEchoes.current.push({ format: currentFormat, value: nextValue });
      if (pendingHostEchoes.current.length > 32) pendingHostEchoes.current.shift();
      onValueChangeRef.current?.(nextValue, state);
    },
    onContentError: ({ error: contentError }) => {
      const currentFormat = formatRef.current;
      reportContentError(currentFormat, currentInput.current, contentError);
    },
  });
  editorRef.current = editor;

  useLayoutEffect(() => {
    if (!editor || initialized.current) return;
    initialized.current = true;
    replaceContent(editor, format, controlled ? value! : initialValue.current);
    editor.setEditable(!disabled && !readOnly, false);
    if (autoFocus && !disabled && !readOnly) requestAnimationFrame(() => editor.commands.focus('start'));
  }, [autoFocus, controlled, disabled, editor, format, readOnly, value]);

  useEffect(() => {
    if (!editor || !initialized.current || !controlled) return;
    const echoed = pendingHostEchoes.current.findIndex(candidate => candidate.format === format && sameValue(format, candidate.value, value!));
    if (echoed >= 0) {
      pendingHostEchoes.current.splice(0, echoed + 1);
      return;
    }
    pendingHostEchoes.current = [];
    const current = outputFor(format, snapshot(editor));
    if (!sameValue(format, current, value!)) replaceContent(editor, format, value!);
  }, [controlled, editor, format, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled && !readOnly, false);
    editor.setOptions({ editorProps: { attributes: {
      role: 'textbox',
      'aria-label': label,
      'aria-multiline': 'true',
      'aria-readonly': String(readOnly || disabled),
      'aria-disabled': String(disabled),
      'aria-autocomplete': suggestions && !readOnly && !disabled ? 'list' : 'none',
      ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      'data-slot': 'rich-text-editor-content',
      class: cn(
        'min-h-[var(--rui-editor-min-height)] px-[var(--rui-content-padding)] py-[var(--rui-content-padding)] text-sm leading-relaxed text-foreground outline-none',
        '[&_p]:my-[var(--rui-space-2)] [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
        '[&_h1]:my-[var(--rui-space-3)] [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1:first-child]:mt-0',
        '[&_h2]:my-[var(--rui-space-3)] [&_h2]:text-base [&_h2]:font-semibold [&_h2:first-child]:mt-0',
        '[&_h3]:my-[var(--rui-space-2)] [&_h3]:font-semibold [&_h3:first-child]:mt-0',
        '[&_ul]:my-[var(--rui-space-2)] [&_ul]:list-disc [&_ul]:pl-[var(--rui-space-5)]',
        '[&_ol]:my-[var(--rui-space-2)] [&_ol]:list-decimal [&_ol]:pl-[var(--rui-space-5)]',
        '[&_li]:my-[var(--rui-space-1)] [&_li>p]:my-0',
        '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0',
        '[&_li[data-type=taskItem]]:flex [&_li[data-type=taskItem]]:items-start [&_li[data-type=taskItem]]:gap-[var(--rui-space-2)]',
        '[&_li[data-type=taskItem]>label]:flex [&_li[data-type=taskItem]>label]:h-[var(--rui-control-height-xs)] [&_li[data-type=taskItem]>label]:shrink-0 [&_li[data-type=taskItem]>label]:items-center',
        '[&_li[data-type=taskItem]>label>input]:size-[var(--rui-space-4)] [&_li[data-type=taskItem]>label>input]:accent-primary',
        '[&_li[data-type=taskItem]>div]:min-w-0 [&_li[data-type=taskItem]>div]:flex-1',
        '[&_blockquote]:my-[var(--rui-space-3)] [&_blockquote]:border-l-[length:var(--rui-outline-width)] [&_blockquote]:border-border [&_blockquote]:pl-[var(--rui-space-3)] [&_blockquote]:text-muted-foreground',
        '[&_pre]:my-[var(--rui-space-3)] [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-[var(--rui-content-padding)] [&_pre]:font-mono [&_pre]:text-xs',
        '[&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-[var(--rui-space-1)] [&_code]:font-mono [&_code]:text-xs [&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4',
        '[&_span[data-type=mention]]:rounded-sm [&_span[data-type=mention]]:bg-muted [&_span[data-type=mention]]:px-[var(--rui-space-1)] [&_span[data-type=mention]]:font-medium',
        '[&_.rich-text-editor-suggestion]:rounded-sm [&_.rich-text-editor-suggestion]:bg-accent',
        '[&_hr]:my-[var(--rui-space-4)] [&_hr]:border-border',
        editorClassName,
      ),
    } } });
  }, [describedBy, disabled, editor, editorClassName, label, readOnly, suggestions]);

  useEffect(() => {
    if (disabled || readOnly || !toolbar || !toolbarItems.includes('link')) setLinkOpen(false);
    if (disabled || readOnly || !toolbar || !toolbarItems.includes('emoji')) setEmojiOpen(false);
  }, [disabled, readOnly, toolbar, toolbarItems]);

  useEffect(() => {
    if (editor && (!suggestions || disabled || readOnly)) suggestionExtensionsRef.current?.exit(editor);
  }, [disabled, editor, readOnly, suggestions]);

  return <div
    data-slot="rich-text-editor"
    role="region"
    aria-label={`${label}编辑器`}
    data-format={format}
    data-empty={isEmpty ? 'true' : undefined}
    data-readonly={readOnly ? 'true' : undefined}
    data-disabled={disabled ? 'true' : undefined}
    className={cn('min-w-0 font-sans text-foreground', disabled && 'cursor-not-allowed', className)}
  >
    <div className="mb-[var(--rui-space-2)] flex min-w-0 items-baseline justify-between gap-[var(--rui-content-gap)]">
      <span className="truncate text-sm font-medium">{label}</span>
      <span className="shrink-0 font-mono text-xs text-muted-foreground">{format.toUpperCase()}</span>
    </div>
    {description && <div id={descriptionId} className="mb-[var(--rui-space-2)] text-xs text-muted-foreground">{description}</div>}
    <div className={cn('relative min-w-0 overflow-hidden rounded-lg border border-border bg-background transition-colors focus-within:border-ring focus-within:ring-[length:var(--rui-outline-width)] focus-within:ring-ring/50', visibleError && 'border-destructive', (readOnly || disabled) && 'bg-muted/30')}>
      {toolbar && <RichTextEditorToolbar editor={editor} items={toolbarItems} disabled={disabled || readOnly} linkOpen={linkOpen} linkHref={linkHref} linkError={linkError} linkPlaceholder={linkPlaceholder} emojiOpen={emojiOpen} emojiItems={visibleEmojiItems} onLinkOpenChange={closeLinkEditor} onLinkHrefChange={value => { setLinkHref(value); setLinkError(undefined); }} onOpenLink={openLinkEditor} onApplyLink={applyLink} onEmojiOpenChange={closeEmojiPicker} onOpenEmoji={openEmojiPicker} onInsertEmoji={insertEmoji} />}
      <div className="relative min-w-0">
        {isEmpty && placeholder && <span aria-hidden="true" className="pointer-events-none absolute left-[var(--rui-content-padding)] top-[var(--rui-content-padding)] text-sm leading-relaxed text-muted-foreground">{placeholder}</span>}
        <EditorContent editor={editor} />
      </div>
    </div>
    {visibleError && <div id={errorId} role="alert" className="mt-[var(--rui-space-2)] text-xs text-destructive">{visibleError}</div>}
  </div>;
}
