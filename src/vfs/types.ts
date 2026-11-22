export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  parentId?: string | null;
}

export interface VFSProject {
  id: string;
  name: string;
  files: Record<string, FileItem>;
  activeFileId: string;
  openTabs: string[];
}
