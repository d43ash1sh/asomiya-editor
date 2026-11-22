import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Code2, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { PanelTab } from '../../types';
import type { RunResult } from '../../runner/execution';
import { OutputTerminal } from '../terminal/OutputTerminal';
import { PythonPreview } from '../terminal/PythonPreview';
import { ProblemsView } from '../terminal/ProblemsView';
import type { editor } from 'monaco-editor';
import type { DigitSetting, MessageLanguage } from 'asomiya';

interface BottomPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: PanelTab;
  setActiveTab: (tab: PanelTab) => void;
  lastResult: RunResult | null;
  isRunning: boolean;
  onClearTerminal: () => void;
  onRun: () => void;
  stdinBuffer: string;
  setStdinBuffer: (val: string) => void;
  activeFileName: string;
  sourceCode: string;
  digits: DigitSetting;
  diagnostics: editor.IMarkerData[];
  theme?: 'dark' | 'light';
  fontSize?: number;
  lang?: MessageLanguage;
  isMobile?: boolean;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  lastResult,
  isRunning,
  onClearTerminal,
  onRun,
  stdinBuffer,
  setStdinBuffer,
  activeFileName,
  sourceCode,
  digits,
  diagnostics,
  theme,
  fontSize,
  lang,
  isMobile = false,
}) => {
  const [height, setHeight] = useState(() =>
    isMobile ? Math.round(window.innerHeight * 0.4) : 240,
  );
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(240);

  // Pointer events cover mouse, touch and pen, so the panel can be resized on phones too.
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.cursor = 'row-resize';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = startYRef.current - e.clientY;
    const newHeight = Math.max(110, Math.min(window.innerHeight * 0.75, startHeightRef.current + deltaY));
    setHeight(newHeight);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    document.body.style.cursor = 'default';
  };

  useEffect(() => {
    // Keep the panel inside the screen when the window or phone orientation changes.
    const clamp = () => setHeight((h) => Math.min(h, Math.round(window.innerHeight * 0.75)));
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      style={{
        height,
        backgroundColor: 'var(--vscode-panel-bg)',
        borderTop: '1px solid var(--vscode-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        userSelect: 'none',
        zIndex: 10,
      }}
    >
      {/* Resizer handle */}
      <div
        className="panel-resizer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'absolute',
          top: -3,
          left: 0,
          right: 0,
          height: 6,
          touchAction: 'none',
          cursor: 'row-resize',
          zIndex: 30,
        }}
      />

      {/* Panel Header Tabs */}
      <div
        style={{
          height: 30,
          backgroundColor: 'var(--vscode-side-bg)',
          borderBottom: '1px solid var(--vscode-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 8px',
        }}
      >
        <div style={{ display: 'flex', gap: 4, height: '100%', alignItems: 'center' }}>
          {/* Terminal Tab */}
          <button
            onClick={() => setActiveTab('terminal')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '0 10px',
              height: '100%',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: activeTab === 'terminal' ? 'var(--vscode-text-bright)' : 'var(--vscode-text-muted)',
              borderBottom: activeTab === 'terminal' ? '2px solid var(--vscode-activity-badge)' : '2px solid transparent',
            }}
          >
            <Terminal size={12} />
            <span>TERMINAL</span>
          </button>

          {/* Python Preview Tab */}
          <button
            onClick={() => setActiveTab('python')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '0 10px',
              height: '100%',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: activeTab === 'python' ? 'var(--vscode-text-bright)' : 'var(--vscode-text-muted)',
              borderBottom: activeTab === 'python' ? '2px solid var(--vscode-activity-badge)' : '2px solid transparent',
            }}
          >
            <Code2 size={12} color="var(--accent)" />
            <span>PYTHON<span className="hide-mobile"> TRANSLATION</span></span>
          </button>

          {/* Problems Tab */}
          <button
            onClick={() => setActiveTab('problems')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '0 10px',
              height: '100%',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: activeTab === 'problems' ? 'var(--vscode-text-bright)' : 'var(--vscode-text-muted)',
              borderBottom: activeTab === 'problems' ? '2px solid var(--vscode-activity-badge)' : '2px solid transparent',
            }}
          >
            <AlertCircle size={12} color={diagnostics.length > 0 ? 'var(--danger)' : 'inherit'} />
            <span>PROBLEMS</span>
            {diagnostics.length > 0 && (
              <span
                style={{
                  fontSize: 10,
                  backgroundColor: 'var(--vscode-error-red)',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '1px 5px',
                  marginLeft: 2,
                }}
              >
                {diagnostics.length}
              </span>
            )}
          </button>
        </div>

        {/* Panel controls */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => setHeight(height > 300 ? 160 : 400)}
            title="Toggle Panel Size"
            style={{ color: 'var(--vscode-text-muted)', padding: 2 }}
          >
            {height > 300 ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <button
            onClick={onClose}
            title="Close Panel"
            style={{ color: 'var(--vscode-text-muted)', padding: 2 }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'terminal' && (
          <OutputTerminal
            lastResult={lastResult}
            isRunning={isRunning}
            onClear={onClearTerminal}
            onRun={onRun}
            stdinBuffer={stdinBuffer}
            setStdinBuffer={setStdinBuffer}
            activeFileName={activeFileName}
            theme={theme}
            fontSize={fontSize}
            digits={digits}
            lang={lang}
          />
        )}
        {activeTab === 'python' && (
          <PythonPreview sourceCode={sourceCode} digits={digits} />
        )}
        {activeTab === 'problems' && (
          <ProblemsView diagnostics={diagnostics} activeFileName={activeFileName} />
        )}
      </div>
    </div>
  );
};
