import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import {
  Trash2,
  Copy,
  Check,
  Play,
  RotateCcw,
  CornerDownLeft,
} from 'lucide-react';
import { graphemes, type DigitSetting, type MessageLanguage } from 'asomiya';
import type { RunResult } from '../../runner/execution';
import { BrowserReplSession } from '../../runner/repl';

interface OutputTerminalProps {
  lastResult: RunResult | null;
  isRunning: boolean;
  onClear: () => void;
  onRun: () => void;
  stdinBuffer: string;
  setStdinBuffer: (val: string) => void;
  activeFileName: string;
  theme?: 'dark' | 'light';
  fontSize?: number;
  digits?: DigitSetting;
  lang?: MessageLanguage;
}

const STORAGE_KEY = 'asomiya_repl_history_v1';

function loadSavedHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [
    'ধৰা নাম = "ৰূপ"',
    'কোৱা("নমস্কাৰ, " + নাম + "!")',
    'গণনা i = ১ ৰ পৰা ৫ { কোৱা("গণনা: " + i) }',
  ];
}

function saveHistory(history: string[]): void {
  try {
    const trimmed = history.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

const DARK_XTERM_THEME = {
  background: '#1c1917',
  foreground: '#f5f5f4',
  cursor: '#f2c14e',
  cursorAccent: '#1c1917',
  selectionBackground: '#44403c',
  black: '#1c1917',
  red: '#ef4444',
  green: '#a3e635',
  yellow: '#f2c14e',
  blue: '#3b82f6',
  magenta: '#a855f7',
  cyan: '#38bdf8',
  white: '#f5f5f4',
  brightBlack: '#78716c',
  brightRed: '#f87171',
  brightGreen: '#bef264',
  brightYellow: '#fbbf24',
  brightBlue: '#60a5fa',
  brightMagenta: '#c084fc',
  brightCyan: '#67e8f9',
  brightWhite: '#ffffff',
};

const LIGHT_XTERM_THEME = {
  background: '#ffffff',
  foreground: '#1c1917',
  cursor: '#c2410c',
  cursorAccent: '#ffffff',
  selectionBackground: '#fed7aa',
  black: '#1c1917',
  red: '#dc2626',
  green: '#16a34a',
  yellow: '#c2410c',
  blue: '#3f40fa',
  magenta: '#7c3aed',
  cyan: '#0284c7',
  white: '#f5f5f4',
  brightBlack: '#78716c',
  brightRed: '#ef4444',
  brightGreen: '#22c55e',
  brightYellow: '#ea580c',
  brightBlue: '#6366f1',
  brightMagenta: '#9333ea',
  brightCyan: '#0ea5e9',
  brightWhite: '#0c0a09',
};

export const OutputTerminal: React.FC<OutputTerminalProps> = ({
  lastResult,
  isRunning,
  onClear,
  onRun,
  stdinBuffer,
  setStdinBuffer,
  activeFileName,
  theme = 'dark',
  fontSize = 13,
  digits = 'assamese',
  lang = 'as',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const [copied, setCopied] = useState(false);
  const [currentInput, setCurrentInput] = useState('');

  // REPL interactive state in refs to avoid stale closures in xterm listeners
  const lineBufferRef = useRef<string>('');
  const cursorPosRef = useRef<number>(0);
  const historyRef = useRef<string[]>(loadSavedHistory());
  const historyIndexRef = useRef<number>(-1);
  const draftInputRef = useRef<string>('');
  const replSessionRef = useRef<BrowserReplSession>(
    new BrowserReplSession({ lang, digits })
  );
  const prevResultRef = useRef<RunResult | null>(null);

  // Redraws the prompt line with Unicode grapheme support
  const redrawLine = useCallback((term: Terminal) => {
    const prompt = replSessionRef.current.isContinuing
      ? '\x1b[1;36m   ...>\x1b[0m '
      : '\x1b[1;33mঅসমীয়া>\x1b[0m ';
    const text = lineBufferRef.current;
    const g = graphemes(text);
    const cursor = Math.max(0, Math.min(cursorPosRef.current, g.length));
    const beforeCursor = g.slice(0, cursor).join('');

    // ANSI: \r (carriage return), \x1b[K (clear line to right)
    term.write('\r\x1b[K' + prompt + text + '\r' + prompt + beforeCursor);
  }, []);

  // Sync settings into REPL session
  useEffect(() => {
    replSessionRef.current.updateConfig({ lang, digits });
  }, [lang, digits]);

  // Handle xterm theme & font updates dynamically
  useEffect(() => {
    if (!termRef.current) return;
    termRef.current.options.theme = theme === 'dark' ? DARK_XTERM_THEME : LIGHT_XTERM_THEME;
    termRef.current.options.fontSize = fontSize;
    try {
      fitAddonRef.current?.fit();
    } catch {}
  }, [theme, fontSize]);

  // Initialize xterm instance
  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      convertEol: true,
      fontFamily: "'Kohinoor Bangla', 'Noto Sans Bengali', 'Consolas', 'Courier New', monospace",
      fontSize,
      lineHeight: 1.65,
      theme: theme === 'dark' ? DARK_XTERM_THEME : LIGHT_XTERM_THEME,
      allowProposedApi: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Small delay to allow container layout calculation before fitting
    const fitTimer = setTimeout(() => {
      try {
        fitAddon.fit();
      } catch {}
    }, 50);

    // Initial banner
    term.writeln('\x1b[1;33mঅসমীয়া (Asomiya) Web IDE — Interactive ANSI Terminal\x1b[0m');
    term.writeln(
      '\x1b[90mREPL v0.3.3 | লিখক \x1b[36mhelp\x1b[90m / \x1b[36mসহায়\x1b[90m সাহায্যৰ বাবে, \x1b[36mrun\x1b[90m / \x1b[36mচলাওক\x1b[90m ফাইল চলাবলৈ, \x1b[36mclear\x1b[90m পৰিষ্কাৰ কৰিবলৈ।\x1b[0m\r\n'
    );
    term.write('\x1b[1;33mঅসমীয়া>\x1b[0m ');

    // Keystroke handler with full ANSI, arrow history, and editing
    const dataDisposable = term.onData((data: string) => {
      // 1. Enter key
      if (data === '\r' || data === '\n') {
        term.write('\r\n');
        const line = lineBufferRef.current;
        lineBufferRef.current = '';
        cursorPosRef.current = 0;
        historyIndexRef.current = -1;

        if (line.trim().length > 0) {
          const lastItem = historyRef.current[historyRef.current.length - 1];
          if (lastItem !== line) {
            historyRef.current.push(line);
            saveHistory(historyRef.current);
          }
        }

        const res = replSessionRef.current.feed(line);

        if (res.kind === 'continue') {
          term.write('\x1b[1;36m   ...>\x1b[0m ');
        } else if (res.kind === 'clear') {
          term.clear();
          term.write('\x1b[1;33mঅসমীয়া>\x1b[0m ');
        } else if (res.kind === 'reset') {
          term.writeln('\x1b[1;35m[REPL পৰিৱেশ পুনৰাৰম্ভ কৰা হ\'ল / Environment reset]\x1b[0m');
          term.write('\x1b[1;33mঅসমীয়া>\x1b[0m ');
        } else if (res.kind === 'run') {
          term.writeln('\x1b[1;36m[Executing active file...]\x1b[0m');
          onRun();
        } else if (res.kind === 'help') {
          term.writeln(res.text.replace(/\r?\n/g, '\r\n'));
          term.write('\x1b[1;33mঅসমীয়া>\x1b[0m ');
        } else if (res.kind === 'done') {
          if (res.output) {
            term.write(res.output.replace(/\r?\n/g, '\r\n'));
            if (!res.output.endsWith('\n')) term.write('\r\n');
          }
          if (res.error) {
            term.writeln('\x1b[1;31m' + res.error.replace(/\r?\n/g, '\r\n') + '\x1b[0m');
          }
          if (res.echo !== null) {
            term.writeln('\x1b[1;32m' + res.echo + '\x1b[0m');
          }
          term.write('\x1b[1;33mঅসমীয়া>\x1b[0m ');
        }
        return;
      }

      // 2. Backspace key
      if (data === '\x7f' || data === '\b') {
        const g = graphemes(lineBufferRef.current);
        if (cursorPosRef.current > 0) {
          g.splice(cursorPosRef.current - 1, 1);
          lineBufferRef.current = g.join('');
          cursorPosRef.current--;
          redrawLine(term);
        }
        return;
      }

      // 3. Arrow Up: Previous command from history
      if (data === '\x1b[A') {
        if (historyRef.current.length === 0) return;
        if (historyIndexRef.current === -1) {
          draftInputRef.current = lineBufferRef.current;
          historyIndexRef.current = historyRef.current.length - 1;
        } else if (historyIndexRef.current > 0) {
          historyIndexRef.current--;
        }
        const item = historyRef.current[historyIndexRef.current];
        lineBufferRef.current = item;
        cursorPosRef.current = graphemes(item).length;
        redrawLine(term);
        return;
      }

      // 4. Arrow Down: Next command from history
      if (data === '\x1b[B') {
        if (historyIndexRef.current === -1) return;
        if (historyIndexRef.current < historyRef.current.length - 1) {
          historyIndexRef.current++;
          const item = historyRef.current[historyIndexRef.current];
          lineBufferRef.current = item;
          cursorPosRef.current = graphemes(item).length;
          redrawLine(term);
        } else {
          historyIndexRef.current = -1;
          lineBufferRef.current = draftInputRef.current;
          cursorPosRef.current = graphemes(draftInputRef.current).length;
          redrawLine(term);
        }
        return;
      }

      // 5. Arrow Left: Move cursor left
      if (data === '\x1b[D') {
        if (cursorPosRef.current > 0) {
          cursorPosRef.current--;
          redrawLine(term);
        }
        return;
      }

      // 6. Arrow Right: Move cursor right
      if (data === '\x1b[C') {
        const g = graphemes(lineBufferRef.current);
        if (cursorPosRef.current < g.length) {
          cursorPosRef.current++;
          redrawLine(term);
        }
        return;
      }

      // 7. Home key (\x1b[H, \x1b[1~, \x01 for Ctrl+A)
      if (data === '\x1b[H' || data === '\x1b[1~' || data === '\x01') {
        cursorPosRef.current = 0;
        redrawLine(term);
        return;
      }

      // 8. End key (\x1b[F, \x1b[4~, \x05 for Ctrl+E)
      if (data === '\x1b[F' || data === '\x1b[4~' || data === '\x05') {
        const g = graphemes(lineBufferRef.current);
        cursorPosRef.current = g.length;
        redrawLine(term);
        return;
      }

      // 9. Delete key (\x1b[3~)
      if (data === '\x1b[3~') {
        const g = graphemes(lineBufferRef.current);
        if (cursorPosRef.current < g.length) {
          g.splice(cursorPosRef.current, 1);
          lineBufferRef.current = g.join('');
          redrawLine(term);
        }
        return;
      }

      // 10. Ctrl+C: Cancel line or abort
      if (data === '\x03') {
        term.write('^C\r\n');
        lineBufferRef.current = '';
        cursorPosRef.current = 0;
        historyIndexRef.current = -1;
        if (replSessionRef.current.isContinuing) {
          replSessionRef.current.feed('.cancel');
        }
        term.write('\x1b[1;33mঅসমীয়া>\x1b[0m ');
        return;
      }

      // 11. Ctrl+L: Clear screen
      if (data === '\x0c') {
        term.clear();
        redrawLine(term);
        return;
      }

      // 12. Ignore any other raw escape sequences
      if (data.startsWith('\x1b')) {
        return;
      }

      // 13. Ignore unhandled control characters (< 32, except tab)
      if (data.charCodeAt(0) < 32 && data !== '\t') {
        return;
      }

      // 14. Tab key: insert 2 spaces
      const incomingText = data === '\t' ? '  ' : data;

      // 15. Printable character / Unicode text insertion
      const g = graphemes(lineBufferRef.current);
      const incomingG = graphemes(incomingText);
      const currentCursor = Math.max(0, Math.min(cursorPosRef.current, g.length));

      g.splice(currentCursor, 0, ...incomingG);
      lineBufferRef.current = g.join('');
      cursorPosRef.current = currentCursor + incomingG.length;
      redrawLine(term);
    });

    // Resize observer to keep xterm dimensions fitted to DOM container
    const resizeObserver = new ResizeObserver(() => {
      try {
        if (containerRef.current && containerRef.current.clientWidth > 0) {
          fitAddon.fit();
        }
      } catch {}
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      clearTimeout(fitTimer);
      resizeObserver.disconnect();
      dataDisposable.dispose();
      term.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, [redrawLine, onRun, fontSize, theme]);

  // Handle program run output streaming
  useEffect(() => {
    if (!lastResult || lastResult === prevResultRef.current) return;
    prevResultRef.current = lastResult;

    const term = termRef.current;
    if (!term) return;

    term.write(`\r\n\x1b[1;36m▶ asomiya run ${activeFileName}\x1b[0m\r\n`);

    if (lastResult.output) {
      const formatted = lastResult.output.replace(/\r?\n/g, '\r\n');
      term.write(formatted);
      if (!lastResult.output.endsWith('\n')) {
        term.write('\r\n');
      }
    }

    if (lastResult.error) {
      const formattedErr = lastResult.error.replace(/\r?\n/g, '\r\n');
      term.writeln(`\x1b[1;31m${formattedErr}\x1b[0m`);
    }

    if (lastResult.success) {
      term.writeln(`\x1b[1;32m✓ Completed in ${lastResult.durationMs}ms\x1b[0m\r\n`);
    } else {
      term.writeln(`\x1b[1;31m✗ Failed in ${lastResult.durationMs}ms\x1b[0m\r\n`);
    }

    // Restore prompt
    lineBufferRef.current = '';
    cursorPosRef.current = 0;
    term.write('\x1b[1;33mঅসমীয়া>\x1b[0m ');
  }, [lastResult, activeFileName]);

  // Clear console action
  const handleClear = () => {
    if (termRef.current) {
      termRef.current.clear();
      lineBufferRef.current = '';
      cursorPosRef.current = 0;
      termRef.current.write('\x1b[1;33mঅসমীয়া>\x1b[0m ');
    }
    onClear();
  };

  // Reset REPL environment action
  const handleResetRepl = () => {
    replSessionRef.current.reset();
    if (termRef.current) {
      termRef.current.writeln('\r\n\x1b[1;35m[REPL পৰিৱেশ পুনৰাৰম্ভ কৰা হ\'ল / Environment reset]\x1b[0m');
      lineBufferRef.current = '';
      cursorPosRef.current = 0;
      termRef.current.write('\x1b[1;33mঅসমীয়া>\x1b[0m ');
    }
  };

  // Copy terminal contents
  const handleCopy = () => {
    if (termRef.current) {
      const selection = termRef.current.getSelection();
      const textToCopy = selection || lastResult?.output || '';
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  // Queue stdin input for সোধা()
  const handleAddStdin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim()) {
      const updated = stdinBuffer ? `${stdinBuffer}\n${currentInput}` : currentInput;
      setStdinBuffer(updated);
      if (termRef.current) {
        termRef.current.writeln(`\x1b[90m[stdin queued: ${currentInput}]\x1b[0m`);
        redrawLine(termRef.current);
      }
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
        padding: '4px 8px 6px 8px',
        overflow: 'hidden',
      }}
    >
      {/* Terminal Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 4,
          borderBottom: '1px solid var(--vscode-border)',
          marginBottom: 4,
          fontFamily: 'var(--font-ui)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--vscode-text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: isRunning ? 'var(--gold)' : 'var(--tea)',
                boxShadow: isRunning ? '0 0 6px var(--gold)' : '0 0 5px var(--tea)',
              }}
            />
            <span style={{ fontWeight: 600, color: 'var(--vscode-text-bright)' }}>
              {isRunning ? 'Running Script...' : 'REPL Active'}
            </span>
          </div>

          <span>
            Target: <strong>asomiya run {activeFileName}</strong>
          </span>

          {lastResult && (
            <span
              style={{
                color: lastResult.success ? 'var(--tea)' : 'var(--danger)',
                fontWeight: 600,
              }}
            >
              {lastResult.success
                ? `✓ ${lastResult.durationMs}ms`
                : `✗ Exit ${lastResult.durationMs}ms`}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={onRun}
            disabled={isRunning}
            title="Execute Active Asomiya Script (Ctrl+Enter)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--vscode-text)',
              fontSize: 11,
              padding: '2px 7px',
              backgroundColor: 'var(--vscode-hover)',
              borderRadius: 3,
              cursor: isRunning ? 'not-allowed' : 'pointer',
            }}
          >
            <Play size={11} color="var(--tea)" />
            <span>Rerun</span>
          </button>

          <button
            onClick={handleResetRepl}
            title="Reset REPL Environment"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--vscode-text)',
              fontSize: 11,
              padding: '2px 7px',
              backgroundColor: 'var(--vscode-hover)',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={11} />
            <span>Reset REPL</span>
          </button>

          <button
            onClick={handleCopy}
            title="Copy Selection or Output"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--vscode-text)',
              fontSize: 11,
              padding: '2px 7px',
              backgroundColor: 'var(--vscode-hover)',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={11} color="var(--tea)" /> : <Copy size={11} />}
            <span>Copy</span>
          </button>

          <button
            onClick={handleClear}
            title="Clear Terminal (Ctrl+L)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--vscode-text)',
              fontSize: 11,
              padding: '2px 7px',
              backgroundColor: 'var(--vscode-hover)',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={11} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Interactive xterm.js Canvas Container */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          backgroundColor: 'transparent',
        }}
      />

      {/* Input bar for stdin (সোধা/xodha queued input) */}
      <form
        onSubmit={handleAddStdin}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          paddingTop: 5,
          marginTop: 2,
          borderTop: '1px solid var(--vscode-border)',
          flexShrink: 0,
        }}
      >
        <span style={{ color: 'var(--tea)', fontWeight: 700, fontSize: 11 }}>
          $ সোধা() stdin:
        </span>
        <input
          type="text"
          placeholder="Queue input line for সোধা() / xodha() and press Enter..."
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          style={{
            flex: 1,
            padding: '3px 8px',
            fontSize: 11,
            backgroundColor: 'var(--vscode-input-bg)',
            border: '1px solid var(--vscode-input-border)',
            borderRadius: 2,
            color: 'var(--vscode-text)',
          }}
        />
        <button
          type="submit"
          title="Send Stdin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            backgroundColor: 'var(--vscode-button-bg)',
            color: '#ffffff',
            borderRadius: 2,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <CornerDownLeft size={11} />
          <span>Queue</span>
        </button>
      </form>
      {stdinBuffer && (
        <div style={{ fontSize: 10, color: 'var(--vscode-text-muted)', marginTop: 2 }}>
          Queued lines for সোধা(): {stdinBuffer.split('\n').join(' | ')}
        </div>
      )}
    </div>
  );
};
