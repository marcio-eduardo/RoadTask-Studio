import React from 'react';
import { useGantt } from '../../context/GanttContext';
import { Task } from '../../types/gantt';
import { formatBrDate } from '../../engine/calendar';
import {
  Diamond,
  Flame,
  Trash2,
  Edit2,
} from 'lucide-react';

interface TaskTableViewProps {
  onEditTask: (task: Task) => void;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({ onEditTask }) => {
  const { project, selectedTaskId, setSelectedTaskId, deleteTask, updateTaskProgress } = useGantt();

  return (
    <div className="flex-1 overflow-auto bg-obsidian-950 p-3 sm:p-5">
      <div className="max-w-7xl mx-auto bg-obsidian-900 border border-obsidian-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-obsidian-850 border-b border-obsidian-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-obsidian-800/80 text-slate-300">
              {project.tasks.map((task, idx) => {
                const isSelected = selectedTaskId === task.id;
                const isMilestone = task.isMilestone || task.type === 'milestone';
                const isChild = !!task.phaseId;

                return (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`hover:bg-obsidian-800/50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-safira-500/10' : ''
                    } ${task.isCritical ? 'bg-carmim-500/5' : ''}`}
                  >
                    {/* Index */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {idx + 1}
                    </td>

                    {/* Task Name with indentation */}
                    <td className="py-3 px-4">
                      <div className={`flex items-center gap-2 ${isChild ? 'pl-5' : ''}`}>
                        {isMilestone ? (
                          <Diamond className="w-3.5 h-3.5 text-ouro-400 shrink-0" />
                        ) : task.isCritical ? (
                          <Flame className="w-3.5 h-3.5 text-carmim-400 shrink-0" />
                        ) : (
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: task.color || '#0284C7' }}
                          />
                        )}
                        <span
                          className={`font-semibold text-slate-100 ${
                            task.type === 'phase' ? 'text-sm font-bold text-safira-300' : ''
                          }`}
                        >
                          {task.name}
                        </span>
                      </div>
                    </td>

                    {/* Entity Type */}
                    <td className="py-3 px-3">
                      <span className="text-[10px] uppercase font-bold bg-obsidian-800 px-2 py-0.5 rounded border border-obsidian-750 text-slate-400">
                        {task.type}
                      </span>
                    </td>

                    {/* Start Date */}
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-300">
                      {formatBrDate(task.startDate)}
                    </td>

                    {/* End Date */}
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-300">
                      {formatBrDate(task.endDate)}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 font-semibold tabular-nums text-slate-200">
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
                          className="w-20 accent-safira-500 bg-obsidian-800 h-1.5 rounded cursor-pointer"
                        />
                        <span className="font-bold tabular-nums text-[11px] text-slate-400 w-8">
                          {task.progress}%
                        </span>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-3 text-slate-400 truncate max-w-[120px]">
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
                          className="p-1.5 text-slate-400 hover:text-safira-400 rounded-lg hover:bg-obsidian-750 transition-colors"
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
                          className="p-1.5 text-slate-400 hover:text-carmim-400 rounded-lg hover:bg-obsidian-750 transition-colors"
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
