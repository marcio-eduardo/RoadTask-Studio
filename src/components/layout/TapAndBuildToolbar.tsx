import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGantt } from '../../context/GanttContext';
import { useGuidedAccess } from '../../context/GuidedAccessContext';
import { EntityType, TimeUnit } from '../../types/gantt';
import {
  Layers,
  Zap,
  CheckSquare,
  Diamond,
  Link,
  Plus,
  Minus,
  Clock,
  Sparkles,
  ChevronDown,
  Check,
} from 'lucide-react';
import { GuidedTarget } from '../guided/GuidedTooltip';

interface EntityMeta {
  type: EntityType;
  label: string;
  shortLabel: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
  colorClass: string;
  borderClass: string;
  bgClass: string;
}

const ENTITY_OPTIONS: EntityMeta[] = [
  {
    type: 'story',
    label: 'Story / Tarefa',
    shortLabel: 'Story',
    desc: 'Item de trabalho com esforço estimado em dias',
    icon: CheckSquare,
    colorClass: 'text-esmeralda-400',
    borderClass: 'border-esmeralda-500/20',
    bgClass: 'bg-esmeralda-500/10',
  },
  {
    type: 'sprint',
    label: 'Sprint Ágil',
    shortLabel: 'Sprint',
    desc: 'Ciclo iterativo padrão (1 a 2 semanas)',
    icon: Zap,
    colorClass: 'text-safira-400',
    borderClass: 'border-safira-500/20',
    bgClass: 'bg-safira-500/10',
  },
  {
    type: 'phase',
    label: 'Fase / Macroetapa',
    shortLabel: 'Fase',
    desc: 'Grande agrupador executivo do projeto',
    icon: Layers,
    colorClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/20',
    bgClass: 'bg-indigo-500/10',
  },
  {
    type: 'milestone',
    label: 'Marco (Milestone)',
    shortLabel: 'Marco',
    desc: 'Ponto focal de entrega com duração zero (0d)',
    icon: Diamond,
    colorClass: 'text-ouro-400',
    borderClass: 'border-ouro-500/20',
    bgClass: 'bg-ouro-500/10',
  },
];

export const TapAndBuildToolbar: React.FC = () => {
  const { project, addTask } = useGantt();
  const { hideTopic } = useGuidedAccess();

  // Selected Entity State
  const [entityType, setEntityType] = useState<EntityType>('story');
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const typeMenuRef = useRef<HTMLDivElement>(null);

  // Form Fields
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState(5);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('days');
  const [autoChain, setAutoChain] = useState(true);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('');
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const presetRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeMenuRef.current && !typeMenuRef.current.contains(e.target as Node)) {
        setIsTypeMenuOpen(false);
      }
      if (presetRef.current && !presetRef.current.contains(e.target as Node)) {
        setIsPresetOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Available phases
  const availablePhases = useMemo(() => {
    return project.tasks.filter(t => t.type === 'phase');
  }, [project.tasks]);

  // Smart Auto-Naming Suggestion
  const suggestedName = useMemo(() => {
    const count = project.tasks.filter(t => t.type === entityType).length + 1;
    switch (entityType) {
      case 'phase':
        return `Fase ${count}: `;
      case 'sprint':
        return `Sprint ${count}: `;
      case 'milestone':
        return `Marco ${count}: Go-Live Homologado`;
      case 'story':
      default:
        return `Story ${count}: `;
    }
  }, [entityType, project.tasks]);

  // Selected Entity metadata
  const currentEntityMeta = useMemo(() => {
    return ENTITY_OPTIONS.find(o => o.type === entityType) || ENTITY_OPTIONS[0];
  }, [entityType]);

  // Handle entity change
  const handleTypeSelect = (type: EntityType) => {
    setEntityType(type);
    setIsTypeMenuOpen(false);
    if (type === 'milestone') {
      setDuration(0);
    } else if (type === 'sprint') {
      setDuration(10);
    } else if (type === 'phase') {
      setDuration(15);
    } else if (duration === 0) {
      setDuration(5);
    }
  };

  // Adjust duration via steppers
  const handleStepper = (delta: number) => {
    if (entityType === 'milestone') return;
    setDuration(prev => Math.max(1, prev + delta));
  };

  // Preset duration chips
  const durationPresets = [
    { label: '1 dia', days: 1, unit: 'days' as TimeUnit },
    { label: '3 dias', days: 3, unit: 'days' as TimeUnit },
    { label: '1 semana (5d)', days: 5, unit: 'days' as TimeUnit },
    { label: '2 semanas (10d)', days: 10, unit: 'days' as TimeUnit },
    { label: '1 mês (20d)', days: 20, unit: 'days' as TimeUnit },
  ];

  // Submit and create task
  const handleCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = taskName.trim() || suggestedName;

    let finalDuration = duration;
    if (timeUnit === 'weeks') {
      finalDuration = duration * 5;
    } else if (timeUnit === 'months') {
      finalDuration = duration * 20;
    } else if (entityType === 'milestone') {
      finalDuration = 0;
    }

    addTask(
      {
        name: finalName,
        type: entityType,
        phaseId: selectedPhaseId || undefined,
        duration: finalDuration,
        progress: 0,
        isMilestone: entityType === 'milestone',
        color:
          entityType === 'phase'
            ? '#0284C7'
            : entityType === 'sprint'
            ? '#0EA5E9'
            : entityType === 'milestone'
            ? '#FBBF24'
            : '#10B981',
      },
      autoChain
    );

    setTaskName('');
  };

  const IconComponent = currentEntityMeta.icon;

  return (
    <div className="bg-gantt-header border-b border-gantt-border px-3 py-2 sm:px-5 sm:py-2.5 shadow-md transition-colors duration-200">
      <div className="max-w-[1700px] mx-auto">
        <form
          onSubmit={handleCreate}
          className="flex flex-wrap items-center gap-2 sm:gap-2.5"
        >
          {/* 1. Sleek Entity Dropdown Selector */}
          <div className="relative shrink-0" ref={typeMenuRef}>
            <GuidedTarget topicId="tap_build_types">
              <button
                type="button"
                onClick={() => {
                  setIsTypeMenuOpen(v => !v);
                  hideTopic();
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-gantt-border bg-gantt-card hover:bg-gantt-card-hover text-xs font-bold transition-all cursor-pointer min-h-[38px] ${currentEntityMeta.colorClass}`}
                title="Escolher tipo de entidade (Story, Sprint, Fase, Marco)"
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{currentEntityMeta.shortLabel}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isTypeMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </GuidedTarget>

            {/* Entity Popover */}
            {isTypeMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-gantt-card border border-gantt-border rounded-2xl p-2 shadow-2xl shadow-black/40 z-50 animate-in fade-in zoom-in-95">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1 block">
                  Selecione o Tipo
                </span>
                <div className="space-y-1 mt-1">
                  {ENTITY_OPTIONS.map(opt => {
                    const ItemIcon = opt.icon;
                    const isSelected = opt.type === entityType;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => handleTypeSelect(opt.type)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-gantt-canvas text-gantt-primary'
                            : 'hover:bg-gantt-canvas/60 text-gantt-muted hover:text-gantt-primary'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${opt.bgClass} border border-gantt-border ${opt.colorClass}`}
                          >
                            <ItemIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">
                              {opt.label}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {opt.desc}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-safira-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Task Name Input with inline Auto-Suggest */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder={`Nome da ${currentEntityMeta.shortLabel} (ex: "${suggestedName}")`}
              className="w-full bg-gantt-canvas border border-gantt-border hover:border-gantt-border-strong focus:border-safira-500/60 text-gantt-primary placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-safira-500/20 transition-all min-h-[38px]"
            />
            {!taskName && (
              <button
                type="button"
                onClick={() => setTaskName(suggestedName)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] font-semibold bg-gantt-card hover:bg-gantt-card-hover text-slate-600 dark:text-slate-300 hover:text-gantt-primary dark:hover:text-white px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer border border-gantt-border"
                title="Preencher com sugestão automática"
              >
                <Sparkles className="w-3 h-3 text-ouro-400" />
                <span className="hidden sm:inline">Sugerir</span>
              </button>
            )}
          </div>

          {/* 3. Phase Selector (only if phases exist and type is not a phase) */}
          {availablePhases.length > 0 && entityType !== 'phase' && (
            <div className="relative shrink-0 w-36 sm:w-44">
              <select
                value={selectedPhaseId}
                onChange={e => setSelectedPhaseId(e.target.value)}
                className="w-full bg-gantt-canvas border border-gantt-border text-gantt-primary rounded-xl px-2.5 py-2 text-xs appearance-none focus:outline-none focus:border-safira-500/60 pr-7 cursor-pointer truncate min-h-[38px]"
                title="Agrupar dentro de uma Fase"
              >
                <option value="">Sem Fase (Raiz)</option>
                {availablePhases.map(p => (
                  <option key={p.id} value={p.id}>
                    📁 {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* 4. Duration Controls (Stepper + Quick Presets Dropdown) */}
          {entityType !== 'milestone' && (
            <div className="flex items-center gap-1.5 shrink-0" ref={presetRef}>
              <GuidedTarget topicId="tap_build_duration">
                <div className="flex items-center bg-gantt-canvas border border-gantt-border rounded-xl p-0.5 min-h-[38px]">
                  {/* Minus button */}
                  <button
                    type="button"
                    onClick={() => handleStepper(-1)}
                    disabled={duration <= 1}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-gantt-primary dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gantt-card-hover transition-colors cursor-pointer"
                    title="Diminuir duração"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  {/* Input value and unit toggle */}
                  <div className="flex items-center px-1">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={duration}
                      onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-10 bg-transparent text-center text-xs sm:text-sm font-bold text-gantt-primary focus:outline-none tabular-nums"
                      title="Duração numérica"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const units: TimeUnit[] = ['days', 'weeks', 'months'];
                        const nextIdx = (units.indexOf(timeUnit) + 1) % units.length;
                        setTimeUnit(units[nextIdx]);
                      }}
                      className="text-[11px] font-semibold text-safira-600 dark:text-safira-400 hover:text-safira-500 px-1 py-0.5 rounded cursor-pointer uppercase transition-colors"
                      title="Alternar unidade (Dias / Semanas / Meses)"
                    >
                      {timeUnit === 'days' ? 'd' : timeUnit === 'weeks' ? 'sem' : 'm'}
                    </button>
                  </div>

                  {/* Plus button */}
                  <button
                    type="button"
                    onClick={() => handleStepper(1)}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-gantt-primary dark:hover:text-white rounded-lg hover:bg-gantt-card-hover transition-colors cursor-pointer"
                    title="Aumentar duração"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick Preset Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsPresetOpen(v => !v)}
                    className="px-1.5 py-1 text-slate-500 dark:text-slate-400 hover:text-gantt-primary dark:hover:text-white border-l border-gantt-border text-[11px] flex items-center gap-0.5 cursor-pointer rounded-r-lg hover:bg-gantt-card-hover transition-colors"
                    title="Predefinições rápidas (1d, 3d, 1 sem, 2 sem, 1 mês)"
                  >
                    <Clock className="w-3 h-3 text-ouro-400" />
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                </div>
              </GuidedTarget>

              {/* Quick Presets Popover */}
              {isPresetOpen && (
                <div className="absolute mt-12 bg-gantt-card border border-gantt-border rounded-xl p-1.5 shadow-2xl shadow-black/40 z-50 min-w-[140px] animate-in fade-in zoom-in-95">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 py-0.5 block">
                    Predefinições
                  </span>
                  <div className="space-y-0.5 mt-1">
                    {durationPresets.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setDuration(preset.days);
                          setTimeUnit(preset.unit);
                          setIsPresetOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-gantt-primary dark:hover:text-white hover:bg-gantt-canvas transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span>{preset.label}</span>
                        {duration === preset.days && timeUnit === preset.unit && (
                          <Check className="w-3 h-3 text-safira-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. Auto-Chain Toggle */}
          <GuidedTarget topicId="tap_build_chain">
            <button
              type="button"
              onClick={() => setAutoChain(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[38px] shrink-0 ${
                autoChain
                  ? 'bg-safira-500/10 border-safira-500/20 text-safira-600 dark:text-safira-400'
                  : 'bg-gantt-canvas border border-gantt-border text-slate-500 dark:text-slate-400 hover:text-gantt-primary dark:hover:text-white'
              }`}
              title="Encadear término-início (FS) automaticamente com a tarefa anterior"
            >
              <Link className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Encadear</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  autoChain ? 'bg-safira-400 animate-pulse' : 'bg-slate-400 dark:bg-slate-500'
                }`}
              />
            </button>
          </GuidedTarget>

          {/* 6. Primary Action Button */}
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 bg-safira-600 hover:bg-safira-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer min-h-[38px] shrink-0 ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Inserir</span>
          </button>
        </form>
      </div>
    </div>
  );
};
