import React from 'react';
import { useGantt } from '../../context/GanttContext';
import { Task } from '../../types/gantt';
import { formatBrDate } from '../../engine/calendar';
import {
  Calendar,
  Clock,
  User,
  Diamond,
  Trash2,
  Edit3,
  Link,
  Flame,
} from 'lucide-react';

interface TaskDeckViewProps {
  onEditTask: (task: Task) => void;
}

export const TaskDeckView: React.FC<TaskDeckViewProps> = ({ onEditTask }) => {
  const { project, updateTaskProgress, deleteTask, setSelectedTaskId, selectedTaskId } = useGantt();

  // Find phase name for tasks
  const getPhaseName = (phaseId?: string) => {
    if (!phaseId) return null;
    const phase = project.tasks.find(t => t.id === phaseId);
    return phase ? phase.name : null;
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gantt-canvas pb-24 md:pb-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
        {project.tasks.map(task => {
          const isSelected = selectedTaskId === task.id;
          const isMilestone = task.isMilestone || task.type === 'milestone';
          const phaseName = getPhaseName(task.phaseId);

          return (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className={`bg-gantt-card border rounded-2xl p-4 sm:p-5 transition-all shadow-xs cursor-pointer ${
                isSelected
                  ? 'border-gantt-accent ring-1 ring-gantt-accent/50 shadow-sm'
                  : 'border-gantt-border hover:border-gantt-border/80'
              } ${task.isCritical ? 'border-l-4 border-l-carmim-500' : ''}`}
            >
              {/* Header: Badges & Actions */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Phase badge */}
                  {phaseName && (
                    <span className="text-[10px] font-semibold bg-gantt-canvas text-gantt-text-secondary px-2 py-0.5 rounded-md border border-gantt-border">
                      {phaseName}
                    </span>
                  )}

                  {/* Entity Type / Milestone */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isMilestone
                        ? 'bg-ouro-500/20 text-ouro-500 border border-ouro-500/30'
                        : task.type === 'sprint'
                        ? 'bg-gantt-accent/20 text-gantt-accent border border-gantt-accent/30'
                        : 'bg-esmeralda-500/20 text-esmeralda-500 border border-esmeralda-500/30'
                    }`}
                  >
                    {isMilestone && <Diamond className="w-3 h-3" />}
                    <span className="capitalize">{task.type}</span>
                  </span>

                  {/* Critical path badge */}
                  {task.isCritical && (
                    <span className="text-[10px] font-bold bg-carmim-500/20 text-carmim-500 border border-carmim-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                      <Flame className="w-3 h-3 text-carmim-500" />
                      <span>Caminho Crítico</span>
                    </span>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onEditTask(task);
                    }}
                    className="p-1.5 text-gantt-text-secondary hover:text-gantt-accent rounded-lg hover:bg-gantt-canvas transition-colors"
                    title="Editar Tarefa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm(`Deseja remover "${task.name}"?`)) {
                        deleteTask(task.id);
                      }
                    }}
                    className="p-1.5 text-gantt-text-secondary hover:text-carmim-500 rounded-lg hover:bg-gantt-canvas transition-colors"
                    title="Excluir Tarefa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-gantt-text-primary mb-2 tracking-tight">
                {task.name}
              </h3>

              {/* Timing & Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gantt-text-secondary mb-3 bg-gantt-canvas/60 rounded-xl p-2.5 border border-gantt-border/80">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gantt-accent shrink-0" />
                  <span className="tabular-nums">
                    {formatBrDate(task.startDate, false)} → {formatBrDate(task.endDate, false)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-ouro-500 shrink-0" />
                  <span>
                    {isMilestone ? 'Marco (0d)' : `${task.duration} dias úteis`}
                  </span>
                </div>

                {task.assignee && (
                  <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                    <User className="w-3.5 h-3.5 text-esmeralda-500 shrink-0" />
                    <span className="truncate">{task.assignee}</span>
                  </div>
                )}
              </div>

              {/* Dependencies info */}
              {task.dependencies && task.dependencies.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-gantt-text-secondary mb-3">
                  <Link className="w-3 h-3 text-gantt-accent shrink-0" />
                  <span className="font-semibold text-gantt-text-primary">Depende de:</span>
                  <div className="flex flex-wrap gap-1">
                    {task.dependencies.map(dep => {
                      const pred = project.tasks.find(t => t.id === dep.targetTaskId);
                      return (
                        <span
                          key={dep.id}
                          className="bg-gantt-canvas border border-gantt-border px-1.5 py-0.5 rounded text-[10px] text-gantt-text-secondary"
                        >
                          {pred ? pred.name : 'Tarefa anterior'} ({dep.type})
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Touch Progress Slider */}
              <div className="mt-2 pt-2 border-t border-gantt-border/60">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-gantt-text-secondary">Progresso da Atividade</span>
                  <span
                    className={`font-bold tabular-nums ${
                      task.progress === 100
                        ? 'text-esmeralda-500'
                        : task.progress > 0
                        ? 'text-gantt-accent'
                        : 'text-gantt-text-muted'
                    }`}
                  >
                    {task.progress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={task.progress}
                  onChange={e => updateTaskProgress(task.id, Number(e.target.value))}
                  className="w-full accent-gantt-accent bg-gantt-canvas h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
