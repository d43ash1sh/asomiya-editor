import {
  AsomiyaError,
  Interpreter,
  formatDiagnostic,
  parse,
  reprValue,
  type DigitSetting,
  type MessageLanguage,
} from 'asomiya';

export interface ReplConfig {
  lang?: MessageLanguage;
  digits?: DigitSetting;
  maxSteps?: number;
  maxCallDepth?: number;
}

export type ReplEvalResult =
  | { readonly kind: 'continue' }
  | { readonly kind: 'clear' }
  | { readonly kind: 'reset' }
  | { readonly kind: 'help'; readonly text: string }
  | { readonly kind: 'run' }
  | {
      readonly kind: 'done';
      readonly output: string;
      readonly echo: string | null;
      readonly error: string | null;
    };

export class BrowserReplSession {
  private interpreter!: Interpreter;
  private config: ReplConfig;
  private pending = '';
  private currentOutput = '';

  constructor(config: ReplConfig = {}) {
    this.config = {
      lang: 'as',
      digits: 'assamese',
      maxSteps: 10_000_000,
      maxCallDepth: 500,
      ...config,
    };
    this.reset();
  }

  get isContinuing(): boolean {
    return this.pending !== '';
  }

  get pendingSource(): string {
    return this.pending;
  }

  updateConfig(config: Partial<ReplConfig>): void {
    this.config = { ...this.config, ...config };
  }

  reset(): void {
    this.pending = '';
    this.currentOutput = '';
    this.interpreter = new Interpreter({
      write: (text: string) => {
        this.currentOutput += text;
      },
      readLine: () => null,
      digits: this.config.digits,
      maxSteps: this.config.maxSteps,
      maxCallDepth: this.config.maxCallDepth,
      allowTopLevelRedeclaration: true,
    });
  }

  feed(line: string): ReplEvalResult {
    const trimmed = line.trim().normalize('NFC');

    // Cancellation commands
    if (trimmed === '.cancel' || trimmed === '.বাতিল' || trimmed === 'cancel') {
      this.pending = '';
      return { kind: 'done', output: '', echo: null, error: null };
    }

    if (!this.isContinuing) {
      if (
        trimmed === '.clear' ||
        trimmed === 'clear' ||
        trimmed === '.পৰিষ্কাৰ' ||
        trimmed === 'পৰিষ্কাৰ' ||
        trimmed === 'cls'
      ) {
        return { kind: 'clear' };
      }
      if (
        trimmed === '.reset' ||
        trimmed === 'reset' ||
        trimmed === '.পুনৰাৰম্ভ' ||
        trimmed === 'পুনৰাৰম্ভ'
      ) {
        this.reset();
        return { kind: 'reset' };
      }
      if (
        trimmed === '.run' ||
        trimmed === 'run' ||
        trimmed === 'চলাওক' ||
        trimmed === '.চলাওক'
      ) {
        return { kind: 'run' };
      }
      if (
        trimmed === '.help' ||
        trimmed === 'help' ||
        trimmed === '.সহায়' ||
        trimmed === 'সহায়'
      ) {
        return {
          kind: 'help',
          text: this.getHelpText(),
        };
      }
    }

    const source = this.pending + line + '\n';
    this.currentOutput = '';

    try {
      const program = parse(source);
      this.pending = '';
      const result = this.interpreter.run(program);
      const output = this.currentOutput;
      this.currentOutput = '';

      let echo: string | null = null;
      if (result !== undefined && result.kind !== 'null') {
        const style = this.config.digits === 'ascii' ? 'ascii' : 'assamese';
        echo = reprValue(result, style);
      }

      return { kind: 'done', output, echo, error: null };
    } catch (err: unknown) {
      if (err instanceof AsomiyaError) {
        if (err.diagnostic.incomplete) {
          this.pending = source;
          return { kind: 'continue' };
        }
        this.pending = '';
        const output = this.currentOutput;
        this.currentOutput = '';
        const formatted = formatDiagnostic(err.diagnostic, {
          lang: this.config.lang || 'as',
          source,
          fileName: '<repl>',
        });
        return { kind: 'done', output, echo: null, error: formatted };
      }

      this.pending = '';
      return {
        kind: 'done',
        output: this.currentOutput,
        echo: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private getHelpText(): string {
    const isAs = this.config.lang !== 'en';
    if (isAs) {
      return [
        'অসমীয়া (Asomiya) ইন্টাৰেক্টিভ REPL নির্দেশাৱলী:',
        '  - ধৰা নাম = "ৰূপ"              চলক ঘোষণা (Variable declaration)',
        '  - কোৱা("নমস্কাৰ")              আউটপুট প্ৰিন্ট কৰক (Print output)',
        '  - যদি সঁচা { ... } নহ\'লে { ... } চৰ্তমূলক বাক্য (Conditionals)',
        '  - গণনা i = ১ ৰ পৰা ৫ { ... }   লুপ (Range loop)',
        '  - ফাংচন যোগ(ক, খ) { ঘূৰোৱা ক+খ } ফলন/ফাংচন (Functions)',
        '  - run / চলাওক                  বৰ্তমান ফাইল চলাওক (Run active file)',
        '  - clear / পৰিষ্কাৰ             টাৰ্মিনেল পৰিষ্কাৰ কৰক (Clear screen)',
        '  - reset / পুনৰাৰম্ভ            REPL পৰিৱেশ নৱীকৰণ কৰক (Reset environment)',
        '  - help / সহায়                 এই সাহায্য বার্তা দেখুৱাওক',
      ].join('\r\n');
    }
    return [
      'Asomiya Interactive REPL Help:',
      '  - dhora name = "Rup"           Variable declaration',
      '  - kowa("Hello")                Print output',
      '  - jodi true { ... } nohole {}  Conditionals',
      '  - gonona i = 1 pora 5 { ... }  Range loop',
      '  - fangchon add(a, b) { ... }   Function definition',
      '  - run                          Execute current active file',
      '  - clear                        Clear terminal screen',
      '  - reset                        Reset REPL session environment',
      '  - help                         Show this help message',
    ].join('\r\n');
  }
}
