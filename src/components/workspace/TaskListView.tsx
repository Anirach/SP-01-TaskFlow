import { MessageSquare } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Task, TaskStatus } from '../../types/taskflow';
import { sortTasks } from '../../utils/taskUtils';
import { DeadlineLabel } from '../common/DeadlineLabel';
import { MoveStatusMenu } from '../common/MoveStatusMenu';
import { PriorityBadge } from '../common/PriorityBadge';

interface TaskListViewProps {
  tasks: Task[];
  showProjectName: boolean;
  onOpenTask: (taskId: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskListView({
  tasks,
  showProjectName,
  onOpenTask,
  onMoveTask,
}: TaskListViewProps) {
  const { getMemberById, getProjectById, getCommentCountForTask } =
    useWorkspace();

  const sortedTasks = sortTasks(tasks);

  return (
    <div>
      {/* Mobile (< 768px): Stacked summary rows */}
      <div className="md:hidden space-y-3">
        {sortedTasks.map((task) => {
          const assignee = getMemberById(task.assigneeId);
          const project = getProjectById(task.projectId);
          const commentCount = getCommentCountForTask(task.id);

          return (
            <article
              key={task.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenTask(task.id)}
                  className="text-left text-[16px] font-semibold text-[#172B4D] dark:text-slate-100 hover:text-[#1D4ED8] dark:hover:text-blue-400 leading-snug"
                >
                  {task.title}
                </button>
                <PriorityBadge priority={task.priority} />
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-slate-600 dark:text-slate-300">
                {showProjectName && project && (
                  <>
                    <span>{project.name}</span>
                    <span
                      className="text-slate-300 dark:text-slate-600"
                      aria-hidden="true"
                    >
                      ·
                    </span>
                  </>
                )}
                <span>{assignee ? assignee.name : 'Unassigned'}</span>
                <span
                  className="text-slate-300 dark:text-slate-600"
                  aria-hidden="true"
                >
                  ·
                </span>
                <span>{task.status}</span>
              </div>

              <div>
                <DeadlineLabel dueDate={task.dueDate} status={task.status} />
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenTask(task.id)}
                  className="inline-flex items-center gap-1.5 min-h-[44px] text-[14px] text-slate-600 dark:text-slate-400 hover:text-[#1D4ED8] dark:hover:text-blue-400 tabular-nums"
                >
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                  </span>
                </button>
                <MoveStatusMenu
                  currentStatus={task.status}
                  taskTitle={task.title}
                  onSelectStatus={(newStatus) => onMoveTask(task.id, newStatus)}
                  compact
                />
              </div>
            </article>
          );
        })}
      </div>

      {/* Tablet & Desktop (>= 768px): Structured table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
              <th
                scope="col"
                className="py-3 px-4 text-[13px] font-semibold text-slate-600 dark:text-slate-300"
              >
                Title
              </th>
              {showProjectName && (
                <th
                  scope="col"
                  className="py-3 px-4 text-[13px] font-semibold text-slate-600 dark:text-slate-300"
                >
                  Project
                </th>
              )}
              <th
                scope="col"
                className="py-3 px-4 text-[13px] font-semibold text-slate-600 dark:text-slate-300"
              >
                Assignee
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-[13px] font-semibold text-slate-600 dark:text-slate-300"
              >
                Priority
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-[13px] font-semibold text-slate-600 dark:text-slate-300"
              >
                Due date
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-[13px] font-semibold text-slate-600 dark:text-slate-300"
              >
                Status
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-[13px] font-semibold text-slate-600 dark:text-slate-300 text-right"
              >
                Comments
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {sortedTasks.map((task) => {
              const assignee = getMemberById(task.assigneeId);
              const project = getProjectById(task.projectId);
              const commentCount = getCommentCountForTask(task.id);

              return (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => onOpenTask(task.id)}
                      className="text-left text-[15px] font-semibold text-[#172B4D] dark:text-slate-100 hover:text-[#1D4ED8] dark:hover:text-blue-400 hover:underline focus-visible:rounded"
                    >
                      {task.title}
                    </button>
                  </td>
                  {showProjectName && (
                    <td className="py-3 px-4 text-[14px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {project?.name ?? '—'}
                    </td>
                  )}
                  <td className="py-3 px-4 text-[14px] whitespace-nowrap">
                    <span
                      className={
                        assignee
                          ? 'text-[#172B4D] dark:text-slate-200 font-medium'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    >
                      {assignee ? assignee.name : 'Unassigned'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="py-3 px-4">
                    <DeadlineLabel dueDate={task.dueDate} status={task.status} />
                  </td>
                  <td className="py-3 px-4">
                    <MoveStatusMenu
                      currentStatus={task.status}
                      taskTitle={task.title}
                      onSelectStatus={(newStatus) =>
                        onMoveTask(task.id, newStatus)
                      }
                      label={task.status}
                      compact
                    />
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    <button
                      type="button"
                      onClick={() => onOpenTask(task.id)}
                      aria-label={`View ${commentCount} comments on ${task.title}`}
                      className="inline-flex items-center justify-end gap-1.5 min-h-[40px] px-2 text-[14px] text-slate-600 dark:text-slate-400 hover:text-[#1D4ED8] dark:hover:text-blue-400"
                    >
                      <MessageSquare className="w-4 h-4" aria-hidden="true" />
                      <span>{commentCount}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
