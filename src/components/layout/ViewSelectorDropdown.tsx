import React, { useState, useRef, useEffect } from 'react';
import { useGantt } from '../../context/GanttContext';
import { ViewMode } from '../../types/gantt';
import { Calendar, Grid3X3, List, Columns, ChevronDown, Check } from 'lucide-react';
import { GuidedTarget } from '../guided/GuidedTooltip';

const VIEW_OPTIONS: {
  id: ViewMode;
  label: string;
  icon: React.ElementType;
  iconColor: string;
}[] = [
  {
    id: 'timeline',
    label: 'Gantt',
    icon: Calendar,
    iconColor: 'text-safira-400',
  },
  {
    id: 'deck',
    label: 'Cards',
    icon: Grid3X3,
    iconColor: 'text-indigo-400',
  },
  {
    id: 'table',
    label: 'Tabela',
    icon: List,
    iconColor: 'text-esmeralda-400',
  },
  {
    id: 'split',
    label: 'Split View',
    icon: Columns,
    iconColor: 'text-ouro-400',
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
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[34px] ${
            isOpen
              ? 'bg-obsidian-850 border-safira-500 text-white shadow-glow-safira'
              : 'bg-obsidian-900 hover:bg-obsidian-850 border-obsidian-800 hover:border-obsidian-700 text-slate-200 hover:text-white'
          }`}
          title="Alternar Modo de Visualização"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <ActiveIcon className="w-3.5 h-3.5 text-safira-400 shrink-0" />
          <span>{activeOption.label}</span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-safira-400' : ''
            }`}
          />
        </button>
      </GuidedTarget>

      {/* Popover Minimalista (100% Sólido & Opaco) */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-[#0B1120] border border-obsidian-750 rounded-2xl p-1.5 shadow-2xl shadow-black ring-1 ring-white/10 z-50 animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1.5 border-b border-obsidian-800/80 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Visualização
            </span>
          </div>

          <div className="space-y-0.5">
            {VIEW_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = opt.id === viewMode;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-safira-500/15 border border-safira-500/40 text-white'
                      : 'hover:bg-obsidian-800 text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-safira-400' : opt.iconColor}`} />
                    <span className="text-xs font-medium truncate">{opt.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-safira-400 shrink-0" />
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
