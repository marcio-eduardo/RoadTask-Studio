import React, { useState, useEffect } from 'react';
import { useGantt } from '../../context/GanttContext';
import { Task, EntityType, DependencyType } from '../../types/gantt';
import {
  X,
  Trash2,
  Save,
  Link,
  Plus,
} from 'lucide-react';

interface TaskDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({ task, isOpen, onClose }) => {
  const { project, updateTask, deleteTask, addDependency, removeDependency } = useGantt();

  const [name, setName] = useState('');
  const [type, setType] = useState<EntityType>('story');
  const [phaseId, setPhaseId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(5);
  const [progress, setProgress] = useState(0);
  const [assignee, setAssignee] = useState('');
  const [notes, setNotes] = useState('');

  // Selected predecessor to add
  const [selectedPredId, setSelectedPredId] = useState('');
  const [depType, setDepType] = useState<DependencyType>('FS');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setType(task.type);
      setPhaseId(task.phaseId || '');
      setStartDate(task.startDate);
      setDuration(task.duration);
      setProgress(task.progress);
      setAssignee(task.assignee || '');
      setNotes(task.notes || '');
      setSelectedPredId('');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    updateTask(task.id, {
      name: name.trim() || task.name,
      type,
      phaseId: phaseId || undefined,
      startDate,
      duration: type === 'milestone' ? 0 : Math.max(0, duration),
      progress,
      assignee: assignee.trim() || undefined,
      notes: notes.trim() || undefined,
      isMilestone: type === 'milestone' || duration === 0,
    });
    onClose();
  };

  const handleAddDep = () => {
    if (!selectedPredId) return;
    addDependency(selectedPredId, task.id, depType);
    setSelectedPredId('');
  };

  const availablePhases = project.tasks.filter(t => t.type === 'phase' && t.id !== task.id);
  const candidatePredecessors = project.tasks.filter(
    t => t.id !== task.id && !task.dependencies.some(d => d.targetTaskId === t.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4 animate-fadeIn">
      <div className="bg-obsidian-900 border border-obsidian-750 w-full md:max-w-xl max-h-[90vh] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-obsidian-800 bg-obsidian-850">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white">
              Editar {task.type === 'milestone' ? 'Marco' : 'Tarefa'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Name */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Nome da Atividade
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-safira-500 font-semibold"
            />
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Tipo de Elemento
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['phase', 'sprint', 'story', 'milestone'] as EntityType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    if (t === 'milestone') setDuration(0);
                    else if (duration === 0) setDuration(5);
                  }}
                  className={`py-2 px-1 rounded-xl font-semibold text-center capitalize transition-all cursor-pointer ${
                    type === t
                      ? 'bg-safira-600 text-white shadow-glow-safira'
                      : 'bg-obsidian-800 text-slate-400 border border-obsidian-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Phase Grouping */}
          {type !== 'phase' && availablePhases.length > 0 && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Fase / Agrupador
              </label>
              <select
                value={phaseId}
                onChange={e => setPhaseId(e.target.value)}
                className="w-full bg-obsidian-800 border border-obsidian-700 text-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-safira-500"
              >
                <option value="">Nenhuma (Geral)</option>
                {availablePhases.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dates and Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Data de Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-obsidian-800 border border-obsidian-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-safira-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Duração (Dias Úteis)
              </label>
              <input
                type="number"
                min="0"
                max="365"
                disabled={type === 'milestone'}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full bg-obsidian-800 border border-obsidian-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-safira-500 tabular-nums disabled:opacity-50"
              />
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Progresso Concluído
              </label>
              <span className="font-bold text-esmeralda-400 tabular-nums">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              className="w-full accent-safira-500 bg-obsidian-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Responsável / Time
            </label>
            <input
              type="text"
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
              placeholder="Ex: Engenheiro de Soluções, Diretoria"
              className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-safira-500"
            />
          </div>

          {/* Dependencies Manager */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Dependências (Antecessoras)
            </label>

            {/* List current deps */}
            {task.dependencies.length > 0 ? (
              <div className="space-y-1.5 mb-2.5">
                {task.dependencies.map(dep => {
                  const pred = project.tasks.find(t => t.id === dep.targetTaskId);
                  return (
                    <div
                      key={dep.id}
                      className="flex items-center justify-between bg-obsidian-850 border border-obsidian-800 px-3 py-2 rounded-xl"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Link className="w-3.5 h-3.5 text-safira-400 shrink-0" />
                        <span className="font-semibold text-slate-200 truncate">
                          {pred ? pred.name : 'Tarefa anterior'}
                        </span>
                        <span className="text-[10px] bg-obsidian-750 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                          {dep.type}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDependency(task.id, dep.targetTaskId)}
                        className="text-slate-400 hover:text-carmim-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-[11px] mb-2">Nenhuma dependência configurada.</p>
            )}

            {/* Add new dependency */}
            {candidatePredecessors.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedPredId}
                  onChange={e => setSelectedPredId(e.target.value)}
                  className="flex-1 bg-obsidian-800 border border-obsidian-700 text-slate-300 rounded-xl px-2.5 py-2 text-xs"
                >
                  <option value="">Selecione para ligar...</option>
                  {candidatePredecessors.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={depType}
                  onChange={e => setDepType(e.target.value as DependencyType)}
                  className="w-20 bg-obsidian-800 border border-obsidian-700 text-slate-300 rounded-xl px-2 py-2 text-xs"
                >
                  <option value="FS">FS (T-I)</option>
                  <option value="SS">SS (I-I)</option>
                  <option value="FF">FF (T-T)</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddDep}
                  disabled={!selectedPredId}
                  className="bg-safira-600 disabled:opacity-40 text-white p-2 rounded-xl font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-obsidian-800 bg-obsidian-850">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Excluir permanentemente "${task.name}"?`)) {
                deleteTask(task.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-carmim-400 hover:text-carmim-300 font-semibold px-3 py-2 rounded-xl hover:bg-carmim-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white font-medium rounded-xl hover:bg-obsidian-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-safira-600 hover:bg-safira-500 text-white font-bold px-5 py-2 rounded-xl shadow-glow-safira transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
