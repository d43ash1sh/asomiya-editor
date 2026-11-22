import React, { useState } from 'react';
import { Copy, Check, Code2, Download } from 'lucide-react';
import { transpileToPython } from '../../runner/execution';
import { downloadBlob } from '../../vfs/zip';
import type { DigitSetting } from 'asomiya';

interface PythonPreviewProps {
  sourceCode: string;
  digits: DigitSetting;
}

export const PythonPreview: React.FC<PythonPreviewProps> = ({ sourceCode, digits }) => {
  const [copied, setCopied] = useState(false);
  const { python, error } = transpileToPython(sourceCode, digits);

  const handleCopy = () => {
    if (python) {
      navigator.clipboard.writeText(python);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleSavePython = () => {
    if (python) {
      const blob = new Blob([python], { type: 'text/x-python;charset=utf-8' });
      downloadBlob(blob, 'program.py');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--vscode-terminal-bg)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        padding: '6px 12px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 6,
          borderBottom: '1px solid var(--vscode-border)',
          marginBottom: 6,
          fontFamily: 'var(--font-ui)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--vscode-text-muted)' }}>
          <Code2 size={13} color="#ffd43b" />
          <span>Equivalent Python 3 Translation (via asomiya python transpiler)</span>
        </div>

        {python && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleSavePython}
              title="Save Python Version As... (asomiya.savePython)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--vscode-text)',
                fontSize: 11,
                padding: '2px 6px',
                backgroundColor: 'var(--vscode-hover)',
                borderRadius: 2,
              }}
            >
              <Download size={11} />
              <span>Save .py</span>
            </button>
            <button
              onClick={handleCopy}
              title="Copy Python Code"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--vscode-text)',
                fontSize: 11,
                padding: '2px 6px',
                backgroundColor: 'var(--vscode-hover)',
                borderRadius: 2,
              }}
            >
              {copied ? <Check size={11} color="#89d185" /> : <Copy size={11} />}
              <span>Copy Python</span>
            </button>
          </div>
        )}
      </div>

      {/* Code Display */}
      <div style={{ flex: 1, overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.65, fontFamily: 'var(--font-mono)' }}>
        {python ? (
          <code style={{ color: '#9CDCFE' }}>{python}</code>
        ) : (
          <div style={{ color: 'var(--vscode-warning-yellow)' }}>
            {error || 'Unable to transpile active code to Python.'}
          </div>
        )}
      </div>
    </div>
  );
};
