import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useGantt } from '../../context/GanttContext';
import { Task, isEpic, getTaskEpicId, getTaskSubtasks } from '../../types/gantt';
import {
  parseDateUtc,
  formatDateUtc,
  formatBrDate,
  getDayOfWeekBr,
  isWorkDay,
  getDateRange,
} from '../../engine/calendar';
import {
  Diamond,
  Flame,
  Sparkles,
  MessageSquareText,
  Zap,
  CheckSquare,
  Plus,
} from 'lucide-react';
import { EpicModal } from '../modals/EpicModal';

interface GanttTimelineViewProps {
  onSelectTask?: (task: Task) => void;
}

interface PhaseSection {
  id: string;
  name: string;
  shortName: string;
  subtitle?: string;
  color?: string;
  tasks: Task[];
  startIndex: number;
  rowCount: number;
  topY: number;
  height: number;
}

export const GanttTimelineView: React.FC<GanttTimelineViewProps> = ({ onSelectTask }) => {
  const {
    project,
    zoomLevel,
    selectedTaskId,
    setSelectedTaskId,
    moveTaskDate,
    resizeTaskDuration,
    updateTaskProgress,
    simulation,
    addTask,
  } = useGantt();

  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
  const [selectedEpicToEdit, setSelectedEpicToEdit] = useState<Task | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Column width based on zoom
  const colWidth = useMemo(() => {
    switch (zoomLevel) {
      case 'day':
        return 48; // Generous touch target
      case 'week':
        return 28;
      case 'month':
        return 14;
      default:
        return 48;
    }
  }, [zoomLevel]);

  // Sprints defined in the project sorted by start date
  const sprints = useMemo(() => {
    return project.tasks
      .filter(t => t.type === 'sprint')
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [project.tasks]);

  const rowHeight = 52; // 52px per task row for great touch ergonomics
  const monthHeaderHeight = 24;
  const sprintHeaderHeight = sprints.length > 0 ? 42 : 0;
  const dayHeaderHeight = 36;
  const headerHeight = monthHeaderHeight + sprintHeaderHeight + dayHeaderHeight;
  const phaseColWidth = 140; // Width of sticky left phase swimlane column

  // Group tasks by epic/phase and build displayTasks (excluding summary epic bars and sprints from timeline rows)
  const { phaseSections, displayTasks } = useMemo(() => {
    const phases = project.tasks.filter(isEpic);
    const sections: PhaseSection[] = [];
    const flatDisplay: Task[] = [];
    let currentIndex = 0;

    if (phases.length > 0) {
      for (const ph of phases) {
        const children = project.tasks.filter(
          t => (t.phaseId === ph.id || t.epicId === ph.id) && !isEpic(t) && t.type !== 'sprint'
        );
        const rawName = ph.name;
        const parts = rawName.split(':');
        const shortName = parts[0].trim();
        const subtitle = parts.length > 1 ? parts.slice(1).join(':').trim() : (ph.notes || undefined);

        if (children.length > 0) {
          sections.push({
            id: ph.id,
            name: ph.name,
            shortName,
            subtitle,
            color: ph.color,
            tasks: children,
            startIndex: currentIndex,
            rowCount: children.length,
            topY: headerHeight + currentIndex * rowHeight,
            height: children.length * rowHeight,
          });

          flatDisplay.push(...children);
          currentIndex += children.length;
        } else {
          // Épico recém-criado ou sem histórias: Renderiza 1 linha de placeholder com botão '+ Adicionar História'
          const emptyPlaceholderTask: Task = {
            id: `empty_epic_${ph.id}`,
            name: `+ Adicionar História em ${shortName}`,
            type: 'story',
            phaseId: ph.id,
            epicId: ph.id,
            startDate: ph.startDate || new Date().toISOString().split('T')[0],
            duration: 1,
            endDate: ph.startDate || new Date().toISOString().split('T')[0],
            progress: 0,
            dependencies: [],
            color: ph.color,
          };

          sections.push({
            id: ph.id,
            name: ph.name,
            shortName,
            subtitle,
            color: ph.color,
            tasks: [emptyPlaceholderTask],
            startIndex: currentIndex,
            rowCount: 1,
            topY: headerHeight + currentIndex * rowHeight,
            height: rowHeight,
          });

          flatDisplay.push(emptyPlaceholderTask);
          currentIndex += 1;
        }
      }

      // Tasks without an epic (or milestones not assigned to an epic), excluding sprints
      const unassigned = project.tasks.filter(
        t => !isEpic(t) && t.type !== 'sprint' && (!getTaskEpicId(t) || !phases.some(p => p.id === getTaskEpicId(t)))
      );
      if (unassigned.length > 0) {
        sections.push({
          id: 'sec_unassigned',
          name: 'Marcos & Entregas',
          shortName: 'Marcos',
          subtitle: 'Entregas & Finalizações',
          color: '#FBBF24',
          tasks: unassigned,
          startIndex: currentIndex,
          rowCount: unassigned.length,
          topY: headerHeight + currentIndex * rowHeight,
          height: unassigned.length * rowHeight,
        });

        flatDisplay.push(...unassigned);
        currentIndex += unassigned.length;
      }
    } else {
      // No phases defined: flat list of all non-phase and non-sprint tasks
      const nonPhases = project.tasks.filter(t => t.type !== 'phase' && t.type !== 'sprint');
      const allTasks = nonPhases.length > 0 ? nonPhases : project.tasks.filter(t => t.type !== 'sprint');
      if (allTasks.length > 0) {
        sections.push({
          id: 'sec_all',
          name: 'Cronograma',
          shortName: 'Cronograma',
          color: '#0284C7',
          tasks: allTasks,
          startIndex: 0,
          rowCount: allTasks.length,
          topY: headerHeight,
          height: allTasks.length * rowHeight,
        });
        flatDisplay.push(...allTasks);
      }
    }

    return { phaseSections: sections, displayTasks: flatDisplay };
  }, [project.tasks, headerHeight]);

  // Determine timeline date boundaries using all project tasks (including sprints)
  const { timelineDates, minDateStr } = useMemo(() => {
    const tasks = project.tasks.length > 0 ? project.tasks : displayTasks;
    if (tasks.length === 0) {
      const today = new Date();
      const minDateObj = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
      const maxDateObj = new Date(today.getTime() + 27 * 24 * 60 * 60 * 1000);
      const minStr = formatDateUtc(minDateObj);
      const maxStr = formatDateUtc(maxDateObj);
      return {
        timelineDates: getDateRange(minStr, maxStr),
        minDateStr: minStr,
      };
    }

    let min = tasks[0].startDate;
    let max = tasks[0].endDate;

    for (const t of tasks) {
      if (t.startDate < min) min = t.startDate;
      if (t.endDate > max) max = t.endDate;
    }

    // Add buffer of 5 days before and 25 days after
    const minDateObj = new Date(parseDateUtc(min).getTime() - 5 * 24 * 60 * 60 * 1000);
    const maxDateObj = new Date(parseDateUtc(max).getTime() + 25 * 24 * 60 * 60 * 1000);

    const minStr = formatDateUtc(minDateObj);
    const maxStr = formatDateUtc(maxDateObj);

    return {
      timelineDates: getDateRange(minStr, maxStr),
      minDateStr: minStr,
    };
  }, [displayTasks, project.tasks]);

  const minDateTimestamp = useMemo(() => {
    return parseDateUtc(minDateStr).getTime();
  }, [minDateStr]);

  // Helper to get X position for a given date
  const getXForDate = (dateStr: string) => {
    const dateTs = parseDateUtc(dateStr).getTime();
    const diffDays = Math.round((dateTs - minDateTimestamp) / (24 * 60 * 60 * 1000));
    return diffDays * colWidth;
  };

  const todayStr = useMemo(() => formatDateUtc(new Date()), []);
  const todayX = useMemo(() => getXForDate(todayStr), [todayStr, minDateTimestamp, colWidth]);

  // Group timelineDates into contiguous month blocks for the top month bar
  const monthBlocks = useMemo(() => {
    const blocks: {
      key: string;
      label: string;
      daysCount: number;
      width: number;
      startX: number;
      endX: number;
      isCurrentMonth: boolean;
    }[] = [];
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    let currentX = 0;
    for (const dateStr of timelineDates) {
      const [y, m] = dateStr.split('-');
      const key = `${y}-${m}`;
      const lastBlock = blocks[blocks.length - 1];

      if (lastBlock && lastBlock.key === key) {
        lastBlock.daysCount += 1;
        lastBlock.width += colWidth;
        lastBlock.endX += colWidth;
        if (dateStr === todayStr) {
          lastBlock.isCurrentMonth = true;
        }
      } else {
        const monthIdx = parseInt(m, 10) - 1;
        const label = `${monthNames[monthIdx] || ''} ${y}`.toUpperCase();
        const startX = currentX;
        const width = colWidth;
        blocks.push({
          key,
          label,
          daysCount: 1,
          width,
          startX,
          endX: startX + width,
          isCurrentMonth: dateStr === todayStr,
        });
      }
      currentX += colWidth;
    }

    return blocks;
  }, [timelineDates, colWidth, todayStr]);

  // Dragging / Resizing State (hybrid mouse and touch)
  const [dragState, setDragState] = useState<{
    mode: 'move' | 'resize-end' | 'progress';
    taskId: string;
    startX: number;
    initialStartDate: string;
    initialDuration: number;
    initialProgress: number;
  } | null>(null);

  // Handle Drag Move (both Mouse and Touch)
  useEffect(() => {
    const handleMove = (clientX: number) => {
      if (!dragState) return;
      const deltaX = clientX - dragState.startX;
      const daysDelta = Math.round(deltaX / colWidth);

      if (dragState.mode === 'move') {
        const initTs = parseDateUtc(dragState.initialStartDate).getTime();
        const newDate = formatDateUtc(new Date(initTs + daysDelta * 24 * 60 * 60 * 1000));
        moveTaskDate(dragState.taskId, newDate);
      } else if (dragState.mode === 'resize-end') {
        const newDur = Math.max(1, dragState.initialDuration + daysDelta);
        resizeTaskDuration(dragState.taskId, newDur);
      } else if (dragState.mode === 'progress') {
        const task = project.tasks.find(t => t.id === dragState.taskId);
        if (task) {
          const taskWidth = Math.max(1, task.duration * colWidth);
          const progressDelta = (deltaX / taskWidth) * 100;
          const newProgress = Math.min(100, Math.max(0, Math.round(dragState.initialProgress + progressDelta)));
          updateTaskProgress(dragState.taskId, newProgress);
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (dragState) {
        // Bloqueia a rolagem nativa da tela/canvas enquanto um bloco está em arraste ativo
        e.preventDefault();
      }
      if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setDragState(null);
    };

    if (dragState) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', handleEnd);
      // passive: false é obrigatório para permitir e.preventDefault() cancelando o scroll do browser
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [dragState, colWidth, moveTaskDate, resizeTaskDuration, updateTaskProgress, project.tasks]);

  const totalWidth = timelineDates.length * colWidth;
  const totalHeight = Math.max(450, headerHeight + displayTasks.length * rowHeight + 40);

  return (
    <div className="flex-1 flex flex-col bg-gantt-canvas overflow-hidden relative select-none transition-colors duration-200">
      {/* Scrollable Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gantt-border scrollbar-track-gantt-canvas"
      >
        <div
          style={{
            width: Math.max(totalWidth + phaseColWidth, 1000),
            height: totalHeight,
          }}
          className="flex relative"
        >
          {/* Left Sticky Phase Swimlane Column (Sempre visível para organização estrutural do projeto) */}
          <div
            style={{ width: phaseColWidth }}
            className="sticky left-0 z-30 shrink-0 bg-gantt-card/95 backdrop-blur-md border-r border-gantt-border flex flex-col shadow-lg transition-colors select-none"
          >
            {/* Sticky Top Header Cell for Phases (3-tier aligned) */}
            <div
              style={{ height: headerHeight }}
              className="sticky top-0 z-40 bg-gantt-header border-b border-gantt-border flex flex-col justify-between p-2.5 transition-colors select-none"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-black uppercase tracking-wider text-gantt-text-secondary">
                  Cronograma
                </span>
                <span className="text-[9px] text-gantt-text-muted font-semibold">
                  Ágil
                </span>
              </div>

              {sprints.length > 0 && (
                <div className="flex items-center justify-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/40 border border-purple-500/30 text-purple-300">
                  <Zap className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="text-[9.5px] font-black uppercase tracking-wider truncate">
                    {sprints.length} {sprints.length === 1 ? 'Sprint' : 'Sprints'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between w-full">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-gantt-text-primary">
                  Épicos
                </span>
                <button
                  id="btn-novo-epico"
                  type="button"
                  onClick={() => {
                    setSelectedEpicToEdit(null);
                    setIsEpicModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-safira-600/20 hover:bg-safira-600 text-safira-400 hover:text-white border border-safira-500/30 text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                  title="Criar Novo Épico (Swimlane)"
                >
                  <Plus className="w-3 h-3" />
                  <span>Novo</span>
                </button>
              </div>
            </div>

            {/* Empty State when project has no Epics yet */}
            {phaseSections.length === 0 ? (
              <div className="p-2 flex-1 flex flex-col items-center justify-start pt-4">
                <button
                  id="btn-criar-primeiro-epico"
                  type="button"
                  onClick={() => {
                    setSelectedEpicToEdit(null);
                    setIsEpicModalOpen(true);
                  }}
                  className="w-full p-3 rounded-2xl border-2 border-dashed border-safira-500/40 hover:border-safira-500 bg-safira-500/5 hover:bg-safira-500/10 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                  title="Clique para criar seu primeiro Épico e estruturar o cronograma"
                >
                  <div className="w-8 h-8 rounded-xl bg-safira-500/20 text-safira-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-safira-400 group-hover:text-safira-300">
                    + Criar Épico
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                    Agrupar histórias em Swimlanes
                  </span>
                </button>
              </div>
            ) : (
              /* Section Swimlane Cells */
              phaseSections.map(sec => {
                const isEmpty = sec.tasks.some(t => t.id.startsWith('empty_epic_'));
                return (
                  <div
                    key={sec.id}
                    onClick={() => {
                      const foundEpic = project.tasks.find(t => t.id === sec.id && isEpic(t));
                      if (foundEpic) {
                        setSelectedEpicToEdit(foundEpic);
                        setIsEpicModalOpen(true);
                      }
                    }}
                    style={{
                      height: sec.height,
                      background: sec.color
                        ? `linear-gradient(90deg, ${sec.color}18 0%, transparent 100%)`
                        : undefined,
                    }}
                    title={sec.subtitle ? `${sec.name} - ${sec.subtitle} (Clique para editar)` : `${sec.name} (Clique para editar)`}
                    className="border-b border-gantt-border flex flex-col items-center justify-center px-2 text-center relative select-none overflow-hidden transition-all cursor-pointer hover:bg-gantt-card-hover group"
                  >
                    {/* Left accent bar with section color */}
                    <div
                      className="absolute left-0 top-1.5 bottom-1.5 w-1.5 rounded-r shadow-xs group-hover:w-2.5 transition-all"
                      style={{ backgroundColor: sec.color || 'var(--gantt-phase-1-accent)' }}
                    />
                    <span className="text-xs font-black text-gantt-text-primary uppercase tracking-wider truncate max-w-full group-hover:text-safira-400 transition-colors">
                      {sec.shortName}
                    </span>
                    {sec.height >= 60 && sec.subtitle && (
                      <span className="text-[10px] text-gantt-text-secondary mt-0.5 line-clamp-2 leading-tight">
                        {sec.subtitle}
                      </span>
                    )}
                    <span
                      className="text-[9px] font-bold mt-1 px-2 py-0.5 rounded-md border shrink-0 transition-colors"
                      style={{
                        backgroundColor: sec.color ? `${sec.color}18` : 'rgba(8, 145, 178, 0.12)',
                        borderColor: sec.color ? `${sec.color}35` : 'rgba(8, 145, 178, 0.25)',
                        color: sec.color || 'var(--gantt-accent-focus)',
                      }}
                    >
                      {isEmpty ? '0 itens' : `${sec.rowCount} ${sec.rowCount === 1 ? 'item' : 'itens'}`}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Timeline Canvas (Dates, Grid, Dependency Curves & Task Bars) */}
          <div
            style={{ width: Math.max(totalWidth, 1000), height: totalHeight }}
            className="relative flex-1"
          >
            {/* SVG Canvas for Grid, Section Banding & Dependencies */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={Math.max(totalWidth, 1000)}
              height={totalHeight}
            >
              <defs>
                {/* Arrowhead marker for dependencies */}
                <marker
                  id="arrowhead"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--gantt-dependency-line)" />
                </marker>

                {/* Critical arrowhead */}
                <marker
                  id="arrowhead-crit"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#FB7185" />
                </marker>

                {/* Weekend / Holiday Hatch Pattern */}
                <pattern id="weekend-hatch" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path
                    d="M-2,2 l4,-4 M0,10 l10,-10 M8,12 l4,-4"
                    stroke="var(--gantt-weekend-stripe)"
                    strokeWidth="1"
                    opacity="0.85"
                  />
                </pattern>
              </defs>

              {/* Section Shading Bands */}
              {phaseSections.map((sec, sIdx) => {
                const isEven = sIdx % 2 === 0;
                return (
                  <rect
                    key={`band-${sec.id}`}
                    x={0}
                    y={sec.topY}
                    width={Math.max(totalWidth, 1000)}
                    height={sec.height}
                    fill={sec.color ? `${sec.color}06` : isEven ? 'var(--gantt-row-even)' : 'var(--gantt-row-odd)'}
                  />
                );
              })}

              {/* Vertical Columns & Weekend Shading */}
              {timelineDates.map((dateStr, idx) => {
                const isWorking = isWorkDay(dateStr, project.calendar);
                const x = idx * colWidth;

                return (
                  <g key={dateStr}>
                    {/* Weekend / Non-working shading */}
                    {!isWorking && (
                      <g>
                        <rect
                          x={x}
                          y={headerHeight}
                          width={colWidth}
                          height={totalHeight - headerHeight}
                          fill="var(--gantt-weekend-bg)"
                        />
                        <rect
                          x={x}
                          y={headerHeight}
                          width={colWidth}
                          height={totalHeight - headerHeight}
                          fill="url(#weekend-hatch)"
                        />
                      </g>
                    )}

                    {/* Vertical grid line */}
                    <line
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={totalHeight}
                      stroke="var(--gantt-grid-lines)"
                      strokeWidth="0.75"
                      opacity={zoomLevel === 'month' ? '0.2' : '0.5'}
                    />
                  </g>
                );
              })}

              {/* Horizontal Row Divider Lines */}
              {displayTasks.map((_, idx) => {
                const y = headerHeight + (idx + 1) * rowHeight;
                return (
                  <line
                    key={idx}
                    x1={0}
                    y1={y}
                    x2={totalWidth}
                    y2={y}
                    stroke="var(--gantt-border-subtle)"
                    strokeWidth="0.75"
                  />
                );
              })}

              {/* Section Separator Lines (Atenuadas) */}
              {phaseSections.map(sec => (
                <line
                  key={`sep-${sec.id}`}
                  x1={0}
                  y1={sec.topY + sec.height}
                  x2={Math.max(totalWidth, 1000)}
                  y2={sec.topY + sec.height}
                  stroke="var(--gantt-border-subtle)"
                  strokeWidth="0.75"
                  opacity="0.6"
                />
              ))}

              {/* Reference Date Line */}
              {todayX >= 0 && todayX <= totalWidth && (
                <g>
                  <line
                    x1={todayX}
                    y1={0}
                    x2={todayX}
                    y2={totalHeight}
                    stroke="var(--gantt-accent-today)"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                  <circle cx={todayX} cy={headerHeight - 8} r="3" fill="var(--gantt-accent-today)" opacity="0.85" />
                </g>
              )}

              {/* Dependency Connection Lines (Bézier Curves accurately mapping to display rows) */}
              {displayTasks.map((succTask, succIdx) => {
                if (!succTask.dependencies || succTask.dependencies.length === 0) return null;

                return succTask.dependencies.map(dep => {
                  const predIdx = displayTasks.findIndex(t => t.id === dep.targetTaskId);
                  if (predIdx === -1) return null;

                  const predTask = displayTasks[predIdx];
                  const predX = getXForDate(predTask.endDate) + (predTask.isMilestone ? 0 : colWidth);
                  const predY = headerHeight + predIdx * rowHeight + rowHeight / 2;

                  const succX = getXForDate(succTask.startDate);
                  const succY = headerHeight + succIdx * rowHeight + rowHeight / 2;

                  // Curved Bézier path with smooth horizontal curve
                  const dx = Math.max(30, (succX - predX) / 2);
                  const pathD = `M ${predX} ${predY} C ${predX + dx} ${predY}, ${succX - dx} ${succY}, ${succX - 4} ${succY}`;

                  const isCritLine = predTask.isCritical && succTask.isCritical;

                  return (
                    <path
                      key={`${dep.targetTaskId}->${succTask.id}`}
                      d={pathD}
                      fill="none"
                      stroke={isCritLine ? '#F43F5E' : 'var(--gantt-connector)'}
                      strokeWidth={isCritLine ? '2' : '1.3'}
                      strokeDasharray={predX > succX ? '4 2' : undefined}
                      markerEnd={isCritLine ? 'url(#arrowhead-crit)' : 'url(#arrowhead)'}
                      opacity="0.55"
                    />
                  );
                });
              })}
            </svg>

            {/* Sticky Time Header */}
            <div
              className="sticky top-0 z-20 bg-gantt-header/95 backdrop-blur border-b border-gantt-border flex flex-col transition-colors select-none"
              style={{ height: headerHeight, width: totalWidth }}
            >
              {/* Row 1: Month Bar */}
              <div
                className="flex border-b border-gantt-border/60 bg-gantt-card/40 overflow-hidden"
                style={{ height: monthHeaderHeight }}
              >
                {monthBlocks.map(mb => {
                  const labelWidth = 140;
                  const offset = mb.isCurrentMonth
                    ? Math.max(0, Math.min(todayX - mb.startX, mb.width - labelWidth))
                    : 0;

                  return (
                    <div
                      key={mb.key}
                      style={{ width: mb.width }}
                      className="shrink-0 flex items-center justify-start px-2 border-r border-gantt-border/60 overflow-hidden relative"
                    >
                      <div
                        style={{
                          transform: `translateX(${offset}px)`,
                          transition: 'transform 0.15s ease-out',
                        }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                          mb.isCurrentMonth
                            ? 'bg-safira-500/15 text-safira-700 dark:text-safira-300 font-extrabold ring-1 ring-safira-500/30'
                            : 'text-gantt-text-primary font-black'
                        }`}
                      >
                        <span className="text-[10.5px] uppercase tracking-wider truncate">
                          {mb.label}
                        </span>
                        {mb.isCurrentMonth && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0"
                            title="Mês da Linha Hoje (Data Atual)"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Row 2: Sprint Track (Visual Sprint Timeline directly over the Days) */}
              {sprints.length > 0 && (
                <div
                  className="relative border-b border-gantt-border/70 bg-purple-950/15 overflow-hidden shrink-0"
                  style={{ height: sprintHeaderHeight, width: totalWidth }}
                >
                  {sprints.map((sprint, sIdx) => {
                    const startX = getXForDate(sprint.startDate);
                    const endX = getXForDate(sprint.endDate) + colWidth;
                    const width = Math.max(colWidth * 2, endX - startX);

                    // Stories belonging to this sprint (by sprintId or by date overlap)
                    const sprintStories = project.tasks.filter(
                      t => !isEpic(t) && t.type !== 'sprint' && (
                        t.sprintId === sprint.id ||
                        t.epicId === sprint.id ||
                        t.phaseId === sprint.id ||
                        (t.startDate >= sprint.startDate && t.startDate <= sprint.endDate)
                      )
                    );
                    const avgStoryProgress = sprintStories.length > 0
                      ? Math.round(sprintStories.reduce((acc, st) => acc + (st.progress || 0), 0) / sprintStories.length)
                      : 0;
                    const sprintProgress = sprint.progress > 0 ? sprint.progress : avgStoryProgress;

                    // Clean label: "Sprint 0", "Sprint 1", etc.
                    const sprintNumberMatch = sprint.name.match(/Sprint\s*(\d+)/i);
                    const sprintLabel = sprintNumberMatch
                      ? `Sprint ${sprintNumberMatch[1]}`
                      : `Sprint ${sIdx}`;

                    const sprintSubname = sprint.name.replace(/^Sprint\s*\d+[:\s-]*/i, '').trim();

                    return (
                      <div
                        key={sprint.id}
                        style={{
                          left: startX,
                          width: width,
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedTaskId(sprint.id);
                          if (onSelectTask) onSelectTask(sprint);
                        }}
                        title={`${sprint.name} (${formatBrDate(sprint.startDate)} a ${formatBrDate(sprint.endDate)}) • ${sprintProgress}% concluído • ${sprintStories.length} histórias • Clique para editar datas`}
                        className="absolute top-1 bottom-1 px-2.5 py-0.5 rounded-lg border border-purple-500/40 bg-purple-950/50 hover:bg-purple-900/60 hover:border-purple-400/80 transition-all cursor-pointer group flex flex-col justify-between shadow-xs select-none backdrop-blur-xs"
                      >
                        {/* Title line above progress bar */}
                        <div className="flex items-center justify-between gap-1 overflow-hidden leading-tight">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shrink-0" />
                            <span className="text-[11px] font-black text-purple-200 tracking-wide truncate">
                              {sprintLabel}
                            </span>
                            {sprintSubname && (
                              <span className="text-[9.5px] font-semibold text-purple-300/80 truncate hidden sm:inline">
                                : {sprintSubname}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[9px] font-black text-purple-200 tabular-nums bg-purple-900/70 px-1 py-0.2 rounded border border-purple-500/40">
                              {sprintProgress}%
                            </span>
                            <span className="text-[8.5px] font-semibold text-slate-300 tabular-nums hidden md:inline">
                              {sprint.duration}d
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar Track */}
                        <div className="w-full h-2 rounded-full bg-purple-950/90 border border-purple-500/35 overflow-hidden relative shadow-inner">
                          <div
                            style={{ width: `${Math.min(100, Math.max(0, sprintProgress))}%` }}
                            className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-safira-400 rounded-full transition-all duration-300 relative"
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Row 3: Days Columns */}
              <div className="flex flex-1" style={{ height: dayHeaderHeight }}>
                {timelineDates.map(dateStr => {
                  const isWorking = isWorkDay(dateStr, project.calendar);
                  const dayOfWeek = getDayOfWeekBr(dateStr);
                  const isToday = dateStr === todayStr;
                  const [y, m, d] = dateStr.split('-');

                  return (
                    <div
                      key={dateStr}
                      style={{ width: colWidth }}
                      className={`shrink-0 flex flex-col items-center justify-center text-center select-none transition-colors ${
                        !isWorking
                          ? 'bg-gantt-card/70 text-slate-500 dark:text-slate-400 font-semibold border-x border-gantt-border/40'
                          : 'text-slate-700 dark:text-slate-300'
                      } ${isToday ? 'bg-safira-500/10 text-safira-700 dark:text-safira-400 font-bold ring-1 ring-safira-500/30' : ''}`}
                    >
                      <span className={`text-[10px] uppercase tracking-wider ${!isWorking ? 'text-slate-400/90 font-bold' : 'font-semibold opacity-70'}`}>
                        {zoomLevel === 'month' ? (d === '01' ? `${m}/${y.slice(2)}` : '') : dayOfWeek}
                      </span>
                      <span className="text-xs font-bold tabular-nums leading-tight">
                        {zoomLevel === 'month' ? (d === '01' || d === '15' ? d : '') : d}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task Rows & Interactive Bars */}
            <div className="relative" style={{ width: totalWidth }}>
              {displayTasks.map((task, idx) => {
                const startX = getXForDate(task.startDate);
                const isMilestone = task.isMilestone || task.type === 'milestone' || task.duration === 0;
                const isSprint = task.type === 'sprint';
                const subtasks = getTaskSubtasks(task);
                const completedSubtasksCount = subtasks.filter(s => s.completed).length;
                const width = isMilestone ? 28 : Math.max(colWidth * 0.8, task.duration * colWidth);
                const topY = idx * rowHeight;
                const isSelected = selectedTaskId === task.id;
                const isNarrow = !isMilestone && width < 110;

                const latestUpdate = task.updates && task.updates.length > 0 ? task.updates[0].text : task.lastUpdateNote || task.notes;
                const hasUpdates = (task.updates && task.updates.length > 0) || !!task.lastUpdateNote;

                // Linha de placeholder para Épico vazio (permite adicionar primeira história com 1 clique)
                if (task.id.startsWith('empty_epic_')) {
                  const epicId = task.epicId || task.phaseId;
                  return (
                    <div
                      key={task.id}
                      style={{ height: rowHeight, top: topY }}
                      className={`absolute left-0 right-0 flex items-center px-4 transition-colors ${
                        idx % 2 === 0 ? 'bg-transparent' : 'bg-gantt-card/40'
                      }`}
                    >
                      <button
                        id={`btn-add-story-${epicId}`}
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          const newTaskId = `task_${Date.now()}`;
                          const today = task.startDate || new Date().toISOString().split('T')[0];
                          const newTask: Task = {
                            id: newTaskId,
                            name: 'Nova História',
                            type: 'story',
                            epicId: epicId,
                            phaseId: epicId,
                            startDate: today,
                            endDate: today,
                            duration: 5,
                            progress: 0,
                            dependencies: [],
                            color: task.color,
                          };
                          addTask(newTask);
                          setSelectedTaskId(newTaskId);
                          if (onSelectTask) onSelectTask(newTask);
                        }}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-dashed border-safira-500/50 hover:border-safira-400 bg-safira-500/10 hover:bg-safira-500/20 text-safira-400 hover:text-safira-300 text-xs font-semibold transition-all cursor-pointer shadow-xs group"
                      >
                        <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>{task.name}</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={task.id}
                    style={{ height: rowHeight, top: topY }}
                    className={`absolute left-0 right-0 flex items-center transition-colors ${isSelected ? 'bg-safira-500/10' : idx % 2 === 0 ? 'bg-transparent' : 'bg-gantt-card/40'
                      }`}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                    }}
                  >
                    {/* Task Bar Container */}
                    <div
                      style={{
                        left: startX,
                        width: width,
                      }}
                      className={`absolute flex items-center group cursor-pointer transition-shadow ${isMilestone ? 'justify-center' : ''
                        }`}
                    >
                      {/* Ghost Baseline Bar (rendered if What-If simulation has baseline) */}
                      {simulation.isActive && task.baseline && (
                        <div
                          style={{
                            left: getXForDate(task.baseline.startDate) - startX,
                            width: Math.max(colWidth, task.baseline.duration * colWidth),
                            height: 10,
                            top: -8,
                          }}
                          className="absolute border border-dashed border-ouro-400/80 bg-ouro-400/10 rounded pointer-events-none"
                          title={`Baseline: ${formatBrDate(task.baseline.startDate)} a ${formatBrDate(task.baseline.endDate)}`}
                        />
                      )}

                      {/* MILESTONE RENDERING (Rotated Diamond) */}
                      {isMilestone ? (
                        <div className="relative flex items-center">
                          <div
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedTaskId(task.id);
                            }}
                            onDoubleClick={e => {
                              e.stopPropagation();
                              setSelectedTaskId(task.id);
                              if (onSelectTask) onSelectTask(task);
                            }}
                            onMouseDown={e => {
                              e.stopPropagation();
                              setSelectedTaskId(task.id);
                              setDragState({
                                mode: 'move',
                                taskId: task.id,
                                startX: e.clientX,
                                initialStartDate: task.startDate,
                                initialDuration: 0,
                                initialProgress: task.progress,
                              });
                            }}
                            onTouchStart={e => {
                              e.stopPropagation();
                              setSelectedTaskId(task.id);
                              setDragState({
                                mode: 'move',
                                taskId: task.id,
                                startX: e.touches[0].clientX,
                                initialStartDate: task.startDate,
                                initialDuration: 0,
                                initialProgress: task.progress,
                              });
                            }}
                            title={`${task.name} • Marco (${task.progress === 100 ? 'Concluído' : 'Pendente'})${task.assignee ? ` • ${task.assignee}` : ''}${latestUpdate ? ` • [Atualização: ${latestUpdate}]` : ''} • [Duplo clique para editar]`}
                            className={`w-7 h-7 rounded-md rotate-45 flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-110 shadow-xs touch-none select-none ${dragState?.taskId === task.id ? 'scale-115 ring-1 ring-safira-400' : ''
                              } ${task.progress === 100
                                ? 'bg-esmeralda-600 text-white'
                                : 'bg-ouro-500/90 text-obsidian-950'
                              }`}
                          >
                            <Diamond className="w-4 h-4 -rotate-45" />
                          </div>

                          {/* Milestone Label Adjacent */}
                          <div className="absolute left-full ml-3 flex items-center gap-1.5 whitespace-nowrap pointer-events-none z-20">
                            {hasUpdates && (
                              <span
                                className="flex items-center justify-center w-4 h-4 rounded-full bg-safira-500/25 text-safira-400 border border-safira-500/40"
                                title={`Atualização: ${latestUpdate}`}
                              >
                                <MessageSquareText className="w-2.5 h-2.5" />
                              </span>
                            )}
                            <span className="text-xs font-bold text-ouro-300 drop-shadow-md">
                              {task.name}
                            </span>
                            <span className="text-[10px] font-medium text-gantt-muted bg-gantt-card px-1.5 py-0.5 rounded border border-gantt-border shadow-xs">
                              Marco
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* REGULAR TASK BAR / SPRINT TIMEBOX */
                        <div
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedTaskId(task.id);
                          }}
                          onDoubleClick={e => {
                            e.stopPropagation();
                            setSelectedTaskId(task.id);
                            if (onSelectTask) onSelectTask(task);
                          }}
                          onMouseDown={e => {
                            if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
                            e.stopPropagation();
                            setSelectedTaskId(task.id);
                            setDragState({
                              mode: 'move',
                              taskId: task.id,
                              startX: e.clientX,
                              initialStartDate: task.startDate,
                              initialDuration: task.duration,
                              initialProgress: task.progress,
                            });
                          }}
                          onTouchStart={e => {
                            if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
                            e.stopPropagation();
                            setSelectedTaskId(task.id);
                            setDragState({
                              mode: 'move',
                              taskId: task.id,
                              startX: e.touches[0].clientX,
                              initialStartDate: task.startDate,
                              initialDuration: task.duration,
                              initialProgress: task.progress,
                            });
                          }}
                          title={`${task.name} • ${isSprint ? 'Timebox Sprint' : 'História'} (${task.duration} dias úteis, ${task.progress}% concluído)${task.assignee ? ` • ${task.assignee}` : ''}${latestUpdate ? ` • [Atualização: ${latestUpdate}]` : ''} • [Duplo clique para abrir tarefas]`}
                          style={{
                            backgroundColor: isSprint
                              ? 'rgba(124, 58, 237, 0.12)'
                              : task.color
                                ? `${task.color}25`
                                : 'var(--gantt-bar-empty-bg)',
                            borderColor: isSprint
                              ? 'rgba(124, 58, 237, 0.65)'
                              : task.isCritical
                                ? 'var(--gantt-critical-alert, rgba(244, 63, 94, 0.55))'
                                : isSelected
                                  ? 'var(--gantt-accent-focus, rgba(8, 145, 178, 0.75))'
                                  : task.color
                                    ? `${task.color}45`
                                    : 'var(--gantt-bar-empty-border)',
                            borderStyle: isSprint ? 'dashed' : 'solid',
                            borderWidth: isSprint ? '2px' : '1px',
                          }}
                          className={`relative w-full h-9 rounded-xl border flex items-center shadow-xs cursor-grab active:cursor-grabbing transition-all overflow-visible touch-none select-none ${dragState?.taskId === task.id ? 'scale-[1.01] shadow-lg z-30 opacity-95 ring-1 ring-safira-500/40' : ''
                            } ${task.isCritical ? 'ring-1 ring-carmim-500/30' : ''
                            } ${isSelected ? 'ring-1 ring-safira-500/40' : ''}`}
                        >
                          {/* Progress Fill Indicator */}
                          {task.progress > 0 && (
                            <div
                              style={{
                                width: `${Math.min(100, Math.max(0, task.progress))}%`,
                                backgroundColor: isSprint ? 'rgba(124, 58, 237, 0.35)' : task.color || '#4F46E5',
                              }}
                              className={`absolute left-0 top-0 bottom-0 transition-all ${task.progress >= 100 ? 'rounded-xl' : 'rounded-l-xl'
                                }`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20 pointer-events-none" />
                            </div>
                          )}

                          {/* Task Title & Meta Label Inside Bar (quando barra for larga) */}
                          {!isNarrow && (
                            <div className={`relative z-10 px-3 flex items-center gap-2 text-xs font-bold ${
                              task.progress >= 60 && !isSprint ? 'text-white' : 'text-slate-800 dark:text-white'
                            } drop-shadow-sm truncate pointer-events-none w-full min-w-0`}>
                              {isSprint ? (
                                <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              ) : task.isCritical ? (
                                <Flame className="w-3.5 h-3.5 text-carmim-400 animate-pulse shrink-0" />
                              ) : null}

                              {hasUpdates && (
                                <span
                                  className="shrink-0 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-safira-500/25 text-safira-300 border border-safira-500/40"
                                  title={`Atualização: ${latestUpdate}`}
                                >
                                  <MessageSquareText className="w-2.5 h-2.5" />
                                </span>
                              )}

                              {task.health && (
                                <span
                                  className={`shrink-0 w-2 h-2 rounded-full ${
                                    task.health === 'on_track'
                                      ? 'bg-esmeralda-400'
                                      : task.health === 'at_risk'
                                      ? 'bg-ouro-400'
                                      : 'bg-carmim-400'
                                  }`}
                                  title={`Saúde: ${task.health}`}
                                />
                              )}

                              <span className="truncate">{task.name}</span>

                              {/* Se for Sprint, mostra tag Timebox */}
                              {isSprint ? (
                                <span className="text-[9.5px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/25 border border-purple-500/40 px-1.5 py-0.5 rounded shrink-0">
                                  Timebox ({task.duration}d)
                                </span>
                              ) : (
                                <>
                                  {/* Se tiver subtasks, mostra contagem */}
                                  {subtasks.length > 0 && (
                                    <span
                                      className="text-[9.5px] font-bold text-esmeralda-300 bg-esmeralda-500/20 border border-esmeralda-500/30 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1"
                                      title={`Tarefas concluídas: ${completedSubtasksCount} de ${subtasks.length}`}
                                    >
                                      <CheckSquare className="w-2.5 h-2.5" />
                                      {completedSubtasksCount}/{subtasks.length}
                                    </span>
                                  )}

                                  <span className="text-[10px] font-semibold text-slate-700 dark:text-white shrink-0 tabular-nums bg-slate-900/10 dark:bg-black/40 px-1.5 py-0.5 rounded border border-gantt-border shadow-xs">
                                    {task.duration}d{task.progress > 0 ? ` (${task.progress}%)` : ''}
                                  </span>
                                </>
                              )}
                            </div>
                          )}

                          {/* Short bar: Label to the Right */}
                          {isNarrow && (
                            <>
                              <div className={`relative z-10 px-2 flex items-center justify-center pointer-events-none w-full text-[10px] font-bold ${
                                task.progress >= 60 && !isSprint ? 'text-white' : 'text-slate-800 dark:text-white'
                              } drop-shadow-sm`}>
                                {task.duration}d
                              </div>
                              <div className="absolute left-full ml-2.5 flex items-center gap-1.5 whitespace-nowrap pointer-events-none z-20">
                                {isSprint ? (
                                  <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                ) : task.isCritical ? (
                                  <Flame className="w-3.5 h-3.5 text-carmim-400 animate-pulse shrink-0" />
                                ) : null}

                                {hasUpdates && (
                                  <span
                                    className="shrink-0 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-safira-500/25 text-safira-400 border border-safira-500/40"
                                    title={`Atualização: ${latestUpdate}`}
                                  >
                                    <MessageSquareText className="w-2.5 h-2.5" />
                                  </span>
                                )}

                                {task.health && (
                                  <span
                                    className={`shrink-0 w-2 h-2 rounded-full ${
                                      task.health === 'on_track'
                                        ? 'bg-esmeralda-400'
                                        : task.health === 'at_risk'
                                        ? 'bg-ouro-400'
                                        : 'bg-carmim-400'
                                    }`}
                                  />
                                )}

                                <span className="text-xs font-bold text-gantt-text-primary drop-shadow-md">
                                  {task.name}
                                </span>

                                {subtasks.length > 0 && (
                                  <span className="text-[9.5px] font-bold text-esmeralda-300 bg-esmeralda-500/20 border border-esmeralda-500/30 px-1.5 py-0.5 rounded shadow-xs">
                                    {completedSubtasksCount}/{subtasks.length}
                                  </span>
                                )}

                                <span className="text-[10px] font-medium text-gantt-text-secondary bg-gantt-card/90 px-1.5 py-0.5 rounded border border-gantt-border shadow-xs">
                                  {task.duration}d{task.progress > 0 ? ` (${task.progress}%)` : ''}
                                </span>
                              </div>
                            </>
                          )}

                          {/* Right Edge Resize Handle (Hitbox ampliada para 28px no mobile com touch-none) */}
                          <div
                            onMouseDown={e => {
                              e.stopPropagation();
                              setSelectedTaskId(task.id);
                              setDragState({
                                mode: 'resize-end',
                                taskId: task.id,
                                startX: e.clientX,
                                initialStartDate: task.startDate,
                                initialDuration: task.duration,
                                initialProgress: task.progress,
                              });
                            }}
                            onTouchStart={e => {
                              e.stopPropagation();
                              setSelectedTaskId(task.id);
                              setDragState({
                                mode: 'resize-end',
                                taskId: task.id,
                                startX: e.touches[0].clientX,
                                initialStartDate: task.startDate,
                                initialDuration: task.duration,
                                initialProgress: task.progress,
                              });
                            }}
                            title="Arrastar para alterar duração"
                            className="resize-handle absolute right-0 top-0 bottom-0 w-7 bg-black/25 hover:bg-white/30 cursor-ew-resize flex items-center justify-center group-hover:opacity-100 transition-opacity z-20 rounded-r-xl touch-none select-none"
                          >
                            <div className="w-1.5 h-3.5 bg-white/70 rounded-full pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {displayTasks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                  <div className="bg-gantt-card/90 backdrop-blur-md border border-gantt-border rounded-2xl p-6 text-center max-w-md shadow-xl pointer-events-auto">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-safira-500/15 border border-safira-500/30 flex items-center justify-center text-safira-500">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gantt-primary mb-1">
                      Projeto em Branco
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Seu cronograma está limpo e pronto. Toque em <strong>Inserir</strong> na barra superior para adicionar a primeira Fase, Sprint ou Tarefa, ou clique em <strong>Modelos</strong> no menu para carregar um exemplo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Criação / Edição de Épico */}
      <EpicModal
        isOpen={isEpicModalOpen}
        onClose={() => {
          setIsEpicModalOpen(false);
          setSelectedEpicToEdit(null);
        }}
        epic={selectedEpicToEdit}
      />
    </div>
  );
};
