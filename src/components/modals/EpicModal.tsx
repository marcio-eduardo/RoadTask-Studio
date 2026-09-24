import React, { useState, useEffect } from 'react';
import { useGantt } from '../../context/GanttContext';
import { Task, isEpic } from '../../types/gantt';
import { X, Layers, Trash2, Check, AlertTriangle } from 'lucide-react';

interface EpicModalProps {
  isOpen: boolean;
  onClose: () => void;
  epic?: Task | null; // null if creating a new epic
  onSuccess?: (epicId: string) => void;
}

const COLOR_PALETTE = [
  { label: 'Índigo', value: '#6366F1', border: 'border-indigo-500' },
  { label: 'Safira', value: '#0284C7', border: 'border-sky-500' },
  { label: 'Esmeralda', value: '#10B981', border: 'border-emerald-500' },
  { label: 'Âmbar', value: '#F59E0B', border: 'border-amber-500' },
  { label: 'Violeta', value: '#8B5CF6', border: 'border-purple-500' },
  { label: 'Carmim', value: '#EF4444', border: 'border-rose-500' },
  { label: 'Ciano', value: '#06B6D4', border: 'border-cyan-500' },
];

export const EpicModal: React.FC<EpicModalProps> = ({
  isOpen,
  onClose,
  epic = null,
  onSuccess,
}) => {
  const { project, addTask, updateTask, deleteEpic } = useGantt();

  const isEditing = !!epic;

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [color, setColor] = useState(COLOR_PALETTE[0].value);
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(20);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteChildren, setDeleteChildren] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmDelete(false);
      setDeleteChildren(false);
      if (epic) {
        const rawName = epic.name;
        const parts = rawName.split(':');
        setName(parts[0].trim());
        setSubtitle(parts.length > 1 ? parts.slice(1).join(':').trim() : (epic.notes || ''));
        setColor(epic.color || COLOR_PALETTE[0].value);
        setStartDate(epic.startDate);
        setDuration(epic.duration || 20);
      } else {
        const count = project.tasks.filter(t => t.type === 'epic' || t.type === 'phase').length + 1;
        setName(`Épico ${count}: `);
        setSubtitle('');
        setColor(COLOR_PALETTE[(count - 1) % COLOR_PALETTE.length].value);
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setDuration(20);
      }
    }
  }, [isOpen, epic, project.tasks]);

  const childStories = epic
    ? project.tasks.filter(
        t => (t.phaseId === epic.id || t.epicId === epic.id) && !isEpic(t) && t.type !== 'sprint'
      )
    : [];

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = subtitle.trim() ? `${name.trim()}: ${subtitle.trim()}` : name.trim();
    if (!finalName) return;

    if (isEditing && epic) {
      updateTask(epic.id, {
        name: finalName,
        color,
        startDate: startDate || epic.startDate,
        duration,
        notes: subtitle.trim() || undefined,
      });
      if (onSuccess) onSuccess(epic.id);
    } else {
      const newEpicId = `epic_${Date.now()}`;
      addTask(
        {
          id: newEpicId,
          name: finalName,
          type: 'epic',
          color,
          startDate: startDate || new Date().toISOString().split('T')[0],
          duration,
          progress: 0,
          notes: subtitle.trim() || undefined,
        },
        false // Do not auto-chain epic
      );
      if (onSuccess) onSuccess(newEpicId);
    }

    onClose();
  };

  return (
    <div id="modal-epic" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn select-none">
      <div className="bg-gantt-card border border-gantt-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gantt-border bg-gantt-header shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: color }}
            >
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gantt-primary">
                {isEditing ? 'Editar Épico' : 'Novo Épico (Swimlane)'}
              </h2>
              <p className="text-xs text-gantt-muted">
                Agrupador executivo de histórias e atividades na Linha do Tempo.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gantt-muted hover:text-gantt-primary rounded-lg hover:bg-gantt-canvas transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {/* Nome do Épico */}
          <div>
            <label className="block text-gantt-muted font-bold mb-1.5 uppercase tracking-wider text-[10px]">
              Nome do Épico *
            </label>
            <input
              id="input-epic-name"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Imersão & Fundação Técnica, Fase 1: Gestão de Frotas"
              className="w-full bg-gantt-canvas border border-gantt-border rounded-xl px-3.5 py-2 text-xs font-semibold text-gantt-primary focus:outline-none focus:border-safira-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Subtítulo / Descrição Curta */}
          <div>
            <label className="block text-gantt-muted font-bold mb-1.5 uppercase tracking-wider text-[10px]">
              Subtítulo / Objetivo (Opcional)
            </label>
            <input
              id="input-epic-subtitle"
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="Ex: Setup de infraestrutura e alinhamento com clientes"
              className="w-full bg-gantt-canvas border border-gantt-border rounded-xl px-3.5 py-2 text-xs text-gantt-primary focus:outline-none focus:border-safira-500 transition-colors"
            />
          </div>

          {/* Paleta de Cores Temática */}
          <div>
            <label className="block text-gantt-muted font-bold mb-1.5 uppercase tracking-wider text-[10px]">
              Cor do Épico (Tarja da Swimlane)
            </label>
            <div className="flex items-center gap-2 pt-1">
              {COLOR_PALETTE.map(cp => {
                const isSelected = color === cp.value;
                return (
                  <button
                    key={cp.value}
                    type="button"
                    onClick={() => setColor(cp.value)}
                    style={{ backgroundColor: cp.value }}
                    className={`w-7 h-7 rounded-xl transition-transform cursor-pointer flex items-center justify-center shadow-xs ${
                      isSelected ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-obsidian-900' : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    title={cp.label}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Datas / Duração */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-gantt-muted font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                Data de Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-gantt-canvas border border-gantt-border rounded-xl px-2.5 py-2 text-xs text-gantt-primary focus:outline-none focus:border-safira-500 tabular-nums"
              />
            </div>
            <div>
              <label className="block text-gantt-muted font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                Duração Estimada (Dias)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={duration}
                onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-gantt-canvas border border-gantt-border rounded-xl px-2.5 py-2 text-xs text-gantt-primary focus:outline-none focus:border-safira-500 tabular-nums"
              />
            </div>
          </div>

          {/* Dica */}
          <div className="p-3 rounded-xl bg-safira-500/5 border border-safira-500/20 text-slate-400 text-[11px] leading-relaxed">
            💡 <strong>Dica Scrum:</strong> Cada Épico criado se torna uma faixa horizontal (Swimlane) na lateral do Gantt. Você poderá adicionar Histórias diretamente dentro dele a qualquer momento.
          </div>

          {/* Actions / Inline Confirmation */}
          {confirmDelete ? (
            <div className="p-4 rounded-2xl bg-carmim-500/10 border border-carmim-500/30 text-carmim-200 animate-fadeIn space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-carmim-500/20 text-carmim-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-white">
                    Confirmar exclusão de "{name || epic?.name}"?
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {childStories.length > 0 ? (
                      <>
                        Este Épico possui <strong>{childStories.length} história(s)</strong> vinculada(s).
                      </>
                    ) : (
                      <>Este Épico não possui histórias e será removido definitivamente do cronograma.</>
                    )}
                  </p>
                </div>
              </div>

              {childStories.length > 0 && (
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-gantt-canvas/80 border border-gantt-border text-[11px] text-slate-300 cursor-pointer hover:bg-gantt-canvas transition-colors">
                  <input
                    id="checkbox-delete-children"
                    type="checkbox"
                    checked={deleteChildren}
                    onChange={e => setDeleteChildren(e.target.checked)}
                    className="w-4 h-4 rounded text-carmim-500 focus:ring-carmim-500 cursor-pointer accent-carmim-500"
                  />
                  <span>Excluir também as <strong>{childStories.length}</strong> histórias filhas</span>
                </label>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  id="btn-cancel-delete-epic"
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3.5 py-2 rounded-xl bg-gantt-canvas hover:bg-gantt-card text-gantt-muted hover:text-gantt-primary text-xs font-semibold transition-colors cursor-pointer"
                >
                  Não, Manter
                </button>
                <button
                  id="btn-confirm-delete-epic"
                  type="button"
                  onClick={() => {
                    if (!epic) return;
                    deleteEpic(epic.id, deleteChildren);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-carmim-600 hover:bg-carmim-500 text-white text-xs font-bold transition-all shadow-glow-carmim cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sim, Excluir Épico</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-3 border-t border-gantt-border">
              {isEditing ? (
                <button
                  id="btn-trigger-delete-epic"
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-carmim-500/10 hover:bg-carmim-600 text-carmim-400 hover:text-white border border-carmim-500/20 transition-all cursor-pointer font-bold text-xs"
                  title="Excluir este Épico"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Épico</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-gantt-canvas hover:bg-gantt-card text-gantt-muted hover:text-gantt-primary transition-colors cursor-pointer font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  id="btn-submit-epic"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-safira-600 hover:bg-safira-500 text-white font-bold transition-all cursor-pointer shadow-glow-safira text-xs"
                >
                  {isEditing ? 'Salvar Alterações' : 'Criar Épico'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
