import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ThemeToggleButton } from '../components/common/ThemeToggleButton';
import { useWorkspace } from '../context/WorkspaceContext';

export function WorkspaceEntryPage() {
  const navigate = useNavigate();
  const { workspaceName, currentMember, projects, tasks } = useWorkspace();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#172B4D] dark:text-slate-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[#1D4ED8] text-white text-[14px] font-bold">
              TF
            </span>
            <span className="text-[18px] font-bold tracking-tight text-[#172B4D] dark:text-slate-100">
              TaskFlow
            </span>
          </div>
          <ThemeToggleButton />
        </div>

        <h1 className="mt-6 text-[24px] font-bold text-[#172B4D] dark:text-slate-100 leading-snug">
          {workspaceName}
        </h1>
        <p className="mt-2 text-[16px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Organize project tasks, assign owners and deadlines, and discuss work
          in board or list view.
        </p>

        <dl className="mt-6 py-4 border-y border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              Demo member
            </dt>
            <dd className="mt-0.5 text-[16px] font-semibold text-[#172B4D] dark:text-slate-100">
              {currentMember.name}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              Workspace scope
            </dt>
            <dd className="mt-0.5 text-[16px] font-semibold text-[#172B4D] dark:text-slate-100 tabular-nums">
              {projects.length} projects · {tasks.length} tasks
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-[15px] font-medium rounded-lg bg-[#1D4ED8] text-white hover:bg-blue-700 transition-colors"
          >
            <span>Enter workspace</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
