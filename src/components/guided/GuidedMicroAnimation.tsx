import React from 'react';
import { GuidedAnimationType } from '../../context/GuidedAccessContext';

interface GuidedMicroAnimationProps {
  type: GuidedAnimationType;
}

export const GuidedMicroAnimation: React.FC<GuidedMicroAnimationProps> = ({ type }) => {
  return (
    <div className="w-full h-28 bg-obsidian-950/90 rounded-xl border border-obsidian-800/80 p-2.5 flex items-center justify-center relative overflow-hidden select-none">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* 1. Critical Path Animation */}
      {type === 'critical-path' && (
        <div className="w-full flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Tarefa 1 (Normal)</span>
            <span className="text-esmeralda-400 font-bold">Folga: 4d</span>
          </div>
          <div className="h-2.5 w-3/5 bg-safira-600 rounded-full" />

          <div className="flex items-center justify-between text-[10px] text-carmim-400 font-mono font-bold mt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-carmim-500 animate-ping inline-block" />
              Caminho Crítico (Gargalo)
            </span>
            <span>Folga: 0d</span>
          </div>
          <div className="h-3 w-4/5 bg-gradient-to-r from-carmim-600 via-carmim-500 to-carmim-400 rounded-full shadow-glow-carmim animate-pulse" />
        </div>
      )}

      {/* 2. Chain Finish-to-Start Animation */}
      {type === 'chain' && (
        <div className="w-full flex flex-col gap-3 relative z-10 px-2">
          {/* Bar A */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-28 bg-safira-500 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
              Tarefa A
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Término</span>
          </div>

          {/* Animated Connecting Line */}
          <div className="relative h-4 flex items-center pl-24">
            <div className="w-16 h-0.5 bg-gradient-to-r from-safira-400 to-safira-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/80 animate-[moveRight_1.5s_infinite]" />
            </div>
            <div className="w-2 h-2 border-t-2 border-r-2 border-safira-300 rotate-45 -ml-1" />
            <span className="ml-2 text-[9px] font-mono text-safira-300 font-bold">FS (Próximo Dia Útil)</span>
          </div>

          {/* Bar B */}
          <div className="flex items-center gap-2 pl-24">
            <div className="h-3 w-32 bg-indigo-500 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shadow-sm animate-pulse">
              Tarefa B (Encadeada)
            </div>
          </div>
        </div>
      )}

      {/* 3. Tap-and-Build Duration Animation */}
      {type === 'tap-build' && (
        <div className="w-full flex flex-col items-center justify-center gap-2 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-obsidian-850 text-slate-400 text-[10px] font-mono">1d</span>
            <span className="px-2 py-0.5 rounded-md bg-obsidian-850 text-slate-400 text-[10px] font-mono">3d</span>
            <span className="px-2.5 py-0.5 rounded-md bg-safira-500 text-white font-bold text-[10px] font-mono shadow-glow-safira animate-bounce">
              10d (2 sem)
            </span>
          </div>
          <div className="w-48 h-3.5 bg-obsidian-850 rounded-lg border border-obsidian-750 p-0.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-safira-500 to-indigo-500 rounded animate-[growBar_2s_infinite]" />
          </div>
          <span className="text-[10px] text-slate-300 font-medium">Toque único = Barra gerada na escala</span>
        </div>
      )}

      {/* 4. What-If Simulation Animation */}
      {type === 'whatif' && (
        <div className="w-full flex flex-col gap-2 relative z-10 px-2">
          {/* Baseline */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-mono">Linha de Base (Original)</span>
            <span className="text-slate-400 font-mono">Meta: 15/Nov</span>
          </div>
          <div className="h-2.5 w-3/5 border border-dashed border-slate-400/80 bg-slate-500/20 rounded-md" />

          {/* Simulated */}
          <div className="flex items-center justify-between text-[10px] mt-1">
            <span className="text-ouro-400 font-bold flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-ouro-500" />
              Simulação +4d Atraso
            </span>
            <span className="text-ouro-300 font-bold font-mono">Impacto: 19/Nov</span>
          </div>
          <div className="h-3 w-4/5 bg-gradient-to-r from-ouro-500 to-ouro-600 rounded-md shadow-glow-ouro animate-pulse" />
        </div>
      )}

      {/* 5. Milestone Golden Diamond Animation */}
      {type === 'milestone' && (
        <div className="w-full flex items-center justify-center gap-4 relative z-10">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 bg-gradient-to-tr from-ouro-600 via-ouro-400 to-ouro-300 rotate-45 rounded-sm shadow-glow-ouro animate-[spinPulse_4s_infinite]" />
            <div className="w-1 h-6 bg-ouro-500/50 mt-1" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-ouro-400 tracking-wide uppercase">Marco Executivo</span>
            <span className="text-[11px] text-slate-300 font-mono">Virada de Fase / Homologação</span>
            <span className="text-[9px] text-slate-400 mt-0.5 font-mono">Duração zero (Dia do evento)</span>
          </div>
        </div>
      )}

      {/* 6. View Switch Animation */}
      {type === 'view-switch' && (
        <div className="w-full flex items-center justify-center gap-3 relative z-10">
          <div className="p-2 rounded-lg bg-safira-500/20 border border-safira-500/40 text-safira-400 flex flex-col items-center gap-1">
            <div className="w-8 h-1.5 bg-safira-400 rounded-full" />
            <div className="w-6 h-1.5 bg-safira-400/60 rounded-full" />
            <span className="text-[8px] font-bold mt-0.5">Gantt</span>
          </div>
          <span className="text-slate-500 text-xs font-bold">⇄</span>
          <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex flex-col items-center gap-1">
            <div className="w-4 h-3 bg-indigo-400/80 rounded" />
            <span className="text-[8px] font-bold mt-0.5">Cards</span>
          </div>
          <span className="text-slate-500 text-xs font-bold">⇄</span>
          <div className="p-2 rounded-lg bg-esmeralda-500/20 border border-esmeralda-500/40 text-esmeralda-400 flex flex-col items-center gap-1">
            <div className="w-7 h-0.5 bg-esmeralda-400" />
            <div className="w-7 h-0.5 bg-esmeralda-400/60" />
            <span className="text-[8px] font-bold mt-0.5">Tabela</span>
          </div>
        </div>
      )}

      {/* 7. Go-Live Calendar Animation */}
      {type === 'golive' && (
        <div className="w-full flex items-center justify-center gap-3 relative z-10">
          <div className="w-12 h-14 bg-obsidian-900 border border-safira-500/50 rounded-xl flex flex-col items-center overflow-hidden shadow-glow-safira">
            <div className="w-full bg-safira-600 text-white text-[9px] font-bold py-0.5 text-center">NOV</div>
            <div className="flex-1 flex items-center justify-center text-base font-extrabold text-white">24</div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-white">Entrega Final Garantida</span>
            <span className="text-[10px] text-esmeralda-400 font-semibold font-mono">100% Dias Úteis SP</span>
            <span className="text-[9px] text-slate-400">Recalculado instantaneamente</span>
          </div>
        </div>
      )}

      {/* 8. Pitch Mode Animation */}
      {type === 'pitch' && (
        <div className="w-full flex items-center justify-center gap-3 relative z-10">
          <div className="w-24 h-14 bg-gradient-to-br from-obsidian-900 to-obsidian-850 border border-ouro-500/60 rounded-lg p-1.5 flex flex-col justify-between shadow-glow-ouro">
            <div className="w-full flex justify-between items-center text-[7px] text-ouro-400 font-bold">
              <span>BOARD PITCH</span>
              <span>100%</span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-ouro-500/80 rounded" />
              <div className="w-3/4 h-1 bg-safira-400/80 rounded" />
            </div>
            <div className="text-[7px] text-slate-400 text-right">Diretoria</div>
          </div>
          <div className="text-[10px] text-slate-300 font-medium leading-tight">
            Tela limpa de alta densidade para projetores e C-Level.
          </div>
        </div>
      )}

      <style>{`
        @keyframes moveRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes growBar {
          0% { width: 10%; }
          50% { width: 100%; }
          100% { width: 10%; }
        }
        @keyframes spinPulse {
          0% { transform: rotate(45deg) scale(0.95); }
          50% { transform: rotate(45deg) scale(1.15); }
          100% { transform: rotate(45deg) scale(0.95); }
        }
      `}</style>
    </div>
  );
};
