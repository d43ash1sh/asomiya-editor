import type { VFSProject, FileItem } from './types';
import { DEFAULT_FILES } from './defaultFiles';

const STORAGE_KEY = 'asomiya_editor_project_v1';

export function loadProject(): VFSProject {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as VFSProject;
      if (parsed && parsed.files && Object.keys(parsed.files).length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse saved project from localStorage:', err);
  }

  return {
    id: 'default',
    name: 'asomiya-workspace',
    files: { ...DEFAULT_FILES },
    activeFileId: 'hello.asom',
    openTabs: ['hello.asom', 'roman.asom', 'README.md'],
  };
}

export function saveProject(project: VFSProject): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (err) {
    console.error('Failed to persist project to localStorage:', err);
  }
}

export function resetProject(): VFSProject {
  const fresh: VFSProject = {
    id: 'default',
    name: 'asomiya-workspace',
    files: { ...DEFAULT_FILES },
    activeFileId: 'hello.asom',
    openTabs: ['hello.asom', 'roman.asom', 'README.md'],
  };
  saveProject(fresh);
  return fresh;
}

export function createFile(
  project: VFSProject,
  name: string,
  content: string = ''
): VFSProject {
  const cleanName = name.trim();
  if (!cleanName) return project;

  const id = cleanName;
  const newFile: FileItem = {
    id,
    name: cleanName,
    path: cleanName,
    type: 'file',
    content,
  };

  const newFiles = { ...project.files, [id]: newFile };
  const newTabs = project.openTabs.includes(id)
    ? project.openTabs
    : [...project.openTabs, id];

  const updated: VFSProject = {
    ...project,
    files: newFiles,
    activeFileId: id,
    openTabs: newTabs,
  };
  saveProject(updated);
  return updated;
}

export function deleteFile(project: VFSProject, fileId: string): VFSProject {
  const newFiles = { ...project.files };
  delete newFiles[fileId];

  const newTabs = project.openTabs.filter((id) => id !== fileId);
  let newActive = project.activeFileId;
  if (newActive === fileId) {
    newActive = newTabs[newTabs.length - 1] || Object.keys(newFiles)[0] || '';
  }

  const updated: VFSProject = {
    ...project,
    files: newFiles,
    openTabs: newTabs,
    activeFileId: newActive,
  };
  saveProject(updated);
  return updated;
}
