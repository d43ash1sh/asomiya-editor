import React, { useEffect, useRef, useState } from 'react';
import {
  Trash2,
  Copy,
  Check,
  Play,
  RotateCcw,
  CornerDownLeft,
} from 'lucide-react';
import type { DigitSetting, MessageLanguage } from 'asomiya';
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

interface TerminalLine {
  id: string;
  type: 'banner' | 'command' | 'stdout' | 'stderr' | 'echo' | 'system';
  prompt?: string;
  text: string;
}

interface AnsiSpan {
  text: string;
  color?: string;
  bold?: boolean;
}

/**
 * Parses ANSI color & style escape sequences into styled React spans.
 * Renders cleanly in HTML DOM with native DirectWrite/HarfBuzz font shaping.
 */
function parseAnsiToSpans(raw: string): AnsiSpan[] {
  const spans: AnsiSpan[] = [];
  const regex = /\x1b\[([0-9;]*)m/g;
  let lastIndex = 0;
  let currentColor: string | undefined = undefined;
  let isBold = false;

  const colorMap: Record<number, string> = {
    30: 'var(--vscode-text-muted)',
    31: 'var(--danger)',
    32: 'var(--tea)',
    33: 'var(--logo)',
    34: 'var(--accent)',
    35: '#c084fc',
    36: '#38bdf8',
    37: 'var(--vscode-text-bright)',
    90: 'var(--vscode-text-muted)',
    91: '#f87171',
    92: '#a3e635',
    93: '#f2c14e',
    94: '#60a5fa',
    95: '#e879f9',
    96: '#67e8f9',
    97: '#ffffff',
  };

  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      spans.push({
        text: raw.slice(lastIndex, match.index),
        color: currentColor,
        bold: isBold,
      });
    }

    const codeStr = match[1] || '0';
    const codes = codeStr.split(';').map(Number);
    for (const code of codes) {
      if (code === 0) {
        currentColor = undefined;
        isBold = false;
      } else if (code === 1) {
        isBold = true;
      } else if (colorMap[code]) {
        currentColor = colorMap[code];
      }
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < raw.length) {
    spans.push({
      text: raw.slice(lastIndex),
      color: currentColor,
      bold: isBold,
    });
  }

  return spans;
}

const STORAGE_KEY = 'asomiya_terminal_history_v2';

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-100)));
  } catch {}
}

const INITIAL_LINES: TerminalLine[] = [
  {
    id: 'banner-title',
    type: 'banner',
    text: '\x1b[1;33mঅসমীয়া (Asomiya) Web IDE — Interactive REPL Terminal\x1b[0m',
  },
  {
    id: 'banner-sub',
    type: 'system',
    text: '\x1b[90mv0.3.3 | লিখক \x1b[36mhelp\x1b[90m / \x1b[36mসহায়\x1b[90m সাহায্যৰ বাবে, \x1b[36mrun\x1b[90m / \x1b[36mচলাওক\x1b[90m ফাইল চলাবলৈ, \x1b[36mclear\x1b[90m পৰিষ্কাৰ কৰিবলৈ।\x1b[0m',
  },
];

export const OutputTerminal: React.FC<OutputTerminalProps> = ({
  lastResult,
  isRunning,
  onClear,
  onRun,
  stdinBuffer,
  setStdinBuffer,
  activeFileName,
  digits = 'assamese',
  lang = 'as',
}) => {
  const [lines, setLines] = useState<TerminalLine[]>(INITIAL_LINES);
  const [inputVal, setInputVal] = useState('');
  const [isContinuing, setIsContinuing] = useState(false);
  const [history, setHistory] = useState<string[]>(loadSavedHistory);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draftInput, setDraftInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentStdinInput, setCurrentStdinInput] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevResultRef = useRef<RunResult | null>(null);

  const replSessionRef = useRef<BrowserReplSession>(
    new BrowserReplSession({ lang, digits })
  );

  // Sync settings into REPL session
  useEffect(() => {
    replSessionRef.current.updateConfig({ lang, digits });
  }, [lang, digits]);

  // Auto-scroll to bottom on output changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, isContinuing]);

  // Stream program execution output when Run is pressed
  useEffect(() => {
    if (!lastResult || lastResult === prevResultRef.current) return;
    prevResultRef.current = lastResult;

    const newLines: TerminalLine[] = [
      {
        id: 'run-' + Date.now(),
        type: 'system',
        text: `\x1b[1;36m▶ asomiya run ${activeFileName}\x1b[0m`,
      },
    ];

    if (lastResult.output) {
      newLines.push({
        id: 'out-' + Date.now(),
        type: 'stdout',
        text: lastResult.output,
      });
    }

    if (lastResult.error) {
      newLines.push({
        id: 'err-' + Date.now(),
        type: 'stderr',
        text: lastResult.error,
      });
    }

    if (lastResult.success) {
      newLines.push({
        id: 'done-' + Date.now(),
        type: 'system',
        text: `\x1b[1;32m✓ Completed in ${lastResult.durationMs}ms\x1b[0m`,
      });
    } else {
      newLines.push({
        id: 'done-' + Date.now(),
        type: 'system',
        text: `\x1b[1;31m✗ Failed in ${lastResult.durationMs}ms\x1b[0m`,
      });
    }

    setLines((prev) => [...prev, ...newLines]);
  }, [lastResult, activeFileName]);

  // Handle keyboard navigation (Arrow Up/Down history, Ctrl+C, Ctrl+L, Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 1. Arrow Up: Previous command from history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === -1) {
        setDraftInput(inputVal);
        const target = history.length - 1;
        setHistoryIndex(target);
        setInputVal(history[target]);
      } else if (historyIndex > 0) {
        const target = historyIndex - 1;
        setHistoryIndex(target);
        setInputVal(history[target]);
      }
      return;
    }

    // 2. Arrow Down: Next command from history
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex < history.length - 1) {
        const target = historyIndex + 1;
        setHistoryIndex(target);
        setInputVal(history[target]);
      } else {
        setHistoryIndex(-1);
        setInputVal(draftInput);
      }
      return;
    }

    // 3. Ctrl+C: Cancel current line or multi-line continuation
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      if (replSessionRef.current.isContinuing) {
        replSessionRef.current.feed('.cancel');
        setIsContinuing(false);
      }
      setLines((prev) => [
        ...prev,
        {
          id: 'cancel-' + Date.now(),
          type: 'command',
          prompt: isContinuing ? '   ...>' : 'অসমীয়া>',
          text: inputVal ? `${inputVal} ^C` : '^C',
        },
      ]);
      setInputVal('');
      setHistoryIndex(-1);
      return;
    }

    // 4. Ctrl+L: Clear terminal screen
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      setLines([]);
      return;
    }

    // 5. Enter: Submit line to REPL
    if (e.key === 'Enter') {
      e.preventDefault();
      const line = inputVal;
      setInputVal('');
      setHistoryIndex(-1);

      const promptStr = isContinuing ? '   ...>' : 'অসমীয়া>';
      const commandLine: TerminalLine = {
        id: 'cmd-' + Date.now(),
        type: 'command',
        prompt: promptStr,
        text: line,
      };

      // Record in history if non-empty
      if (line.trim().length > 0) {
        const updated =
          history.length > 0 && history[history.length - 1] === line
            ? history
            : [...history, line];
        setHistory(updated);
        saveHistory(updated);
      }

      const res = replSessionRef.current.feed(line);

      if (res.kind === 'continue') {
        setIsContinuing(true);
        setLines((prev) => [...prev, commandLine]);
        return;
      }

      setIsContinuing(false);

      if (res.kind === 'clear') {
        setLines([]);
        return;
      }

      if (res.kind === 'reset') {
        setLines((prev) => [
          ...prev,
          commandLine,
          {
            id: 'reset-' + Date.now(),
            type: 'system',
            text: '\x1b[1;35m[REPL পৰিৱেশ পুনৰাৰম্ভ কৰা হ\'ল / Environment reset]\x1b[0m',
          },
        ]);
        return;
      }

      if (res.kind === 'run') {
        setLines((prev) => [
          ...prev,
          commandLine,
          {
            id: 'running-' + Date.now(),
            type: 'system',
            text: '\x1b[1;36m[Executing active file...]\x1b[0m',
          },
        ]);
        onRun();
        return;
      }

      if (res.kind === 'help') {
        setLines((prev) => [
          ...prev,
          commandLine,
          {
            id: 'help-' + Date.now(),
            type: 'system',
            text: res.text,
          },
        ]);
        return;
      }

      if (res.kind === 'done') {
        const resultLines: TerminalLine[] = [commandLine];
        if (res.output) {
          resultLines.push({
            id: 'out-' + Date.now(),
            type: 'stdout',
            text: res.output,
          });
        }
        if (res.error) {
          resultLines.push({
            id: 'err-' + Date.now(),
            type: 'stderr',
            text: res.error,
          });
        }
        if (res.echo !== null) {
          resultLines.push({
            id: 'echo-' + Date.now(),
            type: 'echo',
            text: res.echo,
          });
        }
        setLines((prev) => [...prev, ...resultLines]);
      }
    }
  };

  // Focus terminal input when clicking anywhere in the container
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Clear terminal
  const handleClear = () => {
    setLines([]);
    onClear();
  };

  // Reset REPL
  const handleResetRepl = () => {
    replSessionRef.current.reset();
    setIsContinuing(false);
    setLines((prev) => [
      ...prev,
      {
        id: 'reset-' + Date.now(),
        type: 'system',
        text: '\x1b[1;35m[REPL পৰিৱেশ পুনৰাৰম্ভ কৰা হ\'ল / Environment reset]\x1b[0m',
      },
    ]);
  };

  // Copy output
  const handleCopy = () => {
    const text = lines
      .map((l) => (l.prompt ? `${l.prompt} ${l.text}` : l.text))
      .join('\n');
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Stdin queue submission
  const handleAddStdin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStdinInput.trim()) {
      const updated = stdinBuffer
        ? `${stdinBuffer}\n${currentStdinInput}`
        : currentStdinInput;
      setStdinBuffer(updated);
      setLines((prev) => [
        ...prev,
        {
          id: 'stdin-' + Date.now(),
          type: 'system',
          text: `\x1b[90m[stdin queued: ${currentStdinInput}]\x1b[0m`,
        },
      ]);
      setCurrentStdinInput('');
    }
  };

  // Render individual line content with ANSI color spans
  const renderContent = (line: TerminalLine) => {
    if (line.type === 'echo') {
      return (
        <span style={{ color: 'var(--tea)', fontWeight: 600 }}>
          {line.text}
        </span>
      );
    }
    if (line.type === 'stderr') {
      return (
        <span style={{ color: 'var(--danger)', whiteSpace: 'pre-wrap' }}>
          {line.text}
        </span>
      );
    }
    if (line.type === 'stdout') {
      return (
        <span style={{ color: 'var(--vscode-text-bright)', whiteSpace: 'pre-wrap' }}>
          {line.text}
        </span>
      );
    }

    const spans = parseAnsiToSpans(line.text);
    return spans.map((s, idx) => (
      <span
        key={idx}
        style={{
          color: s.color || 'inherit',
          fontWeight: s.bold ? 700 : 'inherit',
          whiteSpace: 'pre-wrap',
        }}
      >
        {s.text}
      </span>
    ));
  };

  return (
    <div
      onClick={handleContainerClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--vscode-terminal-bg)',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        lineHeight: 1.65,
        padding: '6px 10px 6px 10px',
        overflow: 'hidden',
        cursor: 'text',
      }}
    >
      {/* Terminal Toolbar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 5,
          borderBottom: '1px solid var(--vscode-border)',
          marginBottom: 6,
          fontFamily: 'var(--font-ui)',
          flexShrink: 0,
          cursor: 'default',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 11,
            color: 'var(--vscode-text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: isRunning ? 'var(--gold)' : 'var(--tea)',
                boxShadow: isRunning
                  ? '0 0 6px var(--gold)'
                  : '0 0 5px var(--tea)',
              }}
            />
            <span
              style={{
                fontWeight: 600,
                color: 'var(--vscode-text-bright)',
              }}
            >
              {isRunning ? 'Running Script...' : 'REPL Active'}
            </span>
          </div>

          <span className="term-target">
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
              padding: '2px 8px',
              backgroundColor: 'var(--vscode-hover)',
              borderRadius: 3,
              cursor: isRunning ? 'not-allowed' : 'pointer',
            }}
          >
            <Play size={11} color="var(--tea)" />
            <span className="btn-label">Rerun</span>
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
              padding: '2px 8px',
              backgroundColor: 'var(--vscode-hover)',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={11} />
            <span className="btn-label">Reset REPL</span>
          </button>

          <button
            onClick={handleCopy}
            title="Copy Terminal Output"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--vscode-text)',
              fontSize: 11,
              padding: '2px 8px',
              backgroundColor: 'var(--vscode-hover)',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            {copied ? (
              <Check size={11} color="var(--tea)" />
            ) : (
              <Copy size={11} />
            )}
            <span className="btn-label">Copy</span>
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
              padding: '2px 8px',
              backgroundColor: 'var(--vscode-hover)',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={11} />
            <span className="btn-label">Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Log Area with Native Assamese Complex Text Shaping */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          paddingRight: 4,
        }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              wordBreak: 'break-word',
              letterSpacing: 'normal',
            }}
          >
            {line.prompt && (
              <span
                style={{
                  color:
                    line.prompt.trim() === '...>'
                      ? 'var(--accent)'
                      : 'var(--logo)',
                  fontWeight: 700,
                  marginRight: 8,
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                {line.prompt}
              </span>
            )}
            <div style={{ flex: 1 }}>{renderContent(line)}</div>
          </div>
        ))}

        {/* Live Interactive REPL Input Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 2,
            minHeight: 22,
          }}
        >
          <span
            style={{
              color: isContinuing ? 'var(--accent)' : 'var(--logo)',
              fontWeight: 700,
              marginRight: 8,
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            {isContinuing ? '   ...>' : 'অসমীয়া>'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--vscode-text-bright)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              lineHeight: 1.65,
              letterSpacing: 'normal',
              padding: 0,
              margin: 0,
              caretColor: 'var(--logo)',
            }}
          />
        </div>
      </div>

      {/* Bottom Stdin Queue Bar for সোধা() */}
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleAddStdin}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          paddingTop: 5,
          marginTop: 4,
          borderTop: '1px solid var(--vscode-border)',
          flexShrink: 0,
          cursor: 'default',
        }}
      >
        <span
          style={{
            color: 'var(--tea)',
            fontWeight: 700,
            fontSize: 11,
          }}
        >
          $ সোধা()<span className="hide-mobile"> stdin:</span>
        </span>
        <input
          type="text"
          placeholder="Queue input line for সোধা() / xodha() and press Enter..."
          value={currentStdinInput}
          onChange={(e) => setCurrentStdinInput(e.target.value)}
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
        <div
          style={{
            fontSize: 10,
            color: 'var(--vscode-text-muted)',
            marginTop: 2,
          }}
        >
          Queued lines for সোধা(): {stdinBuffer.split('\n').join(' | ')}
        </div>
      )}
    </div>
  );
};
