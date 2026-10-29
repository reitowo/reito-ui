import { test, expect } from '@playwright/test';
import { moveKanbanCard, validateKanban } from '../packages/ui/src/complex/kanban-model.js';
const cards = [
  { id: 'a', title: 'A' },
  { id: 'hidden', title: '隐藏卡片' },
  { id: 'b', title: 'B' },
];
const columns = [
  { id: 'todo', title: '待办', cardIds: ['a', 'hidden', 'b'] },
  { id: 'done', title: '完成', cardIds: [] },
];
test('cross-column move preserves identities and source order', () => {
  const next = moveKanbanCard(cards, columns, { cardId: 'a', columnId: 'done' });
  expect(next.map((column) => column.cardIds)).toEqual([['hidden', 'b'], ['a']]);
  expect(columns[0].cardIds).toEqual(['a', 'hidden', 'b']);
});
test('filtered anchors retain unseen cards', () => {
  expect(
    moveKanbanCard(cards, columns, { cardId: 'b', columnId: 'todo', beforeId: 'a' })[0].cardIds,
  ).toEqual(['b', 'a', 'hidden']);
});
test('invalid ownership and disabled destinations are rejected', () => {
  expect(
    validateKanban(cards, [...columns, { id: 'duplicate', title: '重复', cardIds: ['a'] }]),
  ).toContain('多个位置');
  expect(() =>
    moveKanbanCard(cards, [columns[0], { ...columns[1], disabled: true }], {
      cardId: 'a',
      columnId: 'done',
    }),
  ).toThrow('禁止');
  expect(() =>
    moveKanbanCard(cards, columns, { cardId: 'a', columnId: 'done', beforeId: 'b' }),
  ).toThrow('目标列');
});
