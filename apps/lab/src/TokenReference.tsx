import type { ComponentProps } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@reito/ui/basic';
import tokens from '../../../packages/tokens/src/tokens.json';
import { TokenCatalogBody } from './TokenCatalogBody';
import { version } from '../package.json';

export function downloadJson(name: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function TokenReference({
  open,
  onOpenChange,
  finalFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: ComponentProps<typeof DialogContent>['finalFocus'];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        finalFocus={finalFocus}
        className="flex h-[var(--rui-inspector-height)] max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[var(--rui-container-5xl)]"
      >
        <DialogHeader className="shrink-0 gap-[var(--rui-compact-surface-gap)] border-b p-[var(--rui-content-padding)] pr-10">
          <DialogTitle>设计变量</DialogTitle>
          <DialogDescription>查看当前主题的变量，选择条目查看取值和来源。</DialogDescription>
        </DialogHeader>
        <TokenCatalogBody onExport={() => downloadJson(`reito-tokens-${version}.json`, tokens)} />
      </DialogContent>
    </Dialog>
  );
}
