import { Project } from '../types/gantt';

export interface RemoteProjectSummary {
  id: string;
  name: string;
  clientName?: string;
  description?: string;
  targetDate?: string;
  updatedAt: string;
  taskCount: number;
}

export interface ApiHealthResponse {
  status: string;
  service: string;
  database?: {
    status: string;
    engine: string;
    uri?: string;
    path?: string;
    detail?: string;
  };
}

const STORAGE_API_KEY = 'roadtask_custom_api_url';

export function getDefaultApiUrl(): string {
  if ((import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:8000/api';
}

export function getApiBaseUrl(): string {
  try {
    const custom = localStorage.getItem(STORAGE_API_KEY);
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  } catch {
    // Fallback
  }
  return getDefaultApiUrl().replace(/\/+$/, '');
}

export function setApiBaseUrl(url: string) {
  try {
    if (!url || !url.trim() || url.trim() === getDefaultApiUrl()) {
      localStorage.removeItem(STORAGE_API_KEY);
    } else {
      localStorage.setItem(STORAGE_API_KEY, url.trim().replace(/\/+$/, ''));
    }
  } catch {
    // Ignore
  }
}

export async function checkApiHealth(): Promise<{ success: boolean; data?: ApiHealthResponse; error?: string }> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      return { success: false, error: `Servidor retornou status HTTP ${res.status}` };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Não foi possível conectar ao servidor Python.',
    };
  }
}

export async function listRemoteProjects(): Promise<{ success: boolean; projects?: RemoteProjectSummary[]; error?: string }> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/projects`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      return { success: false, error: `Erro ${res.status} ao listar projetos remotos.` };
    }
    const projects = await res.json();
    return { success: true, projects };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro de conexão com o servidor.' };
  }
}

export async function fetchRemoteProject(projectId: string): Promise<{ success: boolean; project?: Project; error?: string }> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/projects/${encodeURIComponent(projectId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      return { success: false, error: `Erro ${res.status} ao carregar projeto ${projectId}.` };
    }
    const project = await res.json();
    return { success: true, project };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro ao carregar projeto do servidor.' };
  }
}

export async function saveRemoteProject(project: Project): Promise<{ success: boolean; error?: string }> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (!res.ok) {
      let detailMsg = '';
      try {
        const errJson = await res.json();
        if (errJson && errJson.detail) {
          if (Array.isArray(errJson.detail)) {
            detailMsg = ': ' + errJson.detail.map((d: any) => `${d.loc ? d.loc.slice(-2).join('.') + ': ' : ''}${d.msg}`).join(', ');
          } else if (typeof errJson.detail === 'string') {
            detailMsg = ': ' + errJson.detail;
          }
        }
      } catch {
        // Ignora falha de parse
      }
      return { success: false, error: `Erro ${res.status} ao salvar projeto no servidor${detailMsg}.` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha ao enviar projeto para o servidor.' };
  }
}

export async function deleteRemoteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/projects/${encodeURIComponent(projectId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      let detailMsg = '';
      try {
        const errJson = await res.json();
        if (errJson && errJson.detail) {
          detailMsg = ': ' + (typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail));
        }
      } catch {
        // Ignora falha de parse
      }
      return { success: false, error: `Erro ${res.status} ao excluir projeto${detailMsg}.` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha ao solicitar exclusão no servidor.' };
  }
}
