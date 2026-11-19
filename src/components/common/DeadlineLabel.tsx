import { TaskStatus } from '../../types/taskflow';
import { formatCalendarDate, getDeadlineUrgency } from '../../utils/dateUtils';

interface DeadlineLabelProps {
  dueDate: string | null;
  status: TaskStatus;
}

export function DeadlineLabel({ dueDate, status }: DeadlineLabelProps) {
  if (!dueDate) {
    return (
      <span className="text-[14px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
        No deadline
      </span>
    );
  }

  const formatted = formatCalendarDate(dueDate);
  const urgency = getDeadlineUrgency(dueDate, status);

  if (urgency === 'Overdue') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[14px] whitespace-nowrap tabular-nums">
        <span className="font-semibold text-red-700 dark:text-red-400">
          Overdue
        </span>
        <span
          className="text-slate-400 dark:text-slate-600"
          aria-hidden="true"
        >
          ·
        </span>
        <span className="text-red-700 dark:text-red-400">{formatted}</span>
      </span>
    );
  }

  if (urgency === 'Due today') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[14px] whitespace-nowrap tabular-nums">
        <span className="font-semibold text-amber-700 dark:text-amber-400">
          Due today
        </span>
        <span
          className="text-slate-400 dark:text-slate-600"
          aria-hidden="true"
        >
          ·
        </span>
        <span className="text-amber-700 dark:text-amber-400">{formatted}</span>
      </span>
    );
  }

  return (
    <span className="text-[14px] text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
      {formatted}
    </span>
  );
}
