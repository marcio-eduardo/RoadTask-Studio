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
    borderClass: 'border-esmeralda-500/40',
    bgClass: 'bg-esmeralda-500/10',
  },
  {
    type: 'sprint',
    label: 'Sprint Ágil',
    shortLabel: 'Sprint',
    desc: 'Ciclo iterativo padrão (1 a 2 semanas)',
    icon: Zap,
    colorClass: 'text-safira-400',
    borderClass: 'border-safira-500/40',
    bgClass: 'bg-safira-500/10',
  },
  {
    type: 'phase',
    label: 'Fase / Macroetapa',
    shortLabel: 'Fase',
    desc: 'Grande agrupador executivo do projeto',
    icon: Layers,
    colorClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/40',
    bgClass: 'bg-indigo-500/10',
  },
  {
    type: 'milestone',
    label: 'Marco (Milestone)',
    shortLabel: 'Marco',
    desc: 'Ponto focal de entrega com duração zero (0d)',
    icon: Diamond,
    colorClass: 'text-ouro-400',
    borderClass: 'border-ouro-500/40',
    bgClass: 'bg-ouro-500/10',
  },
];

export const TapAndBuildToolbar: React.FC = () => {
  const { addTask, project } = useGantt();
  const { hideTopic } = useGuidedAccess();

  const [entityType, setEntityType] = useState<EntityType>('story');
  const [taskName, setTaskName] = useState<string>('');
  const [duration, setDuration] = useState<number>(5);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('days');
  const [autoChain, setAutoChain] = useState<boolean>(true);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('');

  // Dropdown states
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [isDurationMenuOpen, setIsDurationMenuOpen] = useState(false);

  const typeMenuRef = useRef<HTMLDivElement>(null);
  const durationMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (typeMenuRef.current && !typeMenuRef.current.contains(target)) {
        setIsTypeMenuOpen(false);
      }
      if (durationMenuRef.current && !durationMenuRef.current.contains(target)) {
        setIsDurationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Available phases in the project for grouping
  const availablePhases = useMemo(() => {
    return project.tasks.filter(t => t.type === 'phase');
  }, [project.tasks]);

  // Compute smart suggested names
  const suggestedName = useMemo(() => {
    const existing = project.tasks;
    if (entityType === 'sprint') {
      const sprintCount = existing.filter(t => t.type === 'sprint').length;
      return `Sprint ${sprintCount + 1}`;
    }
    if (entityType === 'phase') {
      const phaseCount = existing.filter(t => t.type === 'phase').length;
      return `Fase ${phaseCount + 1}: Nova Etapa`;
    }
    if (entityType === 'milestone') {
      const milestoneNames = ['Virada de Chave / Go-Live', 'Homologação Executiva', 'Aceite do Cliente', 'Release v1.0'];
      const mCount = existing.filter(t => t.type === 'milestone' || t.isMilestone).length;
      return milestoneNames[mCount % milestoneNames.length];
    }
    return `Story ${existing.filter(t => t.type === 'story').length + 1}`;
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
    <div className="bg-obsidian-900 border-b border-obsidian-800 px-3 py-2 sm:px-5 sm:py-2.5 shadow-md">
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
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer min-h-[38px] ${currentEntityMeta.bgClass} ${currentEntityMeta.borderClass} ${currentEntityMeta.colorClass} hover:brightness-110`}
                title="Escolha o tipo de elemento a adicionar"
                aria-expanded={isTypeMenuOpen}
              >
                <IconComponent className="w-3.5 h-3.5 shrink-0" />
                <span>{currentEntityMeta.shortLabel}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isTypeMenuOpen ? 'rotate-180 opacity-100' : 'opacity-60'
                  }`}
                />
              </button>
            </GuidedTarget>

            {/* 100% Solid Opaque Popover */}
            {isTypeMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-[#0B1120] border border-obsidian-700 rounded-2xl p-1.5 shadow-2xl shadow-black ring-1 ring-white/10 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-obsidian-800">
                  Tipo de Elemento
                </div>
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
                            ? 'bg-obsidian-800 text-white'
                            : 'hover:bg-obsidian-850 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${opt.bgClass} border ${opt.borderClass} ${opt.colorClass}`}
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
              className="w-full bg-obsidian-950/80 border border-obsidian-750 hover:border-obsidian-600 focus:border-safira-500 text-white placeholder-slate-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-safira-500/30 transition-all min-h-[38px]"
            />
            {!taskName && (
              <button
                type="button"
                onClick={() => setTaskName(suggestedName)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] font-semibold bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 hover:text-white px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer border border-obsidian-700"
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
                className="w-full bg-obsidian-950/80 border border-obsidian-750 text-slate-200 rounded-xl px-2.5 py-2 text-xs appearance-none focus:outline-none focus:border-safira-500 pr-7 cursor-pointer truncate min-h-[38px]"
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

          {/* 4. Unified Duration Control Pill (Stepper + Presets Popover) */}
          {entityType !== 'milestone' ? (
            <div className="relative shrink-0" ref={durationMenuRef}>
              <GuidedTarget topicId="tap_build_duration">
                <div className="flex items-center bg-obsidian-950/90 border border-obsidian-750 rounded-xl p-0.5 gap-0.5 min-h-[38px]">
                  <button
                    type="button"
                    onClick={() => handleStepper(-1)}
                    className="w-7 h-7 rounded-lg hover:bg-obsidian-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors"
                    title="Diminuir duração"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDurationMenuOpen(v => !v);
                      hideTopic();
                    }}
                    className="px-2 py-1 hover:bg-obsidian-800 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    title="Duração e atalhos rápidos"
                  >
                    <span className="font-bold text-xs sm:text-sm text-white tabular-nums">
                      {duration}
                      {timeUnit === 'days' ? 'd' : timeUnit === 'weeks' ? 'sem' : 'mês'}
                    </span>
                    <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStepper(1)}
                    className="w-7 h-7 rounded-lg hover:bg-obsidian-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors"
                    title="Aumentar duração"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </GuidedTarget>

              {/* 100% Solid Opaque Duration Presets Dropdown */}
              {isDurationMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#0B1120] border border-obsidian-700 rounded-2xl p-2 shadow-2xl shadow-black ring-1 ring-white/10 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 border-b border-obsidian-800">
                      <Clock className="w-3 h-3 text-safira-400" />
                      <span>Durações Frequentes</span>
                    </div>

                    <div className="space-y-1 mt-1.5">
                      {durationPresets.map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setDuration(preset.days);
                            setTimeUnit(preset.unit);
                            setIsDurationMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            duration === preset.days && timeUnit === preset.unit
                              ? 'bg-safira-600/30 text-safira-300 font-bold'
                              : 'hover:bg-obsidian-800 text-slate-300'
                          }`}
                        >
                          <span>{preset.label}</span>
                          {duration === preset.days && timeUnit === preset.unit && (
                            <Check className="w-3.5 h-3.5 text-safira-400" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Unit Switcher */}
                    <div className="pt-2 mt-1.5 border-t border-obsidian-800">
                      <div className="text-[10px] font-semibold text-slate-400 px-1 mb-1">
                        Unidade:
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {(['days', 'weeks', 'months'] as TimeUnit[]).map(unit => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => {
                              setTimeUnit(unit);
                            }}
                            className={`py-1 rounded text-[11px] font-medium text-center cursor-pointer transition-colors ${
                              timeUnit === unit
                                ? 'bg-safira-600 text-white'
                                : 'bg-obsidian-850 hover:bg-obsidian-800 text-slate-400'
                            }`}
                          >
                            {unit === 'days' ? 'Dias' : unit === 'weeks' ? 'Sem' : 'Mês'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
          ) : (
            <div className="px-3 py-2 bg-ouro-500/10 border border-ouro-500/30 rounded-xl text-ouro-400 text-xs font-bold flex items-center gap-1.5 shrink-0 min-h-[38px]">
              <Diamond className="w-3.5 h-3.5" />
              <span>0 dias (Marco)</span>
            </div>
          )}

          {/* 5. Compact Auto-Chain (FS) Button */}
          <GuidedTarget topicId="tap_build_chain">
            <button
              type="button"
              onClick={() => setAutoChain(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[38px] shrink-0 ${
                autoChain
                  ? 'bg-safira-500/15 border-safira-500/40 text-safira-300 shadow-sm'
                  : 'bg-obsidian-950/80 border-obsidian-750 text-slate-500 hover:text-slate-300'
              }`}
              title={
                autoChain
                  ? 'Encadeamento ativo: inicia após a tarefa anterior (FS)'
                  : 'Encadeamento desativado'
              }
            >
              <Link className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Encadear</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  autoChain ? 'bg-safira-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
            </button>
          </GuidedTarget>

          {/* 6. Primary Action Button */}
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-safira-600 to-safira-500 hover:from-safira-500 hover:to-safira-400 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-glow-safira transition-all cursor-pointer min-h-[38px] shrink-0 ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Inserir</span>
          </button>
        </form>
      </div>
    </div>
  );
};
