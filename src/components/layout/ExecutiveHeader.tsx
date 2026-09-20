import React, { useState } from 'react';
import { useGantt } from '../../context/GanttContext';
import { useGuidedAccess } from '../../context/GuidedAccessContext';
import { ZoomLevel } from '../../types/gantt';
import {
  Presentation,
  Sliders,
  Undo2,
  Redo2,
  Edit2,
  Check,
  X,
  Save,
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
    linkedFileName,
    saveToWindows,
  } = useGantt();

  const { isGuidedMode, toggleGuidedMode } = useGuidedAccess();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.name);
  const [clientInput, setClientInput] = useState(project.clientName || '');

  // Storage Modal State
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [storageTab, setStorageTab] = useState<'windows' | 'cloud' | 'export'>('windows');

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
    <header className="sticky top-0 z-40 shadow-lg">
      {/* ================= TIER 1: Top Title Bar (Padrão Microsoft Word / Office) ================= */}
      <div className="bg-obsidian-950 border-b border-obsidian-850 px-3 py-1.5 sm:px-5">
        <div className="w-full max-w-[1700px] mx-auto flex items-center justify-between gap-3">
          {/* Top Left: Brand Insignia & Animated Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <RoadTaskLogo size="sm" showText={true} />
          </div>

          {/* Top Center: Project Title Prominent & Centered (Like Word) */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-2 min-w-0 max-w-2xl mx-auto">
            {isEditingTitle ? (
              <div className="flex items-center justify-center gap-1.5 w-full">
                <input
                  type="text"
                  value={titleInput}
                  onChange={e => setTitleInput(e.target.value)}
                  className="bg-obsidian-850 border border-safira-500 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-bold text-white focus:outline-none w-56 sm:w-80 text-center"
                  placeholder="Nome do Projeto"
                  autoFocus
                />
                <input
                  type="text"
                  value={clientInput}
                  onChange={e => setClientInput(e.target.value)}
                  className="bg-obsidian-850 border border-obsidian-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none hidden md:inline-block w-40 text-center"
                  placeholder="Cliente / Diretoria"
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
                  className="p-1.5 bg-obsidian-800 hover:bg-obsidian-700 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                className="group cursor-pointer flex flex-col items-center justify-center max-w-full"
                onClick={() => setIsEditingTitle(true)}
                title="Clique para editar o título e diretoria do projeto"
              >
                <div className="flex items-center justify-center gap-1.5 max-w-full">
                  <h1 className="text-xs sm:text-sm md:text-base font-black text-white tracking-tight truncate group-hover:text-safira-300 transition-colors">
                    {project.name}
                  </h1>
                  <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-safira-400 transition-colors shrink-0 opacity-60 group-hover:opacity-100" />
                </div>

                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate max-w-full">
                  {project.clientName || 'Cliente Corporativo'} •{' '}
                  <span className="text-safira-400 font-semibold">Cronograma Executivo</span>
                </p>
              </div>
            )}
          </div>

          {/* Top Right: Undo/Redo & Guided Status Pill */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Linked Windows File Indicator (Click to save) */}
            {linkedFileName && (
              <button
                type="button"
                onClick={saveToWindows}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-esmeralda-500/10 hover:bg-esmeralda-500/20 border border-esmeralda-500/30 text-esmeralda-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
                title={`Salvar alterações em ${linkedFileName} (Ctrl+S)`}
              >
                <Save className="w-3.5 h-3.5 text-esmeralda-400" />
                <span className="truncate max-w-[130px]">{linkedFileName}</span>
                <span className="text-[10px] font-mono text-esmeralda-400/80 bg-esmeralda-950/60 px-1 py-0.5 rounded border border-esmeralda-500/30">Ctrl+S</span>
              </button>
            )}

            {/* Guided Mode Active Indicator */}
            {isGuidedMode && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-safira-500/10 border border-safira-500/30 text-safira-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-safira-400 animate-ping" />
                <span className="hidden sm:inline">Acesso Guiado</span>
                <button
                  type="button"
                  onClick={toggleGuidedMode}
                  className="ml-1 text-slate-400 hover:text-white"
                  title="Desativar Acesso Guiado"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Undo / Redo */}
            <div className="flex items-center bg-obsidian-900 border border-obsidian-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                title="Desfazer (Ctrl+Z)"
                className="p-1 text-slate-300 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed rounded hover:bg-obsidian-800 transition-colors cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                title="Refazer (Ctrl+Y)"
                className="p-1 text-slate-300 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed rounded hover:bg-obsidian-800 transition-colors cursor-pointer"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TIER 2: Menus & Command Ribbon Bar (Abaixo do Título, Alinhados à Esquerda) ================= */}
      <div className="bg-[#0B1120] border-b border-obsidian-800 px-3 py-1.5 sm:px-5 relative z-30">
        <div className="w-full max-w-[1700px] mx-auto flex items-center justify-start gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          {/* 1. Project Menu (Modelos, Exportar, Glossário, Acesso Guiado) */}
          <ProjectMenu
            onOpenBlueprints={onOpenBlueprints}
            onOpenExport={onOpenExport}
            onOpenStorage={(tab) => {
              setStorageTab(tab || 'windows');
              setIsStorageOpen(true);
            }}
          />

          {/* 2. Expandable Views Menu */}
          <ViewSelectorDropdown />

          {/* 3. Scale Zoom (Timeline / Split) */}
          {(viewMode === 'timeline' || viewMode === 'split') && (
            <div className="flex items-center bg-obsidian-900 border border-obsidian-800 rounded-xl p-0.5 text-xs font-medium shrink-0">
              {(['day', 'week', 'month'] as ZoomLevel[]).map(z => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoomLevel(z)}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer capitalize ${
                    zoomLevel === z
                      ? 'bg-obsidian-750 text-safira-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {z === 'day' ? 'Dia' : z === 'week' ? 'Semana' : 'Mês'}
                </button>
              ))}
            </div>
          )}

          {/* Vertical Divider */}
          <div className="h-4 w-px bg-obsidian-800 mx-1 shrink-0" />

          {/* 4. What-If Simulation Toggle */}
          <GuidedTarget topicId="whatif_simulation">
            <button
              type="button"
              onClick={toggleSimulation}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[34px] shrink-0 ${
                simulation.isActive
                  ? 'bg-ouro-500/20 border-ouro-500/40 text-ouro-400 shadow-glow-ouro'
                  : 'bg-obsidian-900 hover:bg-obsidian-850 border-obsidian-800 text-slate-300'
              }`}
              title="Simular impactos de atraso ou adiantamento no Go-Live"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>What-If</span>
            </button>
          </GuidedTarget>

          {/* 5. Pitch Mode Toggle (C-Level Presentation) */}
          <GuidedTarget topicId="pitch_mode">
            <button
              type="button"
              onClick={togglePitchMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[34px] shrink-0 ${
                isPitchMode
                  ? 'bg-ouro-500 text-obsidian-950 shadow-glow-ouro'
                  : 'bg-gradient-to-r from-safira-600 to-indigo-600 hover:from-safira-500 hover:to-indigo-500 text-white shadow-glow-safira'
              }`}
              title="Modo Apresentação C-Level (F11 ou Ctrl+P)"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Pitch</span>
            </button>
          </GuidedTarget>
        </div>
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
