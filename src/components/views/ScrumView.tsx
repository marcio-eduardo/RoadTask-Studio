import React, { useState, useMemo } from 'react';
import { useGantt } from '../../context/GanttContext';
import { Task, isEpic, getTaskEpicId, getTaskSubtasks } from '../../types/gantt';
import { generateScrumSvg, downloadScrumSvg, copyScrumSvg } from '../../engine/scrumSvgEngine';
import {
  Download,
  Copy,
  Check,
  Layers,
  FileCode,
  Zap,
  LayoutGrid,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react';

interface ScrumViewProps {
  onEditTask: (task: Task) => void;
}

export const ScrumView: React.FC<ScrumViewProps> = ({ onEditTask }) => {
  const { project, addTask } = useGantt();
  const [viewTab, setViewTab] = useState<'cards' | 'diagram'>('cards');
  const [copied, setCopied] = useState(false);

  // Épicos
  const epics = useMemo(() => {
    return project.tasks.filter(isEpic);
  }, [project.tasks]);

  // Sprints
  const sprints = useMemo(() => {
    return project.tasks.filter(t => t.type === 'sprint');
  }, [project.tasks]);

  const activeSprint = useMemo(() => {
    return sprints.find(s => s.status === 'in_progress') || sprints[0];
  }, [sprints]);

  // Histórias e tarefas associadas à Sprint
  const sprintTasks = useMemo(() => {
    if (!activeSprint) return [];
    return project.tasks.filter(
      t => (t.phaseId === activeSprint.id || t.epicId === activeSprint.id) && t.id !== activeSprint.id
    );
  }, [project.tasks, activeSprint]);

  const handleCopySvg = async () => {
    await copyScrumSvg(project);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    downloadScrumSvg(project);
  };

  // Helper de badge de status
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Concluído
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-safira-500/15 text-safira-600 dark:text-safira-400 border border-safira-500/30">
            <Clock className="w-3 h-3 animate-spin" /> Em Andamento
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-ruby-500/15 text-ruby-600 dark:text-ruby-400 border border-ruby-500/30">
            <AlertCircle className="w-3 h-3" /> Impedimento
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20">
            Planejado
          </span>
        );
    }
  };

  // Adicionar História rápida em um Épico
  const handleQuickAddStory = (epicId: string) => {
    const today = new Date().toISOString().split('T')[0];
    addTask({
      name: 'Nova História de Usuário',
      type: 'story',
      epicId: epicId,
      phaseId: epicId,
      startDate: today,
      duration: 3,
      progress: 0,
      status: 'not_started',
      health: 'on_track'
    });
  };

  // SVG gerado para a aba Diagrama
  const svgMarkup = useMemo(() => {
    return generateScrumSvg(project);
  }, [project]);

  return (
    <div className="flex-1 flex flex-col h-full bg-gantt-canvas overflow-hidden">
      {/* ===================== BARRA SUPERIOR DE CONTROLE ===================== */}
      <div className="shrink-0 bg-gantt-card border-b border-gantt-border px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-safira-600/10 text-safira-600 dark:text-safira-400 border border-safira-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-gantt-primary flex items-center gap-2">
              Arquitetura Scrum por Épicos &amp; Personas
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ouro-500/15 text-ouro-600 dark:text-ouro-400 border border-ouro-500/30">
                Scrum Guide 2020
              </span>
            </h2>
            <p className="text-xs text-gantt-muted">
              {epics.length} {epics.length === 1 ? 'Épico' : 'Épicos'} mapeados •{' '}
              {project.tasks.filter(t => t.type === 'story').length} Histórias no Backlog •{' '}
              {sprints.length} {sprints.length === 1 ? 'Sprint planejada' : 'Sprints planejadas'}
            </p>
          </div>
        </div>

        {/* Controles de Visualização e Exportação */}
        <div className="flex items-center gap-2">
          {/* Toggle Cards vs Diagrama */}
          <div className="flex items-center bg-gantt-canvas border border-gantt-border rounded-xl p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewTab('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewTab === 'cards'
                  ? 'bg-safira-600 text-white font-bold shadow-xs'
                  : 'text-gantt-muted hover:text-gantt-primary'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards Ágeis</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewTab === 'diagram'
                  ? 'bg-safira-600 text-white font-bold shadow-xs'
                  : 'text-gantt-muted hover:text-gantt-primary'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Diagrama SVG</span>
            </button>
          </div>

          {/* Botões de Ação SVG */}
          <button
            type="button"
            onClick={handleCopySvg}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gantt-canvas hover:bg-gantt-border border border-gantt-border text-gantt-primary text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            title="Copiar código SVG para colar em apresentações ou docs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar SVG'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-safira-600 hover:bg-safira-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Baixar arquivo vetorial SVG do Diagrama Scrum"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar SVG</span>
          </button>
        </div>
      </div>

      {/* ===================== ÁREA DE CONTEÚDO PRINCIPAL ===================== */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {viewTab === 'diagram' ? (
          /* MODO DIAGRAMA ARQUITETURAL SVG */
          <div className="w-full flex flex-col items-center">
            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-xl border border-slate-200 w-full overflow-x-auto">
              <div
                className="min-w-[1280px] flex justify-center"
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
              />
            </div>
          </div>
        ) : (
          /* MODO CARDS ÁGEIS POR PERSONAS */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-[1700px] mx-auto">
            {/* ================= COLUNA 1: SPRINT BACKLOG (4 colunas) ================= */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-gradient-to-br from-purple-900/10 via-gantt-card to-gantt-card border-2 border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400">
                      <Zap className="w-4 h-4" />
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-gantt-primary">
                      Sprint Backlog (Ativo)
                    </h3>
                  </div>
                  {activeSprint && (
                    <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                      {activeSprint.progress}% feito
                    </span>
                  )}
                </div>

                {/* Dados da Sprint Ativa */}
                {activeSprint ? (
                  <div
                    onClick={() => onEditTask(activeSprint)}
                    className="mt-3 p-3.5 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        Meta da Sprint
                      </span>
                      {getStatusBadge(activeSprint.status)}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-gantt-primary group-hover:text-purple-600 transition-colors">
                      {activeSprint.name}
                    </h4>
                    <p className="text-[11px] text-gantt-muted mt-1">
                      Prazo: {activeSprint.startDate} até {activeSprint.endDate} ({activeSprint.duration} dias)
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gantt-muted mt-3 italic">
                    Nenhuma Sprint cadastrada. Adicione uma Sprint na barra de ferramentas.
                  </p>
                )}

                {/* Tarefas e Histórias Selecionadas para a Sprint */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gantt-muted uppercase tracking-wider">
                      Tasks Técnicas &amp; Histórias
                    </span>
                    <span className="text-[11px] text-gantt-muted font-mono">
                      {sprintTasks.length} itens
                    </span>
                  </div>

                  <div className="space-y-2">
                    {sprintTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className="p-3 rounded-xl bg-gantt-canvas hover:bg-gantt-card border border-gantt-border hover:border-purple-500/40 cursor-pointer transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase">
                              {task.type}
                            </span>
                            <h5 className="text-xs font-bold text-gantt-primary group-hover:text-purple-600 transition-colors">
                              {task.name}
                            </h5>
                          </div>
                          {getStatusBadge(task.status)}
                        </div>

                        {/* Tasks / Checklist da História */}
                        {getTaskSubtasks(task).length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gantt-border flex items-center justify-between text-[10.5px] text-gantt-muted">
                            <span>Tarefas da História:</span>
                            <span className="font-mono font-bold text-purple-600">
                              {getTaskSubtasks(task).filter(c => c.completed).length}/{getTaskSubtasks(task).length}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {sprintTasks.length === 0 && (
                      <div className="p-4 rounded-xl border border-dashed border-gantt-border text-center text-xs text-gantt-muted">
                        Nenhuma história ou tarefa vinculada a esta Sprint ainda.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ================= COLUNA 2: PRODUCT BACKLOG POR ÉPICOS (8 colunas) ================= */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="font-black text-base text-gantt-primary flex items-center gap-2">
                    Product Backlog: Épicos &amp; Histórias de Valor
                  </h3>
                  <p className="text-xs text-gantt-muted">
                    Organização orientada às Personas de Negócio (ex: Gestor de Frotas vs Técnico de Campo)
                  </p>
                </div>
              </div>

              {/* Grid de Épicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {epics.map((epic, index) => {
                  const epicStories = project.tasks.filter(
                    t => (t.type === 'story' || t.type === 'milestone') && (getTaskEpicId(t) === epic.id || epics.length === 1)
                  );
                  const epicTasks = project.tasks.filter(
                    t => t.type !== 'epic' && t.type !== 'phase' && t.type !== 'sprint' && getTaskEpicId(t) === epic.id
                  );

                  // Cores alternadas por épico
                  const borderColors = [
                    'border-safira-500/40 hover:border-safira-500',
                    'border-emerald-500/40 hover:border-emerald-500',
                    'border-amber-500/40 hover:border-amber-500'
                  ];
                  const headerBg = [
                    'bg-safira-500/10 text-safira-600 dark:text-safira-400',
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  ];

                  return (
                    <div
                      key={epic.id}
                      className={`bg-gantt-card border-2 ${borderColors[index % borderColors.length]} rounded-2xl p-4 shadow-sm flex flex-col h-full transition-all`}
                    >
                      {/* Cabeçalho do Épico */}
                      <div
                        onClick={() => onEditTask(epic)}
                        className="cursor-pointer pb-3 border-b border-gantt-border group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${headerBg[index % headerBg.length]}`}>
                            Épico #{index + 1}
                          </span>
                          <span className="text-xs font-mono font-bold text-gantt-muted">
                            {epic.progress}% concluído
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-gantt-primary group-hover:text-safira-600 transition-colors">
                          {epic.name}
                        </h4>
                        <p className="text-[11px] text-gantt-muted mt-0.5">
                          {epicStories.length} histórias • {epicTasks.length} tasks técnicas
                        </p>
                      </div>

                      {/* Lista de Histórias do Épico */}
                      <div className="mt-3 flex-1 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-gantt-muted uppercase tracking-wider">
                          <span>Histórias de Usuário</span>
                          <button
                            type="button"
                            onClick={() => handleQuickAddStory(epic.id)}
                            className="text-safira-600 dark:text-safira-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                          >
                            <Plus className="w-3 h-3" /> Nova História
                          </button>
                        </div>

                        {epicStories.map(story => (
                          <div
                            key={story.id}
                            onClick={() => onEditTask(story)}
                            className="p-2.5 rounded-xl bg-gantt-canvas hover:bg-gantt-card border border-gantt-border hover:border-safira-500/50 cursor-pointer transition-all group"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <h5 className="text-xs font-bold text-gantt-primary group-hover:text-safira-600 transition-colors">
                                {story.name}
                              </h5>
                              {getStatusBadge(story.status)}
                            </div>
                            <div className="flex items-center justify-between text-[10.5px] text-gantt-muted mt-1.5 pt-1.5 border-t border-gantt-border/50">
                              <span>Duração: {story.duration}d</span>
                              <span className="font-mono">{story.progress}%</span>
                            </div>
                          </div>
                        ))}

                        {epicStories.length === 0 && (
                          <div className="p-4 rounded-xl border border-dashed border-gantt-border text-center text-xs text-gantt-muted">
                            Nenhuma história vinculada a este Épico.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {epics.length === 0 && (
                  <div className="col-span-2 p-8 rounded-2xl border-2 border-dashed border-gantt-border text-center text-gantt-muted">
                    <p className="font-bold text-sm mb-1">Nenhum Épico cadastrado no projeto</p>
                    <p className="text-xs">
                      Utilize a barra superior "Inserir" e selecione <strong>Épico</strong> para estruturar seu Backlog.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
