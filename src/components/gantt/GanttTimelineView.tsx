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
  const headerHeight = 56;
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
      const today = formatDateUtc(new Date());
      return {
        timelineDates: getDateRange(today, today),
        minDateStr: today,
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
      if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setDragState(null);
    };

    if (dragState) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [dragState, colWidth, moveTaskDate, resizeTaskDuration, updateTaskProgress, project.tasks]);

  const totalWidth = timelineDates.length * colWidth;
  const totalHeight = headerHeight + displayTasks.length * rowHeight + 40;

  return (
    <div className="flex-1 flex flex-col bg-obsidian-950 overflow-hidden relative select-none">
      {/* Scrollable Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-obsidian-750 scrollbar-track-obsidian-900"
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
              className="sticky left-0 z-30 shrink-0 bg-obsidian-900/98 backdrop-blur-md border-r border-obsidian-750 flex flex-col shadow-lg"
            >
              {/* Sticky Top Header Cell for Phases */}
              <div
                style={{ height: headerHeight }}
                className="sticky top-0 z-40 bg-obsidian-850 border-b border-obsidian-750 flex items-center justify-center px-3 shadow-xs"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Fase
                </span>
              </div>

              {/* Section Swimlane Cells */}
              {phaseSections.map(sec => (
                <div
                  key={sec.id}
                  style={{ height: sec.height }}
                  className="border-b border-obsidian-750/80 flex flex-col items-center justify-center px-3 text-center relative select-none"
                >
                  {/* Left accent bar with section color */}
                  <div
                    className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r"
                    style={{ backgroundColor: sec.color || '#0284C7' }}
                  />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    {sec.shortName}
                  </span>
                  {sec.subtitle && (
                    <span className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                      {sec.subtitle}
                    </span>
                  )}
                  <span className="text-[9px] font-semibold text-safira-400 mt-1.5 bg-safira-500/10 px-1.5 py-0.5 rounded border border-safira-500/20">
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
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#38BDF8" />
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
                <pattern id="weekend-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#1E293B" strokeWidth="1" opacity="0.6" />
                </pattern>
              </defs>

              {/* Section Shading Bands (Alternating swimlane tints matching Mermaid reference) */}
              {phaseSections.map((sec, sIdx) => {
                const isEven = sIdx % 2 === 0;
                return (
                  <rect
                    key={`band-${sec.id}`}
                    x={0}
                    y={sec.topY}
                    width={Math.max(totalWidth, 1000)}
                    height={sec.height}
                    fill={isEven ? 'rgba(56, 189, 248, 0.05)' : 'rgba(15, 23, 42, 0.25)'}
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
                      <rect
                        x={x}
                        y={headerHeight}
                        width={colWidth}
                        height={totalHeight - headerHeight}
                        fill="url(#weekend-hatch)"
                        opacity="0.7"
                      />
                    )}

                    {/* Vertical grid line */}
                    <line
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={totalHeight}
                      stroke="#1E293B"
                      strokeWidth="1"
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
                    stroke="#162036"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Strong Section Separator Lines */}
              {phaseSections.map(sec => (
                <line
                  key={`sep-${sec.id}`}
                  x1={0}
                  y1={sec.topY + sec.height}
                  x2={Math.max(totalWidth, 1000)}
                  y2={sec.topY + sec.height}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
              ))}

              {/* Reference Date Line (Red indicator like reference image) */}
              {todayX >= 0 && todayX <= totalWidth && (
                <g>
                  <line
                    x1={todayX}
                    y1={0}
                    x2={todayX}
                    y2={totalHeight}
                    stroke="#EF4444"
                    strokeWidth="2.5"
                  />
                  <circle cx={todayX} cy={headerHeight - 8} r="5" fill="#EF4444" className="animate-ping opacity-75" />
                  <circle cx={todayX} cy={headerHeight - 8} r="3" fill="#EF4444" />
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
                      stroke={isCritLine ? '#FB7185' : '#38BDF8'}
                      strokeWidth={isCritLine ? '2.5' : '1.8'}
                      strokeDasharray={predX > succX ? '4 2' : undefined}
                      markerEnd={isCritLine ? 'url(#arrowhead-crit)' : 'url(#arrowhead)'}
                      opacity="0.85"
                    />
                  );
                });
              })}
            </svg>

            {/* Sticky Time Header */}
            <div
              className="sticky top-0 z-20 bg-obsidian-900/95 backdrop-blur border-b border-obsidian-750 flex shadow-sm"
              style={{ height: headerHeight, width: totalWidth }}
            >
              {timelineDates.map(dateStr => {
                const isWorking = isWorkDay(dateStr, project.calendar);
                const dayOfWeek = getDayOfWeekBr(dateStr);
                const isToday = dateStr === todayStr;
                const [y, m, d] = dateStr.split('-');

                return (
                  <div
                    key={dateStr}
                    style={{ width: colWidth }}
                    className={`shrink-0 flex flex-col items-center justify-center border-r border-obsidian-800 text-center select-none ${
                      !isWorking ? 'bg-obsidian-950/40 text-slate-500' : 'text-slate-300'
                    } ${isToday ? 'bg-safira-950/40 text-safira-300 font-bold' : ''}`}
                  >
                    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
                      {zoomLevel === 'month' ? (d === '01' ? `${m}/${y.slice(2)}` : '') : dayOfWeek}
                    </span>
                    <span className="text-xs font-bold tabular-nums">
                      {zoomLevel === 'month' ? (d === '01' || d === '15' ? d : '') : d}
                    </span>
                  </div>
                );
              })}
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

                return (
                  <div
                    key={task.id}
                    style={{ height: rowHeight, top: topY }}
                    className={`absolute left-0 right-0 flex items-center transition-colors ${
                      isSelected ? 'bg-safira-500/10' : idx % 2 === 0 ? 'bg-transparent' : 'bg-obsidian-900/15'
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
                      className={`absolute flex items-center group cursor-pointer transition-shadow ${
                        isMilestone ? 'justify-center' : ''
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
                            title={`${task.name} • Marco (${task.progress === 100 ? 'Concluído' : 'Pendente'})${task.assignee ? ` • ${task.assignee}` : ''} • [Duplo clique para editar]`}
                            className={`w-7 h-7 rounded-md rotate-45 flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-110 shadow-lg ${
                              task.progress === 100
                                ? 'bg-esmeralda-500 text-obsidian-950 shadow-glow-esmeralda'
                                : 'bg-ouro-500 text-obsidian-950 shadow-glow-ouro'
                            }`}
                          >
                            <Diamond className="w-4 h-4 -rotate-45" />
                          </div>

                          {/* Milestone Label Adjacent */}
                          <div className="absolute left-full ml-3 flex items-center gap-1.5 whitespace-nowrap pointer-events-none z-20">
                            <span className="text-xs font-bold text-ouro-300 drop-shadow-md">
                              {task.name}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 bg-obsidian-900/90 px-1.5 py-0.5 rounded border border-obsidian-750">
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
                          title={`${task.name} • ${task.duration} dias úteis (${task.progress}% concluído)${task.assignee ? ` • ${task.assignee}` : ''} • [Duplo clique para editar]`}
                          style={{
                            borderColor: task.isCritical
                              ? '#F43F5E'
                              : isSelected
                              ? '#38BDF8'
                              : task.color
                              ? `${task.color}90`
                              : '#4F46E5',
                          }}
                          className={`relative w-full h-9 rounded-xl border flex items-center shadow-md cursor-grab active:cursor-grabbing transition-all overflow-visible bg-[#1E293B]/95 backdrop-blur-xs ${
                            task.isCritical ? 'shadow-glow-carmim ring-1 ring-carmim-400/50' : ''
                          } ${isSelected ? 'ring-2 ring-safira-400' : ''}`}
                        >
                          {/* Progress Fill Indicator (Preenchimento elegante) */}
                          <div
                            style={{
                              width: `${task.progress > 0 ? task.progress : 0}%`,
                              backgroundColor: task.color || '#4F46E5',
                            }}
                            className={`absolute left-0 top-0 bottom-0 transition-all ${
                              task.progress === 100 ? 'rounded-xl' : 'rounded-l-xl'
                            }`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20 pointer-events-none" />
                          </div>

                          {/* Base subtle background if 0% progress */}
                          {task.progress === 0 && (
                            <div
                              style={{ backgroundColor: task.color ? `${task.color}30` : 'rgba(79, 70, 229, 0.35)' }}
                              className="absolute inset-0 rounded-xl pointer-events-none"
                            />
                          )}

                          {/* Task Title & Meta Label Inside Bar (quando barra for larga) */}
                          {!isNarrow && (
                            <div className="relative z-10 px-3 flex items-center gap-2 text-xs font-bold text-white truncate pointer-events-none w-full min-w-0">
                              {task.isCritical && (
                                <Flame className="w-3.5 h-3.5 text-carmim-300 animate-pulse shrink-0" />
                              )}
                              <span className="truncate">{task.name}</span>
                              <span className="text-[10px] font-medium text-slate-200/90 shrink-0 tabular-nums bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
                                {task.duration}d{task.progress > 0 ? ` (${task.progress}%)` : ''}
                              </span>
                            </div>
                          )}

                          {/* Short bar: Label to the Right (conforme exibição da imagem de referência) */}
                          {isNarrow && (
                            <>
                              <div className="relative z-10 px-2 flex items-center justify-center pointer-events-none w-full text-[10px] font-bold text-white">
                                {task.duration}d
                              </div>
                              <div className="absolute left-full ml-2.5 flex items-center gap-1.5 whitespace-nowrap pointer-events-none z-20">
                                {task.isCritical && (
                                  <Flame className="w-3.5 h-3.5 text-carmim-300 animate-pulse shrink-0" />
                                )}
                                <span className="text-xs font-bold text-slate-100 drop-shadow-md">
                                  {task.name}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 bg-obsidian-900/90 px-1.5 py-0.5 rounded border border-obsidian-750">
                                  {task.duration}d{task.progress > 0 ? ` (${task.progress}%)` : ''}
                                </span>
                              </div>
                            </>
                          )}

                          {/* Right Edge Resize Handle (Touch target 20px wide) */}
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
                            className="resize-handle absolute right-0 top-0 bottom-0 w-5 bg-black/25 hover:bg-white/30 cursor-ew-resize flex items-center justify-center group-hover:opacity-100 transition-opacity z-20 rounded-r-xl"
                          >
                            <div className="w-1 h-3.5 bg-white/70 rounded-full pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
