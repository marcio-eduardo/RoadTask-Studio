import React from 'react';
import { useGantt } from '../../context/GanttContext';
import { BLUEPRINTS } from '../../data/blueprints';
import { X, Truck, Code, Cloud, PlusCircle, Check, ArrowRight } from 'lucide-react';

interface BlueprintSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlueprintSelectorModal: React.FC<BlueprintSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { loadBlueprint, project } = useGantt();

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Truck':
        return <Truck className="w-6 h-6 text-safira-400" />;
      case 'Code':
        return <Code className="w-6 h-6 text-esmeralda-400" />;
      case 'Cloud':
        return <Cloud className="w-6 h-6 text-ouro-400" />;
      default:
        return <PlusCircle className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-obsidian-900 border border-obsidian-750 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-obsidian-800 bg-obsidian-850">
          <div>
            <h2 className="text-base font-extrabold text-white">
              Modelos de Engenharia & Blueprints
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Carregue um projeto executivo pré-configurado ou inicie um novo em branco.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Blueprint List */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {BLUEPRINTS.map(bp => {
            const isCurrent = project.name === bp.project.name;

            return (
              <div
                key={bp.id}
                onClick={() => {
                  loadBlueprint(bp.id);
                  onClose();
                }}
                className={`bg-obsidian-850 border rounded-2xl p-4 transition-all cursor-pointer flex items-start gap-4 hover:border-safira-500 hover:shadow-glow-safira ${
                  isCurrent ? 'border-safira-500/80 bg-safira-500/5 ring-1 ring-safira-500/40' : 'border-obsidian-750'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-obsidian-800 border border-obsidian-700 flex items-center justify-center shrink-0">
                  {getIcon(bp.icon)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-white text-sm tracking-tight truncate">
                      {bp.name}
                    </h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold bg-safira-500/20 text-safira-300 border border-safira-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" />
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {bp.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                    <span>{bp.project.tasks.length} atividades</span>
                    <span>•</span>
                    <span>{bp.project.tasks.filter(t => t.isMilestone).length} marcos</span>
                  </div>
                </div>

                <div className="self-center pl-2 text-slate-500 group-hover:text-safira-400 shrink-0">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-obsidian-800 bg-obsidian-850 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 font-semibold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
