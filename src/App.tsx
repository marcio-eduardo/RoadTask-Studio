import React, { useState } from 'react';
import { useGantt } from './context/GanttContext';
import { Task } from './types/gantt';
import { ExecutiveHeader } from './components/layout/ExecutiveHeader';
import { PitchHeader } from './components/layout/PitchHeader';
import { ExecutiveKpiBar } from './components/layout/ExecutiveKpiBar';
import { TapAndBuildToolbar } from './components/layout/TapAndBuildToolbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { GanttTimelineView } from './components/gantt/GanttTimelineView';
import { TaskDeckView } from './components/views/TaskDeckView';
import { TaskTableView } from './components/views/TaskTableView';
import { ScrumView } from './components/views/ScrumView';
import { TaskDrawer } from './components/modals/TaskDrawer';
import { BlueprintSelectorModal } from './components/modals/BlueprintSelectorModal';
import { ExportModal } from './components/modals/ExportModal';
import { SimulationBanner } from './components/modals/SimulationBanner';
import { GuidedTooltipOverlay } from './components/guided/GuidedTooltip';
import { ExecutivePrintReport } from './components/reports/ExecutivePrintReport';

export const App: React.FC = () => {
  const { viewMode, isPitchMode, selectedTask, setSelectedTaskId } = useGantt();

  // Modal States
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);

  const handleEditTask = (task: Task) => {
    setSelectedTaskId(task.id);
    setIsTaskDrawerOpen(true);
  };

  const handleQuickAdd = () => {
    // Scrolls to toolbar or opens drawer
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gantt-canvas text-gantt-text-primary flex flex-col font-sans transition-colors duration-200">
      {/* ======================= CONTROLES DE TELA (NO-PRINT) ======================= */}
      <div className="no-print flex flex-col">
        {/* Executive Header (normal no modo editor, ou PitchHeader limpo no modo apresentação) */}
        {!isPitchMode ? (
          <ExecutiveHeader
            onOpenBlueprints={() => setIsBlueprintModalOpen(true)}
            onOpenExport={() => setIsExportModalOpen(true)}
          />
        ) : (
          <PitchHeader />
        )}

        {/* C-Level KPI Scorecard */}
        <ExecutiveKpiBar />

        {/* What-If Live Simulation Banner */}
        <SimulationBanner />

        {/* Tap-and-Build Visual Toolbar (hidden in Pitch Mode for clean executive projection) */}
        {!isPitchMode && <TapAndBuildToolbar />}
      </div>

      {/* Main Viewport Container (oculto na impressão) */}
      <main className="flex-1 flex flex-col overflow-hidden relative no-print">
        {/* VIEW 1: Timeline (Gantt) */}
        {viewMode === 'timeline' && (
          <GanttTimelineView onSelectTask={handleEditTask} />
        )}

        {/* VIEW 1.5: Scrum Architecture (Épicos & Sprints) */}
        {viewMode === 'scrum' && (
          <ScrumView onEditTask={handleEditTask} />
        )}

        {/* VIEW 2: Deck (Mobile Cards) */}
        {viewMode === 'deck' && (
          <TaskDeckView onEditTask={handleEditTask} />
        )}

        {/* VIEW 3: Table (WBS) */}
        {viewMode === 'table' && (
          <TaskTableView onEditTask={handleEditTask} />
        )}

        {/* VIEW 4: Split View (Table + Gantt) */}
        {viewMode === 'split' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-obsidian-800">
            <div className="w-full lg:w-2/5 h-1/2 lg:h-full flex flex-col overflow-hidden">
              <TaskTableView onEditTask={handleEditTask} />
            </div>
            <div className="w-full lg:w-3/5 h-1/2 lg:h-full flex flex-col overflow-hidden">
              <GanttTimelineView onSelectTask={handleEditTask} />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation for Smartphones (no-print) */}
      <div className="no-print">
        <MobileBottomNav
          onOpenQuickAdd={handleQuickAdd}
          onOpenBlueprints={() => setIsBlueprintModalOpen(true)}
          onOpenExport={() => setIsExportModalOpen(true)}
        />
      </div>

      {/* Modals & Drawers (no-print) */}
      <div className="no-print">
        <TaskDrawer
          task={selectedTask}
          isOpen={isTaskDrawerOpen}
          onClose={() => setIsTaskDrawerOpen(false)}
        />

        <BlueprintSelectorModal
          isOpen={isBlueprintModalOpen}
          onClose={() => setIsBlueprintModalOpen(false)}
        />

        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />

        {/* Global Guided Mode Tooltip & Micro-Animation Layer */}
        <GuidedTooltipOverlay />
      </div>

      {/* =========================================================================
          DOCUMENTAÇÃO EXECUTIVA OFICIAL A4 PARA IMPRESSÃO & EXPORTAÇÃO PDF
         ========================================================================= */}
      <ExecutivePrintReport />
    </div>
  );
};
export default App;
