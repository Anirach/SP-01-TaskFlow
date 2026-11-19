import { useEffect, useState } from 'react';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Project, Task, TaskStatus } from '../../types/taskflow';
import {
  DEFAULT_FILTERS,
  filterTasks,
  sortTasks,
} from '../../utils/taskUtils';
import { FilterToolbar } from './FilterToolbar';
import { KanbanBoard } from './KanbanBoard';
import { TaskListView } from './TaskListView';

interface TaskWorkspaceContentProps {
  workspaceKey: string;
  fixedProject?: Project;
  onOpenTask: (taskId: string) => void;
  onNewTask: () => void;
}

export function TaskWorkspaceContent({
  workspaceKey,
  fixedProject,
  onOpenTask,
  onNewTask,
}: TaskWorkspaceContentProps) {
  const {
    tasks,
    projects,
    members,
    isLoadingTasks,
    loadError,
    retryLoadTasks,
    simulationSettings,
    setSimulationSettings,
    triggerSimulatedLoadError,
    getWorkspaceView,
    setWorkspaceView,
    getWorkspaceFilters,
    setWorkspaceFilters,
    moveTaskStatus,
  } = useWorkspace();

  useEffect(() => {
    if (simulationSettings.failNextLoad) {
      setSimulationSettings((prev) => ({ ...prev, failNextLoad: false }));
      triggerSimulatedLoadError();
    }
  }, [
    simulationSettings.failNextLoad,
    setSimulationSettings,
    triggerSimulatedLoadError,
  ]);

  const [moveNotice, setMoveNotice] = useState<{
    type: 'info' | 'error';
    text: string;
  } | null>(null);

  const viewMode = getWorkspaceView(workspaceKey);
  const filters = getWorkspaceFilters(workspaceKey);

  // Total tasks in this workspace scope (before filters)
  const scopedTasks: Task[] = fixedProject
    ? tasks.filter((t) => t.projectId === fixedProject.id)
    : tasks;

  const filteredTasks = sortTasks(
    filterTasks(tasks, filters, fixedProject?.id)
  );

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    setMoveNotice(null);
    const result = await moveTaskStatus(taskId, newStatus);
    if (!result.ok) {
      setMoveNotice({
        type: 'error',
        text: result.error ?? 'Could not move task.',
      });
      return;
    }

    // If active status filter hides the task after the move, show feedback banner
    if (filters.status !== 'All' && filters.status !== newStatus) {
      setMoveNotice({
        type: 'info',
        text: `Moved to ${newStatus}`,
      });
    }
  };

  const handleClearFilters = () => {
    setWorkspaceFilters(workspaceKey, (prev) => ({
      ...DEFAULT_FILTERS,
      projectId: fixedProject ? prev.projectId : 'All',
    }));
  };

  if (isLoadingTasks) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading tasks">
        <p className="text-[14px] font-medium text-slate-600 dark:text-slate-400">
          Loading tasks…
        </p>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-36 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((col) => (
            <div
              key={col}
              className="bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 h-72 animate-pulse"
            >
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-24 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800" />
              <div className="h-24 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        role="alert"
        className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/80 rounded-xl p-8 text-center max-w-lg mx-auto my-8"
      >
        <AlertCircle
          className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-3"
          aria-hidden="true"
        />
        <h2 className="text-[18px] font-semibold text-[#172B4D] dark:text-slate-100">
          {loadError}
        </h2>
        <p className="mt-1.5 text-[15px] text-slate-600 dark:text-slate-300">
          Something went wrong while loading this workspace.
        </p>
        <button
          type="button"
          onClick={retryLoadTasks}
          className="mt-5 inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-[15px] font-medium rounded-lg bg-[#1D4ED8] text-white hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Empty workspace (0 tasks in this project or workspace)
  if (scopedTasks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center max-w-lg mx-auto my-8">
        <h2 className="text-[18px] font-semibold text-[#172B4D] dark:text-slate-100">
          {fixedProject
            ? `No tasks in ${fixedProject.name} yet`
            : 'No tasks yet'}
        </h2>
        <p className="mt-1.5 text-[15px] text-slate-600 dark:text-slate-300">
          Create the first task to assign an owner, priority, and deadline.
        </p>
        <button
          type="button"
          onClick={onNewTask}
          className="mt-5 inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-[15px] font-medium rounded-lg bg-[#1D4ED8] text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add first task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FilterToolbar
        filters={filters}
        onChangeFilters={(updater) => setWorkspaceFilters(workspaceKey, updater)}
        viewMode={viewMode}
        onChangeViewMode={(mode) => setWorkspaceView(workspaceKey, mode)}
        projects={projects}
        members={members}
        visibleCount={filteredTasks.length}
        fixedProject={fixedProject}
      />

      {moveNotice && (
        <div
          role={moveNotice.type === 'error' ? 'alert' : 'status'}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-[14px] font-medium ${
            moveNotice.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-[#172B4D] dark:text-slate-100'
          }`}
        >
          <span>{moveNotice.text}</span>
          <button
            type="button"
            onClick={() => setMoveNotice(null)}
            className="min-h-[36px] px-2.5 text-[13px] font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center">
          <h2 className="text-[17px] font-semibold text-[#172B4D] dark:text-slate-100">
            No tasks match your filters
          </h2>
          <p className="mt-1 text-[15px] text-slate-600 dark:text-slate-300">
            Adjust or clear your active search and filter criteria to see tasks.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-4 inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-[15px] font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#172B4D] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Clear all
          </button>
        </div>
      ) : viewMode === 'Board' ? (
        <KanbanBoard
          tasks={filteredTasks}
          showProjectName={!fixedProject}
          onOpenTask={onOpenTask}
          onMoveTask={handleMoveTask}
        />
      ) : (
        <TaskListView
          tasks={filteredTasks}
          showProjectName={!fixedProject}
          onOpenTask={onOpenTask}
          onMoveTask={handleMoveTask}
        />
      )}
    </div>
  );
}
