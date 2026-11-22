import {
  AsomiyaError,
  Interpreter,
  formatDiagnostic,
  parse,
  toPython,
  type DigitSetting,
  type MessageLanguage,
} from 'asomiya';

export interface RunOptions {
  lang?: MessageLanguage;
  digits?: DigitSetting;
  stdin?: string;
  maxSteps?: number;
  maxCallDepth?: number;
}

export interface RunResult {
  output: string;
  error: string | null;
  errorLine?: number;
  errorColumn?: number;
  durationMs: number;
  success: boolean;
}

export interface PythonResult {
  python: string | null;
  error: string | null;
}

export function executeAsomiya(source: string, options: RunOptions = {}): RunResult {
  const started = performance.now();
  const lines = (options.stdin || '').replace(/\r\n?/g, '\n').split('\n');
  if (lines.length === 1 && lines[0] === '') lines.pop();

  let output = '';

  const interpreter = new Interpreter({
    write: (text: string) => {
      output += text;
    },
    readLine: () => lines.shift() ?? null,
    digits: options.digits || 'assamese',
    maxSteps: options.maxSteps || 10_000_000,
    maxCallDepth: options.maxCallDepth || 500,
  });

  try {
    const ast = parse(source);
    interpreter.run(ast);
    const durationMs = Math.round(performance.now() - started);
    return {
      output,
      error: null,
      durationMs,
      success: true,
    };
  } catch (err: unknown) {
    const durationMs = Math.round(performance.now() - started);
    if (err instanceof AsomiyaError) {
      const formatted = formatDiagnostic(err.diagnostic, {
        lang: options.lang || 'as',
        source,
        fileName: 'active.asom',
      });
      return {
        output,
        error: formatted,
        errorLine: err.diagnostic.span.start.line,
        errorColumn: err.diagnostic.span.start.column,
        durationMs,
        success: false,
      };
    }

    return {
      output,
      error: err instanceof Error ? err.message : String(err),
      durationMs,
      success: false,
    };
  }
}

export function transpileToPython(source: string, digits: DigitSetting = 'ascii'): PythonResult {
  try {
    const ast = parse(source);
    const python = toPython(ast, { digits });
    return { python, error: null };
  } catch (err: unknown) {
    if (err instanceof AsomiyaError) {
      const msg = formatDiagnostic(err.diagnostic, {
        lang: 'en',
        source,
        fileName: 'active.asom',
      });
      return { python: null, error: msg };
    }
    return { python: null, error: String(err) };
  }
}
