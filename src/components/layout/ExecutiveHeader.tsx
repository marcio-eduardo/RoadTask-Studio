import React, { useState } from 'react';
import { useGantt } from '../../context/GanttContext';
import { ZoomLevel } from '../../types/gantt';
import {
  Presentation,
  Sliders,
  Undo2,
  Redo2,
  Edit2,
  Check,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { ViewSelectorDropdown } from './ViewSelectorDropdown';
import { ProjectMenu } from './ProjectMenu';
import { GuidedTarget } from '../guided/GuidedTooltip';
import { RoadTaskLogo } from '../brand/RoadTaskLogo';
import { StorageModal } from '../modals/StorageModal';

interface ExecutiveHeaderProps {
  onOpenBlueprints: () => void;
  onOpenExport: () => void;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  onOpenBlueprints,
  onOpenExport,
}) => {
  const {
    project,
    updateProjectInfo,
    viewMode,
    zoomLevel,
    setZoomLevel,
    isPitchMode,
    togglePitchMode,
    simulation,
    toggleSimulation,
    undo,
    redo,
    canUndo,
    canRedo,
    theme,
    toggleTheme,
  } = useGantt();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.name);
  const [clientInput, setClientInput] = useState(project.clientName || '');

  // Storage Modal State
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [storageTab, setStorageTab] = useState<'windows' | 'cloud'>('windows');

  const handleSaveTitle = () => {
    updateProjectInfo({
      name: titleInput.trim() || project.name,
      clientName: clientInput.trim() || undefined,
    });
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitleInput(project.name);
    setClientInput(project.clientName || '');
    setIsEditingTitle(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-gantt-header border-b border-gantt-border transition-colors duration-200">
      {/* ==================== ROW 1: TOP BAR (Logo, Centered Title & Subtitle, Actions) ==================== */}
      <div className="w-full max-w-[1750px] mx-auto px-3 py-2 sm:px-5 flex items-center justify-between gap-4 border-b border-gantt-border/50">
        {/* Left: RoadTask Studio Logo */}
        <div className="shrink-0 flex items-center">
          <RoadTaskLogo size="sm" showText={true} />
        </div>

        {/* Center: Centered Project Title & Subtitle */}
        <div className="flex-1 flex flex-col items-center justify-center text-center min-w-0 px-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5 justify-center max-w-md w-full">
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                className="bg-gantt-canvas border border-safira-500 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-bold text-gantt-primary focus:outline-none w-full text-center"
                placeholder="Nome do Projeto"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') handleCancelTitle();
                }}
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1.5 bg-safira-600 hover:bg-safira-500 text-white rounded-lg cursor-pointer transition-colors"
                title="Salvar título"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCancelTitle}
                className="p-1.5 bg-gantt-canvas hover:bg-gantt-border text-gantt-muted hover:text-gantt-primary rounded-lg cursor-pointer transition-colors"
                title="Cancelar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              className="group cursor-pointer flex flex-col items-center justify-center max-w-xl truncate"
              onClick={() => setIsEditingTitle(true)}
              title="Clique para editar o título e diretoria do projeto"
            >
              <div className="flex items-center gap-1.5 justify-center">
                <h1 className="text-xs sm:text-sm font-black text-gantt-primary tracking-wider uppercase truncate group-hover:text-safira-500 transition-colors">
                  {project.name}
                </h1>
                <Edit2 className="w-3 h-3 text-gantt-muted group-hover:text-safira-500 transition-colors shrink-0 opacity-60 group-hover:opacity-100" />
              </div>
              <p className="text-[10.5px] text-gantt-muted font-medium truncate mt-0.5">
                {project.clientName || 'Gestão Integrada de Frotas & Operações'} •{' '}
                <span className="text-safira-600 dark:text-safira-400 font-semibold">Cronograma Executivo</span>
              </p>
            </div>
          )}
        </div>

        {/* Right: Actions (Theme Toggle, Undo/Redo) */}
        <div className="shrink-0 flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-gantt-primary dark:hover:text-white rounded-xl border border-gantt-border bg-gantt-card hover:bg-gantt-card-hover transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-ouro-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            )}
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center bg-gantt-card border border-gantt-border rounded-xl p-0.5">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Desfazer (Ctrl+Z)"
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-gantt-primary dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gantt-card-hover transition-colors cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Refazer (Ctrl+Y)"
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-gantt-primary dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gantt-card-hover transition-colors cursor-pointer"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== ROW 2: CONTROLS & NAVIGATION BAR ==================== */}
      <div className="w-full max-w-[1750px] mx-auto px-3 py-1.5 sm:px-5 flex items-center gap-2 sm:gap-2.5 overflow-visible relative z-30 flex-wrap sm:flex-nowrap">
        {/* 1. Project Menu */}
        <ProjectMenu
          onOpenBlueprints={onOpenBlueprints}
          onOpenExport={onOpenExport}
          onOpenStorage={(tab) => {
            setStorageTab(tab || 'windows');
            setIsStorageOpen(true);
          }}
        />

        {/* 2. View Selector (Gantt, Table, Deck, Split) */}
        <ViewSelectorDropdown />

        {/* 3. Zoom Level (Dia | Semana | Mês) */}
        {(viewMode === 'timeline' || viewMode === 'split') && (
          <div className="flex items-center bg-gantt-card border border-gantt-border rounded-xl p-0.5 text-xs font-medium shrink-0">
            {(['day', 'week', 'month'] as ZoomLevel[]).map(z => (
              <button
                key={z}
                type="button"
                onClick={() => setZoomLevel(z)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer capitalize ${
                  zoomLevel === z
                    ? 'bg-safira-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-gantt-primary dark:hover:text-white'
                }`}
              >
                {z === 'day' ? 'Dia' : z === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        )}

        {/* 4. What-If Simulation Toggle */}
        <GuidedTarget topicId="whatif_simulation">
          <button
            type="button"
            onClick={toggleSimulation}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[34px] shrink-0 ${
              simulation.isActive
                ? 'bg-ouro-500/15 border-ouro-500/30 text-ouro-400 shadow-xs'
                : 'bg-gantt-card hover:bg-gantt-card-hover border border-gantt-border text-slate-600 dark:text-slate-300 hover:text-gantt-primary dark:hover:text-white'
            }`}
            title="Simular impactos de atraso ou adiantamento no Go-Live"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>What-If</span>
          </button>
        </GuidedTarget>

        {/* 5. Pitch Mode Toggle */}
        <GuidedTarget topicId="pitch_mode">
          <button
            type="button"
            onClick={togglePitchMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[34px] shrink-0 ${
              isPitchMode
                ? 'bg-ouro-500/90 text-obsidian-950 shadow-xs'
                : 'bg-safira-600 hover:bg-safira-500 text-white shadow-xs'
            }`}
            title="Modo Pitch Executivo em tela cheia (Ctrl+P)"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Pitch</span>
          </button>
        </GuidedTarget>
      </div>

      {/* Storage & Cloud Modal */}
      <StorageModal
        isOpen={isStorageOpen}
        onClose={() => setIsStorageOpen(false)}
        initialTab={storageTab}
      />
    </header>
  );
};
