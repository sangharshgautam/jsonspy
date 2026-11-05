/**
 * Cross-Platform File System Helper
 * Supports native Tauri v2 file dialog & fs plugins with browser fallback.
 */

export async function openJsonFile(): Promise<{ path?: string; name: string; content: string } | null> {
  try {
    // Attempt Tauri dialog plugin
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
    // Fallback to browser HTML5 File Input API
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
}

export async function saveJsonFile(
  content: string,
  existingPath?: string,
  defaultName = 'document.json'
): Promise<string | null> {
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
    // Fallback to browser Blob download
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = existingPath ? existingPath.split(/[/\\]/).pop() || defaultName : defaultName;
    a.click();
    URL.revokeObjectURL(url);
    return null;
  }
}
