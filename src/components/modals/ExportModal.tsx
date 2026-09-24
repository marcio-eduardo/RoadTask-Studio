import React, { useState, useMemo } from 'react';
import { useGantt } from '../../context/GanttContext';
import { exportToMermaid, importFromMermaid } from '../../engine/mermaidEngine';
import {
  X,
  Copy,
  Check,
  Code2,
  FileJson,
  Printer,
  Download,
  Upload,
  Layers,
} from 'lucide-react';
import { generateScrumSvg, downloadScrumSvg } from '../../engine/scrumSvgEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { project, loadProject } = useGantt();

  const [activeTab, setActiveTab] = useState<'mermaid' | 'json' | 'print' | 'scrum-svg'>('scrum-svg');
  const [copied, setCopied] = useState(false);
  const [mermaidInput, setMermaidInput] = useState('');

  const mermaidCode = useMemo(() => {
    return exportToMermaid(project);
  }, [project]);

  const jsonCode = useMemo(() => {
    return JSON.stringify(project, null, 2);
  }, [project]);

  const scrumSvgCode = useMemo(() => {
    return generateScrumSvg(project);
  }, [project]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMermaid = () => {
    const blob = new Blob([mermaidCode], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_gantt.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonCode], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_gantt.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportMermaid = () => {
    if (!mermaidInput.trim()) return;
    const partialTasks = importFromMermaid(mermaidInput);
    if (partialTasks.length === 0) {
      alert('Nenhuma atividade reconhecida na sintaxe Mermaid.');
      return;
    }

    if (confirm(`Importar ${partialTasks.length} atividades do código Mermaid?`)) {
      const cloned = JSON.parse(JSON.stringify(project));
      cloned.tasks = partialTasks.map((t, idx) => ({
        ...t,
        id: `m_${Date.now()}_${idx}`,
        startDate: cloned.tasks[0]?.startDate || '2026-09-21',
        endDate: cloned.tasks[0]?.startDate || '2026-09-21',
        progress: t.progress || 0,
        dependencies: [],
      }));
      loadProject(cloned);
      onClose();
    }
  };

  const handleTriggerPrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn no-print">
      <div className="bg-obsidian-900 border border-obsidian-750 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-800 bg-obsidian-850">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-safira-400" />
            <h2 className="text-base font-extrabold text-white">
              Exportação & Interoperabilidade Executiva
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-obsidian-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('scrum-svg')}
            className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'scrum-svg'
                ? 'border-safira-500 text-safira-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Diagrama Scrum (SVG)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mermaid')}
            className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'mermaid'
                ? 'border-safira-500 text-safira-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Mermaid.js</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'json'
                ? 'border-safira-500 text-safira-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>JSON / Backup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('print')}
            className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'print'
                ? 'border-safira-500 text-safira-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Impressão / PDF Executivo</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'mermaid' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  Código Mermaid pronto para GitHub, Notion, Documentação ou Apresentações:
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadMermaid}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-esmeralda-600 hover:bg-esmeralda-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    title="Baixar arquivo Markdown (.md) com o código Mermaid"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Mermaid (.md)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(mermaidCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-safira-600 hover:bg-safira-500 text-white rounded-xl text-xs font-bold transition-all shadow-glow-safira cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>
              </div>

              <pre className="bg-obsidian-950 border border-obsidian-800 rounded-2xl p-4 text-xs font-mono text-safira-300 overflow-x-auto max-h-56 scrollbar-thin">
                {mermaidCode}
              </pre>

              <div className="pt-4 border-t border-obsidian-800">
                <label className="block text-xs font-bold text-white mb-1.5">
                  Importar de sintaxe Mermaid:
                </label>
                <textarea
                  value={mermaidInput}
                  onChange={e => setMermaidInput(e.target.value)}
                  placeholder="Cole aqui seu código Mermaid gantt para importar tarefas..."
                  rows={3}
                  className="w-full bg-obsidian-950 border border-obsidian-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-safira-500"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleImportMermaid}
                    disabled={!mermaidInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-obsidian-800 hover:bg-obsidian-750 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-bold transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importar para o Projeto</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Arquivo JSON estruturado com todas as tarefas, dependências, baseline e calendário:
              </p>
              <pre className="bg-obsidian-950 border border-obsidian-800 rounded-2xl p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-64 scrollbar-thin">
                {jsonCode}
              </pre>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(jsonCode)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-obsidian-800 hover:bg-obsidian-750 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 px-4 py-2 bg-safira-600 hover:bg-safira-500 text-white rounded-xl text-xs font-bold shadow-glow-safira"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Arquivo .json</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'scrum-svg' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  Diagrama vetorial da arquitetura Scrum por Épicos, Histórias e Sprint gerado em tempo real:
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(scrumSvgCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-obsidian-800 hover:bg-obsidian-750 text-slate-200 rounded-xl text-xs font-bold transition-all border border-obsidian-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar SVG'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadScrumSvg(project)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-safira-600 hover:bg-safira-500 text-white rounded-xl text-xs font-bold transition-all shadow-glow-safira"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Arquivo .SVG</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-300 overflow-x-auto max-h-96">
                <div
                  className="min-w-[1000px] flex justify-center"
                  dangerouslySetInnerHTML={{ __html: scrumSvgCode }}
                />
              </div>
            </div>
          )}

          {activeTab === 'print' && (
            <div className="space-y-4 text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-esmeralda-500/10 border border-esmeralda-500/20 text-esmeralda-400 flex items-center justify-center mx-auto">
                <Printer className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">
                Relatório Executivo para Impressão & PDF A4
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Formatação automática em modo paisagem (A4 Landscape) com cabeçalho corporativo, scorecards de KPIs e diagrama vetorial cristalino.
              </p>
              <button
                type="button"
                onClick={handleTriggerPrint}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-esmeralda-600 to-safira-600 hover:from-esmeralda-500 hover:to-safira-500 text-white font-bold rounded-2xl text-sm shadow-glow-esmeralda transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Salvar como PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
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
