import { Check, CircleAlert } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { cx } from './shared.js';

export interface Step { id: string; title: string; description?: string; disabled?: boolean; error?: boolean; }
export interface StepperProps { steps: Step[]; value: string; onValueChange?: (id: string) => void; label?: string; className?: string; }
/** Selection is controlled by the host; whether future steps are enabled is an explicit per-step decision. */
export function Stepper({ steps, value, onValueChange, label = '操作步骤', className }: StepperProps) {
  const activeIndex = steps.findIndex(step => step.id === value);
  return <nav aria-label={label} className={cx('font-sans text-sm text-foreground', className)}><ol className="flex flex-col gap-4 sm:flex-row">{steps.map((step, index) => <li key={step.id} className="relative min-w-0 flex-1">
    <Button variant="ghost" disabled={step.disabled || !onValueChange} aria-current={step.id === value ? 'step' : undefined} onClick={() => onValueChange?.(step.id)} className="h-auto min-h-[var(--rui-control-height)] w-full justify-start gap-3 px-1 py-1 text-left whitespace-normal disabled:opacity-100">
      <span className={cx('flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs', step.error ? 'border-destructive/50 text-destructive' : step.id === value ? 'border-primary bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{step.error ? <CircleAlert aria-hidden="true" className="size-4" /> : index < activeIndex ? <Check aria-hidden="true" className="size-4" /> : index + 1}</span>
      <span className="min-w-0"><span className="block text-sm font-medium">{step.title}{step.error && <span className="sr-only">：需要处理错误</span>}</span>{step.description && <span className="mt-1 block text-xs font-normal text-muted-foreground">{step.description}</span>}</span>
    </Button>
  </li>)}</ol></nav>;
}
