import React from 'react';
import { useGantt } from '../../context/GanttContext';
import { Task } from '../../types/gantt';
import { formatBrDate } from '../../engine/calendar';
import {
  Diamond,
  Flame,
  Trash2,
  Edit2,
  MessageSquareText,
} from 'lucide-react';

interface TaskTableViewProps {
  onEditTask: (task: Task) => void;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({ onEditTask }) => {
  const { project, selectedTaskId, setSelectedTaskId, deleteTask, updateTaskProgress } = useGantt();

  return (
    <div className="flex-1 overflow-auto bg-gantt-canvas p-3 sm:p-5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto bg-gantt-card border border-gantt-border rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gantt-header border-b border-gantt-border text-gantt-text-secondary font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4 min-w-[220px]">Estrutura WBS / Nome</th>
                <th className="py-3.5 px-3">Tipo</th>
                <th className="py-3.5 px-3">Início</th>
                <th className="py-3.5 px-3">Término</th>
                <th className="py-3.5 px-3">Dias</th>
                <th className="py-3.5 px-4 min-w-[140px]">Conclusão</th>
                <th className="py-3.5 px-3">Responsável</th>
                <th className="py-3.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gantt-border text-gantt-text-primary">
              {project.tasks.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 px-4 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <span className="text-xs font-bold text-gantt-primary">Projeto em Branco</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Nenhuma atividade cadastrada. Use o construtor acima para adicionar tarefas ou carregue um modelo no menu Projeto.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              {project.tasks.map((task, idx) => {
                const isSelected = selectedTaskId === task.id;
                const isMilestone = task.isMilestone || task.type === 'milestone';
                const isChild = !!task.phaseId;

                return (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`hover:bg-gantt-canvas/60 transition-colors cursor-pointer ${
                      isSelected ? 'bg-gantt-accent/10' : ''
                    } ${task.isCritical ? 'bg-carmim-500/5' : ''}`}
                  >
                    {/* Index */}
                    <td className="py-3 px-4 font-mono text-[11px] text-gantt-text-muted">
                      {idx + 1}
                    </td>

                    {/* Task Name with indentation */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col truncate">
                        <div className={`flex items-center gap-2 ${isChild ? 'pl-5' : ''}`}>
                          {isMilestone ? (
                            <Diamond className="w-3.5 h-3.5 text-ouro-500 shrink-0" />
                          ) : task.isCritical ? (
                            <Flame className="w-3.5 h-3.5 text-carmim-500 shrink-0" />
                          ) : (
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: task.color || 'var(--gantt-brand-accent)' }}
                            />
                          )}
                          <span
                            className={`font-semibold text-gantt-text-primary ${
                              task.type === 'phase' ? 'text-sm font-bold text-gantt-accent' : ''
                            }`}
                          >
                            {task.name}
                          </span>
                          {task.health && (
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                task.health === 'on_track'
                                  ? 'bg-esmeralda-400'
                                  : task.health === 'at_risk'
                                  ? 'bg-ouro-400'
                                  : 'bg-carmim-400'
                              }`}
                              title={`Saúde: ${task.health}`}
                            />
                          )}
                        </div>
                        {((task.updates && task.updates.length > 0) || task.lastUpdateNote) && (
                          <div className={`flex items-center gap-1 text-[11px] text-safira-400 mt-0.5 truncate ${isChild ? 'pl-5' : ''}`}>
                            <MessageSquareText className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              {task.updates && task.updates.length > 0 ? task.updates[0].text : task.lastUpdateNote}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Entity Type */}
                    <td className="py-3 px-3">
                      <span className="text-[10px] uppercase font-bold bg-gantt-canvas px-2 py-0.5 rounded border border-gantt-border text-gantt-text-secondary">
                        {task.type}
                      </span>
                    </td>

                    {/* Start Date */}
                    <td className="py-3 px-3 font-mono tabular-nums text-gantt-text-secondary">
                      {formatBrDate(task.startDate)}
                    </td>

                    {/* End Date */}
                    <td className="py-3 px-3 font-mono tabular-nums text-gantt-text-secondary">
                      {formatBrDate(task.endDate)}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 font-semibold tabular-nums text-gantt-text-primary">
                      {isMilestone ? '0d' : `${task.duration}d`}
                    </td>

                    {/* Progress Slider inline */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={task.progress}
                          onChange={e => updateTaskProgress(task.id, Number(e.target.value))}
                          className="w-20 accent-gantt-accent bg-gantt-canvas h-1.5 rounded cursor-pointer"
                        />
                        <span className="font-bold tabular-nums text-[11px] text-gantt-text-secondary w-8">
                          {task.progress}%
                        </span>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-3 text-gantt-text-secondary truncate max-w-[120px]">
                      {task.assignee || '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                          className="p-1.5 text-gantt-text-secondary hover:text-gantt-accent rounded-lg hover:bg-gantt-canvas transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Remover "${task.name}"?`)) {
                              deleteTask(task.id);
                            }
                          }}
                          className="p-1.5 text-gantt-text-secondary hover:text-carmim-500 rounded-lg hover:bg-gantt-canvas transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
