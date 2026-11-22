import JSZip from 'jszip';
import type { VFSProject, FileItem } from './types';

const MAX_ZIP_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_CHARS = 10 * 1024 * 1024;
const MAX_FILES = 200;
const UNSAFE_NAMES = new Set(['__proto__', 'constructor', 'prototype']);

export async function exportProjectAsZip(project: VFSProject): Promise<Blob> {
  const zip = new JSZip();

  for (const file of Object.values(project.files)) {
    if (file.type === 'file' && typeof file.content === 'string') {
      zip.file(file.name, file.content);
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importZipToProject(
  project: VFSProject,
  file: File
): Promise<VFSProject> {
  if (file.size > MAX_ZIP_BYTES) {
    throw new Error('Zip file is too large (limit 5 MB).');
  }
  const zip = await JSZip.loadAsync(file);
  const updatedFiles = { ...project.files };
  let imported = 0;
  let totalChars = 0;
  const newTabs = [...project.openTabs];
  let firstNewId = '';

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    if (!zipEntry.dir) {
      const filename = relativePath.split('/').pop() || relativePath;
      // Skip names that would clash with Object built-ins, and hidden/system files.
      if (UNSAFE_NAMES.has(filename) || filename.startsWith('.')) continue;
      if (++imported > MAX_FILES) throw new Error(`Zip has too many files (limit ${MAX_FILES}).`);
      const content = await zipEntry.async('string');
      totalChars += content.length;
      if (totalChars > MAX_TOTAL_CHARS) throw new Error('Zip contents are too large (limit 10 MB of text).');
      const fileItem: FileItem = {
        id: filename,
        name: filename,
        path: relativePath,
        type: 'file',
        content,
      };
      updatedFiles[filename] = fileItem;
      if (!newTabs.includes(filename)) {
        newTabs.push(filename);
      }
      if (!firstNewId) firstNewId = filename;
    }
  }

  return {
    ...project,
    files: updatedFiles,
    openTabs: newTabs,
    activeFileId: firstNewId || project.activeFileId,
  };
}
