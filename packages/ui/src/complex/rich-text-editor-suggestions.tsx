import { Extension, type Editor, type Range } from '@tiptap/core';
import { Mention } from '@tiptap/extension-mention';
import { PluginKey } from '@tiptap/pm/state';
import { exitSuggestion, Suggestion, type SuggestionProps } from '@tiptap/suggestion';
import { createRoot, type Root } from 'react-dom/client';
import { AtSign, Braces, Heading1, Heading2, List, ListChecks, ListOrdered, LoaderCircle, Minus, Pilcrow, Quote, type LucideIcon } from 'lucide-react';
import { Button } from '../primitives/button.js';

export interface RichTextEditorMentionItem {
  id: string;
  label: string;
  description?: string;
  keywords?: readonly string[];
  disabled?: boolean;
}

export type RichTextEditorMentionLoader = (query: string, context: { signal: AbortSignal }) => readonly RichTextEditorMentionItem[] | Promise<readonly RichTextEditorMentionItem[]>;

export type RichTextEditorSlashCommandName = 'paragraph' | 'heading-1' | 'heading-2' | 'bullet-list' | 'ordered-list' | 'task-list' | 'blockquote' | 'code-block' | 'horizontal-rule';

export interface RichTextEditorSuggestionError {
  trigger: 'mention';
  query: string;
  cause: unknown;
}

type SuggestionMenuItem = {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon: LucideIcon;
};

type SlashCommandDefinition = SuggestionMenuItem & {
  id: RichTextEditorSlashCommandName;
  keywords: readonly string[];
};

export const richTextEditorSlashCommands: readonly SlashCommandDefinition[] = [
  { id: 'paragraph', label: '正文', description: '普通文本段落', keywords: ['text', 'paragraph', '正文', '段落'], icon: Pilcrow },
  { id: 'heading-1', label: '一级标题', description: '页面主标题', keywords: ['h1', 'heading', '标题'], icon: Heading1 },
  { id: 'heading-2', label: '二级标题', description: '内容分组标题', keywords: ['h2', 'heading', '标题'], icon: Heading2 },
  { id: 'bullet-list', label: '无序列表', description: '项目符号列表', keywords: ['bullet', 'list', '列表'], icon: List },
  { id: 'ordered-list', label: '有序列表', description: '编号列表', keywords: ['ordered', 'number', 'list', '列表'], icon: ListOrdered },
  { id: 'task-list', label: '任务列表', description: '可勾选检查项', keywords: ['task', 'todo', 'check', '任务'], icon: ListChecks },
  { id: 'blockquote', label: '引用', description: '引用当前段落', keywords: ['quote', '引用'], icon: Quote },
  { id: 'code-block', label: '代码块', description: '等宽预格式文本', keywords: ['code', '代码'], icon: Braces },
  { id: 'horizontal-rule', label: '分隔线', description: '分隔内容区块', keywords: ['divider', 'rule', '分隔'], icon: Minus },
] as const;

export const richTextEditorDefaultSlashCommands: readonly RichTextEditorSlashCommandName[] = richTextEditorSlashCommands.map(item => item.id);

type SuggestionExtensionConfig = {
  idPrefix: string;
  isEnabled: () => boolean;
  getMentions: (query: string, signal: AbortSignal) => readonly RichTextEditorMentionItem[] | Promise<readonly RichTextEditorMentionItem[]>;
  getSlashCommands: () => readonly RichTextEditorSlashCommandName[];
  onError: (error: RichTextEditorSuggestionError) => void;
};

function nextEnabled(items: readonly SuggestionMenuItem[], current: number, direction: 1 | -1) {
  if (!items.length) return -1;
  for (let step = 1; step <= items.length; step += 1) {
    const candidate = (current + direction * step + items.length) % items.length;
    if (!items[candidate]?.disabled) return candidate;
  }
  return -1;
}

function edgeEnabled(items: readonly SuggestionMenuItem[], edge: 'first' | 'last') {
  const indexes = edge === 'first' ? items.keys() : Array.from(items.keys()).reverse();
  for (const index of indexes) if (!items[index]?.disabled) return index;
  return -1;
}

function createSuggestionRenderer(kind: 'mention' | 'slash', idPrefix: string) {
  let element: HTMLDivElement | undefined;
  let root: Root | undefined;
  let unmountFloating: (() => void) | undefined;
  let current: SuggestionProps<SuggestionMenuItem, SuggestionMenuItem> | undefined;
  let activeIndex = -1;
  const menuId = `${idPrefix}-${kind}-suggestions`;

  function clearEditorAria() {
    const dom = current?.editor.view.dom;
    if (!dom || dom.getAttribute('aria-controls') !== menuId) return;
    dom.removeAttribute('aria-controls');
    dom.removeAttribute('aria-activedescendant');
    dom.removeAttribute('data-suggestions-open');
  }

  function choose(index: number) {
    const item = current?.items[index];
    if (!item || item.disabled) return;
    current?.command(item);
  }

  function paint(props: SuggestionProps<SuggestionMenuItem, SuggestionMenuItem>, reset = false) {
    current = props;
    if (reset || activeIndex < 0 || activeIndex >= props.items.length || props.items[activeIndex]?.disabled) activeIndex = edgeEnabled(props.items, 'first');
    const dom = props.editor.view.dom;
    dom.setAttribute('aria-controls', menuId);
    dom.setAttribute('data-suggestions-open', 'true');
    if (activeIndex >= 0) dom.setAttribute('aria-activedescendant', `${menuId}-${activeIndex}`);
    else dom.removeAttribute('aria-activedescendant');
    root?.render(<div id={menuId} data-slot="rich-text-editor-suggestion" data-trigger={kind} role="listbox" aria-label={kind === 'mention' ? '提及建议' : '斜杠命令'} aria-busy={props.loading || undefined} className="z-[var(--rui-z-popover)] max-h-[var(--rui-preview-min-height)] w-[var(--rui-container-xs)] max-w-[calc(100vw-var(--rui-space-8))] overflow-auto rounded-lg bg-popover p-[var(--rui-space-1)] text-popover-foreground shadow-md ring-1 ring-foreground/10">
      <div className="flex min-h-[var(--rui-control-height-xs)] items-center px-[var(--rui-space-2)] font-mono text-xs text-muted-foreground">{kind === 'mention' ? `@${props.query}` : `/${props.query}`}</div>
      {props.loading && !props.items.length ? <div role="status" className="flex min-h-[var(--rui-control-height-sm)] items-center gap-[var(--rui-space-2)] px-[var(--rui-space-2)] text-xs text-muted-foreground"><LoaderCircle aria-hidden="true" className="size-3.5 motion-safe:animate-spin" />加载建议…</div> : null}
      {!props.loading && !props.items.length ? <div className="flex min-h-[var(--rui-control-height-sm)] items-center px-[var(--rui-space-2)] text-xs text-muted-foreground">没有匹配项</div> : null}
      {props.items.map((item, index) => {
        const Icon = item.icon;
        return <Button id={`${menuId}-${index}`} key={item.id} type="button" role="option" aria-selected={index === activeIndex} disabled={item.disabled} variant="ghost" size="sm" tabIndex={-1} className="h-auto min-h-[var(--rui-control-height)] w-full justify-start px-[var(--rui-space-2)] text-left data-[active=true]:bg-accent" data-active={index === activeIndex || undefined} onPointerEnter={() => { activeIndex = index; paint(props); }} onPointerDown={event => { event.preventDefault(); choose(index); }}><Icon aria-hidden="true" className="shrink-0" /><span className="min-w-0"><span className="block truncate">{item.label}</span>{item.description && <span className="block truncate text-xs font-normal text-muted-foreground">{item.description}</span>}</span></Button>;
      })}
    </div>);
  }

  return () => ({
    onStart(props: SuggestionProps<SuggestionMenuItem, SuggestionMenuItem>) {
      element = props.editor.view.dom.ownerDocument.createElement('div');
      element.setAttribute('role', 'region');
      element.setAttribute('aria-label', kind === 'mention' ? '提及建议浮层' : '斜杠命令浮层');
      root = createRoot(element);
      unmountFloating = props.mount(element);
      paint(props, true);
    },
    onUpdate(props: SuggestionProps<SuggestionMenuItem, SuggestionMenuItem>) {
      paint(props, props.query !== current?.query);
    },
    onKeyDown({ event }: { event: KeyboardEvent }) {
      if (!current) return false;
      if (event.isComposing || event.keyCode === 229) return false;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        activeIndex = nextEnabled(current.items, activeIndex, event.key === 'ArrowDown' ? 1 : -1);
        paint(current);
        return true;
      }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        activeIndex = edgeEnabled(current.items, event.key === 'Home' ? 'first' : 'last');
        paint(current);
        return true;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        choose(activeIndex);
        return true;
      }
      return false;
    },
    onExit() {
      clearEditorAria();
      root?.unmount();
      unmountFloating?.();
      element = undefined;
      root = undefined;
      unmountFloating = undefined;
      current = undefined;
      activeIndex = -1;
    },
  });
}

function runSlashCommand(editor: Editor, range: Range, id: RichTextEditorSlashCommandName) {
  const chain = editor.chain().focus().deleteRange(range);
  switch (id) {
    case 'paragraph': return chain.setParagraph().run();
    case 'heading-1': return chain.setHeading({ level: 1 }).run();
    case 'heading-2': return chain.setHeading({ level: 2 }).run();
    case 'bullet-list': return chain.toggleBulletList().run();
    case 'ordered-list': return chain.toggleOrderedList().run();
    case 'task-list': return chain.toggleTaskList().run();
    case 'blockquote': return chain.setBlockquote().run();
    case 'code-block': return chain.setCodeBlock().run();
    case 'horizontal-rule': return chain.setHorizontalRule().run();
  }
}

function matches(value: string, query: string) {
  return value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}

export function createRichTextEditorSuggestionExtensions(config: SuggestionExtensionConfig) {
  const mentionPluginKey = new PluginKey(`${config.idPrefix}-mention-suggestion`);
  const slashPluginKey = new PluginKey(`${config.idPrefix}-slash-suggestion`);
  const mention = Mention.configure({
    HTMLAttributes: { 'data-type': 'mention' },
    renderText: ({ node }) => `@${node.attrs.label ?? node.attrs.id}`,
    renderHTML: ({ options, node }) => ['span', options.HTMLAttributes, `@${node.attrs.label ?? node.attrs.id}`],
    suggestion: {
      pluginKey: mentionPluginKey,
      char: '@',
      allow: ({ editor, state, range }) => {
        const $from = state.doc.resolve(range.from);
        const type = state.schema.nodes.mention;
        return config.isEnabled() && !editor.view.composing && Boolean(type && $from.parent.type.contentMatch.matchType(type));
      },
      items: ({ query, signal }) => {
        try {
          const result = config.getMentions(query, signal);
          if (Array.isArray(result)) return result.map(item => ({ ...item, icon: AtSign }));
          return Promise.resolve(result).then(items => items.map(item => ({ ...item, icon: AtSign }))).catch(cause => { if (!signal.aborted) config.onError({ trigger: 'mention', query, cause }); return []; });
        } catch (cause) {
          if (!signal.aborted) config.onError({ trigger: 'mention', query, cause });
          return [];
        }
      },
      command: ({ editor, range, props }) => {
        const selected = props as unknown as RichTextEditorMentionItem;
        if (selected.disabled) return;
        const nodeAfter = editor.view.state.selection.$to.nodeAfter;
        if (nodeAfter?.text?.startsWith(' ')) range.to += 1;
        editor.chain().focus().insertContentAt(range, [{ type: 'mention', attrs: { id: selected.id, label: selected.label, mentionSuggestionChar: '@' } }, { type: 'text', text: ' ' }]).run();
      },
      render: createSuggestionRenderer('mention', config.idPrefix),
    },
  });

  const slash = Extension.create({
    name: 'slashCommand',
    addProseMirrorPlugins() {
      return [Suggestion<SlashCommandDefinition, SuggestionMenuItem>({
        editor: this.editor,
        pluginKey: slashPluginKey,
        char: '/',
        startOfLine: true,
        allowedPrefixes: null,
        allow: ({ editor, state, range }) => {
          const $from = state.doc.resolve(range.from);
          return config.isEnabled() && !editor.view.composing && $from.depth === 1 && $from.parent.type.name === 'paragraph';
        },
        items: ({ query }) => {
          const enabled = new Set(config.getSlashCommands());
          return richTextEditorSlashCommands.filter(item => enabled.has(item.id) && [item.id, item.label, item.description ?? '', ...item.keywords].some(value => matches(value, query)));
        },
        command: ({ editor, range, props }) => runSlashCommand(editor, range, props.id as RichTextEditorSlashCommandName),
        render: createSuggestionRenderer('slash', config.idPrefix),
      })];
    },
  });

  return {
    extensions: [mention, slash],
    exit(editor: Editor) {
      exitSuggestion(editor.view, mentionPluginKey);
      exitSuggestion(editor.view, slashPluginKey);
    },
  };
}
