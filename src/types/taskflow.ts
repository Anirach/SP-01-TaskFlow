export type TaskStatus = 'To do' | 'In progress' | 'In review' | 'Done';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export type ViewMode = 'Board' | 'List';

export type ThemeMode = 'light' | 'dark';

export const TASK_STATUSES: TaskStatus[] = [
  'To do',
  'In progress',
  'In review',
  'Done',
];

export const TASK_PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];

export interface Member {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface FilterState {
  search: string;
  status: 'All' | TaskStatus;
  assigneeId: 'All' | 'unassigned' | string;
  projectId: 'All' | string;
}

export interface TaskInput {
  title: string;
  description: string;
  projectId: string;
  assigneeId: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
}

export interface SimulationSettings {
  failNextLoad: boolean;
  failNextSave: boolean;
  failNextMove: boolean;
  failNextComment: boolean;
}

export interface WorkspaceFixture {
  workspaceName: string;
  currentMemberId: string;
  defaultView: ViewMode;
  members: Member[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
}
