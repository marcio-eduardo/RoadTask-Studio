export type EntityType = 'epic' | 'phase' | 'sprint' | 'story' | 'milestone';

export const isEpic = (task: { type?: EntityType }): boolean => task.type === 'epic' || task.type === 'phase';
export const getTaskEpicId = (task: { epicId?: string; phaseId?: string }): string | undefined => task.epicId || task.phaseId;

export type TimeUnit = 'hours' | 'days' | 'weeks' | 'months';

export type DependencyType = 'FS' | 'SS' | 'FF';

export interface TaskDependency {
  id: string;
  targetTaskId: string; // The predecessor task ID
  type: DependencyType;
  lag?: number; // Lag/lead in work days
}

export type TaskStatus = 'not_started' | 'in_progress' | 'in_review' | 'completed' | 'blocked' | 'paused';

export type TaskHealth = 'on_track' | 'at_risk' | 'delayed' | 'blocked';

export interface TaskUpdateItem {
  id: string;
  timestamp: string; // ISO timestamp
  text: string; // Ex: "Alinhado reunião" ou "Criado API para consumo de dados"
  author?: string;
  category?: 'general' | 'meeting' | 'technical' | 'delivery' | 'blocker';
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface SubTask {
  id: string;
  name: string;
  completed: boolean;
  status?: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  assignee?: string;
  postponedCount?: number;
}

export const getTaskSubtasks = (task: Partial<Task>): SubTask[] => {
  if (task.subtasks && task.subtasks.length > 0) {
    return task.subtasks;
  }
  if (task.checklist && task.checklist.length > 0) {
    return task.checklist.map(c => ({
      id: c.id,
      name: c.text,
      completed: c.completed,
      status: c.completed ? 'done' : 'todo',
    }));
  }
  return [];
};

export interface Task {
  id: string;
  name: string;
  type: EntityType;
  phaseId?: string; // Grouping parent (Phase/Epic) - legacy support
  epicId?: string; // Grouping parent (Epic)
  startDate: string; // ISO string 'YYYY-MM-DD'
  duration: number; // Duration in work days (or hours if timeUnit === 'hours')
  endDate: string; // Computed end date
  progress: number; // 0 - 100%
  dependencies: TaskDependency[];
  assignee?: string;
  color?: string;
  isMilestone?: boolean;
  notes?: string;

  // Status & Atualizações Operacionais do Projeto
  status?: TaskStatus;
  health?: TaskHealth;
  updates?: TaskUpdateItem[];
  checklist?: TaskChecklistItem[];
  subtasks?: SubTask[];
  actualStartDate?: string;
  actualEndDate?: string;
  lastUpdateNote?: string;

  // CPM (Critical Path Method) Computed Fields
  isCritical?: boolean;
  earlyStart?: string;
  earlyFinish?: string;
  lateStart?: string;
  lateFinish?: string;
  totalFloat?: number; // Slack in work days

  // Baseline comparison for What-If Simulation
  baseline?: {
    startDate: string;
    endDate: string;
    duration: number;
  };
}

export interface CalendarConfig {
  includeWeekends: boolean;
  saturdayIsWorkday: boolean;
  holidays: string[]; // 'YYYY-MM-DD'
  workHoursPerDay: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientName?: string;
  targetDate?: string; // Target delivery date
  timeUnit: TimeUnit;
  calendar: CalendarConfig;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface SimulationState {
  isActive: boolean;
  baselineTasks: Task[];
  activeImpactDays: number;
  impactedMilestoneName?: string;
}

export type ViewMode = 'deck' | 'timeline' | 'split' | 'table' | 'scrum';

export type ZoomLevel = 'day' | 'week' | 'month' | 'quarter';

export interface ExecutiveKpiSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  milestonesCount: number;
  totalWorkDays: number;
  overallProgress: number;
  projectStartDate: string;
  projectEndDate: string;
  targetDeliveryDate?: string;
  varianceDays: number; // Positive = Ahead, Negative = Delayed
  criticalPathCount: number;
}
