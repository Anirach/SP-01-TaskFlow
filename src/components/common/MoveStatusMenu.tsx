import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { TaskStatus, TASK_STATUSES } from '../../types/taskflow';

interface MoveStatusMenuProps {
  currentStatus: TaskStatus;
  taskTitle: string;
  onSelectStatus: (status: TaskStatus) => void;
  compact?: boolean;
  label?: string;
}

export function MoveStatusMenu({
  currentStatus,
  taskTitle,
  onSelectStatus,
  compact = false,
  label = 'Move to',
}: MoveStatusMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handlePick = (e: React.MouseEvent, status: TaskStatus) => {
    e.stopPropagation();
    setOpen(false);
    if (status !== currentStatus) {
      onSelectStatus(status);
    }
    buttonRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Move ${taskTitle} to status (current: ${currentStatus})`}
        onClick={handleToggle}
        className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 py-2 text-[14px] font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#172B4D] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors whitespace-nowrap shrink-0 ${
          compact ? 'text-[13px]' : ''
        }`}
      >
        <span>{label}</span>
        <ChevronDown
          className="w-4 h-4 text-slate-500 dark:text-slate-400"
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={`Move ${taskTitle} to stage`}
          className="absolute right-0 mt-1 w-44 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg py-1 z-30"
        >
          {TASK_STATUSES.map((status) => {
            const isCurrent = status === currentStatus;
            return (
              <button
                key={status}
                type="button"
                role="menuitemradio"
                aria-checked={isCurrent}
                onClick={(e) => handlePick(e, status)}
                className={`w-full flex items-center justify-between px-3 min-h-[44px] text-left text-[14px] transition-colors ${
                  isCurrent
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-[#1D4ED8] dark:text-blue-300 font-medium'
                    : 'text-[#172B4D] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/80'
                }`}
              >
                <span>{status}</span>
                {isCurrent && (
                  <Check
                    className="w-4 h-4 text-[#1D4ED8] dark:text-blue-300"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
