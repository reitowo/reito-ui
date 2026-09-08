import type { ReactNode } from 'react';
import { Button } from '../primitives/button.js';
import { ArtifactPanel, type ArtifactVersion } from './artifact.js';
import { AttachmentList, Sources, type AttachmentItem, type SourceItem } from './context.js';
import { Message, type MessageProps } from './conversation.js';
import { ToolCall, type ToolCallProps } from './execution.js';
import { MarkdownContent } from './markdown-content.js';
import { classes, ExecutionIcon, type ExecutionStatus } from './shared.js';

export type MessagePartStatus = 'pending' | 'streaming' | 'complete' | 'error';

export interface MessagePartBase {
  /** Stable identity supplied by the host and preserved across stream updates. */
  id: string;
  status?: MessagePartStatus;
  error?: string;
}

export interface TextMessagePart extends MessagePartBase {
  type: 'text';
  text: string;
  format?: 'plain' | 'markdown';
  /** Change this only when replacing a stream rather than appending to it. */
  streamKey?: string;
}

export interface ToolMessagePart extends MessagePartBase {
  type: 'tool';
  title: string;
  content?: ReactNode;
  variant?: ToolCallProps['variant'];
  open?: boolean;
  durationLabel?: string;
}

export interface SourceMessagePart extends MessagePartBase {
  type: 'source';
  items: SourceItem[];
}

export interface AttachmentMessagePart extends MessagePartBase {
  type: 'attachment';
  items: AttachmentItem[];
}

export interface ArtifactMessagePart extends MessagePartBase {
  type: 'artifact';
  title: string;
  versions: ArtifactVersion[];
  version?: string;
  view?: 'preview' | 'code';
}

export interface UnknownMessagePart extends MessagePartBase {
  type: 'unknown';
  originalType?: string;
  label?: string;
  payload?: unknown;
}

export type MessagePart =
  | TextMessagePart
  | ToolMessagePart
  | SourceMessagePart
  | AttachmentMessagePart
  | ArtifactMessagePart
  | UnknownMessagePart;

export interface MessagePartsProps {
  parts: MessagePart[];
  label?: string;
  empty?: ReactNode;
  onRetryPart?: (partId: string) => void;
  onToolOpenChange?: (partId: string, open: boolean) => void;
  onAttachmentRemove?: (partId: string, attachmentId: string) => void;
  onAttachmentRetry?: (partId: string, attachmentId: string) => void;
  onArtifactVersionChange?: (partId: string, version: string) => void;
  onArtifactViewChange?: (partId: string, view: 'preview' | 'code') => void;
  onArtifactClose?: (partId: string) => void;
  renderUnknownPart?: (part: UnknownMessagePart) => ReactNode;
  className?: string;
}

const partStateLabels: Record<Exclude<MessagePartStatus, 'complete'>, string> = {
  pending: '等待内容',
  streaming: '正在更新',
  error: '内容不可用',
};

function executionStatus(status: MessagePartStatus | undefined): ExecutionStatus {
  if (status === 'pending') return 'pending';
  if (status === 'streaming') return 'running';
  if (status === 'error') return 'error';
  return 'success';
}

function PartState({ part, onRetry }: { part: MessagePartBase; onRetry?: () => void }) {
  if (!part.status || part.status === 'complete') return null;
  const status = executionStatus(part.status);
  return <div
    role={part.status === 'error' ? 'alert' : 'status'}
    className={classes('flex min-w-0 items-center gap-[var(--rui-content-gap-sm)] text-xs', part.status === 'error' ? 'text-destructive' : 'text-muted-foreground')}
  >
    <ExecutionIcon status={status} className="size-3.5" />
    <span className="min-w-0 flex-1 break-words">{part.error || partStateLabels[part.status]}</span>
    {part.status === 'error' && onRetry && <Button type="button" variant="ghost" size="xs" onClick={onRetry}>重试</Button>}
  </div>;
}

function unknownPart(part: MessagePart): UnknownMessagePart {
  const record = part as unknown as Record<string, unknown>;
  return {
    id: typeof record.id === 'string' ? record.id : 'unknown',
    type: 'unknown',
    status: typeof record.status === 'string' ? record.status as MessagePartStatus : undefined,
    error: typeof record.error === 'string' ? record.error : undefined,
    originalType: typeof record.originalType === 'string' ? record.originalType : typeof record.type === 'string' ? record.type : undefined,
    label: typeof record.label === 'string' ? record.label : undefined,
    payload: record.payload,
  };
}

/** Maps host-owned structured parts onto Reito's existing AI presentation components. */
export function MessageParts({
  parts,
  label = '消息内容',
  empty = <p className="text-[length:var(--rui-font-interface)] text-muted-foreground">没有消息内容</p>,
  onRetryPart,
  onToolOpenChange,
  onAttachmentRemove,
  onAttachmentRetry,
  onArtifactVersionChange,
  onArtifactViewChange,
  onArtifactClose,
  renderUnknownPart,
  className,
}: MessagePartsProps) {
  return <div data-slot="message-parts" role="group" aria-label={label} className={classes('grid min-w-0 gap-[var(--rui-message-gap)]', className)}>
    {parts.length ? parts.map(part => {
      const retry = onRetryPart ? () => onRetryPart(part.id) : undefined;
      let content: ReactNode;

      switch (part.type) {
        case 'text': {
          const body = part.format === 'plain'
            ? <p aria-busy={part.status === 'streaming' || undefined} className="whitespace-pre-wrap break-words text-[length:var(--rui-font-interface)] leading-6">{part.text}</p>
            : <MarkdownContent value={part.text} streaming={part.status === 'streaming'} streamKey={part.streamKey ?? part.id} />;
          content = <>{body}<PartState part={part} onRetry={retry} /></>;
          break;
        }
        case 'tool':
          content = <ToolCall
            title={part.title}
            status={executionStatus(part.status)}
            variant={part.variant}
            open={part.open}
            durationLabel={part.durationLabel}
            onOpenChange={open => onToolOpenChange?.(part.id, open)}
            onRetry={retry}
          >{part.content}</ToolCall>;
          break;
        case 'source':
          content = <><Sources items={part.items} /><PartState part={part} onRetry={retry} /></>;
          break;
        case 'attachment':
          content = <><AttachmentList
            items={part.items}
            onRemove={onAttachmentRemove ? attachmentId => onAttachmentRemove(part.id, attachmentId) : undefined}
            onRetry={onAttachmentRetry ? attachmentId => onAttachmentRetry(part.id, attachmentId) : undefined}
          /><PartState part={part} onRetry={retry} /></>;
          break;
        case 'artifact':
          content = <><ArtifactPanel
            title={part.title}
            versions={part.versions}
            version={part.version}
            view={part.view}
            onVersionChange={version => onArtifactVersionChange?.(part.id, version)}
            onViewChange={view => onArtifactViewChange?.(part.id, view)}
            onClose={onArtifactClose ? () => onArtifactClose(part.id) : undefined}
          /><PartState part={part} onRetry={retry} /></>;
          break;
        case 'unknown':
        default: {
          const unknown = unknownPart(part);
          const fallback = renderUnknownPart?.(unknown) ?? <div role="note" className="rounded-md border border-dashed px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-xs text-muted-foreground">
            {unknown.label || `暂不支持的消息部分${unknown.originalType ? `：${unknown.originalType}` : ''}`}
          </div>;
          content = <>{fallback}<PartState part={unknown} onRetry={retry} /></>;
          break;
        }
      }

      return <div
        key={part.id}
        data-slot="message-part"
        data-message-part-id={part.id}
        data-message-part-type={part.type}
        data-status={part.status ?? 'complete'}
        className="grid min-w-0 gap-[var(--rui-content-gap-sm)]"
      >{content}</div>;
    }) : empty}
  </div>;
}

export interface StructuredMessageProps extends Omit<MessageProps, 'children'>, Omit<MessagePartsProps, 'className' | 'label'> {
  partsLabel?: string;
  partsClassName?: string;
}

/** Message role and structured part rendering with streaming state derived from its parts. */
export function StructuredMessage({
  parts,
  streaming,
  partsLabel,
  partsClassName,
  empty,
  onRetryPart,
  onToolOpenChange,
  onAttachmentRemove,
  onAttachmentRetry,
  onArtifactVersionChange,
  onArtifactViewChange,
  onArtifactClose,
  renderUnknownPart,
  ...messageProps
}: StructuredMessageProps) {
  const activeStreaming = streaming ?? parts.some(part => part.status === 'streaming');
  return <Message {...messageProps} streaming={activeStreaming}>
    <MessageParts
      parts={parts}
      label={partsLabel}
      className={partsClassName}
      empty={empty}
      onRetryPart={onRetryPart}
      onToolOpenChange={onToolOpenChange}
      onAttachmentRemove={onAttachmentRemove}
      onAttachmentRetry={onAttachmentRetry}
      onArtifactVersionChange={onArtifactVersionChange}
      onArtifactViewChange={onArtifactViewChange}
      onArtifactClose={onArtifactClose}
      renderUnknownPart={renderUnknownPart}
    />
  </Message>;
}
