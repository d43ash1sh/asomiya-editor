import React, { useState } from 'react';
import {
  FileCode,
  FileText,
  FilePlus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Code,
  FolderOpen,
} from 'lucide-react';
import type { VFSProject } from '../../vfs/types';
import { exportProjectAsZip, downloadBlob, importZipToProject } from '../../vfs/zip';
import { openNativeDirectory, isFileSystemAccessSupported } from '../../vfs/nativeFolder';

interface FileExplorerProps {
  project: VFSProject;
  setProject: (fn: (prev: VFSProject) => VFSProject) => void;
  openFile: (fileId: string) => void;
  createFile: (name: string, content?: string) => void;
  deleteFile: (fileId: string) => void;
  resetProject: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  project,
  setProject,
  openFile,
  createFile,
  deleteFile,
  resetProject,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      let finalName = newFileName.trim();
      if (!finalName.includes('.')) {
        finalName += '.asom';
      }
      createFile(finalName, '// ' + finalName + '\n\n');
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const handleExportZip = async () => {
    try {
      const blob = await exportProjectAsZip(project);
      downloadBlob(blob, `${project.name || 'asomiya-project'}.zip`);
    } catch (err) {
      console.error('Failed to export zip:', err);
    }
  };

  const handleImportZip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importZipToProject(project, file).then((updated) => {
        setProject(() => updated);
      });
    }
  };

  const handleOpenFolder = async () => {
    if (!isFileSystemAccessSupported()) {
      alert('Your browser does not support the File System Access API. Please use Chrome, Edge, or another Chromium-based browser.');
      return;
    }
    try {
      const result = await openNativeDirectory();
      if (result && Object.keys(result.files).length > 0) {
        const firstId = Object.keys(result.files)[0];
        setProject(() => ({
          id: result.dirName,
          name: result.dirName,
          files: result.files,
          activeFileId: firstId,
          openTabs: [firstId],
        }));
      }
    } catch (err) {
      alert('Failed to open local folder: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.asom')) {
      return <FileCode size={16} color="#007acc" />;
    }
    if (name.endsWith('.py')) {
      return <Code size={16} color="#3572A5" />;
    }
    return <FileText size={16} color="#858585" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sidebar Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: 'var(--vscode-text-muted)',
          borderBottom: '1px solid var(--vscode-border)',
        }}
      >
        <span>FILES</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleOpenFolder}
            title="Open Local Folder (File System Access)"
            style={{ color: 'var(--vscode-text)', display: 'flex', alignItems: 'center' }}
          >
            <FolderOpen size={15} />
          </button>
          <button
            onClick={() => setIsCreating(true)}
            title="New File (.asom)"
            style={{ color: 'var(--vscode-text)', display: 'flex', alignItems: 'center' }}
          >
            <FilePlus size={15} />
          </button>
          <label
            title="Import Zip Project"
            style={{ cursor: 'pointer', color: 'var(--vscode-text)', display: 'flex', alignItems: 'center' }}
          >
            <Upload size={15} />
            <input
              type="file"
              accept=".zip"
              onChange={handleImportZip}
              style={{ display: 'none' }}
            />
          </label>
          <button
            onClick={handleExportZip}
            title="Export Project as .zip"
            style={{ color: 'var(--vscode-text)', display: 'flex', alignItems: 'center' }}
          >
            <Download size={15} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset workspace to default Asomiya examples?')) {
                resetProject();
              }
            }}
            title="Reset Workspace"
            style={{ color: 'var(--vscode-text)', display: 'flex', alignItems: 'center' }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* New File Inline Form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} style={{ padding: '6px 12px' }}>
          <input
            type="text"
            autoFocus
            placeholder="filename.asom"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsCreating(false);
            }}
            style={{
              width: '100%',
              padding: '4px 6px',
              fontSize: 12,
              borderRadius: 2,
            }}
          />
        </form>
      )}

      {/* File List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>
        {Object.values(project.files).map((file) => {
          const isActive = project.activeFileId === file.id;
          return (
            <div
              key={file.id}
              onClick={() => openFile(file.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 12px',
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--vscode-active-selection)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--vscode-text)',
                fontSize: 13,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--vscode-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                {getFileIcon(file.name)}
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {file.name}
                </span>
              </div>

              {Object.keys(project.files).length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete ${file.name}?`)) {
                      deleteFile(file.id);
                    }
                  }}
                  title="Delete File"
                  style={{
                    color: 'var(--vscode-text-muted)',
                    opacity: 0.6,
                    padding: 2,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
