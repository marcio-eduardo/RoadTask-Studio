import { Task, CalendarConfig } from '../types/gantt';
import { calculateEndDate, getNextWorkDayAfter, ensureWorkDay } from './calendar';

/**
 * Checks if adding a dependency from `targetTaskId` to `taskId` would introduce a cycle.
 */
export function wouldCreateCycle(
  tasks: Task[],
  fromPredecessorId: string,
  toSuccessorId: string
): boolean {
  if (fromPredecessorId === toSuccessorId) return true;

  // Build adjacency map: parent -> list of dependents (successors)
  const adj = new Map<string, string[]>();
  for (const t of tasks) {
    adj.set(t.id, []);
  }

  for (const t of tasks) {
    for (const dep of t.dependencies) {
      const list = adj.get(dep.targetTaskId);
      if (list) {
        list.push(t.id);
      }
    }
  }

  // Add candidate edge
  const candList = adj.get(fromPredecessorId) || [];
  candList.push(toSuccessorId);
  adj.set(fromPredecessorId, candList);

  // DFS to detect cycle starting from toSuccessorId reaching fromPredecessorId
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function hasCycleDfs(curr: string): boolean {
    visited.add(curr);
    recStack.add(curr);

    const neighbors = adj.get(curr) || [];
    for (const n of neighbors) {
      if (!visited.has(n)) {
        if (hasCycleDfs(n)) return true;
      } else if (recStack.has(n)) {
        return true;
      }
    }

    recStack.delete(curr);
    return false;
  }

  return hasCycleDfs(toSuccessorId);
}

/**
 * Performs topological sort on tasks based on dependencies.
 */
export function topologicalSortTasks(tasks: Task[]): Task[] {
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const t of tasks) {
    inDegree.set(t.id, 0);
    adj.set(t.id, []);
  }

  for (const t of tasks) {
    for (const dep of t.dependencies) {
      if (taskMap.has(dep.targetTaskId)) {
        const curDegree = inDegree.get(t.id) || 0;
        inDegree.set(t.id, curDegree + 1);

        const list = adj.get(dep.targetTaskId) || [];
        list.push(t.id);
        adj.set(dep.targetTaskId, list);
      }
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(id);
    }
  }

  const sorted: Task[] = [];
  while (queue.length > 0) {
    const currId = queue.shift()!;
    const t = taskMap.get(currId);
    if (t) sorted.push(t);

    const neighbors = adj.get(currId) || [];
    for (const n of neighbors) {
      const d = (inDegree.get(n) || 1) - 1;
      inDegree.set(n, d);
      if (d === 0) {
        queue.push(n);
      }
    }
  }

  // If there are disconnected or remaining nodes (in case of a cycle), add them back
  if (sorted.length < tasks.length) {
    const included = new Set(sorted.map(t => t.id));
    for (const t of tasks) {
      if (!included.has(t.id)) {
        sorted.push(t);
      }
    }
  }

  return sorted;
}

/**
 * Re-evaluates dates of all tasks in cascade starting from topological order.
 */
export function recalculateProjectCascade(
  tasks: Task[],
  config: CalendarConfig
): Task[] {
  const sorted = topologicalSortTasks(tasks);
  const updatedMap = new Map<string, Task>();

  for (const task of sorted) {
    let earliestStart = task.startDate;

    if (task.dependencies && task.dependencies.length > 0) {
      for (const dep of task.dependencies) {
        const pred = updatedMap.get(dep.targetTaskId);
        if (!pred) continue;

        let requiredStart = task.startDate;
        const lag = dep.lag || 0;

        if (dep.type === 'FS') {
          // Finish-to-Start: Task starts after Predecessor finishes
          requiredStart = getNextWorkDayAfter(pred.endDate, config, lag);
        } else if (dep.type === 'SS') {
          // Start-to-Start: Task starts at/after Predecessor starts + lag
          if (lag > 0) {
            requiredStart = calculateEndDate(pred.startDate, lag + 1, config);
          } else {
            requiredStart = pred.startDate;
          }
        } else if (dep.type === 'FF') {
          // Finish-to-Finish
          requiredStart = task.startDate;
        }

        if (requiredStart > earliestStart) {
          earliestStart = requiredStart;
        }
      }
    }

    const finalStart = ensureWorkDay(earliestStart, config);
    const finalEnd = calculateEndDate(finalStart, task.duration, config);

    const updatedTask: Task = {
      ...task,
      startDate: finalStart,
      endDate: finalEnd,
    };

    updatedMap.set(task.id, updatedTask);
  }

  // Return tasks in original array order with updated dates
  return tasks.map(t => updatedMap.get(t.id) || t);
}
