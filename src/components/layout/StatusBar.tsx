import React from 'react';
import { GitBranch, AlertCircle, CheckCircle, Globe } from 'lucide-react';
import type { EditorSettings } from '../../types';

interface StatusBarProps {
  errorCount: number;
  settings: EditorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EditorSettings>>;
  activeFileName: string;
  isRunning: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  errorCount,
  settings,
  setSettings,
  activeFileName,
  isRunning,
}) => {
  const toggleDigits = () => {
    setSettings((s) => ({
      ...s,
      digits: s.digits === 'assamese' ? 'ascii' : 'assamese',
    }));
  };

  return (
    <div
      style={{
        height: 22,
        backgroundColor: 'var(--vscode-status-bg)',
        color: 'var(--vscode-status-text)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 10px',
        fontSize: 11,
        userSelect: 'none',
        zIndex: 20,
      }}
    >
      {/* Left Items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <GitBranch size={12} />
          <span>main</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={12} />
          <span>{errorCount} errors</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Globe size={12} />
          <span>editor.asomiya.codes</span>
        </div>
      </div>

      {/* Right Items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div>
          {isRunning ? (
            <span style={{ color: '#fffb8f' }}>● Running...</span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <CheckCircle size={11} /> Ready
            </span>
          )}
        </div>

        <div>
          <span>Spaces: {settings.tabSize}</span>
        </div>

        <div>
          <span>UTF-8</span>
        </div>

        {/* Digits switcher */}
        <button
          onClick={toggleDigits}
          title="Click to toggle digits style between Assamese (০-৯) and ASCII (0-9)"
          style={{
            color: 'inherit',
            fontSize: 11,
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          {settings.digits === 'assamese' ? 'Digits: ০-৯' : 'Digits: 0-9'}
        </button>

        <div>
          <strong>
            {activeFileName.endsWith('.asom')
              ? 'অসমীয়া (Asomiya)'
              : activeFileName.endsWith('.py')
              ? 'Python'
              : 'Plain Text'}
          </strong>
        </div>
      </div>
    </div>
  );
};
