import { Fragment, useState } from 'react';
import { WrapText } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { cx } from './shared.js';

export interface DiffSourceLine { lineNumber: number; text: string; }
export type DiffRow = { id: string } & (
  | { kind: 'context'; before: DiffSourceLine; after: DiffSourceLine }
  | { kind: 'change'; before: DiffSourceLine; after?: DiffSourceLine }
  | { kind: 'change'; before?: DiffSourceLine; after: DiffSourceLine }
);
export interface DiffHunk { id: string; header: string; rows: DiffRow[]; }
export type DiffView = 'unified' | 'split';
export interface DiffViewerProps {
  hunks: DiffHunk[];
  filename?: string;
  beforeLabel?: string;
  afterLabel?: string;
  view?: DiffView;
  defaultView?: DiffView;
  onViewChange?: (view: DiffView) => void;
  defaultWrap?: boolean;
  binary?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  className?: string;
}

const cellPadding = 'px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]';
// Source rows share one baseline; table-content padding would separate every line.
const codeCellPadding = 'px-[var(--rui-cell-padding-x)] py-0 align-top';

function LineMark({ kind }: { kind: 'context' | 'added' | 'removed' }) {
  return <>
    <span className="sr-only">{kind === 'added' ? '新增行' : kind === 'removed' ? '删除行' : '未修改行'}</span>
    <span aria-hidden="true">{kind === 'added' ? '+' : kind === 'removed' ? '−' : ' '}</span>
  </>;
}

/** Hosts supply both the diff and any before/after pairing. This viewer does not calculate a diff. */
export function DiffViewer({
  hunks, filename = '文件差异', beforeLabel = '修改前', afterLabel = '修改后',
  view, defaultView = 'unified', onViewChange, defaultWrap = false,
  binary = false, error, onRetry, emptyMessage = '没有提供文本差异', className,
}: DiffViewerProps) {
  const [internalView, setInternalView] = useState<DiffView>(defaultView);
  const [wrap, setWrap] = useState(defaultWrap);
  const activeView = view ?? internalView;
  const visibleHunks = hunks.filter(hunk => hunk.rows.length > 0);
  const codeClass = cx('block font-mono', wrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre');
  const additions = hunks.flatMap(hunk => hunk.rows).filter(row => row.kind === 'change' && row.after).length;
  const removals = hunks.flatMap(hunk => hunk.rows).filter(row => row.kind === 'change' && row.before).length;
  const available = !error && !binary && visibleHunks.length > 0;

  function changeView(next: DiffView) {
    if (view === undefined) setInternalView(next);
    onViewChange?.(next);
  }

  function unifiedLine(row: DiffRow, kind: 'context' | 'added' | 'removed') {
    const line = kind === 'removed' ? row.before : row.after;
    if (!line) return null;
    return <tr key={`${row.id}-${kind}`} className={cx(kind === 'added' && 'bg-success/10', kind === 'removed' && 'bg-destructive/10')}>
      <td className={cx(codeCellPadding, 'w-12 text-right text-muted-foreground')}>{kind === 'added' ? '' : row.before?.lineNumber}</td>
      <td className={cx(codeCellPadding, 'w-12 text-right text-muted-foreground')}>{kind === 'removed' ? '' : row.after?.lineNumber}</td>
      <td className={cx(codeCellPadding, 'w-8 text-center')}><LineMark kind={kind} /></td>
      <td className={codeCellPadding}><code className={codeClass}>{line.text || ' '}</code></td>
    </tr>;
  }

  function splitSide(line: DiffSourceLine | undefined, kind: 'context' | 'added' | 'removed') {
    if (!line) return <td colSpan={3} className={cx(codeCellPadding, 'text-center text-muted-foreground')}><span className="sr-only">此侧无对应行</span><span aria-hidden="true">—</span></td>;
    const tone = kind === 'added' ? 'bg-success/10' : kind === 'removed' ? 'bg-destructive/10' : undefined;
    return <>
      <td className={cx(codeCellPadding, 'w-12 text-right text-muted-foreground', tone)}>{line.lineNumber}</td>
      <td className={cx(codeCellPadding, 'w-8 text-center', tone)}><LineMark kind={kind} /></td>
      <td className={cx(codeCellPadding, tone)}><code className={codeClass}>{line.text || ' '}</code></td>
    </>;
  }

  return <section aria-label={filename} className={cx('min-w-0 space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <header className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)]">
      <div className="min-w-0">
        <h3 className="break-all font-medium">{filename}</h3>
        {available && <p className="text-xs text-muted-foreground">新增 {additions} 行 · 删除 {removals} 行</p>}
      </div>
      <div className="flex flex-wrap items-center gap-[var(--rui-content-gap-sm)]">
        <div role="group" aria-label="差异布局" className="flex gap-1">
          <Button variant={activeView === 'unified' ? 'secondary' : 'ghost'} size="sm" aria-pressed={activeView === 'unified'} disabled={!available} onClick={() => changeView('unified')}>统一视图</Button>
          <Button variant={activeView === 'split' ? 'secondary' : 'ghost'} size="sm" aria-pressed={activeView === 'split'} disabled={!available} onClick={() => changeView('split')}>并排视图</Button>
        </div>
        <Button variant="ghost" size="sm" aria-pressed={wrap} disabled={!available} onClick={() => setWrap(value => !value)}><WrapText aria-hidden="true" />自动换行</Button>
      </div>
    </header>
    {error ? <div role="alert" className="space-y-[var(--rui-content-gap-sm)] rounded-lg border border-border p-[var(--rui-content-padding)]">
      <p className="text-destructive">{error}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>重新加载差异</Button>}
    </div> : binary ? <p className="rounded-lg border border-border p-[var(--rui-content-padding)] text-muted-foreground">二进制文件：不提供文本差异预览。</p>
      : !visibleHunks.length ? <p className="p-[var(--rui-content-padding)] text-muted-foreground">{emptyMessage}</p>
        : <div role="region" aria-label={`${filename}差异内容`} tabIndex={0} className="max-h-96 overflow-auto rounded-lg border border-border focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:-outline-offset-[var(--rui-outline-width)] focus-visible:outline-ring">
          <table className={cx('w-full border-collapse text-left text-xs', wrap && 'table-fixed')}>
            <caption className="sr-only">{activeView === 'unified' ? '统一差异' : '并排差异'}：{beforeLabel}与{afterLabel}</caption>
            <colgroup>{activeView === 'unified' ? <>
              <col className="w-12" /><col className="w-12" /><col className="w-8" /><col />
            </> : <>
              <col className="w-12" /><col className="w-8" /><col /><col className="w-12" /><col className="w-8" /><col />
            </>}</colgroup>
            <thead className="bg-muted/40 text-muted-foreground"><tr>
              {activeView === 'unified' ? <>
                <th scope="col" className={cx(cellPadding, 'w-12')}>旧行</th><th scope="col" className={cx(cellPadding, 'w-12')}>新行</th>
                <th scope="col" className={cx(cellPadding, 'w-8')}><span className="sr-only">变更类型</span></th><th scope="col" className={cellPadding}>内容</th>
              </> : <><th scope="colgroup" colSpan={3} className={cellPadding}>{beforeLabel}</th><th scope="colgroup" colSpan={3} className={cellPadding}>{afterLabel}</th></>}
            </tr></thead>
            <tbody className="font-mono leading-[var(--rui-line-interface)]">{visibleHunks.map(hunk => <Fragment key={hunk.id}>
              <tr className="border-y border-border bg-muted/30"><th scope="rowgroup" colSpan={activeView === 'unified' ? 4 : 6} className={cx(codeCellPadding, 'font-normal text-muted-foreground')}><code>{hunk.header}</code></th></tr>
              {hunk.rows.map(row => activeView === 'unified' ? <Fragment key={row.id}>
                {row.kind === 'context' ? unifiedLine(row, 'context') : <>{unifiedLine(row, 'removed')}{unifiedLine(row, 'added')}</>}
              </Fragment> : <tr key={row.id}>
                {splitSide(row.before, row.kind === 'context' ? 'context' : 'removed')}
                {splitSide(row.after, row.kind === 'context' ? 'context' : 'added')}
              </tr>)}
            </Fragment>)}</tbody>
          </table>
        </div>}
  </section>;
}
