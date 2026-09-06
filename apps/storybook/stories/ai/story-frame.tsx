import type { ReactNode } from 'react';

export function StoryFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto grid w-full max-w-2xl gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">{children}</div>;
}
