import { useId, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TASK_STATUSES, TaskStatus } from '../../types/taskflow';
import { getDeadlineUrgency } from '../../utils/dateUtils';

const STAGE_COLORS: Record<TaskStatus, string> = {
  'To do': '#94A3B8',
  'In progress': '#1D4ED8',
  'In review': '#D97706',
  Done: '#16A34A',
};

const STAGE_COLORS_DARK: Record<TaskStatus, string> = {
  'To do': '#64748B',
  'In progress': '#3B82F6',
  'In review': '#F59E0B',
  Done: '#22C55E',
};

interface ProjectCompletionRow {
  name: string;
  completed: number;
  remaining: number;
  total: number;
  completionRate: number;
}

interface MemberWorkloadRow {
  name: string;
  'To do': number;
  'In progress': number;
  'In review': number;
  Done: number;
  total: number;
  completionRate: number;
}

export function Analytics() {
  const { tasks, projects, members, isLoadingTasks, theme } = useWorkspace();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const projectFilterId = useId();
  const isDark = theme === 'dark';

  const stagePalette = isDark ? STAGE_COLORS_DARK : STAGE_COLORS;
  const gridStroke = isDark ? '#1E293B' : '#E2E8F0';
  const axisStroke = isDark ? '#334155' : '#CBD5E1';
  const tickFill = isDark ? '#94A3B8' : '#475569';

  const scopedTasks = useMemo(() => {
    if (selectedProjectId === 'All') return tasks;
    return tasks.filter((t) => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  const summary = useMemo(() => {
    const total = scopedTasks.length;
    const completed = scopedTasks.filter((t) => t.status === 'Done').length;
    const completionRate =
      total === 0 ? 0 : Math.round((completed / total) * 100);
    const active = total - completed;
    const overdue = scopedTasks.filter(
      (t) => getDeadlineUrgency(t.dueDate, t.status) === 'Overdue'
    ).length;
    const unassigned = scopedTasks.filter((t) => t.assigneeId === null).length;

    return { total, completed, completionRate, active, overdue, unassigned };
  }, [scopedTasks]);

  const projectCompletionData = useMemo<ProjectCompletionRow[]>(() => {
    const targetProjects =
      selectedProjectId === 'All'
        ? projects
        : projects.filter((p) => p.id === selectedProjectId);

    return targetProjects.map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id);
      const total = projectTasks.length;
      const completed = projectTasks.filter((t) => t.status === 'Done').length;
      const remaining = total - completed;
      const completionRate =
        total === 0 ? 0 : Math.round((completed / total) * 100);

      return {
        name: project.name,
        completed,
        remaining,
        total,
        completionRate,
      };
    });
  }, [projects, tasks, selectedProjectId]);

  const stageBreakdownData = useMemo(() => {
    return TASK_STATUSES.map((status) => ({
      name: status,
      value: scopedTasks.filter((t) => t.status === status).length,
      color: stagePalette[status],
    })).filter((entry) => entry.value > 0);
  }, [scopedTasks, stagePalette]);

  const memberWorkloadData = useMemo<MemberWorkloadRow[]>(() => {
    const buckets: Array<{ id: string | null; name: string }> = [
      ...members.map((m) => ({ id: m.id, name: m.name })),
      { id: null, name: 'Unassigned' },
    ];

    return buckets.map((bucket) => {
      const assigned = scopedTasks.filter((t) => t.assigneeId === bucket.id);
      const todo = assigned.filter((t) => t.status === 'To do').length;
      const inProgress = assigned.filter(
        (t) => t.status === 'In progress'
      ).length;
      const inReview = assigned.filter((t) => t.status === 'In review').length;
      const done = assigned.filter((t) => t.status === 'Done').length;
      const total = assigned.length;
      const completionRate =
        total === 0 ? 0 : Math.round((done / total) * 100);

      return {
        name: bucket.name,
        'To do': todo,
        'In progress': inProgress,
        'In review': inReview,
        Done: done,
        total,
        completionRate,
      };
    });
  }, [members, scopedTasks]);

  if (isLoadingTasks) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading analytics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />
          <div className="h-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scope Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-semibold text-[#172B4D] dark:text-slate-100">
            Workspace metrics
          </h2>
          <p className="text-[14px] text-slate-600 dark:text-slate-400">
            Live task completion rates and workload distribution across stages.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <label
            htmlFor={projectFilterId}
            className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1"
          >
            Project scope
          </label>
          <select
            id={projectFilterId}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 text-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-[#172B4D] dark:text-slate-100"
          >
            <option value="All">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400">
            Completion rate
          </p>
          <p className="mt-2 text-[28px] font-bold text-[#172B4D] dark:text-slate-100 tabular-nums leading-none">
            {summary.completionRate}%
          </p>
          <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400 tabular-nums">
            {summary.completed} of {summary.total}{' '}
            {summary.total === 1 ? 'task' : 'tasks'} done
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400">
            Active tasks
          </p>
          <p className="mt-2 text-[28px] font-bold text-[#172B4D] dark:text-slate-100 tabular-nums leading-none">
            {summary.active}
          </p>
          <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400 tabular-nums">
            In To do, In progress, or In review
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400">
            Overdue tasks
          </p>
          <p
            className={`mt-2 text-[28px] font-bold tabular-nums leading-none ${
              summary.overdue > 0
                ? 'text-red-700 dark:text-red-400'
                : 'text-[#172B4D] dark:text-slate-100'
            }`}
          >
            {summary.overdue}
          </p>
          <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">
            Past due date and unfinished
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400">
            Unassigned tasks
          </p>
          <p className="mt-2 text-[28px] font-bold text-[#172B4D] dark:text-slate-100 tabular-nums leading-none">
            {summary.unassigned}
          </p>
          <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">
            Need an owner assigned
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Completion Rate by Project */}
        <section
          aria-labelledby="chart-project-completion-title"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col"
        >
          <div className="mb-4">
            <h3
              id="chart-project-completion-title"
              className="text-[16px] font-semibold text-[#172B4D] dark:text-slate-100"
            >
              Task completion by project
            </h3>
            <p className="text-[14px] text-slate-600 dark:text-slate-400">
              Completed vs. remaining tasks per project
            </p>
          </div>

          {projectCompletionData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-[14px] text-slate-500 dark:text-slate-400">
              No projects to display.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectCompletionData}
                  margin={{ top: 8, right: 16, left: -12, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: tickFill, fontSize: 13 }}
                    axisLine={{ stroke: axisStroke }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: tickFill, fontSize: 13 }}
                    axisLine={{ stroke: axisStroke }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) {
                        return null;
                      }
                      const row = payload[0]?.payload as ProjectCompletionRow;
                      return (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md px-3 py-2 text-[13px] text-[#172B4D] dark:text-slate-100">
                          <p className="font-semibold">{row.name}</p>
                          <p className="mt-1 text-slate-600 dark:text-slate-300 tabular-nums">
                            {row.completed} / {row.total} done ({row.completionRate}
                            %)
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    stackId="project"
                    fill={stagePalette.Done}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="remaining"
                    name="Remaining"
                    stackId="project"
                    fill={isDark ? '#334155' : '#CBD5E1'}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Chart 2: Workload Distribution per Member */}
        <section
          aria-labelledby="chart-member-workload-title"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col"
        >
          <div className="mb-4">
            <h3
              id="chart-member-workload-title"
              className="text-[16px] font-semibold text-[#172B4D] dark:text-slate-100"
            >
              Workload distribution per member
            </h3>
            <p className="text-[14px] text-slate-600 dark:text-slate-400">
              Assigned tasks by stage across team members
            </p>
          </div>

          {scopedTasks.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-[14px] text-slate-500 dark:text-slate-400">
              No tasks in this scope yet.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={memberWorkloadData}
                  margin={{ top: 8, right: 16, left: -12, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: tickFill, fontSize: 13 }}
                    axisLine={{ stroke: axisStroke }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: tickFill, fontSize: 13 }}
                    axisLine={{ stroke: axisStroke }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) {
                        return null;
                      }
                      const row = payload[0]?.payload as MemberWorkloadRow;
                      return (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md px-3 py-2 text-[13px] text-[#172B4D] dark:text-slate-100 space-y-1">
                          <p className="font-semibold">
                            {row.name} ({row.total}{' '}
                            {row.total === 1 ? 'task' : 'tasks'})
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 tabular-nums">
                            Done: {row.Done} · In review: {row['In review']}
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 tabular-nums">
                            In progress: {row['In progress']} · To do:{' '}
                            {row['To do']}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  {TASK_STATUSES.map((stage, idx) => (
                    <Bar
                      key={stage}
                      dataKey={stage}
                      stackId="workload"
                      fill={stagePalette[stage]}
                      radius={
                        idx === TASK_STATUSES.length - 1
                          ? [4, 4, 0, 0]
                          : [0, 0, 0, 0]
                      }
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/* Stage Breakdown Donut + Member Summary Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <section
          aria-labelledby="chart-stage-share-title"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col"
        >
          <div className="mb-3">
            <h3
              id="chart-stage-share-title"
              className="text-[16px] font-semibold text-[#172B4D] dark:text-slate-100"
            >
              Tasks by stage
            </h3>
            <p className="text-[14px] text-slate-600 dark:text-slate-400">
              Current stage share across {summary.total}{' '}
              {summary.total === 1 ? 'task' : 'tasks'}
            </p>
          </div>

          {stageBreakdownData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-[14px] text-slate-500 dark:text-slate-400">
              No tasks in this scope.
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageBreakdownData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                  >
                    {stageBreakdownData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      color: isDark ? '#F1F5F9' : '#172B4D',
                      borderRadius: '0.5rem',
                      fontSize: '13px',
                    }}
                    itemStyle={{
                      color: isDark ? '#F1F5F9' : '#172B4D',
                    }}
                    formatter={(value) => [`${value} tasks`, 'Count']}
                  />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section
          aria-labelledby="table-member-workload-title"
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col"
        >
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3
              id="table-member-workload-title"
              className="text-[16px] font-semibold text-[#172B4D] dark:text-slate-100"
            >
              Member workload &amp; completion breakdown
            </h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                  <th
                    scope="col"
                    className="py-3 px-4 text-[13px] font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Member
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-3 text-[13px] font-semibold text-slate-600 dark:text-slate-300 text-right"
                  >
                    To do
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-3 text-[13px] font-semibold text-slate-600 dark:text-slate-300 text-right"
                  >
                    In progress
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-3 text-[13px] font-semibold text-slate-600 dark:text-slate-300 text-right"
                  >
                    In review
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-3 text-[13px] font-semibold text-slate-600 dark:text-slate-300 text-right"
                  >
                    Done
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-3 text-[13px] font-semibold text-slate-600 dark:text-slate-300 text-right"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-4 text-[13px] font-semibold text-slate-600 dark:text-slate-300 text-right"
                  >
                    Completion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {memberWorkloadData.map((row) => (
                  <tr
                    key={row.name}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3 px-4 text-[14px] font-medium text-[#172B4D] dark:text-slate-100 whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="py-3 px-3 text-[14px] text-slate-600 dark:text-slate-300 text-right tabular-nums">
                      {row['To do']}
                    </td>
                    <td className="py-3 px-3 text-[14px] text-slate-600 dark:text-slate-300 text-right tabular-nums">
                      {row['In progress']}
                    </td>
                    <td className="py-3 px-3 text-[14px] text-slate-600 dark:text-slate-300 text-right tabular-nums">
                      {row['In review']}
                    </td>
                    <td className="py-3 px-3 text-[14px] text-slate-600 dark:text-slate-300 text-right tabular-nums">
                      {row.Done}
                    </td>
                    <td className="py-3 px-3 text-[14px] font-semibold text-[#172B4D] dark:text-slate-100 text-right tabular-nums">
                      {row.total}
                    </td>
                    <td className="py-3 px-4 text-[14px] font-semibold text-[#172B4D] dark:text-slate-100 text-right tabular-nums">
                      {row.completionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
