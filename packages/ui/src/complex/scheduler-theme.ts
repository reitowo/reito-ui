import type {CalendarOptions} from '@fullcalendar/react';
import {tokenMetrics} from '@reito/tokens/metrics';

/** FullCalendar's structural CSS plus original Graphite slot classes. */
export const schedulerTheme:Partial<CalendarOptions>={
 height:tokenMetrics['scheduler-height'],slotMinHeight:tokenMetrics['space-4'],eventMinHeight:tokenMetrics['space-6'],scrollTime:'08:00:00',
 tableClass:'border border-border text-xs text-foreground',
 tableHeaderClass:'bg-card text-muted-foreground',
 dayHeaderClass:'border border-border',dayHeaderInnerClass:'p-[var(--rui-cell-padding-y)] font-medium',
 slotHeaderClass:'border border-border text-muted-foreground',slotHeaderInnerClass:'px-[var(--rui-cell-padding-x)]',
 slotLaneClass:'border-b border-border',dayLaneClass:'border-r border-border',dayLaneInnerClass:'h-full border-r border-border',
 dayCellClass:info=>`border border-border ${info.isToday?'bg-muted':''}`,
 dayCellInnerClass:'min-h-20',dayCellTopInnerClass:'p-[var(--rui-space-1)]',
 allDayHeaderClass:'border border-border',allDayHeaderInnerClass:'p-[var(--rui-cell-padding-y)]',
 allDayDividerClass:'border-b border-border',
 eventClass:'rounded-sm border border-border bg-secondary text-secondary-foreground outline-none focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring',
 eventInnerClass:'px-[var(--rui-space-1)] py-[var(--rui-space-1)]',
 eventTitleClass:'truncate font-medium',eventTimeClass:'text-xs text-muted-foreground',
 columnEventAfterClass:info=>info.isEndResizable?'rui-scheduler-resize-end absolute inset-x-0 bottom-0 h-1 cursor-ns-resize':'',
 rowEventAfterClass:info=>info.isEndResizable?'rui-scheduler-resize-end absolute inset-y-0 right-0 w-2 cursor-ew-resize':'',
 moreLinkClass:'text-xs text-muted-foreground underline',popoverClass:'border border-border bg-popover text-popover-foreground shadow-md',
 highlightClass:'bg-muted',nowIndicatorLineClass:'border-destructive',
};
