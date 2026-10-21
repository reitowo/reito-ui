import { Fragment, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '../lib/utils.js';

export type MiniTimelineTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface MiniTimelineLane {
  id: string;
  label: string;
}

export interface MiniTimelineEvent {
  id: string;
  lane: string;
  /** Accessible and tooltip text, e.g. `18:28:35 读正文与大纲`. */
  label: string;
  tone?: MiniTimelineTone;
}

export interface MiniTimelineMarker {
  /** Event index the marker sits above. */
  index: number;
  label: string;
}

export interface MiniTimelineProps {
  lanes: MiniTimelineLane[];
  /** Chronological events; each occupies one column. */
  events: MiniTimelineEvent[];
  markers?: MiniTimelineMarker[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string) => void;
  label?: string;
  className?: string;
}

const toneClass: Record<MiniTimelineTone, string> = {
  neutral: 'bg-muted-foreground/60',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
};

/** Overview strip of chronological events split into lanes of small ticks; one tab stop. */
export function MiniTimeline({
  lanes,
  events,
  markers = [],
  value,
  defaultValue = null,
  onValueChange,
  label = '事件时间线',
  className,
}: MiniTimelineProps) {
  const [internal, setInternal] = useState(defaultValue);
  const selected = value === undefined ? internal : value;
  const [focusId, setFocusId] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const activeId =
    (focusId && events.some((event) => event.id === focusId) ? focusId : null) ??
    (selected && events.some((event) => event.id === selected) ? selected : events.at(-1)?.id);
  const select = (id: string) => {
    if (value === undefined) setInternal(id);
    onValueChange?.(id);
  };
  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next =
      event.key === 'ArrowRight'
        ? Math.min(events.length - 1, index + 1)
        : event.key === 'ArrowLeft'
          ? Math.max(0, index - 1)
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? events.length - 1
              : -1;
    if (next < 0) return;
    event.preventDefault();
    const id = events[next]!.id;
    setFocusId(id);
    refs.current.get(id)?.focus();
  };
  const markerAt = new Map(markers.map((marker) => [marker.index, marker.label]));
  return (
    <div
      role="group"
      aria-label={label}
      data-slot="mini-timeline"
      className={cn('min-w-0 overflow-x-auto', className)}
    >
      <div className="grid w-max grid-cols-[auto_auto] items-center gap-x-2 gap-y-px text-2xs text-muted-foreground">
        {markers.length > 0 && (
          <>
            <span aria-hidden="true" />
            <div aria-hidden="true" className="flex gap-px">
              {events.map((event, index) => (
                <span key={event.id} className="relative h-[var(--rui-line-micro)] w-1.5">
                  {markerAt.has(index) && (
                    <span className="absolute left-0 whitespace-nowrap">{markerAt.get(index)}</span>
                  )}
                </span>
              ))}
            </div>
          </>
        )}
        {lanes.map((lane) => (
          <Fragment key={lane.id}>
            <span className="leading-none">{lane.label}</span>
            <div className="flex gap-px">
              {events.map((event, index) => {
                const isSelected = event.id === selected;
                if (event.lane !== lane.id)
                  return (
                    <span
                      key={event.id}
                      aria-hidden="true"
                      className={cn('h-2 w-1.5 rounded-2xs', isSelected && 'bg-info-soft')}
                    />
                  );
                return (
                  <button
                    key={event.id}
                    ref={(node) => {
                      if (node) refs.current.set(event.id, node);
                      else refs.current.delete(event.id);
                    }}
                    type="button"
                    tabIndex={event.id === activeId ? 0 : -1}
                    aria-label={`${lane.label} · ${event.label}`}
                    aria-pressed={isSelected}
                    title={event.label}
                    data-tone={event.tone ?? 'neutral'}
                    onFocus={() => setFocusId(event.id)}
                    onKeyDown={(keyEvent) => move(keyEvent, index)}
                    onClick={() => select(event.id)}
                    className={cn(
                      [
                        // Layout
                        'h-2 w-1.5',
                        // Surface
                        'rounded-2xs outline-none',
                        // Pointer interaction
                        'hover:opacity-80',
                        // Keyboard focus
                        'focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-ring',
                        // Component state
                        'aria-pressed:outline-1 aria-pressed:outline-offset-1 aria-pressed:outline-info',
                      ],
                      toneClass[event.tone ?? 'neutral'],
                    )}
                  />
                );
              })}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
