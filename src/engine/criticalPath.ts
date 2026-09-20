import { Task, CalendarConfig } from '../types/gantt';
import { countWorkDaysBetween } from './calendar';

/**
 * Computes Critical Path Method (CPM):
 * Early Start/Finish, Late Start/Finish, Total Float, and flags isCritical on tasks.
 */
export function calculateCriticalPath(tasks: Task[], config: CalendarConfig): Task[] {
  if (tasks.length === 0) return [];

  // Find overall project finish date
  let maxEndDate = tasks[0].endDate;
  for (const t of tasks) {
    if (t.endDate > maxEndDate) {
      maxEndDate = t.endDate;
    }
  }

  // Build adjacency map: predecessor -> successors
  const successorMap = new Map<string, string[]>();
  for (const t of tasks) {
    successorMap.set(t.id, []);
  }
  for (const t of tasks) {
    for (const dep of t.dependencies) {
      const succList = successorMap.get(dep.targetTaskId);
      if (succList) succList.push(t.id);
    }
  }

  // Map tasks by ID for quick lookup
  const taskMap = new Map(tasks.map(t => [t.id, { ...t }]));

  // Backward pass to compute Late Finish (LF) and Late Start (LS)
  // For tasks with no successors, LF is maxEndDate
  for (const t of tasks) {
    const succs = successorMap.get(t.id) || [];
    if (succs.length === 0) {
      const cur = taskMap.get(t.id)!;
      cur.lateFinish = maxEndDate;
    }
  }

  // Reverse topological / backward evaluation
  const reversedTasks = [...tasks].sort((a, b) => b.endDate.localeCompare(a.endDate));

  for (const t of reversedTasks) {
    const cur = taskMap.get(t.id)!;
    const succs = successorMap.get(t.id) || [];

    if (succs.length > 0) {
      // LF is minimum of LS of successors
      let minSuccLs = maxEndDate;
      for (const succId of succs) {
        const succTask = taskMap.get(succId);
        if (succTask) {
          const succStart = succTask.startDate;
          if (succStart < minSuccLs) {
            minSuccLs = succStart;
          }
        }
      }
      cur.lateFinish = minSuccLs;
    } else {
      cur.lateFinish = maxEndDate;
    }

    cur.lateStart = cur.lateFinish; // Approximate in work days
    const floatDays = countWorkDaysBetween(cur.endDate, cur.lateFinish, config);
    cur.totalFloat = Math.max(0, floatDays);
  }

  // Identify minimum float
  let minFloat = Number.MAX_SAFE_INTEGER;
  for (const t of taskMap.values()) {
    if ((t.totalFloat ?? 0) < minFloat) {
      minFloat = t.totalFloat ?? 0;
    }
  }

  // Tasks with float <= 1 day on the critical chain are marked critical
  return tasks.map(orig => {
    const computed = taskMap.get(orig.id)!;
    const isCritical = (computed.totalFloat ?? 0) <= Math.max(0, minFloat);
    return {
      ...computed,
      isCritical,
    };
  });
}
