import React, { useState } from 'react';
import { GripVertical, MessageSquare } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Task, TaskStatus, TASK_STATUSES } from '../../types/taskflow';
import { sortTasks } from '../../utils/taskUtils';
import { DeadlineLabel } from '../common/DeadlineLabel';
import { MoveStatusMenu } from '../common/MoveStatusMenu';
import { PriorityBadge } from '../common/PriorityBadge';

interface KanbanBoardProps {
  tasks: Task[];
  showProjectName: boolean;
  onOpenTask: (taskId: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

export function KanbanBoard({
  tasks,
  showProjectName,
  onOpenTask,
  onMoveTask,
}: KanbanBoardProps) {
  const { getMemberById, getProjectById, getCommentCountForTask } =
    useWorkspace();
  const [mobileStage, setMobileStage] = useState<TaskStatus>('To do');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<TaskStatus | null>(null);

  const draggedTask = draggedTaskId
    ? tasks.find((t) => t.id === draggedTaskId)
    : undefined;

  const tasksByStage = TASK_STATUSES.reduce<Record<TaskStatus, Task[]>>(
    (acc, stage) => {
      acc[stage] = sortTasks(tasks.filter((t) => t.status === stage));
      return acc;
    },
    {
      'To do': [],
      'In progress': [],
      'In review': [],
      Done: [],
    }
  );

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('[role="menu"]')) {
      e.preventDefault();
      return;
    }
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.setData('application/x-taskflow-task-id', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, stage: TaskStatus) => {
    e.preventDefault();
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragOver = (e: React.DragEvent, stage: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = (
    e: React.DragEvent<HTMLElement>,
    stage: TaskStatus
  ) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      if (dragOverStage === stage) {
        setDragOverStage(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: TaskStatus) => {
    e.preventDefault();
    setDragOverStage(null);
    const taskId =
      e.dataTransfer.getData('application/x-taskflow-task-id') ||
      e.dataTransfer.getData('text/plain') ||
      draggedTaskId;
    setDraggedTaskId(null);
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStage) {
      return;
    }
    onMoveTask(taskId, targetStage);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStage(null);
  };

  const renderColumn = (stage: TaskStatus, isMobileSingle = false) => {
    const columnTasks = tasksByStage[stage];
    const isDropTarget =
      dragOverStage === stage &&
      draggedTask !== undefined &&
      draggedTask.status !== stage;

    return (
      <section
        key={stage}
        aria-label={`${stage} column (${columnTasks.length})`}
        data-stage={stage}
        onDragEnter={(e) => handleDragEnter(e, stage)}
        onDragOver={(e) => handleDragOver(e, stage)}
        onDragLeave={(e) => handleDragLeave(e, stage)}
        onDrop={(e) => handleDrop(e, stage)}
        className={`flex flex-col rounded-xl border transition-colors ${
          isMobileSingle ? 'w-full' : 'min-w-[280px] xl:min-w-0'
        } ${
          isDropTarget
            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-[#1D4ED8] dark:border-blue-500 ring-2 ring-[#1D4ED8]/20 dark:ring-blue-500/20'
            : 'bg-slate-100/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-slate-800">
          <h2 className="text-[15px] font-semibold text-[#172B4D] dark:text-slate-100">
            {stage}
          </h2>
          <span className="text-[14px] font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
            {columnTasks.length}
          </span>
        </div>

        <div className="p-3 space-y-3 flex-1 min-h-[180px]">
          {isDropTarget && (
            <div className="rounded-lg border-2 border-dashed border-[#1D4ED8] dark:border-blue-400 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-center text-[13px] font-medium text-[#1D4ED8] dark:text-blue-300">
              Drop to move to {stage}
            </div>
          )}

          {columnTasks.length === 0 ? (
            <div
              className={`h-32 flex items-center justify-center rounded-lg border border-dashed px-4 text-center ${
                isDropTarget
                  ? 'border-[#1D4ED8] dark:border-blue-400 bg-white/60 dark:bg-slate-900/60'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              <p className="text-[14px] text-slate-500 dark:text-slate-400">
                No tasks in this stage
              </p>
            </div>
          ) : (
            columnTasks.map((task) => {
              const assignee = getMemberById(task.assigneeId);
              const project = getProjectById(task.projectId);
              const commentCount = getCommentCountForTask(task.id);
              const isDragging = draggedTaskId === task.id;

              return (
                <article
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-grab active:cursor-grabbing ${
                    isDragging
                      ? 'opacity-50 ring-2 ring-[#1D4ED8]/30 dark:ring-blue-400/30'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenTask(task.id)}
                      className="text-left text-[16px] font-semibold text-[#172B4D] dark:text-slate-100 hover:text-[#1D4ED8] dark:hover:text-blue-400 leading-snug focus-visible:rounded cursor-pointer"
                    >
                      {task.title}
                    </button>
                    <GripVertical
                      className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5 pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>

                  {showProjectName && project && (
                    <p className="mt-1.5 text-[14px] text-slate-600 dark:text-slate-400">
                      {project.name}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[14px] text-slate-600 dark:text-slate-300">
                    <PriorityBadge priority={task.priority} />
                    <span
                      className="text-slate-300 dark:text-slate-600"
                      aria-hidden="true"
                    >
                      ·
                    </span>
                    <span
                      className={
                        assignee
                          ? 'text-[#172B4D] dark:text-slate-200 font-medium'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    >
                      {assignee ? assignee.name : 'Unassigned'}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <DeadlineLabel dueDate={task.dueDate} status={task.status} />
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenTask(task.id)}
                      aria-label={`Open ${task.title} (${commentCount} ${
                        commentCount === 1 ? 'comment' : 'comments'
                      })`}
                      className="inline-flex items-center gap-1.5 min-h-[44px] px-1 text-[14px] text-slate-600 dark:text-slate-400 hover:text-[#1D4ED8] dark:hover:text-blue-400 tabular-nums cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" aria-hidden="true" />
                      <span>{commentCount}</span>
                    </button>

                    <MoveStatusMenu
                      currentStatus={task.status}
                      taskTitle={task.title}
                      onSelectStatus={(newStatus) =>
                        onMoveTask(task.id, newStatus)
                      }
                      compact
                    />
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    );
  };

  return (
    <div>
      {/* Mobile (< 768px): Labeled stage selector + single column */}
      <div className="md:hidden space-y-4">
        <div>
          <label
            htmlFor="mobile-stage-select"
            className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5"
          >
            Stage
          </label>
          <select
            id="mobile-stage-select"
            value={mobileStage}
            onChange={(e) => setMobileStage(e.target.value as TaskStatus)}
            className="w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[#172B4D] dark:text-slate-100"
          >
            {TASK_STATUSES.map((stage) => (
              <option key={stage} value={stage}>
                {stage} ({tasksByStage[stage].length})
              </option>
            ))}
          </select>
        </div>

        {renderColumn(mobileStage, true)}
      </div>

      {/* Tablet (768px–1199px): Horizontal scrolling board; Desktop (>= 1200px): 4 columns side by side */}
      <div className="hidden md:grid md:grid-flow-col md:auto-cols-[minmax(280px,1fr)] md:overflow-x-auto md:pb-2 xl:grid-flow-row xl:grid-cols-4 xl:overflow-visible gap-4 items-start">
        {TASK_STATUSES.map((stage) => renderColumn(stage, false))}
      </div>
    </div>
  );
}
