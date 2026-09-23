import React, { useState, useRef, useEffect } from 'react';
import { useGantt } from '../../context/GanttContext';
import { ViewMode } from '../../types/gantt';
import {
  Calendar,
  LayoutGrid,
  Table,
  Columns,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { GuidedTarget } from '../guided/GuidedTooltip';

interface ViewOption {
  mode: ViewMode;
  label: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
}

const VIEW_OPTIONS: ViewOption[] = [
  {
    mode: 'timeline',
    label: 'Gantt',
    desc: 'Visão temporal de barras SVG com caminho crítico e dependências',
    icon: Calendar,
  },
  {
    mode: 'scrum',
    label: 'Scrum',
    desc: 'Arquitetura Scrum por Épicos, Histórias e Sprint com SVG dinâmico',
    icon: Layers,
  },
  {
    mode: 'deck',
    label: 'Cards',
    desc: 'Visão ergonômica tátil para smartphone e gestão com 1 mão',
    icon: LayoutGrid,
  },
  {
    mode: 'table',
    label: 'EAP / WBS',
    desc: 'Estrutura Analítica do Projeto hierárquica em tabela',
    icon: Table,
  },
  {
    mode: 'split',
    label: 'Dividida',
    desc: 'Tela combinada: Tabela à esquerda e Timeline à direita',
    icon: Columns,
  },
];

export const ViewSelectorDropdown: React.FC = () => {
  const { viewMode, setViewMode } = useGantt();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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

  const activeOption = VIEW_OPTIONS.find(opt => opt.mode === viewMode) || VIEW_OPTIONS[0];
  const ActiveIcon = activeOption.icon;

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
              ? 'bg-gantt-card-hover border-safira-500/50 text-gantt-primary shadow-xs'
              : 'bg-gantt-card hover:bg-gantt-card-hover border border-gantt-border text-gantt-muted hover:text-gantt-primary'
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

      {/* Popover Dropdown Minimalista Opaque (Layout02) */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-gantt-card border border-gantt-border rounded-2xl p-1.5 shadow-2xl shadow-black/40 z-50 animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Modos de Visualização
          </div>
          <div className="space-y-0.5 mt-1">
            {VIEW_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = opt.mode === viewMode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => handleSelect(opt.mode)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-gantt-canvas text-gantt-text-primary'
                      : 'hover:bg-gantt-canvas/60 text-gantt-text-secondary hover:text-gantt-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-safira-400' : 'text-gantt-text-muted'
                      }`}
                    />
                    <span className="text-xs font-medium truncate">
                      {opt.label}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-safira-400 shrink-0 ml-2" />
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
