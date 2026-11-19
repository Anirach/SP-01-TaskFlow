import {
  Comment,
  FilterState,
  Project,
  Task,
  TaskInput,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../types/taskflow';
import { isValidCalendarDate } from './dateUtils';

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  status: 'All',
  assigneeId: 'All',
  projectId: 'All',
};

/**
 * Default order: earliest due date first, then undated tasks, with title as the tie-breaker.
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      if (a.dueDate !== b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
    } else if (a.dueDate && !b.dueDate) {
      return -1;
    } else if (!a.dueDate && b.dueDate) {
      return 1;
    }

    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  });
}

/**
 * Filters tasks using AND across all active criteria.
 * Search matches trimmed query against title and description, ignoring case.
 */
export function filterTasks(
  tasks: Task[],
  filters: FilterState,
  fixedProjectId?: string
): Task[] {
  const trimmedQuery = filters.search.trim().toLowerCase();
  const effectiveProjectId = fixedProjectId ?? filters.projectId;

  return tasks.filter((task) => {
    if (effectiveProjectId !== 'All' && task.projectId !== effectiveProjectId) {
      return false;
    }
    if (filters.status !== 'All' && task.status !== filters.status) {
      return false;
    }
    if (filters.assigneeId !== 'All') {
      if (filters.assigneeId === 'unassigned') {
        if (task.assigneeId !== null) return false;
      } else if (task.assigneeId !== filters.assigneeId) {
        return false;
      }
    }
    if (trimmedQuery.length > 0) {
      const inTitle = task.title.toLowerCase().includes(trimmedQuery);
      const inDesc = task.description.toLowerCase().includes(trimmedQuery);
      if (!inTitle && !inDesc) {
        return false;
      }
    }
    return true;
  });
}

export function sortCommentsOldestFirst(comments: Comment[]): Comment[] {
  return [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function getProjectProgress(
  tasks: Task[],
  projectId: string
): { completed: number; total: number } {
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const completed = projectTasks.filter((t) => t.status === 'Done').length;
  return { completed, total: projectTasks.length };
}

export function validateProjectName(
  rawName: string,
  existingProjects: Project[]
): string | null {
  const trimmed = rawName.trim();
  if (trimmed.length === 0) {
    return 'Enter a project name.';
  }
  if (trimmed.length > 60) {
    return 'Project name must be 60 characters or fewer.';
  }
  const duplicate = existingProjects.some(
    (p) => p.name.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) {
    return 'A project with this name already exists.';
  }
  return null;
}

export interface TaskValidationErrors {
  title?: string;
  description?: string;
  projectId?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
}

export function validateTaskInput(
  input: TaskInput,
  projects: Project[]
): TaskValidationErrors {
  const errors: TaskValidationErrors = {};
  const trimmedTitle = input.title.trim();

  if (trimmedTitle.length === 0) {
    errors.title = 'Enter a task title.';
  } else if (trimmedTitle.length > 120) {
    errors.title = 'Task title must be 120 characters or fewer.';
  }

  if (input.description.length > 2000) {
    errors.description = 'Description must be 2,000 characters or fewer.';
  }

  const projectExists = projects.some((p) => p.id === input.projectId);
  if (!input.projectId || !projectExists) {
    errors.projectId = 'Select an existing project.';
  }

  if (!TASK_PRIORITIES.includes(input.priority)) {
    errors.priority = 'Select a valid priority.';
  }

  if (!TASK_STATUSES.includes(input.status)) {
    errors.status = 'Select a valid status.';
  }

  if (input.dueDate !== null && input.dueDate !== '') {
    if (!isValidCalendarDate(input.dueDate)) {
      errors.dueDate = 'Enter a valid calendar date.';
    }
  }

  return errors;
}

export function validateCommentText(rawText: string): string | null {
  const trimmed = rawText.trim();
  if (trimmed.length === 0) {
    return 'Enter a comment before posting.';
  }
  if (trimmed.length > 1000) {
    return 'Comments must be 1,000 characters or fewer.';
  }
  return null;
}
