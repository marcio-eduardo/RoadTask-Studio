import React, { useState, useEffect } from 'react';
import { useGantt } from '../../context/GanttContext';
import { RoadTaskLogo } from '../brand/RoadTaskLogo';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';

export const PitchHeader: React.FC = () => {
  const { project, togglePitchMode } = useGantt();
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B1120] border-b border-obsidian-800 px-3 py-2 sm:px-6 shadow-xl shadow-black/60">
      <div className="w-full max-w-[1700px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Insignia & Pitch Mode Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <RoadTaskLogo size="sm" showText={true} />
          
          <div className="h-4 w-px bg-obsidian-800 hidden sm:block" />
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ouro-500/10 border border-ouro-500/30 text-ouro-400 text-[11px] font-bold tracking-wide uppercase shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ouro-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-ouro-500"></span>
            </span>
            <span className="hidden sm:inline">Modo Pitch</span>
            <span className="sm:hidden">Pitch</span>
          </div>
        </div>

        {/* Center: Prominent Project Title & Context */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2 min-w-0 max-w-2xl mx-auto">
          <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-tight truncate max-w-full">
            {project.name}
          </h1>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate max-w-full">
            {project.clientName ? `${project.clientName} • ` : ''}
            <span className="text-ouro-400 font-semibold">Apresentação Executiva C-Level</span>
          </p>
        </div>

        {/* Right: Fullscreen Toggle + Return to Editor Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-obsidian-900 border border-obsidian-800 hover:border-obsidian-700 transition-colors cursor-pointer hidden sm:flex items-center justify-center"
            title={isFullscreen ? "Sair de Tela Cheia (F11)" : "Modo Tela Cheia (F11)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={togglePitchMode}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-ouro-500 to-amber-500 hover:from-ouro-400 hover:to-amber-400 text-obsidian-950 font-extrabold text-xs shadow-glow-ouro transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            title="Sair do Modo Pitch e Retornar ao Editor (Esc)"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Retornar ao Editor</span>
            <span className="sm:hidden">Retornar</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-obsidian-950/25 text-obsidian-950 rounded font-bold">
              ESC
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
