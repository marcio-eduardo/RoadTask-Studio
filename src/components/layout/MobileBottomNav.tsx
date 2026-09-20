import React from 'react';
import { useGantt } from '../../context/GanttContext';
import { Calendar, Grid3X3, List, PlusCircle, FolderOpen, Download, Presentation } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenQuickAdd: () => void;
  onOpenBlueprints: () => void;
  onOpenExport: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenQuickAdd,
  onOpenBlueprints,
  onOpenExport,
}) => {
  const { viewMode, setViewMode, isPitchMode, togglePitchMode } = useGantt();

  // If in pitch mode, keep minimal exit button
  if (isPitchMode) {
    return (
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <button
          type="button"
          onClick={togglePitchMode}
          className="bg-ouro-500 text-obsidian-950 font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs"
        >
          <Presentation className="w-4 h-4" />
          <span>Sair do Pitch</span>
        </button>
      </div>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-obsidian-950/95 backdrop-blur border-t border-obsidian-800 md:hidden px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {/* Gantt Timeline */}
        <button
          type="button"
          onClick={() => setViewMode('timeline')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            viewMode === 'timeline' ? 'text-safira-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Gantt</span>
        </button>

        {/* Task Deck (Cards) */}
        <button
          type="button"
          onClick={() => setViewMode('deck')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            viewMode === 'deck' ? 'text-safira-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Grid3X3 className="w-5 h-5" />
          <span className="text-[10px]">Cards</span>
        </button>

        {/* Center: Tap to Add */}
        <button
          type="button"
          onClick={onOpenQuickAdd}
          className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-safira-600 to-safira-400 text-white shadow-glow-safira cursor-pointer"
          title="Nova Tarefa"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        {/* WBS Table */}
        <button
          type="button"
          onClick={() => setViewMode('table')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            viewMode === 'table' ? 'text-safira-400 font-bold' : 'text-slate-400'
          }`}
        >
          <List className="w-5 h-5" />
          <span className="text-[10px]">Tabela</span>
        </button>

        {/* Modelos / Export */}
        <button
          type="button"
          onClick={onOpenBlueprints}
          className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <FolderOpen className="w-5 h-5" />
          <span className="text-[10px]">Modelos</span>
        </button>

        <button
          type="button"
          onClick={onOpenExport}
          className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <Download className="w-5 h-5" />
          <span className="text-[10px]">Exportar</span>
        </button>
      </div>
    </nav>
  );
};
