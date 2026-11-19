import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { TaskDetailsModal } from '../components/modals/TaskDetailsModal';
import { TaskEditorPanel } from '../components/panels/TaskEditorPanel';
import { TaskWorkspaceContent } from '../components/workspace/TaskWorkspaceContent';
import { useWorkspace } from '../context/WorkspaceContext';
import { getProjectProgress } from '../utils/taskUtils';

export function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, tasks } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <AppShell
        title="Project not found"
        breadcrumbs={[{ label: 'Projects', to: '/projects' }, { label: 'Not found' }]}
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center max-w-lg mx-auto my-8">
          <h2 className="text-[18px] font-semibold text-[#172B4D] dark:text-slate-100">
            This project could not be found
          </h2>
          <p className="mt-1.5 text-[15px] text-slate-600 dark:text-slate-300">
            It may have been removed or the session was reset.
          </p>
          <Link
            to="/projects"
            className="mt-5 inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-[15px] font-medium rounded-lg bg-[#1D4ED8] text-white hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </AppShell>
    );
  }

  const workspaceKey = `project:${project.id}`;
  const { completed, total } = getProjectProgress(tasks, project.id);

  const selectedTaskId = searchParams.get('task');
  const isEditing = searchParams.get('mode') === 'edit';
  const isCreating = searchParams.get('newTask') === '1';

  const openTask = (taskId: string) => {
    setSearchParams({ task: taskId });
  };

  const openNewTask = () => {
    setSearchParams({ newTask: '1' });
  };

  const closePanels = () => {
    setSearchParams({});
  };

  return (
    <AppShell
      title={project.name}
      subtitle={`${completed}/${total} complete`}
      breadcrumbs={[
        { label: 'Projects', to: '/projects' },
        { label: project.name },
      ]}
      workspaceKey={workspaceKey}
      primaryAction={
        <button
          type="button"
          onClick={openNewTask}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-[15px] font-medium rounded-lg bg-[#1D4ED8] text-white hover:bg-blue-800 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New task</span>
        </button>
      }
    >
      <TaskWorkspaceContent
        workspaceKey={workspaceKey}
        fixedProject={project}
        onOpenTask={openTask}
        onNewTask={openNewTask}
      />

      {isCreating && (
        <TaskEditorPanel
          mode="create"
          defaultProjectId={project.id}
          onCancel={closePanels}
          onSaved={closePanels}
        />
      )}

      {selectedTaskId && (
        <TaskDetailsModal
          taskId={selectedTaskId}
          initialMode={isEditing ? 'edit' : 'view'}
          onModeChange={(nextMode) =>
            setSearchParams(
              nextMode === 'edit'
                ? { task: selectedTaskId, mode: 'edit' }
                : { task: selectedTaskId }
            )
          }
          onClose={closePanels}
        />
      )}
    </AppShell>
  );
}
