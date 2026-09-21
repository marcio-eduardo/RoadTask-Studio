import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Project,
  Task,
  ViewMode,
  ZoomLevel,
  ExecutiveKpiSummary,
  SimulationState,
  DependencyType,
} from '../types/gantt';
import { BLUEPRINTS } from '../data/blueprints';
import { recalculateProjectCascade, wouldCreateCycle } from '../engine/dependencies';
import { calculateCriticalPath } from '../engine/criticalPath';
import { countWorkDaysBetween, ensureWorkDay, calculateEndDate } from '../engine/calendar';
import { getDefaultHolidays } from '../data/holidaysBR';
import { saveToWindowsFile, openFromWindowsFile } from '../services/windowsFileSystem';

const STORAGE_KEY = 'vanguard_gantt_projects_v2';
const ACTIVE_PROJ_KEY = 'vanguard_gantt_active_id_v2';

interface GanttContextType {
  project: Project;
  savedProjects: Project[];
  selectedTask: Task | null;
  selectedTaskId: string | null;
  viewMode: ViewMode;
  zoomLevel: ZoomLevel;
  isPitchMode: boolean;
  simulation: SimulationState;
  canUndo: boolean;
  canRedo: boolean;
  kpis: ExecutiveKpiSummary;

  // Actions
  setSelectedTaskId: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setZoomLevel: (zoom: ZoomLevel) => void;
  togglePitchMode: () => void;
  loadBlueprint: (blueprintId: string) => void;
  loadProject: (project: Project) => void;
  updateProjectInfo: (info: Partial<Pick<Project, 'name' | 'clientName' | 'description' | 'targetDate'>>) => void;
  createNewProject: () => void;
  
  // Windows File System Access
  linkedFileName: string | null;
  isDirty: boolean;
  saveToWindows: (forceSaveAs?: boolean | any) => Promise<boolean>;
  openFromWindows: () => Promise<boolean>;
  unlinkWindowsFile: () => void;

  // Task Manipulation
  addTask: (task: Partial<Task>, autoChainWithPrevious?: boolean) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTaskDate: (taskId: string, newStartDate: string) => void;
  resizeTaskDuration: (taskId: string, newDuration: number) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  addDependency: (fromPredecessorId: string, toSuccessorId: string, type?: DependencyType) => boolean;
  removeDependency: (taskId: string, predId: string) => void;

  // Simulation (What-If)
  toggleSimulation: () => void;
  applySimulation: () => void;
  discardSimulation: () => void;

  // Theme (Dark / Light)
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
}

const GanttContext = createContext<GanttContextType | undefined>(undefined);

export const GanttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial project from storage or default to SGFrotas blueprint
  const [savedProjects, setSavedProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasIntegrado = parsed.some((p: Project) => p.id === 'proj_sgfrotas_integrado');
          if (!hasIntegrado) {
            return [BLUEPRINTS[0].project, ...parsed.filter((p: Project) => p.id !== 'proj_sgfrotas_sp')];
          }
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return BLUEPRINTS.map(b => b.project);
  });

  const [project, setProject] = useState<Project>(() => {
    try {
      const activeId = localStorage.getItem(ACTIVE_PROJ_KEY);
      if (activeId && activeId !== 'proj_sgfrotas_sp') {
        const found = savedProjects.find(p => p.id === activeId);
        if (found) return found;
      }
    } catch {
      // Fallback
    }
    return BLUEPRINTS[0].project;
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('day');
  const [isPitchMode, setIsPitchMode] = useState<boolean>(false);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('roadtask-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('roadtask-theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Simulation State
  const [simulation, setSimulation] = useState<SimulationState>({
    isActive: false,
    baselineTasks: [],
    activeImpactDays: 0,
  });

  // History Stacks
  const [history, setHistory] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);

  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Push history helper
  const pushHistory = useCallback((prevProj: Project) => {
    setHistory(h => [...h.slice(-30), JSON.parse(JSON.stringify(prevProj))]);
    setFuture([]);
    setIsDirty(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_PROJ_KEY, project.id);
      setSavedProjects(prevList => {
        const idx = prevList.findIndex(p => p.id === project.id);
        let updatedList: Project[];
        if (idx >= 0) {
          updatedList = [...prevList];
          updatedList[idx] = project;
        } else {
          updatedList = [...prevList, project];
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        return updatedList;
      });
    } catch {
      // Storage error ignored
    }
  }, [project]);

  // Recalculate project tasks with cascade and CPM
  const recomputeProject = useCallback((baseProject: Project): Project => {
    const cascaded = recalculateProjectCascade(baseProject.tasks, baseProject.calendar);
    const withCpm = calculateCriticalPath(cascaded, baseProject.calendar);
    return {
      ...baseProject,
      tasks: withCpm,
      updatedAt: new Date().toISOString().split('T')[0],
    };
  }, []);

  // Initialize initial CPM
  useEffect(() => {
    setProject(p => recomputeProject(p));
  }, [recomputeProject]);

  const selectedTask = useMemo(() => {
    return project.tasks.find(t => t.id === selectedTaskId) || null;
  }, [project.tasks, selectedTaskId]);

  // Calculate Executive KPIs
  const kpis = useMemo((): ExecutiveKpiSummary => {
    const tasks = project.tasks;
    if (tasks.length === 0) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        milestonesCount: 0,
        totalWorkDays: 0,
        overallProgress: 0,
        projectStartDate: '',
        projectEndDate: '',
        varianceDays: 0,
        criticalPathCount: 0,
      };
    }

    let minStart = tasks[0].startDate;
    let maxEnd = tasks[0].endDate;
    let completed = 0;
    let inProgress = 0;
    let milestones = 0;
    let progressSum = 0;
    let critCount = 0;

    for (const t of tasks) {
      if (t.startDate < minStart) minStart = t.startDate;
      if (t.endDate > maxEnd) maxEnd = t.endDate;
      if (t.isMilestone || t.type === 'milestone') milestones++;
      if (t.progress === 100) completed++;
      else if (t.progress > 0) inProgress++;
      if (t.isCritical) critCount++;
      progressSum += t.progress;
    }

    const totalWork = countWorkDaysBetween(minStart, maxEnd, project.calendar);
    const overallProgress = Math.round(progressSum / Math.max(1, tasks.length));

    let varianceDays = 0;
    if (project.targetDate) {
      const diff = countWorkDaysBetween(maxEnd, project.targetDate, project.calendar);
      varianceDays = project.targetDate >= maxEnd ? diff : -diff;
    }

    return {
      totalTasks: tasks.length,
      completedTasks: completed,
      inProgressTasks: inProgress,
      milestonesCount: milestones,
      totalWorkDays: totalWork,
      overallProgress,
      projectStartDate: minStart,
      projectEndDate: maxEnd,
      targetDeliveryDate: project.targetDate,
      varianceDays,
      criticalPathCount: critCount,
    };
  }, [project]);

  // Update simulation impact days
  useEffect(() => {
    if (!simulation.isActive || simulation.baselineTasks.length === 0) return;

    const baseEnd = simulation.baselineTasks.reduce((max, t) => (t.endDate > max ? t.endDate : max), '');
    const currentEnd = project.tasks.reduce((max, t) => (t.endDate > max ? t.endDate : max), '');

    if (baseEnd && currentEnd) {
      const isDelayed = currentEnd > baseEnd;
      const diff = countWorkDaysBetween(
        isDelayed ? baseEnd : currentEnd,
        isDelayed ? currentEnd : baseEnd,
        project.calendar
      );
      setSimulation(s => ({
        ...s,
        activeImpactDays: isDelayed ? diff : -diff,
      }));
    }
  }, [project.tasks, simulation.isActive, simulation.baselineTasks, project.calendar]);

  // Actions
  const togglePitchMode = useCallback(() => {
    setIsPitchMode(prev => !prev);
  }, []);

  const loadBlueprint = useCallback((blueprintId: string) => {
    const bp = BLUEPRINTS.find(b => b.id === blueprintId);
    if (bp) {
      pushHistory(project);
      const cloned: Project = JSON.parse(JSON.stringify(bp.project));
      cloned.id = `proj_${Date.now()}`;
      setProject(recomputeProject(cloned));
      setSelectedTaskId(null);
    }
  }, [project, pushHistory, recomputeProject]);

  const loadProject = useCallback((p: Project) => {
    pushHistory(project);
    setProject(recomputeProject(p));
    setSelectedTaskId(null);
    setIsDirty(false);
  }, [project, pushHistory, recomputeProject]);

  const createNewProject = useCallback(() => {
    pushHistory(project);
    const today = new Date().toISOString().split('T')[0];
    const blank: Project = {
      id: `proj_${Date.now()}`,
      name: 'Novo Cronograma',
      clientName: '',
      description: '',
      targetDate: '',
      timeUnit: 'days',
      calendar: {
        includeWeekends: false,
        saturdayIsWorkday: false,
        holidays: getDefaultHolidays(),
        workHoursPerDay: 8,
      },
      createdAt: today,
      updatedAt: today,
      tasks: [
        {
          id: 'phase_1',
          name: 'Fase 1',
          type: 'phase',
          startDate: today,
          duration: 5,
          endDate: today,
          progress: 0,
          dependencies: [],
          color: '#0284C7',
        },
      ],
    };
    setProject(recomputeProject(blank));
    setActiveFileHandle(null);
    setLinkedFileName(null);
    setIsDirty(false);
    setSelectedTaskId(null);
  }, [project, pushHistory, recomputeProject]);

  // Windows File System Access
  const [activeFileHandle, setActiveFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [linkedFileName, setLinkedFileName] = useState<string | null>(null);

  const saveToWindows = useCallback(async (forceSaveAs?: boolean | any) => {
    const isForce = forceSaveAs === true;
    const handleToUse = isForce ? null : activeFileHandle;
    const res = await saveToWindowsFile(project, handleToUse);
    if (res.success) {
      if (res.handle) {
        setActiveFileHandle(res.handle);
      }
      if (res.fileName) {
        setLinkedFileName(res.fileName);
      }
      setIsDirty(false);
      return true;
    }
    return false;
  }, [project, activeFileHandle]);

  const openFromWindows = useCallback(async () => {
    const res = await openFromWindowsFile();
    if (res.success && res.project) {
      loadProject(res.project);
      if (res.handle) {
        setActiveFileHandle(res.handle);
      }
      if (res.fileName) {
        setLinkedFileName(res.fileName);
      }
      setIsDirty(false);
      return true;
    }
    return false;
  }, [loadProject]);

  const unlinkWindowsFile = useCallback(() => {
    setActiveFileHandle(null);
    setLinkedFileName(null);
  }, []);

  // Keyboard shortcut: Ctrl+S to save directly to linked Windows file
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveToWindows();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveToWindows]);

  const updateProjectInfo = useCallback((info: Partial<Pick<Project, 'name' | 'clientName' | 'description' | 'targetDate'>>) => {
    pushHistory(project);
    setProject(p => ({
      ...p,
      ...info,
      updatedAt: new Date().toISOString().split('T')[0],
    }));
  }, [project, pushHistory]);

  const addTask = useCallback((taskData: Partial<Task>, autoChainWithPrevious = true) => {
    pushHistory(project);

    setProject(prev => {
      const existingTasks = prev.tasks;
      const lastTask = existingTasks.length > 0 ? existingTasks[existingTasks.length - 1] : null;

      let start = taskData.startDate;
      const deps = taskData.dependencies ? [...taskData.dependencies] : [];

      if (!start) {
        if (autoChainWithPrevious && lastTask) {
          deps.push({
            id: `dep_${Date.now()}`,
            targetTaskId: lastTask.id,
            type: 'FS',
          });
          start = lastTask.endDate;
        } else {
          start = lastTask ? lastTask.startDate : ensureWorkDay(new Date().toISOString().split('T')[0], prev.calendar);
        }
      }

      const duration = taskData.duration !== undefined ? taskData.duration : (taskData.type === 'milestone' ? 0 : 5);
      const isMilestone = taskData.type === 'milestone' || duration === 0;
      const end = calculateEndDate(start, duration, prev.calendar);

      const newTask: Task = {
        id: taskData.id || `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: taskData.name || (taskData.type === 'milestone' ? 'Novo Marco' : 'Nova Tarefa'),
        type: taskData.type || 'story',
        phaseId: taskData.phaseId,
        startDate: start,
        duration,
        endDate: end,
        progress: taskData.progress || 0,
        dependencies: deps,
        assignee: taskData.assignee,
        color: taskData.color,
        isMilestone,
        notes: taskData.notes,
      };

      const updated = {
        ...prev,
        tasks: [...existingTasks, newTask],
      };

      return recomputeProject(updated);
    });
  }, [project, pushHistory, recomputeProject]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    pushHistory(project);
    setProject(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          const merged = { ...t, ...updates };
          if (updates.duration !== undefined || updates.startDate !== undefined) {
            merged.endDate = calculateEndDate(merged.startDate, merged.duration, prev.calendar);
          }
          return merged;
        }
        return t;
      });
      return recomputeProject({ ...prev, tasks: updatedTasks });
    });
  }, [project, pushHistory, recomputeProject]);

  const deleteTask = useCallback((taskId: string) => {
    pushHistory(project);
    setProject(prev => {
      // Remove task and any dependencies targeting it
      const filtered = prev.tasks
        .filter(t => t.id !== taskId)
        .map(t => ({
          ...t,
          dependencies: t.dependencies.filter(d => d.targetTaskId !== taskId),
        }));
      return recomputeProject({ ...prev, tasks: filtered });
    });
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  }, [project, pushHistory, recomputeProject, selectedTaskId]);

  const moveTaskDate = useCallback((taskId: string, newStartDate: string) => {
    setProject(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          const validatedStart = ensureWorkDay(newStartDate, prev.calendar);
          const validatedEnd = calculateEndDate(validatedStart, t.duration, prev.calendar);
          return {
            ...t,
            startDate: validatedStart,
            endDate: validatedEnd,
          };
        }
        return t;
      });
      return recomputeProject({ ...prev, tasks: updatedTasks });
    });
  }, [recomputeProject]);

  const resizeTaskDuration = useCallback((taskId: string, newDuration: number) => {
    setProject(prev => {
      const safeDuration = Math.max(0, newDuration);
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            duration: safeDuration,
            endDate: calculateEndDate(t.startDate, safeDuration, prev.calendar),
            isMilestone: safeDuration === 0 || t.type === 'milestone',
          };
        }
        return t;
      });
      return recomputeProject({ ...prev, tasks: updatedTasks });
    });
  }, [recomputeProject]);

  const updateTaskProgress = useCallback((taskId: string, progress: number) => {
    setProject(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, progress: Math.min(100, Math.max(0, progress)) };
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks };
    });
  }, []);

  const addDependency = useCallback((fromPredecessorId: string, toSuccessorId: string, type: DependencyType = 'FS'): boolean => {
    if (fromPredecessorId === toSuccessorId) return false;
    if (wouldCreateCycle(project.tasks, fromPredecessorId, toSuccessorId)) {
      alert('⚠️ Operação não permitida: essa dependência geraria uma referência circular.');
      return false;
    }

    pushHistory(project);
    setProject(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === toSuccessorId) {
          const exists = t.dependencies.some(d => d.targetTaskId === fromPredecessorId);
          if (exists) return t;
          return {
            ...t,
            dependencies: [
              ...t.dependencies,
              { id: `dep_${Date.now()}`, targetTaskId: fromPredecessorId, type },
            ],
          };
        }
        return t;
      });
      return recomputeProject({ ...prev, tasks: updatedTasks });
    });
    return true;
  }, [project, pushHistory, recomputeProject]);

  const removeDependency = useCallback((taskId: string, predId: string) => {
    pushHistory(project);
    setProject(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            dependencies: t.dependencies.filter(d => d.targetTaskId !== predId),
          };
        }
        return t;
      });
      return recomputeProject({ ...prev, tasks: updatedTasks });
    });
  }, [project, pushHistory, recomputeProject]);

  // Simulation controls
  const toggleSimulation = useCallback(() => {
    if (!simulation.isActive) {
      // Start simulation: record baseline
      setSimulation({
        isActive: true,
        baselineTasks: JSON.parse(JSON.stringify(project.tasks)),
        activeImpactDays: 0,
      });
    } else {
      // Discard by default if toggling off
      setProject(prev => ({
        ...prev,
        tasks: simulation.baselineTasks,
      }));
      setSimulation({
        isActive: false,
        baselineTasks: [],
        activeImpactDays: 0,
      });
    }
  }, [simulation.isActive, simulation.baselineTasks, project.tasks]);

  const applySimulation = useCallback(() => {
    setSimulation({
      isActive: false,
      baselineTasks: [],
      activeImpactDays: 0,
    });
  }, []);

  const discardSimulation = useCallback(() => {
    if (simulation.baselineTasks.length > 0) {
      setProject(prev => recomputeProject({
        ...prev,
        tasks: simulation.baselineTasks,
      }));
    }
    setSimulation({
      isActive: false,
      baselineTasks: [],
      activeImpactDays: 0,
    });
  }, [simulation.baselineTasks, recomputeProject]);

  // Undo / Redo
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prevProj = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setFuture(f => [JSON.parse(JSON.stringify(project)), ...f]);
    setProject(prevProj);
  }, [history, project]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const nextProj = future[0];
    setFuture(f => f.slice(1));
    setHistory(h => [...h, JSON.parse(JSON.stringify(project))]);
    setProject(nextProj);
  }, [future, project]);

  // Keyboard shortcuts for Undo/Redo and Pitch Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'F11' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p')) {
        // Pitch Mode shortcut
        e.preventDefault();
        togglePitchMode();
      } else if (e.key === 'Escape' && isPitchMode) {
        // Exit Pitch Mode with Escape key
        e.preventDefault();
        togglePitchMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, togglePitchMode, isPitchMode]);

  return (
    <GanttContext.Provider
      value={{
        project,
        savedProjects,
        selectedTask,
        selectedTaskId,
        viewMode,
        zoomLevel,
        isPitchMode,
        simulation,
        canUndo: history.length > 0,
        canRedo: future.length > 0,
        kpis,

        setSelectedTaskId,
        setViewMode,
        setZoomLevel,
        togglePitchMode,
        loadBlueprint,
        loadProject,
        updateProjectInfo,
        createNewProject,

        linkedFileName,
        isDirty,
        saveToWindows,
        openFromWindows,
        unlinkWindowsFile,

        addTask,
        updateTask,
        deleteTask,
        moveTaskDate,
        resizeTaskDuration,
        updateTaskProgress,
        addDependency,
        removeDependency,

        toggleSimulation,
        applySimulation,
        discardSimulation,

        undo,
        redo,

        theme,
        toggleTheme,
      }}
    >
      {children}
    </GanttContext.Provider>
  );
};

export const useGantt = () => {
  const context = useContext(GanttContext);
  if (!context) {
    throw new Error('useGantt must be used within a GanttProvider');
  }
  return context;
};
