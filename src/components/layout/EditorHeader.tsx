import React from 'react';
import {
  X,
  Play,
  FileCode,
  FileText,
  Code,
  Code2,
  Terminal,
  Columns,
  Share2,
  Check,
  Wand2,
} from 'lucide-react';
import type { VFSProject } from '../../vfs/types';
import type { PanelTab } from '../../types';

interface EditorHeaderProps {
  project: VFSProject;
  activeFileId: string;
  openTabs: string[];
  selectTab: (fileId: string) => void;
  closeTab: (fileId: string) => void;
  onRun: () => void;
  isRunning: boolean;
  activePanelTab: PanelTab;
  setActivePanelTab: (tab: PanelTab) => void;
  isBottomPanelOpen: boolean;
  toggleBottomPanel: () => void;
  isSplitView: boolean;
  toggleSplitView: () => void;
  onShareSnippet: () => void;
  isCopiedShare: boolean;
  onFormatDocument: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  project,
  activeFileId,
  openTabs,
  selectTab,
  closeTab,
  onRun,
  isRunning,
  activePanelTab,
  setActivePanelTab,
  isBottomPanelOpen,
  toggleBottomPanel,
  isSplitView,
  toggleSplitView,
  onShareSnippet,
  isCopiedShare,
  onFormatDocument,
}) => {
  const getFileIcon = (name: string) => {
    if (name.endsWith('.asom')) return <FileCode size={14} color="#007acc" />;
    if (name.endsWith('.py')) return <Code size={14} color="#3572A5" />;
    return <FileText size={14} color="#858585" />;
  };

  return (
    <div
      style={{
        height: 35,
        backgroundColor: 'var(--vscode-side-bg)',
        borderBottom: '1px solid var(--vscode-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        userSelect: 'none',
      }}
    >
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          height: '100%',
          alignItems: 'stretch',
        }}
      >
        {openTabs.map((tabId) => {
          const file = project.files[tabId];
          if (!file) return null;
          const isActive = tabId === activeFileId;

          return (
            <div
              key={tabId}
              onClick={() => selectTab(tabId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 12px',
                fontSize: 12,
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--vscode-tab-active-bg)' : 'var(--vscode-tab-inactive-bg)',
                color: isActive ? 'var(--vscode-text-bright)' : 'var(--vscode-text-muted)',
                borderRight: '1px solid var(--vscode-border)',
                borderTop: isActive ? '2px solid var(--vscode-activity-badge)' : '2px solid transparent',
              }}
            >
              {getFileIcon(file.name)}
              <span>{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tabId);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 2,
                  borderRadius: 2,
                  color: 'inherit',
                  opacity: 0.6,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Editor Top Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 10 }}>
        {/* Format Document */}
        <button
          onClick={onFormatDocument}
          title="Format Document (Shift+Alt+F)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            backgroundColor: 'var(--vscode-hover)',
            borderRadius: 3,
            fontSize: 12,
            color: 'var(--vscode-text)',
          }}
        >
          <Wand2 size={13} color="#569CD6" />
          <span>Format</span>
        </button>

        {/* Share Snippet */}
        <button
          onClick={onShareSnippet}
          title="Share code as URL snippet"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            backgroundColor: isCopiedShare ? 'var(--vscode-run-green)' : 'var(--vscode-hover)',
            borderRadius: 3,
            fontSize: 12,
            color: '#ffffff',
            transition: 'background-color 0.2s',
          }}
        >
          {isCopiedShare ? <Check size={13} /> : <Share2 size={13} />}
          <span>{isCopiedShare ? 'Copied Link!' : 'Share'}</span>
        </button>

        {/* Split View */}
        <button
          onClick={toggleSplitView}
          title={isSplitView ? 'Close Split View' : 'Split View: Asomiya & Live Python'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            backgroundColor: isSplitView ? 'var(--vscode-active-selection)' : 'var(--vscode-hover)',
            borderRadius: 3,
            fontSize: 12,
            color: 'var(--vscode-text)',
          }}
        >
          <Columns size={13} />
          <span>Split</span>
        </button>
        {/* Toggle Python Preview */}
        <button
          onClick={() => {
            setActivePanelTab('python');
            if (!isBottomPanelOpen) toggleBottomPanel();
          }}
          title="Transpile to Python"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            backgroundColor: activePanelTab === 'python' && isBottomPanelOpen ? 'var(--vscode-active-selection)' : 'var(--vscode-hover)',
            borderRadius: 3,
            fontSize: 12,
            color: 'var(--vscode-text)',
          }}
        >
          <Code2 size={14} color="#ffd43b" />
          <span>Python</span>
        </button>

        {/* Toggle Terminal */}
        <button
          onClick={() => {
            setActivePanelTab('terminal');
            if (!isBottomPanelOpen) toggleBottomPanel();
          }}
          title="Terminal Output"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            backgroundColor: activePanelTab === 'terminal' && isBottomPanelOpen ? 'var(--vscode-active-selection)' : 'var(--vscode-hover)',
            borderRadius: 3,
            fontSize: 12,
            color: 'var(--vscode-text)',
          }}
        >
          <Terminal size={14} />
          <span>Terminal</span>
        </button>

        {/* Run Active File */}
        <button
          onClick={onRun}
          disabled={isRunning}
          title="Run Program (Ctrl+Enter / Cmd+Enter)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            backgroundColor: isRunning ? 'var(--vscode-badge-bg)' : 'var(--vscode-run-green)',
            color: '#ffffff',
            borderRadius: 3,
            fontSize: 12,
            fontWeight: 600,
            transition: 'background-color 0.15s ease',
          }}
        >
          <Play size={13} fill="#ffffff" />
          <span>{isRunning ? 'Running...' : 'Run'}</span>
        </button>
      </div>
    </div>
  );
};
