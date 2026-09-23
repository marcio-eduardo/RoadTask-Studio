import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useGantt } from '../../context/GanttContext';
import { Task } from '../../types/gantt';
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
} from 'lucide-react';

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
  } = useGantt();

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

  const rowHeight = 52; // 52px per task row for great touch ergonomics
  const monthHeaderHeight = 24;
  const dayHeaderHeight = 36;
  const headerHeight = monthHeaderHeight + dayHeaderHeight; // 60px
  const phaseColWidth = 140; // Width of sticky left phase swimlane column

  // Group tasks by phase and build displayTasks (excluding summary phase bars from timeline rows)
  const { phaseSections, displayTasks, hasPhases } = useMemo(() => {
    const phases = project.tasks.filter(t => t.type === 'phase');
    const sections: PhaseSection[] = [];
    const flatDisplay: Task[] = [];
    let currentIndex = 0;

    if (phases.length > 0) {
      for (const ph of phases) {
        const children = project.tasks.filter(t => t.phaseId === ph.id && t.type !== 'phase');
        if (children.length > 0) {
          const rawName = ph.name;
          const parts = rawName.split(':');
          const shortName = parts[0].trim();
          const subtitle = parts.length > 1 ? parts.slice(1).join(':').trim() : undefined;

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
        }
      }

      // Tasks without a phase (or milestones not assigned to a phase)
      const unassigned = project.tasks.filter(
        t => t.type !== 'phase' && (!t.phaseId || !phases.some(p => p.id === t.phaseId))
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
      // No phases defined: flat list of all non-phase tasks
      const nonPhases = project.tasks.filter(t => t.type !== 'phase');
      const allTasks = nonPhases.length > 0 ? nonPhases : project.tasks;
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

    return { phaseSections: sections, displayTasks: flatDisplay, hasPhases: phases.length > 0 };
  }, [project.tasks]);

  // Determine timeline date boundaries
  const { timelineDates, minDateStr } = useMemo(() => {
    const tasks = displayTasks.length > 0 ? displayTasks : project.tasks;
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
            width: Math.max(totalWidth + (hasPhases ? phaseColWidth : 0), 1000),
            height: totalHeight,
          }}
          className="flex relative"
        >
          {/* Left Sticky Phase Swimlane Column */}
          {hasPhases && (
            <div
              style={{ width: phaseColWidth }}
              className="sticky left-0 z-30 shrink-0 bg-gantt-card/95 backdrop-blur-md border-r border-gantt-border flex flex-col shadow-lg transition-colors"
            >
              {/* Sticky Top Header Cell for Phases */}
              <div
                style={{ height: headerHeight }}
                className="sticky top-0 z-40 bg-gantt-header border-b border-gantt-border flex flex-col items-center justify-center px-3 transition-colors select-none"
              >
                <span className="text-xs font-black uppercase tracking-wider text-gantt-text-secondary">
                  Fase
                </span>
                <span className="text-[9.5px] text-gantt-text-muted font-semibold tracking-tight">
                  Swimlanes
                </span>
              </div>

              {/* Section Swimlane Cells */}
              {phaseSections.map(sec => (
                <div
                  key={sec.id}
                  style={{
                    height: sec.height,
                    background: sec.color
                      ? `linear-gradient(90deg, ${sec.color}15 0%, transparent 100%)`
                      : undefined,
                  }}
                  title={sec.subtitle ? `${sec.name} - ${sec.subtitle}` : sec.name}
                  className="border-b border-gantt-border flex flex-col items-center justify-center px-2.5 text-center relative select-none overflow-hidden transition-colors"
                >
                  {/* Left accent bar with section color */}
                  <div
                    className="absolute left-0 top-1.5 bottom-1.5 w-1.5 rounded-r shadow-xs"
                    style={{ backgroundColor: sec.color || 'var(--gantt-phase-1-accent)' }}
                  />
                  <span className="text-xs font-black text-gantt-text-primary uppercase tracking-wider truncate max-w-full">
                    {sec.shortName}
                  </span>
                  {sec.height >= 72 && sec.subtitle && (
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
                    {sec.rowCount} {sec.rowCount === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              ))}
            </div>
          )}

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

              {/* Row 2: Days Columns */}
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
                const width = isMilestone ? 28 : Math.max(colWidth * 0.8, task.duration * colWidth);
                const topY = idx * rowHeight;
                const isSelected = selectedTaskId === task.id;
                const isNarrow = !isMilestone && width < 110;

                const latestUpdate = task.updates && task.updates.length > 0 ? task.updates[0].text : task.lastUpdateNote || task.notes;
                const hasUpdates = (task.updates && task.updates.length > 0) || !!task.lastUpdateNote;

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
                        /* REGULAR TASK BAR */
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
                          title={`${task.name} • ${task.duration} dias úteis (${task.progress}% concluído)${task.assignee ? ` • ${task.assignee}` : ''}${latestUpdate ? ` • [Atualização: ${latestUpdate}]` : ''} • [Duplo clique para editar]`}
                          style={{
                            backgroundColor: task.color ? `${task.color}25` : 'var(--gantt-bar-empty-bg)',
                            borderColor: task.isCritical
                              ? 'var(--gantt-critical-alert, rgba(244, 63, 94, 0.55))'
                              : isSelected
                                ? 'var(--gantt-accent-focus, rgba(8, 145, 178, 0.75))'
                                : task.color
                                  ? `${task.color}45`
                                  : 'var(--gantt-bar-empty-border)',
                          }}
                          className={`relative w-full h-9 rounded-xl border flex items-center shadow-xs cursor-grab active:cursor-grabbing transition-all overflow-visible touch-none select-none ${dragState?.taskId === task.id ? 'scale-[1.01] shadow-lg z-30 opacity-95 ring-1 ring-safira-500/40' : ''
                            } ${task.isCritical ? 'ring-1 ring-carmim-500/30' : ''
                            } ${isSelected ? 'ring-1 ring-safira-500/40' : ''}`}
                        >
                          {/* Progress Fill Indicator (Preenchimento progressivo conforme avança até 100%) */}
                          {task.progress > 0 && (
                            <div
                              style={{
                                width: `${Math.min(100, Math.max(0, task.progress))}%`,
                                backgroundColor: task.color || '#4F46E5',
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
                              task.progress >= 60 ? 'text-white' : 'text-slate-800 dark:text-white'
                            } drop-shadow-sm truncate pointer-events-none w-full min-w-0`}>
                              {task.isCritical && (
                                <Flame className="w-3.5 h-3.5 text-carmim-400 animate-pulse shrink-0" />
                              )}
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
                              <span className="text-[10px] font-semibold text-slate-700 dark:text-white shrink-0 tabular-nums bg-slate-900/10 dark:bg-black/40 px-1.5 py-0.5 rounded border border-gantt-border shadow-xs">
                                {task.duration}d{task.progress > 0 ? ` (${task.progress}%)` : ''}
                              </span>
                            </div>
                          )}

                          {/* Short bar: Label to the Right */}
                          {isNarrow && (
                            <>
                              <div className={`relative z-10 px-2 flex items-center justify-center pointer-events-none w-full text-[10px] font-bold ${
                                task.progress >= 60 ? 'text-white' : 'text-slate-800 dark:text-white'
                              } drop-shadow-sm`}>
                                {task.duration}d
                              </div>
                              <div className="absolute left-full ml-2.5 flex items-center gap-1.5 whitespace-nowrap pointer-events-none z-20">
                                {task.isCritical && (
                                  <Flame className="w-3.5 h-3.5 text-carmim-400 animate-pulse shrink-0" />
                                )}
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
    </div>
  );
};
