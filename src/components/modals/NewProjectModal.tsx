import React, { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Project } from '../../types/taskflow';
import { validateProjectName } from '../../utils/taskUtils';
import { UnsavedChangesModal } from '../common/UnsavedChangesModal';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export function NewProjectModal({
  isOpen,
  onClose,
  onCreated,
}: NewProjectModalProps) {
  const { projects, createProject } = useWorkspace();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const createBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const fieldId = useId();
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    setName('');
    setError(null);
    setShowUnsavedPrompt(false);

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    return () => {
      window.clearTimeout(timer);
      prevFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  const requestClose = () => {
    if (name.trim().length > 0) {
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (showUnsavedPrompt) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
      } else if (e.key === 'Tab') {
        const focusables = [
          closeBtnRef.current,
          inputRef.current,
          cancelBtnRef.current,
          createBtnRef.current,
        ].filter(Boolean) as HTMLElement[];
        if (focusables.length === 0) return;
        const idx = focusables.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey) {
          e.preventDefault();
          const prevIdx = idx <= 0 ? focusables.length - 1 : idx - 1;
          focusables[prevIdx]?.focus();
        } else {
          e.preventDefault();
          const nextIdx = (idx + 1) % focusables.length;
          focusables[nextIdx]?.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateProjectName(name, projects);
    if (validationError) {
      setError(validationError);
      inputRef.current?.focus();
      return;
    }

    try {
      const created = createProject(name);
      onCreated(created);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not create project.'
      );
      inputRef.current?.focus();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            requestClose();
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-project-title"
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-6"
        >
          <div className="flex items-center justify-between gap-2">
            <h2
              id="new-project-title"
              className="text-[18px] font-bold text-[#172B4D] dark:text-slate-100"
            >
              New project
            </h2>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={requestClose}
              aria-label="Close new project dialog"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-5">
            <div>
              <label
                htmlFor={fieldId}
                className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5"
              >
                Project name <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <input
                ref={inputRef}
                id={fieldId}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${fieldId}-error` : undefined}
                placeholder="e.g. Service handbook"
                className={`w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border rounded-lg text-[#172B4D] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                  error
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              {error && (
                <p
                  id={`${fieldId}-error`}
                  role="alert"
                  className="mt-1.5 text-[13px] font-medium text-red-700 dark:text-red-400"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={requestClose}
                className="min-h-[44px] px-4 py-2 text-[15px] font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#172B4D] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                ref={createBtnRef}
                type="submit"
                className="min-h-[44px] px-5 py-2 text-[15px] font-medium rounded-lg bg-[#1D4ED8] text-white hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={showUnsavedPrompt}
        onKeepEditing={() => setShowUnsavedPrompt(false)}
        onDiscardChanges={() => {
          setShowUnsavedPrompt(false);
          onClose();
        }}
      />
    </>
  );
}
