import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { initialWorkspaceFixture } from '../data/mockWorkspace';
import {
  Comment,
  FilterState,
  Member,
  Project,
  SimulationSettings,
  Task,
  TaskInput,
  TaskStatus,
  ThemeMode,
  ViewMode,
} from '../types/taskflow';
import {
  DEFAULT_FILTERS,
  validateCommentText,
  validateProjectName,
  validateTaskInput,
} from '../utils/taskUtils';

interface MoveResult {
  ok: boolean;
  error?: string;
}

interface WorkspaceContextValue {
  workspaceName: string;
  members: Member[];
  currentMember: Member;
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  defaultView: ViewMode;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isLoadingTasks: boolean;
  loadError: string | null;
  simulationSettings: SimulationSettings;
  setSimulationSettings: React.Dispatch<
    React.SetStateAction<SimulationSettings>
  >;
  liveAnnouncement: string;
  announce: (message: string) => void;
  retryLoadTasks: () => void;
  triggerSimulatedLoadError: () => void;

  // Per-workspace view, filter, and scroll preservation
  getWorkspaceView: (workspaceKey: string) => ViewMode;
  setWorkspaceView: (workspaceKey: string, view: ViewMode) => void;
  getWorkspaceFilters: (workspaceKey: string) => FilterState;
  setWorkspaceFilters: (
    workspaceKey: string,
    updater: FilterState | ((prev: FilterState) => FilterState)
  ) => void;
  getWorkspaceScroll: (workspaceKey: string) => number;
  setWorkspaceScroll: (workspaceKey: string, scrollTop: number) => void;

  // Domain actions
  savePreferences: (newDefaultView: ViewMode) => void;
  createProject: (rawName: string) => Project;
  createTask: (input: TaskInput) => Promise<Task>;
  updateTask: (taskId: string, input: TaskInput) => Promise<Task>;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<MoveResult>;
  addComment: (taskId: string, rawText: string) => Promise<Comment>;
  getCommentCountForTask: (taskId: string) => number;
  getMemberById: (memberId: string | null) => Member | undefined;
  getProjectById: (projectId: string) => Project | undefined;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaceName] = useState(initialWorkspaceFixture.workspaceName);
  const [members] = useState<Member[]>(initialWorkspaceFixture.members);
  const [currentMemberId] = useState(initialWorkspaceFixture.currentMemberId);
  const [projects, setProjects] = useState<Project[]>(
    initialWorkspaceFixture.projects
  );
  const [tasks, setTasks] = useState<Task[]>(initialWorkspaceFixture.tasks);
  const [comments, setComments] = useState<Comment[]>(
    initialWorkspaceFixture.comments
  );
  const [defaultView, setDefaultView] = useState<ViewMode>(
    initialWorkspaceFixture.defaultView
  );
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('taskflow-theme');
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    }
    return 'light';
  });

  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [simulationSettings, setSimulationSettings] =
    useState<SimulationSettings>({
      failNextLoad: false,
      failNextSave: false,
      failNextMove: false,
      failNextComment: false,
    });

  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem('taskflow-theme', theme);
    } catch {
      // Ignore storage failures in restricted contexts
    }
  }, [theme]);

  // Session-preserved workspace states keyed by 'dashboard' or 'project:<id>'
  const [workspaceViews, setWorkspaceViews] = useState<
    Record<string, ViewMode | undefined>
  >({});
  const [workspaceFilters, setWorkspaceFiltersMap] = useState<
    Record<string, FilterState>
  >({});
  const scrollPositionsRef = useRef<Record<string, number>>({});

  // Initial demo load with labeled skeleton phase
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoadingTasks(false);
    }, 260);
    return () => window.clearTimeout(timer);
  }, []);

  const announce = useCallback((message: string) => {
    setLiveAnnouncement('');
    window.requestAnimationFrame(() => {
      setLiveAnnouncement(message);
    });
  }, []);

  const setTheme = useCallback(
    (nextTheme: ThemeMode) => {
      setThemeState(nextTheme);
      announce(`Switched to ${nextTheme} mode`);
    },
    [announce]
  );

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      announce(`Switched to ${next} mode`);
      return next;
    });
  }, [announce]);

  const retryLoadTasks = useCallback(() => {
    setIsLoadingTasks(true);
    setLoadError(null);
    window.setTimeout(() => {
      setSimulationSettings((prev) => {
        if (prev.failNextLoad) {
          setLoadError("Couldn't load tasks");
          setIsLoadingTasks(false);
          return { ...prev, failNextLoad: false };
        }
        setLoadError(null);
        setIsLoadingTasks(false);
        return prev;
      });
    }, 260);
  }, []);

  const triggerSimulatedLoadError = useCallback(() => {
    setIsLoadingTasks(true);
    setLoadError(null);
    window.setTimeout(() => {
      setLoadError("Couldn't load tasks");
      setIsLoadingTasks(false);
    }, 220);
  }, []);

  const currentMember = useMemo(
    () =>
      members.find((m) => m.id === currentMemberId) ?? {
        id: 'm1',
        name: 'Maya Chen',
      },
    [members, currentMemberId]
  );

  const getWorkspaceView = useCallback(
    (workspaceKey: string): ViewMode => {
      return workspaceViews[workspaceKey] ?? defaultView;
    },
    [workspaceViews, defaultView]
  );

  const setWorkspaceView = useCallback(
    (workspaceKey: string, view: ViewMode) => {
      setWorkspaceViews((prev) => ({
        ...prev,
        [workspaceKey]: view,
      }));
    },
    []
  );

  const getWorkspaceFilters = useCallback(
    (workspaceKey: string): FilterState => {
      return workspaceFilters[workspaceKey] ?? DEFAULT_FILTERS;
    },
    [workspaceFilters]
  );

  const setWorkspaceFilters = useCallback(
    (
      workspaceKey: string,
      updater: FilterState | ((prev: FilterState) => FilterState)
    ) => {
      setWorkspaceFiltersMap((prev) => {
        const current = prev[workspaceKey] ?? DEFAULT_FILTERS;
        const next = typeof updater === 'function' ? updater(current) : updater;
        return {
          ...prev,
          [workspaceKey]: next,
        };
      });
    },
    []
  );

  const getWorkspaceScroll = useCallback((workspaceKey: string): number => {
    return scrollPositionsRef.current[workspaceKey] ?? 0;
  }, []);

  const setWorkspaceScroll = useCallback(
    (workspaceKey: string, scrollTop: number) => {
      scrollPositionsRef.current[workspaceKey] = scrollTop;
    },
    []
  );

  const savePreferences = useCallback(
    (newDefaultView: ViewMode) => {
      setDefaultView(newDefaultView);
      // Clear per-workspace view overrides so the preference applies when next opening a workspace
      setWorkspaceViews({});
      announce(`Preferences saved. Default view set to ${newDefaultView}.`);
    },
    [announce]
  );

  const createProject = useCallback(
    (rawName: string): Project => {
      const error = validateProjectName(rawName, projects);
      if (error) {
        throw new Error(error);
      }
      const trimmed = rawName.trim();
      const newProject: Project = {
        id: `p${Date.now()}`,
        name: trimmed,
      };
      setProjects((prev) => [...prev, newProject]);
      announce(`Created project ${trimmed}`);
      return newProject;
    },
    [projects, announce]
  );

  const createTask = useCallback(
    async (input: TaskInput): Promise<Task> => {
      const errors = validateTaskInput(input, projects);
      if (Object.keys(errors).length > 0) {
        throw new Error('Please fix the highlighted task fields.');
      }

      await new Promise((resolve) => window.setTimeout(resolve, 140));

      if (simulationSettings.failNextSave) {
        setSimulationSettings((prev) => ({ ...prev, failNextSave: false }));
        throw new Error('Could not save task. Please try again.');
      }

      const newTask: Task = {
        id: `t${Date.now()}`,
        title: input.title.trim(),
        description: input.description.trimEnd(),
        projectId: input.projectId,
        assigneeId: input.assigneeId || null,
        priority: input.priority,
        status: input.status,
        dueDate: input.dueDate && input.dueDate.trim() !== '' ? input.dueDate : null,
      };

      setTasks((prev) => [...prev, newTask]);
      announce(`Created task ${newTask.title}`);
      return newTask;
    },
    [projects, simulationSettings.failNextSave, announce]
  );

  const updateTask = useCallback(
    async (taskId: string, input: TaskInput): Promise<Task> => {
      const errors = validateTaskInput(input, projects);
      if (Object.keys(errors).length > 0) {
        throw new Error('Please fix the highlighted task fields.');
      }

      await new Promise((resolve) => window.setTimeout(resolve, 140));

      if (simulationSettings.failNextSave) {
        setSimulationSettings((prev) => ({ ...prev, failNextSave: false }));
        throw new Error('Could not save changes. Please try again.');
      }

      const updatedTask: Task = {
        id: taskId,
        title: input.title.trim(),
        description: input.description.trimEnd(),
        projectId: input.projectId,
        assigneeId: input.assigneeId || null,
        priority: input.priority,
        status: input.status,
        dueDate: input.dueDate && input.dueDate.trim() !== '' ? input.dueDate : null,
      };

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      announce(`Updated task ${updatedTask.title}`);
      return updatedTask;
    },
    [projects, simulationSettings.failNextSave, announce]
  );

  const moveTaskStatus = useCallback(
    async (taskId: string, newStatus: TaskStatus): Promise<MoveResult> => {
      const existing = tasks.find((t) => t.id === taskId);
      if (!existing) {
        return { ok: false, error: 'Task not found.' };
      }
      if (existing.status === newStatus) {
        return { ok: true };
      }

      const previousStatus = existing.status;

      // Optimistic stage update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      if (simulationSettings.failNextMove) {
        await new Promise((resolve) => window.setTimeout(resolve, 140));
        // Restore previous stage and consume simulation flag
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: previousStatus } : t
          )
        );
        setSimulationSettings((prev) => ({ ...prev, failNextMove: false }));
        const reason = `Could not move "${existing.title}" to ${newStatus}. Restored to ${previousStatus}.`;
        announce(reason);
        return { ok: false, error: reason };
      }

      announce(`Moved ${existing.title} to ${newStatus}`);
      return { ok: true };
    },
    [tasks, simulationSettings.failNextMove, announce]
  );

  const addComment = useCallback(
    async (taskId: string, rawText: string): Promise<Comment> => {
      const validationError = validateCommentText(rawText);
      if (validationError) {
        throw new Error(validationError);
      }

      await new Promise((resolve) => window.setTimeout(resolve, 140));

      if (simulationSettings.failNextComment) {
        setSimulationSettings((prev) => ({ ...prev, failNextComment: false }));
        throw new Error('Could not post comment. Please retry.');
      }

      const newComment: Comment = {
        id: `c${Date.now()}`,
        taskId,
        authorId: currentMember.id,
        text: rawText.trim(),
        createdAt: new Date().toISOString(),
      };

      setComments((prev) => [...prev, newComment]);
      announce('Comment posted');
      return newComment;
    },
    [currentMember.id, simulationSettings.failNextComment, announce]
  );

  const getCommentCountForTask = useCallback(
    (taskId: string) => comments.filter((c) => c.taskId === taskId).length,
    [comments]
  );

  const getMemberById = useCallback(
    (memberId: string | null) => {
      if (!memberId) return undefined;
      return members.find((m) => m.id === memberId);
    },
    [members]
  );

  const getProjectById = useCallback(
    (projectId: string) => projects.find((p) => p.id === projectId),
    [projects]
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaceName,
      members,
      currentMember,
      projects,
      tasks,
      comments,
      defaultView,
      theme,
      setTheme,
      toggleTheme,
      isLoadingTasks,
      loadError,
      simulationSettings,
      setSimulationSettings,
      liveAnnouncement,
      announce,
      retryLoadTasks,
      triggerSimulatedLoadError,
      getWorkspaceView,
      setWorkspaceView,
      getWorkspaceFilters,
      setWorkspaceFilters,
      getWorkspaceScroll,
      setWorkspaceScroll,
      savePreferences,
      createProject,
      createTask,
      updateTask,
      moveTaskStatus,
      addComment,
      getCommentCountForTask,
      getMemberById,
      getProjectById,
    }),
    [
      workspaceName,
      members,
      currentMember,
      projects,
      tasks,
      comments,
      defaultView,
      theme,
      setTheme,
      toggleTheme,
      isLoadingTasks,
      loadError,
      simulationSettings,
      liveAnnouncement,
      announce,
      retryLoadTasks,
      triggerSimulatedLoadError,
      getWorkspaceView,
      setWorkspaceView,
      getWorkspaceFilters,
      setWorkspaceFilters,
      getWorkspaceScroll,
      setWorkspaceScroll,
      savePreferences,
      createProject,
      createTask,
      updateTask,
      moveTaskStatus,
      addComment,
      getCommentCountForTask,
      getMemberById,
      getProjectById,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return ctx;
}
