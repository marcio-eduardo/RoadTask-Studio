import { Project } from '../types/gantt';

export interface WindowsSaveResult {
  success: boolean;
  handle?: FileSystemFileHandle;
  fileName?: string;
  cancelled?: boolean;
  error?: string;
}

export interface WindowsOpenResult {
  success: boolean;
  project?: Project;
  handle?: FileSystemFileHandle;
  fileName?: string;
  cancelled?: boolean;
  error?: string;
}

/**
 * Checks if the browser natively supports the File System Access API (Chromium / Windows).
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
}

/**
 * Saves project directly to Windows file using File System Access API or fallback download.
 */
export async function saveToWindowsFile(
  project: Project,
  existingHandle?: FileSystemFileHandle | null
): Promise<WindowsSaveResult> {
  const jsonContent = JSON.stringify(project, null, 2);

  // 1. If we already have a linked file handle, save directly without opening dialog
  if (existingHandle) {
    try {
      // Check/request permission
      const perm = await (existingHandle as any).queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') {
        const req = await (existingHandle as any).requestPermission({ mode: 'readwrite' });
        if (req !== 'granted') {
          throw new Error('Permissão negada pelo usuário para gravação no arquivo.');
        }
      }

      const writable = await (existingHandle as any).createWritable();
      await writable.write(jsonContent);
      await writable.close();

      return {
        success: true,
        handle: existingHandle,
        fileName: existingHandle.name,
      };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { success: false, cancelled: true };
      }
      // If saving to existing handle failed (e.g. file was moved/deleted), fallback to picker
    }
  }

  // 2. Open native Windows Save As dialog if supported
  if (isFileSystemAccessSupported()) {
    try {
      const sanitizedName = project.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `${sanitizedName}.roadtask.json`,
        types: [
          {
            description: 'RoadTask Project (*.json, *.roadtask)',
            accept: {
              'application/json': ['.json', '.roadtask'],
            },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(jsonContent);
      await writable.close();

      return {
        success: true,
        handle,
        fileName: handle.name,
      };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { success: false, cancelled: true };
      }
      return { success: false, error: err?.message || 'Erro ao salvar arquivo no Windows.' };
    }
  }

  // 3. Fallback for non-Chromium browsers: Classical Download
  try {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = `${project.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.roadtask.json`;
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    return {
      success: true,
      fileName,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro ao gerar arquivo para download.' };
  }
}

/**
 * Opens a project directly from a Windows file using File System Access API.
 */
export async function openFromWindowsFile(): Promise<WindowsOpenResult> {
  if (!isFileSystemAccessSupported()) {
    return {
      success: false,
      error: 'Seu navegador não suporta a File System Access API. Utilize a importação de arquivo no menu de exportação.',
    };
  }

  try {
    const [handle] = await (window as any).showOpenFilePicker({
      types: [
        {
          description: 'RoadTask Project (*.json, *.roadtask)',
          accept: {
            'application/json': ['.json', '.roadtask'],
          },
        },
      ],
      multiple: false,
    });

    const file = await handle.getFile();
    const text = await file.text();
    const parsed = JSON.parse(text);

    // Basic schema check
    if (!parsed || !parsed.id || !Array.isArray(parsed.tasks)) {
      return {
        success: false,
        error: 'O arquivo selecionado não contém um formato de projeto RoadTask válido.',
      };
    }

    return {
      success: true,
      project: parsed as Project,
      handle,
      fileName: handle.name,
    };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { success: false, cancelled: true };
    }
    return { success: false, error: err?.message || 'Erro ao abrir arquivo do Windows.' };
  }
}
