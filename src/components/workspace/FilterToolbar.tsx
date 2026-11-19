import { useId, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import {
  FilterState,
  Member,
  Project,
  TaskStatus,
  TASK_STATUSES,
  ViewMode,
} from '../../types/taskflow';

interface FilterToolbarProps {
  filters: FilterState;
  onChangeFilters: (updater: (prev: FilterState) => FilterState) => void;
  viewMode: ViewMode;
  onChangeViewMode: (view: ViewMode) => void;
  projects: Project[];
  members: Member[];
  visibleCount: number;
  fixedProject?: Project;
}

export function FilterToolbar({
  filters,
  onChangeFilters,
  viewMode,
  onChangeViewMode,
  projects,
  members,
  visibleCount,
  fixedProject,
}: FilterToolbarProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchId = useId();
  const statusId = useId();
  const assigneeId = useId();
  const projectId = useId();

  const activeChips: Array<{
    key: string;
    label: string;
    onRemove: () => void;
  }> = [];

  if (filters.search.trim().length > 0) {
    activeChips.push({
      key: 'search',
      label: `Search: "${filters.search.trim()}"`,
      onRemove: () => onChangeFilters((prev) => ({ ...prev, search: '' })),
    });
  }

  if (!fixedProject && filters.projectId !== 'All') {
    const project = projects.find((p) => p.id === filters.projectId);
    activeChips.push({
      key: 'project',
      label: `Project: ${project?.name ?? filters.projectId}`,
      onRemove: () =>
        onChangeFilters((prev) => ({ ...prev, projectId: 'All' })),
    });
  }

  if (filters.assigneeId !== 'All') {
    const assigneeName =
      filters.assigneeId === 'unassigned'
        ? 'Unassigned'
        : members.find((m) => m.id === filters.assigneeId)?.name ??
          filters.assigneeId;
    activeChips.push({
      key: 'assignee',
      label: `Assignee: ${assigneeName}`,
      onRemove: () =>
        onChangeFilters((prev) => ({ ...prev, assigneeId: 'All' })),
    });
  }

  if (filters.status !== 'All') {
    activeChips.push({
      key: 'status',
      label: `Status: ${filters.status}`,
      onRemove: () => onChangeFilters((prev) => ({ ...prev, status: 'All' })),
    });
  }

  const hasActiveFilters = activeChips.length > 0;

  const handleClearAll = () => {
    onChangeFilters((prev) => ({
      ...prev,
      search: '',
      status: 'All',
      assigneeId: 'All',
      projectId: fixedProject ? prev.projectId : 'All',
    }));
  };

  const countLabel = `${visibleCount} ${visibleCount === 1 ? 'task' : 'tasks'}`;

  return (
    <section
      aria-label="Task filters and view controls"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4"
    >
      {/* Top row: Search + View Switcher + Mobile Filter Toggle */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex-1 min-w-[200px] max-w-md">
          <label
            htmlFor={searchId}
            className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5"
          >
            Search
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              value={filters.search}
              onChange={(e) =>
                onChangeFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              placeholder="Search title or description"
              className="w-full min-h-[44px] pl-9 pr-3 py-2 text-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-[#172B4D] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1D4ED8] dark:focus:border-blue-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile filter toggle (< 768px) */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            aria-expanded={mobileFiltersOpen}
            className="md:hidden inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 text-[14px] font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#172B4D] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap"
          >
            <Filter
              className="w-4 h-4 text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
            <span>Filters</span>
            {activeChips.length > 0 && (
              <span className="tabular-nums text-[13px] font-semibold text-[#1D4ED8] dark:text-blue-400">
                ({activeChips.length})
              </span>
            )}
          </button>

          {/* Board / List segmented control */}
          <div
            role="group"
            aria-label="Task view mode"
            className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            {(['Board', 'List'] as ViewMode[]).map((mode) => {
              const active = viewMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChangeViewMode(mode)}
                  className={`min-h-[38px] px-4 py-1.5 text-[14px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-[#172B4D] dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#172B4D] dark:hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Selects (always visible on >= 768px, collapsible on phones) */}
      <div
        className={`${
          mobileFiltersOpen ? 'grid' : 'hidden md:grid'
        } grid-cols-1 sm:grid-cols-3 gap-3 pt-1`}
      >
        {/* Project selector or fixed project context */}
        {fixedProject ? (
          <div>
            <span className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5">
              Project
            </span>
            <div className="min-h-[44px] px-3 py-2 text-[15px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[#172B4D] dark:text-slate-100 flex items-center justify-between">
              <span className="truncate font-medium">{fixedProject.name}</span>
              <span className="text-[13px] text-slate-500 dark:text-slate-400 ml-2 shrink-0">
                Fixed
              </span>
            </div>
          </div>
        ) : (
          <div>
            <label
              htmlFor={projectId}
              className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5"
            >
              Project
            </label>
            <select
              id={projectId}
              value={filters.projectId}
              onChange={(e) =>
                onChangeFilters((prev) => ({
                  ...prev,
                  projectId: e.target.value,
                }))
              }
              className="w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-[#172B4D] dark:text-slate-100"
            >
              <option value="All">All</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Assignee selector */}
        <div>
          <label
            htmlFor={assigneeId}
            className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5"
          >
            Assignee
          </label>
          <select
            id={assigneeId}
            value={filters.assigneeId}
            onChange={(e) =>
              onChangeFilters((prev) => ({
                ...prev,
                assigneeId: e.target.value,
              }))
            }
            className="w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-[#172B4D] dark:text-slate-100"
          >
            <option value="All">All</option>
            <option value="unassigned">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status selector */}
        <div>
          <label
            htmlFor={statusId}
            className="block text-[14px] font-medium text-[#172B4D] dark:text-slate-200 mb-1.5"
          >
            Status
          </label>
          <select
            id={statusId}
            value={filters.status}
            onChange={(e) =>
              onChangeFilters((prev) => ({
                ...prev,
                status: e.target.value as 'All' | TaskStatus,
              }))
            }
            className="w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-[#172B4D] dark:text-slate-100"
          >
            <option value="All">All</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Count + Active Filter Chips + Clear All */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-[14px] font-medium text-slate-600 dark:text-slate-300 tabular-nums"
            aria-live="polite"
          >
            {countLabel}
          </span>

          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              aria-label={`Remove filter ${chip.label}`}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-2.5 py-1 text-[13px] font-medium rounded-md bg-blue-50 dark:bg-blue-950/70 text-[#1D4ED8] dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-colors"
            >
              <span>{chip.label}</span>
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="min-h-[40px] px-3 py-1.5 text-[14px] font-medium text-[#1D4ED8] dark:text-blue-400 hover:underline whitespace-nowrap"
          >
            Clear all
          </button>
        )}
      </div>
    </section>
  );
}
