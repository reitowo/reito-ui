import { useRef, useState } from 'react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Progress } from '../../primitives/progress.js';
import { cn } from '../../lib/utils.js';

export type UploadStatus = 'queued' | 'uploading' | 'done' | 'failed' | 'rejected';
export type UploadItem = {
  id: string;
  name: string;
  size: number;
  status: UploadStatus;
  progress: number;
  error?: string;
  file?: File;
};
export type DropzoneProps = {
  accept?: string[];
  maxSize?: number;
  onUpload?: (file: File, onProgress: (progress: number) => void) => Promise<void>;
  onChange?: (items: UploadItem[]) => void;
  hint?: string;
  autoplay?: boolean;
  className?: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function allowed(file: File, accept?: string[]) {
  if (!accept?.length) return true;
  return accept.some((rule) => file.name.toLowerCase().endsWith(rule.toLowerCase()));
}

/** Recreated from public Dropzone docs. Not Pro source. Sibling of FileUpload. */
export function Dropzone({
  accept,
  maxSize,
  onUpload,
  onChange,
  hint,
  autoplay = false,
  className,
}: DropzoneProps) {
  const limit = maxSize ?? 25 * 1024 * 1024;
  const input = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<UploadItem[]>([]);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [over, setOver] = useState(false);
  const [live, setLive] = useState(autoplay ? '示例拖入已准备' : '');

  function publish(next: UploadItem[]) {
    itemsRef.current = next;
    setItems(next);
    onChange?.(next);
  }

  function mapItem(id: string, map: (item: UploadItem) => UploadItem) {
    return itemsRef.current.map((item) => (item.id === id ? map(item) : item));
  }

  async function run(file: File, id: string) {
    const patch = (partial: Partial<UploadItem>) =>
      publish(mapItem(id, (item) => ({ ...item, ...partial })));
    try {
      if (onUpload) {
        await onUpload(file, (progress) => patch({ status: 'uploading', progress }));
      } else {
        await new Promise<void>((resolve) => {
          let value = 0;
          const timer = window.setInterval(() => {
            value += 0.25;
            patch({ status: 'uploading', progress: Math.min(1, value) });
            if (value >= 1) {
              window.clearInterval(timer);
              resolve();
            }
          }, 200);
        });
      }
      patch({ status: 'done', progress: 1 });
      setLive(`${file.name} 已完成`);
    } catch (error) {
      patch({ status: 'failed', error: error instanceof Error ? error.message : '上传失败' });
      setLive(`${file.name} 失败`);
    }
  }

  function add(files: File[]) {
    const next = files.map((file) => {
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      if (!allowed(file, accept)) {
        return {
          id,
          name: file.name,
          size: file.size,
          status: 'rejected' as const,
          progress: 0,
          error: '类型不允许',
          file,
        };
      }
      if (file.size > limit) {
        return {
          id,
          name: file.name,
          size: file.size,
          status: 'rejected' as const,
          progress: 0,
          error: '文件过大',
          file,
        };
      }
      return { id, name: file.name, size: file.size, status: 'queued' as const, progress: 0, file };
    });
    const merged = [...itemsRef.current, ...next];
    publish(merged);
    setLive(`加入 ${files.length} 个文件`);
    next
      .filter((item) => item.status === 'queued' && item.file)
      .forEach((item) => void run(item.file!, item.id));
  }

  return (
    <section
      className={cn(
        'grid max-w-lg gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <button
        type="button"
        className={cn(
          'grid gap-1 rounded-[var(--rui-radius)] border border-dashed border-border p-[var(--rui-content-padding)] text-left',
          over && 'border-primary bg-muted',
        )}
        onClick={() => input.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          add([...event.dataTransfer.files]);
        }}
      >
        <Heading size="item">{over ? '放下这些文件' : '拖入文件'}</Heading>
        <Text variant="caption" tone="muted">
          {hint ?? `${accept?.join(' ') || '任意类型'} · 最大 ${formatSize(limit)}`}
        </Text>
      </button>
      <input
        ref={input}
        type="file"
        multiple
        accept={accept?.join(',')}
        className="sr-only"
        onChange={(event) => add([...(event.target.files ?? [])])}
      />
      <ul className="grid gap-1">
        {items.map((item) => (
          <li key={item.id} className="grid gap-1 rounded-[var(--rui-radius)] bg-muted p-2">
            <Inline className="justify-between">
              <Text variant="caption">
                {item.name}
                <Badge variant="secondary" className="ml-1">
                  {item.name.split('.').pop()}
                </Badge>
              </Text>
              <Text variant="caption" tone="muted">
                {formatSize(item.size)}
              </Text>
            </Inline>
            {item.status === 'uploading' || item.status === 'done' ? (
              <Progress
                value={Math.round(item.progress * 100)}
                aria-label={`${item.name} ${Math.round(item.progress * 100)}%`}
              />
            ) : null}
            {item.error ? (
              <Text variant="caption" className="text-destructive">
                {item.error}
              </Text>
            ) : null}
            <Inline>
              {item.status === 'failed' && item.file ? (
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => void run(item.file!, item.id)}
                >
                  重试 {item.name}
                </Button>
              ) : null}
              <Button
                type="button"
                size="xs"
                variant="ghost"
                aria-label={`移除 ${item.name}`}
                onClick={() => publish(itemsRef.current.filter((row) => row.id !== item.id))}
              >
                移除
              </Button>
            </Inline>
          </li>
        ))}
      </ul>
      <Text variant="caption" tone="muted" aria-live="polite">
        {live}
      </Text>
    </section>
  );
}
