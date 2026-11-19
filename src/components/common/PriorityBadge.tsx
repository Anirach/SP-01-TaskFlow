import { TaskPriority } from '../../types/taskflow';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  High: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
  Medium:
    'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
  Low: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[13px] font-medium leading-tight rounded border whitespace-nowrap shrink-0 ${PRIORITY_STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}
