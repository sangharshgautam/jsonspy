import { platformAdapter, OpenFileResult } from './platformAdapter';

export async function openJsonFile(): Promise<OpenFileResult | null> {
  return platformAdapter.openFile();
}

export async function saveJsonFile(
  content: string,
  existingPath?: string,
  defaultName = 'document.json'
): Promise<string | null> {
  return platformAdapter.saveFile(content, existingPath, defaultName);
}
