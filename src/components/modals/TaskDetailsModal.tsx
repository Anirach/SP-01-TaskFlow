import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, Pencil, RefreshCw, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  TaskInput,
  TaskPriority,
  TaskStatus,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../../types/taskflow';
import { formatCommentTimestamp } from '../../utils/dateUtils';
import {
  sortCommentsOldestFirst,
  TaskValidationErrors,
  validateCommentText,
  validateTaskInput,
} from '../../utils/taskUtils';
import { DeadlineLabel } from '../common/DeadlineLabel';
import { MoveStatusMenu } from '../common/MoveStatusMenu';
import { PriorityBadge } from '../common/PriorityBadge';
import { UnsavedChangesModal } from '../common/UnsavedChangesModal';

interface TaskDetailsModalProps {
  taskId: string;
  initialMode?: 'view' | 'edit';
  onModeChange?: (mode: 'view' | 'edit') => void;
  onClose: () => void;
}

export function TaskDetailsModal({
  taskId,
  initialMode = 'view',
  onModeChange,
  onClose,
}: TaskDetailsModalProps) {
  const {
    tasks,
    projects,
    members,
    comments,
    getMemberById,
    getProjectById,
    updateTask,
    moveTaskStatus,
    addComment,
  } = useWorkspace();

  const task = tasks.find((t) => t.id === taskId);
  const taskComments = sortCommentsOldestFirst(
    comments.filter((c) => c.taskId === taskId)
  );

  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);

  // Edit form state
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [projectId, setProjectId] = useState(task?.projectId ?? '');
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? '');
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? 'Medium'
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'To do');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const [errors, setErrors] = useState<TaskValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  // Comment composer state
  const [draft, setDraft] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Unsaved edits modal state
  const [pendingAction, setPendingAction] = useState<
    'close' | 'cancelEdit' | null
  >(null);

  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const projectSelectRef = useRef<HTMLSelectElement>(null);
  const prioritySelectRef = useRef<HTMLSelectElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);
  const statusSelectRef = useRef<HTMLSelectElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const descId = useId();
  const projectFieldId = useId();
  const assigneeFieldId = useId();
  const priorityFieldId = useId();
  const dueDateFieldId = useId();
  const statusFieldId = useId();
  const composerId = useId();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description);
    setProjectId(task.projectId);
    setAssigneeId(task.assigneeId ?? '');
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate ?? '');
    setErrors({});
    setSaveError(null);
  }, [
    task?.id,
    task?.title,
    task?.description,
    task?.projectId,
    task?.assigneeId,
    task?.priority,
    task?.status,
    task?.dueDate,
  ]);

  useEffect(() => {
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    return () => {
      prevFocusRef.current?.focus?.();
    };
  }, [taskId]);

  useEffect(() => {
    if (mode === 'edit') {
      titleInputRef.current?.focus();
    }
  }, [mode]);

  const hasUnsavedFieldEdits =
    mode === 'edit' &&
    Boolean(task) &&
    (title !== task!.title ||
      description !== task!.description ||
      projectId !== task!.projectId ||
      (assigneeId || null) !== task!.assigneeId ||
      priority !== task!.priority ||
      status !== task!.status ||
      (dueDate || null) !== task!.dueDate);

  const hasUnsavedDraft = draft.trim().length > 0;

  const switchMode = (nextMode: 'view' | 'edit') => {
    setMode(nextMode);
    onModeChange?.(nextMode);
  };

  const resetEditFields = () => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description);
    setProjectId(task.projectId);
    setAssigneeId(task.assigneeId ?? '');
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate ?? '');
    setErrors({});
    setSaveError(null);
  };

  const requestClose = () => {
    if (isSaving) return;
    if (hasUnsavedFieldEdits || hasUnsavedDraft) {
      setPendingAction('close');
    } else {
      onClose();
    }
  };

  const requestCancelEdit = () => {
    if (isSaving) return;
    if (hasUnsavedFieldEdits) {
      setPendingAction('cancelEdit');
    } else {
      resetEditFields();
      switchMode('view');
    }
  };

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !pendingAction) {
        e.preventDefault();
        if (mode === 'edit') {
          requestCancelEdit();
        } else {
          requestClose();
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  if (!task) {
    return (
      <div
        className="fixed inset-0 z-40 flex justify-end bg-slate-900/35 dark:bg-slate-950/70"
        role="dialog"
        aria-modal="true"
        aria-label="Task not found"
      >
        <div className="w-full md:max-w-xl bg-white dark:bg-slate-900 h-full p-6 flex flex-col justify-center items-center text-center shadow-2xl">
          <p className="text-[18px] font-semibold text-[#172B4D] dark:text-slate-100">
            Task not found
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 min-h-[44px] px-4 py-2 rounded-lg bg-[#1D4ED8] text-white font-medium"
          >
            Back to workspace
          </button>
        </div>
      </div>
    );
  }

  const project = getProjectById(task.projectId);
  const assignee = getMemberById(task.assigneeId);

  const trimmedCommentLen = draft.trim().length;
  const commentValidationError =
    draft.length > 0 && trimmedCommentLen > 1000
      ? validateCommentText(draft)
      : null;
  const canPostComment =
    !isPosting && trimmedCommentLen >= 1 && trimmedCommentLen <= 1000;
  const showCharCount = draft.length >= 800 || trimmedCommentLen > 1000;

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
      await updateTask(task.id, input);
      switchMode('view');
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Could not save changes.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void performSave();
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setMoveError(null);
    const res = await moveTaskStatus(task.id, newStatus);
    if (!res.ok && res.error) {
      setMoveError(res.error);
    }
  };

  const submitComment = async () => {
    if (!canPostComment) return;
    setIsPosting(true);
    setPostError(null);
    try {
      await addComment(task.id, draft);
      setDraft('');
    } catch (err) {
      setPostError(
        err instanceof Error
          ? err.message
          : 'Could not post comment. Please retry.'
      );
    } finally {
      setIsPosting(false);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitComment();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex justify-end bg-slate-900/35 dark:bg-slate-950/70"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            requestClose();
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-details-modal-title"
          className="w-full md:max-w-xl bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl md:border-l md:border-slate-200 dark:md:border-slate-800"
        >
          {/* Top Modal Header */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <button
              ref={closeBtnRef}
              type="button"
              onClick={requestClose}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-2 -ml-2 text-[15px] font-medium text-[#172B4D] dark:text-slate-100 hover:text-[#1D4ED8] dark:hover:text-blue-400 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 md:hidden" aria-hidden="true" />
              <span className="md:hidden">Back</span>
              <span className="hidden md:inline">Close</span>
            </button>

            <div className="flex items-center gap-2">
              {mode === 'view' ? (
                <button
                  type="button"
                  onClick={() => switchMode('edit')}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 text-[14px] font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#172B4D] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Pencil className="w-4 h-4" aria-hidden="true" />
                  <span>Edit</span>
                </button>
              ) : (
                <span className="text-[14px] font-semibold text-slate-600 dark:text-slate-300 px-2">
                  Editing task
                </span>
              )}
              <button
                type="button"
                onClick={requestClose}
                aria-label="Close task details"
                className="hidden md:inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#172B4D] dark:hover:text-white"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
            {mode === 'edit' ? (
              <form
                id="task-details-edit-form"
                onSubmit={handleSaveSubmit}
                noValidate
                className="space-y-5"
              >
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
                    aria-describedby={
                      errors.title ? `${titleId}-error` : undefined
                    }
                    className={`w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border rounded-lg text-[#172B4D] dark:text-slate-100 ${
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
                        setErrors((prev) => ({
                          ...prev,
                          description: undefined,
                        }));
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
                          setErrors((prev) => ({
                            ...prev,
                            projectId: undefined,
                          }));
                        }
                      }}
                      aria-invalid={Boolean(errors.projectId)}
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
                      <p className="mt-1.5 text-[13px] font-medium text-red-700 dark:text-red-400">
                        {errors.projectId}
                      </p>
                    )}
                  </div>

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
                      className="w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-[#172B4D] dark:text-slate-100"
                    >
                      {TASK_PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      className="w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-[#172B4D] dark:text-slate-100"
                    >
                      {TASK_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      <p className="mt-1.5 text-[13px] font-medium text-red-700 dark:text-red-400">
                        {errors.dueDate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={requestCancelEdit}
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
            ) : (
              <>
                <div>
                  <h2
                    id="task-details-modal-title"
                    className="text-[22px] font-bold text-[#172B4D] dark:text-slate-100 leading-snug"
                  >
                    {task.title}
                  </h2>
                  <p className="mt-3 text-[16px] text-[#172B4D] dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {task.description.trim().length > 0 ? (
                      task.description
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 italic">
                        No description provided.
                      </span>
                    )}
                  </p>
                </div>

                {moveError && (
                  <div
                    role="alert"
                    className="px-3.5 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-[14px] text-red-800 dark:text-red-200"
                  >
                    {moveError}
                  </div>
                )}

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-slate-200 dark:border-slate-800">
                  <div>
                    <dt className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Status
                    </dt>
                    <dd>
                      <MoveStatusMenu
                        currentStatus={task.status}
                        taskTitle={task.title}
                        onSelectStatus={handleStatusChange}
                        label={task.status}
                      />
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Project
                    </dt>
                    <dd className="text-[15px] font-medium text-[#172B4D] dark:text-slate-100 min-h-[44px] flex items-center">
                      {project?.name ?? 'Unknown project'}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Assignee
                    </dt>
                    <dd className="text-[15px] font-medium text-[#172B4D] dark:text-slate-100">
                      {assignee ? (
                        assignee.name
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 font-normal">
                          Unassigned
                        </span>
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Priority
                    </dt>
                    <dd>
                      <PriorityBadge priority={task.priority} />
                    </dd>
                  </div>

                  <div className="sm:col-span-2">
                    <dt className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Due date
                    </dt>
                    <dd>
                      <DeadlineLabel
                        dueDate={task.dueDate}
                        status={task.status}
                      />
                    </dd>
                  </div>
                </dl>
              </>
            )}

            {/* Comment Section */}
            <section aria-label="Comments">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-semibold text-[#172B4D] dark:text-slate-100">
                  Comments ({taskComments.length})
                </h3>
              </div>

              {taskComments.length === 0 ? (
                <p className="text-[15px] text-slate-500 dark:text-slate-400 py-3">
                  No comments yet. Share an update or feedback below.
                </p>
              ) : (
                <ol className="space-y-4">
                  {taskComments.map((comment) => {
                    const author = getMemberById(comment.authorId);
                    return (
                      <li
                        key={comment.id}
                        className="pb-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-[14px] font-semibold text-[#172B4D] dark:text-slate-100">
                            {author?.name ?? 'Team member'}
                          </span>
                          <time
                            dateTime={comment.createdAt}
                            className="text-[13px] text-slate-500 dark:text-slate-400 tabular-nums"
                          >
                            {formatCommentTimestamp(comment.createdAt)}
                          </time>
                        </div>
                        <p className="mt-1.5 text-[15px] text-[#172B4D] dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {comment.text}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              )}

              <form
                onSubmit={handleCommentSubmit}
                className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800"
              >
                <label
                  htmlFor={composerId}
                  className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5"
                >
                  Add a comment
                </label>
                <textarea
                  id={composerId}
                  rows={3}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    if (postError) setPostError(null);
                  }}
                  placeholder="Write feedback or next steps..."
                  aria-invalid={Boolean(commentValidationError || postError)}
                  className="w-full px-3 py-2.5 text-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-[#172B4D] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1D4ED8] dark:focus:border-blue-400"
                />

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[13px]">
                    {commentValidationError ? (
                      <span className="text-red-700 dark:text-red-400 font-medium">
                        {commentValidationError}
                      </span>
                    ) : showCharCount ? (
                      <span
                        className={`tabular-nums ${
                          trimmedCommentLen > 1000
                            ? 'text-red-700 dark:text-red-400 font-medium'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {trimmedCommentLen} / 1,000
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {postError && (
                      <button
                        type="button"
                        onClick={() => void submitComment()}
                        disabled={isPosting || !canPostComment}
                        className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 text-[14px] font-medium rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" aria-hidden="true" />
                        <span>Retry</span>
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={!canPostComment}
                      className="min-h-[44px] px-4 py-2 text-[15px] font-medium rounded-lg bg-[#1D4ED8] text-white hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {isPosting ? 'Posting…' : 'Post'}
                    </button>
                  </div>
                </div>

                {postError && (
                  <p
                    role="alert"
                    className="mt-2 text-[14px] text-red-700 dark:text-red-400"
                  >
                    {postError}
                  </p>
                )}
              </form>
            </section>
          </div>
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={pendingAction !== null}
        title={
          hasUnsavedFieldEdits
            ? 'Discard unsaved changes?'
            : 'Discard comment draft?'
        }
        message={
          hasUnsavedFieldEdits
            ? 'You have unsaved task edits that will be lost if you leave now.'
            : 'You have an unposted comment draft. Keep editing or discard it?'
        }
        onKeepEditing={() => setPendingAction(null)}
        onDiscardChanges={() => {
          const action = pendingAction;
          setPendingAction(null);
          if (action === 'cancelEdit') {
            resetEditFields();
            switchMode('view');
          } else {
            onClose();
          }
        }}
      />
    </>
  );
}
