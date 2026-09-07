import type { ReactElement } from 'react';
import type { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { ArrowDown, ArrowUp, Braces, Check, Heading1, Heading2, List, ListChecks, ListOrdered, Pilcrow, Quote, Trash2, type LucideIcon } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '../primitives/popover.js';
import { Separator } from '../primitives/separator.js';

export type RichTextEditorBlockAction = 'move-up' | 'move-down' | 'paragraph' | 'heading-1' | 'heading-2' | 'bullet-list' | 'ordered-list' | 'task-list' | 'blockquote' | 'code-block' | 'delete';

export interface RichTextEditorBlockTarget {
  pos: number;
  index: number;
  count: number;
  type: string;
  variant: string;
  text: string;
}

type BlockActionDefinition = {
  label: string;
  icon: LucideIcon;
  group: 'move' | 'transform' | 'danger';
  activeType?: string;
};

const blockActionDefinitions: Record<RichTextEditorBlockAction, BlockActionDefinition> = {
  'move-up': { label: '上移块', icon: ArrowUp, group: 'move' },
  'move-down': { label: '下移块', icon: ArrowDown, group: 'move' },
  paragraph: { label: '转为正文', icon: Pilcrow, group: 'transform', activeType: 'paragraph' },
  'heading-1': { label: '转为一级标题', icon: Heading1, group: 'transform', activeType: 'heading:1' },
  'heading-2': { label: '转为二级标题', icon: Heading2, group: 'transform', activeType: 'heading:2' },
  'bullet-list': { label: '转为无序列表', icon: List, group: 'transform', activeType: 'bulletList' },
  'ordered-list': { label: '转为有序列表', icon: ListOrdered, group: 'transform', activeType: 'orderedList' },
  'task-list': { label: '转为任务列表', icon: ListChecks, group: 'transform', activeType: 'taskList' },
  blockquote: { label: '转为引用', icon: Quote, group: 'transform', activeType: 'blockquote' },
  'code-block': { label: '转为代码块', icon: Braces, group: 'transform', activeType: 'codeBlock' },
  delete: { label: '删除块', icon: Trash2, group: 'danger' },
};

export const richTextEditorDefaultBlockActions: readonly RichTextEditorBlockAction[] = Object.keys(blockActionDefinitions) as RichTextEditorBlockAction[];

function normalizedType(target: RichTextEditorBlockTarget) {
  return target.variant;
}

export function getRichTextEditorBlockTarget(editor: Editor): RichTextEditorBlockTarget | null {
  const { doc, selection } = editor.state;
  if (!doc.childCount) return null;
  let pos: number;
  let index: number;
  if (selection instanceof NodeSelection && selection.$from.depth === 0) {
    pos = selection.from;
    index = -1;
    doc.forEach((_child, offset, childIndex) => {
      if (offset === pos) index = childIndex;
    });
    if (index < 0) return null;
  } else {
    index = Math.min(selection.$from.index(0), doc.childCount - 1);
    pos = 0;
    for (let current = 0; current < index; current += 1) pos += doc.child(current).nodeSize;
  }
  return getRichTextEditorBlockTargetAt(editor, pos, index);
}

export function getRichTextEditorBlockTargetAt(editor: Editor, pos: number, knownIndex?: number): RichTextEditorBlockTarget | null {
  const { doc } = editor.state;
  const node = doc.nodeAt(pos);
  if (!node) return null;
  let index = knownIndex ?? -1;
  if (index < 0) doc.forEach((_child, offset, childIndex) => { if (offset === pos) index = childIndex; });
  if (index < 0) return null;
  const headingType = node.type.name === 'heading' ? `heading:${node.attrs.level ?? 1}` : node.type.name;
  return { pos, index, count: doc.childCount, type: node.type.name, variant: headingType, text: node.textContent };
}

function selectMovedBlock(editor: Editor, pos: number) {
  const safePos = Math.max(0, Math.min(pos, editor.state.doc.content.size));
  editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, safePos)).scrollIntoView());
  editor.commands.focus();
}

export function runRichTextEditorBlockAction(editor: Editor, target: RichTextEditorBlockTarget, action: RichTextEditorBlockAction) {
  const node = editor.state.doc.nodeAt(target.pos);
  if (!node || !editor.isEditable) return false;

  if (action === 'move-up' || action === 'move-down') {
    if ((action === 'move-up' && target.index === 0) || (action === 'move-down' && target.index >= target.count - 1)) return false;
    const destination = action === 'move-up'
      ? target.pos - (editor.state.doc.child(target.index - 1)?.nodeSize ?? 0)
      : target.pos + node.nodeSize + (editor.state.doc.child(target.index + 1)?.nodeSize ?? 0);
    const mappedDestination = destination > target.pos ? destination - node.nodeSize : destination;
    const transaction = editor.state.tr.delete(target.pos, target.pos + node.nodeSize).insert(mappedDestination, node);
    transaction.setSelection(NodeSelection.create(transaction.doc, mappedDestination)).scrollIntoView();
    editor.view.dispatch(transaction);
    editor.commands.focus();
    return true;
  }

  if (action === 'delete') {
    const transaction = editor.state.tr;
    if (target.count === 1) {
      const paragraph = editor.schema.nodes.paragraph?.create();
      if (!paragraph) return false;
      transaction.replaceWith(target.pos, target.pos + node.nodeSize, paragraph).setSelection(NodeSelection.create(transaction.doc, target.pos));
    } else {
      transaction.delete(target.pos, target.pos + node.nodeSize);
      const nextIndex = Math.min(target.index, transaction.doc.childCount - 1);
      let nextPos = 0;
      for (let current = 0; current < nextIndex; current += 1) nextPos += transaction.doc.child(current).nodeSize;
      transaction.setSelection(NodeSelection.create(transaction.doc, nextPos));
    }
    editor.view.dispatch(transaction.scrollIntoView());
    editor.commands.focus();
    return true;
  }

  const from = Math.min(target.pos + 1, editor.state.doc.content.size);
  const to = Math.max(from, Math.min(target.pos + node.nodeSize - 1, editor.state.doc.content.size));
  let chain = editor.chain().focus().setTextSelection({ from, to }).clearNodes();
  switch (action) {
    case 'paragraph': break;
    case 'heading-1': chain = chain.setHeading({ level: 1 }); break;
    case 'heading-2': chain = chain.setHeading({ level: 2 }); break;
    case 'bullet-list': chain = chain.toggleBulletList(); break;
    case 'ordered-list': chain = chain.toggleOrderedList(); break;
    case 'task-list': chain = chain.toggleTaskList(); break;
    case 'blockquote': chain = chain.toggleBlockquote(); break;
    case 'code-block': chain = chain.setCodeBlock(); break;
  }
  const changed = chain.run();
  if (changed) requestAnimationFrame(() => selectMovedBlock(editor, target.pos));
  return changed;
}

export function RichTextEditorBlockMenu({ open, onOpenChange, trigger, editor, target, actions, onAction }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactElement;
  editor: Editor;
  target: RichTextEditorBlockTarget;
  actions: readonly RichTextEditorBlockAction[];
  onAction: (action: RichTextEditorBlockAction) => void;
}) {
  const currentType = normalizedType(target);
  return <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger render={trigger} />
    <PopoverContent align="start" className="w-[var(--rui-container-3xs)] max-w-[calc(100vw-var(--rui-space-8))] gap-[var(--rui-space-1)] p-[var(--rui-space-1)]">
      <PopoverTitle className="px-[var(--rui-space-2)] py-[var(--rui-space-1)] text-xs text-muted-foreground">块操作</PopoverTitle>
      {actions.length ? actions.map((action, index) => {
        const definition = blockActionDefinitions[action];
        const previous = actions[index - 1];
        const separated = previous && blockActionDefinitions[previous].group !== definition.group;
        const active = definition.activeType === currentType;
        const unavailable = (action === 'move-up' && target.index === 0) || (action === 'move-down' && target.index >= target.count - 1) || active;
        const Icon = definition.icon;
        return <div key={action}>{separated && <Separator className="my-[var(--rui-space-1)]" />}<Button type="button" variant="ghost" size="xs" className={definition.group === 'danger' ? 'w-full justify-start text-destructive' : 'w-full justify-start'} disabled={unavailable || !editor.isEditable} aria-pressed={definition.activeType ? active : undefined} onClick={() => onAction(action)}><Icon aria-hidden="true" />{definition.label}{active && <Check aria-hidden="true" className="ml-auto" />}</Button></div>;
      }) : <p className="px-[var(--rui-space-2)] py-[var(--rui-space-1)] text-xs text-muted-foreground">没有可用的块操作</p>}
    </PopoverContent>
  </Popover>;
}
