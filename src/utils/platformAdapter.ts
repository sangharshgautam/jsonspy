/**
 * Unified Multi-Platform Adapter for JSONSpy
 * Supports Tauri v2 (Desktop), IntelliJ JCEF (IDE Plugin), and Web SPA.
 */

export interface OpenFileResult {
  name: string;
  content: string;
  path?: string;
}

export interface PlatformAdapter {
  isTauri(): boolean;
  isIntelliJ(): boolean;
  isVsCode(): boolean;
  isWeb(): boolean;
  openFile(): Promise<OpenFileResult | null>;
  saveFile(content: string, path?: string, defaultName?: string): Promise<string | null>;
  onIdeFileOpen?(callback: (data: OpenFileResult) => void): void;
  notifyDocumentChanged?(content: string): void;
  onVsCodeDocumentUpdate?(callback: (data: OpenFileResult & { theme?: 'dark' | 'light' }) => void): void;
}

declare global {
  interface Window {
    cefQuery?: (options: { request: string; onSuccess: (response: string) => void; onFailure: (code: number, msg: string) => void }) => void;
    intellijJsonSpy?: {
      onFileOpen?: (dataJson: string) => void;
    };
    __TAURI_INTERNALS__?: any;
    __VSCODE_WEBVIEW__?: boolean;
    vscodeApi?: {
      postMessage: (message: any) => void;
      setState: (state: any) => void;
      getState: () => any;
    };
    acquireVsCodeApi?: () => {
      postMessage: (message: any) => void;
      setState: (state: any) => void;
      getState: () => any;
    };
  }
}

let cachedVsCodeApi: any = null;
function getVsCodeApi(): any {
  if (typeof window === 'undefined') return null;
  if (cachedVsCodeApi) return cachedVsCodeApi;
  if (window.vscodeApi) {
    cachedVsCodeApi = window.vscodeApi;
    return cachedVsCodeApi;
  }
  if (typeof window.acquireVsCodeApi === 'function') {
    try {
      cachedVsCodeApi = window.acquireVsCodeApi();
      window.vscodeApi = cachedVsCodeApi;
      return cachedVsCodeApi;
    } catch (_e) {
      // ignore
    }
  }
  return null;
}

class SystemPlatformAdapter implements PlatformAdapter {
  isTauri(): boolean {
    return typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__);
  }

  isIntelliJ(): boolean {
    return typeof window !== 'undefined' && Boolean(window.cefQuery || window.intellijJsonSpy);
  }

  isVsCode(): boolean {
    return typeof window !== 'undefined' && Boolean(window.__VSCODE_WEBVIEW__ || getVsCodeApi());
  }

  isWeb(): boolean {
    return !this.isTauri() && !this.isIntelliJ() && !this.isVsCode();
  }

  async openFile(): Promise<OpenFileResult | null> {
    // 1. Tauri v2 Desktop Execution
    if (this.isTauri()) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const { readTextFile } = await import('@tauri-apps/plugin-fs');

        const selected = await open({
          multiple: false,
          filters: [
            { name: 'JSON Files', extensions: ['json', 'schema.json', 'geojson', 'topojson'] },
            { name: 'All Files', extensions: ['*'] },
          ],
        });

        if (!selected) return null;
        const filePath = typeof selected === 'string' ? selected : selected[0];
        if (!filePath) return null;

        const content = await readTextFile(filePath);
        const fileName = filePath.split(/[/\\]/).pop() || 'document.json';

        return { path: filePath, name: fileName, content };
      } catch (_e) {
        // fallback to web picker if plugin call fails
      }
    }

    // 2. IntelliJ Plugin Execution via JCEF Query
    if (this.isIntelliJ() && window.cefQuery) {
      return new Promise((resolve) => {
        window.cefQuery!({
          request: JSON.stringify({ action: 'openFile' }),
          onSuccess: (response: string) => {
            try {
              const data = JSON.parse(response);
              resolve({ name: data.name, content: data.content, path: data.path });
            } catch (e) {
              resolve(null);
            }
          },
          onFailure: () => resolve(null),
        });
      });
    }

    // 3. Web SPA Fallback via HTML5 File Picker / Input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.schema.json,.geojson,application/json';
      input.onchange = async (event: any) => {
        const file = event.target?.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const text = await file.text();
        resolve({ name: file.name, content: text });
      };
      input.click();
    });
  }

  async saveFile(content: string, existingPath?: string, defaultName = 'document.json'): Promise<string | null> {
    // 1. Tauri v2 Desktop Execution
    if (this.isTauri()) {
      try {
        const { save } = await import('@tauri-apps/plugin-dialog');
        const { writeTextFile } = await import('@tauri-apps/plugin-fs');

        let targetPath = existingPath;
        if (!targetPath) {
          const selected = await save({
            defaultPath: defaultName,
            filters: [
              { name: 'JSON File', extensions: ['json'] },
              { name: 'JSON Schema', extensions: ['schema.json'] },
            ],
          });
          if (!selected) return null;
          targetPath = selected;
        }

        await writeTextFile(targetPath, content);
        return targetPath;
      } catch (_e) {
        // fallback to web download
      }
    }

    // 2. IntelliJ Plugin Execution via JCEF Query
    if (this.isIntelliJ() && window.cefQuery) {
      return new Promise((resolve) => {
        window.cefQuery!({
          request: JSON.stringify({ action: 'saveFile', content, path: existingPath }),
          onSuccess: (savedPath: string) => resolve(savedPath),
          onFailure: () => resolve(null),
        });
      });
    }

    // 3. VS Code Extension Execution via vscodeApi
    if (this.isVsCode()) {
      const api = getVsCodeApi();
      if (api) {
        api.postMessage({ type: 'documentChanged', content });
        api.postMessage({ type: 'save' });
        return existingPath || defaultName;
      }
    }

    // 4. Web SPA Fallback via Blob download
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = existingPath ? existingPath.split(/[/\\]/).pop() || defaultName : defaultName;
    a.click();
    URL.revokeObjectURL(url);
    return null;
  }

  notifyDocumentChanged(content: string): void {
    if (this.isVsCode()) {
      const api = getVsCodeApi();
      if (api) {
        api.postMessage({ type: 'documentChanged', content });
      }
    }
  }

  onVsCodeDocumentUpdate(callback: (data: OpenFileResult & { theme?: 'dark' | 'light' }) => void): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        const message = event.data;
        if (message?.type === 'updateDocument') {
          callback({
            name: message.name || 'document.json',
            content: message.content || '',
            path: message.path,
            theme: message.theme,
          });
        }
      });

      // Send ready signal to VS Code Extension
      const api = getVsCodeApi();
      if (api) {
        api.postMessage({ type: 'ready' });
      }
    }
  }

  onIdeFileOpen(callback: (data: OpenFileResult) => void): void {
    if (typeof window !== 'undefined') {
      window.intellijJsonSpy = {
        onFileOpen: (dataJson: string) => {
          try {
            const data = JSON.parse(dataJson);
            callback(data);
          } catch (e) {
            // ignore
          }
        },
      };
    }
  }
}

export const platformAdapter = new SystemPlatformAdapter();
