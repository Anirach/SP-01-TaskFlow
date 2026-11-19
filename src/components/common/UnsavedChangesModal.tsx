import { useEffect, useRef } from 'react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onKeepEditing: () => void;
  onDiscardChanges: () => void;
}

export function UnsavedChangesModal({
  isOpen,
  title = 'Discard unsaved changes?',
  message = 'You have unsaved edits that will be lost if you leave now.',
  onKeepEditing,
  onDiscardChanges,
}: UnsavedChangesModalProps) {
  const keepBtnRef = useRef<HTMLButtonElement>(null);
  const discardBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prevFocused = document.activeElement as HTMLElement | null;
    keepBtnRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onKeepEditing();
      } else if (e.key === 'Tab') {
        const focusables = [keepBtnRef.current, discardBtnRef.current].filter(
          Boolean
        ) as HTMLElement[];
        if (focusables.length === 0) return;
        const currentIndex = focusables.indexOf(
          document.activeElement as HTMLElement
        );
        if (e.shiftKey) {
          e.preventDefault();
          const prevIdx =
            currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1;
          focusables[prevIdx]?.focus();
        } else {
          e.preventDefault();
          const nextIdx = (currentIndex + 1) % focusables.length;
          focusables[nextIdx]?.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      prevFocused?.focus?.();
    };
  }, [isOpen, onKeepEditing]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-dialog-title"
      aria-describedby="unsaved-dialog-desc"
    >
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6">
        <h3
          id="unsaved-dialog-title"
          className="text-[18px] font-semibold text-[#172B4D] dark:text-slate-100"
        >
          {title}
        </h3>
        <p
          id="unsaved-dialog-desc"
          className="mt-2 text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed"
        >
          {message}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            ref={keepBtnRef}
            type="button"
            onClick={onKeepEditing}
            className="min-h-[44px] px-4 py-2 text-[15px] font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#172B4D] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            Keep editing
          </button>
          <button
            ref={discardBtnRef}
            type="button"
            onClick={onDiscardChanges}
            className="min-h-[44px] px-4 py-2 text-[15px] font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors whitespace-nowrap"
          >
            Discard changes
          </button>
        </div>
      </div>
    </div>
  );
}
