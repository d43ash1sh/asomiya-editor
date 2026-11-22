import React from 'react';
import type { ActivityTab, EditorSettings } from '../../types';
import type { VFSProject } from '../../vfs/types';
import { FileExplorer } from '../sidebar/FileExplorer';
import { SearchPanel } from '../sidebar/SearchPanel';
import { TemplatesPanel } from '../sidebar/TemplatesPanel';
import { DocsPanel } from '../sidebar/DocsPanel';
import { SettingsPanel } from '../sidebar/SettingsPanel';

interface SideBarProps {
  activeTab: ActivityTab;
  isOpen: boolean;
  project: VFSProject;
  setProject: (fn: (prev: VFSProject) => VFSProject) => void;
  openFile: (fileId: string) => void;
  createFile: (name: string, content?: string) => void;
  deleteFile: (fileId: string) => void;
  resetProject: () => void;
  settings: EditorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EditorSettings>>;
  isMobile?: boolean;
}

export const SideBar: React.FC<SideBarProps> = ({
  activeTab,
  isOpen,
  project,
  setProject,
  openFile,
  createFile,
  deleteFile,
  resetProject,
  settings,
  setSettings,
  isMobile = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={isMobile ? 'side-bar side-bar-drawer' : 'side-bar'}
      style={{
        width: 250,
        height: '100%',
        backgroundColor: 'var(--vscode-side-bg)',
        borderRight: '1px solid var(--vscode-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {activeTab === 'explorer' && (
        <FileExplorer
          project={project}
          setProject={setProject}
          openFile={openFile}
          createFile={createFile}
          deleteFile={deleteFile}
          resetProject={resetProject}
        />
      )}
      {activeTab === 'search' && (
        <SearchPanel project={project} openFile={openFile} />
      )}
      {activeTab === 'templates' && (
        <TemplatesPanel createFile={createFile} />
      )}
      {activeTab === 'docs' && <DocsPanel />}
      {activeTab === 'settings' && (
        <SettingsPanel settings={settings} setSettings={setSettings} />
      )}
    </div>
  );
};
