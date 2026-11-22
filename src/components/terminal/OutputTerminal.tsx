import React, { useState } from 'react';
import { Trash2, Copy, Check, Play, CornerDownLeft } from 'lucide-react';
import type { RunResult } from '../../runner/execution';

interface OutputTerminalProps {
  lastResult: RunResult | null;
  isRunning: boolean;
  onClear: () => void;
  onRun: () => void;
  stdinBuffer: string;
  setStdinBuffer: (val: string) => void;
  activeFileName: string;
}

export const OutputTerminal: React.FC<OutputTerminalProps> = ({
  lastResult,
  isRunning,
  onClear,
  onRun,
  stdinBuffer,
  setStdinBuffer,
  activeFileName,
}) => {
  const [copied, setCopied] = useState(false);
  const [currentInput, setCurrentInput] = useState('');

  const handleCopy = () => {
    if (lastResult?.output) {
      navigator.clipboard.writeText(lastResult.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleAddStdin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim()) {
      const updated = stdinBuffer ? `${stdinBuffer}\n${currentInput}` : currentInput;
      setStdinBuffer(updated);
      setCurrentInput('');
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
      {/* Terminal Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--vscode-text-muted)' }}>
          <span>Session: <strong>asomiya run {activeFileName}</strong></span>
          {lastResult && (
            <span
              style={{
                color: lastResult.success ? 'var(--tea)' : 'var(--danger)',
                fontWeight: 600,
              }}
            >
              {lastResult.success ? `✓ Completed in ${lastResult.durationMs}ms` : `✗ Failed in ${lastResult.durationMs}ms`}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onRun}
            disabled={isRunning}
            title="Rerun"
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
            <Play size={11} />
            <span>Rerun</span>
          </button>
          <button
            onClick={handleCopy}
            title="Copy Output"
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
            <span>Copy</span>
          </button>
          <button
            onClick={onClear}
            title="Clear Console"
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
            <Trash2 size={11} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        className="term-line"
        style={{
          flex: 1,
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.7,
          fontFamily: 'var(--font-mono)',
          paddingTop: 4,
        }}
      >
        {!lastResult && !isRunning && (
          <div style={{ color: 'var(--vscode-text-muted)', paddingTop: 10 }}>
            Press <strong>▶ Run</strong> or <strong>Ctrl+Enter</strong> to execute the active Asomiya file.
            <br />
            Output and interactive terminal sessions will appear here.
          </div>
        )}

        {isRunning && (
          <div style={{ color: 'var(--accent)' }}>
            [Executing Asomiya interpreter...]
          </div>
        )}

        {lastResult?.output && (
          <div style={{ color: 'var(--vscode-text)' }}>
            {lastResult.output}
          </div>
        )}

        {lastResult?.error && (
          <div style={{ color: 'var(--vscode-error-red)', marginTop: 8 }}>
            {lastResult.error}
          </div>
        )}
      </div>

      {/* Input bar for stdin (সোধা/xodha input) */}
      <form
        onSubmit={handleAddStdin}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          paddingTop: 6,
          borderTop: '1px solid var(--vscode-border)',
        }}
      >
        <span style={{ color: 'var(--tea)', fontWeight: 700 }}>$ stdin:</span>
        <input
          type="text"
          placeholder="Queue input for সোধা() / xodha() and press Enter..."
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          style={{
            flex: 1,
            padding: '4px 8px',
            fontSize: 12,
            backgroundColor: 'var(--vscode-input-bg)',
            border: '1px solid var(--vscode-input-border)',
            borderRadius: 2,
          }}
        />
        <button
          type="submit"
          title="Send Stdin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            backgroundColor: 'var(--vscode-button-bg)',
            color: '#ffffff',
            borderRadius: 2,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <CornerDownLeft size={12} />
          <span>Queue</span>
        </button>
      </form>
      {stdinBuffer && (
        <div style={{ fontSize: 10, color: 'var(--vscode-text-muted)', marginTop: 2 }}>
          Queued lines for input: {stdinBuffer.split('\n').join(' | ')}
        </div>
      )}
    </div>
  );
};
