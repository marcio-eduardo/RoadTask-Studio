import React, { useState, useEffect } from 'react';
import { useGantt } from '../../context/GanttContext';
import {
  X,
  HardDrive,
  Cloud,
  Check,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Save,
  Download,
  Copy,
  Server,
} from 'lucide-react';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  checkApiHealth,
  listRemoteProjects,
  saveRemoteProject,
  fetchRemoteProject,
  RemoteProjectSummary,
  ApiHealthResponse,
} from '../../services/apiClient';
import { exportToMermaid } from '../../engine/mermaidEngine';

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'windows' | 'cloud' | 'export';
}

export const StorageModal: React.FC<StorageModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'windows',
}) => {
  const {
    project,
    loadProject,
    linkedFileName,
    saveToWindows,
    openFromWindows,
    unlinkWindowsFile,
  } = useGantt();

  const [activeTab, setActiveTab] = useState<'windows' | 'cloud' | 'export'>(initialTab);

  // Cloud / Backend State
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [apiHealth, setApiHealth] = useState<ApiHealthResponse | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [remoteProjects, setRemoteProjects] = useState<RemoteProjectSummary[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Export State
  const [copiedMermaid, setCopiedMermaid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (initialTab === 'cloud') {
        handleCheckHealth();
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleCheckHealth = async () => {
    setIsCheckingHealth(true);
    setHealthError(null);
    const res = await checkApiHealth();
    setIsCheckingHealth(false);
    if (res.success && res.data) {
      setApiHealth(res.data);
      loadRemoteList();
    } else {
      setApiHealth(null);
      setHealthError(res.error || 'Servidor offline');
    }
  };

  const loadRemoteList = async () => {
    setIsLoadingProjects(true);
    const res = await listRemoteProjects();
    setIsLoadingProjects(false);
    if (res.success && res.projects) {
      setRemoteProjects(res.projects);
    }
  };

  const handleSaveToCloud = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    const res = await saveRemoteProject(project);
    setIsSyncing(false);
    if (res.success) {
      setSyncMessage({ text: 'Projeto sincronizado com sucesso no backend Python!', type: 'success' });
      loadRemoteList();
    } else {
      setSyncMessage({ text: res.error || 'Falha ao sincronizar projeto.', type: 'error' });
    }
  };

  const handleLoadRemoteProject = async (id: string) => {
    const res = await fetchRemoteProject(id);
    if (res.success && res.project) {
      loadProject(res.project);
      setSyncMessage({ text: `Projeto '${res.project.name}' carregado do servidor!`, type: 'success' });
    } else {
      alert(res.error || 'Erro ao carregar projeto.');
    }
  };

  const handleSaveApiUrl = () => {
    setApiBaseUrl(apiUrl);
    setIsEditingUrl(false);
    handleCheckHealth();
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.roadtask.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMermaid = () => {
    const mmd = exportToMermaid(project);
    navigator.clipboard.writeText(mmd);
    setCopiedMermaid(true);
    setTimeout(() => setCopiedMermaid(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-obsidian-900 border border-obsidian-750 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-800 bg-obsidian-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-safira-500/10 border border-safira-500/30 flex items-center justify-center text-safira-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Persistência & Armazenamento de Dados
              </h2>
              <p className="text-xs text-slate-400">
                Escolha salvar localmente no seu computador (Windows) ou sincronizar via Backend Python / Nuvem.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-obsidian-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-obsidian-800 bg-obsidian-950 px-6 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('windows')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'windows'
                ? 'border-safira-500 text-white bg-obsidian-900/60 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4 text-safira-400" />
            <span>Pasta do Windows (Local)</span>
            {linkedFileName && (
              <span className="w-2 h-2 rounded-full bg-esmeralda-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('cloud');
              if (!apiHealth) handleCheckHealth();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'cloud'
                ? 'border-safira-500 text-white bg-obsidian-900/60 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-esmeralda-400" />
            <span>Backend Python / NoSQL</span>
            {apiHealth && (
              <span className="w-2 h-2 rounded-full bg-esmeralda-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'border-safira-500 text-white bg-obsidian-900/60 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4 text-ouro-400" />
            <span>Exportação & Backup</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: WINDOWS FILE SYSTEM */}
          {activeTab === 'windows' && (
            <div className="space-y-4">
              {/* Linked File Card */}
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-obsidian-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    linkedFileName
                      ? 'bg-esmeralda-500/10 border-esmeralda-500/30 text-esmeralda-400'
                      : 'bg-obsidian-850 border-obsidian-750 text-slate-500'
                  }`}>
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {linkedFileName ? 'Arquivo Vinculado no Windows' : 'Nenhum Arquivo Local Vinculado'}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono mt-0.5">
                      {linkedFileName ? linkedFileName : 'As alterações estão sendo salvas no LocalStorage do navegador.'}
                    </span>
                  </div>
                </div>

                {linkedFileName ? (
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={saveToWindows}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-esmeralda-600 hover:bg-esmeralda-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-glow-esmeralda"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Agora (Ctrl+S)</span>
                    </button>
                    <button
                      type="button"
                      onClick={unlinkWindowsFile}
                      className="px-2.5 py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      title="Desvincular arquivo"
                    >
                      Desvincular
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={saveToWindows}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-safira-600 hover:bg-safira-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-glow-safira self-end sm:self-center"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar em Pasta do Windows</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={saveToWindows}
                  className="p-4 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-750 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-safira-400 mb-1.5 font-bold text-xs">
                    <Save className="w-4 h-4" />
                    <span>Salvar Como / Nova Pasta...</span>
                  </div>
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
                    Abre a janela nativa do Windows Explorer para escolher onde salvar o arquivo <code className="text-white">.roadtask.json</code>.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={openFromWindows}
                  className="p-4 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-750 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-ouro-400 mb-1.5 font-bold text-xs">
                    <FolderOpen className="w-4 h-4" />
                    <span>Abrir Arquivo do Windows...</span>
                  </div>
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
                    Carrega um arquivo de cronograma previamente salvo no seu computador de volta para o editor.
                  </p>
                </button>
              </div>

              {/* How it works info */}
              <div className="p-3.5 rounded-2xl bg-safira-500/5 border border-safira-500/20 text-xs text-slate-300 space-y-1.5">
                <span className="font-bold text-safira-300 block">💡 Como funciona o salvamento nativo do Windows:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Usando a <strong>File System Access API</strong>, uma vez escolhido o arquivo, o editor salva diretamente por cima dele sem criar arquivos duplicados <code className="text-slate-300">cronograma (1).json</code> e sem downloads repetitivos. Pressione <strong>Ctrl+S</strong> a qualquer momento para salvar.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CLOUD & PYTHON BACKEND */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              {/* Server Connection Status */}
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-obsidian-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Server className="w-4 h-4 text-esmeralda-400" />
                    <span className="text-xs font-bold text-white">Servidor Python (FastAPI + NoSQL)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {apiHealth ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-esmeralda-400 bg-esmeralda-500/10 px-2 py-0.5 rounded-full border border-esmeralda-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-esmeralda-400" />
                        Online ({apiHealth.database?.engine || 'NoSQL'})
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-carmim-400 bg-carmim-500/10 px-2 py-0.5 rounded-full border border-carmim-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-carmim-400" />
                        Desconectado
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleCheckHealth}
                      disabled={isCheckingHealth}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
                      title="Testar conexão"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* API URL Config */}
                <div className="pt-2 border-t border-obsidian-850 flex items-center justify-between text-xs">
                  {isEditingUrl ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={apiUrl}
                        onChange={e => setApiUrlState(e.target.value)}
                        placeholder="http://localhost:8000/api"
                        className="flex-1 bg-obsidian-850 border border-safira-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSaveApiUrl}
                        className="px-2.5 py-1 bg-safira-600 hover:bg-safira-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingUrl(false)}
                        className="px-2.5 py-1 bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 rounded-lg text-xs cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-slate-400 text-[11px] font-mono truncate">
                        Endpoint: <span className="text-slate-200">{apiUrl}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingUrl(true)}
                        className="text-[11px] text-safira-400 hover:underline cursor-pointer ml-2 shrink-0"
                      >
                        Alterar URL
                      </button>
                    </>
                  )}
                </div>

                {healthError && (
                  <div className="p-2.5 rounded-xl bg-carmim-500/10 border border-carmim-500/20 text-xs text-carmim-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span>Não foi possível conectar ao backend Python:</span>
                      <p className="text-[11px] text-carmim-400/80 font-mono mt-0.5">{healthError}</p>
                      <p className="text-[10.5px] text-slate-400 mt-1">
                        Dica: Inicie o container com <code className="text-white bg-obsidian-850 px-1 py-0.5 rounded">docker compose up -d</code> ou execute o servidor localmente em <code className="text-white bg-obsidian-850 px-1 py-0.5 rounded">backend/main.py</code>.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sync Actions */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveToCloud}
                  disabled={isSyncing || !apiHealth}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-esmeralda-600 hover:bg-esmeralda-500 disabled:bg-obsidian-800 disabled:text-slate-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-glow-esmeralda"
                >
                  <Cloud className="w-4 h-4" />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Projeto Atual no Backend'}</span>
                </button>

                <button
                  type="button"
                  onClick={loadRemoteList}
                  disabled={isLoadingProjects || !apiHealth}
                  className="px-3 py-2.5 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 font-bold text-xs border border-obsidian-750 transition-colors cursor-pointer"
                  title="Atualizar lista de projetos remotos"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProjects ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {syncMessage && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  syncMessage.type === 'success'
                    ? 'bg-esmeralda-500/10 border-esmeralda-500/30 text-esmeralda-300'
                    : 'bg-carmim-500/10 border-carmim-500/30 text-carmim-300'
                }`}>
                  {syncMessage.type === 'success' ? (
                    <Check className="w-4 h-4 shrink-0 text-esmeralda-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-carmim-400" />
                  )}
                  <span>{syncMessage.text}</span>
                </div>
              )}

              {/* Remote Projects List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Projetos Salvos no Backend ({remoteProjects.length})
                </span>

                {remoteProjects.length === 0 ? (
                  <div className="p-4 rounded-xl bg-obsidian-950 border border-obsidian-800 text-center text-xs text-slate-500">
                    Nenhum projeto salvo no servidor ainda.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {remoteProjects.map(rp => (
                      <div
                        key={rp.id}
                        className="p-3 rounded-xl bg-obsidian-850 border border-obsidian-750 flex items-center justify-between gap-3 hover:border-safira-500/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block truncate">{rp.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {rp.clientName || 'Cliente'} • {rp.taskCount} tarefas • Atualizado em {rp.updatedAt}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleLoadRemoteProject(rp.id)}
                          className="px-3 py-1 rounded-lg bg-safira-600/20 hover:bg-safira-600 text-safira-300 hover:text-white border border-safira-500/30 text-xs font-bold transition-colors cursor-pointer shrink-0"
                        >
                          Carregar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT & BACKUP */}
          {activeTab === 'export' && (
            <div className="space-y-3">
              {/* Option 1: Download JSON */}
              <div className="p-4 rounded-2xl bg-obsidian-850 border border-obsidian-750 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block">Download do Arquivo JSON</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Baixa o arquivo <code className="text-slate-300">.roadtask.json</code> clássico pelo navegador.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-safira-600 hover:bg-safira-500 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar JSON</span>
                </button>
              </div>

              {/* Option 2: Copy Mermaid */}
              <div className="p-4 rounded-2xl bg-obsidian-850 border border-obsidian-750 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block">Copiar Código Mermaid Gantt</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Gera a sintaxe textual do Mermaid com seções, durações e dependências.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMermaid}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-750 hover:bg-obsidian-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {copiedMermaid ? <Check className="w-3.5 h-3.5 text-esmeralda-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMermaid ? 'Copiado!' : 'Copiar Mermaid'}</span>
                </button>
              </div>

              {/* Option 3: Standalone HTML */}
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-obsidian-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block">Aplicativo Standalone Único (editor_cronograma.html)</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    O RoadTask Studio pode ser distribuído como um único arquivo HTML autocontido que roda 100% offline.
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-safira-400 bg-safira-500/10 px-2 py-1 rounded border border-safira-500/20 shrink-0">
                  Pronto na raiz
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
