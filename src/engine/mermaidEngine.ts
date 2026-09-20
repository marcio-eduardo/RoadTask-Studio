import { Task, Project } from '../types/gantt';

/**
 * Converts project tasks into standard Mermaid.js Gantt chart format.
 */
export function exportToMermaid(project: Project): string {
  let output = `gantt\n`;
  output += `    title ${project.name}\n`;
  output += `    dateFormat YYYY-MM-DD\n`;
  output += `    axisFormat %d/%m\n\n`;

  // Group tasks by phase or render as flat
  const phases = project.tasks.filter(t => t.type === 'phase');

  if (phases.length > 0) {
    for (const phase of phases) {
      output += `    section ${phase.name}\n`;
      const phaseChildren = project.tasks.filter(t => t.phaseId === phase.id);

      for (const t of phaseChildren) {
        output += formatMermaidTaskLine(t);
      }
      output += `\n`;
    }

    // Unassigned tasks
    const unassigned = project.tasks.filter(t => t.type !== 'phase' && !t.phaseId);
    if (unassigned.length > 0) {
      output += `    section Atividades Gerais\n`;
      for (const t of unassigned) {
        output += formatMermaidTaskLine(t);
      }
    }
  } else {
    output += `    section Cronograma\n`;
    for (const t of project.tasks) {
      output += formatMermaidTaskLine(t);
    }
  }

  return output;
}

function formatMermaidTaskLine(t: Task): string {
  const cleanName = t.name.replace(/[:;#]/g, ' - ');
  const statusModifier = t.progress === 100 ? 'done, ' : t.progress > 0 ? 'active, ' : '';
  const critModifier = t.isCritical ? 'crit, ' : '';
  const milestoneModifier = t.isMilestone || t.type === 'milestone' ? 'milestone, ' : '';

  const prefix = `${statusModifier}${critModifier}${milestoneModifier}`.trim();
  const id = `t_${t.id.slice(0, 6)}`;

  let timeSpec = '';
  if (t.dependencies && t.dependencies.length > 0) {
    const primaryDep = t.dependencies[0];
    const predId = `t_${primaryDep.targetTaskId.slice(0, 6)}`;
    timeSpec = `after ${predId}, ${t.duration}d`;
  } else {
    timeSpec = `${t.startDate}, ${t.duration}d`;
  }

  if (t.isMilestone || t.type === 'milestone') {
    return `    ${cleanName} :${prefix} ${id}, ${t.startDate}, 0d\n`;
  }

  return `    ${cleanName} :${prefix ? prefix + ' ' : ''}${id}, ${timeSpec}\n`;
}

/**
 * Basic parser to import Mermaid Gantt syntax into tasks.
 */
export function importFromMermaid(mermaidText: string): Partial<Task>[] {
  const lines = mermaidText.split('\n');
  const importedTasks: Partial<Task>[] = [];
  let currentSection = 'Geral';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%') || trimmed.startsWith('gantt') || trimmed.startsWith('title') || trimmed.startsWith('dateFormat') || trimmed.startsWith('axisFormat')) {
      continue;
    }

    if (trimmed.startsWith('section')) {
      currentSection = trimmed.replace(/^section\s+/, '').trim();
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      const name = trimmed.substring(0, colonIdx).trim();
      const meta = trimmed.substring(colonIdx + 1).trim();
      const parts = meta.split(',').map(s => s.trim());

      const isMilestone = meta.includes('milestone');
      const isDone = meta.includes('done');
      const isCrit = meta.includes('crit');

      // Attempt to extract duration (e.g., "5d", "10d")
      let duration = isMilestone ? 0 : 5;
      for (const p of parts) {
        if (p.endsWith('d') && !isNaN(Number(p.replace('d', '')))) {
          duration = Number(p.replace('d', ''));
        }
      }

      importedTasks.push({
        id: `imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        type: isMilestone ? 'milestone' : 'story',
        duration,
        progress: isDone ? 100 : 0,
        isMilestone,
        isCritical: isCrit,
        notes: `Importado da seção: ${currentSection}`,
      });
    }
  }

  return importedTasks;
}
