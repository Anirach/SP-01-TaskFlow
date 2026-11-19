import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, RefreshCw, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Task,
  TaskInput,
  TaskPriority,
  TaskStatus,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../../types/taskflow';
import {
  TaskValidationErrors,
  validateTaskInput,
} from '../../utils/taskUtils';
import { UnsavedChangesModal } from '../common/UnsavedChangesModal';

interface TaskEditorPanelProps {
  mode: 'create' | 'edit';
  initialTask?: Task;
  defaultProjectId?: string;
  onCancel: () => void;
  onSaved: (task: Task) => void;
}

export function TaskEditorPanel({
  mode,
  initialTask,
  defaultProjectId,
  onCancel,
  onSaved,
}: TaskEditorPanelProps) {
  const { projects, members, createTask, updateTask } = useWorkspace();

  const initialValues: TaskInput = {
    title: initialTask?.title ?? '',
    description: initialTask?.description ?? '',
    projectId:
      initialTask?.projectId ??
      defaultProjectId ??
      (projects[0]?.id ?? ''),
    assigneeId: initialTask?.assigneeId ?? null,
    priority: initialTask?.priority ?? 'Medium',
    status: initialTask?.status ?? 'To do',
    dueDate: initialTask?.dueDate ?? null,
  };

  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [projectId, setProjectId] = useState(initialValues.projectId);
  const [assigneeId, setAssigneeId] = useState<string>(
    initialValues.assigneeId ?? ''
  );
  const [priority, setPriority] = useState<TaskPriority>(
    initialValues.priority
  );
  const [status, setStatus] = useState<TaskStatus>(initialValues.status);
  const [dueDate, setDueDate] = useState<string>(initialValues.dueDate ?? '');

  const [errors, setErrors] = useState<TaskValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const projectSelectRef = useRef<HTMLSelectElement>(null);
  const prioritySelectRef = useRef<HTMLSelectElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);
  const statusSelectRef = useRef<HTMLSelectElement>(null);

  const titleId = useId();
  const descId = useId();
  const projectFieldId = useId();
  const assigneeFieldId = useId();
  const priorityFieldId = useId();
  const dueDateFieldId = useId();
  const statusFieldId = useId();

  useEffect(() => {
    const prevFocused = document.activeElement as HTMLElement | null;
    titleInputRef.current?.focus();
    return () => {
      prevFocused?.focus?.();
    };
  }, []);

  const isDirty =
    title !== initialValues.title ||
    description !== initialValues.description ||
    projectId !== initialValues.projectId ||
    (assigneeId || null) !== initialValues.assigneeId ||
    priority !== initialValues.priority ||
    status !== initialValues.status ||
    (dueDate || null) !== initialValues.dueDate;

  const requestCancel = () => {
    if (isSaving) return;
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      onCancel();
    }
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !showUnsavedModal) {
        e.preventDefault();
        requestCancel();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  const buildInput = (): TaskInput => ({
    title,
    description,
    projectId,
    assigneeId: assigneeId === '' ? null : assigneeId,
    priority,
    status,
    dueDate: dueDate === '' ? null : dueDate,
  });

  const focusFirstInvalid = (validationErrors: TaskValidationErrors) => {
    if (validationErrors.title) {
      titleInputRef.current?.focus();
    } else if (validationErrors.description) {
      descriptionRef.current?.focus();
    } else if (validationErrors.projectId) {
      projectSelectRef.current?.focus();
    } else if (validationErrors.priority) {
      prioritySelectRef.current?.focus();
    } else if (validationErrors.dueDate) {
      dueDateInputRef.current?.focus();
    } else if (validationErrors.status) {
      statusSelectRef.current?.focus();
    }
  };

  const performSave = async () => {
    if (isSaving) return;
    const input = buildInput();
    const validationErrors = validateTaskInput(input, projects);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      focusFirstInvalid(validationErrors);
      return;
    }

    setErrors({});
    setSaveError(null);
    setIsSaving(true);

    try {
      const saved =
        mode === 'edit' && initialTask
          ? await updateTask(initialTask.id, input)
          : await createTask(input);
      onSaved(saved);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Could not save task.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void performSave();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex justify-end bg-slate-900/35 dark:bg-slate-950/70"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            requestCancel();
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-editor-title"
          className="w-full md:max-w-xl bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl md:border-l md:border-slate-200 dark:md:border-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={requestCancel}
                aria-label="Back"
                className="md:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 rounded-lg text-[#172B4D] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <h2
                id="task-editor-title"
                className="text-[18px] font-bold text-[#172B4D] dark:text-slate-100"
              >
                {mode === 'create' ? 'New task' : 'Edit task'}
              </h2>
            </div>

            <button
              type="button"
              onClick={requestCancel}
              aria-label="Close task editor"
              className="hidden md:inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#172B4D] dark:hover:text-white"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
              {saveError && (
                <div
                  role="alert"
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-[14px] text-red-800 dark:text-red-200"
                >
                  <span>{saveError}</span>
                  <button
                    type="button"
                    onClick={() => void performSave()}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1 rounded-md border border-red-300 dark:border-red-700 bg-white dark:bg-slate-900 text-red-800 dark:text-red-200 font-medium hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {/* Title */}
              <div>
                <label
                  htmlFor={titleId}
                  className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5"
                >
                  Title <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <input
                  ref={titleInputRef}
                  id={titleId}
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) {
                      setErrors((prev) => ({ ...prev, title: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? `${titleId}-error` : undefined}
                  placeholder="Enter a clear task title"
                  className={`w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border rounded-lg text-[#172B4D] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                    errors.title
                      ? 'border-red-500'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.title && (
                  <p
                    id={`${titleId}-error`}
                    className="mt-1.5 text-[13px] font-medium text-red-700 dark:text-red-400"
                  >
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor={descId}
                    className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200"
                  >
                    Description
                  </label>
                  {(description.length >= 1600 || errors.description) && (
                    <span
                      className={`text-[13px] tabular-nums ${
                        description.length > 2000
                          ? 'text-red-700 dark:text-red-400 font-medium'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {description.length} / 2,000
                    </span>
                  )}
                </div>
                <textarea
                  ref={descriptionRef}
                  id={descId}
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={
                    errors.description ? `${descId}-error` : undefined
                  }
                  placeholder="Add context, links, or acceptance notes"
                  className={`w-full px-3 py-2.5 text-[15px] bg-white dark:bg-slate-950 border rounded-lg text-[#172B4D] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                    errors.description
                      ? 'border-red-500'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.description && (
                  <p
                    id={`${descId}-error`}
                    className="mt-1.5 text-[13px] font-medium text-red-700 dark:text-red-400"
                  >
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project */}
                <div>
                  <label
                    htmlFor={projectFieldId}
                    className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5"
                  >
                    Project <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <select
                    ref={projectSelectRef}
                    id={projectFieldId}
                    value={projectId}
                    onChange={(e) => {
                      setProjectId(e.target.value);
                      if (errors.projectId) {
                        setErrors((prev) => ({ ...prev, projectId: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(errors.projectId)}
                    aria-describedby={
                      errors.projectId ? `${projectFieldId}-error` : undefined
                    }
                    className={`w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border rounded-lg text-[#172B4D] dark:text-slate-100 ${
                      errors.projectId
                        ? 'border-red-500'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <p
                      id={`${projectFieldId}-error`}
                      className="mt-1.5 text-[13px] font-medium text-red-700 dark:text-red-400"
                    >
                      {errors.projectId}
                    </p>
                  )}
                </div>

                {/* Assignee */}
                <div>
                  <label
                    htmlFor={assigneeFieldId}
                    className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5"
                  >
                    Assignee
                  </label>
                  <select
                    id={assigneeFieldId}
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-[#172B4D] dark:text-slate-100"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label
                    htmlFor={priorityFieldId}
                    className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5"
                  >
                    Priority
                  </label>
                  <select
                    ref={prioritySelectRef}
                    id={priorityFieldId}
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as TaskPriority)
                    }
                    aria-invalid={Boolean(errors.priority)}
                    className="w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-[#172B4D] dark:text-slate-100"
                  >
                    {TASK_PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {errors.priority && (
                    <p className="mt-1.5 text-[13px] font-medium text-red-700 dark:text-red-400">
                      {errors.priority}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor={statusFieldId}
                    className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5"
                  >
                    Status
                  </label>
                  <select
                    ref={statusSelectRef}
                    id={statusFieldId}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    aria-invalid={Boolean(errors.status)}
                    className="w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-[#172B4D] dark:text-slate-100"
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1.5 text-[13px] font-medium text-red-700 dark:text-red-400">
                      {errors.status}
                    </p>
                  )}
                </div>

                {/* Due date */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor={dueDateFieldId}
                    className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5"
                  >
                    Due date
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={dueDateInputRef}
                      id={dueDateFieldId}
                      type="date"
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value);
                        if (errors.dueDate) {
                          setErrors((prev) => ({
                            ...prev,
                            dueDate: undefined,
                          }));
                        }
                      }}
                      aria-invalid={Boolean(errors.dueDate)}
                      aria-describedby={
                        errors.dueDate ? `${dueDateFieldId}-error` : undefined
                      }
                      className={`flex-1 min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border rounded-lg text-[#172B4D] dark:text-slate-100 ${
                        errors.dueDate
                          ? 'border-red-500'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    />
                    {dueDate && (
                      <button
                        type="button"
                        onClick={() => setDueDate('')}
                        className="min-h-[44px] px-3 py-2 text-[14px] font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {errors.dueDate && (
                    <p
                      id={`${dueDateFieldId}-error`}
                      className="mt-1.5 text-[13px] font-medium text-red-700 dark:text-red-400"
                    >
                      {errors.dueDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={requestCancel}
                disabled={isSaving}
                className="min-h-[44px] px-4 py-2 text-[15px] font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#172B4D] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="min-h-[44px] px-5 py-2 text-[15px] font-medium rounded-lg bg-[#1D4ED8] text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onKeepEditing={() => setShowUnsavedModal(false)}
        onDiscardChanges={() => {
          setShowUnsavedModal(false);
          onCancel();
        }}
      />
    </>
  );
}
