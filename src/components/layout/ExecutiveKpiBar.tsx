import React from 'react';
import { useGantt } from '../../context/GanttContext';
import { formatBrDate } from '../../engine/calendar';
import { Calendar, Clock, AlertTriangle, Milestone, TrendingUp } from 'lucide-react';
import { GuidedTarget } from '../guided/GuidedTooltip';

export const ExecutiveKpiBar: React.FC = () => {
  const { kpis } = useGantt();

  return (
    <div className="bg-gantt-header border-b border-gantt-border px-4 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* KPI 1: Go-Live Previsto */}
        <GuidedTarget topicId="golive_kpi" className="w-full">
          <div className="w-full bg-gantt-card border border-gantt-border rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 shadow-gantt-card hover:bg-gantt-card-hover transition-all">
            <div className="flex items-center justify-center text-safira-400 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-cyan-400/80 uppercase tracking-wider block truncate">
                Go-Live Previsto
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm sm:text-base font-extrabold text-gantt-primary tracking-tight tabular-nums">
                  {formatBrDate(kpis.projectEndDate)}
                </span>
                {kpis.varianceDays !== 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      kpis.varianceDays > 0
                        ? 'bg-esmeralda-500/15 text-esmeralda-600 dark:text-esmeralda-400'
                        : 'bg-carmim-500/15 text-carmim-600 dark:text-carmim-400'
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
          <div className="w-full bg-gantt-card border border-gantt-border rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 shadow-gantt-card hover:bg-gantt-card-hover transition-all">
            <div className="flex items-center justify-center text-ouro-500 dark:text-ouro-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-cyan-400/80 uppercase tracking-wider block truncate">
                Duração de Projeto
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm sm:text-base font-extrabold text-gantt-primary tracking-tight tabular-nums">
                  {kpis.totalWorkDays}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">dias úteis</span>
              </div>
            </div>
          </div>
        </GuidedTarget>

        {/* KPI 3: Progresso Geral */}
        <div className="bg-gantt-card border border-gantt-border rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 shadow-gantt-card hover:bg-gantt-card-hover transition-all">
          <div className="flex items-center justify-center text-safira-500 dark:text-safira-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-cyan-400/80 uppercase tracking-wider block truncate">
                Conclusão Geral
              </span>
              <span className="text-xs font-extrabold text-gantt-primary tabular-nums">
                {kpis.overallProgress}%
              </span>
            </div>
            <div className="w-full bg-gantt-canvas rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-safira-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${kpis.overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: Gargalos no Caminho Crítico */}
        <GuidedTarget topicId="cpm_kpi" className="w-full">
          <div className="w-full bg-gantt-card border border-gantt-border rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 shadow-gantt-card hover:bg-gantt-card-hover transition-all">
            <div
              className={`flex items-center justify-center shrink-0 ${
                kpis.criticalPathCount > 0 ? 'text-carmim-500 dark:text-carmim-400' : 'text-slate-400'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-cyan-400/80 uppercase tracking-wider block truncate">
                Caminho Crítico
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={`text-sm sm:text-base font-extrabold tracking-tight tabular-nums ${
                    kpis.criticalPathCount > 0 ? 'text-carmim-600 dark:text-carmim-400' : 'text-gantt-primary'
                  }`}
                >
                  {kpis.criticalPathCount}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">folga zero</span>
              </div>
            </div>
          </div>
        </GuidedTarget>

        {/* KPI 5: Marcos Estratégicos */}
        <GuidedTarget topicId="milestones_kpi" className="w-full col-span-2 sm:col-span-1">
          <div className="w-full bg-gantt-card border border-gantt-border rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 shadow-gantt-card hover:bg-gantt-card-hover transition-all">
            <div className="flex items-center justify-center text-ouro-500 dark:text-ouro-400 shrink-0">
              <Milestone className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-cyan-400/80 uppercase tracking-wider block truncate">
                Marcos / Milestones
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm sm:text-base font-extrabold text-gantt-primary tracking-tight tabular-nums">
                  {kpis.milestonesCount}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">marcos</span>
              </div>
            </div>
          </div>
        </GuidedTarget>
      </div>
    </div>
  );
};
