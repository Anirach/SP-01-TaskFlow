import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Folder, Plus } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { NewProjectModal } from '../components/modals/NewProjectModal';
import { useWorkspace } from '../context/WorkspaceContext';
import { Project } from '../types/taskflow';
import { getProjectProgress } from '../utils/taskUtils';

export function ProjectsPage() {
  const { projects, tasks, workspaceName } = useWorkspace();
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const navigate = useNavigate();

  const handleProjectCreated = (project: Project) => {
    setNewProjectOpen(false);
    navigate(`/projects/${project.id}`);
  };

  return (
    <AppShell
      title="Projects"
      subtitle={workspaceName}
      primaryAction={
        <button
          type="button"
          onClick={() => setNewProjectOpen(true)}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-[15px] font-medium rounded-lg bg-[#1D4ED8] text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New project</span>
        </button>
      }
    >
      {projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center max-w-lg mx-auto my-8">
          <h2 className="text-[18px] font-semibold text-[#172B4D] dark:text-slate-100">
            No projects yet
          </h2>
          <p className="mt-1.5 text-[15px] text-slate-600 dark:text-slate-300">
            Create your first project to organize tasks and deadlines.
          </p>
          <button
            type="button"
            onClick={() => setNewProjectOpen(true)}
            className="mt-5 inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-[15px] font-medium rounded-lg bg-[#1D4ED8] text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>New project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const { completed, total } = getProjectProgress(tasks, project.id);
            const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-[#1D4ED8] dark:hover:border-blue-500 transition-colors flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Folder
                      className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-[#1D4ED8] dark:group-hover:text-blue-400 shrink-0 transition-colors"
                      aria-hidden="true"
                    />
                    <h2 className="text-[17px] font-semibold text-[#172B4D] dark:text-slate-100 group-hover:text-[#1D4ED8] dark:group-hover:text-blue-400 truncate transition-colors">
                      {project.name}
                    </h2>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-[#1D4ED8] dark:group-hover:text-blue-400 shrink-0 mt-1 transition-colors"
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                      {completed}/{total} complete
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {pct}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full bg-[#1D4ED8] dark:bg-blue-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <NewProjectModal
        isOpen={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onCreated={handleProjectCreated}
      />
    </AppShell>
  );
}
