import React, { useState, useEffect } from 'react';
import { useGantt } from '../../context/GanttContext';
import {
  Task,
  EntityType,
  DependencyType,
  TaskStatus,
  TaskHealth,
  TaskUpdateItem,
  TaskChecklistItem,
} from '../../types/gantt';
import {
  X,
  Trash2,
  Save,
  Link,
  Plus,
  MessageSquarePlus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
} from 'lucide-react';

interface TaskDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({ task, isOpen, onClose }) => {
  const { project, updateTask, deleteTask, addDependency, removeDependency } = useGantt();

  // Active tab inside the modal
  const [activeTab, setActiveTab] = useState<'updates' | 'details'>('updates');

  // Core task state
  const [name, setName] = useState('');
  const [type, setType] = useState<EntityType>('story');
  const [phaseId, setPhaseId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(5);
  const [progress, setProgress] = useState(0);
  const [assignee, setAssignee] = useState('');
  const [notes, setNotes] = useState('');

  // Status & Updates state
  const [status, setStatus] = useState<TaskStatus>('in_progress');
  const [health, setHealth] = useState<TaskHealth>('on_track');
  const [updates, setUpdates] = useState<TaskUpdateItem[]>([]);
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>([]);
  const [actualStartDate, setActualStartDate] = useState('');
  const [actualEndDate, setActualEndDate] = useState('');

  // Input state for new update
  const [newUpdateText, setNewUpdateText] = useState('');
  // Input state for new checklist item
  const [newChecklistText, setNewChecklistText] = useState('');

  // Predecessor state
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

      // Status & Updates
      setStatus(task.status || (task.progress === 100 ? 'completed' : task.progress > 0 ? 'in_progress' : 'not_started'));
      setHealth(task.health || 'on_track');
      setUpdates(task.updates ? [...task.updates] : []);
      setChecklist(task.checklist ? [...task.checklist] : []);
      setActualStartDate(task.actualStartDate || '');
      setActualEndDate(task.actualEndDate || '');

      setNewUpdateText('');
      setNewChecklistText('');
      setSelectedPredId('');
      setActiveTab('updates');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  // Add new update entry to the activity log
  const handleAddUpdate = (textToAdd?: string) => {
    const text = (textToAdd || newUpdateText).trim();
    if (!text) return;

    const newEntry: TaskUpdateItem = {
      id: `upd_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
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

  // Remove update entry
  const handleRemoveUpdate = (id: string) => {
    setUpdates(prev => prev.filter(u => u.id !== id));
  };

  // Add checklist item
  const handleAddChecklistItem = () => {
    const text = newChecklistText.trim();
    if (!text) return;

    const newItem: TaskChecklistItem = {
      id: `chk_${Date.now()}`,
      text,
      completed: false,
    };

    setChecklist(prev => [...prev, newItem]);
    setNewChecklistText('');
  };

  // Toggle checklist item
  const handleToggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Remove checklist item
  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

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
      updates,
      checklist,
      actualStartDate: actualStartDate || undefined,
      actualEndDate: actualEndDate || undefined,
      lastUpdateNote: latestNote,
    });
    onClose();
  };

  const handleAddDep = () => {
    if (!selectedPredId) return;
    addDependency(selectedPredId, task.id, depType);
    setSelectedPredId('');
  };

  const availableEpics = project.tasks.filter(
    t => (t.type === 'epic' || t.type === 'phase') && t.id !== task.id
  );
  const candidatePredecessors = project.tasks.filter(
    t => t.id !== task.id && !task.dependencies.some(d => d.targetTaskId === t.id)
  );

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

  // Quick Action Chips to feed activity updates with 1 touch
  const quickUpdatePresets = [
    'Alinhado em reunião com stakeholders',
    'Criado API para consumo de dados',
    'Homologação técnica concluída',
    'Módulo entregue em ambiente de testes',
    'Aguardando validação do cliente',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/75 backdrop-blur-sm p-0 md:p-4 animate-fadeIn select-none">
      <div className="bg-gantt-card border border-gantt-border w-full md:max-w-2xl max-h-[92vh] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden transition-colors duration-200">
        {/* Header Executivo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gantt-border bg-gantt-header transition-colors">
          <div className="flex items-center gap-3 truncate mr-2">
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-gantt-primary truncate">
                  {name || 'Atividade'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-safira-500/15 text-safira-400 border border-safira-500/30">
                  {type}
                </span>
              </div>
              <span className="text-[11px] text-gantt-muted truncate">
                Atualização e acompanhamento operacional da atividade
              </span>
            </div>
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-gantt-border bg-gantt-canvas/60 px-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('updates')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'updates'
                ? 'border-safira-500 text-safira-400'
                : 'border-transparent text-gantt-muted hover:text-gantt-primary'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Atualizações da Atividade</span>
            {updates.length > 0 && (
              <span className="text-[10px] bg-safira-500/20 text-safira-300 font-mono px-1.5 py-0.2 rounded-full font-bold">
                {updates.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'border-safira-500 text-safira-400'
                : 'border-transparent text-gantt-muted hover:text-gantt-primary'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Prazos & Detalhes</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1 scrollbar-thin scrollbar-thumb-gantt-border scrollbar-track-gantt-canvas">
          {/* ========================================================================= */}
          {/* TAB 1: ATUALIZAÇÕES & DIÁRIO DE BORDO DA ATIVIDADE                       */}
          {/* ========================================================================= */}
          {activeTab === 'updates' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Status Operacional & Semáforo RAG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gantt-canvas/40 p-4 rounded-2xl border border-gantt-border/70">
                {/* Status */}
                <div>
                  <label className="block text-gantt-muted font-bold mb-2 uppercase tracking-wider text-[10px]">
                    Situação da Atividade
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'not_started', label: 'Não Iniciada', color: 'text-slate-400' },
                      { id: 'in_progress', label: 'Em Andamento', color: 'text-safira-400' },
                      { id: 'in_review', label: 'Em Revisão', color: 'text-purple-400' },
                      { id: 'completed', label: 'Concluída', color: 'text-esmeralda-400' },
                      { id: 'blocked', label: 'Bloqueada', color: 'text-carmim-400' },
                      { id: 'paused', label: 'Pausada', color: 'text-ouro-400' },
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setStatus(st.id as TaskStatus);
                          if (st.id === 'completed' && progress < 100) setProgress(100);
                        }}
                        className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold text-center transition-all cursor-pointer truncate ${
                          status === st.id
                            ? 'bg-safira-600 text-white shadow-xs'
                            : 'bg-gantt-card text-gantt-muted hover:text-gantt-primary border border-gantt-border'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Semáforo RAG de Saúde */}
                <div>
                  <label className="block text-gantt-muted font-bold mb-2 uppercase tracking-wider text-[10px]">
                    Saúde / Semáforo de Risco (RAG)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'on_track', label: 'No Prazo', icon: CheckCircle2, color: 'text-esmeralda-400 bg-esmeralda-500/10 border-esmeralda-500/30' },
                      { id: 'at_risk', label: 'Em Risco', icon: AlertTriangle, color: 'text-ouro-400 bg-ouro-500/10 border-ouro-500/30' },
                      { id: 'delayed', label: 'Atrasada', icon: Clock, color: 'text-carmim-400 bg-carmim-500/10 border-carmim-500/30' },
                      { id: 'blocked', label: 'Bloqueada', icon: Ban, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
                    ].map(h => {
                      const IconComp = h.icon;
                      const isSelected = health === h.id;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => setHealth(h.id as TaskHealth)}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'ring-2 ring-safira-400 bg-safira-600 text-white border-transparent shadow-xs'
                              : 'bg-gantt-card text-gantt-muted hover:text-gantt-primary border-gantt-border'
                          }`}
                        >
                          <IconComp className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{h.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Registro de Nova Atualização */}
              <div className="space-y-2.5">
                <label className="flex items-center justify-between text-gantt-muted font-bold uppercase tracking-wider text-[10px]">
                  <span>Registrar Atualização da Atividade</span>
                  <span className="text-[10px] text-safira-400 lowercase font-normal">
                    pressione enter ou clique no botão
                  </span>
                </label>

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
                    className="flex-1 bg-gantt-canvas border border-gantt-border rounded-xl px-3.5 py-2.5 text-xs text-gantt-primary placeholder:text-gantt-muted/70 focus:outline-none focus:border-safira-500 font-medium transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddUpdate()}
                    disabled={!newUpdateText.trim()}
                    className="flex items-center gap-1.5 bg-safira-600 hover:bg-safira-500 disabled:opacity-40 text-white font-bold px-4 py-2.5 rounded-xl shadow-glow-safira transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar</span>
                  </button>
                </div>

                {/* Chips de Atalhos Rápidos (1 Toque no Tablet) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-gantt-muted uppercase tracking-wider mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-safira-400" />
                    Atalhos:
                  </span>
                  {quickUpdatePresets.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleAddUpdate(preset)}
                      className="text-[11px] font-medium bg-gantt-canvas hover:bg-safira-500/10 hover:text-safira-400 text-gantt-muted border border-gantt-border rounded-lg px-2.5 py-1 transition-colors cursor-pointer truncate max-w-[280px]"
                      title={`Clique para registrar: "${preset}"`}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Cronológico de Ocorrências / Atualizações */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gantt-muted uppercase tracking-wider">
                    Histórico de Atualizações da Atividade ({updates.length})
                  </span>
                </div>

                {updates.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {updates.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-start justify-between gap-3 p-3 bg-gantt-canvas/60 border border-gantt-border rounded-xl group hover:border-gantt-border-strong transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-safira-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatUpdateDate(item.timestamp)}
                            </span>
                            {item.author && (
                              <span className="text-[10px] bg-gantt-canvas px-1.5 py-0.5 rounded text-gantt-muted font-medium border border-gantt-border">
                                {item.author}
                              </span>
                            )}
                            {idx === 0 && (
                              <span className="text-[9.5px] bg-esmeralda-500/15 text-esmeralda-400 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                                Atual
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gantt-primary font-medium leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveUpdate(item.id)}
                          className="text-gantt-muted hover:text-carmim-400 p-1 opacity-60 hover:opacity-100 transition-opacity"
                          title="Remover apontamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-center bg-gantt-canvas/30 border border-dashed border-gantt-border rounded-2xl">
                    <p className="text-gantt-muted text-xs">
                      Nenhuma atualização registrada ainda para esta atividade.
                    </p>
                    <p className="text-[11px] text-gantt-muted/70 mt-0.5">
                      Use os atalhos ou campo acima para alimentar alinhamentos de reunião, criação de APIs ou status de entrega.
                    </p>
                  </div>
                )}
              </div>

              {/* Checklist de Micro-Entregas da Atividade */}
              <div className="space-y-2 pt-2 border-t border-gantt-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gantt-muted uppercase tracking-wider">
                    Checklist de Entregas & Critérios ({checklist.filter(c => c.completed).length}/{checklist.length})
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={e => setNewChecklistText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                    placeholder="Adicionar item (ex: Testes unitários realizados, API documentada)..."
                    className="flex-1 bg-gantt-canvas border border-gantt-border rounded-xl px-3 py-2 text-xs text-gantt-primary placeholder:text-gantt-muted/70 focus:outline-none focus:border-safira-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    disabled={!newChecklistText.trim()}
                    className="bg-gantt-card hover:bg-gantt-canvas text-gantt-primary disabled:opacity-40 border border-gantt-border p-2 rounded-xl font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {checklist.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {checklist.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleChecklist(item.id)}
                        className="flex items-center justify-between p-2 rounded-xl bg-gantt-canvas/40 hover:bg-gantt-canvas border border-gantt-border cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {item.completed ? (
                            <CheckSquare className="w-4 h-4 text-esmeralda-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-gantt-muted shrink-0" />
                          )}
                          <span
                            className={`text-xs truncate ${
                              item.completed ? 'line-through text-gantt-muted' : 'text-gantt-primary font-medium'
                            }`}
                          >
                            {item.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleRemoveChecklistItem(item.id);
                          }}
                          className="text-gantt-muted hover:text-carmim-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PRAZOS, DEPENDÊNCIAS & CONFIGURAÇÕES                              */}
          {/* ========================================================================= */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Nome da Atividade */}
              <div>
                <label className="block text-gantt-muted font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Nome da Atividade
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-gantt-canvas border border-gantt-border rounded-xl px-3.5 py-2.5 text-sm text-gantt-primary focus:outline-none focus:border-safira-500 font-semibold transition-colors"
                />
              </div>

              {/* Tipo de Elemento */}
              <div>
                <label className="block text-gantt-muted font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Tipo de Elemento
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['epic', 'sprint', 'story', 'milestone'] as EntityType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setType(t);
                        if (t === 'milestone') setDuration(0);
                        else if (duration === 0) setDuration(5);
                      }}
                      className={`py-2 px-1 rounded-xl font-semibold text-center capitalize transition-all cursor-pointer ${
                        type === t || (t === 'epic' && type === 'phase')
                          ? 'bg-safira-600 text-white shadow-glow-safira'
                          : 'bg-gantt-canvas text-gantt-muted border border-gantt-border hover:text-gantt-primary'
                      }`}
                    >
                      {t === 'epic' ? 'Épico' : t === 'milestone' ? 'Marco' : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Épico / Agrupador */}
              {type !== 'epic' && type !== 'phase' && availableEpics.length > 0 && (
                <div>
                  <label className="block text-gantt-muted font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Épico / Agrupador
                  </label>
                  <select
                    value={phaseId}
                    onChange={e => setPhaseId(e.target.value)}
                    className="w-full bg-gantt-canvas border border-gantt-border text-gantt-primary rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-safira-500"
                  >
                    <option value="">Nenhum Épico (Geral)</option>
                    {availableEpics.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Datas Planejadas e Duração */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gantt-muted font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-gantt-canvas border border-gantt-border text-gantt-primary rounded-xl px-3 py-2 focus:outline-none focus:border-safira-500 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-gantt-muted font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Duração (Dias Úteis)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    disabled={type === 'milestone'}
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full bg-gantt-canvas border border-gantt-border text-gantt-primary rounded-xl px-3 py-2 focus:outline-none focus:border-safira-500 tabular-nums disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Datas de Execução Real */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-gantt-canvas/40 rounded-xl border border-gantt-border">
                <div>
                  <label className="block text-gantt-muted font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Início Real (Efetivo)
                  </label>
                  <input
                    type="date"
                    value={actualStartDate}
                    onChange={e => setActualStartDate(e.target.value)}
                    className="w-full bg-gantt-canvas border border-gantt-border text-gantt-primary rounded-xl px-3 py-1.5 focus:outline-none focus:border-safira-500 tabular-nums text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gantt-muted font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Término Real (Entrega)
                  </label>
                  <input
                    type="date"
                    value={actualEndDate}
                    onChange={e => setActualEndDate(e.target.value)}
                    className="w-full bg-gantt-canvas border border-gantt-border text-gantt-primary rounded-xl px-3 py-1.5 focus:outline-none focus:border-safira-500 tabular-nums text-xs"
                  />
                </div>
              </div>

              {/* Slider de Progresso com Chips Rápidos */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-gantt-muted font-semibold uppercase tracking-wider text-[10px]">
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
                  className="w-full accent-safira-500 bg-gantt-canvas h-2 rounded-lg cursor-pointer"
                />

                {/* Chips rápidos de 1 toque */}
                <div className="flex items-center justify-between gap-1 pt-1.5">
                  {[0, 25, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setProgress(pct)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border ${
                        progress === pct
                          ? 'bg-safira-600 text-white border-transparent'
                          : 'bg-gantt-canvas text-gantt-muted hover:text-gantt-primary border-gantt-border'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsável / Time */}
              <div>
                <label className="block text-gantt-muted font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Responsável / Time
                </label>
                <input
                  type="text"
                  value={assignee}
                  onChange={e => setAssignee(e.target.value)}
                  placeholder="Ex: Engenheiro de Soluções, Squad Back-end"
                  className="w-full bg-gantt-canvas border border-gantt-border rounded-xl px-3.5 py-2.5 text-gantt-primary focus:outline-none focus:border-safira-500"
                />
              </div>

              {/* Gerenciador de Dependências */}
              <div>
                <label className="block text-gantt-muted font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Dependências (Antecessoras)
                </label>

                {task.dependencies.length > 0 ? (
                  <div className="space-y-1.5 mb-2.5">
                    {task.dependencies.map(dep => {
                      const pred = project.tasks.find(t => t.id === dep.targetTaskId);
                      return (
                        <div
                          key={dep.id}
                          className="flex items-center justify-between bg-gantt-canvas/60 border border-gantt-border px-3 py-2 rounded-xl"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Link className="w-3.5 h-3.5 text-safira-400 shrink-0" />
                            <span className="font-semibold text-gantt-primary truncate">
                              {pred ? pred.name : 'Tarefa anterior'}
                            </span>
                            <span className="text-[10px] bg-gantt-canvas px-1.5 py-0.5 rounded text-gantt-muted font-mono border border-gantt-border">
                              {dep.type}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDependency(task.id, dep.targetTaskId)}
                            className="text-gantt-muted hover:text-carmim-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gantt-muted text-[11px] mb-2">Nenhuma dependência configurada.</p>
                )}

                {/* Adicionar nova dependência */}
                {candidatePredecessors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedPredId}
                      onChange={e => setSelectedPredId(e.target.value)}
                      className="flex-1 bg-gantt-canvas border border-gantt-border text-gantt-primary rounded-xl px-2.5 py-2 text-xs"
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
                      className="w-20 bg-gantt-canvas border border-gantt-border text-gantt-primary rounded-xl px-2 py-2 text-xs"
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
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gantt-border bg-gantt-header transition-colors">
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
