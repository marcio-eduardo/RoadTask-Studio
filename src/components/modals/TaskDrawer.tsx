import React, { useState, useEffect } from 'react';
import { useGantt } from '../../context/GanttContext';
import {
  Task,
  EntityType,
  TaskStatus,
  TaskHealth,
  TaskUpdateItem,
  SubTask,
  getTaskSubtasks,
} from '../../types/gantt';
import {
  X,
  Trash2,
  Save,
  Plus,
  Clock,
  CheckSquare,
  Square,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';

interface TaskDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({ task, isOpen, onClose }) => {
  const { project, updateTask, deleteTask } = useGantt();

  // Core task fields
  const [name, setName] = useState('');
  const [type, setType] = useState<EntityType>('story');
  const [phaseId, setPhaseId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(5);
  const [progress, setProgress] = useState(0);
  const [assignee, setAssignee] = useState('');
  const [notes, setNotes] = useState('');

  // Status & RAG
  const [status, setStatus] = useState<TaskStatus>('in_progress');
  const [health, setHealth] = useState<TaskHealth>('on_track');

  // Interactive Tasks list (SubTasks of the Story)
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskText, setEditingSubtaskText] = useState('');

  // Updates & Diário de Bordo (Minimizado por padrão conforme Layout03)
  const [isUpdatesExpanded, setIsUpdatesExpanded] = useState(false);
  const [updates, setUpdates] = useState<TaskUpdateItem[]>([]);
  const [newUpdateText, setNewUpdateText] = useState('');

  // Quick Action Chips to register updates with 1 touch
  const quickUpdatePresets = [
    'Alinhado em reunião com stakeholders',
    'Criado API para consumo de dados',
    'Homologação técnica concluída',
    'Módulo entregue em ambiente de testes',
    'Aguardando validação do cliente',
  ];

  useEffect(() => {
    if (task) {
      setName(task.name);
      setType(task.type);
      setPhaseId(task.phaseId || task.epicId || '');
      setStartDate(task.startDate);
      setDuration(task.duration);
      setProgress(task.progress);
      setAssignee(task.assignee || '');
      setNotes(task.notes || '');

      setStatus(task.status || (task.progress === 100 ? 'completed' : task.progress > 0 ? 'in_progress' : 'not_started'));
      setHealth(task.health || 'on_track');

      // Load subtasks with backward compatibility for legacy checklist
      const loadedSubtasks = getTaskSubtasks(task);
      setSubtasks(loadedSubtasks);

      setUpdates(task.updates ? [...task.updates] : []);
      setNewUpdateText('');
      setNewSubtaskName('');
      setEditingSubtaskId(null);
      setIsUpdatesExpanded(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  // Available epics
  const availableEpics = project.tasks.filter(
    t => (t.type === 'epic' || t.type === 'phase') && t.id !== task.id
  );

  // Recalculate progress whenever subtasks change
  const syncProgressFromSubtasks = (updatedSubtasks: SubTask[]) => {
    if (updatedSubtasks.length === 0) return;
    const completedCount = updatedSubtasks.filter(t => t.completed).length;
    const computedProgress = Math.round((completedCount / updatedSubtasks.length) * 100);
    setProgress(computedProgress);
    if (computedProgress === 100 && status !== 'completed') {
      setStatus('completed');
    } else if (computedProgress < 100 && status === 'completed') {
      setStatus('in_progress');
    }
  };

  // --- SubTask Actions ---
  const handleAddSubtask = () => {
    const text = newSubtaskName.trim();
    if (!text) return;

    const newItem: SubTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: text,
      completed: false,
      status: 'todo',
    };

    const updated = [...subtasks, newItem];
    setSubtasks(updated);
    setNewSubtaskName('');
    syncProgressFromSubtasks(updated);
  };

  const handleToggleSubtask = (id: string) => {
    const updated = subtasks.map(item => {
      if (item.id === id) {
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          status: nextCompleted ? ('done' as const) : ('todo' as const),
        };
      }
      return item;
    });
    setSubtasks(updated);
    syncProgressFromSubtasks(updated);
  };

  const handlePostponeSubtask = (id: string, days = 1) => {
    const updated = subtasks.map(item => {
      if (item.id === id) {
        const nextCount = (item.postponedCount || 0) + days;
        return {
          ...item,
          postponedCount: nextCount,
          status: item.completed ? ('done' as const) : ('in_progress' as const),
        };
      }
      return item;
    });
    setSubtasks(updated);
  };

  const handleRemoveSubtask = (id: string) => {
    const updated = subtasks.filter(item => item.id !== id);
    setSubtasks(updated);
    syncProgressFromSubtasks(updated);
  };

  const handleStartEditSubtask = (item: SubTask) => {
    setEditingSubtaskId(item.id);
    setEditingSubtaskText(item.name);
  };

  const handleSaveEditSubtask = (id: string) => {
    if (!editingSubtaskText.trim()) return;
    setSubtasks(prev =>
      prev.map(item => (item.id === id ? { ...item, name: editingSubtaskText.trim() } : item))
    );
    setEditingSubtaskId(null);
  };

  // --- Updates / Apontamentos Actions ---
  const handleAddUpdate = (textToAdd?: string) => {
    const text = (textToAdd || newUpdateText).trim();
    if (!text) return;

    const newEntry: TaskUpdateItem = {
      id: `upd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      text,
      author: assignee.trim() || undefined,
      category:
        text.toLowerCase().includes('reuni') || text.toLowerCase().includes('alinha')
          ? 'meeting'
          : text.toLowerCase().includes('api') || text.toLowerCase().includes('desenvolv') || text.toLowerCase().includes('cria')
            ? 'technical'
            : text.toLowerCase().includes('bloque') || text.toLowerCase().includes('trav') || text.toLowerCase().includes('impid')
              ? 'blocker'
              : text.toLowerCase().includes('conclu') || text.toLowerCase().includes('entreg')
                ? 'delivery'
                : 'general',
    };

    setUpdates(prev => [newEntry, ...prev]);
    setNewUpdateText('');
  };

  const handleRemoveUpdate = (id: string) => {
    setUpdates(prev => prev.filter(u => u.id !== id));
  };

  // Save changes back to Project Context
  const handleSave = () => {
    const latestNote = updates.length > 0 ? updates[0].text : notes;

    updateTask(task.id, {
      name: name.trim() || task.name,
      type,
      phaseId: phaseId || undefined,
      epicId: phaseId || undefined,
      startDate,
      duration: type === 'milestone' ? 0 : Math.max(0, duration),
      progress,
      assignee: assignee.trim() || undefined,
      notes: notes.trim() || undefined,
      isMilestone: type === 'milestone' || duration === 0,
      status,
      health,
      subtasks,
      // Also map to checklist for 100% backward compatibility
      checklist: subtasks.map(s => ({
        id: s.id,
        text: s.name,
        completed: s.completed,
      })),
      updates,
      lastUpdateNote: latestNote,
    });
    onClose();
  };

  const formatUpdateDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const completedSubtasksCount = subtasks.filter(t => t.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/75 backdrop-blur-sm p-0 md:p-4 animate-fadeIn select-none">
      <div className="bg-gantt-card border border-gantt-border w-full md:max-w-2xl max-h-[94vh] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden transition-colors duration-200">
        {/* ========================================================================= */}
        {/* 1. HEADER DO MODAL (Sem abas burocráticas conforme Layout03)               */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gantt-border bg-gantt-header transition-colors shrink-0">
          <div className="flex-1 mr-3 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-safira-500/15 text-safira-400 border border-safira-500/30">
                {type === 'story' ? 'História de Usuário' : type === 'sprint' ? 'Sprint' : type === 'epic' ? 'Épico' : 'Marco'}
              </span>
              <span className="text-[10.5px] font-bold font-mono px-2 py-0.5 rounded-full bg-esmeralda-500/15 text-esmeralda-400 border border-esmeralda-500/30">
                {progress}% concluído
              </span>
            </div>
            {/* Input de Nome da Atividade direto no Header */}
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome da História / Atividade..."
              className="w-full bg-transparent text-base font-extrabold text-gantt-primary focus:outline-none focus:bg-gantt-canvas/60 px-1 py-0.5 rounded-lg border border-transparent focus:border-safira-500/50 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gantt-muted hover:text-gantt-primary rounded-xl hover:bg-gantt-canvas transition-colors shrink-0"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. CORPO PRINCIPAL UNIFICADO                                              */}
        {/* ========================================================================= */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4 text-xs flex-1 scrollbar-thin scrollbar-thumb-gantt-border scrollbar-track-gantt-canvas">
          {/* A. Status & Semáforo RAG Compactos (Conforme Layout03) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gantt-canvas/50 p-3.5 rounded-2xl border border-gantt-border">
            {/* Situação da Atividade */}
            <div>
              <label className="block text-gantt-muted font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                Situação da História
              </label>
              <select
                value={status}
                onChange={e => {
                  const newStatus = e.target.value as TaskStatus;
                  setStatus(newStatus);
                  if (newStatus === 'completed' && progress < 100) setProgress(100);
                }}
                className="w-full bg-gantt-card border border-gantt-border rounded-xl px-3 py-2 text-xs font-semibold text-gantt-primary focus:outline-none focus:border-safira-500 transition-colors"
              >
                <option value="not_started">⚪ Não Iniciada</option>
                <option value="in_progress">🔵 Em Andamento</option>
                <option value="in_review">🟣 Em Revisão</option>
                <option value="completed">🟢 Concluída</option>
                <option value="blocked">🔴 Bloqueada</option>
                <option value="paused">🟡 Pausada</option>
              </select>
            </div>

            {/* Semáforo RAG */}
            <div>
              <label className="block text-gantt-muted font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                Semáforo RAG (Saúde / Risco)
              </label>
              <select
                value={health}
                onChange={e => setHealth(e.target.value as TaskHealth)}
                className="w-full bg-gantt-card border border-gantt-border rounded-xl px-3 py-2 text-xs font-semibold text-gantt-primary focus:outline-none focus:border-safira-500 transition-colors"
              >
                <option value="on_track">🟢 No Prazo (On Track)</option>
                <option value="at_risk">🟡 Em Risco (At Risk)</option>
                <option value="delayed">🔴 Atrasada (Delayed)</option>
                <option value="blocked">⛔ Impedimento / Travada</option>
              </select>
            </div>
          </div>

          {/* B. Informações Operacionais da História (Data, Duração, Responsável, Épico) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gantt-canvas/30 p-3 rounded-2xl border border-gantt-border/70">
            <div>
              <label className="text-[10px] font-bold text-gantt-muted uppercase tracking-wider block mb-1">
                Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-gantt-card border border-gantt-border rounded-xl px-2 py-1.5 text-xs text-gantt-primary focus:outline-none focus:border-safira-500 tabular-nums"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gantt-muted uppercase tracking-wider block mb-1">
                Duração (Dias)
              </label>
              <input
                type="number"
                min="0"
                max="365"
                disabled={type === 'milestone'}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full bg-gantt-card border border-gantt-border rounded-xl px-2 py-1.5 text-xs text-gantt-primary focus:outline-none focus:border-safira-500 tabular-nums disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gantt-muted uppercase tracking-wider block mb-1">
                Responsável
              </label>
              <input
                type="text"
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                placeholder="Ex: Squad Mobile"
                className="w-full bg-gantt-card border border-gantt-border rounded-xl px-2.5 py-1.5 text-xs text-gantt-primary focus:outline-none focus:border-safira-500 truncate"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gantt-muted uppercase tracking-wider block mb-1">
                Épico Agrupador
              </label>
              <select
                value={phaseId}
                onChange={e => setPhaseId(e.target.value)}
                className="w-full bg-gantt-card border border-gantt-border rounded-xl px-2 py-1.5 text-xs text-gantt-primary focus:outline-none focus:border-safira-500 truncate"
              >
                <option value="">Nenhum Épico</option>
                {availableEpics.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* C. LISTA DE TAREFAS DA HISTÓRIA (TASKS - Conforme Layout03)               */}
          {/* ========================================================================= */}
          <div className="bg-gantt-card border border-gantt-border rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-safira-500/15 text-safira-400">
                  <CheckSquare className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-gantt-primary">
                    Tarefas Técnicas da História (Tasks)
                  </h3>
                  <span className="text-[11px] text-gantt-muted">
                    {completedSubtasksCount} de {subtasks.length} concluídas (
                    {subtasks.length > 0
                      ? `${Math.round((completedSubtasksCount / subtasks.length) * 100)}%`
                      : '0%'}
                    )
                  </span>
                </div>
              </div>

              {/* Barra de Progresso Compacta */}
              {subtasks.length > 0 && (
                <div className="w-24 bg-gantt-canvas h-2 rounded-full overflow-hidden border border-gantt-border">
                  <div
                    style={{
                      width: `${(completedSubtasksCount / subtasks.length) * 100}%`,
                    }}
                    className="h-full bg-esmeralda-500 transition-all duration-300"
                  />
                </div>
              )}
            </div>

            {/* Input Inline para Criar Nova Tarefa */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskName}
                onChange={e => setNewSubtaskName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="+ Adicionar tarefa técnica (ex: Criar rota API, Ajustar tela, Testes unitários)..."
                className="flex-1 bg-gantt-canvas border border-gantt-border rounded-xl px-3.5 py-2 text-xs text-gantt-primary placeholder:text-gantt-muted/70 focus:outline-none focus:border-safira-500 font-medium transition-colors"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                disabled={!newSubtaskName.trim()}
                className="flex items-center gap-1 bg-safira-600 hover:bg-safira-500 disabled:opacity-40 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            </div>

            {/* Lista de Tasks Interativas */}
            {subtasks.length > 0 ? (
              <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
                {subtasks.map(item => {
                  const isEditing = editingSubtaskId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        item.completed
                          ? 'bg-gantt-canvas/40 border-gantt-border/60 opacity-80'
                          : 'bg-gantt-canvas border-gantt-border hover:border-safira-500/40'
                      }`}
                    >
                      {/* Checkbox e Nome da Tarefa */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSubtask(item.id)}
                          className="text-safira-400 hover:scale-110 transition-transform cursor-pointer shrink-0"
                          title={item.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
                        >
                          {item.completed ? (
                            <CheckSquare className="w-4 h-4 text-esmeralda-400" />
                          ) : (
                            <Square className="w-4 h-4 text-gantt-muted" />
                          )}
                        </button>

                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <input
                              type="text"
                              value={editingSubtaskText}
                              onChange={e => setEditingSubtaskText(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveEditSubtask(item.id);
                                if (e.key === 'Escape') setEditingSubtaskId(null);
                              }}
                              autoFocus
                              className="flex-1 bg-gantt-card border border-safira-500 rounded-lg px-2 py-1 text-xs text-gantt-primary focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditSubtask(item.id)}
                              className="p-1 text-esmeralda-400 hover:bg-esmeralda-500/10 rounded-lg"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={() => handleStartEditSubtask(item)}
                            title="Clique para editar o texto da tarefa"
                            className={`text-xs truncate cursor-pointer hover:text-safira-400 transition-colors ${
                              item.completed
                                ? 'line-through text-gantt-muted'
                                : 'text-gantt-primary font-medium'
                            }`}
                          >
                            {item.name}
                          </span>
                        )}

                        {/* Tag de adiamento */}
                        {item.postponedCount && item.postponedCount > 0 && (
                          <span className="text-[10px] bg-ouro-500/15 text-ouro-400 px-1.5 py-0.2 rounded-md font-mono border border-ouro-500/30 shrink-0">
                            +{item.postponedCount}d
                          </span>
                        )}
                      </div>

                      {/* Botões Rápidos de Ação da Tarefa (Concluir, Adiar, Excluir) */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Botão Concluir / Reabrir */}
                        <button
                          type="button"
                          onClick={() => handleToggleSubtask(item.id)}
                          className={`text-[10.5px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer border ${
                            item.completed
                              ? 'bg-gantt-card text-gantt-muted border-gantt-border hover:text-gantt-primary'
                              : 'bg-esmeralda-500/10 text-esmeralda-400 border-esmeralda-500/30 hover:bg-esmeralda-500/20'
                          }`}
                          title={item.completed ? 'Reabrir tarefa' : 'Concluir tarefa'}
                        >
                          {item.completed ? 'Reabrir' : 'Concluir'}
                        </button>

                        {/* Botão Adiar (+1 dia / +2 dias) */}
                        <button
                          type="button"
                          onClick={() => handlePostponeSubtask(item.id, 1)}
                          className="text-[10.5px] font-bold px-2 py-1 rounded-lg bg-ouro-500/10 text-ouro-400 border border-ouro-500/30 hover:bg-ouro-500/20 transition-colors cursor-pointer"
                          title="Adiar prazo da tarefa em +1 dia"
                        >
                          Adiar
                        </button>

                        {/* Excluir Tarefa */}
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(item.id)}
                          className="text-gantt-muted hover:text-carmim-400 p-1 rounded-lg hover:bg-carmim-500/10 transition-colors"
                          title="Excluir tarefa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center bg-gantt-canvas/30 border border-dashed border-gantt-border rounded-xl">
                <p className="text-gantt-muted text-xs">
                  Nenhuma tarefa técnica cadastrada para esta história.
                </p>
                <p className="text-[11px] text-gantt-muted/70 mt-0.5">
                  Decomponha a entrega em tarefas técnicas usando o campo acima.
                </p>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* D. SEÇÃO MINIMIZADA: REGISTRAR ATUALIZAÇÃO & ATALHOS (Layout03)           */}
          {/* ========================================================================= */}
          <div className="border border-gantt-border rounded-2xl bg-gantt-card/70 overflow-hidden transition-colors">
            {/* Botão de Toggle da Seção Minimizada */}
            <button
              type="button"
              onClick={() => setIsUpdatesExpanded(v => !v)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-gantt-canvas/60 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-safira-400" />
                <span className="font-bold text-xs text-gantt-primary">
                  Registrar Apontamento / Atalhos Rápidos
                </span>
                {updates.length > 0 && (
                  <span className="text-[10px] bg-safira-500/20 text-safira-300 font-mono px-2 py-0.5 rounded-full font-bold">
                    {updates.length} {updates.length === 1 ? 'registro' : 'registros'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-gantt-muted text-xs font-semibold">
                <span>{isUpdatesExpanded ? 'Recolher' : 'Expandir'}</span>
                {isUpdatesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {/* Conteúdo Expansível: Input, Atalhos Rápidos e Histórico */}
            {isUpdatesExpanded && (
              <div className="p-4 border-t border-gantt-border bg-gantt-canvas/30 space-y-3 animate-fadeIn">
                {/* Campo de Registro */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUpdateText}
                    onChange={e => setNewUpdateText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddUpdate();
                      }
                    }}
                    placeholder="Ex: Alinhado reunião com cliente, ou Criado API para consumo de dados..."
                    className="flex-1 bg-gantt-canvas border border-gantt-border rounded-xl px-3.5 py-2 text-xs text-gantt-primary placeholder:text-gantt-muted/70 focus:outline-none focus:border-safira-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddUpdate()}
                    disabled={!newUpdateText.trim()}
                    className="flex items-center gap-1.5 bg-safira-600 hover:bg-safira-500 disabled:opacity-40 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar</span>
                  </button>
                </div>

                {/* Chips de Atalhos Rápidos (1 Toque) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-bold text-gantt-muted uppercase tracking-wider mr-1">
                    Atalhos:
                  </span>
                  {quickUpdatePresets.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleAddUpdate(preset)}
                      className="text-[11px] font-medium bg-gantt-card hover:bg-safira-500/10 hover:text-safira-400 text-gantt-muted border border-gantt-border rounded-lg px-2.5 py-1 transition-colors cursor-pointer truncate max-w-[280px]"
                      title={`Clique para registrar: "${preset}"`}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {/* Histórico Cronológico */}
                {updates.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gantt-border">
                    <span className="text-[10px] font-bold text-gantt-muted uppercase tracking-wider block">
                      Histórico Recente ({updates.length})
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {updates.map(item => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-2 p-2 rounded-xl bg-gantt-canvas/60 border border-gantt-border text-xs"
                        >
                          <div className="flex-1 space-y-0.5 min-w-0">
                            <span className="text-[10px] font-bold text-safira-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatUpdateDate(item.timestamp)}
                            </span>
                            <p className="text-gantt-primary font-medium">{item.text}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveUpdate(item.id)}
                            className="text-gantt-muted hover:text-carmim-400 p-1"
                            title="Remover apontamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. RODAPÉ DE AÇÕES                                                        */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gantt-border bg-gantt-header transition-colors shrink-0">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Excluir permanentemente "${task.name}"?`)) {
                deleteTask(task.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-carmim-400 hover:text-carmim-300 font-semibold px-3 py-2 rounded-xl hover:bg-carmim-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gantt-muted hover:text-gantt-primary font-medium rounded-xl hover:bg-gantt-canvas transition-colors cursor-pointer"
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
