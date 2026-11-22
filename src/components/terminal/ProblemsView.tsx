import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { editor } from 'monaco-editor';

interface ProblemsViewProps {
  diagnostics: editor.IMarkerData[];
  activeFileName: string;
}

export const ProblemsView: React.FC<ProblemsViewProps> = ({ diagnostics, activeFileName }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--vscode-terminal-bg)',
        fontFamily: 'var(--font-ui)',
        fontSize: 12,
        padding: '6px 12px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          paddingBottom: 6,
          borderBottom: '1px solid var(--vscode-border)',
          marginBottom: 6,
          fontSize: 11,
          color: 'var(--vscode-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>Active File Diagnostics: <strong>{activeFileName}</strong></span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {diagnostics.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--tea)',
              paddingTop: 12,
            }}
          >
            <CheckCircle size={16} />
            <span>No problems have been detected in the workspace.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {diagnostics.map((marker, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '6px 8px',
                  backgroundColor: 'var(--vscode-hover)',
                  borderRadius: 3,
                  fontSize: 12,
                }}
              >
                <AlertCircle size={15} color="var(--danger)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--vscode-text-bright)', whiteSpace: 'pre-wrap' }}>
                    {marker.message}
                  </div>
                  <div style={{ color: 'var(--vscode-text-muted)', fontSize: 11, marginTop: 2 }}>
                    {activeFileName} [{marker.startLineNumber}, {marker.startColumn}]
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
