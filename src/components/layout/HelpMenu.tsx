import React, { useState, useRef, useEffect } from 'react';
import { useGuidedAccess } from '../../context/GuidedAccessContext';
import { HelpCircle, Sparkles, BookOpen, Command, X, Compass } from 'lucide-react';

export const HelpMenu: React.FC = () => {
  const { isGuidedMode, toggleGuidedMode } = useGuidedAccess();
  const [isOpen, setIsOpen] = useState(false);
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
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
          isGuidedMode
            ? 'bg-safira-600/20 border-safira-500/60 text-safira-300 shadow-glow-safira'
            : 'bg-obsidian-900 hover:bg-obsidian-850 border-obsidian-800 text-slate-300 hover:text-white'
        }`}
        title="Ajuda & Acesso Guiado Interativo"
        aria-expanded={isOpen}
      >
        <HelpCircle className={`w-3.5 h-3.5 ${isGuidedMode ? 'text-safira-400 animate-pulse' : 'text-slate-400'}`} />
        <span className="hidden sm:inline">Ajuda</span>
        {isGuidedMode && (
          <span className="w-2 h-2 rounded-full bg-safira-400 animate-ping" />
        )}
      </button>

      {/* Help Popover Dropdown (100% Solid & Opaque) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0B1120] border border-obsidian-700 rounded-2xl p-3 shadow-2xl shadow-black ring-1 ring-white/10 z-50 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-obsidian-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-safira-600/20 border border-safira-500/30 flex items-center justify-center text-safira-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Central de Ajuda & Guia</h4>
                <p className="text-[10px] text-slate-400 font-medium">Instruções para usuários e gestores</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-obsidian-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Guided Mode Switch (Main Requirement) */}
          <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-safira-950/50 to-obsidian-850 border border-safira-500/40">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-safira-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">Acesso Guiado</span>
                  <span className="text-[10px] text-slate-300">Animações explicativas ao passar o mouse</span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={toggleGuidedMode}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isGuidedMode ? 'bg-safira-500' : 'bg-obsidian-750'
                }`}
                role="switch"
                aria-checked={isGuidedMode}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isGuidedMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[10.5px] text-slate-400 mt-2 leading-relaxed">
              {isGuidedMode ? (
                <span className="text-safira-300 font-medium">
                  ✓ Ativo: Passe o cursor ou toque nos botões, KPIs e barras para ver animações de como cada item funciona.
                </span>
              ) : (
                'Ative esta opção para explorar o sistema com dicas visuais e conceitos de Gantt para leigos.'
              )}
            </p>
          </div>

          {/* Quick Gantt Concepts Accordion / Summary */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-ouro-400" />
              <span>Conceitos Essenciais de Gantt</span>
            </div>

            <div className="space-y-1.5 text-[11px] max-h-48 overflow-y-auto pr-1">
              <div className="p-2 rounded-lg bg-obsidian-950/70 border border-obsidian-800">
                <span className="font-bold text-carmim-400 block">Caminho Crítico (CPM):</span>
                <span className="text-slate-400 leading-tight block mt-0.5">
                  Sequência inadiável com folga zero. Se qualquer tarefa dessa cadeia atrasar 1 dia, o projeto todo atrasa 1 dia.
                </span>
              </div>

              <div className="p-2 rounded-lg bg-obsidian-950/70 border border-obsidian-800">
                <span className="font-bold text-safira-400 block">Encadeamento Finish-to-Start (FS):</span>
                <span className="text-slate-400 leading-tight block mt-0.5">
                  A tarefa seguinte inicia no próximo dia útil logo após o término da anterior.
                </span>
              </div>

              <div className="p-2 rounded-lg bg-obsidian-950/70 border border-obsidian-800">
                <span className="font-bold text-ouro-400 block">Marcos (Milestones):</span>
                <span className="text-slate-400 leading-tight block mt-0.5">
                  Pontos de entrega com duração zero (diamante na linha do tempo), sem consumo de esforço.
                </span>
              </div>

              <div className="p-2 rounded-lg bg-obsidian-950/70 border border-obsidian-800">
                <span className="font-bold text-esmeralda-400 block">Linha de Base (Baseline):</span>
                <span className="text-slate-400 leading-tight block mt-0.5">
                  Fotografia do cronograma aprovado, usada pelo simulador What-If para medir desvios de prazo.
                </span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Footer */}
          <div className="mt-3 pt-2.5 border-t border-obsidian-800 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-1 font-mono">
              <Command className="w-3 h-3 text-slate-500" />
              <span>Atalhos:</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="bg-obsidian-800 px-1.5 py-0.5 rounded text-slate-300">Ctrl+Z: Desfazer</span>
              <span className="bg-obsidian-800 px-1.5 py-0.5 rounded text-slate-300">Ctrl+P: Pitch</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
