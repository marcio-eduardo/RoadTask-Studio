import React, { useState, useRef, useEffect } from 'react';
import { useGantt } from '../../context/GanttContext';
import { ViewMode } from '../../types/gantt';
import { Calendar, Grid3X3, List, Columns, ChevronDown, Check } from 'lucide-react';
import { GuidedTarget } from '../guided/GuidedTooltip';

const VIEW_OPTIONS: {
  id: ViewMode;
  label: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  accentClass: string;
}[] = [
  {
    id: 'timeline',
    label: 'Gantt',
    badge: 'Interativo',
    description: 'Linha do tempo SVG com marcos, dependências e caminho crítico.',
    icon: Calendar,
    accentClass: 'text-safira-400 bg-safira-500/10 border-safira-500/30',
  },
  {
    id: 'deck',
    label: 'Cards',
    badge: 'Mobile Touch',
    description: 'Cartões ágeis táteis com slider ergonômico de progresso.',
    icon: Grid3X3,
    accentClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  },
  {
    id: 'table',
    label: 'WBS Tabela',
    badge: 'Analítico',
    description: 'Estrutura analítica em tabela com ordenação e métricas.',
    icon: List,
    accentClass: 'text-esmeralda-400 bg-esmeralda-500/10 border-esmeralda-500/30',
  },
  {
    id: 'split',
    label: 'Split View',
    badge: 'Dual Screen',
    description: 'Divisão simultânea: Tabela WBS e Gantt lado a lado.',
    icon: Columns,
    accentClass: 'text-ouro-400 bg-ouro-500/10 border-ouro-500/30',
  },
];

export const ViewSelectorDropdown: React.FC = () => {
  const { viewMode, setViewMode } = useGantt();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption = VIEW_OPTIONS.find(opt => opt.id === viewMode) || VIEW_OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  // Fechar ao clicar fora ou apertar Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (mode: ViewMode) => {
    setViewMode(mode);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <GuidedTarget topicId="view_dropdown">
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
            isOpen
              ? 'bg-obsidian-850 border-safira-500/60 text-white shadow-glow-safira'
              : 'bg-obsidian-900 hover:bg-obsidian-850 border-obsidian-800 hover:border-obsidian-700 text-slate-200'
          }`}
          title="Alternar Modo de Visualização (Gantt, Cards, Tabela ou Split)"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <ActiveIcon className="w-4 h-4 text-safira-400 shrink-0" />
          <span>{activeOption.label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-safira-400' : ''
            }`}
          />
        </button>
      </GuidedTarget>

      {/* Dropdown Menu Popover (100% Solid & Opaque) */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-[#0B1120] border border-obsidian-700 rounded-2xl p-2 shadow-2xl shadow-black ring-1 ring-white/10 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 border-b border-obsidian-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Perspectiva de Visualização
            </span>
          </div>

          <div className="space-y-1">
            {VIEW_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = opt.id === viewMode;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-safira-600/30 border border-safira-500/60 text-white'
                      : 'hover:bg-obsidian-800 text-slate-300 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 ${opt.accentClass}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white">{opt.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-obsidian-800 text-slate-400 font-mono">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-tight mt-0.5">
                      {opt.description}
                    </p>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-safira-400 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
