import type { DiffHunk, LogEntry, QueueTask, ResourceItem } from '@reito/ui';

export const resources: ResourceItem[] = [
  { id: 'settings', name: 'workspace-settings.ts', kind: 'TypeScript', description: '工作区名称与默认密度' },
  { id: 'layout', name: 'workspace-layout.css', kind: 'CSS', description: '共享内容间距' },
  { id: 'notes', name: 'review-notes.md', kind: 'Markdown', description: '未修改的本地示例文件' },
];
export const initialQueue: QueueTask[] = [
  { id: 'layout-review', title: '检查工作区布局', status: 'running', description: '本地状态示例，可暂停或取消' },
  { id: 'focus-review', title: '检查键盘焦点', status: 'queued' },
];
export const initialLogs: LogEntry[] = [{ id: 'ready', level: 'info', source: 'workbench', message: '本地工作台示例已就绪。操作记录只存在于当前页面。' }];
export const sampleReply = '这段回复由本地固定文本逐步显示，用于检查流式消息与停止动作。建议先统一阅读宽度，再用共享间距排列工具调用和产物预览。';

/** The small example supplies explicit before/after pairings; no diff engine or file IO is implied. */
export function fileDiff(id: string, name: string): DiffHunk[] {
  if (id === 'notes') return [];
  if (id === 'layout') return [{ id: 'layout-hunk', header: '@@ -1,3 +1,3 @@', rows: [
    { id: 'layout-open', kind: 'context', before: { lineNumber: 1, text: '.workspace {' }, after: { lineNumber: 1, text: '.workspace {' } },
    { id: 'layout-padding', kind: 'change', before: { lineNumber: 2, text: '  padding: var(--rui-space-6);' }, after: { lineNumber: 2, text: '  padding: var(--rui-content-padding);' } },
    { id: 'layout-close', kind: 'context', before: { lineNumber: 3, text: '}' }, after: { lineNumber: 3, text: '}' } },
  ] }];
  return [{ id: 'settings-hunk', header: '@@ -1,4 +1,4 @@', rows: [
    { id: 'settings-open', kind: 'context', before: { lineNumber: 1, text: 'export const workspace = {' }, after: { lineNumber: 1, text: 'export const workspace = {' } },
    { id: 'settings-name', kind: 'change', before: { lineNumber: 2, text: '  name: "个人工作区",' }, after: { lineNumber: 2, text: `  name: ${JSON.stringify(name)},` } },
    { id: 'settings-density', kind: 'context', before: { lineNumber: 3, text: '  density: "compact",' }, after: { lineNumber: 3, text: '  density: "compact",' } },
    { id: 'settings-close', kind: 'context', before: { lineNumber: 4, text: '};' }, after: { lineNumber: 4, text: '};' } },
  ] }];
}
