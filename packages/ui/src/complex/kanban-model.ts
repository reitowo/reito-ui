export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  disabled?: boolean;
}
export interface KanbanColumn {
  id: string;
  title: string;
  cardIds: readonly string[];
  disabled?: boolean;
}
export interface KanbanMove {
  cardId: string;
  columnId: string;
  beforeId?: string;
}
export function validateKanban(
  cards: readonly KanbanCard[],
  columns: readonly KanbanColumn[],
): string | undefined {
  if (new Set(cards.map((card) => card.id)).size !== cards.length) return '卡片 id 必须唯一';
  if (new Set(columns.map((column) => column.id)).size !== columns.length) return '列 id 必须唯一';
  const assigned = columns.flatMap((column) => column.cardIds);
  const known = new Set(cards.map((card) => card.id));
  if (new Set(assigned).size !== assigned.length) return '卡片不能同时属于多个位置';
  if (assigned.some((id) => !known.has(id))) return '列引用了不存在的卡片';
  if (assigned.length !== cards.length) return '每张卡片都必须归属一列';
  return undefined;
}
/** Anchor-based insertion keeps filtered-out cards in their original relative order. */
export function moveKanbanCard(
  cards: readonly KanbanCard[],
  columns: readonly KanbanColumn[],
  move: KanbanMove,
): KanbanColumn[] {
  const error = validateKanban(cards, columns);
  if (error) throw new Error(error);
  const card = cards.find((item) => item.id === move.cardId);
  const source = columns.find((column) => column.cardIds.includes(move.cardId));
  const target = columns.find((column) => column.id === move.columnId);
  if (!card || !source || !target) throw new Error('移动源或目标不存在');
  if (card.disabled || source.disabled || target.disabled) throw new Error('该卡片或列禁止移动');
  if (move.beforeId === move.cardId)
    return columns.map((column) => ({ ...column, cardIds: [...column.cardIds] }));
  if (move.beforeId && !target.cardIds.includes(move.beforeId))
    throw new Error('目标卡片不属于目标列');
  const next = columns.map((column) => ({
    ...column,
    cardIds: column.cardIds.filter((id) => id !== move.cardId),
  }));
  const destination = next.find((column) => column.id === move.columnId)!;
  const index = move.beforeId
    ? destination.cardIds.indexOf(move.beforeId)
    : destination.cardIds.length;
  destination.cardIds.splice(index, 0, move.cardId);
  return next;
}
