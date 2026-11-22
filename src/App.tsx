import React, { useState, useEffect, useCallback } from 'react';
import type { ActivityTab, PanelTab, EditorSettings } from './types';
import type { VFSProject } from './vfs/types';
import {
  loadProject,
  saveProject,
  resetProject,
  createFile,
  deleteFile,
} from './vfs/storage';
import { ActivityBar } from './components/layout/ActivityBar';
import { SideBar } from './components/layout/SideBar';
import { EditorHeader } from './components/layout/EditorHeader';
import { EditorArea } from './components/layout/EditorArea';
import { BottomPanel } from './components/layout/BottomPanel';
import { StatusBar } from './components/layout/StatusBar';
import { executeAsomiya, type RunResult } from './runner/execution';
import { encodeShareCode, decodeShareCode } from './vfs/share';
import { formatAsomiyaSource } from './monaco/asomiya-formatter';
import { PythonPreview } from './components/terminal/PythonPreview';
import type { editor } from 'monaco-editor';

export const App: React.FC = () => {
  const [project, setProject] = useState<VFSProject>(() => loadProject());
  const [activeTab, setActiveTab] = useState<ActivityTab>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const [activePanelTab, setActivePanelTab] = useState<PanelTab>('terminal');
  const [lastResult, setLastResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stdinBuffer, setStdinBuffer] = useState('');
  const [diagnostics, setDiagnostics] = useState<editor.IMarkerData[]>([]);
  const [isSplitView, setIsSplitView] = useState(false);
  const [isCopiedShare, setIsCopiedShare] = useState(false);

  // Check URL hash for shared code snippets on load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const decoded = decodeShareCode(window.location.hash);
      if (decoded) {
        setProject((prev) => {
          const fileId = 'shared.asom';
          const updated = {
            ...prev,
            files: {
              ...prev.files,
              [fileId]: {
                id: fileId,
                name: fileId,
                path: fileId,
                type: 'file' as const,
                content: decoded,
              },
            },
            activeFileId: fileId,
            openTabs: prev.openTabs.includes(fileId) ? prev.openTabs : [...prev.openTabs, fileId],
          };
          saveProject(updated);
          return updated;
        });
      }
    }
  }, []);

  const [settings, setSettings] = useState<EditorSettings>(() => {
    const saved = localStorage.getItem('asomiya_editor_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      theme: 'dark',
      fontSize: 14,
      tabSize: 4,
      digits: 'assamese',
      lang: 'as',
      maxSteps: 10_000_000,
      maxDepth: 500,
    };
  });

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('asomiya_editor_settings', JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Current active file
  const activeFile = project.files[project.activeFileId] || Object.values(project.files)[0];
  const activeFileContent = activeFile?.content || '';

  // Update active file content
  const handleContentChange = useCallback((newContent: string) => {
    setProject((prev) => {
      if (!prev.activeFileId || !prev.files[prev.activeFileId]) return prev;
      const updated = {
        ...prev,
        files: {
          ...prev.files,
          [prev.activeFileId]: {
            ...prev.files[prev.activeFileId],
            content: newContent,
          },
        },
      };
      saveProject(updated);
      return updated;
    });
  }, []);

  // Run the active file
  const handleRun = useCallback(() => {
    if (!activeFile) return;
    setIsRunning(true);
    setIsBottomPanelOpen(true);
    setActivePanelTab('terminal');

    // Small timeout to allow UI update
    setTimeout(() => {
      const result = executeAsomiya(activeFile.content || '', {
        lang: settings.lang,
        digits: settings.digits,
        stdin: stdinBuffer,
        maxSteps: settings.maxSteps,
        maxCallDepth: settings.maxDepth,
      });

      setLastResult(result);
      setIsRunning(false);
    }, 10);
  }, [activeFile, settings, stdinBuffer]);

  // Share snippet as URL
  const handleShareSnippet = () => {
    if (!activeFile) return;
    const encoded = encodeShareCode(activeFile.content || '');
    const url = `${window.location.origin}${window.location.pathname}#code=${encoded}`;
    navigator.clipboard.writeText(url);
    setIsCopiedShare(true);
    setTimeout(() => setIsCopiedShare(false), 2000);
  };

  // Format active file document
  const handleFormatDocument = useCallback(() => {
    if (!activeFile) return;
    const formatted = formatAsomiyaSource(activeFile.content || '', settings.tabSize);
    handleContentChange(formatted);
  }, [activeFile, handleContentChange, settings.tabSize]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to Run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      // Shift+Alt+F to format document
      if (e.shiftKey && e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        handleFormatDocument();
      }
      // Ctrl+B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setIsSidebarOpen((v) => !v);
      }
      // Ctrl+J to toggle bottom panel
      if ((e.ctrlKey || e.metaKey) && (e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        setIsBottomPanelOpen((v) => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFormatDocument, handleRun]);

  // Tab management
  const selectTab = (fileId: string) => {
    setProject((prev) => {
      const updated = { ...prev, activeFileId: fileId };
      saveProject(updated);
      return updated;
    });
  };

  const closeTab = (fileId: string) => {
    setProject((prev) => {
      const newTabs = prev.openTabs.filter((id) => id !== fileId);
      let newActive = prev.activeFileId;
      if (newActive === fileId) {
        newActive = newTabs[newTabs.length - 1] || '';
      }
      const updated = { ...prev, openTabs: newTabs, activeFileId: newActive };
      saveProject(updated);
      return updated;
    });
  };

  const handleCreateFile = (name: string, content?: string) => {
    setProject((prev) => createFile(prev, name, content));
  };

  const handleDeleteFile = (fileId: string) => {
    setProject((prev) => deleteFile(prev, fileId));
  };

  const handleResetProject = () => {
    const fresh = resetProject();
    setProject(fresh);
    setLastResult(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--vscode-bg)',
      }}
    >
      {/* Main Workspace Body */}
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 22px)', overflow: 'hidden' }}>
        {/* VS Code Activity Bar (Far Left) */}
        <ActivityBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((v) => !v)}
          theme={settings.theme}
          toggleTheme={() =>
            setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
          }
          errorCount={diagnostics.length}
        />

        {/* Collapsible Sidebar */}
        <SideBar
          activeTab={activeTab}
          isOpen={isSidebarOpen}
          project={project}
          setProject={setProject}
          openFile={(id) => {
            setProject((prev) => {
              const newTabs = prev.openTabs.includes(id) ? prev.openTabs : [...prev.openTabs, id];
              const updated = { ...prev, activeFileId: id, openTabs: newTabs };
              saveProject(updated);
              return updated;
            });
          }}
          createFile={handleCreateFile}
          deleteFile={handleDeleteFile}
          resetProject={handleResetProject}
          settings={settings}
          setSettings={setSettings}
        />

        {/* Editor + Bottom Panel Region */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Editor Header / Tabs */}
          <EditorHeader
            project={project}
            activeFileId={project.activeFileId}
            openTabs={project.openTabs}
            selectTab={selectTab}
            closeTab={closeTab}
            onRun={handleRun}
            isRunning={isRunning}
            activePanelTab={activePanelTab}
            setActivePanelTab={setActivePanelTab}
            isBottomPanelOpen={isBottomPanelOpen}
            toggleBottomPanel={() => setIsBottomPanelOpen((v) => !v)}
            isSplitView={isSplitView}
            toggleSplitView={() => setIsSplitView((v) => !v)}
            onShareSnippet={handleShareSnippet}
            isCopiedShare={isCopiedShare}
            onFormatDocument={handleFormatDocument}
          />

          {/* Monaco Editor Container / Split View */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
            {activeFile ? (
              <>
                <div style={{ flex: 1, height: '100%', position: 'relative' }}>
                  <EditorArea
                    content={activeFileContent}
                    onChange={handleContentChange}
                    fileName={activeFile.name}
                    settings={settings}
                    onRun={handleRun}
                    setDiagnostics={setDiagnostics}
                  />
                </div>
                {isSplitView && (
                  <div
                    style={{
                      flex: 1,
                      height: '100%',
                      borderLeft: '1px solid var(--vscode-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'var(--vscode-bg)',
                    }}
                  >
                    <PythonPreview sourceCode={activeFileContent} digits={settings.digits} />
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--vscode-text-muted)',
                }}
              >
                No file is currently open. Select or create a file from the explorer.
              </div>
            )}
          </div>

          {/* Bottom Panel (Terminal / Python / Problems) */}
          <BottomPanel
            isOpen={isBottomPanelOpen}
            onClose={() => setIsBottomPanelOpen(false)}
            activeTab={activePanelTab}
            setActiveTab={setActivePanelTab}
            lastResult={lastResult}
            isRunning={isRunning}
            onClearTerminal={() => setLastResult(null)}
            onRun={handleRun}
            stdinBuffer={stdinBuffer}
            setStdinBuffer={setStdinBuffer}
            activeFileName={activeFile?.name || ''}
            sourceCode={activeFileContent}
            digits={settings.digits}
            diagnostics={diagnostics}
          />
        </div>
      </div>

      {/* VS Code Status Bar */}
      <StatusBar
        errorCount={diagnostics.length}
        settings={settings}
        setSettings={setSettings}
        activeFileName={activeFile?.name || ''}
        isRunning={isRunning}
      />
    </div>
  );
};
