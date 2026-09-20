import React, { useState, useRef, useEffect } from 'react';
import { useGuidedAccess } from '../../context/GuidedAccessContext';
import {
  Folder,
  Download,
  FolderOpen,
  Sparkles,
  BookOpen,
  ChevronDown,
  X,
  HardDrive,
  Cloud,
  Save,
} from 'lucide-react';
import { useGantt } from '../../context/GanttContext';

interface ProjectMenuProps {
  onOpenBlueprints: () => void;
  onOpenExport: () => void;
  onOpenStorage: (tab?: 'windows' | 'cloud' | 'export') => void;
}

export const ProjectMenu: React.FC<ProjectMenuProps> = ({
  onOpenBlueprints,
  onOpenExport,
  onOpenStorage,
}) => {
  const { isGuidedMode, toggleGuidedMode } = useGuidedAccess();
  const { saveToWindows, openFromWindows, linkedFileName } = useGantt();
  const [isOpen, setIsOpen] = useState(false);
  const [showConcepts, setShowConcepts] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Unified Project Menu Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[34px] ${
          isOpen
            ? 'bg-obsidian-850 border-safira-500 text-white shadow-glow-safira'
            : 'bg-obsidian-900 hover:bg-obsidian-850 border-obsidian-800 text-slate-200 hover:text-white'
        }`}
        title="Menu de Projeto, Modelos, Armazenamento e Exportação"
        aria-expanded={isOpen}
      >
        <Folder className="w-3.5 h-3.5 text-safira-400 shrink-0" />
        <span>Projeto</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-safira-400' : ''
          }`}
        />
        {linkedFileName && (
          <span className="w-2 h-2 rounded-full bg-esmeralda-400" title={`Arquivo vinculado: ${linkedFileName}`} />
        )}
        {isGuidedMode && (
          <span className="w-1.5 h-1.5 rounded-full bg-safira-400 animate-ping" />
        )}
      </button>

      {/* 100% Solid Opaque Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-88 bg-[#0B1120] border border-obsidian-750 rounded-2xl p-2 shadow-2xl shadow-black ring-1 ring-white/10 z-50 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-obsidian-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Opções do Projeto
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-obsidian-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section 1: Storage Actions (Windows & Cloud) */}
          <div className="p-1 space-y-1">
            {/* Salvar no Windows */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                saveToWindows();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-obsidian-800 text-slate-200 transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-safira-500/10 border border-safira-500/30 flex items-center justify-center text-safira-400 shrink-0">
                <Save className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white block">Salvar no Windows</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-obsidian-850 px-1 py-0.5 rounded border border-obsidian-750">Ctrl+S</span>
                </div>
                <span className="text-[10.5px] text-slate-400 block truncate">
                  {linkedFileName ? `Salvar em: ${linkedFileName}` : 'Escolher pasta no Windows Explorer'}
                </span>
              </div>
            </button>

            {/* Abrir do Windows */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openFromWindows();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-obsidian-800 text-slate-200 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-ouro-500/10 border border-ouro-500/30 flex items-center justify-center text-ouro-400 shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block">Abrir do Windows</span>
                <span className="text-[10.5px] text-slate-400 block truncate">
                  Carregar arquivo .roadtask.json do computador
                </span>
              </div>
            </button>

            {/* Nuvem & Backend Python */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenStorage('cloud');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-obsidian-800 text-slate-200 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-esmeralda-500/10 border border-esmeralda-500/30 flex items-center justify-center text-esmeralda-400 shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block">Sincronizar Nuvem / Python</span>
                <span className="text-[10.5px] text-slate-400 block truncate">
                  FastAPI + NoSQL (Docker ou Vercel)
                </span>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-obsidian-800 my-1" />

          {/* Section 2: Blueprints & Export */}
          <div className="p-1 space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenBlueprints();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-obsidian-800 text-slate-200 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-safira-500/10 border border-safira-500/30 flex items-center justify-center text-safira-400 shrink-0">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block">Modelos de Engenharia</span>
                <span className="text-[10.5px] text-slate-400 block truncate">
                  Carregar SGFrotas, Ágil, Infra ou Roadmap
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenExport();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-obsidian-800 text-slate-200 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-obsidian-800 border border-obsidian-750 flex items-center justify-center text-slate-300 shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block">Exportar Cronograma</span>
                <span className="text-[10.5px] text-slate-400 block truncate">
                  PDF A4, PNG 4K, Mermaid e JSON
                </span>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-obsidian-800 my-1" />

          {/* Section 2: Guided Access Toggle */}
          <div className="p-2 rounded-xl bg-obsidian-950 border border-obsidian-800/80 mx-1 mb-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-safira-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">Acesso Guiado</span>
                  <span className="text-[10px] text-slate-400">Animações ao passar o mouse</span>
                </div>
              </div>

              {/* Switch */}
              <button
                type="button"
                onClick={toggleGuidedMode}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isGuidedMode ? 'bg-safira-500' : 'bg-obsidian-750'
                }`}
                role="switch"
                aria-checked={isGuidedMode}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isGuidedMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 3: Collapsible Concepts & Shortcuts */}
          <div className="p-1 space-y-1">
            <button
              type="button"
              onClick={() => setShowConcepts(v => !v)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-obsidian-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            >
              <span className="flex items-center gap-1.5 font-semibold">
                <BookOpen className="w-3.5 h-3.5 text-ouro-400" />
                <span>Glossário de Gantt & Atalhos</span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showConcepts ? 'rotate-180' : ''}`}
              />
            </button>

            {showConcepts && (
              <div className="p-2 space-y-1.5 bg-obsidian-950 rounded-xl border border-obsidian-800 text-[10.5px]">
                <p>
                  <strong className="text-carmim-400">Caminho Crítico (CPM):</strong> Sequência inadiável com folga zero.
                </p>
                <p>
                  <strong className="text-safira-400">Encadeamento FS:</strong> Tarefa subsequente inicia no próximo dia útil.
                </p>
                <p>
                  <strong className="text-ouro-400">Marcos:</strong> Ponto focal com duração 0d (diamante dourado).
                </p>
                <div className="pt-1.5 border-t border-obsidian-800 flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Ctrl+Z (Desfazer)</span>
                  <span>Ctrl+P (Pitch)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
