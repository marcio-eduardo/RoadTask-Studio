import React, { useMemo } from 'react';
import { useGantt } from '../../context/GanttContext';
import { formatBrDate, parseDateUtc } from '../../engine/calendar';
import { RoadTaskLogo } from '../brand/RoadTaskLogo';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Milestone as MilestoneIcon,
  Flame,
  Check,
} from 'lucide-react';

export const ExecutivePrintReport: React.FC = () => {
  const { project, kpis } = useGantt();

  const milestones = useMemo(() => {
    return project.tasks.filter(t => t.isMilestone || t.type === 'milestone');
  }, [project.tasks]);

  // Cálculos de datas para a régua visual da timeline no PDF
  const { projectStartTs, totalTimelineSpan } = useMemo(() => {
    const s = parseDateUtc(kpis.projectStartDate || '2026-09-21').getTime();
    const e = parseDateUtc(kpis.projectEndDate || '2026-10-30').getTime();
    const span = Math.max(e - s, 24 * 60 * 60 * 1000);
    return { projectStartTs: s, totalTimelineSpan: span };
  }, [kpis.projectStartDate, kpis.projectEndDate]);

  const emissionDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="print-only hidden print:block bg-white text-slate-900 font-sans p-6 max-w-full print:p-0">
      {/* =========================================================================
          1. CABEÇALHO EXECUTIVO OFICIAL (A4 Landscape)
         ========================================================================= */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <RoadTaskLogo size="md" showText={true} />
          <div className="border-l-2 border-slate-300 pl-3">
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 block">
              Documentação Executiva & Relatório de Projeto
            </span>
            <h1 className="text-xl font-black text-slate-950 tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs font-semibold text-slate-600">
              {project.clientName || 'Diretoria Corporativa'} • Cronograma Oficial A4
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <div className="inline-block bg-slate-100 border border-slate-300 rounded px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase mb-1">
            Status:{' '}
            {kpis.overallProgress === 100
              ? 'Concluído'
              : kpis.varianceDays < 0
              ? 'Em Risco / Atraso'
              : 'No Prazo / Em Andamento'}
          </div>
          <p className="text-[11px] text-slate-600">
            <span className="font-bold">Emissão:</span> {emissionDate}
          </p>
          <p className="text-[11px] text-slate-500">
            <span className="font-bold">Unidade:</span>{' '}
            {project.timeUnit === 'days' ? 'Dias Úteis' : project.timeUnit}
          </p>
        </div>
      </div>

      {/* =========================================================================
          2. SCORECARDS DE KPIS EXECUTIVOS
         ========================================================================= */}
      <div className="grid grid-cols-5 gap-3 mb-6 print-break-avoid">
        {/* KPI 1: Go-Live */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
          <div className="flex items-center gap-1.5 text-slate-600 mb-1">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Go-Live Previsto
            </span>
          </div>
          <div className="text-base font-black text-slate-900 tabular-nums">
            {formatBrDate(kpis.projectEndDate)}
          </div>
          <div className="text-[10px] font-semibold mt-0.5">
            {kpis.varianceDays !== 0 ? (
              <span className={kpis.varianceDays > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                {kpis.varianceDays > 0
                  ? `+${kpis.varianceDays}d folga vs baseline`
                  : `${kpis.varianceDays}d atraso vs baseline`}
              </span>
            ) : (
              <span className="text-slate-500">Alinhado à baseline</span>
            )}
          </div>
        </div>

        {/* KPI 2: Duração Total */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
          <div className="flex items-center gap-1.5 text-slate-600 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Duração do Projeto
            </span>
          </div>
          <div className="text-base font-black text-slate-900 tabular-nums">
            {kpis.totalWorkDays}{' '}
            <span className="text-xs font-normal text-slate-600">dias úteis</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            {formatBrDate(kpis.projectStartDate, false)} até {formatBrDate(kpis.projectEndDate, false)}
          </div>
        </div>

        {/* KPI 3: Progresso Físico */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
          <div className="flex items-center gap-1.5 text-slate-600 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Progresso Físico
            </span>
          </div>
          <div className="text-base font-black text-slate-900 tabular-nums">
            {kpis.overallProgress}%
          </div>
          {/* Progress bar visual */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${kpis.overallProgress}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Atividades & Entregas */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
          <div className="flex items-center gap-1.5 text-slate-600 mb-1">
            <MilestoneIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Atividades / Marcos
            </span>
          </div>
          <div className="text-base font-black text-slate-900 tabular-nums">
            {kpis.totalTasks}{' '}
            <span className="text-xs font-normal text-slate-600">itens</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">
            {kpis.completedTasks} concluídos • {milestones.length} marcos
          </div>
        </div>

        {/* KPI 5: Caminho Crítico (CPM) */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
          <div className="flex items-center gap-1.5 text-slate-600 mb-1">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Caminho Crítico
            </span>
          </div>
          <div className="text-base font-black text-rose-700 tabular-nums">
            {kpis.criticalPathCount}{' '}
            <span className="text-xs font-normal text-slate-600">atividades</span>
          </div>
          <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
            Folga zero (Gargalos)
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. VISÃO GRÁFICA DA LINHA DO TEMPO (ROADMAP A4 LANDSCAPE)
         ========================================================================= */}
      <div className="mb-6 print-break-avoid">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Roadmap Visual & Linha do Tempo Executiva
          </h2>
          <span className="text-[10px] text-slate-500">
            Escala proporcional A4 ({formatBrDate(kpis.projectStartDate)} a {formatBrDate(kpis.projectEndDate)})
          </span>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/70">
          {/* Régua de datas */}
          <div className="flex justify-between border-b border-slate-300 pb-1 mb-2 text-[10px] font-bold text-slate-600">
            <span>Início: {formatBrDate(kpis.projectStartDate)}</span>
            <span>Meta: {formatBrDate(kpis.projectEndDate)}</span>
          </div>

          {/* Barras visuais proporcionais */}
          <div className="space-y-1.5">
            {project.tasks.map(task => {
              const startTs = parseDateUtc(task.startDate).getTime();
              const endTs = parseDateUtc(task.endDate).getTime();

              const leftPct = Math.max(0, Math.min(100, ((startTs - projectStartTs) / totalTimelineSpan) * 100));
              const widthPct = task.isMilestone
                ? 0
                : Math.max(1.5, Math.min(100 - leftPct, ((endTs - startTs + 24 * 60 * 60 * 1000) / totalTimelineSpan) * 100));

              return (
                <div key={task.id} className="flex items-center gap-2 text-xs">
                  <div className="w-48 shrink-0 truncate text-[11px] font-semibold text-slate-800">
                    {task.name}
                  </div>

                  <div className="flex-1 relative h-5 bg-slate-200/80 rounded border border-slate-300/80">
                    {task.isMilestone ? (
                      <div
                        style={{ left: `${leftPct}%` }}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-amber-500 rotate-45 border border-amber-700 shadow-sm"
                        title={`Marco: ${task.name}`}
                      />
                    ) : (
                      <div
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          backgroundColor: task.color || '#0284C7',
                        }}
                        className={`absolute top-0 bottom-0 rounded flex items-center px-1 text-[9px] font-bold text-white truncate ${
                          task.isCritical ? 'ring-1 ring-rose-600 ring-offset-1' : ''
                        }`}
                      >
                        {task.progress > 0 && (
                          <div
                            style={{ width: `${task.progress}%` }}
                            className="absolute left-0 top-0 bottom-0 bg-black/20 rounded-l"
                          />
                        )}
                        <span className="relative z-10 truncate drop-shadow">
                          {task.duration}d {task.progress > 0 ? `(${task.progress}%)` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. TABELA EAP / WBS (WORK BREAKDOWN STRUCTURE)
         ========================================================================= */}
      <div className="mb-6 print-break-avoid">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
          Estrutura Analítica do Projeto (EAP / WBS)
        </h2>

        <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold uppercase text-[9.5px]">
              <th className="py-1.5 px-2 border-r border-slate-300 w-12">ID</th>
              <th className="py-1.5 px-2 border-r border-slate-300">Atividade / Entrega</th>
              <th className="py-1.5 px-2 border-r border-slate-300 w-20">Tipo</th>
              <th className="py-1.5 px-2 border-r border-slate-300 w-20">Início</th>
              <th className="py-1.5 px-2 border-r border-slate-300 w-20">Término</th>
              <th className="py-1.5 px-2 border-r border-slate-300 w-16 text-center">Duração</th>
              <th className="py-1.5 px-2 border-r border-slate-300 w-24">Progresso</th>
              <th className="py-1.5 px-2 border-r border-slate-300 w-28">Responsável</th>
              <th className="py-1.5 px-2 w-16 text-center">Crítico</th>
            </tr>
          </thead>
          <tbody>
            {project.tasks.map((t, idx) => (
              <tr
                key={t.id}
                className={`border-b border-slate-200 ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                } ${t.isCritical ? 'font-semibold text-slate-950' : 'text-slate-800'}`}
              >
                <td className="py-1.5 px-2 border-r border-slate-200 font-mono text-[10px] text-slate-500">
                  #{idx + 1}
                </td>
                <td className="py-1.5 px-2 border-r border-slate-200">
                  <div className="flex items-center gap-1.5">
                    {t.isMilestone && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                    <span>{t.name}</span>
                  </div>
                </td>
                <td className="py-1.5 px-2 border-r border-slate-200 capitalize text-slate-600">
                  {t.type}
                </td>
                <td className="py-1.5 px-2 border-r border-slate-200 tabular-nums">
                  {formatBrDate(t.startDate)}
                </td>
                <td className="py-1.5 px-2 border-r border-slate-200 tabular-nums">
                  {formatBrDate(t.endDate)}
                </td>
                <td className="py-1.5 px-2 border-r border-slate-200 text-center tabular-nums">
                  {t.duration}d
                </td>
                <td className="py-1.5 px-2 border-r border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden shrink-0">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${t.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] tabular-nums font-semibold">{t.progress}%</span>
                  </div>
                </td>
                <td className="py-1.5 px-2 border-r border-slate-200 text-slate-600 truncate">
                  {t.assignee || '-'}
                </td>
                <td className="py-1.5 px-2 text-center">
                  {t.isCritical ? (
                    <span className="bg-rose-100 text-rose-700 px-1 py-0.5 rounded text-[9px] font-bold">
                      SIM
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px]">Não</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================================================================
          5. QUADRO DE MARCOS ESTRATÉGICOS (MILESTONES)
         ========================================================================= */}
      {milestones.length > 0 && (
        <div className="mb-6 print-break-avoid">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
            Marcos Estratégicos & Entregas-Chave
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {milestones.map(m => (
              <div
                key={m.id}
                className="border border-slate-200 rounded p-2 flex items-center justify-between bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rotate-45 bg-amber-500 rounded-xs flex items-center justify-center text-white shrink-0">
                    <Check className="w-2 h-2 -rotate-45" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{m.name}</span>
                    <span className="text-[10px] text-slate-500">
                      Responsável: {m.assignee || 'Diretoria'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 block tabular-nums">
                    {formatBrDate(m.startDate)}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      m.progress === 100
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {m.progress === 100 ? 'CONCLUÍDO' : 'PENDENTE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          6. RODAPÉ FORMAL E ASSINATURAS DE VALIDAÇÃO
         ========================================================================= */}
      <div className="pt-4 border-t-2 border-slate-300 text-xs print-break-avoid">
        <div className="grid grid-cols-2 gap-8 mb-6 mt-4">
          <div className="border-t border-slate-400 pt-2 text-center">
            <p className="font-bold text-slate-800">Patrocinador do Projeto (Project Sponsor)</p>
            <p className="text-[10px] text-slate-500">Assinatura / Aprovação C-Level</p>
          </div>
          <div className="border-t border-slate-400 pt-2 text-center">
            <p className="font-bold text-slate-800">Líder Técnico / Gerente de Projetos</p>
            <p className="text-[10px] text-slate-500">Validação de Escopo e Prazos</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>
            Gerado por <strong>RoadTask Studio</strong> • Executive Timeline & Gantt Engine
          </span>
          <span>Documento confidencial para uso interno corporativo</span>
        </div>
      </div>
    </div>
  );
};
