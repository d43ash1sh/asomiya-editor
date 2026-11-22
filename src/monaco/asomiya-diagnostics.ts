import type { editor } from 'monaco-editor';
import { parse, AsomiyaError, renderMessage } from 'asomiya';

export function validateAsomiyaCode(
  code: string,
  lang: 'as' | 'en' = 'as'
): editor.IMarkerData[] {
  if (!code.trim()) return [];

  try {
    parse(code);
    return [];
  } catch (err: unknown) {
    if (err instanceof AsomiyaError) {
      const diag = err.diagnostic;
      // renderMessage(code, params, lang)
      const asMsg = renderMessage(diag.code, diag.params, 'as');
      const enMsg = renderMessage(diag.code, diag.params, 'en');
      const message = lang === 'as' ? `${asMsg}\n(${enMsg})` : `${enMsg}\n(${asMsg})`;

      const startLine = Math.max(1, diag.span.start.line);
      const startCol = Math.max(1, diag.span.start.column);
      const endLine = Math.max(startLine, diag.span.end.line);
      const endCol = Math.max(startCol + 1, diag.span.end.column);

      return [
        {
          severity: 8, // MarkerSeverity.Error
          message: `[${diag.code}] ${message}`,
          startLineNumber: startLine,
          startColumn: startCol,
          endLineNumber: endLine,
          endColumn: endCol,
          source: 'asomiya',
        },
      ];
    }
    return [];
  }
}
