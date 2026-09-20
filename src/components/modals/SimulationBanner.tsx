import React from 'react';
import { useGantt } from '../../context/GanttContext';
import { Sliders, Check, X, AlertTriangle } from 'lucide-react';

export const SimulationBanner: React.FC = () => {
  const { simulation, applySimulation, discardSimulation } = useGantt();

  if (!simulation.isActive) return null;

  const isDelayed = simulation.activeImpactDays > 0;

  return (
    <div className="bg-gradient-to-r from-ouro-600/90 via-ouro-500/90 to-amber-600/90 text-obsidian-950 px-4 py-2.5 shadow-glow-ouro sticky top-14 z-30 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-obsidian-950/20 flex items-center justify-center shrink-0">
          <Sliders className="w-4 h-4 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm uppercase tracking-wider">
              Simulador "What-If" em Tempo Real
            </span>
            <span className="text-[10px] bg-obsidian-950 text-ouro-400 font-bold px-2 py-0.5 rounded-full">
              Ao Vivo
            </span>
          </div>
          <p className="text-xs font-medium text-obsidian-900/90">
            Arraste barras no gráfico para testar impactos. A Linha de Base (Baseline) original está pontilhada.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {simulation.activeImpactDays !== 0 ? (
          <div className="flex items-center gap-1.5 bg-obsidian-950 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
            <AlertTriangle className={`w-3.5 h-3.5 ${isDelayed ? 'text-carmim-400' : 'text-esmeralda-400'}`} />
            <span>Impacto no Go-Live:</span>
            <span className={isDelayed ? 'text-carmim-400' : 'text-esmeralda-400'}>
              {isDelayed ? `+${simulation.activeImpactDays} dias úteis` : `${simulation.activeImpactDays} dias úteis`}
            </span>
          </div>
        ) : (
          <span className="text-xs font-semibold bg-obsidian-950/20 px-2.5 py-1 rounded-lg">
            Nenhum desvio em relação à base
          </span>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={applySimulation}
            className="flex items-center gap-1 bg-obsidian-950 hover:bg-obsidian-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow cursor-pointer transition-all"
            title="Adotar estas datas como novo cronograma oficial"
          >
            <Check className="w-3.5 h-3.5 text-esmeralda-400" />
            <span>Efetivar</span>
          </button>
          <button
            type="button"
            onClick={discardSimulation}
            className="flex items-center gap-1 bg-obsidian-950/30 hover:bg-obsidian-950/50 text-obsidian-950 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-all"
            title="Descartar simulação e restaurar datas anteriores"
          >
            <X className="w-3.5 h-3.5" />
            <span>Descartar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
