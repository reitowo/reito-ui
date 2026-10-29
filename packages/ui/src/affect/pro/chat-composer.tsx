import { useState } from 'react';
import { Mic, Paperclip, Shield } from 'lucide-react';
import { Composer } from '../../ai/composer.js';
import { Inline } from '../../basic/composition.js';
import { Button } from '../button.js';
import { ModelSelector, type ModelOption } from '../../ai/model-selector.js';
import { cn } from '../../lib/utils.js';

export type ChatModel = ModelOption & { id: string };
export type ChatComposerProps = {
  placeholder?: string;
  models?: ChatModel[];
  loadMs?: number;
  dictation?: string;
  onSend?: (message: string, details: { model: string }) => void;
  onModelChange?: (model: ChatModel) => void;
  onAttach?: () => void;
  onConnectApps?: () => void;
  onRequestApproval?: () => void;
  onSelectProject?: () => void;
  className?: string;
};

const defaultModels: ChatModel[] = [
  { id: 'auto', name: '自动', description: '按消息选择' },
  { id: 'sample', name: '示例模型', description: '本地选项' },
];

/** Recreated from public Chat Composer docs: gray tray, elevated card, Affect Button actions. */
export function ChatComposer({
  placeholder = '从输入开始…',
  models = defaultModels,
  dictation = '起草一段简短更新…',
  onSend,
  onModelChange,
  onAttach,
  onConnectApps,
  onRequestApproval,
  onSelectProject,
  className,
}: ChatComposerProps) {
  const [model, setModel] = useState(models[0]?.id ?? 'auto');
  const [recording, setRecording] = useState(false);
  const [draft, setDraft] = useState('');
  const current = models.find((item) => item.id === model) ?? models[0];

  return (
    <div
      className={cn('rounded-[var(--rui-radius-lg)] bg-muted p-[var(--rui-space-2)]', className)}
    >
      <div
        className={cn(
          'grid min-w-0 gap-[var(--rui-content-gap-sm)] rounded-[var(--rui-radius-composer)]',
          'border border-border bg-card p-[var(--rui-content-padding)] shadow-sm',
        )}
      >
        <Composer
          value={draft}
          onValueChange={setDraft}
          placeholder={recording ? dictation : placeholder}
          onSubmit={(text) => {
            onSend?.(text, { model });
            setDraft('');
          }}
          toolbar={
            <Inline>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                icon={<Paperclip />}
                aria-label="添加附件"
                onClick={onAttach}
              />
              <ModelSelector
                options={models}
                value={model}
                compact
                size="xs"
                onValueChange={(next) => {
                  setModel(next);
                  const picked = models.find((item) => item.id === next);
                  if (picked) onModelChange?.(picked);
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                icon={<Mic />}
                aria-pressed={recording}
                aria-label={recording ? '停止录音示例' : '语音输入示例'}
                onClick={() => {
                  setRecording((value) => !value);
                  if (!recording) setDraft(dictation);
                }}
              />
            </Inline>
          }
        />
        <Inline>
          <Button type="button" size="sm" variant="ghost" onClick={onConnectApps}>
            连接应用
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onSelectProject}>
            选择项目
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            icon={<Shield />}
            onClick={onRequestApproval}
          >
            请求批准
          </Button>
          {current ? (
            <span className="ml-auto text-[length:var(--rui-font-caption)] text-muted-foreground">
              {current.name}
            </span>
          ) : null}
        </Inline>
      </div>
    </div>
  );
}
