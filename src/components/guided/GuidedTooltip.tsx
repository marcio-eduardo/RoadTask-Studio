import React, { useEffect, useState, useRef } from 'react';
import { useGuidedAccess } from '../../context/GuidedAccessContext';
import { GuidedMicroAnimation } from './GuidedMicroAnimation';
import { Sparkles, X, Lightbulb } from 'lucide-react';

export const GuidedTooltipOverlay: React.FC = () => {
  const { isGuidedMode, activeTopic, activeTopicTargetRect, hideTopic } = useGuidedAccess();
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isGuidedMode || !activeTopic || !activeTopicTargetRect) {
      setCoords(null);
      return;
    }

    const updatePosition = () => {
      const rect = activeTopicTargetRect;
      const tooltipWidth = Math.min(360, window.innerWidth - 32);
      const tooltipEstimatedHeight = 320;

      // Prefer below target, fallback above target if bottom exceeds screen
      let top = rect.bottom + 12;
      if (top + tooltipEstimatedHeight > window.innerHeight && rect.top - tooltipEstimatedHeight > 10) {
        top = rect.top - tooltipEstimatedHeight - 12;
      }

      // Center horizontally relative to target
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;

      // Prevent overflow horizontally
      if (left < 16) left = 16;
      if (left + tooltipWidth > window.innerWidth - 16) {
        left = window.innerWidth - tooltipWidth - 16;
      }

      setCoords({ top, left });
    };

    updatePosition();
  }, [isGuidedMode, activeTopic, activeTopicTargetRect]);

  if (!isGuidedMode || !activeTopic || !coords) {
    return null;
  }

  return (
    <div
      ref={tooltipRef}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
      className="fixed z-50 w-[92vw] max-w-[360px] bg-[#0B1120] border border-safira-500/50 rounded-2xl p-3.5 shadow-2xl shadow-black transition-all animate-in fade-in zoom-in-95 pointer-events-none"
    >
      {/* Header Badge & Close Button */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-safira-500/20 border border-safira-500/30 text-safira-400 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          <span>{activeTopic.category}</span>
        </div>

        <button
          type="button"
          onClick={hideTopic}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-obsidian-800 transition-colors pointer-events-auto cursor-pointer"
          title="Fechar dica"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-sm font-extrabold text-white tracking-tight mb-2">
        {activeTopic.title}
      </h3>

      {/* Micro-Animation Canvas */}
      <div className="mb-2.5">
        <GuidedMicroAnimation type={activeTopic.animationType} />
      </div>

      {/* Simplified Concept Explanation */}
      <div className="space-y-2 text-xs">
        <div className="p-2 rounded-xl bg-obsidian-950 border border-obsidian-800">
          <p className="text-slate-300 font-normal leading-relaxed text-[11px]">
            <span className="text-safira-400 font-semibold block mb-0.5">O que é no Gantt:</span>
            {activeTopic.concept}
          </p>
        </div>

        <div className="flex items-start gap-2 px-1 text-slate-400 text-[10.5px]">
          <Lightbulb className="w-3.5 h-3.5 text-ouro-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong className="text-slate-200">Como usar:</strong> {activeTopic.howToUse}
          </p>
        </div>
      </div>
    </div>
  );
};

interface GuidedTargetProps {
  topicId: string;
  children: React.ReactElement;
  className?: string;
}

export const GuidedTarget: React.FC<GuidedTargetProps> = ({ topicId, children, className = '' }) => {
  const { isGuidedMode, showTopic, hideTopic } = useGuidedAccess();
  const targetRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (isGuidedMode && targetRef.current) {
      showTopic(topicId, targetRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (isGuidedMode) {
      hideTopic();
    }
  };

  return (
    <div
      ref={targetRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex ${
        isGuidedMode
          ? 'ring-1 ring-safira-400/40 hover:ring-safira-400/90 rounded-xl transition-all cursor-help'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
