import type { FileItem } from './types';

interface FileSystemDirectoryHandle {
  name: string;
  kind: 'directory';
  values(): AsyncIterable<FileSystemHandle>;
}

interface FileSystemFileHandle {
  name: string;
  kind: 'file';
  getFile(): Promise<File>;
}

type FileSystemHandle = FileSystemDirectoryHandle | FileSystemFileHandle;

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export async function openNativeDirectory(): Promise<{
  dirName: string;
  files: Record<string, FileItem>;
} | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API (showDirectoryPicker) is not supported in this browser.');
  }

  try {
    const showDirPicker = (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> })
      .showDirectoryPicker;
    const dirHandle = await showDirPicker();
    const files: Record<string, FileItem> = {};

    async function scanDirectory(handle: FileSystemDirectoryHandle, prefix = '') {
      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          const fileName = entry.name;
          // Filter to relevant source files
          if (
            fileName.endsWith('.asom') ||
            fileName.endsWith('.py') ||
            fileName.endsWith('.md') ||
            fileName.endsWith('.json') ||
            fileName.endsWith('.txt')
          ) {
            const fileData = await entry.getFile();
            const content = await fileData.text();
            const relPath = prefix ? `${prefix}/${fileName}` : fileName;

            files[fileName] = {
              id: fileName,
              name: fileName,
              path: relPath,
              type: 'file',
              content,
            };
          }
        } else if (entry.kind === 'directory') {
          // Avoid scanning large ignored directories
          if (!['node_modules', '.git', 'dist', 'build', '.vscode'].includes(entry.name)) {
            const newPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
            await scanDirectory(entry, newPrefix);
          }
        }
      }
    }

    await scanDirectory(dirHandle);

    return {
      dirName: dirHandle.name,
      files,
    };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      // User cancelled picker
      return null;
    }
    console.error('Error opening local directory:', err);
    throw err;
  }
}
