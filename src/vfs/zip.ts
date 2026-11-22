import JSZip from 'jszip';
import type { VFSProject, FileItem } from './types';

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
  const zip = await JSZip.loadAsync(file);
  const updatedFiles = { ...project.files };
  const newTabs = [...project.openTabs];
  let firstNewId = '';

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    if (!zipEntry.dir) {
      const content = await zipEntry.async('string');
      const filename = relativePath.split('/').pop() || relativePath;
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
