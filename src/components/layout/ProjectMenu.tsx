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
  Cloud,
  Save,
  FilePlus,
  FolderDown,
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
  const {
    saveToWindows,
    openFromWindows,
    createNewProject,
    linkedFileName,
    isDirty,
  } = useGantt();
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
      {/* Botão Principal do Menu Projeto */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[34px] ${
          isOpen
            ? 'bg-obsidian-850 border-safira-500 text-white shadow-glow-safira'
            : 'bg-obsidian-900 hover:bg-obsidian-850 border-obsidian-800 text-slate-200 hover:text-white'
        }`}
        title="Menu de Projeto, Armazenamento e Exportação"
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
          <span
            className={`w-2 h-2 rounded-full ${isDirty ? 'bg-ouro-400 animate-pulse' : 'bg-esmeralda-400'}`}
            title={`Arquivo vinculado: ${linkedFileName} (${isDirty ? 'Alterações não salvas' : 'Salvo'})`}
          />
        )}
        {isGuidedMode && (
          <span className="w-1.5 h-1.5 rounded-full bg-safira-400 animate-ping" />
        )}
      </button>

      {/* Popover Minimalista Opaque (Layout02) */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-[#0B1120] border border-obsidian-750 rounded-2xl p-1.5 shadow-2xl shadow-black ring-1 ring-white/10 z-50 animate-in fade-in zoom-in-95">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-obsidian-800/80 mb-1">
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

          {/* Grupo de Ações Principais (Minimalistas) */}
          <div className="space-y-0.5">
            {/* Novo */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                createNewProject();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-obsidian-800 text-slate-200 hover:text-white transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <FilePlus className="w-4 h-4 text-safira-400 group-hover:text-safira-300 transition-colors shrink-0" />
                <span className="text-xs font-medium">Novo</span>
              </div>
            </button>

            {/* Abrir */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openFromWindows();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-obsidian-800 text-slate-200 hover:text-white transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-4 h-4 text-ouro-400 group-hover:text-ouro-300 transition-colors shrink-0" />
                <span className="text-xs font-medium">Abrir</span>
              </div>
            </button>

            {/* Salvar */}
            <button
              type="button"
              disabled={linkedFileName ? !isDirty : false}
              onClick={() => {
                setIsOpen(false);
                saveToWindows(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
                linkedFileName && !isDirty
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : 'hover:bg-obsidian-800 text-slate-200 hover:text-white cursor-pointer group'
              }`}
              title={
                linkedFileName && !isDirty
                  ? 'Documento já está salvo e sem alterações pendentes'
                  : 'Salvar alterações no arquivo (Ctrl+S)'
              }
            >
              <div className="flex items-center gap-2.5">
                <Save className="w-4 h-4 text-esmeralda-400 group-hover:text-esmeralda-300 transition-colors shrink-0" />
                <span className="text-xs font-medium">Salvar</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-obsidian-850 px-1 py-0.5 rounded border border-obsidian-750">
                Ctrl+S
              </span>
            </button>

            {/* Salvar como */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                saveToWindows(true);
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-obsidian-800 text-slate-200 hover:text-white transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <FolderDown className="w-4 h-4 text-safira-400 group-hover:text-safira-300 transition-colors shrink-0" />
                <span className="text-xs font-medium">Salvar como</span>
              </div>
            </button>
          </div>

          {/* Divisor */}
          <div className="border-t border-obsidian-800/80 my-1" />

          {/* Grupo de Integrações & Exportação */}
          <div className="space-y-0.5">
            {/* Sincronizar */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenStorage('cloud');
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-obsidian-800 text-slate-200 hover:text-white transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Cloud className="w-4 h-4 text-esmeralda-400 group-hover:text-esmeralda-300 transition-colors shrink-0" />
                <span className="text-xs font-medium">Sincronizar</span>
              </div>
            </button>

            {/* Exportar */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenExport();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-obsidian-800 text-slate-200 hover:text-white transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors shrink-0" />
                <span className="text-xs font-medium">Exportar</span>
              </div>
            </button>

            {/* Modelos */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenBlueprints();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-obsidian-800 text-slate-200 hover:text-white transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-ouro-400 group-hover:text-ouro-300 transition-colors shrink-0" />
                <span className="text-xs font-medium">Modelos</span>
              </div>
            </button>
          </div>

          {/* Divisor */}
          <div className="border-t border-obsidian-800/80 my-1" />

          {/* Acesso Guiado */}
          <div className="p-2 rounded-xl bg-obsidian-950 border border-obsidian-800/80 my-0.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-safira-400 shrink-0" />
                <span className="text-[11px] font-medium text-slate-200">Acesso Guiado</span>
              </div>

              {/* Switch */}
              <button
                type="button"
                onClick={toggleGuidedMode}
                className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isGuidedMode ? 'bg-safira-500' : 'bg-obsidian-750'
                }`}
                role="switch"
                aria-checked={isGuidedMode}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isGuidedMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Glossário & Atalhos Recolhido */}
          <div>
            <button
              type="button"
              onClick={() => setShowConcepts(v => !v)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-obsidian-800 text-slate-400 hover:text-slate-200 text-[11px] transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-ouro-400" />
                <span>Glossário & Atalhos</span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showConcepts ? 'rotate-180' : ''}`}
              />
            </button>

            {showConcepts && (
              <div className="p-2 mt-1 space-y-1 bg-obsidian-950 rounded-xl border border-obsidian-800 text-[10px] text-slate-300">
                <p>
                  <strong className="text-carmim-400">Caminho Crítico (CPM):</strong> Sequência inadiável com folga zero.
                </p>
                <p>
                  <strong className="text-safira-400">Encadeamento FS:</strong> Tarefa inicia no próximo dia útil.
                </p>
                <p>
                  <strong className="text-ouro-400">Marcos:</strong> Ponto focal com duração 0d.
                </p>
                <div className="pt-1 border-t border-obsidian-800/80 flex items-center justify-between text-slate-400 text-[9.5px]">
                  <span>Ctrl+S (Salvar)</span>
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
