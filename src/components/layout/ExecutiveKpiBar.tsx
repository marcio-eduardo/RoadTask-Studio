import React from 'react';
import { useGantt } from '../../context/GanttContext';
import { formatBrDate } from '../../engine/calendar';
import { Calendar, Clock, AlertTriangle, Milestone, TrendingUp } from 'lucide-react';
import { GuidedTarget } from '../guided/GuidedTooltip';

export const ExecutiveKpiBar: React.FC = () => {
  const { kpis } = useGantt();

  return (
    <div className="bg-obsidian-900/80 backdrop-blur border-b border-obsidian-800 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* KPI 1: Go-Live Previsto */}
        <GuidedTarget topicId="golive_kpi" className="w-full">
          <div className="w-full bg-obsidian-850/90 border border-obsidian-750/70 rounded-xl p-2.5 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-safira-500/10 border border-safira-500/20 flex items-center justify-center text-safira-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block truncate">
                Go-Live Previsto
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight tabular-nums">
                  {formatBrDate(kpis.projectEndDate)}
                </span>
                {kpis.varianceDays !== 0 && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      kpis.varianceDays > 0
                        ? 'bg-esmeralda-500/20 text-esmeralda-400'
                        : 'bg-carmim-500/20 text-carmim-400'
                    }`}
                  >
                    {kpis.varianceDays > 0 ? `+${kpis.varianceDays}d folga` : `${kpis.varianceDays}d atraso`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </GuidedTarget>

        {/* KPI 2: Duração Total Útil */}
        <GuidedTarget topicId="duration_kpi" className="w-full">
          <div className="w-full bg-obsidian-850/90 border border-obsidian-750/70 rounded-xl p-2.5 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-ouro-500/10 border border-ouro-500/20 flex items-center justify-center text-ouro-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block truncate">
                Duração de Projeto
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight tabular-nums">
                  {kpis.totalWorkDays}
                </span>
                <span className="text-xs text-slate-400">dias úteis</span>
              </div>
            </div>
          </div>
        </GuidedTarget>

        {/* KPI 3: Progresso Geral */}
        <div className="bg-obsidian-850/90 border border-obsidian-750/70 rounded-xl p-2.5 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-esmeralda-500/10 border border-esmeralda-500/20 flex items-center justify-center text-esmeralda-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block truncate">
                Conclusão Geral
              </span>
              <span className="text-xs font-bold text-esmeralda-400 tabular-nums">
                {kpis.overallProgress}%
              </span>
            </div>
            <div className="w-full bg-obsidian-950 rounded-full h-1.5 overflow-hidden border border-obsidian-750">
              <div
                className="bg-gradient-to-r from-safira-500 to-esmeralda-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${kpis.overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: Gargalos no Caminho Crítico */}
        <GuidedTarget topicId="cpm_kpi" className="w-full">
          <div className="w-full bg-obsidian-850/90 border border-obsidian-750/70 rounded-xl p-2.5 flex items-center gap-3 shadow-sm">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                kpis.criticalPathCount > 0
                  ? 'bg-carmim-500/15 border border-carmim-500/30 text-carmim-400'
                  : 'bg-slate-800/40 border border-slate-700/40 text-slate-500'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block truncate">
                Caminho Crítico
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-sm sm:text-base font-bold tracking-tight tabular-nums ${
                    kpis.criticalPathCount > 0 ? 'text-carmim-400' : 'text-slate-300'
                  }`}
                >
                  {kpis.criticalPathCount}
                </span>
                <span className="text-xs text-slate-400">folga zero</span>
              </div>
            </div>
          </div>
        </GuidedTarget>

        {/* KPI 5: Marcos Estratégicos */}
        <GuidedTarget topicId="milestones_kpi" className="w-full col-span-2 sm:col-span-1">
          <div className="w-full bg-obsidian-850/90 border border-obsidian-750/70 rounded-xl p-2.5 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-ouro-400/10 border border-ouro-400/20 flex items-center justify-center text-ouro-400 shrink-0">
              <Milestone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block truncate">
                Marcos / Milestones
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight tabular-nums">
                  {kpis.milestonesCount}
                </span>
                <span className="text-xs text-slate-400">marcos de entrega</span>
              </div>
            </div>
          </div>
        </GuidedTarget>
      </div>
    </div>
  );
};
