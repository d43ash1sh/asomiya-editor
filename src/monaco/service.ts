/**
 * Ported directly from the official Asomiya VS Code extension (editors/vscode/src/service.ts).
 * The editor features: checking a program for errors, describing a word, listing completions, and translating to Python.
 */
import { AsomiyaError, renderMessage, parse, toPython } from 'asomiya';
import type { MessageLanguage, DigitSetting } from 'asomiya';
import { WORDS, lookup, type Word } from './vocabulary';

export const MAX_LIVE_LENGTH = 1_000_000;

export interface Problem {
  readonly code: string;
  readonly message: string;
  readonly startLine: number;
  readonly startColumn: number;
  readonly endLine: number;
  readonly endColumn: number;
}

/** Syntax errors in a program (Asomiya reports the first one), or none. */
export function check(source: string, lang: MessageLanguage): Problem[] {
  if (source.length > MAX_LIVE_LENGTH) return [];
  try {
    parse(source);
    return [];
  } catch (error) {
    if (!(error instanceof AsomiyaError)) throw error;
    const d = error.diagnostic;
    const startLine = Math.max(1, d.span.start.line);
    const startCol = Math.max(1, d.span.start.column);
    const endLine = Math.max(startLine, d.span.end.line);
    const endCol = Math.max(startCol + 1, d.span.end.column);

    return [
      {
        code: d.code,
        message: `[${d.code}] ${renderMessage(d.code, d.params as never, lang)}`,
        startLine,
        startColumn: startCol,
        endLine,
        endColumn: endCol,
      },
    ];
  }
}

/** Hover text (Markdown) for a keyword or built-in, or null for any other word. */
export function describe(text: string): string | null {
  const w = lookup(text);
  if (w === undefined) return null;
  const spelled = [w.word, ...w.roman.slice(0, 1)].map((s) => `\`${s}\``).join(' · ');
  const title = w.kind === 'builtin' ? `${spelled} — built-in function` : `${spelled} — keyword`;
  const sig = w.signature ? `\n\n\`\`\`asomiya\n${w.word}${w.signature}\n\`\`\`` : '';
  const others = w.roman.slice(1);
  return [
    `**${title}**${sig}`,
    `${w.en}\n\n${w.as}`,
    `Python: \`${w.python}\``,
    others.length > 0 ? `Also written: ${others.map((s) => `\`${s}\``).join(', ')}` : '',
    `[Official Documentation](https://asomiya.codes/reference/${w.kind === 'builtin' ? 'builtins' : 'keywords'}/)`,
  ]
    .filter((part) => part !== '')
    .join('\n\n');
}

export interface Completion {
  readonly label: string;
  readonly detail: string;
  readonly kind: 'keyword' | 'function' | 'constant';
  readonly word: Word;
}

const kindOf = (w: Word): Completion['kind'] =>
  w.kind === 'builtin' || w.id === 'print'
    ? 'function'
    : ['true', 'false', 'null'].includes(w.id)
      ? 'constant'
      : 'keyword';

/**
 * Every keyword and built-in, in the script the program already uses (English letters if it uses
 * any Roman keyword, else Assamese), plus the other script's preferred spelling.
 */
export function completions(source: string): Completion[] {
  let roman: boolean;
  try {
    roman = parse(source).roman;
  } catch {
    roman = /\b(dhora|kowa|jodi|fangchon|jetialoike)\b/.test(source);
  }
  const out: Completion[] = [];
  for (const w of WORDS) {
    const primary = roman ? (w.roman[0] ?? w.word) : w.word;
    const secondary = roman ? w.word : w.roman[0];
    const detail = `${w.en} (Python: ${w.python})`;
    out.push({ label: primary, detail, kind: kindOf(w), word: w });
    if (secondary !== undefined) out.push({ label: secondary, detail, kind: kindOf(w), word: w });
  }
  return out;
}

export interface PythonView {
  readonly python: string | null;
  readonly error: string | null;
}

/** The program in Python, or the reason it can't be translated. */
export function python(source: string, lang: MessageLanguage, digits: DigitSetting): PythonView {
  if (source.length > MAX_LIVE_LENGTH) {
    return { python: null, error: 'This file is too big to translate as you type.' };
  }
  try {
    return { python: toPython(parse(source), { digits }), error: null };
  } catch (error) {
    if (!(error instanceof AsomiyaError)) throw error;
    const d = error.diagnostic;
    const where = `line ${d.span.start.line}, column ${d.span.start.column}`;
    return {
      python: null,
      error: `[${d.code}] ${renderMessage(d.code, d.params as never, lang)} (${where})`,
    };
  }
}
