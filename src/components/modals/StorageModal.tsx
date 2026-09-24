import React, { useState, useEffect } from 'react';
import { useGantt } from '../../context/GanttContext';
import {
  X,
  HardDrive,
  Cloud,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Save,
  Trash2,
  Settings2,
  CheckCircle2,
} from 'lucide-react';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  checkApiHealth,
  listRemoteProjects,
  saveRemoteProject,
  fetchRemoteProject,
  deleteRemoteProject,
  RemoteProjectSummary,
  ApiHealthResponse,
} from '../../services/apiClient';

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'windows' | 'cloud';
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

  const [activeTab, setActiveTab] = useState<'windows' | 'cloud'>(initialTab);

  // Cloud / Backend State
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [apiHealth, setApiHealth] = useState<ApiHealthResponse | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [remoteProjects, setRemoteProjects] = useState<RemoteProjectSummary[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

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
    const res = await checkApiHealth();
    setIsCheckingHealth(false);
    if (res.success && res.data) {
      setApiHealth(res.data);
      loadRemoteList();
    } else {
      setApiHealth(null);
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
      setSyncMessage({
        text: `Projeto '${project.name}' salvo na nuvem com sucesso!`,
        type: 'success',
      });
      loadRemoteList();
    } else {
      setSyncMessage({
        text: res.error || 'Falha ao salvar projeto na nuvem.',
        type: 'error',
      });
    }
  };

  const handleLoadRemoteProject = async (id: string, name: string) => {
    setLoadingProjectId(id);
    const res = await fetchRemoteProject(id);
    setLoadingProjectId(null);
    if (res.success && res.project) {
      loadProject(res.project);
      setSyncMessage({
        text: `Projeto '${res.project.name}' carregado da nuvem para o editor!`,
        type: 'success',
      });
    } else {
      setSyncMessage({
        text: res.error || `Erro ao carregar projeto '${name}'.`,
        type: 'error',
      });
    }
  };

  const handleDeleteRemoteProject = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir o projeto "${name}" da nuvem?\n\nEsta operação removerá o projeto do banco de dados remoto.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    const res = await deleteRemoteProject(id);
    setDeletingId(null);
    if (res.success) {
      setSyncMessage({
        text: `Projeto "${name}" foi excluído com sucesso da nuvem.`,
        type: 'success',
      });
      loadRemoteList();
    } else {
      setSyncMessage({
        text: res.error || `Falha ao excluir o projeto "${name}".`,
        type: 'error',
      });
    }
  };

  const handleSaveApiUrl = () => {
    setApiBaseUrl(apiUrl);
    setIsEditingUrl(false);
    handleCheckHealth();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-obsidian-900 border border-obsidian-750 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-800 bg-obsidian-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-safira-500/10 border border-safira-500/30 flex items-center justify-center text-safira-400">
              {activeTab === 'windows' ? (
                <HardDrive className="w-5 h-5" />
              ) : (
                <Cloud className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Persistência & Armazenamento
              </h2>
              <p className="text-xs text-slate-400">
                Salve na sua pasta local ou gerencie projetos diretamente na Nuvem.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-obsidian-800 transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Simplificado conforme Layout05: Pasta Local e Nuvem) */}
        <div className="flex border-b border-obsidian-800 bg-obsidian-950 px-6 pt-2 gap-2">
          {/* Tab 1: Pasta Local */}
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
            <span>Pasta Local</span>
            {linkedFileName && (
              <span className="w-2 h-2 rounded-full bg-esmeralda-400 animate-pulse" />
            )}
          </button>

          {/* Tab 2: Nuvem */}
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
            <span>Nuvem</span>
            {apiHealth && (
              <span className="w-2 h-2 rounded-full bg-esmeralda-400" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* ===================== TAB 1: PASTA LOCAL (WINDOWS) ===================== */}
          {activeTab === 'windows' && (
            <div className="space-y-4">
              {/* Linked File Card */}
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-obsidian-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      linkedFileName
                        ? 'bg-esmeralda-500/10 border-esmeralda-500/30 text-esmeralda-400'
                        : 'bg-obsidian-850 border-obsidian-750 text-slate-500'
                    }`}
                  >
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {linkedFileName
                        ? 'Arquivo Vinculado no Computador'
                        : 'Nenhum Arquivo Local Vinculado'}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono mt-0.5">
                      {linkedFileName
                        ? linkedFileName
                        : 'As alterações estão sendo salvas no LocalStorage do navegador.'}
                    </span>
                  </div>
                </div>

                {linkedFileName ? (
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => saveToWindows(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-esmeralda-600 hover:bg-esmeralda-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-glow-esmeralda"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Agora (Ctrl+S)</span>
                    </button>
                    <button
                      type="button"
                      onClick={unlinkWindowsFile}
                      className="px-2.5 py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      title="Desvincular arquivo local"
                    >
                      Desvincular
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => saveToWindows(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-safira-600 hover:bg-safira-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-glow-safira self-end sm:self-center"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar em Pasta Local</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => saveToWindows(true)}
                  className="p-4 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-750 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-safira-400 mb-1.5 font-bold text-xs">
                    <Save className="w-4 h-4" />
                    <span>Salvar Como / Nova Pasta...</span>
                  </div>
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
                    Abre a janela nativa do Windows Explorer para escolher onde salvar o arquivo{' '}
                    <code className="text-white">.roadtask.json</code>.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={openFromWindows}
                  className="p-4 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-750 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-ouro-400 mb-1.5 font-bold text-xs">
                    <FolderOpen className="w-4 h-4" />
                    <span>Abrir Arquivo do Computador...</span>
                  </div>
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
                    Carrega um arquivo de cronograma previamente salvo no seu computador de volta para o editor.
                  </p>
                </button>
              </div>

              {/* Help tip */}
              <div className="p-3.5 rounded-2xl bg-safira-500/5 border border-safira-500/20 text-xs text-slate-300 space-y-1.5">
                <span className="font-bold text-safira-300 block">
                  💡 Salvamento nativo sem downloads repetidos:
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Usando a <strong>File System Access API</strong>, uma vez vinculado o arquivo, o editor grava diretamente nele ao pressionar <strong>Ctrl+S</strong>, sem duplicar arquivos na pasta Downloads.
                </p>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: NUVEM (LAYOUT05) ===================== */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              {/* Top Action Card: Salvar na Nuvem (Conforme Layout05) */}
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-obsidian-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white block truncate">
                      {project.name}
                    </span>
                    <span className="text-[10px] bg-safira-500/10 text-safira-400 px-2 py-0.5 rounded-full border border-safira-500/20 shrink-0 font-medium">
                      Projeto Ativo
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {project.tasks.length} {project.tasks.length === 1 ? 'tarefa' : 'tarefas'} •{' '}
                    {project.clientName || 'Cliente Corporativo'}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSaveToCloud}
                    disabled={isSyncing || (!apiHealth && !isCheckingHealth)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-esmeralda-600 hover:bg-esmeralda-500 disabled:bg-obsidian-800 disabled:text-slate-500 text-white font-bold text-xs transition-all cursor-pointer shadow-glow-esmeralda"
                    title="Salvar ou atualizar o projeto atual no banco de dados na nuvem"
                  >
                    <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
                    <span>{isSyncing ? 'Salvando na Nuvem...' : 'Salvar na Nuvem'}</span>
                  </button>
                </div>
              </div>

              {/* Status & Feedback Messages */}
              {syncMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fadeIn ${
                    syncMessage.type === 'success'
                      ? 'bg-esmeralda-500/10 border-esmeralda-500/30 text-esmeralda-300'
                      : 'bg-carmim-500/10 border-carmim-500/30 text-carmim-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {syncMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-esmeralda-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-carmim-400" />
                    )}
                    <span>{syncMessage.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSyncMessage(null)}
                    className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Offline Warning Banner */}
              {!apiHealth && !isCheckingHealth && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Servidor de nuvem desconectado. Verifique se o backend está em execução.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckHealth}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                  >
                    Reconectar
                  </button>
                </div>
              )}

              {/* Remote Projects List Section */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Projetos na Nuvem ({remoteProjects.length})
                  </span>
                  <button
                    type="button"
                    onClick={loadRemoteList}
                    disabled={isLoadingProjects || !apiHealth}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-850 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                    title="Atualizar lista da nuvem"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isLoadingProjects ? 'animate-spin' : ''}`}
                    />
                    <span className="text-[11px]">Atualizar</span>
                  </button>
                </div>

                {isLoadingProjects ? (
                  <div className="p-6 rounded-2xl bg-obsidian-950 border border-obsidian-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-safira-400" />
                    <span>Buscando projetos na nuvem...</span>
                  </div>
                ) : remoteProjects.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-obsidian-950 border border-obsidian-800 text-center text-xs text-slate-500">
                    Nenhum projeto salvo na nuvem ainda. Clique em &quot;Salvar na Nuvem&quot; acima para registrar seu primeiro projeto.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {remoteProjects.map(rp => (
                      <div
                        key={rp.id}
                        className="p-3.5 rounded-2xl bg-obsidian-850 border border-obsidian-750 flex items-center justify-between gap-3 hover:border-safira-500/40 transition-all group"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-white block truncate group-hover:text-safira-300 transition-colors">
                            {rp.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                            {rp.clientName || 'Cliente'} • {rp.taskCount}{' '}
                            {rp.taskCount === 1 ? 'tarefa' : 'tarefas'} • Atualizado em {rp.updatedAt}
                          </span>
                        </div>

                        {/* Botões: Carregar e Excluir (Conforme Layout05) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleLoadRemoteProject(rp.id, rp.name)}
                            disabled={loadingProjectId === rp.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-safira-600/20 hover:bg-safira-600 text-safira-300 hover:text-white border border-safira-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            title="Carregar projeto da nuvem no editor"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>{loadingProjectId === rp.id ? 'Abrindo...' : 'Carregar'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRemoteProject(rp.id, rp.name)}
                            disabled={deletingId === rp.id}
                            className="p-1.5 rounded-xl bg-carmim-500/10 hover:bg-carmim-600 text-carmim-400 hover:text-white border border-carmim-500/20 hover:border-carmim-500 text-xs transition-all cursor-pointer disabled:opacity-50"
                            title={`Excluir "${rp.name}" da nuvem`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Informação técnica recolhida (Ocultada por padrão conforme Layout05) */}
              <div className="pt-2 border-t border-obsidian-850">
                <button
                  type="button"
                  onClick={() => setIsEditingUrl(prev => !prev)}
                  className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-400 transition-colors cursor-pointer"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>Configuração de Conexão</span>
                </button>

                {isEditingUrl && (
                  <div className="mt-2.5 p-3 rounded-xl bg-obsidian-950 border border-obsidian-800 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>URL do Backend:</span>
                      <span className="font-mono text-slate-300">{apiUrl}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={apiUrl}
                        onChange={e => setApiUrlState(e.target.value)}
                        placeholder="http://localhost:8000/api"
                        className="flex-1 bg-obsidian-850 border border-safira-500/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
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
                        Fechar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
