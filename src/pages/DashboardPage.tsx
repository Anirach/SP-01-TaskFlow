import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { TaskDetailsModal } from '../components/modals/TaskDetailsModal';
import { TaskEditorPanel } from '../components/panels/TaskEditorPanel';
import { TaskWorkspaceContent } from '../components/workspace/TaskWorkspaceContent';
import { useWorkspace } from '../context/WorkspaceContext';

export function DashboardPage() {
  const { workspaceName } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();

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
      title="Dashboard"
      subtitle={workspaceName}
      workspaceKey="dashboard"
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
        workspaceKey="dashboard"
        onOpenTask={openTask}
        onNewTask={openNewTask}
      />

      {isCreating && (
        <TaskEditorPanel
          mode="create"
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
